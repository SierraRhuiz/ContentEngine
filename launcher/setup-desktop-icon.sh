#!/bin/bash
# Content Engine Desktop Icon Creator
# Run this to add Content Engine to your Dock

# Add to Dock using dockutil if available
if command -v dockutil >/dev/null 2>&1; then
    dockutil --add ~/Desktop/Content\ Engine.app --replacing "Content Engine"
    echo "✅ Added to Dock"
else
    echo "💡 To add to Dock: Drag Content Engine.app from Desktop to Dock"
fi

# Create alias for Terminal use
echo 'alias content-engine="~/.openclaw/workspace/contentengine/launcher/start-content-engine.sh"' >> ~/.zshrc
echo "✅ Added 'content-engine' alias to your shell"

# Make sure the script is executable
chmod +x ~/.openclaw/workspace/contentengine/launcher/start-content-engine.sh

# Set app icon (optional - uses generic gear icon)
echo "✅ Content Engine app created on Desktop"
echo ""
echo "USAGE:"
echo "  • Double-click 'Content Engine' on Desktop to launch"
echo "  • Or run: content-engine (in Terminal)"
echo ""
echo "The app will:"
echo "  1. Start the server (if not running)"
echo "  2. Open Safari to http://localhost:3000"
