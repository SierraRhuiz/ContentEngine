import { NextRequest, NextResponse } from 'next/server';
import { scrapeBlog } from '@/lib/hyperbrowser';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Try to scrape with Scrapling, fall back to mock data
 */
async function scrapeTwitter(username: string, maxTweets: number, useMock: boolean = false): Promise<any> {
  // If mock mode is enabled, return mock data immediately
  if (useMock) {
    console.log(`[Scrape API] Using mock data for @${username}`);
    return getMockTweets(username, maxTweets);
  }
  
  // Try Scrapling first
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrapling_twitter.py');
    const command = `python3 "${scriptPath}" "${username}" ${maxTweets}`;
    
    const { stdout } = await execAsync(command, {
      timeout: 60000,
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    
    const result = JSON.parse(stdout);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (Array.isArray(result) && result.length > 0) {
      return { tweets: result, source: 'scrapling' };
    }
    
    throw new Error('No tweets returned from Scrapling');
    
  } catch (error: any) {
    console.log(`[Scrape API] Scrapling failed: ${error.message}`);
    
    // Check if Scrapling is not installed
    if (error.message?.includes('not installed') || error.message?.includes('No module named')) {
      return { 
        error: 'Scrapling not installed',
        tweets: getMockTweets(username, maxTweets),
        source: 'mock',
        warning: 'Using mock data. Install Scrapling: pip install scrapling'
      };
    }
    
    // Network/scraping failed - return mock data
    return {
      tweets: getMockTweets(username, maxTweets),
      source: 'mock',
      warning: 'Twitter scraping blocked on your network. Using mock data for development.'
    };
  }
}

/**
 * Generate mock tweets for development
 */
function getMockTweets(username: string, count: number): any[] {
  const samples = [
    "Just shipped a new feature! Excited to see how users respond.",
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
  ];
  
  const tweets = [];
  const now = new Date();
  
  for (let i = 0; i < Math.min(count, samples.length); i++) {
    const likes = Math.floor(Math.random() * 2500) + 50;
    const retweets = Math.floor(likes * 0.2);
    const replies = Math.floor(likes * 0.1);
    const views = likes * 100;
    
    // Calculate score based on engagement
    const engagementRate = ((likes + retweets * 2) / views) * 100;
    const score = engagementRate > 5 ? 9 : engagementRate > 3 ? 8 : engagementRate > 1 ? 7 : 6;
    
    tweets.push({
      id: `mock_${username}_${i}_${Math.floor(Math.random() * 10000)}`,
      text: samples[i],
      author: username,
      url: `https://x.com/${username}/status/mock${i}`,
      likes,
      retweets,
      replies,
      views,
      timestamp: new Date(now.getTime() - i * 2 * 60 * 60 * 1000).toISOString(),
      source: 'mock',
      score,
      isReply: false,
      isRetweet: false,
      isQuote: false
    });
  }
  
  return tweets;
}

export async function POST(request: NextRequest) {
  try {
    const { type, url, username, options } = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }

    console.log(`[Scrape API] ${type}: ${url || username}`);

    switch (type) {
      case 'twitter': {
        const user = username || extractUsername(url);
        const maxTweets = options?.maxTweets || 10;
        const useMock = options?.mock === true;
        
        // Clean username
        const cleanUsername = user.replace('@', '').trim();
        if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
          return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
        }
        
        const result = await scrapeTwitter(cleanUsername, maxTweets, useMock);
        
        if (result.error && !result.tweets) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        
        return NextResponse.json({
          tweets: result.tweets,
          source: result.source,
          warning: result.warning,
          count: result.tweets.length
        });
      }

      case 'blog':
      case 'seo':
      case 'competitor': {
        if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
        const blog = await scrapeBlog(url);
        return NextResponse.json({ blog });
      }

      case 'youtube': {
        return NextResponse.json({ 
          error: 'YouTube scraping temporarily unavailable',
          message: 'YouTube integration requires Apify or alternative setup'
        }, { status: 503 });
      }

      case 'linkedin': {
        return NextResponse.json({ 
          error: 'LinkedIn scraping temporarily unavailable',
          message: 'LinkedIn integration requires Apify or alternative setup'
        }, { status: 503 });
      }

      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Scrape API] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scrape' }, { status: 500 });
  }
}

function extractUsername(input: string): string {
  if (!input) return '';
  const match = input.match(/(?:x\.com|twitter\.com)\/([^/?]+)/);
  return match ? match[1] : input.replace('@', '');
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    twitter_scraper: 'Scrapling + Mock fallback',
    note: 'Real scraping blocked? Use option mock:true for development data'
  });
}
