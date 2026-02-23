#!/usr/bin/env python3
"""
Twitter Scraper - Mock Data Mode
Returns realistic sample tweets for UI development
Use when real scraping is blocked or during development
"""
import sys
import json
import random
from datetime import datetime, timedelta

def generate_mock_tweets(username, count=10):
    """Generate realistic mock tweets for development"""
    
    sample_tweets = [
        "Just shipped a new feature! Excited to see how users respond. 🚀",
        "The key to building great products is talking to your users every single day.",
        "Marketing without measurement is just guessing.",
        "Your biggest competitor isn't another company - it's indifference.",
        "Focus on the problem, not the solution. Everything else follows.",
        "Growth hack: Make something people actually want.",
        "The best time to start was yesterday. The second best time is now.",
        "Stop optimizing for vanity metrics. Focus on retention.",
        "Building in public has been the best decision for our startup.",
        "Cold email isn't dead. Bad cold email is dead.",
        "Every 'overnight success' is actually 5 years of hard work.",
        "Your landing page should answer one question: Why should I care?",
        "The most underrated skill in business: clear writing.",
        "Don't build features. Solve problems.",
        "Customer research beats gut feelings every time."
    ]
    
    tweets = []
    base_time = datetime.now()
    
    for i in range(min(count, len(sample_tweets))):
        # Generate semi-random engagement numbers
        likes = random.randint(50, 2500)
        retweets = int(likes * random.uniform(0.1, 0.3))
        replies = int(likes * random.uniform(0.05, 0.15))
        views = likes * random.randint(50, 200)
        
        # Calculate virality score (5-9)
        engagement_rate = (likes + retweets * 2) / max(views, 1) * 100
        if engagement_rate > 5:
            score = 9
        elif engagement_rate > 3:
            score = 8
        elif engagement_rate > 1:
            score = 7
        else:
            score = 6
        
        tweet_time = base_time - timedelta(hours=i*2)
        
        tweets.append({
            "id": f"mock_{username}_{i}_{random.randint(1000, 9999)}",
            "text": sample_tweets[i],
            "author": username,
            "url": f"https://x.com/{username}/status/mock{i}",
            "likes": likes,
            "retweets": retweets,
            "replies": replies,
            "views": views,
            "timestamp": tweet_time.isoformat(),
            "source": "mock",
            "score": score,
            "isReply": False,
            "isRetweet": False,
            "isQuote": False
        })
    
    return tweets

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python mock_tweets.py <username> [count]"}))
        sys.exit(1)
    
    username = sys.argv[1].replace('@', '').strip()
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    tweets = generate_mock_tweets(username, count)
    print(json.dumps(tweets, indent=2))
