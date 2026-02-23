import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Scrapling-based Twitter scraper endpoint
 * Serves as a fallback when Apify has no credits
 */
export async function POST(request: NextRequest) {
  try {
    const { username, maxTweets = 10 } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    console.log(`[Scrapling API] Scraping @${username} for ${maxTweets} tweets`);

    // Validate username (security)
    const cleanUsername = username.replace('@', '').trim();
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Run the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrapling_twitter.py');
    const command = `python3 "${scriptPath}" "${cleanUsername}" ${maxTweets}`;
    
    console.log(`[Scrapling API] Running: ${command}`);
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1'
      }
    });

    if (stderr) {
      console.log(`[Scrapling API] stderr: ${stderr}`);
    }

    // Parse the result
    const result = JSON.parse(stdout);

    if (result.error) {
      console.error(`[Scrapling API] Error: ${result.error}`);
      return NextResponse.json({ 
        error: result.error,
        source: 'scrapling'
      }, { status: 500 });
    }

    // Normalize to match Apify format
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

    console.log(`[Scrapling API] Retrieved ${normalizedTweets.length} tweets`);

    return NextResponse.json({ 
      tweets: normalizedTweets,
      source: 'scrapling',
      count: normalizedTweets.length
    });

  } catch (error: any) {
    console.error('[Scrapling API] Error:', error);
    
    // Check if it's a Scrapling not installed error
    if (error.message?.includes('Scrapling not installed')) {
      return NextResponse.json({ 
        error: 'Scrapling not installed',
        install: 'pip install scrapling && scrapling install',
        source: 'scrapling'
      }, { status: 503 });
    }

    return NextResponse.json({ 
      error: error.message || 'Failed to scrape',
      source: 'scrapling'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    source: 'scrapling',
    description: 'Fallback Twitter scraper using Scrapling (no API costs)'
  });
}
