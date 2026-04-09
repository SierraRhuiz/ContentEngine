#!/bin/bash
# ContentEngine Auto-Sync Script
# Watches for GitHub changes and auto-pulls

REPO_DIR="$HOME/.openclaw/workspace/contentengine"  # Correct code location
LOG_FILE="$HOME/.contentengine-sync.log"

cd "$REPO_DIR" || exit 1

echo "[$(date)] Starting ContentEngine watch-sync..." | tee -a "$LOG_FILE"

while true; do
    # Fetch from GitHub (check for changes)
    git fetch origin main 2>/dev/null
    
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "[$(date)] Changes detected on GitHub, pulling..." | tee -a "$LOG_FILE"
        git pull origin main 2>&1 | tee -a "$LOG_FILE"
        echo "[$(date)] ✅ Synced! Next.js should auto-reload." | tee -a "$LOG_FILE"
        echo "---" >> "$LOG_FILE"
    fi
    
    # Check every 30 seconds
    sleep 30
done
