# TrendScope — Academic Methodology & Mathematical Foundations

## 1. Introduction & Research Problem
Understanding video virality, viewer engagement, and topic lifecycles on video platforms requires rigorous analytical frameworks. Traditional descriptive reporting often falls victim to naive aggregations: cumulative metrics are summed across consecutive days, duplicate crawl artifacts are left unresolved, and simplistic sentiment lexicons are applied indiscriminately across non-English text.

TrendScope formalizes an academically defensible analytical methodology that:
1. Distinguishes between daily snapshot observation sums and unique-video audience reach.
2. Formulates mathematically rigorous engagement ratios guarded against zero-inflation.
3. Formulates a chronological, leak-free machine learning task for trend continuation prediction.
4. Segments content performance via standardized unsupervised clustering and dimensional reduction.
5. Employs time-series forecasting with temporal validation rather than randomized data splits.

---

## 2. Data Cleaning & Reconciled Aggregation Formulation

### 2.1 Reconciled Unique-Video Popularity vs. Legacy Snapshot Sum
Let $S = \{(v, d, c, V_{v,d})\}$ denote the set of daily trending observations, where $v \in \mathcal{V}$ is a video ID, $d \in \mathcal{D}$ is the observation date, $c \in \mathcal{C}$ is the category, and $V_{v,d}$ is the cumulative view count recorded at date $d$.

**Legacy Snapshot Sum (Original R implementation):**
$$P_{\text{legacy}}(c) = \sum_{(v, d, c, V_{v,d}) \in S} V_{v,d}$$
Because $V_{v,d}$ represents cumulative views up to date $d$, if video $v$ trends for $T_v$ days, its views are summed $T_v$ times:
$$P_{\text{legacy}}(c) \approx \sum_{v \in \mathcal{V}_c} \bar{V}_v \cdot T_v$$
For categories characterized by prolonged trending lifecycles (e.g., Music, where $T_v$ averages 8 to 15 days), $P_{\text{legacy}}$ inflates apparent category popularity by $800\%\text{–}900\%$.

**TrendScope Reconciled Unique-Video Reach:**
Let $d^*_v = \max \{ d \mid (v, d, c, V_{v,d}) \in S \}$ be the terminal observed date for video $v$. The true estimated audience reach for category $c$ is defined as:
$$P_{\text{unique}}(c) = \sum_{v \in \mathcal{V}_c} V_{v, d^*_v}$$
This guarantees that each unique video contributes exactly once using its latest snapshot.

---

## 3. Engagement Ratio Formulations
YouTube view distributions are heavily right-skewed (Pareto-distributed). Direct comparisons of absolute like or comment counts are biased toward high-reach videos. We define normalized engagement rates bounded in $[0, 1]$:

1. **Like Rate ($R_{\text{like}}$):**
   $$R_{\text{like}}(v) = \frac{\text{likes}(v)}{\max(\text{views}(v), 1)}$$

2. **Comment Rate ($R_{\text{comment}}$):**
   $$R_{\text{comment}}(v) = \frac{\text{comment\_count}(v)}{\max(\text{views}(v), 1)}$$

3. **Dislike Rate ($R_{\text{dislike}}$):**
   $$R_{\text{dislike}}(v) = \frac{\text{dislikes}(v)}{\max(\text{views}(v), 1)}$$

4. **Positive Interaction Rate ($R_{\text{pos}}$):**
   $$R_{\text{pos}}(v) = \frac{\text{likes}(v) + \text{comment\_count}(v)}{\max(\text{views}(v), 1)}$$

5. **Engagement Performance Index (EPI):**
   $$\text{EPI}(v) = 100 \times \left( 0.6 \cdot F_{R_{\text{like}}}(R_{\text{like}}(v)) + 0.4 \cdot F_{R_{\text{comment}}}(R_{\text{comment}}(v)) \right)$$
   Where $F_X(x)$ represents the empirical cumulative distribution function (ECDF) percentile rank of metric $x$ within its category.

---

## 4. Title Sentiment Intelligence: AFINN-111 Baseline & Caveats

### 4.1 Tokenization and Lexicon Score
Video title $T_v$ is normalized by case-folding and tokenized into word set $W_v = \{w_1, w_2, \dots, w_k\}$. For each token $w \in W_v$, the AFINN-111 dictionary provides integer valence $s(w) \in [-5, +5]$.

Let $W^*_v = \{ w \in W_v \mid s(w) \neq 0 \}$ be the set of lexicon-matched tokens.
$$\text{Sentiment Score}(v) = \begin{cases} 
\frac{1}{|W^*_v|} \sum_{w \in W^*_v} s(w) & \text{if } |W^*_v| > 0 \\
\text{Unclassified} & \text{if } |W^*_v| = 0
\end{cases}$$

### 4.2 Defending the Unclassified State
In the original project, unclassified titles ($|W^*_v| = 0$) were either dropped or erroneously conflated with neutral scores ($0.0$). TrendScope explicitly categorizes outputs into four states:
- **Positive:** $\text{Score} > 0$
- **Negative:** $\text{Score} < 0$
- **True Neutral:** $|W^*_v| > 0$ and $\sum s(w) = 0$ (e.g., balanced valence words)
- **Unclassified:** $|W^*_v| = 0$ (no lexicon terms present)

### 4.3 Multilingual Limitations
AFINN is an English-language lexicon. Applying it directly to Russian Cyrillic (`RUvideos.csv`), Japanese (`JPvideos.csv`), or Korean (`KRvideos.csv`) results in $>92\%$ unclassified rates. The platform flags language applicability clearly to maintain academic honesty.

---

## 5. Machine Learning Models & Formulations

### 5.1 Model 1: Trend Continuation Prediction (Classification)
- **Objective:** Predict whether video $v$ observed on date $t$ will reappear on date $t+1$:
  $$y_{v, t} = \mathbb{I}\left( (v, t+1) \in S \right)$$
- **Features at time $t$:**
  - $\log_{10}(\text{views}_t)$
  - $R_{\text{like}}, R_{\text{comment}}, R_{\text{dislike}}$
  - Prior trending appearance count up to date $t$: $N_{v, \le t}$
  - Publication lag (hours between upload and $t$)
  - One-hot encoded category ID
- **Leakage Prevention:** Future observations $t' > t$ are strictly masked. Evaluation is performed chronologically (training on the first 75% of calendar dates, testing on the terminal 25% of calendar dates).
- **Algorithms:**
  - L2-Regularized Logistic Regression (Interpretable odds-ratio baseline)
  - Random Forest Classifier (100 estimators, max depth 12)
  - Gradient Boosting Classifier (Learning rate 0.1, max depth 5)
- **Metrics:** Accuracy, Precision, Recall, F1-Score, ROC-AUC, PR-AUC, Confusion Matrix.

### 5.2 Model 2: Content & Performance Clustering (Unsupervised K-Means)
- **Feature Space $\mathbf{x} \in \mathbb{R}^5$:**
  $$\mathbf{x} = \left[ \log_{10}(\text{views}), \log_{10}(\text{likes}+1), R_{\text{like}}, R_{\text{comment}}, \text{trend\_duration\_days} \right]$$
- **Standardization:** Features are centered and scaled:
  $$z_j = \frac{x_j - \mu_j}{\sigma_j}$$
- **Optimal $K$ Selection:** Evaluated across $k \in \{2, 3, 4, 5, 6, 7, 8\}$ using:
  - Inertia (Elbow Method): $\sum_{i=1}^n \min_{\mu_j} \|z_i - \mu_j\|^2$
  - Mean Silhouette Coefficient: $s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$
- **Dimensionality Reduction:** 2D Principal Component Analysis (PCA) projection capturing $>70\%$ of cumulative variance for visual cluster space exploration.

### 5.3 Model 3: Category Activity Forecasting (Time Series)
- **Time Series Definition:** Daily video count or view volume for category $c$ over calendar timeline $t \in [1, 205]$:
  $$Y_t(c) = \sum_{(v, d_t, c, V) \in S} 1$$
- **Validation:** Chronological split (e.g. 175 days train, 30 days test).
- **Models:**
  - Baseline Random Walk / Moving Average (7-day window)
  - Holt-Winters Exponential Smoothing (Additive trend)
  - Auto-Regressive Integrated Moving Average (ARIMA$(p, d, q)$)
- **Evaluation Metrics:**
  $$\text{MAE} = \frac{1}{H} \sum_{h=1}^H |y_{T+h} - \hat{y}_{T+h}|, \quad \text{RMSE} = \sqrt{\frac{1}{H} \sum_{h=1}^H (y_{T+h} - \hat{y}_{T+h})^2}, \quad \text{sMAPE} = \frac{100\%}{H} \sum_{h=1}^H \frac{2|y_{T+h} - \hat{y}_{T+h}|}{|y_{T+h}| + |\hat{y}_{T+h}|}$$

### 5.4 Model 4: Anomaly Detection (Isolation Forest)
- Unsupervised isolation trees isolating outliers in multi-dimensional space $(\text{views}, R_{\text{like}}, R_{\text{comment}}, \Delta \text{views})$. Identifies viral anomalies, sudden engagement shifts, and atypical ratios without labelling them as fraudulent.

### 5.5 Model 5: Topic Discovery (TF-IDF + NMF)
- Term Frequency-Inverse Document Frequency (TF-IDF) matrix constructed with unigrams and bigrams (excluding English stopwords).
- Non-Negative Matrix Factorization (NMF) decomposes the term-document matrix $V \approx W \times H$ into $k=6$ interpretable latent topics with top characteristic terms.

