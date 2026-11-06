import os
import sys
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Add backend directory to path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.analytics_service import AnalyticsService
from app.services.ml_service import MLService
from app.config import COUNTRY_NAMES, SUPPORTED_COUNTRIES

# ------------------------------------------------------------------------------
# Page Configuration
# ------------------------------------------------------------------------------
st.set_page_config(
    page_title="TrendScope — YouTube Trend Intelligence (2026)",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Dark Theme CSS
st.markdown("""
<style>
    /* Dark Theme Base */
    .stApp {
        background-color: #090d16;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Metrics Styling */
    div[data-testid="stMetricValue"] {
        color: #10b981;
        font-weight: 700;
        font-size: 1.6rem;
    }
    div[data-testid="stMetricLabel"] {
        color: #94a3b8;
        font-size: 0.85rem;
        font-weight: 600;
    }
    div[data-testid="metric-container"] {
        background-color: #0f172a;
        border: 1px solid #1e293b;
        padding: 1rem;
        border-radius: 1rem;
    }

    /* Tabs Styling */
    button[data-baseweb="tab"] {
        font-weight: 600;
        color: #94a3b8;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        color: #10b981 !important;
        border-bottom-color: #10b981 !important;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #060911;
        border-right: 1px solid #1e293b;
    }

    /* Cards */
    .trend-card {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 1rem;
        padding: 1.25rem;
        margin-bottom: 1rem;
    }
    .badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .badge-emerald {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-cyan {
        background: rgba(6, 182, 212, 0.15);
        color: #06b6d4;
        border: 1px solid rgba(6, 182, 212, 0.3);
    }
</style>
""", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# Cached Data Fetchers
# ------------------------------------------------------------------------------
@st.cache_data(ttl=3600)
def get_metadata():
    return AnalyticsService.get_metadata()

@st.cache_data(ttl=600)
def get_overview(country, category_id, search):
    return AnalyticsService.get_overview(country=country, category_id=category_id, search=search)

@st.cache_data(ttl=600)
def get_trends(country, category_id, search, sort_by, limit):
    return AnalyticsService.get_trending_videos(country=country, category_id=category_id, search=search, sort_by=sort_by, limit=limit)

@st.cache_data(ttl=600)
def get_categories(country):
    return AnalyticsService.get_categories(country=country)

@st.cache_data(ttl=600)
def get_engagement(country, category_id):
    return AnalyticsService.get_engagement_lab(country=country, category_id=category_id)

@st.cache_data(ttl=600)
def get_sentiment(country, category_id):
    return AnalyticsService.get_sentiment_intelligence(country=country, category_id=category_id)

@st.cache_data(ttl=600)
def get_countries():
    return AnalyticsService.get_countries()

@st.cache_data(ttl=600)
def get_creators(country, category_id, limit):
    return AnalyticsService.get_creators(country=country, category_id=category_id, limit=limit)

@st.cache_data(ttl=600)
def get_videos(country, category_id, search, page, page_size, sort_by, sort_dir):
    return AnalyticsService.get_videos_table(country=country, category_id=category_id, search=search, page=page, page_size=page_size, sort_by=sort_by, sort_dir=sort_dir)

# ------------------------------------------------------------------------------
# Sidebar Navigation & Filters
# ------------------------------------------------------------------------------
meta = get_metadata()
categories_list = meta.get("categories", [])
cat_options = {c["name"]: c["id"] for c in categories_list}

with st.sidebar:
    st.markdown("""
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
            <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 0.5rem; border-radius: 0.75rem;">
                <span style="font-size: 1.25rem;">🔥</span>
            </div>
            <div>
                <h2 style="margin:0; font-size:1.2rem; font-weight:700; color:white;">TrendScope</h2>
                <span class="badge badge-emerald">2026 Trends</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    module = st.radio(
        "Select Analytics Module",
        [
            "📊 Executive Overview",
            "🔥 Trending Video Explorer",
            "🗂️ Category Intelligence",
            "🧪 Engagement Analytics Lab",
            "😊 Sentiment Intelligence",
            "🌐 Global Country Comparison",
            "📺 Creator Analytics",
            "📋 Video Data Explorer",
            "🧠 Predictive & ML Studio"
        ],
        index=0
    )

    st.markdown("---")
    st.markdown("### 🌐 Global Scope")

    country_labels = {c: f"{c} - {COUNTRY_NAMES.get(c, c)}" for c in SUPPORTED_COUNTRIES}
    country_labels["ALL"] = "🌐 All Territories"
    country_choice = st.selectbox("Select Country", options=list(country_labels.keys()), format_func=lambda x: country_labels[x], index=0)

    cat_choice = st.selectbox("Filter Category", options=["All Categories"] + list(cat_options.keys()), index=0)
    category_id = cat_options[cat_choice] if cat_choice != "All Categories" else None

    search_query = st.text_input("🔍 Search Video Title / Channel", "")
    search_query = search_query.strip() if search_query else None

    st.markdown("---")
    st.caption("📅 **Corpus Horizon:** Apr 6, 2026 – Nov 4, 2026\n\n⚡ 361,424 observations across 10 countries.")

# ------------------------------------------------------------------------------
# MODULE 1: Executive Overview
# ------------------------------------------------------------------------------
if module == "📊 Executive Overview":
    st.title("📊 Executive Overview")
    st.caption("2026 YouTube Trending Dynamics, Audience Reach & Engagement")

    with st.spinner("Loading overview metrics..."):
        ov = get_overview(country_choice, category_id, search_query)

    kpis = ov.get("kpis", {})

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Unique Trending Videos", f"{kpis.get('unique_videos', 0):,}")
    col2.metric("Total Unique Views", f"{kpis.get('total_unique_views', 0) / 1e9:.2f} B")
    col3.metric("Avg Audience Like Rate", f"{kpis.get('avg_like_rate', 0):.2f}%")
    col4.metric("Avg Comment Rate", f"{kpis.get('avg_comment_rate', 0):.2f}%")

    st.markdown("### 📈 Daily Trending Activity & Audience Volume (2026)")
    daily_df = pd.DataFrame(ov.get("daily_activity", []))
    if not daily_df.empty:
        fig_daily = go.Figure()
        fig_daily.add_trace(go.Scatter(
            x=daily_df['dt'], y=daily_df['snapshot_count'],
            mode='lines', name='Daily Observations',
            line=dict(color='#10b981', width=2),
            fill='tozeroy', fillcolor='rgba(16, 185, 129, 0.1)'
        ))
        fig_daily.add_trace(go.Scatter(
            x=daily_df['dt'], y=daily_df['unique_videos'],
            mode='lines', name='Unique Active Videos',
            line=dict(color='#06b6d4', width=2, dash='dot')
        ))
        fig_daily.update_layout(
            template='plotly_dark',
            paper_bgcolor='#0f172a',
            plot_bgcolor='#0f172a',
            margin=dict(l=20, r=20, t=30, b=20),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_daily, use_container_width=True)

    colA, colB = st.columns(2)
    with colA:
        st.markdown("### 🏆 Top Category Reach (Unique vs Legacy Inflation)")
        cat_df = pd.DataFrame(ov.get("category_popularity", []))
        if not cat_df.empty:
            fig_cat = go.Figure()
            fig_cat.add_trace(go.Bar(
                x=cat_df['category_name'][:8], y=cat_df['unique_views'][:8],
                name='Reconciled Unique Views', marker_color='#10b981'
            ))
            fig_cat.add_trace(go.Bar(
                x=cat_df['category_name'][:8], y=cat_df['legacy_views'][:8],
                name='Legacy Inflated Snapshot Sum', marker_color='rgba(148, 163, 184, 0.4)'
            ))
            fig_cat.update_layout(
                barmode='group',
                template='plotly_dark',
                paper_bgcolor='#0f172a',
                plot_bgcolor='#0f172a',
                margin=dict(l=20, r=20, t=30, b=20),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            st.plotly_chart(fig_cat, use_container_width=True)

    with colB:
        st.markdown("### 😊 AFINN Title Sentiment Distribution")
        sent = ov.get("sentiment_summary", {})
        if sent:
            fig_sent = px.pie(
                names=list(sent.keys()),
                values=list(sent.values()),
                hole=0.45,
                color_discrete_sequence=['#06b6d4', '#10b981', '#f43f5e', '#64748b']
            )
            fig_sent.update_layout(
                template='plotly_dark',
                paper_bgcolor='#0f172a',
                margin=dict(l=20, r=20, t=30, b=20)
            )
            st.plotly_chart(fig_sent, use_container_width=True)

# ------------------------------------------------------------------------------
# MODULE 2: Trending Video Explorer
# ------------------------------------------------------------------------------
elif module == "🔥 Trending Video Explorer":
    st.title("🔥 Trending Video Explorer (2026 Trends)")
    st.caption("Longitudinal Appearance Tracking & Cultural Phenomenon Rankings")

    col_sort, col_lim = st.columns([3, 1])
    sort_by = col_sort.selectbox(
        "Sort Videos By",
        ["trend_count", "views", "likes", "like_rate", "comments", "velocity"],
        format_func=lambda x: {
            "trend_count": "Trending Longevity (Distinct Days)",
            "views": "Terminal Cumulative Views",
            "likes": "Total Likes",
            "like_rate": "Audience Like Rate (%)",
            "comments": "Comment Count",
            "velocity": "Daily View Growth Velocity"
        }[x]
    )
    limit = col_lim.selectbox("Top Videos Count", [10, 20, 50], index=1)

    with st.spinner("Fetching trending video records..."):
        trends_res = get_trends(country_choice, category_id, search_query, sort_by, limit)

    videos = trends_res.get("videos", [])
    st.markdown(f"**Found {trends_res.get('total', 0):,} unique matching videos**")

    for idx, v in enumerate(videos):
        with st.container():
            c1, c2 = st.columns([1, 3])
            with c1:
                thumb = v.get("thumbnail_link") or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
                st.image(thumb, use_container_width=True)
            with c2:
                st.markdown(f"#### #{idx+1} {v.get('title')}")
                st.markdown(f"**Channel:** `{v.get('channel_title')}` | **Category:** `{v.get('category_name')}`")
                st.markdown(f"📅 **Trending Window:** `{v.get('first_date')}` to `{v.get('last_date')}` (`{v.get('trend_duration_days')}d` duration)")
                
                m1, m2, m3, m4 = st.columns(4)
                m1.metric("Audience Views", f"{v.get('views', 0):,}")
                m2.metric("Trending Days", f"{v.get('trend_count', 0)} days")
                m3.metric("Like Rate", f"{v.get('like_rate', 0):.2f}%")
                m4.metric("Sentiment", str(v.get('sentiment_category', 'neutral')).upper())
            st.divider()

# ------------------------------------------------------------------------------
# MODULE 3: Category Intelligence
# ------------------------------------------------------------------------------
elif module == "🗂️ Category Intelligence":
    st.title("🗂️ Category Intelligence")
    st.caption("Corrected Unique Reach vs. Legacy Cumulative Snapshot Inflation")

    cat_res = get_categories(country_choice)
    cats = cat_res.get("categories", [])
    df_cats = pd.DataFrame(cats)

    if not df_cats.empty:
        st.dataframe(
            df_cats[[
                "category_name", "unique_video_count", "unique_views", "legacy_views",
                "inflation_ratio", "avg_views", "median_views", "avg_like_rate", "avg_trend_days"
            ]].rename(columns={
                "category_name": "Category",
                "unique_video_count": "Unique Videos",
                "unique_views": "Corrected Unique Reach",
                "legacy_views": "Legacy Snapshot Sum",
                "inflation_ratio": "Inflation Ratio (x)",
                "avg_views": "Mean Views",
                "median_views": "Median Views",
                "avg_like_rate": "Avg Like %",
                "avg_trend_days": "Avg Trending Days"
            }),
            use_container_width=True,
            hide_index=True
        )

        st.markdown("### 📊 Audience Share Treemap")
        fig_tree = px.treemap(
            df_cats,
            path=['category_name'],
            values='unique_views',
            color='avg_like_rate',
            color_continuous_scale='Mint',
            hover_data=['unique_video_count', 'inflation_ratio']
        )
        fig_tree.update_layout(
            template='plotly_dark',
            paper_bgcolor='#0f172a',
            margin=dict(l=10, r=10, t=10, b=10)
        )
        st.plotly_chart(fig_tree, use_container_width=True)

# ------------------------------------------------------------------------------
# MODULE 4: Engagement Analytics Lab
# ------------------------------------------------------------------------------
elif module == "🧪 Engagement Analytics Lab":
    st.title("🧪 Engagement Analytics Lab")
    st.caption("Audience Friction Ratios, Distributions & Cross-Metric Correlation Matrix")

    eng_data = get_engagement(country_choice, category_id)

    colA, colB = st.columns(2)
    with colA:
        st.markdown("### 🔬 Views vs. Likes Relationship (Log-Log Scale)")
        scat = eng_data.get("scatter_sample", [])
        if scat:
            df_scat = pd.DataFrame(scat)
            fig_scat = px.scatter(
                df_scat,
                x='views',
                y='likes',
                log_x=True,
                log_y=True,
                color='category_name',
                hover_data=['title', 'channel_title', 'like_rate']
            )
            fig_scat.update_layout(
                template='plotly_dark',
                paper_bgcolor='#0f172a',
                plot_bgcolor='#0f172a'
            )
            st.plotly_chart(fig_scat, use_container_width=True)

    with colB:
        st.markdown("### 🧮 Metric Correlation Matrix")
        corr = eng_data.get("correlations", {})
        corr_matrix = corr.get("pearson", {})
        if corr_matrix and "features" in corr_matrix:
            fig_heat = px.imshow(
                corr_matrix["matrix"],
                x=corr_matrix["features"],
                y=corr_matrix["features"],
                color_continuous_scale="Viridis",
                text_auto=".2f"
            )
            fig_heat.update_layout(
                template='plotly_dark',
                paper_bgcolor='#0f172a',
                plot_bgcolor='#0f172a'
            )
            st.plotly_chart(fig_heat, use_container_width=True)

# ------------------------------------------------------------------------------
# MODULE 5: Sentiment Intelligence
# ------------------------------------------------------------------------------
elif module == "😊 Sentiment Intelligence":
    st.title("😊 Sentiment Intelligence")
    st.caption("AFINN-111 Title Valence Analysis & Keyword Attribution")

    sent_data = get_sentiment(country_choice, category_id)

    hist_data = sent_data.get("histogram", [])
    if hist_data:
        df_hist = pd.DataFrame(hist_data)
        fig_h = px.bar(
            df_hist,
            x='score_bin',
            y='count',
            labels={'score_bin': 'AFINN Valence Score (-5 to +5)', 'count': 'Number of Unique Titles'},
            color_discrete_sequence=['#10b981']
        )
        fig_h.update_layout(
            template='plotly_dark',
            paper_bgcolor='#0f172a',
            plot_bgcolor='#0f172a'
        )
        st.plotly_chart(fig_h, use_container_width=True)

# ------------------------------------------------------------------------------
# MODULE 6: Global Country Comparison
# ------------------------------------------------------------------------------
elif module == "🌐 Global Country Comparison":
    st.title("🌐 Global Country Comparison (10 Territories)")
    st.caption("Normalized Cross-Territory Metrics Across 10 National Trending Charts")

    c_data = get_countries().get("countries", [])
    df_c = pd.DataFrame(c_data)
    if not df_c.empty:
        st.dataframe(
            df_c[[
                "country_name", "unique_videos", "avg_views", "median_views",
                "avg_like_pct", "avg_comment_pct", "distinct_days"
            ]],
            use_container_width=True,
            hide_index=True
        )

# ------------------------------------------------------------------------------
# MODULE 7: Creator Analytics
# ------------------------------------------------------------------------------
elif module == "📺 Creator Analytics":
    st.title("📺 Creator & Channel Analytics")
    st.caption("Viral Consistency, Channel Concentration & Category Focus")

    cr_data = get_creators(country_choice, category_id, limit=30).get("creators", [])
    df_cr = pd.DataFrame(cr_data)
    if not df_cr.empty:
        fig_bubble = px.scatter(
            df_cr,
            x='unique_video_count',
            y='avg_views',
            size='total_views',
            color='primary_category',
            hover_name='channel_title',
            labels={
                'unique_video_count': 'Unique Trending Videos',
                'avg_views': 'Average Views per Video'
            }
        )
        fig_bubble.update_layout(
            template='plotly_dark',
            paper_bgcolor='#0f172a',
            plot_bgcolor='#0f172a'
        )
        st.plotly_chart(fig_bubble, use_container_width=True)

# ------------------------------------------------------------------------------
# MODULE 8: Video Data Explorer
# ------------------------------------------------------------------------------
elif module == "📋 Video Data Explorer":
    st.title("📋 Video Data Explorer")
    st.caption("Server-side Paginated Repository with Instant CSV Export")

    page = st.number_input("Page", min_value=1, value=1, step=1)
    page_size = st.selectbox("Page Size", [10, 25, 50, 100], index=1)

    v_table = get_videos(country_choice, category_id, search_query, page, page_size, "views", "desc")
    videos_list = v_table.get("videos", [])
    df_v = pd.DataFrame(videos_list)

    if not df_v.empty:
        st.dataframe(df_v, use_container_width=True, hide_index=True)

        csv = df_v.to_csv(index=False).encode('utf-8')
        st.download_button(
            "📥 Download Current Table as CSV",
            data=csv,
            file_name=f"trendscope_{country_choice}_page_{page}.csv",
            mime="text/csv"
        )

# ------------------------------------------------------------------------------
# MODULE 9: Predictive & ML Studio
# ------------------------------------------------------------------------------
elif module == "🧠 Predictive & ML Studio":
    st.title("🧠 Predictive & Machine Learning Studio")
    st.caption("Supervised Continuation, Clustering & Econometric Category Forecasting")

    tab_pred, tab_tis = st.tabs(["🔮 Trend Continuation Predictor", "⚖️ What-If Trend Score Simulator (TIS)"])

    with tab_pred:
        st.markdown("### Live Trend Continuation Prediction (Day $t+1$)")
        st.caption("Calculates probability that an actively trending video survives into tomorrow's list.")

        p_col1, p_col2 = st.columns(2)
        with p_col1:
            p_views = st.number_input("Current Views", value=1500000, step=100000)
            p_likes = st.number_input("Current Likes", value=85000, step=5000)
            p_comments = st.number_input("Current Comments", value=6500, step=500)
        with p_col2:
            p_days = st.slider("Days Already Trending", 1, 30, 3)
            p_hours = st.slider("Hours Since Publish", 1, 168, 24)
            p_cat = st.selectbox("Category", [10, 24, 20, 1, 23, 17, 25], format_func=lambda x: {
                10: "Music", 24: "Entertainment", 20: "Gaming", 1: "Film", 23: "Comedy", 17: "Sports", 25: "News"
            }.get(x, str(x)))

        if st.button("🚀 Predict Continuation Probability"):
            res = MLService.predict_continuation(
                views=p_views,
                likes=p_likes,
                dislikes=int(p_likes * 0.03),
                comment_count=p_comments,
                category_id=p_cat,
                prior_trend_count=p_days,
                hours_since_publish=p_hours
            )
            prob = res.get("continuation_probability_pct", 50)
            st.success(f"**Predicted Continuation Probability:** `{prob}%` ({res.get('recommendation')})")

    with tab_tis:
        st.markdown("### Trend Intelligence Score (TIS) Custom Weights")
        st.caption("Simulate customized virality formulas across weights.")
        w_v = st.slider("Views Weight (%)", 0, 100, 30)
        w_e = st.slider("Engagement Weight (%)", 0, 100, 30)
        w_f = st.slider("Frequency Weight (%)", 0, 100, 20)
        w_vel = st.slider("Velocity Weight (%)", 0, 100, 20)

        if st.button("⚡ Re-Rank Top Videos via TIS"):
            tis_res = AnalyticsService.simulate_tis(
                country=country_choice if country_choice != "ALL" else "US",
                weight_views=w_v / 100.0,
                weight_engagement=w_e / 100.0,
                weight_frequency=w_f / 100.0,
                weight_velocity=w_vel / 100.0,
                limit=10
            )
            df_tis = pd.DataFrame(tis_res.get("ranked_videos", []))
            if not df_tis.empty:
                st.dataframe(
                    df_tis[["title", "channel_title", "views", "tis_score", "p_views", "p_eng", "p_freq"]],
                    use_container_width=True,
                    hide_index=True
                )

