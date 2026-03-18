# Scrapling Fix & Setup Guide

## CURRENT ISSUE
Scrapling is set up but not working correctly for Twitter scraping. The fallback from Apify → Scrapling isn't triggering properly.

## ROOT CAUSE ANALYSIS

### Issue 1: Python Environment
Scrapling requires Python 3.8+ and specific browser dependencies that may not be installed on your new MacBook.

### Issue 2: Path Resolution
The Node.js `exec()` may not find `python3` or `scrapling` in the PATH.

### Issue 3: Twitter Anti-Bot
Twitter/X actively blocks scrapers. Scrapling's StealthyFetcher helps but isn't 100% reliable.

---

## FIX STEP-BY-STEP

### Step 1: Run Setup Script on New MacBook

```bash
cd /Users/deigo/Downloads/ContentEngine
chmod +x scripts/setup-scrapling.sh
./scripts/setup-scrapling.sh
```

This will:
- Install Python3 if missing
- Install Scrapling via pip
- Install browser dependencies
- Test the scraper

### Step 2: Verify Installation

```bash
# Check Python
python3 --version  # Should show 3.8+

# Check Scrapling
python3 -c "from scrapling.fetchers import StealthyFetcher; print('OK')"

# Check browsers
python3 -m scrapling install --check
```

### Step 3: Test Direct Script

```bash
cd /Users/deigo/Downloads/ContentEngine
python3 scripts/scrapling_twitter.py elonmusk 3
```

Should output JSON with tweets or an error message.

### Step 4: Test API Endpoint

```bash
# Start server if not running
curl -X POST http://localhost:3000/api/scrape/scrapling \
  -H 'Content-Type: application/json' \
  -d '{"username": "elonmusk", "maxTweets": 3}'
```

---

## ALTERNATIVE: Improved Scrapling Route

If the current route isn't working, replace `src/app/api/scrape/scrapling/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { username, maxTweets = 10 } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    const cleanUsername = username.replace('@', '').trim();
    
    // Use spawn instead of exec for better control
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrapling_twitter.py');
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', [scriptPath, cleanUsername, String(maxTweets)], {
        timeout: 60000,
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (stderr) {
          console.log('[Scrapling stderr]:', stderr);
        }

        try {
          const result = JSON.parse(stdout);
          
          if (result.error) {
            resolve(NextResponse.json({ 
              error: result.error,
              source: 'scrapling'
            }, { status: 500 }));
            return;
          }

          const normalizedTweets = Array.isArray(result) ? result.map((tweet: any) => ({
            id: tweet.id,
            text: tweet.text,
            author: tweet.author,
            url: tweet.url,
            likes: tweet.likes || 0,
            retweets: tweet.retweets || 0,
            comments: tweet.replies || 0,
            views: tweet.views || 0,
            timestamp: tweet.timestamp,
            source: 'scrapling'
          })) : [];

          resolve(NextResponse.json({ 
            tweets: normalizedTweets,
            source: 'scrapling',
            count: normalizedTweets.length
          }));
        } catch (e) {
          resolve(NextResponse.json({ 
            error: 'Failed to parse scraper output',
            stderr: stderr || 'No stderr',
            stdout: stdout || 'No stdout',
            exitCode: code,
            source: 'scrapling'
          }, { status: 500 }));
        }
      });

      pythonProcess.on('error', (error) => {
        resolve(NextResponse.json({ 
          error: `Failed to start Python: ${error.message}`,
          hint: 'Is Python3 installed?',
          source: 'scrapling'
        }, { status: 500 }));
      });
    });

  } catch (error: any) {
    console.error('[Scrapling API] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to scrape',
      source: 'scrapling'
    }, { status: 500 });
  }
}
```

---

## FALLBACK STRATEGY

If Scrapling continues to fail, implement this priority chain:

```
1. Apify API (primary)
2. Scrapling (fallback 1)
3. Playwright (fallback 2) ← Add this
4. Mock data (last resort)
```

### Add Playwright as Fallback 2

Create `src/app/api/scrape/playwright/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
  try {
    const { username, maxTweets = 10 } = await request.json();
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`https://x.com/${username}`);
    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 });
    
    const tweets = await page.evaluate((max) => {
      const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
      return Array.from(tweetElements).slice(0, max).map((el) => {
        const textEl = el.querySelector('[data-testid="tweetText"]');
        return {
          text: textEl?.textContent || '',
          // ... extract other fields
        };
      });
    }, maxTweets);
    
    await browser.close();
    
    return NextResponse.json({ tweets, source: 'playwright' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, source: 'playwright' }, { status: 500 });
  }
}
```

Install Playwright:
```bash
npm install playwright
npx playwright install chromium
```

---

## QUICK TEST

After setup, test the full chain:

```bash
# 1. Test Scrapling directly
python3 scripts/scrapling_twitter.py elonmusk 3

# 2. Test via API
curl -X POST http://localhost:3000/api/scrape/scrapling \
  -H 'Content-Type: application/json' \
  -d '{"username": "elonmusk", "maxTweets": 3}'

# 3. Check Scout feed tracks the account
```

---

## DEBUGGING

If it still doesn't work:

1. **Check Python path:**
   ```bash
   which python3
   which pip3
   ```

2. **Check Scrapling location:**
   ```bash
   pip3 show scrapling
   python3 -c "import scrapling; print(scrapling.__file__)"
   ```

3. **Run with debug output:**
   ```bash
   cd /Users/deigo/Downloads/ContentEngine
   python3 -u scripts/scrapling_twitter.py elonmusk 1 2>&1
   ```

4. **Check server logs:**
   ```bash
   tail -f /tmp/contentengine-server.log
   ```

---

## NEXT STEPS

1. Run setup script on new MacBook
2. Test direct Python script
3. Test API endpoint
4. If Scrapling fails, add Playwright fallback
5. Update Scout to use fallback chain

**Ready to run the setup script?**
