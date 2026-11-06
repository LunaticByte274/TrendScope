# TrendScope — Data Quality Observatory & Cleaning Report

## 1. Data Integrity Summary
The historical YouTube trending dataset spans 10 national territories from November 14, 2017 to June 14, 2018 (Japan from February 7, 2018 to June 14, 2018). While the original research script operated directly on raw CSVs without validation, TrendScope implements an automated cleaning and auditing pipeline that eliminates duplicate artifacts while rigorously preserving genuine repeat observations.

---

## 2. Quantitative Cleaning Audit Results

The following table documents the quantitative transformations applied by the TrendScope preprocessing pipeline:

| Country | Raw Rows | Exact Duplicates Removed | Same-Day Conflicting Snapshots Resolved | Cleaned Snapshots Retained | Unique Videos Documented | Data Retention Rate |
|---|---|---|---|---|---|---|
| **Canada (CA)** | 40,881 | 0 | 0 | 40,881 | 24,427 | 100.00% |
| **Germany (DE)** | 40,840 | 0 | 0 | 40,840 | 29,627 | 100.00% |
| **France (FR)** | 40,724 | 0 | 0 | 40,724 | 30,581 | 100.00% |
| **Great Britain (GB)** | 38,916 | 171 | 3 | 38,742 | 3,272 | 99.55% |
| **India (IN)** | 37,352 | 4,263 | 631 | 32,458 | 16,307 | 86.90% |
| **Japan (JP)** | 20,523 | 5,677 | 303 | 14,543 | 12,912 | 70.86% |
| **South Korea (KR)** | 34,567 | 2,316 | 309 | 31,942 | 15,876 | 92.41% |
| **Mexico (MX)** | 40,451 | 49 | 329 | 40,073 | 33,513 | 99.07% |
| **Russia (RU)** | 40,739 | 46 | 371 | 40,322 | 34,282 | 98.98% |
| **USA (US)** | 40,949 | 48 | 2 | 40,899 | 6,351 | 99.88% |
| **Total Global** | **375,942** | **12,570** | **1,948** | **361,424** | **207,148** | **96.14%** |

---

## 3. Data Quality Issues Identified & Fixed

### 3.1 Repeat Observations vs. Spurious Duplicates
- **Legitimate Repeat Appearances:** A video appearing on November 15, November 16, and November 17 represents genuine trending longevity. These records have different `trending_date` values and must be preserved.
- **Exact Duplicate Rows:** Identical records repeated across all 16 columns (caused by multiple crawler runs on the same day). In India, Japan, and South Korea, thousands of exact duplicate rows were detected and removed.
- **Same-Day Conflicts:** Multiple rows with identical `video_id` and `trending_date` but differing view counts (crawled at different hours of the same day).
  - *Resolution:* Reconciled deterministically by keeping the record with the maximum views, capturing the latest available observation for that date.

### 3.2 Non-English Character Encoding Fix
- Four datasets (`JPvideos.csv`, `KRvideos.csv`, `MXvideos.csv`, `RUvideos.csv`) caused strict UTF-8 decoding to fail due to isolated broken multibyte sequences (e.g., 10 bytes in JP out of 28.7 MB).
- Naive fallback to `latin1` corrupts Japanese Kanji/Kana, Korean Hangul, and Russian Cyrillic into illegible character sequences.
- *Fix:* TrendScope applies UTF-8 decoding with replacement character fallbacks (`errors='replace'`). 99.999% of original native text is perfectly preserved.

### 3.3 Date & Time Normalization
- The raw `trending_date` format is `YY.DD.MM` (e.g. `17.14.11` corresponds to November 14, 2017).
- Converted into strict ISO-8601 calendar dates (`YYYY-MM-DD`).
- `publish_time` is parsed as UTC timestamps to enable exact hour-level publication lag calculations.

### 3.4 Numerical Bounds Validation
- All view, like, dislike, and comment counts are validated to be non-negative integers ($\ge 0$).
- Division by zero is protected across all computed rate ratios.

