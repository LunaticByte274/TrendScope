# TrendScope — System Architecture & Engineering Blueprint

## 1. Architectural Philosophy
TrendScope is designed as an enterprise-grade analytics and predictive intelligence platform that bridges historical Big Data exploration with modern reactive web applications. The architecture decouples analytical query processing from client-side state management, leveraging high-throughput columnar storage (Parquet + DuckDB), a high-concurrency Python backend (FastAPI), and a modern React/TypeScript frontend.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION TIER                             │
│       React 19 + TypeScript + Vite + Tailwind CSS + Apache ECharts     │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Executive Overview  │  Trending Explorer  │  Category Intel   │   │
│   │  Engagement Lab      │  Sentiment Intel    │  Country Compare  │   │
│   │  Creator Analytics   │  Predictive Studio  │  Teacher Mode     │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ HTTP / REST / JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                           SERVICES TIER                                │
│                     FastAPI Application Server                         │
│   ┌───────────────┬───────────────┬────────────────┬───────────────┐   │
│   │ Overview API  │ Explorer API  │ Category API   │ Engagement API│   │
│   ├───────────────┼───────────────┼────────────────┼───────────────┤   │
│   │ Sentiment API │ Country API   │ Prediction API │ Cluster API   │   │
│   └───────────────┴───────────────┴────────────────┴───────────────┘   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │   Analytics Engine: Dynamic TIS, Velocity, Correlation Matrix  │   │
│   │   ML Engine: Logistic Reg, Random Forest, K-Means, ARIMA, NMF  │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Columnar Vectorized Execution
┌───────────────────────────────────▼────────────────────────────────────┐
│                             DATA TIER                                  │
│   ┌───────────────────────────────────┬────────────────────────────┐   │
│   │ DuckDB In-Process Columnar OLAP   │ PyArrow Vectorized Engine  │   │
│   ├───────────────────────────────────┴────────────────────────────┤   │
│   │ Optimized Parquet Partitions:                                  │   │
│   │  - snapshots.parquet (361,424 cleaned daily observations)      │   │
│   │  - unique_videos.parquet (207,148 unique video lifecycle rows) │   │
│   │  - categories.json (Unified metadata across 10 countries)      │   │
│   │  - cleaning_audit.json (Deterministic deduplication logs)      │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout
The project follows a clean modular structure separating baseline R research, backend services, machine learning models, frontend interfaces, and academic documentation:

```
trendscope/
├── BDA PROJECT/                 # Preserved original baseline project
│   ├── data/                    # 10 raw CSVs & 10 category JSONs
│   ├── outputs/                 # Original R figures & tables
│   └── scripts/                 # Original YouTube_Trending_Analysis.R
├── data/
│   └── clean/                   # Preprocessed Parquet columnar storage
│       ├── snapshots.parquet    # 361,424 clean records
│       ├── unique_videos.parquet# 207,148 unique records with AFINN
│       ├── categories.json      # Unified category dictionary
│       └── cleaning_audit.json  # Data quality logs
├── docs/                        # Complete academic & architectural documentation
│   ├── PROJECT_AUDIT.md
│   ├── DATA_DICTIONARY.md
│   ├── ARCHITECTURE.md
│   ├── METHODOLOGY.md
│   ├── MODEL_EVALUATION.md
│   ├── DATA_QUALITY.md
│   └── USER_GUIDE.md
├── backend/                     # High-performance FastAPI server
│   ├── app/
│   │   ├── main.py              # Application entrypoint & CORS
│   │   ├── config.py            # Global settings & paths
│   │   ├── database.py          # DuckDB singleton & query helpers
│   │   ├── routers/             # Specialized REST route controllers
│   │   │   ├── overview.py
│   │   │   ├── trends.py
│   │   │   ├── categories.py
│   │   │   ├── engagement.py
│   │   │   ├── sentiment.py
│   │   │   ├── countries.py
│   │   │   ├── creators.py
│   │   │   ├── videos.py
│   │   │   ├── models.py
│   │   │   └── data_quality.py
│   │   ├── analytics/           # Deterministic business logic
│   │   │   ├── metrics.py
│   │   │   ├── scoring.py
│   │   │   └── statistics.py
│   │   └── ml/                  # Machine learning training & inference
│   │       ├── continuation.py  # Trend continuation classification
│   │       ├── clustering.py    # K-Means & PCA 2D embedding
│   │       ├── forecasting.py   # Category time-series ARIMA/ExpSmoothing
│   │       ├── anomalies.py     # Isolation Forest outlier detection
│   │       └── topics.py        # TF-IDF + NMF semantic discovery
│   └── tests/                   # Automated pytest suite
└── frontend/                    # Modern React / TypeScript UI
    ├── src/
    │   ├── components/          # Reusable UI widgets & navigation
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── FilterBar.tsx
    │   │   ├── KpiCard.tsx
    │   │   ├── InsightCard.tsx
    │   │   ├── InfoTooltip.tsx
    │   │   └── VideoDetailModal.tsx
    │   ├── pages/               # Functional analytics views
    │   │   ├── OverviewPage.tsx
    │   │   ├── TrendingExplorerPage.tsx
    │   │   ├── CategoryIntelligencePage.tsx
    │   │   ├── EngagementLabPage.tsx
    │   │   ├── SentimentIntelligencePage.tsx
    │   │   ├── CountryComparisonPage.tsx
    │   │   ├── CreatorAnalyticsPage.tsx
    │   │   ├── VideoTablePage.tsx
    │   │   ├── PredictiveStudioPage.tsx
    │   │   ├── DataQualityPage.tsx
    │   │   ├── MethodologyPage.tsx
    │   │   └── TeacherModePage.tsx
    │   ├── charts/              # ECharts wrappers & SVG renderers
    │   ├── services/            # Axios / Fetch client API layer
    │   ├── types/               # TypeScript interfaces & domain models
    │   └── styles/              # Dark SaaS Tailwind theme
    ├── package.json
    └── vite.config.ts
```

---

## 3. Data Flow & Latency Budget
1. **Initial Filter Requests:** Filter parameters (country, category, date range, channel query) are passed via URL query parameters.
2. **Columnar Filtering:** DuckDB filters Parquet files using push-down predicates, reading only requested columns directly into memory. Typical aggregate response latency is under 40 milliseconds for 360,000+ rows.
3. **Data Caching:** The unified DuckDB in-memory connection caches frequent analytical aggregates (category rollups, country rankings).
4. **Interactive Responsiveness:** The UI maintains client-side optimistic filter updates while debouncing heavy search operations (300 ms).

