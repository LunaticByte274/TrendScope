# TrendScope — Data Dictionary & Feature Specification

## 1. Overview
This document specifies all raw variables present across the 10 YouTube Trending Video datasets (November 2017 – June 2018), category metadata structures, and derived analytical features engineered for the TrendScope platform.

---

## 2. Raw Dataset Schema (Historical YouTube Trending)
Each of the 10 country CSV files (`CAvideos.csv`, `DEvideos.csv`, `FRvideos.csv`, `GBvideos.csv`, `INvideos.csv`, `JPvideos.csv`, `KRvideos.csv`, `MXvideos.csv`, `RUvideos.csv`, `USvideos.csv`) shares the following 16-column tabular layout:

| # | Field Name | Data Type (Raw) | Target Type | Nullable | Example Value | Description & Analytical Significance |
|---|---|---|---|---|---|---|
| 1 | `video_id` | String | String (11-char) | No | `2Vv-BfVoq4g` | Unique YouTube alphanumeric video identifier. Essential primary key for deduplication and longitudinal tracking across daily snapshots. |
| 2 | `trending_date` | String | Date (`YYYY-MM-DD`) | No | `17.14.11` | Date on which the video was observed on the country's trending page. Raw format is `YY.DD.MM`. Key for temporal indexing, day-over-day tracking, and survival analysis. |
| 3 | `title` | String | String | No | `Ed Sheeran - Perfect (Official Music Video)` | Full video title at snapshot time. Analyzed for AFINN sentiment, title token length, uppercase ratio, question marks, and TF-IDF topic extraction. |
| 4 | `channel_title` | String | String | No | `Ed Sheeran` | Channel/creator publishing the video. Used for creator analytics, channel concentration (Gini coefficient), and cross-country creator reach. |
| 5 | `category_id` | Integer | Integer / Categorical | No | `10` | Numerical category identifier mapped to human-readable names via category JSON files (e.g., 10 = Music, 24 = Entertainment). |
| 6 | `publish_time` | String | Timestamp (ISO-8601 UTC) | No | `2017-11-09T11:04:14.000Z` | Timestamp of when the video was uploaded/made public. Crucial for computing publication lag (hours between upload and trending appearance) and publishing hour seasonality. |
| 7 | `tags` | String | List[String] | Yes | `"pop"\|"ballad"\|"acoustic"` | Pipe-delimited list of creator tags or `[none]`. Used to measure tag volume, tag breadth, and keyword relevance. |
| 8 | `views` | Integer | Int64 | No | `33523622` | Cumulative view count up to the snapshot timestamp. Subject to extreme right-skew; analyzed using log transforms, percentiles, and daily incremental deltas. |
| 9 | `likes` | Integer | Int64 | No | `1634124` | Cumulative user upvotes. Key numerator for like rate and audience sentiment validation. |
| 10 | `dislikes` | Integer | Int64 | No | `21082` | Cumulative user downvotes. Used for controversy score, dislike rate, and polarity ratio calculation. |
| 11 | `comment_count` | Integer | Int64 | No | `85067` | Cumulative number of user comments recorded. Proxy for audience discussion propensity and engagement depth. |
| 12 | `thumbnail_link` | String | URL String | No | `https://i.ytimg.com/vi/2Vv-BfVoq4g/default.jpg` | Default resolution image preview of the video thumbnail. |
| 13 | `comments_disabled` | Boolean | Boolean | No | `False` | Administrative flag indicating whether creator disabled viewer comments. Affects interaction denominators. |
| 14 | `ratings_disabled` | Boolean | Boolean | No | `False` | Administrative flag indicating whether creator disabled like/dislike display. |
| 15 | `video_error_or_removed`| Boolean | Boolean | No | `False` | Flag indicating whether video was removed, DMCA-blocked, or experienced an error while trending. |
| 16 | `description` | String | Text | Yes | `The official music video for Ed Sheeran - Perfect...` | Full video description text. High missingness in certain countries (e.g., Mexico, South Korea); used for secondary keyword verification. |

---

## 3. Category Metadata Mapping
Extracted and unified from the 10 country JSON files (`{country}_category_id.json`):

| Category ID | Category Name | Global Presence | Description / Typical Content |
|---|---|---|---|
| 1 | Film & Animation | All 10 Countries | Movie trailers, animated shorts, film discussions |
| 2 | Autos & Vehicles | All 10 Countries | Car reviews, motorsport highlights, restoration |
| 10 | Music | All 10 Countries | Official music videos, lyrical videos, live performances |
| 15 | Pets & Animals | All 10 Countries | Animal documentaries, cute pet videos, wildlife |
| 17 | Sports | All 10 Countries | Match highlights, extreme sports, athlete vlogs |
| 18 | Short Movies | Selected Metadata | Short cinematic films |
| 19 | Travel & Events | All 10 Countries | Travel vlogs, destination guides, cultural festivals |
| 20 | Gaming | All 10 Countries | Gameplay streams, walkthroughs, esports, trailer reveals |
| 21 | Videoblogging | Selected Metadata | Personal video blogs |
| 22 | People & Blogs | All 10 Countries | Influencer lifestyle, family vlogs, opinion pieces |
| 23 | Comedy | All 10 Countries | Sketches, stand-up comedy, parody, satirical shows |
| 24 | Entertainment | All 10 Countries | Talk shows, reality TV clips, variety shows, magic |
| 25 | News & Politics | All 10 Countries | News broadcasts, investigative journalism, political debates |
| 26 | Howto & Style | All 10 Countries | Makeup tutorials, DIY crafts, cooking recipes, fashion |
| 27 | Education | All 10 Countries | Science explainer videos, academic lectures, tutorials |
| 28 | Science & Technology | All 10 Countries | Gadget reviews, physics demonstrations, tech news |
| 29 | Nonprofits & Activism | All 10 Countries | Charity campaigns, public service announcements |
| 30 | Movies | Selected Metadata | Full feature releases |
| 31–42 | Niche Film Genres | Metadata | Anime, Action, Classics, Family, Horror, Thriller |
| 43 | Shows | US, GB, etc. | Episodic online television series |
| 44 | Trailers | Metadata | Dedicated movie and television trailers |

---

## 4. Derived & Engineered Feature Specifications

### 4.1 Engagement Metrics
1. **Like Rate (`like_rate`):**
   $$\text{Like Rate} = \frac{\text{likes}}{\text{views}}$$
   Measures initial viewer approval propensity. Guarded against division by zero: if $\text{views} = 0$, set to $0.0$.

2. **Comment Rate (`comment_rate`):**
   $$\text{Comment Rate} = \frac{\text{comment\_count}}{\text{views}}$$
   Measures conversational engagement and discussion intensity.

3. **Dislike Rate (`dislike_rate`):**
   $$\text{Dislike Rate} = \frac{\text{dislikes}}{\text{views}}$$
   Measures viewer disapproval or audience backlash.

4. **Positive Interaction Rate (`positive_rate`):**
   $$\text{Positive Interaction Rate} = \frac{\text{likes} + \text{comment\_count}}{\text{views}}$$

5. **Total Recorded Interaction Rate (`total_interaction_rate`):**
   $$\text{Total Interaction Rate} = \frac{\text{likes} + \text{dislikes} + \text{comment\_count}}{\text{views}}$$
   Represents cumulative participatory friction per view.

6. **Engagement Ratio / Polarity Index (`like_dislike_ratio`):**
   $$\text{Polarity Ratio} = \frac{\text{likes}}{\max(\text{dislikes}, 1)}$$

---

### 4.2 Longitudinal & Temporal Features
1. **Publication Lag (`time_to_trend_hours`):**
   $$\text{Lag Hours} = \frac{\text{trending\_date (00:00:00 UTC)} - \text{publish\_time (UTC)}}{3600}$$
   Calculates how rapidly an uploaded video achieved viral velocity and broke into the trending ranks.

2. **Trending Appearance Count (`trend_count`):**
   $$\text{Trend Count} = \text{Count of unique calendar dates on which } \text{video\_id} \text{ was observed.}$$

3. **Trending Longevity / Duration (`trend_duration_days`):**
   $$\text{Duration} = (\text{last\_trending\_date} - \text{first\_trending\_date}) + 1$$

4. **Snapshot View Delta / Velocity (`views_growth_rate`):**
   $$\Delta \text{Views}_t = \text{views}_t - \text{views}_{t-1}$$
   Measures the incremental audience surge between consecutive observed calendar dates.

---

### 4.3 Textual & Sentiment Features
1. **AFINN Lexicon Score (`afinn_score`):**
   - Derived from Finn Årup Nielsen's AFINN-111 lexicon (integers from $-5$ to $+5$).
   - Tokenized words $w \in \text{Title}$ are matched against the lexicon.
   - Video score is computed as:
     $$\text{AFINN Score} = \frac{1}{|W_{\text{matched}}|} \sum_{w \in W_{\text{matched}}} \text{Score}(w)$$
   - Categorized as:
     - **Positive:** $\text{Score} > 0$
     - **Negative:** $\text{Score} < 0$
     - **Neutral (Lexicon Scored):** $\text{Score} = 0$
     - **Unclassified (No Lexicon Match):** $|W_{\text{matched}}| = 0$ (properly separated from semantic neutrality)

2. **Title Characteristics:**
   - `title_char_length`: Character length of the title.
   - `title_word_count`: Number of whitespace-separated tokens.
   - `uppercase_ratio`: Ratio of uppercase characters to total alphabetical characters (proxy for clickbait/intensity).
   - `contains_question`: Boolean flag for presence of `'?'`.
   - `contains_exclamation`: Boolean flag for presence of `'!'`.

---

### 4.4 Machine Learning & Intelligence Scores
1. **Trend Intelligence Score (TIS, 0–100):**
   A transparent composite index normalizing multi-factor performance:
   $$\text{TIS} = w_1 \cdot \tilde{V} + w_2 \cdot \tilde{E} + w_3 \cdot \tilde{F} + w_4 \cdot \tilde{G}$$
   Where:
   - $\tilde{V}$: Percentile rank of unique video views.
   - $\tilde{E}$: Percentile rank of positive interaction rate.
   - $\tilde{F}$: Normalized trending appearance frequency ($\min(\frac{\text{days}}{30}, 1.0) \times 100$).
   - $\tilde{G}$: Velocity factor ($\min(\frac{\Delta \text{views}}{\bar{V}_{\text{category}}}, 2.0) \times 50$).
   - Weights $w_1, w_2, w_3, w_4$ are dynamically adjustable by the user in the analytics interface.

2. **Trend Continuation Target (`trends_tomorrow`):**
   Binary classification ground truth:
   $$y_{v, t} = \begin{cases} 1 & \text{if video } v \text{ appears in trending records on date } t+1 \\ 0 & \text{otherwise} \end{cases}$$
   Evaluated strictly using chronological train/test splits to avoid future data leakage.

