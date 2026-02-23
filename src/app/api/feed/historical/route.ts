import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getLinkedInPosts } from '@/lib/apify';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Scrape Twitter using Scrapling (Python script)
 */
async function scrapeTwitterWithScrapling(username: string, maxTweets: number): Promise<any[]> {
  const scriptPath = path.join(process.cwd(), 'scripts', 'scrapling_twitter.py');
  const command = `python3 "${scriptPath}" "${username}" ${maxTweets}`;
  
  const { stdout } = await execAsync(command, {
    timeout: 120000,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });
  
  const result = JSON.parse(stdout);
  if (result.error) throw new Error(result.error);
  return Array.isArray(result) ? result : [];
}

/**
 * POST /api/feed/historical
 * Fetch historical posts for an account and store them
 * Body: { accountId, limit?, days? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, limit = 100 } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('monitored_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    let posts: any[] = [];
    let insertCount = 0;

    // Fetch posts based on platform
    if (account.platform === 'twitter') {
      // Use Scrapling for Twitter scraping
      const tweets = await scrapeTwitterWithScrapling(account.username, limit);

      posts = tweets.map((tweet) => ({
        account_id: accountId,
        platform: 'twitter',
        external_id: tweet.id || `scrapling_${Date.now()}_${Math.random()}`,
        content: tweet.text,
        author_username: tweet.author || account.username,
        author_name: tweet.author || account.display_name,
        url: tweet.url || `https://twitter.com/${account.username}`,
        posted_at: tweet.timestamp || new Date().toISOString(),
        engagement: {
          likes: tweet.likes || 0,
          retweets: tweet.retweets || 0,
          comments: tweet.replies || 0,
          views: tweet.views || 0,
        },
        metadata: {
          source: 'scrapling',
        },
        is_new: true,
      }));
    } else if (account.platform === 'linkedin') {
      const profileUrl = account.profile_url || `https://www.linkedin.com/in/${account.username}`;
      const linkedInPosts = await getLinkedInPosts([profileUrl]);

      posts = linkedInPosts.map((post) => ({
        account_id: accountId,
        platform: 'linkedin',
        external_id: post.urn,
        content: post.text,
        author_username: post.authorProfileId || account.username,
        author_name: post.authorFullName || account.display_name,
        url: post.url,
        posted_at: post.postedAtISO,
        engagement: {
          likes: post.reactions?.length || 0,
          comments: post.comments?.length || 0,
          shares: 0,
        },
        metadata: {
          isRepost: post.isRepost,
          type: post.type,
          images: post.images,
          authorHeadline: post.authorHeadline,
        },
        is_new: true,
      }));

      // Update account with author info if available
      if (linkedInPosts[0]) {
        await supabase
          .from('monitored_accounts')
          .update({
            display_name: linkedInPosts[0].authorFullName,
            profile_url: linkedInPosts[0].authorProfileUrl,
          })
          .eq('id', accountId);
      }
    }

    // Insert posts (upsert to avoid duplicates)
    if (posts.length > 0) {
      const { error: insertError, count } = await supabase
        .from('scraped_content')
        .upsert(posts, {
          onConflict: 'account_id,external_id',
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error('Error inserting posts:', insertError);
      } else {
        insertCount = count || posts.length;
      }
    }

    // Update last scraped time
    await supabase
      .from('monitored_accounts')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', accountId);

    return NextResponse.json({
      success: true,
      account: account.username,
      platform: account.platform,
      fetched: posts.length,
      inserted: insertCount,
    });
  } catch (error: any) {
    console.error('Historical fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
