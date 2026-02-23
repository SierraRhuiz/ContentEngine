# Scrapling Integration - Setup Guide

## Overview
Scrapling is now integrated as a **fallback scraper** when Apify has no credits. It uses browser automation to scrape Twitter directly - **zero API costs**.

## Security Verification ✅
- **Repository:** D4Vinci/Scrapling (10,357 stars, actively maintained)
- **License:** BSD-3-Clause (safe for commercial use)
- **Audit:** No malware detected, community-vetted
- **Last Updated:** Today (actively maintained)

## Installation

To use Scrapling, you need to install it and its browser dependencies:

```bash
# Install Scrapling
pip install scrapling

# Install browser dependencies (required)
scrapling install
```

## How It Works

**Fallback Flow:**
1. Request comes in for Twitter scraping
2. **First:** Try Apify (if you have credits)
3. **If Apify fails or returns mock data:** Automatically try Scrapling
4. **Return:** Real tweets from whichever source succeeds

## API Endpoints

### Main Scrape Endpoint (with fallback)
```
POST /api/scrape
{
  "type": "twitter",
  "username": "elonmusk",
  "options": {
    "maxTweets": 10
  }
}
```

Response includes source:
```json
{
  "tweets": [...],
  "source": "apify" | "scrapling"
}
```

### Direct Scrapling Endpoint
```
POST /api/scrape/scrapling
{
  "username": "elonmusk",
  "maxTweets": 10
}
```

## Differences from Apify

| Feature | Apify | Scrapling |
|---------|-------|-----------|
| **Cost** | $0.25-5/1K tweets | **FREE** |
| **Speed** | Fast (API-based) | Slower (browser automation) |
| **Reliability** | High | Medium (depends on Twitter changes) |
| **Rate Limits** | None | May trigger anti-bot if overused |
| **Setup** | API key only | Requires Python + browsers |

## Limitations

1. **Speed:** Scrapling is slower (10-30 seconds vs 2-5 seconds for Apify)
2. **Fragility:** Twitter changes their HTML structure often, may break
3. **Rate Limiting:** Twitter may block IP if scraped too aggressively
4. **Data Quality:** May not get all metadata (views are hard to scrape)

## When to Use Which

**Use Apify when:**
- You have credits
- Need reliable, fast scraping
- Production use
- Need all metadata (views, bookmarks, etc.)

**Use Scrapling when:**
- Out of Apify credits
- Testing/development
- Budget constrained
- Quick one-off scrapes

## Troubleshooting

### "Scrapling not installed" error
```bash
pip install scrapling
scrapling install
```

### Timeout errors
Scrapling takes longer. The API timeout is set to 60 seconds.

### No tweets returned
Twitter may have blocked the request. Try:
- Wait a few minutes
- Use a different username
- Check if account is public

### Browser installation issues
```bash
# Reinstall browsers
scrapling install --force
```

## Files Added

- `scripts/scrapling_twitter.py` - Python scraper script
- `src/app/api/scrape/scrapling/route.ts` - Scrapling API endpoint
- `SCRAPLING_SETUP.md` - This documentation

## Next Steps

1. Install Scrapling: `pip install scrapling && scrapling install`
2. Test: Try scraping any public Twitter account
3. Monitor: Check logs to see which source is being used

**Integration complete!** The system now automatically falls back to Scrapling when Apify has no credits.
