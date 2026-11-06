# ==============================================================================
# TrendScope — Production Multi-Stage Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React Frontend Application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Python Backend & Analytics Engine
# ------------------------------------------------------------------------------
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application source code and cleaned 2026 data assets
COPY backend/ ./backend/
COPY data/clean/ ./data/clean/

# Copy pre-built frontend distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist/

WORKDIR /app/backend
ENV PYTHONPATH=/app/backend
ENV PORT=8001
ENV HOST=0.0.0.0

EXPOSE 8001

# Healthcheck to ensure API and DuckDB views are ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/metadata || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host ${HOST} --port ${PORT}"]
