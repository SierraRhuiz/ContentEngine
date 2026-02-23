#!/usr/bin/env python3
"""
Twitter Scraper using Scrapling
Fallback scraper when Apify has no credits
"""
import sys
import json
import re
from urllib.parse import urlparse

# Check if scrapling is installed
try:
    from scrapling.fetchers import StealthyFetcher
except ImportError:
    print(json.dumps({
        "error": "Scrapling not installed",
        "install": "pip install scrapling && scrapling install"
    }))
    sys.exit(1)

def scrape_twitter_profile(username, max_tweets=10):
    """
    Scrape tweets from a Twitter profile using Scrapling
    
    Args:
        username: Twitter username (without @)
        max_tweets: Maximum number of tweets to scrape
    
    Returns:
        List of tweet objects
    """
    try:
        # Clean username
        username = username.replace('@', '').strip()
        
        # Use StealthyFetcher to bypass anti-bot protection
        fetcher = StealthyFetcher(headless=True)
        
        # Fetch the profile (try both twitter.com and x.com)
        urls = [f"https://x.com/{username}", f"https://twitter.com/{username}"]
        page = None
        last_error = None
        
        for url in urls:
            try:
                page = fetcher.fetch(url)
                break
            except Exception as e:
                last_error = e
                continue
        
        if not page:
            raise last_error or Exception("Failed to fetch profile")
        
        tweets = []
        
        # Try to find tweets using various selectors
        # Twitter uses dynamic class names, so we try multiple approaches
        tweet_selectors = [
            'article[data-testid="tweet"]',
            '[data-testid="tweet"]',
            'article[role="article"]',
            'div[data-testid="cellInnerDiv"] article'
        ]
        
        tweet_elements = []
        for selector in tweet_selectors:
            tweet_elements = page.css(selector)
            if tweet_elements:
                break
        
        for idx, tweet_elem in enumerate(tweet_elements[:max_tweets]):
            try:
                # Extract tweet text
                text_selectors = [
                    'div[lang]::text',
                    '[data-testid="tweetText"]::text',
                    'div[dir="auto"]::text'
                ]
                
                text = None
                for sel in text_selectors:
                    text = tweet_elem.css(sel).get()
                    if text:
                        break
                
                if not text:
                    continue
                
                # Extract engagement metrics
                likes = 0
                retweets = 0
                replies = 0
                
                # Try to find like count
                like_elem = tweet_elem.css('[data-testid="like"]')
                if like_elem:
                    like_text = like_elem.css('::text').get()
                    if like_text:
                        likes = parse_count(like_text)
                
                # Try to find retweet count
                retweet_elem = tweet_elem.css('[data-testid="retweet"]')
                if retweet_elem:
                    retweet_text = retweet_elem.css('::text').get()
                    if retweet_text:
                        retweets = parse_count(retweet_text)
                
                # Try to find reply count
                reply_elem = tweet_elem.css('[data-testid="reply"]')
                if reply_elem:
                    reply_text = reply_elem.css('::text').get()
                    if reply_text:
                        replies = parse_count(reply_text)
                
                # Extract tweet URL
                time_elem = tweet_elem.css('time')
                tweet_url = None
                if time_elem:
                    time_parent = time_elem[0].parent
                    if time_parent and 'href' in time_parent.attrib:
                        tweet_url = f"https://twitter.com{time_parent.attrib['href']}"
                
                if not tweet_url:
                    tweet_url = f"https://twitter.com/{username}/status/{idx}"
                
                # Extract timestamp
                timestamp = None
                if time_elem:
                    timestamp = time_elem[0].attrib.get('datetime')
                
                tweets.append({
                    "id": f"scrapling_{username}_{idx}",
                    "text": text,
                    "author": username,
                    "url": tweet_url,
                    "likes": likes,
                    "retweets": retweets,
                    "replies": replies,
                    "timestamp": timestamp,
                    "views": 0,  # Twitter doesn't expose view counts easily
                    "source": "scrapling"
                })
                
            except Exception as e:
                print(f"Error parsing tweet {idx}: {e}", file=sys.stderr)
                continue
        
        return tweets
        
    except Exception as e:
        return {
            "error": str(e),
            "source": "scrapling"
        }

def parse_count(text):
    """Parse engagement count from text (e.g., '1.2K' -> 1200)"""
    if not text:
        return 0
    
    text = text.strip().replace(',', '')
    
    # Handle K/M/B suffixes
    multipliers = {'K': 1000, 'M': 1000000, 'B': 1000000000}
    
    for suffix, multiplier in multipliers.items():
        if suffix in text:
            try:
                number = float(text.replace(suffix, ''))
                return int(number * multiplier)
            except:
                return 0
    
    try:
        return int(text)
    except:
        return 0

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python scrapling_twitter.py <username> [max_tweets]"}))
        sys.exit(1)
    
    username = sys.argv[1]
    max_tweets = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    result = scrape_twitter_profile(username, max_tweets)
    print(json.dumps(result, indent=2))
