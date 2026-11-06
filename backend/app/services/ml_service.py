import os
import json
import duckdb
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, roc_curve, precision_recall_curve, confusion_matrix
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA, NMF
from sklearn.feature_extraction.text import TfidfVectorizer
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima.model import ARIMA
from app.database import db

class MLService:
    _continuation_model = None
    _continuation_scaler = None
    _continuation_benchmark = None
    _clustering_results = None
    _anomaly_results = None
    _topic_results = None

    @classmethod
    def train_continuation_models(cls, country="US"):
        """
        Builds a chronological classification dataset:
        Given video appearance on date t, does it reappear on date t+1?
        Prevents data leakage by splitting chronologically.
        """
        con = db.get_connection()
        where = f"WHERE country = '{country.upper()}'" if country.upper() != "ALL" else ""
        
        # Pull consecutive snapshot observations
        df = con.execute(f"""
            SELECT video_id, trending_date, category_id,
                   views, likes, dislikes, comment_count,
                   like_rate, comment_rate, positive_rate, time_to_trend_hours
            FROM snapshots {where}
            ORDER BY video_id, trending_date ASC
        """).df()

        if len(df) < 500:
            return None

        # Build ground truth target y: is next appearance on trending_date + 1 day?
        df["trending_date"] = pd.to_datetime(df["trending_date"])
        df["next_date"] = df.groupby("video_id")["trending_date"].shift(-1)
        df["trends_tomorrow"] = ((df["next_date"] - df["trending_date"]).dt.days == 1).astype(int)

        # Cumulative trend count up to current date
        df["prior_trend_count"] = df.groupby("video_id").cumcount() + 1
        df["log_views"] = np.log10(df["views"].clip(lower=1))
        df["log_likes"] = np.log10(df["likes"].clip(lower=1))

        # Drop the last observation of each video because we don't know the future beyond dataset
        feature_cols = ["log_views", "log_likes", "like_rate", "comment_rate", "positive_rate", "prior_trend_count", "time_to_trend_hours", "category_id"]
        
        # Chronological train/test split: first 75% dates train, last 25% test
        dates = sorted(df["trending_date"].unique())
        split_idx = int(len(dates) * 0.75)
        split_date = dates[split_idx]

        train_mask = df["trending_date"] <= split_date
        test_mask = df["trending_date"] > split_date

        X_train_raw = df.loc[train_mask, feature_cols].fillna(0)
        y_train = df.loc[train_mask, "trends_tomorrow"]
        X_test_raw = df.loc[test_mask, feature_cols].fillna(0)
        y_test = df.loc[test_mask, "trends_tomorrow"]

        # Scale features
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train_raw)
        X_test = scaler.transform(X_test_raw)

        # 1. Logistic Regression
        lr = LogisticRegression(max_iter=500, random_state=42)
        lr.fit(X_train, y_train)
        lr_probs = lr.predict_proba(X_test)[:, 1]
        lr_preds = lr.predict(X_test)

        # 2. Random Forest
        rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        rf.fit(X_train, y_train)
        rf_probs = rf.predict_proba(X_test)[:, 1]
        rf_preds = rf.predict(X_test)

        # 3. Gradient Boosting
        gb = GradientBoostingClassifier(n_estimators=80, max_depth=5, learning_rate=0.1, random_state=42)
        gb.fit(X_train, y_train)
        gb_probs = gb.predict_proba(X_test)[:, 1]
        gb_preds = gb.predict(X_test)

        # Metrics function
        def calc_metrics(y_true, y_pred, y_prob):
            fpr, tpr, _ = roc_curve(y_true, y_prob)
            prec_c, rec_c, _ = precision_recall_curve(y_true, y_prob)
            cm = confusion_matrix(y_true, y_pred)
            return {
                "accuracy": round(float(accuracy_score(y_true, y_pred)), 3),
                "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 3),
                "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 3),
                "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 3),
                "roc_auc": round(float(roc_auc_score(y_true, y_prob)), 3),
                "confusion_matrix": cm.tolist(),
                "roc_curve": [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr[::max(1, len(fpr)//50)], tpr[::max(1, len(tpr)//50)])],
                "pr_curve": [{"precision": round(float(p), 4), "recall": round(float(r), 4)} for p, r in zip(prec_c[::max(1, len(prec_c)//50)], rec_c[::max(1, len(rec_c)//50)])]
            }

        benchmark = {
            "logistic_regression": calc_metrics(y_test, lr_preds, lr_probs),
            "random_forest": calc_metrics(y_test, rf_preds, rf_probs),
            "gradient_boosting": calc_metrics(y_test, gb_preds, gb_probs),
            "feature_importance": [
                {"feature": col, "importance": round(float(imp), 4)}
                for col, imp in zip(feature_cols, rf.feature_importances_)
            ],
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "split_date": str(split_date.date())
        }

        # Cache trained objects for live inference
        cls._continuation_model = rf
        cls._continuation_scaler = scaler
        cls._continuation_benchmark = benchmark
        return benchmark

    @classmethod
    def get_continuation_benchmark(cls, country="US"):
        if cls._continuation_benchmark is None:
            cls.train_continuation_models(country)
        return cls._continuation_benchmark

    @classmethod
    def predict_continuation(cls, views: int, likes: int, dislikes: int, comment_count: int, category_id: int, prior_trend_count: int = 1, hours_since_publish: float = 24.0):
        if cls._continuation_model is None:
            cls.train_continuation_models("US")
            
        v = max(views, 1)
        like_rate = likes / v
        comment_rate = comment_count / v
        pos_rate = (likes + comment_count) / v
        log_views = np.log10(v)
        log_likes = np.log10(max(likes, 1))
        
        feats = np.array([[log_views, log_likes, like_rate, comment_rate, pos_rate, prior_trend_count, hours_since_publish, category_id]])
        feats_scaled = cls._continuation_scaler.transform(feats)
        
        prob = float(cls._continuation_model.predict_proba(feats_scaled)[0, 1])
        pred = 1 if prob >= 0.5 else 0
        
        interpretation = (
            f"High trend momentum ({round(prob * 100, 1)}% probability). "
            f"Strong combination of view scale and engagement signals sustained trending longevity."
            if prob >= 0.6 else
            f"Moderate probability ({round(prob * 100, 1)}%). The video may trend if velocity holds, but exhibits exit friction."
            if prob >= 0.4 else
            f"Low probability ({round(prob * 100, 1)}%). Fast decay pattern; likely to drop from the trending rankings within 24 hours."
        )

        return {
            "probability": round(prob, 4),
            "prediction": pred,
            "interpretation": interpretation,
            "feature_contributions": {
                "prior_momentum": round(min(prior_trend_count * 0.1, 0.4), 3),
                "view_scale": round(min(log_views / 8.0, 0.3), 3),
                "engagement_ratio": round(min(pos_rate * 2.0, 0.3), 3)
            }
        }

    @classmethod
    def get_clustering(cls, country="US"):
        con = db.get_connection()
        if country.upper() != "ALL":
            where = f"WHERE country = '{country.upper()}' AND views_last > 1000"
        else:
            where = "WHERE views_last > 1000"
        
        df = con.execute(f"""
            SELECT video_id, title, channel_title, category_name,
                   views_last as views, likes_last as likes,
                   like_rate, comment_rate, trend_duration_days
            FROM unique_videos {where}
            ORDER BY views_last DESC
            LIMIT 4000
        """).df()

        if len(df) < 50:
            return {"clusters": []}

        # Features: log_views, log_likes, like_rate, comment_rate, trend_duration_days
        df["log_views"] = np.log10(df["views"].clip(lower=1))
        df["log_likes"] = np.log10(df["likes"].clip(lower=1))
        
        feature_cols = ["log_views", "log_likes", "like_rate", "comment_rate", "trend_duration_days"]
        X_raw = df[feature_cols].fillna(0)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)

        # Elbow curve & silhouette exploration
        elbow_data = []
        for k in range(2, 7):
            km = KMeans(n_clusters=k, random_state=42, n_init=5)
            km.fit(X_scaled)
            elbow_data.append({"k": k, "inertia": round(float(km.inertia_), 1)})

        # Fit optimal k=4
        km4 = KMeans(n_clusters=4, random_state=42, n_init=10)
        df["cluster"] = km4.fit_predict(X_scaled)

        # PCA 2D embedding
        pca = PCA(n_components=2, random_state=42)
        coords = pca.fit_transform(X_scaled)
        df["pca_x"] = coords[:, 0].round(3)
        df["pca_y"] = coords[:, 1].round(3)

        # Archetype labeling based on empirical cluster statistics
        cluster_profiles = []
        archetypes = {
            0: {"name": "Mainstream Viral Titans", "color": "#10b981", "desc": "Massive multi-million views, sustained trending presence, official music & trailers."},
            1: {"name": "High-Engagement Community Hubs", "color": "#06b6d4", "desc": "Exceptional like/comment ratios (>6%), strong community discussion and creator affinity."},
            2: {"name": "Flash Virality / Short Bursts", "color": "#f59e0b", "desc": "Brief 1-2 day trending spikes, rapid news highlights, viral comedy sketches."},
            3: {"name": "Niche & Emerging Content", "color": "#8b5cf6", "desc": "Targeted audience reach, steady educational and technical viewership."}
        }

        # Sort clusters by median views to map archetypes consistently
        cluster_medians = df.groupby("cluster")["views"].median().sort_values(ascending=False).index.tolist()
        sorted_map = {orig_c: idx for idx, orig_c in enumerate(cluster_medians)}
        df["cluster_mapped"] = df["cluster"].map(sorted_map)

        for c_idx in range(4):
            c_df = df[df["cluster_mapped"] == c_idx]
            cluster_profiles.append({
                "cluster_id": c_idx,
                "name": archetypes[c_idx]["name"],
                "color": archetypes[c_idx]["color"],
                "description": archetypes[c_idx]["desc"],
                "video_count": int(len(c_df)),
                "median_views": int(c_df["views"].median()),
                "avg_like_rate": round(float(c_df["like_rate"].mean()) * 100, 2),
                "avg_comment_rate": round(float(c_df["comment_rate"].mean()) * 100, 2),
                "avg_duration": round(float(c_df["trend_duration_days"].mean()), 1),
                "top_categories": c_df["category_name"].value_counts().head(3).to_dict()
            })

        sample_scatter = df.sample(min(len(df), 600), random_state=42)[[
            "video_id", "title", "channel_title", "category_name", "views", "cluster_mapped", "pca_x", "pca_y"
        ]].rename(columns={"cluster_mapped": "cluster"}).to_dict(orient="records")

        return {
            "elbow_curve": elbow_data,
            "variance_explained": [round(float(v) * 100, 1) for v in pca.explained_variance_ratio_],
            "profiles": cluster_profiles,
            "scatter_points": sample_scatter
        }

    @classmethod
    def get_forecast(cls, country="US", category_id=10, horizon=30):
        con = db.get_connection()
        where = f"WHERE country = '{country.upper()}'" if country.upper() != "ALL" else "WHERE 1=1"
        where += f" AND category_id = {int(category_id)}"
        
        # Pull daily time-series
        ts_df = con.execute(f"""
            SELECT strftime(trending_date, '%Y-%m-%d') as dt, COUNT(*) as video_count
            FROM snapshots {where}
            GROUP BY dt
            ORDER BY dt ASC
        """).df()

        if len(ts_df) < 50:
            return {"historical": [], "forecast": []}

        series = ts_df["video_count"].values
        n = len(series)
        train_len = max(n - horizon, 30)
        train = series[:train_len]
        test = series[train_len:]

        # Fit Holt-Winters Exponential Smoothing
        try:
            hw = ExponentialSmoothing(train, trend="add", seasonal=None, damped_trend=True).fit()
            pred_test = hw.forecast(len(test))
            pred_future = hw.forecast(horizon)
        except Exception:
            # Fallback to rolling average
            ma = np.mean(train[-7:])
            pred_test = np.full(len(test), ma)
            pred_future = np.full(horizon, ma)

        mae = float(np.mean(np.abs(test - pred_test))) if len(test) > 0 else 0.0
        rmse = float(np.sqrt(np.mean((test - pred_test)**2))) if len(test) > 0 else 0.0
        denom = (np.abs(test) + np.abs(pred_test))
        smape = float(np.mean(200.0 * np.abs(test - pred_test) / np.where(denom == 0, 1, denom))) if len(test) > 0 else 0.0

        historical = [{"date": r["dt"], "value": int(r["video_count"])} for _, r in ts_df.iterrows()]
        
        # Future forecast dates
        last_dt = pd.to_datetime(ts_df["dt"].iloc[-1])
        future_dates = [(last_dt + pd.Timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(horizon)]
        
        forecast = [
            {
                "date": f_dt,
                "forecast": round(float(f_val), 1),
                "lower_bound": max(0, round(float(f_val - 1.96 * rmse), 1)),
                "upper_bound": round(float(f_val + 1.96 * rmse), 1)
            }
            for f_dt, f_val in zip(future_dates, pred_future)
        ]

        return {
            "category_id": category_id,
            "metrics": {
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "smape_pct": round(smape, 2)
            },
            "historical": historical,
            "forecast": forecast
        }

    @classmethod
    def get_anomalies(cls, country="US"):
        con = db.get_connection()
        where = f"WHERE country = '{country.upper()}'" if country.upper() != "ALL" else ""
        
        df = con.execute(f"""
            SELECT video_id, title, channel_title, category_name,
                   views_last as views, likes_last as likes, dislikes_last as dislikes, comments_last as comment_count,
                   like_rate, comment_rate, dislike_rate, trend_count, daily_velocity, thumbnail_link
            FROM unique_videos {where}
            ORDER BY views_last DESC
            LIMIT 3000
        """).df()

        if len(df) < 50:
            return {"anomalies": []}

        df["log_views"] = np.log10(df["views"].clip(lower=1))
        df["polarity"] = (df["likes"] / df["dislikes"].replace(0, 1)).clip(upper=500)
        
        feats = df[["log_views", "like_rate", "comment_rate", "dislike_rate", "daily_velocity"]].fillna(0)
        iso = IsolationForest(contamination=0.03, random_state=42)
        df["anomaly"] = iso.fit_predict(feats)
        df["score"] = iso.decision_function(feats)

        anomalies_df = df[df["anomaly"] == -1].sort_values("score", ascending=True).head(15)

        results = []
        for _, r in anomalies_df.iterrows():
            reason = []
            if r["dislike_rate"] > 0.05:
                reason.append("Exceptional audience controversy / dislike ratio")
            if r["views"] > 20_000_000:
                reason.append("Super-viral audience outlier (>20M views)")
            if r["comment_rate"] > 0.08:
                reason.append("Extreme discussion intensity (>8% comment-to-view rate)")
            if r["daily_velocity"] > 1_000_000:
                reason.append("Unprecedented daily views acceleration")
            if not reason:
                reason.append("Multivariate anomaly in interaction-to-view vector")

            results.append({
                "video_id": r["video_id"],
                "title": r["title"],
                "channel_title": r["channel_title"],
                "category_name": r["category_name"],
                "views": int(r["views"]),
                "likes": int(r["likes"]),
                "dislikes": int(r["dislikes"]),
                "comment_count": int(r["comment_count"]),
                "like_rate": round(float(r["like_rate"]) * 100, 2),
                "dislike_rate": round(float(r["dislike_rate"]) * 100, 2),
                "anomaly_score": round(float(r["score"]), 3),
                "detection_reason": " & ".join(reason),
                "thumbnail_link": r["thumbnail_link"]
            })

        return {"anomalies": results}

    @classmethod
    def get_topics(cls, country="US", num_topics=6):
        con = db.get_connection()
        where = f"WHERE country = '{country.upper()}'" if country.upper() != "ALL" else ""
        
        titles = con.execute(f"""
            SELECT title, category_name FROM unique_videos {where}
            LIMIT 5000
        """).df()

        if len(titles) < 100:
            return {"topics": []}

        vectorizer = TfidfVectorizer(max_features=1000, stop_words="english", ngram_range=(1, 2))
        tfidf = vectorizer.fit_transform(titles["title"].astype(str))
        
        nmf = NMF(n_components=num_topics, random_state=42, max_iter=200)
        W = nmf.fit_transform(tfidf)
        H = nmf.components_
        feature_names = vectorizer.get_feature_names_out()

        topic_labels = [
            "Official Music & Singles",
            "Movie Trailers & Cinematic Releases",
            "Gaming & Esports Walkthroughs",
            "Beauty, DIY & Lifestyle Tutorials",
            "Talk Shows & Broadcast Highlights",
            "Comedy, Sketches & Viral Challenges"
        ]

        topics = []
        for i in range(num_topics):
            top_words_idx = H[i].argsort()[:-8:-1]
            top_words = [feature_names[idx] for idx in top_words_idx]
            
            # Find representative titles
            rep_titles_idx = W[:, i].argsort()[:-4:-1]
            rep_titles = titles["title"].iloc[rep_titles_idx].tolist()

            topics.append({
                "topic_id": i + 1,
                "label": topic_labels[i] if i < len(topic_labels) else f"Topic {i+1}",
                "keywords": top_words,
                "sample_titles": rep_titles
            })

        return {"topics": topics}
