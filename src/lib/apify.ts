/**
 * Apify Integration - DEPRECATED FOR TWITTER
 * 
 * Twitter scraping has been moved to Scrapling (browser automation)
 * See: scripts/scrapling_twitter.py and SCRAPLING_SETUP.md
 * 
 * This file now only contains LinkedIn and YouTube functions.
 * To re-enable Apify for Twitter, restore from git history.
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
  youtube_transcript: 'topaz_sharingan~youtube-transcript-scraper',
  linkedin_post: 'curious_coder~linkedin-post-search-scraper',
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

// ============ YOUTUBE TRANSCRIPT ============

export interface YouTubeTranscriptInput {
  startUrls: string[];
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

// ============ LINKEDIN POST SCRAPER ============

export interface LinkedInPostInput {
  startUrls: string[];
  searchTerm?: string;
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

export default {
  // YouTube
  getYouTubeTranscript,
  // LinkedIn
  getLinkedInPosts,
  searchLinkedInPosts,
};
