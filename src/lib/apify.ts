/**
 * Apify Integration for Content Engine
 *
 * Actors:
 * - Twitter: kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest
 * - YouTube: topaz_sharingan/youtube-transcript-scraper
 * - LinkedIn: curious_coder/linkedin-post-search-scraper
 *
 * Docs: https://docs.apify.com/
 * 
 * Pricing:
 * - Twitter: $0.25 per 1,000 tweets (~60 tweets/second)
 * - LinkedIn: $30/month + usage
 * - YouTube: $20/month + usage
 */

// Support both APIFY_TOKEN (documented) and APIFY_API_KEY (legacy)
const APIFY_API_KEY = process.env.APIFY_TOKEN || process.env.APIFY_API_KEY || '';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

// Validate API key on module load
if (!APIFY_API_KEY) {
  console.warn('[Apify] Warning: No API key found. Set APIFY_TOKEN in environment variables.');
}

// Actor IDs
const ACTORS = {
  twitter_tweet: 'kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest',
  youtube_transcript: 'topaz_sharingan/youtube-transcript-scraper',
  linkedin_post: 'curious_coder/linkedin-post-search-scraper',
};

/**
 * Run an Apify actor task
 */
async function runActor(
  actorId: string,
  input: Record<string, any>
): Promise<any> {
  if (!APIFY_API_KEY) {
    throw new Error('Apify API key not configured. Set APIFY_TOKEN in environment variables.');
  }

  console.log(`[Apify] Starting actor: ${actorId}`);
  console.log(`[Apify] Input:`, JSON.stringify(input, null, 2));

  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${actorId}/runs`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Apify] Error starting actor: ${response.status} - ${error}`);
    throw new Error(`Apify error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log(`[Apify] Run started with ID: ${data.data.id}`);
  return waitForRun(actorId, data.data.id);
}

/**
 * Wait for actor run to complete
 */
async function waitForRun(
  actorId: string,
  runId: string,
  maxWaitMs: number = 120000
): Promise<any> {
  const startTime = Date.now();
  let pollCount = 0;

  while (Date.now() - startTime < maxWaitMs) {
    pollCount++;
    const response = await fetch(
      `${APIFY_BASE_URL}/acts/${actorId}/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Apify] Failed to get run status: ${errorText}`);
      throw new Error(`Failed to get run status: ${errorText}`);
    }

    const data = await response.json();
    const run = data.data;

    if (pollCount === 1 || pollCount % 10 === 0) {
      console.log(`[Apify] Run ${runId} status: ${run.status} (poll #${pollCount})`);
    }

    if (run.status === 'SUCCEEDED') {
      console.log(`[Apify] Run ${runId} completed successfully`);
      
      // Get the output from dataset
      const datasetResponse = await fetch(
        `${APIFY_BASE_URL}/actor-runs/${runId}/dataset/items`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_API_KEY}`,
          },
        }
      );

      if (datasetResponse.ok) {
        const items = await datasetResponse.json();
        console.log(`[Apify] Retrieved ${Array.isArray(items) ? items.length : 1} items from dataset`);
        return items;
      }

      // Fallback to output endpoint
      const outputResponse = await fetch(
        `${APIFY_BASE_URL}/acts/${actorId}/runs/${runId}/output`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_API_KEY}`,
          },
        }
      );

      if (outputResponse.ok) {
        return await outputResponse.json();
      }
      return run;
    }

    if (run.status === 'FAILED') {
      console.error(`[Apify] Run ${runId} failed: ${run.errorMessage || 'Unknown error'}`);
      throw new Error(`Actor failed: ${run.errorMessage || 'Unknown error'}`);
    }

    if (run.status === 'TIMED-OUT') {
      console.error(`[Apify] Run ${runId} timed out`);
      throw new Error('Actor timed out');
    }

    // Wait 2 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.error(`[Apify] Run ${runId} exceeded max wait time of ${maxWaitMs}ms`);
  throw new Error('Actor run timed out');
}

// ============ TWITTER SCRAPER ============

export interface TwitterPostInput {
  from?: string; // Username to scrape from
  maxItems?: number;
  tweetIDs?: string[]; // Specific tweet IDs
  twitterContent?: string; // Search query
  queryType?: 'Latest' | 'Top';
  lang?: string;
  'filter:blue_verified'?: boolean;
  'filter:has_engagement'?: boolean;
  'filter:media'?: boolean;
  'filter:images'?: boolean;
  'filter:videos'?: boolean;
  'filter:replies'?: boolean;
  'include:nativeretweets'?: boolean;
}

export interface TwitterAuthor {
  type: string;
  userName: string;
  url: string;
  twitterUrl: string;
  id: string;
  name: string;
  isVerified: boolean;
  isBlueVerified: boolean;
  profilePicture: string;
  coverPicture?: string;
  description?: string;
  location?: string;
  followers: number;
  following: number;
  createdAt: string;
  statusesCount: number;
  favouritesCount: number;
  mediaCount: number;
}

export interface TwitterPostOutput {
  type: string;
  id: string;
  url: string;
  twitterUrl: string;
  text: string;
  source: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  createdAt: string;
  lang: string;
  bookmarkCount: number;
  isReply: boolean;
  inReplyToId: string | null;
  conversationId: string;
  inReplyToUserId: string | null;
  inReplyToUsername: string | null;
  isPinned: boolean;
  author: TwitterAuthor;
  media?: any[];
  isRetweet: boolean;
  isQuote: boolean;
}

/**
 * Scrape tweets from a Twitter account using Apify
 * Cost: $0.25 per 1,000 tweets
 * Rate: ~60 tweets/second
 */
export async function getTwitterPosts(
  input: TwitterPostInput
): Promise<TwitterPostOutput[]> {
  // Clean username (remove @ if present)
  const username = input.from?.replace('@', '').trim();
  
  console.log(`[Apify Twitter] Fetching tweets for user: ${username || 'N/A'}`);
  console.log(`[Apify Twitter] Max items: ${input.maxItems || 100}`);

  // Build the input - use twitterContent with from: syntax for user timeline
  // This is more reliable than the 'from' parameter alone
  const actorInput: Record<string, any> = {
    maxItems: input.maxItems || 100,
    queryType: input.queryType || 'Latest',
  };

  // If we have specific tweet IDs, use those
  if (input.tweetIDs && input.tweetIDs.length > 0) {
    actorInput.tweetIDs = input.tweetIDs;
  } 
  // If we have a twitterContent search query, use that
  else if (input.twitterContent) {
    actorInput.twitterContent = input.twitterContent;
  }
  // If we have a username, use the 'from' parameter
  else if (username) {
    actorInput.from = username;
  }

  // Add optional filters
  if (input.lang) actorInput.lang = input.lang;
  if (input['filter:blue_verified']) actorInput['filter:blue_verified'] = true;
  if (input['filter:has_engagement']) actorInput['filter:has_engagement'] = true;
  if (input['filter:media']) actorInput['filter:media'] = true;
  if (input['filter:images']) actorInput['filter:images'] = true;
  if (input['filter:videos']) actorInput['filter:videos'] = true;
  if (input['filter:replies'] !== undefined) actorInput['filter:replies'] = input['filter:replies'];
  if (input['include:nativeretweets']) actorInput['include:nativeretweets'] = true;

  const result = await runActor(ACTORS.twitter_tweet, actorInput);

  const tweets = Array.isArray(result) ? result : (result ? [result] : []);
  console.log(`[Apify Twitter] Retrieved ${tweets.length} tweets for ${username || 'query'}`);
  
  return tweets;
}

/**
 * Get tweets by specific IDs
 */
export async function getTwitterPostsByIds(
  tweetIds: string[]
): Promise<TwitterPostOutput[]> {
  return getTwitterPosts({
    tweetIDs: tweetIds,
    maxItems: tweetIds.length,
  });
}

/**
 * Search tweets by content/keywords
 */
export async function searchTwitterPosts(
  query: string,
  maxItems: number = 100,
  queryType: 'Latest' | 'Top' = 'Latest'
): Promise<TwitterPostOutput[]> {
  return getTwitterPosts({
    twitterContent: query,
    maxItems,
    queryType,
  });
}

// ============ YOUTUBE TRANSCRIPT ============

export interface YouTubeTranscriptInput {
  startUrls: string[]; // Array of YouTube URLs
}

export interface YouTubeTranscriptOutput {
  channelName: string;
  channelSubscription: string;
  videoTitle: string;
  url: string;
  views: string;
  videoPostDate: string;
  transcript: string;
}

/**
 * Extract transcript from YouTube video
 */
export async function getYouTubeTranscript(
  videoUrl: string
): Promise<YouTubeTranscriptOutput> {
  const result = await runActor(ACTORS.youtube_transcript, {
    startUrls: [videoUrl],
  });

  return result;
}

/**
 * Extract transcripts from multiple YouTube videos
 */
export async function getYouTubeTranscripts(
  videoUrls: string[]
): Promise<YouTubeTranscriptOutput[]> {
  const result = await runActor(ACTORS.youtube_transcript, {
    startUrls: videoUrls,
  });

  return Array.isArray(result) ? result : [result];
}

/**
 * Generate content from YouTube transcript
 */
export async function generateFromTranscript(
  transcript: string,
  outputType: 'tweet-thread' | 'blog' | 'linkedin' | 'key-quotes',
  voiceProfile?: string
): Promise<string> {
  // This would call Kimi to generate content
  // Implemented in kimi.ts
  return '';
}

// ============ LINKEDIN POST SCRAPER ============

export interface LinkedInPostInput {
  // LinkedIn post URN or URL
  startUrls: string[];
  // Optional: search by keywords
  searchTerm?: string;
  // Number of posts to scrape
  limit?: number;
}

export interface LinkedInPostOutput {
  urn: string;
  text: string;
  url: string;
  postedAtTimestamp: number;
  postedAtISO: string;
  timeSincePosted: string;
  isRepost: boolean;
  authorType: string;
  authorProfileUrl: string;
  authorProfileId: string;
  authorHeadline: string;
  authorFullName: string;
  type: string;
  images: string[];
  reactions: {
    type: string;
    profile: any;
  }[];
  comments: {
    text: string;
    author: any;
    time: number;
  }[];
}

/**
 * Scrape LinkedIn posts from a profile or post URL
 */
export async function getLinkedInPosts(
  urls: string[]
): Promise<LinkedInPostOutput[]> {
  const result = await runActor(ACTORS.linkedin_post, {
    startUrls: urls,
    limit: 20,
  });

  return Array.isArray(result) ? result : [result];
}

/**
 * Scrape LinkedIn posts by search term
 */
export async function searchLinkedInPosts(
  searchTerm: string,
  limit: number = 20
): Promise<LinkedInPostOutput[]> {
  const result = await runActor(ACTORS.linkedin_post, {
    searchTerm,
    limit,
  });

  return Array.isArray(result) ? result : [result];
}

/**
 * Generate content inspired by LinkedIn posts
 */
export async function generateFromLinkedIn(
  posts: LinkedInPostOutput[],
  platform: 'twitter' | 'blog' | 'linkedin',
  voiceProfile?: string
): Promise<string> {
  // Extract post texts
  const postTexts = posts.map((p) => p.text).join('\n\n---\n\n');

  // This would call Kimi to generate content
  return '';
}

// ============ CONTENT ENGINE INTEGRATION ============

export interface ContentSource {
  type: 'youtube' | 'twitter' | 'linkedin';
  id: string;
  name: string;
  url: string;
  lastScraped?: Date;
}

export interface ScrapedContent {
  id: string;
  type: 'youtube' | 'twitter' | 'linkedin';
  text: string; // Transcript or post text
  author: string;
  url: string;
  timestamp?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * Unified content scraper
 */
export async function scrapeContent(
  sources: ContentSource[]
): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = [];

  for (const source of sources) {
    switch (source.type) {
      case 'youtube': {
        const transcript = await getYouTubeTranscript(source.url);
        results.push({
          id: transcript.url,
          type: 'youtube',
          text: transcript.transcript,
          author: transcript.channelName,
          url: transcript.url,
          timestamp: new Date(),
        });
        break;
      }

      case 'linkedin': {
        const posts = await getLinkedInPosts([source.url]);
        for (const post of posts) {
          results.push({
            id: post.urn,
            type: 'linkedin',
            text: post.text,
            author: post.authorFullName,
            url: post.url,
            timestamp: new Date(post.postedAtTimestamp),
            engagement: {
              likes: post.reactions.length,
              comments: post.comments.length,
              shares: post.isRepost ? 1 : 0,
            },
          });
        }
        break;
      }

      case 'twitter': {
        // Use Apify Twitter scraper
        const tweets = await getTwitterPosts({ from: source.name, maxItems: 50 });
        for (const tweet of tweets) {
          results.push({
            id: tweet.id,
            type: 'twitter',
            text: tweet.text,
            author: tweet.author.userName,
            url: tweet.url,
            timestamp: new Date(tweet.createdAt),
            engagement: {
              likes: tweet.likeCount,
              comments: tweet.replyCount,
              shares: tweet.retweetCount,
            },
          });
        }
        break;
      }
    }
  }

  return results;
}

export default {
  // Twitter
  getTwitterPosts,
  getTwitterPostsByIds,
  searchTwitterPosts,
  // YouTube
  getYouTubeTranscript,
  getYouTubeTranscripts,
  // LinkedIn
  getLinkedInPosts,
  searchLinkedInPosts,
  // Unified
  scrapeContent,
};
