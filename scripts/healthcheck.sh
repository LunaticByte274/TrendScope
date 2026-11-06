#!/bin/bash
# ==============================================================================
# TrendScope — Healthcheck Script
# ==============================================================================

PORT=${PORT:-8001}
BASE_URL="http://127.0.0.1:$PORT"

echo "Running TrendScope Health Checks on $BASE_URL..."

check_endpoint() {
    local name="$1"
    local url="$2"
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status" = "200" ]; then
        echo "  [PASS] $name ($status)"
    else
        echo "  [FAIL] $name (HTTP $status)"
        return 1
    fi
}

FAILED=0
check_endpoint "Frontend Root" "$BASE_URL/" || FAILED=1
check_endpoint "Metadata API" "$BASE_URL/api/metadata" || FAILED=1
check_endpoint "Executive Overview API" "$BASE_URL/api/overview?country=US" || FAILED=1
check_endpoint "Trending Videos API" "$BASE_URL/api/trends?country=US&limit=5" || FAILED=1
check_endpoint "Category Intelligence API" "$BASE_URL/api/categories?country=US" || FAILED=1
check_endpoint "Engagement Lab API" "$BASE_URL/api/engagement?country=US" || FAILED=1
check_endpoint "Sentiment Intelligence API" "$BASE_URL/api/sentiment?country=US" || FAILED=1
check_endpoint "Global Countries API" "$BASE_URL/api/countries" || FAILED=1
check_endpoint "Creator Analytics API" "$BASE_URL/api/creators?country=US&limit=5" || FAILED=1
check_endpoint "Video Explorer Table API" "$BASE_URL/api/videos?country=US&page=1&page_size=5" || FAILED=1
check_endpoint "Swagger Docs" "$BASE_URL/docs" || FAILED=1

if [ $FAILED -eq 0 ]; then
    echo "All health checks passed successfully!"
    exit 0
else
    echo "Some health checks failed."
    exit 1
fi

