#!/usr/bin/env python3
"""
Twitter Scraper using Scrapling - HTTP-only version (no browser)
Falls back to simple HTTP requests when browser automation fails
"""
import sys
import json
import re

try:
    from scrapling.fetchers import Fetcher
except ImportError:
    print(json.dumps({
        "error": "Scrapling not installed",
        "install": "pip install scrapling"
    }))
    sys.exit(1)

def scrape_twitter_http(username, max_tweets=10):
    """
    Scrape tweets using HTTP requests (no browser automation)
    More reliable but may be blocked by Twitter's anti-bot
    """
    try:
        username = username.replace('@', '').strip()
        
        # Use Fetcher (HTTP requests) instead of StealthyFetcher (browser)
        fetcher = Fetcher(impersonate='chrome')
        
        # Try to fetch the profile
        url = f"https://x.com/{username}"
        
        try:
            page = fetcher.get(url)
        except Exception as e:
            # Try twitter.com as fallback
            url = f"https://twitter.com/{username}"
            page = fetcher.get(url)
        
        tweets = []
        
        # Look for tweet text in the HTML
        # Twitter embeds initial data in the HTML
        html = page.text
        
        # Try to extract tweets from HTML
        # Look for tweet text patterns
        tweet_patterns = [
            r'<div[^>]*lang="[^"]*"[^>]*>(.*?)</div>',  # Tweet text containers
            r'<span[^>]*>([^<]{10,280})</span>',  # Possible tweet texts
        ]
        
        found_texts = []
        for pattern in tweet_patterns:
            matches = re.findall(pattern, html, re.DOTALL)
            for match in matches:
                # Clean up HTML entities
                text = re.sub(r'<[^>]+>', '', match)
                text = text.strip()
                if len(text) > 10 and text not in found_texts:
                    found_texts.append(text)
                    if len(found_texts) >= max_tweets:
                        break
            if len(found_texts) >= max_tweets:
                break
        
        # Create tweet objects from found texts
        for idx, text in enumerate(found_texts[:max_tweets]):
            tweets.append({
                "id": f"http_{username}_{idx}_{hash(text) % 10000}",
                "text": text,
                "author": username,
                "url": f"https://x.com/{username}",
                "likes": 0,
                "retweets": 0,
                "replies": 0,
                "views": 0,
                "timestamp": None,
                "source": "scrapling_http"
            })
        
        return tweets
        
    except Exception as e:
        return {
            "error": str(e),
            "source": "scrapling_http",
            "note": "Twitter may be blocking HTTP requests. Try using a different network or VPN."
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python scrapling_http.py <username> [max_tweets]"}))
        sys.exit(1)
    
    username = sys.argv[1]
    max_tweets = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    result = scrape_twitter_http(username, max_tweets)
    print(json.dumps(result, indent=2))
