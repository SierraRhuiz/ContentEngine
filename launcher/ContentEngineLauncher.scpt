-- Content Engine Launcher
-- Double-click to start server and open browser

set scriptPath to POSIX path of (path to home folder as string) & ".openclaw/workspace/contentengine/launcher/start-content-engine.sh"

tell application "Terminal"
    activate
    do script scriptPath
end tell

delay 2

tell application "Safari"
    activate
    open location "http://localhost:3000"
end tell
