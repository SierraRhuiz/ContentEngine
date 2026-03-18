#!/bin/bash
# ContentEngine Scrapling Setup & Fix Script
# Run this on your new MacBook to properly set up Scrapling

echo "=== ContentEngine Scrapling Setup ==="
echo ""

# 1. Check if Python is installed
echo "1. Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "   ❌ Python3 not found. Installing..."
    brew install python3
else
    echo "   ✅ Python3 found: $(python3 --version)"
fi

# 2. Check if pip is installed
echo ""
echo "2. Checking pip..."
if ! command -v pip3 &> /dev/null; then
    echo "   ❌ pip3 not found. Installing..."
    python3 -m ensurepip --upgrade
else
    echo "   ✅ pip3 found"
fi

# 3. Install Scrapling
echo ""
echo "3. Installing Scrapling..."
pip3 install --user scrapling
if [ $? -ne 0 ]; then
    echo "   ⚠️  User install failed, trying global..."
    pip3 install scrapling
fi

# 4. Install browser dependencies
echo ""
echo "4. Installing browser dependencies..."
python3 -m scrapling install

# 5. Verify installation
echo ""
echo "5. Verifying installation..."
python3 -c "from scrapling.fetchers import StealthyFetcher; print('   ✅ Scrapling installed correctly')"
if [ $? -ne 0 ]; then
    echo "   ❌ Scrapling installation failed"
    exit 1
fi

# 6. Test the script
echo ""
echo "6. Testing Scrapling script..."
cd /Users/deigo/Downloads/ContentEngine
python3 scripts/scrapling_twitter.py elonmusk 1

echo ""
echo "=== Setup Complete ==="
echo "Scrapling is now ready to use as a fallback scraper"
echo ""
echo "To test the API endpoint:"
echo "  curl -X POST http://localhost:3000/api/scrape/scrapling \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"username\": \"elonmusk\", \"maxTweets\": 5}'"
