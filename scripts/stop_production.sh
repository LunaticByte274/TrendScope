#!/bin/bash
# ==============================================================================
# TrendScope — Stop Production Service
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.trendscope.pid"
PORT=${PORT:-8001}

echo "Stopping TrendScope production service..."

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Killing PID $PID..."
        kill "$PID" || true
        sleep 1
    fi
    rm -f "$PID_FILE"
fi

EXISTING_PID=$(lsof -ti :$PORT || true)
if [ -n "$EXISTING_PID" ]; then
    echo "Killing process on port $PORT (PID: $EXISTING_PID)..."
    kill -9 $EXISTING_PID || true
fi

echo "TrendScope service stopped."

