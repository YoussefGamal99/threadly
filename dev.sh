#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$DIR/backend"
FRONTEND_DIR="$DIR/frontend"

echo "=================================================="
echo "    THREADLY ATELIER — AI STYLIST & CLOTHING STORE"
echo "=================================================="

# 1. Setup backend .env if missing
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "[!] No backend/.env found. Creating from .env.example..."
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo "[!] Please ensure GROQ_API_KEY is configured in backend/.env"
fi

# 2. Seed database if missing
if [ ! -f "$BACKEND_DIR/data/store.db" ]; then
    echo "[*] Seeding store catalog & vector store..."
    (cd "$BACKEND_DIR" && uv run python -m app.db.seed --reset)
    (cd "$BACKEND_DIR" && uv run python -m app.db.generate_images)
fi

cleanup() {
    echo ""
    echo "[*] Shutting down Threadly services..."
    kill $(jobs -p) 2>/dev/null || true
    wait 2>/dev/null || true
    echo "[✓] Stopped."
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Start Backend
echo "[*] Starting FastAPI backend on http://localhost:8000 ..."
(cd "$BACKEND_DIR" && uv run uvicorn app.main:app --port 8000 --reload) &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# 4. Start Frontend
echo "[*] Starting React Vite frontend on http://localhost:5173 ..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo " [✓] Threadly is running!"
echo "     → Storefront UI: http://localhost:5173"
echo "     → API & Docs:    http://localhost:8000/docs"
echo " Press Ctrl+C to stop both servers."
echo "=================================================="

wait
