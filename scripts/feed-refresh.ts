// Standalone cron script for feed refresh
// 
// This script is designed to run on Railway cron jobs.
// Schedule: "*/30 * * * *" (every 30 minutes)
// Command: npx tsx scripts/feed-refresh.ts

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APIFY_TOKEN = process.env.APIFY_TOKEN || process.env.APIFY_API_KEY || '';

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[Feed Refresh] Missing Supabase configuration');
  process.exit(1);
}

if (!APIFY_TOKEN) {
  console.error('[Feed Refresh] Missing APIFY_TOKEN');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Apify configuration
const APIFY_BASE_URL = 'https://api.apify.com/v2';
const ACTORS = {
  twitter_tweet: 'kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest',
  linkedin_post: 'curious_coder/linkedin-post-search-scraper',
};

interface MonitoredAccount {
  id: string;
  platform: 'twitter' | 'linkedin';
  username: string;
  is_own_account: boolean;
  last_scraped_at: string | null;
  scrape_interval_minutes: number;
}

interface ScrapedPost {
  account_id: string;
  platform: string;
  post_id: string;
  content: string;
  url: string;
  author_name: string;
  author_avatar: string | null;
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  is_new: boolean;
}

/**
 * Run an Apify actor and get results
 */
async function runApifyActor(actorId: string, input: Record<string, any>): Promise<any[]> {
  console.log(`[Apify] Starting actor: ${actorId}`);
  
  // Start the actor
  const startResponse = await fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!startResponse.ok) {
    const error = await startResponse.text();
    throw new Error(`Failed to start actor: ${error}`);
  }

  const startData = await startResponse.json();
  const runId = startData.data.id;
  console.log(`[Apify] Run started: ${runId}`);

  // Poll for completion
  const maxWaitMs = 120000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const statusResponse = await fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs/${runId}`, {
      headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` },
    });

    const statusData = await statusResponse.json();
    const status = statusData.data.status;

    if (status === 'SUCCEEDED') {
      // Get results from dataset
      const datasetResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}/dataset/items`, {
        headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` },
      });

      if (datasetResponse.ok) {
        const items = await datasetResponse.json();
        console.log(`[Apify] Retrieved ${Array.isArray(items) ? items.length : 0} items`);
        return Array.isArray(items) ? items : [];
      }
      return [];
    }

    if (status === 'FAILED' || status === 'TIMED-OUT' || status === 'ABORTED') {
      throw new Error(`Actor run ${status}: ${statusData.data.errorMessage || 'Unknown error'}`);
    }

    // Wait 2 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Actor run timed out');
}

/**
 * Fetch Twitter posts for an account
 */
async function fetchTwitterPosts(username: string, maxItems: number = 20): Promise<any[]> {
  console.log(`[Twitter] Fetching posts for @${username}`);
  
  const input = {
    from: username.replace('@', ''),
    maxItems,
    queryType: 'Latest',
    'filter:replies': false,
  };

  try {
    const tweets = await runApifyActor(ACTORS.twitter_tweet, input);
    return tweets;
  } catch (error) {
    console.error(`[Twitter] Error fetching @${username}:`, error);
    return [];
  }
}

/**
 * Fetch LinkedIn posts for an account
 */
async function fetchLinkedInPosts(profileUrl: string, limit: number = 20): Promise<any[]> {
  console.log(`[LinkedIn] Fetching posts for ${profileUrl}`);
  
  const input = {
    startUrls: [profileUrl],
    limit,
  };

  try {
    const posts = await runApifyActor(ACTORS.linkedin_post, input);
    return posts;
  } catch (error) {
    console.error(`[LinkedIn] Error fetching ${profileUrl}:`, error);
    return [];
  }
}

/**
 * Process a single account
 */
async function processAccount(account: MonitoredAccount): Promise<number> {
  console.log(`\n[Processing] @${account.username} (${account.platform})`);
  
  let posts: any[] = [];
  
  if (account.platform === 'twitter') {
    posts = await fetchTwitterPosts(account.username);
  } else if (account.platform === 'linkedin') {
    const profileUrl = `https://www.linkedin.com/in/${account.username}`;
    posts = await fetchLinkedInPosts(profileUrl);
  }

  if (posts.length === 0) {
    console.log(`[Processing] No new posts found for @${account.username}`);
    return 0;
  }

  // Transform posts for database
  const scrapedPosts: ScrapedPost[] = posts.map((post) => {
    if (account.platform === 'twitter') {
      return {
        account_id: account.id,
        platform: 'twitter',
        post_id: post.id,
        content: post.text || '',
        url: post.url || post.twitterUrl || `https://x.com/${account.username}/status/${post.id}`,
        author_name: post.author?.name || account.username,
        author_avatar: post.author?.profilePicture || null,
        posted_at: post.createdAt || new Date().toISOString(),
        likes: post.likeCount || 0,
        comments: post.replyCount || 0,
        shares: post.retweetCount || 0,
        views: post.viewCount || 0,
        is_new: true,
      };
    } else {
      return {
        account_id: account.id,
        platform: 'linkedin',
        post_id: post.urn || post.id,
        content: post.text || '',
        url: post.url || '',
        author_name: post.authorFullName || account.username,
        author_avatar: null,
        posted_at: post.postedAtISO || new Date().toISOString(),
        likes: post.reactions?.length || 0,
        comments: post.comments?.length || 0,
        shares: post.isRepost ? 1 : 0,
        views: 0,
        is_new: true,
      };
    }
  });

  // Upsert posts to database
  const { error: upsertError } = await supabase
    .from('scraped_content')
    .upsert(scrapedPosts, {
      onConflict: 'account_id,post_id',
      ignoreDuplicates: false,
    });

  if (upsertError) {
    console.error(`[Database] Error upserting posts:`, upsertError);
    return 0;
  }

  // Update account's last scraped timestamp
  await supabase
    .from('monitored_accounts')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', account.id);

  console.log(`[Processing] Saved ${scrapedPosts.length} posts for @${account.username}`);
  return scrapedPosts.length;
}

/**
 * Main function
 */
async function main() {
  console.log('========================================');
  console.log('[Feed Refresh] Starting cron job');
  console.log(`[Feed Refresh] Time: ${new Date().toISOString()}`);
  console.log('========================================');

  try {
    // Get all enabled accounts that need refreshing
    const { data: accounts, error } = await supabase
      .from('monitored_accounts')
      .select('*')
      .eq('enabled', true);

    if (error) {
      console.error('[Feed Refresh] Error fetching accounts:', error);
      process.exit(1);
    }

    if (!accounts || accounts.length === 0) {
      console.log('[Feed Refresh] No enabled accounts to refresh');
      process.exit(0);
    }

    console.log(`[Feed Refresh] Found ${accounts.length} accounts to refresh`);

    let totalPostsProcessed = 0;
    let accountsProcessed = 0;
    let accountsFailed = 0;

    // Process each account
    for (const account of accounts) {
      try {
        const postsCount = await processAccount(account as MonitoredAccount);
        totalPostsProcessed += postsCount;
        accountsProcessed++;
      } catch (error) {
        console.error(`[Feed Refresh] Failed to process @${account.username}:`, error);
        accountsFailed++;
      }
    }

    console.log('\n========================================');
    console.log('[Feed Refresh] Cron job completed');
    console.log(`[Feed Refresh] Accounts processed: ${accountsProcessed}`);
    console.log(`[Feed Refresh] Accounts failed: ${accountsFailed}`);
    console.log(`[Feed Refresh] Total posts: ${totalPostsProcessed}`);
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('[Feed Refresh] Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main();
