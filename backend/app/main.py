import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import metadata, overview, trends, categories, engagement, sentiment, countries, creators, videos, models, data_quality, export

app = FastAPI(
    title="TrendScope API",
    description="YouTube Trend Intelligence & Predictive Analytics Platform Backend API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(metadata.router, prefix="/api")
app.include_router(overview.router, prefix="/api")
app.include_router(trends.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(engagement.router, prefix="/api")
app.include_router(sentiment.router, prefix="/api")
app.include_router(countries.router, prefix="/api")
app.include_router(creators.router, prefix="/api")
app.include_router(videos.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(data_quality.router, prefix="/api")
app.include_router(export.router, prefix="/api")

# Serve built frontend if available
FRONTEND_DIST = os.environ.get(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
)
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            return {"error": "Not Found"}
        target = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
