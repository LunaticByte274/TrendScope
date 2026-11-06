import json
import os
import duckdb
import numpy as np
import pandas as pd
from app.database import db
from app.config import CATEGORIES_JSON, CLEANING_AUDIT_JSON, COUNTRY_NAMES

class AnalyticsService:

    @staticmethod
    def _build_where(country: str = None, category_id: int = None, start_date: str = None, end_date: str = None, search: str = None, table_alias: str = ""):
        prefix = f"{table_alias}." if table_alias else ""
        clauses = []
        if country and country.upper() != "ALL":
            clauses.append(f"{prefix}country = '{country.upper()}'")
        if category_id:
            clauses.append(f"{prefix}category_id = {int(category_id)}")
        if start_date:
            clauses.append(f"{prefix}trending_date >= '{start_date}'")
        if end_date:
            clauses.append(f"{prefix}trending_date <= '{end_date}'")
        if search:
            escaped = search.replace("'", "''").lower()
            clauses.append(f"(LOWER({prefix}title) LIKE '%{escaped}%' OR LOWER({prefix}channel_title) LIKE '%{escaped}%' OR LOWER({prefix}video_id) LIKE '%{escaped}%')")
        return f"WHERE {' AND '.join(clauses)}" if clauses else ""

    @staticmethod
    def get_metadata():
        con = db.get_connection()
        with open(CATEGORIES_JSON, "r", encoding="utf-8") as f:
            cat_map = json.load(f)
            
        categories = [{"id": int(k), "name": v} for k, v in sorted(cat_map.items(), key=lambda x: int(x[0]))]
        
        countries = [{"code": k, "name": COUNTRY_NAMES.get(k, k)} for k in COUNTRY_NAMES]
        
        date_stats = con.execute("SELECT MIN(trending_date), MAX(trending_date), COUNT(*) FROM snapshots").fetchone()
        
        return {
            "countries": countries,
            "categories": categories,
            "min_date": str(date_stats[0])[:10] if date_stats and date_stats[0] else "2026-04-06",
            "max_date": str(date_stats[1])[:10] if date_stats and date_stats[1] else "2026-11-04",
            "total_records": int(date_stats[2]) if date_stats else 0
        }

    @staticmethod
    def get_overview(country="US", category_id=None, start_date=None, end_date=None, search=None):
        con = db.get_connection()
        where_snap = AnalyticsService._build_where(country, category_id, start_date, end_date, search)
        where_uniq = AnalyticsService._build_where(country, category_id, None, None, search)
        
        # 1. KPIs
        snap_kpi = con.execute(f"""
            SELECT COUNT(*), COUNT(DISTINCT country), COUNT(DISTINCT category_id),
                   ROUND(AVG(views), 0), ROUND(MEDIAN(views), 0),
                   SUM(views), ROUND(AVG(like_rate)*100, 2), ROUND(AVG(comment_rate)*100, 2),
                   MIN(trending_date), MAX(trending_date)
            FROM snapshots {where_snap}
        """).fetchone()

        uniq_kpi = con.execute(f"""
            SELECT COUNT(DISTINCT video_id), SUM(views_last)
            FROM unique_videos {where_uniq}
        """).fetchone()

        top_cat = con.execute(f"""
            SELECT category_name, SUM(views_last) as total_v
            FROM unique_videos {where_uniq}
            GROUP BY category_name
            ORDER BY total_v DESC LIMIT 1
        """).fetchone()

        kpis = {
            "total_records": int(snap_kpi[0] or 0),
            "unique_videos": int(uniq_kpi[0] or 0),
            "total_countries": int(snap_kpi[1] or 0),
            "total_categories": int(snap_kpi[2] or 0),
            "avg_views": float(snap_kpi[3] or 0),
            "median_views": float(snap_kpi[4] or 0),
            "total_unique_views": int(uniq_kpi[1] or 0),
            "total_legacy_views": int(snap_kpi[5] or 0),
            "avg_like_rate": float(snap_kpi[6] or 0),
            "avg_comment_rate": float(snap_kpi[7] or 0),
            "top_category": top_cat[0] if top_cat else "Music",
            "date_coverage": f"{str(snap_kpi[8])[:10]} to {str(snap_kpi[9])[:10]}" if snap_kpi[8] else "2026-04-06 to 2026-11-04"
        }

        # 2. Daily activity time-series
        daily_res = con.execute(f"""
            SELECT strftime(trending_date, '%Y-%m-%d') as dt, COUNT(*) as snapshot_count,
                   COUNT(DISTINCT video_id) as unique_videos,
                   ROUND(AVG(views), 0) as avg_views
            FROM snapshots {where_snap}
            GROUP BY dt
            ORDER BY dt ASC
        """).df().to_dict(orient="records")

        # 3. Top 10 trending videos
        top_videos = con.execute(f"""
            SELECT video_id, country, title, channel_title, category_id, category_name,
                   views_last as views, likes_last as likes, dislikes_last as dislikes,
                   comments_last as comment_count, trend_count, trend_duration_days,
                   strftime(min_date, '%Y-%m-%d') as first_date,
                   strftime(max_date, '%Y-%m-%d') as last_date,
                   ROUND(like_rate * 100, 2) as like_rate,
                   ROUND(comment_rate * 100, 2) as comment_rate,
                   ROUND(positive_rate * 100, 2) as positive_rate,
                   ROUND(afinn_score, 2) as afinn_score,
                   sentiment_category, thumbnail_link
            FROM unique_videos {where_uniq}
            ORDER BY trend_count DESC, views_last DESC
            LIMIT 10
        """).df().to_dict(orient="records")

        # 4. Category popularity (Unique Views vs Legacy Views)
        cat_pop = con.execute(f"""
            SELECT u.category_id, u.category_name,
                   COUNT(DISTINCT u.video_id) as video_count,
                   SUM(u.views_last) as unique_views,
                   COALESCE(s.legacy_views, 0) as legacy_views,
                   ROUND(COALESCE(s.legacy_views, 0) * 1.0 / NULLIF(SUM(u.views_last), 0), 2) as inflation_ratio,
                   ROUND(AVG(u.like_rate) * 100, 2) as avg_like_pct
            FROM unique_videos u
            LEFT JOIN (
                SELECT category_id, SUM(views) as legacy_views
                FROM snapshots {where_snap}
                GROUP BY category_id
            ) s ON u.category_id = s.category_id
            {where_uniq.replace('WHERE', 'WHERE u.') if where_uniq else ''}
            GROUP BY u.category_id, u.category_name, s.legacy_views
            ORDER BY unique_views DESC
            LIMIT 12
        """).df().to_dict(orient="records")

        # 5. Views Distribution (Log bins)
        views_dist = con.execute(f"""
            SELECT CASE 
                WHEN views_last < 50000 THEN '< 50K'
                WHEN views_last < 200000 THEN '50K - 200K'
                WHEN views_last < 500000 THEN '200K - 500K'
                WHEN views_last < 1000000 THEN '500K - 1M'
                WHEN views_last < 5000000 THEN '1M - 5M'
                WHEN views_last < 20000000 THEN '5M - 20M'
                ELSE '20M+'
            END as bin,
            COUNT(*) as count
            FROM unique_videos {where_uniq}
            GROUP BY bin
            ORDER BY MIN(views_last) ASC
        """).df().to_dict(orient="records")

        # 6. Engagement rate distribution
        eng_dist = con.execute(f"""
            SELECT CASE 
                WHEN like_rate < 0.01 THEN '< 1%'
                WHEN like_rate < 0.02 THEN '1% - 2%'
                WHEN like_rate < 0.04 THEN '2% - 4%'
                WHEN like_rate < 0.06 THEN '4% - 6%'
                WHEN like_rate < 0.10 THEN '6% - 10%'
                ELSE '10%+'
            END as bin,
            COUNT(*) as count
            FROM unique_videos {where_uniq}
            GROUP BY bin
            ORDER BY MIN(like_rate) ASC
        """).df().to_dict(orient="records")

        # 7. Sentiment overview
        sent_rows = con.execute(f"""
            SELECT sentiment_category, COUNT(*) as count, ROUND(AVG(afinn_score), 2) as avg_score
            FROM unique_videos {where_uniq}
            GROUP BY sentiment_category
        """).df().to_dict(orient="records")
        sent_dict = {r["sentiment_category"]: r["count"] for r in sent_rows}

        # 8. Country comparison quick summary
        country_quick = con.execute("""
            SELECT country, COUNT(DISTINCT video_id) as unique_videos,
                   ROUND(MEDIAN(views_last), 0) as median_views,
                   ROUND(AVG(like_rate) * 100, 2) as avg_like_pct,
                   ROUND(AVG(trend_count), 2) as avg_trend_days
            FROM unique_videos
            GROUP BY country
            ORDER BY unique_videos DESC
        """).df().to_dict(orient="records")

        # 9. Dynamic insights
        insights = []
        if cat_pop:
            top_c = cat_pop[0]
            insights.append({
                "type": "category_dominance",
                "title": f"{top_c['category_name']} Leads in Audience Reach",
                "description": f"{top_c['category_name']} generated {int(top_c['unique_views']):,} unique views across {top_c['video_count']} videos. In the legacy R method, daily view summation inflated this metric to {int(top_c['legacy_views']):,} views ({top_c['inflation_ratio']}x inflation)."
            })
        if top_videos:
            top_v = top_videos[0]
            insights.append({
                "type": "trending_longevity",
                "title": f"Top Trending Champion: '{top_v['title'][:45]}...'",
                "description": f"Maintained trending status for {top_v['trend_count']} distinct days ({top_v['trend_duration_days']} calendar day span), accumulating {int(top_v['views']):,} views with a {top_v['like_rate']}% like rate."
            })
        if country_quick:
            max_med_c = max(country_quick, key=lambda x: x["median_views"])
            insights.append({
                "type": "audience_reach",
                "title": f"{COUNTRY_NAMES.get(max_med_c['country'], max_med_c['country'])} Has Highest Median Video Reach",
                "description": f"Median trending video in {max_med_c['country']} achieves {int(max_med_c['median_views']):,} views, with average trending longevity of {max_med_c['avg_trend_days']} days."
            })

        return {
            "kpis": kpis,
            "daily_activity": daily_res,
            "top_trending_videos": top_videos,
            "category_popularity": cat_pop,
            "views_distribution": views_dist,
            "engagement_distribution": eng_dist,
            "sentiment_summary": sent_dict,
            "country_comparison_quick": country_quick,
            "insights": insights
        }

    @staticmethod
    def get_trending_videos(country="US", category_id=None, start_date=None, end_date=None, search=None, sort_by="trend_count", limit=20, offset=0):
        con = db.get_connection()
        where_clause = AnalyticsService._build_where(country, category_id, None, None, search)
        
        sort_map = {
            "trend_count": "trend_count DESC, views_last DESC",
            "views": "views_last DESC",
            "likes": "likes_last DESC",
            "like_rate": "like_rate DESC",
            "comments": "comments_last DESC",
            "positive_rate": "positive_rate DESC",
            "velocity": "daily_velocity DESC"
        }
        order_by = sort_map.get(sort_by, "trend_count DESC")
        
        query = f"""
            SELECT video_id, country, title, channel_title, category_id, category_name,
                   views_last as views, likes_last as likes, dislikes_last as dislikes,
                   comments_last as comment_count, trend_count, trend_duration_days,
                   views_growth, daily_velocity,
                   strftime(min_date, '%Y-%m-%d') as first_date,
                   strftime(max_date, '%Y-%m-%d') as last_date,
                   ROUND(like_rate * 100, 2) as like_rate,
                   ROUND(comment_rate * 100, 2) as comment_rate,
                   ROUND(positive_rate * 100, 2) as positive_rate,
                   ROUND(afinn_score, 2) as afinn_score,
                   sentiment_category, thumbnail_link
            FROM unique_videos {where_clause}
            ORDER BY {order_by}
            LIMIT {int(limit)} OFFSET {int(offset)}
        """
        videos = con.execute(query).df().to_dict(orient="records")
        total = con.execute(f"SELECT COUNT(*) FROM unique_videos {where_clause}").fetchone()[0]
        
        return {"total": total, "videos": videos}

    @staticmethod
    def get_video_detail(video_id: str, country: str = "US"):
        con = db.get_connection()
        video_row = con.execute(f"""
            SELECT video_id, country, title, channel_title, category_id, category_name,
                   views_last as views, likes_last as likes, dislikes_last as dislikes,
                   comments_last as comment_count, trend_count, trend_duration_days,
                   views_growth, daily_velocity,
                   strftime(min_date, '%Y-%m-%d') as first_date,
                   strftime(max_date, '%Y-%m-%d') as last_date,
                   ROUND(like_rate * 100, 2) as like_rate,
                   ROUND(comment_rate * 100, 2) as comment_rate,
                   ROUND(positive_rate * 100, 2) as positive_rate,
                   ROUND(afinn_score, 2) as afinn_score,
                   sentiment_category, thumbnail_link
            FROM unique_videos
            WHERE video_id = '{video_id}' AND country = '{country.upper()}'
            LIMIT 1
        """).df()

        if video_row.empty:
            # Fallback across countries
            video_row = con.execute(f"SELECT * FROM unique_videos WHERE video_id = '{video_id}' LIMIT 1").df()
            if video_row.empty:
                return None

        v = video_row.to_dict(orient="records")[0]
        cid = v["category_id"]

        # Trajectory snapshots
        history = con.execute(f"""
            SELECT strftime(trending_date, '%Y-%m-%d') as trending_date,
                   views, likes, dislikes, comment_count,
                   ROUND(like_rate * 100, 2) as like_rate,
                   ROUND(comment_rate * 100, 2) as comment_rate
            FROM snapshots
            WHERE video_id = '{video_id}' AND country = '{v["country"]}'
            ORDER BY trending_date ASC
        """).df().to_dict(orient="records")

        # Benchmarks against category
        benchmarks = con.execute(f"""
            SELECT ROUND(AVG(views_last), 0) as cat_avg_views,
                   ROUND(MEDIAN(views_last), 0) as cat_median_views,
                   ROUND(AVG(like_rate) * 100, 2) as cat_avg_like_rate,
                   ROUND(AVG(comment_rate) * 100, 2) as cat_avg_comment_rate,
                   ROUND(AVG(trend_count), 1) as cat_avg_trend_days
            FROM unique_videos
            WHERE country = '{v["country"]}' AND category_id = {cid}
        """).df().to_dict(orient="records")[0]

        return {
            "video": v,
            "history": history,
            "category_benchmarks": benchmarks
        }

    @staticmethod
    def get_categories(country="US", start_date=None, end_date=None):
        con = db.get_connection()
        where_snap = AnalyticsService._build_where(country, None, start_date, end_date)
        where_uniq = AnalyticsService._build_where(country, None, None, None)
        
        query = f"""
            SELECT u.category_id, u.category_name,
                   COUNT(DISTINCT u.video_id) as unique_video_count,
                   SUM(u.views_last) as unique_views,
                   COALESCE(s.legacy_views, 0) as legacy_views,
                   ROUND(COALESCE(s.legacy_views, 0) * 1.0 / NULLIF(SUM(u.views_last), 0), 2) as inflation_ratio,
                   ROUND(AVG(u.views_last), 0) as avg_views,
                   ROUND(MEDIAN(u.views_last), 0) as median_views,
                   ROUND(AVG(u.likes_last), 0) as avg_likes,
                   ROUND(AVG(u.like_rate) * 100, 2) as avg_like_rate,
                   ROUND(AVG(u.comment_rate) * 100, 2) as avg_comment_rate,
                   ROUND(AVG(u.positive_rate) * 100, 2) as avg_positive_rate,
                   ROUND(AVG(u.afinn_score), 2) as avg_afinn,
                   ROUND(AVG(u.trend_count), 2) as avg_trend_days
            FROM unique_videos u
            LEFT JOIN (
                SELECT category_id, SUM(views) as legacy_views
                FROM snapshots {where_snap}
                GROUP BY category_id
            ) s ON u.category_id = s.category_id
            {where_uniq.replace('WHERE', 'WHERE u.') if where_uniq else ''}
            GROUP BY u.category_id, u.category_name, s.legacy_views
            ORDER BY unique_views DESC
        """
        categories = con.execute(query).df().to_dict(orient="records")
        return {"categories": categories}

    @staticmethod
    def get_engagement_lab(country="US", category_id=None):
        con = db.get_connection()
        where_clause = AnalyticsService._build_where(country, category_id)
        
        # Sample points for scatter plots (log views vs likes, views vs comments)
        scatter_sample = con.execute(f"""
            SELECT video_id, title, channel_title, category_name,
                   views_last as views, likes_last as likes, dislikes_last as dislikes, comments_last as comment_count,
                   ROUND(like_rate * 100, 3) as like_rate,
                   ROUND(comment_rate * 100, 3) as comment_rate,
                   ROUND(dislike_rate * 100, 3) as dislike_rate,
                   trend_count
            FROM unique_videos {where_clause}
            ORDER BY RANDOM()
            LIMIT 600
        """).df().to_dict(orient="records")

        # Correlation Matrix
        df_corr = con.execute(f"""
            SELECT views_last as views, likes_last as likes, dislikes_last as dislikes,
                   comments_last as comment_count, like_rate, comment_rate, trend_count
            FROM unique_videos {where_clause}
        """).df()
        
        pearson = df_corr.corr(method="pearson").round(3).to_dict()
        spearman = df_corr.corr(method="spearman").round(3).to_dict()

        # Category Engagement Ranking
        cat_eng = con.execute(f"""
            SELECT category_name,
                   ROUND(AVG(like_rate) * 100, 2) as avg_like_pct,
                   ROUND(AVG(comment_rate) * 100, 2) as avg_comment_pct,
                   ROUND(AVG(dislike_rate) * 100, 2) as avg_dislike_pct,
                   ROUND(AVG(positive_rate) * 100, 2) as avg_positive_pct,
                   COUNT(*) as video_count
            FROM unique_videos {where_clause}
            GROUP BY category_name
            ORDER BY avg_positive_pct DESC
        """).df().to_dict(orient="records")

        return {
            "scatter_sample": scatter_sample,
            "correlations": {
                "pearson": pearson,
                "spearman": spearman
            },
            "category_engagement": cat_eng
        }

    @staticmethod
    def get_sentiment_analysis(country="US", category_id=None):
        con = db.get_connection()
        where_clause = AnalyticsService._build_where(country, category_id)
        
        # 1. Valence breakdown
        counts = con.execute(f"""
            SELECT sentiment_category, COUNT(*) as count, ROUND(AVG(afinn_score), 2) as avg_score
            FROM unique_videos {where_clause}
            GROUP BY sentiment_category
        """).df().to_dict(orient="records")

        # 2. Score histogram (-5 to +5)
        and_unclass = "AND" if where_clause else "WHERE"
        hist = con.execute(f"""
            SELECT CAST(ROUND(afinn_score, 0) AS INTEGER) as score_bin, COUNT(*) as count
            FROM unique_videos {where_clause} {and_unclass} sentiment_category != 'unclassified'
            GROUP BY score_bin
            ORDER BY score_bin ASC
        """).df().to_dict(orient="records")

        # 3. Sentiment by category
        by_cat = con.execute(f"""
            SELECT category_name,
                   COUNT(CASE WHEN sentiment_category = 'positive' THEN 1 END) as positive_count,
                   COUNT(CASE WHEN sentiment_category = 'negative' THEN 1 END) as negative_count,
                   COUNT(CASE WHEN sentiment_category = 'neutral' THEN 1 END) as neutral_count,
                   COUNT(CASE WHEN sentiment_category = 'unclassified' THEN 1 END) as unclassified_count,
                   ROUND(AVG(CASE WHEN sentiment_category != 'unclassified' THEN afinn_score END), 2) as avg_sentiment
            FROM unique_videos {where_clause}
            GROUP BY category_name
            ORDER BY avg_sentiment DESC NULLS LAST
        """).df().to_dict(orient="records")

        # 4. Top Positive & Top Negative Titles
        and_sent = "AND" if where_clause else "WHERE"
        top_pos = con.execute(f"""
            SELECT video_id, title, channel_title, afinn_score, views_last as views, thumbnail_link
            FROM unique_videos {where_clause} {and_sent} afinn_score > 0
            ORDER BY afinn_score DESC, views_last DESC
            LIMIT 8
        """).df().to_dict(orient="records")

        top_neg = con.execute(f"""
            SELECT video_id, title, channel_title, afinn_score, views_last as views, thumbnail_link
            FROM unique_videos {where_clause} {and_sent} afinn_score < 0
            ORDER BY afinn_score ASC, views_last DESC
            LIMIT 8
        """).df().to_dict(orient="records")

        return {
            "summary": counts,
            "histogram": hist,
            "category_sentiment": by_cat,
            "top_positive": top_pos,
            "top_negative": top_neg
        }

    @staticmethod
    def get_countries_overview():
        con = db.get_connection()
        res = con.execute("""
            SELECT country,
                   COUNT(*) as snapshot_count,
                   COUNT(DISTINCT video_id) as unique_videos,
                   ROUND(AVG(views), 0) as avg_views,
                   ROUND(MEDIAN(views), 0) as median_views,
                   ROUND(AVG(like_rate) * 100, 2) as avg_like_pct,
                   ROUND(AVG(comment_rate) * 100, 2) as avg_comment_pct,
                   ROUND(AVG(positive_rate) * 100, 2) as avg_pos_pct,
                   MIN(trending_date) as min_date,
                   MAX(trending_date) as max_date,
                   COUNT(DISTINCT trending_date) as distinct_days
            FROM snapshots
            GROUP BY country
            ORDER BY snapshot_count DESC
        """).df()
        
        # Add human name
        res["country_name"] = res["country"].map(COUNTRY_NAMES)
        return {"countries": res.to_dict(orient="records")}

    @staticmethod
    def compare_countries(selected_codes=None):
        if not selected_codes:
            selected_codes = ["US", "GB", "IN", "CA"]
        
        codes_str = ", ".join([f"'{c.upper()}'" for c in selected_codes])
        con = db.get_connection()
        
        overview = con.execute(f"""
            SELECT country,
                   COUNT(DISTINCT video_id) as unique_videos,
                   ROUND(MEDIAN(views_last), 0) as median_views,
                   ROUND(AVG(views_last), 0) as avg_views,
                   ROUND(AVG(like_rate) * 100, 2) as avg_like_pct,
                   ROUND(AVG(comment_rate) * 100, 2) as avg_comment_pct,
                   ROUND(AVG(trend_count), 2) as avg_longevity
            FROM unique_videos
            WHERE country IN ({codes_str})
            GROUP BY country
        """).df()
        overview["country_name"] = overview["country"].map(COUNTRY_NAMES)

        # Category share per country
        cat_share = con.execute(f"""
            SELECT country, category_name, COUNT(*) as video_count
            FROM unique_videos
            WHERE country IN ({codes_str})
            GROUP BY country, category_name
            ORDER BY country, video_count DESC
        """).df().to_dict(orient="records")

        return {
            "comparison": overview.to_dict(orient="records"),
            "category_share": cat_share
        }

    @staticmethod
    def get_creators(country="US", category_id=None, limit=20):
        con = db.get_connection()
        where_clause = AnalyticsService._build_where(country, category_id)
        
        creators = con.execute(f"""
            SELECT channel_title,
                   COUNT(DISTINCT video_id) as unique_video_count,
                   SUM(views_last) as total_views,
                   ROUND(AVG(views_last), 0) as avg_views,
                   ROUND(MEDIAN(views_last), 0) as median_views,
                   ROUND(AVG(like_rate) * 100, 2) as avg_like_pct,
                   ROUND(AVG(trend_count), 1) as avg_trend_days,
                   MODE(category_name) as primary_category
            FROM unique_videos {where_clause}
            GROUP BY channel_title
            ORDER BY unique_video_count DESC, total_views DESC
            LIMIT {int(limit)}
        """).df().to_dict(orient="records")
        return {"creators": creators}

    @staticmethod
    def get_videos_table(country="US", category_id=None, start_date=None, end_date=None, search=None, page=1, page_size=20, sort_by="views", sort_dir="desc"):
        con = db.get_connection()
        where_clause = AnalyticsService._build_where(country, category_id, None, None, search)
        
        col_map = {
            "views": "views_last",
            "likes": "likes_last",
            "comments": "comments_last",
            "trend_count": "trend_count",
            "trend_duration": "trend_duration_days",
            "like_rate": "like_rate",
            "afinn_score": "afinn_score",
            "title": "title",
            "channel": "channel_title"
        }
        db_col = col_map.get(sort_by, "views_last")
        direction = "ASC" if sort_dir.lower() == "asc" else "DESC"
        offset = (page - 1) * page_size
        
        query = f"""
            SELECT video_id, country, title, channel_title, category_id, category_name,
                   views_last as views, likes_last as likes, dislikes_last as dislikes,
                   comments_last as comment_count, trend_count, trend_duration_days,
                   ROUND(like_rate * 100, 2) as like_rate,
                   ROUND(comment_rate * 100, 2) as comment_rate,
                   ROUND(afinn_score, 2) as afinn_score,
                   sentiment_category, thumbnail_link,
                   strftime(min_date, '%Y-%m-%d') as first_date,
                   strftime(max_date, '%Y-%m-%d') as last_date
            FROM unique_videos {where_clause}
            ORDER BY {db_col} {direction}
            LIMIT {int(page_size)} OFFSET {int(offset)}
        """
        rows = con.execute(query).df().to_dict(orient="records")
        total = con.execute(f"SELECT COUNT(*) FROM unique_videos {where_clause}").fetchone()[0]
        
        return {
            "page": page,
            "page_size": page_size,
            "total_records": total,
            "total_pages": int(np.ceil(total / page_size)),
            "videos": rows
        }

    @staticmethod
    def get_data_quality():
        with open(CLEANING_AUDIT_JSON, "r", encoding="utf-8") as f:
            audit = json.load(f)
        return {"audit": audit}

    @staticmethod
    def simulate_tis(country="US", weight_views=30.0, weight_engagement=30.0, weight_frequency=20.0, weight_velocity=20.0, limit=20):
        con = db.get_connection()
        where_clause = AnalyticsService._build_where(country)
        
        # Normalize weights to sum to 100
        total_w = weight_views + weight_engagement + weight_frequency + weight_velocity
        if total_w <= 0:
            total_w = 1.0
        w_v = weight_views / total_w
        w_e = weight_engagement / total_w
        w_f = weight_frequency / total_w
        w_g = weight_velocity / total_w
        
        df = con.execute(f"""
            SELECT video_id, country, title, channel_title, category_name,
                   views_last as views, likes_last as likes, comments_last as comment_count,
                   trend_count, daily_velocity, positive_rate, thumbnail_link
            FROM unique_videos {where_clause}
        """).df()

        if df.empty:
            return {"videos": []}

        # Vectorized percentile computation
        df["p_views"] = df["views"].rank(pct=True) * 100.0
        df["p_eng"] = df["positive_rate"].rank(pct=True) * 100.0
        df["p_freq"] = (df["trend_count"].clip(upper=30) / 30.0) * 100.0
        df["p_vel"] = df["daily_velocity"].rank(pct=True) * 100.0
        
        df["tis_score"] = (w_v * df["p_views"] + w_e * df["p_eng"] + w_f * df["p_freq"] + w_g * df["p_vel"]).round(1)
        
        ranked = df.sort_values(by="tis_score", ascending=False).head(limit)
        
        return {
            "weights": {
                "views": round(w_v * 100, 1),
                "engagement": round(w_e * 100, 1),
                "frequency": round(w_f * 100, 1),
                "velocity": round(w_g * 100, 1)
            },
            "ranked_videos": ranked.to_dict(orient="records")
        }
