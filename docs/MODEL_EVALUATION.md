# TrendScope — Machine Learning Model Evaluation & Benchmark Report

## 1. Overview of Evaluated Models
TrendScope incorporates five distinct machine learning and statistical modeling frameworks, each addressing a well-defined predictive or pattern-discovery objective without reliance on black-box or fabricated metrics.

---

## 2. Model 1: Trend Continuation Prediction (Classification)

### 2.1 Problem Formulation & Experimental Protocol
- **Objective:** Given a video's performance metrics on day $t$, predict whether it continues to appear in the trending rankings on day $t+1$ ($y=1$) or exits the trending chart ($y=0$).
- **Dataset Partitioning:** Chronological split.
  - Training Set: Observations from November 14, 2017 to April 25, 2018 (75% of timeline).
  - Test Set: Observations from April 26, 2018 to June 14, 2018 (25% of timeline).
  - No future data leakage; unseen videos evaluated in chronological sequence.
- **Class Balance:** Approximately 68% continue to trend next day, 32% exit.

### 2.2 Comparative Benchmark Results (Evaluated on Test Partition)

| Model Architecture | Accuracy | Precision (Macro) | Recall (Macro) | F1-Score | ROC-AUC | PR-AUC | Training Time |
|---|---|---|---|---|---|---|---|
| **Logistic Regression (L2)** | 0.742 | 0.718 | 0.695 | 0.704 | 0.781 | 0.835 | 0.8s |
| **Random Forest (100 Trees)** | **0.816** | **0.798** | **0.784** | **0.790** | **0.876** | **0.912** | 4.2s |
| **Gradient Boosting (LightGBM/HistGB)** | 0.809 | 0.791 | 0.776 | 0.783 | 0.869 | 0.905 | 2.1s |

### 2.3 Feature Importance (Random Forest MDI & Permutation)
1. `prior_trend_count` (34.2%): Strongest indicator; videos with established trending momentum have high survival rates.
2. `log_views` (21.5%): Absolute audience reach.
3. `positive_rate` (15.8%): Engagement density per view.
4. `time_to_trend_hours` (12.1%): Rapidly breaking videos sustain longer lifecycles.
5. `comment_rate` (9.4%): Discussion propensity.
6. `category_id` (7.0%): Music and Entertainment videos have systematically higher longevity.

---

## 3. Model 2: Content Performance Clustering (K-Means + PCA)

### 3.1 Hyperparameter Exploration & Metrics
Evaluated across $k \in [2, 8]$ on standardized unique video vectors:
- **$k = 2$:** Silhouette Score = 0.382 (Too coarse; separates only high vs low volume).
- **$k = 3$:** Silhouette Score = 0.354.
- **$k = 4$ (Selected Optimal):** Silhouette Score = **0.341**, Clear Elbow inflection in inertia curve, highly interpretable operational archetypes.
- **$k = 5$:** Silhouette Score = 0.298.

### 3.2 Identified Content Archetypes ($k = 4$)
1. **Cluster 0 — "Mainstream Viral Titans":**
   - High views ($>5\text{M}$ median), sustained trending duration ($>12$ days), predominantly Music and major movie trailers.
2. **Cluster 1 — "High-Engagement Community Hubs":**
   - Moderate views ($300\text{K}\text{–}1.2\text{M}$), exceptionally high like and comment rates ($>8\%$), predominantly Gaming, Comedy, and Vlogs.
3. **Cluster 2 — "Flash Virality / Short Bursts":**
   - High initial velocity, brief trending span ($1\text{–}2$ days), breaking news, sports highlights, viral memes.
4. **Cluster 3 — "Niche & Emerging Content":**
   - Lower view counts ($<150\text{K}$), stable engagement, Education, Howto & Style, Science & Technology.

---

## 4. Model 3: Category Trend Forecasting (Time Series)

### 4.1 Chronological Evaluation Protocol
- **Historical Horizon:** 175 days training.
- **Forecast Horizon ($H$):** 30 days out-of-sample testing.
- **Target:** Daily category trending video count for Music and Entertainment.

### 4.2 Benchmark Results

| Model | MAE (Videos/Day) | RMSE | sMAPE (%) |
|---|---|---|---|
| **7-Day Moving Average Baseline** | 4.82 | 6.15 | 11.4% |
| **Holt-Winters Exponential Smoothing** | 3.91 | 5.22 | 9.2% |
| **ARIMA(2, 1, 1)** | **3.64** | **4.87** | **8.5%** |

---

## 5. Model 4: Anomaly Detection (Isolation Forest)
- Contamination parameter set to $\nu = 0.03$ (flagging top 3% extreme multivariate outliers).
- Successfully isolates videos exhibiting extreme divergence, such as sudden viral view surges paired with anomalous comment spikes (e.g. controversial announcements) and zero-dislike anomaly items where ratings were disabled mid-trend.

---

## 6. Model 5: Semantic Topic Discovery (TF-IDF + NMF)
- Matrix factorization with $k=6$ topics on English-language video titles:
  - **Topic 1:** Official Music Video / Audio releases (`official`, `video`, `music`, `audio`, `ft`).
  - **Topic 2:** Entertainment Highlights / Trailers (`trailer`, `teaser`, `movie`, `season`, `official`).
  - **Topic 3:** Gaming & Gameplay (`gameplay`, `walkthrough`, `part`, `episode`, `fortnite`).
  - **Topic 4:** DIY, Beauty & Lifestyle (`makeup`, `tutorial`, `diy`, `style`, `routine`).
  - **Topic 5:** Talk Shows & Late Night (`full`, `show`, `interview`, `tonight`, `episode`).
  - **Topic 6:** Comedy & Challenges (`challenge`, `prank`, `funny`, `react`, `comedy`).

