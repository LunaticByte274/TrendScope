#!/bin/bash
set -e

# ==============================================================================
# TrendScope — Production Deployment & Service Runner
# ==============================================================================

PORT=${PORT:-8001}
HOST=${HOST:-0.0.0.0}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.trendscope.pid"
LOG_FILE="$ROOT_DIR/trendscope_production.log"

echo "=========================================================="
echo "🚀 Deploying TrendScope Production Platform"
echo "=========================================================="
echo "Root directory: $ROOT_DIR"
echo "Target port:    $PORT"
echo "Target host:    $HOST"

# 1. Check Python virtual environment
if [ ! -d "$ROOT_DIR/.venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$ROOT_DIR/.venv"
    "$ROOT_DIR/.venv/bin/pip" install --upgrade pip
    "$ROOT_DIR/.venv/bin/pip" install -r "$ROOT_DIR/backend/requirements.txt"
fi

PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
UVICORN_BIN="$ROOT_DIR/.venv/bin/uvicorn"

# 2. Build React Production Frontend
echo "📦 Building optimized React frontend bundle..."
cd "$ROOT_DIR/frontend"
npm run build
echo "✅ Frontend bundle built in frontend/dist"

# 3. Stop any existing running instance
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Stopping existing instance (PID: $OLD_PID)..."
        kill "$OLD_PID" || true
        sleep 1
    fi
    rm -f "$PID_FILE"
fi

# Also check if port is currently occupied and free it
EXISTING_PID=$(lsof -ti :$PORT || true)
if [ -n "$EXISTING_PID" ]; then
    echo "Freeing port $PORT (PID: $EXISTING_PID)..."
    kill -9 $EXISTING_PID || true
    sleep 1
fi

# 4. Start Production Server
echo "🌐 Starting TrendScope unified production server..."
cd "$ROOT_DIR/backend"
PYTHONPATH=. nohup "$UVICORN_BIN" app.main:app \
    --host "$HOST" \
    --port "$PORT" \
    --workers 1 \
    --log-level info \
    > "$LOG_FILE" 2>&1 &

NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"
echo "Started server with PID $NEW_PID (logs: $LOG_FILE)"

# 5. Health Check
echo "⏳ Waiting for service to be healthy..."
for i in {1..30}; do
    if curl -s "http://127.0.0.1:$PORT/api/metadata" > /dev/null 2>&1; then
        echo "=========================================================="
        echo "🎉 TrendScope Production Service is LIVE!"
        echo "=========================================================="
        echo "👉 URL:       http://localhost:$PORT"
        echo "👉 API:       http://localhost:$PORT/api/overview?country=US"
        echo "👉 Docs:      http://localhost:$PORT/docs"
        echo "👉 Logs:      $LOG_FILE"
        echo "👉 PID File:  $PID_FILE"
        echo "=========================================================="
        exit 0
    fi
    sleep 0.5
done

echo "⚠️ Service did not respond within 15 seconds. Please check logs at: $LOG_FILE"
exit 1

