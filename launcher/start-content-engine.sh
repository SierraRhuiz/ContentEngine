#!/bin/bash
# Content Engine Launcher

PROJECT_DIR="$HOME/.openclaw/workspace/contentengine"
PID_FILE="/tmp/content-engine.pid"

# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Server already running on http://localhost:3000"
else
    echo "🚀 Starting Content Engine..."
    cd "$PROJECT_DIR"
    nohup npm run dev > /tmp/content-engine.log 2>&1 &
    echo $! > "$PID_FILE"
    sleep 3
    echo "✅ Server started on http://localhost:3000"
fi

# Open browser
open "http://localhost:3000"
