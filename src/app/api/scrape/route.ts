import { NextRequest, NextResponse } from 'next/server';
import { scrapeBlog } from '@/lib/hyperbrowser';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Scrapling-based Twitter scraper (embedded - no Apify)
 * Uses browser automation to scrape Twitter directly
 */
async function scrapeWithScrapling(username: string, maxTweets: number): Promise<any[]> {
  try {
    console.log(`[Scrape API] Scraping @${username} with Scrapling`);
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrapling_twitter.py');
    const command = `python3 "${scriptPath}" "${username}" ${maxTweets}`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minute timeout
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    
    if (stderr) {
      console.log(`[Scrapling] stderr: ${stderr}`);
    }
    
    const result = JSON.parse(stdout);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return Array.isArray(result) ? result : [];
    
  } catch (error: any) {
    console.error(`[Scrapling] Error: ${error.message}`);
    throw error;
  }
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
        const maxTweets = options?.maxTweets || options?.limit || 100;
        
        // Clean username for security
        const cleanUsername = user.replace('@', '').trim();
        if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
          return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
        }
        
        try {
          // Use Scrapling only (no Apify fallback)
          const tweets = await scrapeWithScrapling(cleanUsername, maxTweets);
          
          // Normalize to consistent format
          const normalizedTweets = tweets.map((tweet: any) => ({
            id: tweet.id || `scrapling_${cleanUsername}_${Math.random().toString(36).substr(2, 9)}`,
            content: tweet.text,
            text: tweet.text,
            author: tweet.author || cleanUsername,
            authorName: tweet.author || cleanUsername,
            authorAvatar: null,
            likes: tweet.likes || 0,
            retweets: tweet.retweets || 0,
            comments: tweet.replies || 0,
            views: tweet.views || 0,
            quotes: 0,
            bookmarks: 0,
            timestamp: tweet.timestamp || new Date().toISOString(),
            url: tweet.url || `https://twitter.com/${cleanUsername}`,
            isReply: false,
            isRetweet: false,
            isQuote: false,
            media: null,
            source: 'scrapling'
          }));
          
          console.log(`[Scrape API] Scrapling returned ${normalizedTweets.length} tweets`);
          
          return NextResponse.json({ 
            tweets: normalizedTweets,
            source: 'scrapling',
            count: normalizedTweets.length
          });
          
        } catch (error: any) {
          console.error(`[Scrape API] Scrapling failed: ${error.message}`);
          
          // Check if it's a Scrapling not installed error
          if (error.message?.includes('Scrapling not installed') || 
              error.message?.includes('No module named')) {
            return NextResponse.json({ 
              error: 'Scrapling not installed',
              install: 'pip install scrapling && scrapling install',
              setup: 'See SCRAPLING_SETUP.md'
            }, { status: 503 });
          }
          
          return NextResponse.json({ 
            error: 'Failed to scrape tweets',
            message: error.message,
            note: 'Make sure Scrapling is installed: pip install scrapling'
          }, { status: 500 });
        }
      }

      case 'blog':
      case 'seo':
      case 'competitor': {
        if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
        // Use HyperBrowser for blog scraping
        const blog = await scrapeBlog(url);
        return NextResponse.json({ blog });
      }

      case 'youtube': {
        if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
        // Note: YouTube scraping removed - no Apify
        return NextResponse.json({ 
          error: 'YouTube scraping temporarily unavailable',
          message: 'YouTube integration requires Apify or alternative setup'
        }, { status: 503 });
      }

      case 'linkedin': {
        if (!url && !username) {
          return NextResponse.json({ error: 'Missing URL or username' }, { status: 400 });
        }
        // Note: LinkedIn scraping removed - no Apify
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
    twitter_scraper: 'Scrapling (browser automation)',
    note: 'Apify integration removed - using Scrapling only'
  });
}
