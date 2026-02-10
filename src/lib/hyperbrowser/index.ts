/**
 * HyperBrowser Integration for Content Engine
 *
 * Browser automation for scraping Twitter, blogs, etc.
 * Docs: https://www.hyperbrowser.ai/docs
 * Templates: https://www.hyperbrowser.ai/templates
 */

const HYPERBROWSER_API_KEY = process.env.HYPERBROWSER_API_KEY || 'hb_7d4593566ee0e56c53fae3b0669a';
const BASE_URL = 'https://api.hyperbrowser.ai/v1';

// ============ TWITTER/X SCRAPING ============

export interface Tweet {
  id: string;
  author: string;
  content: string;
  likes: number;
  retweets: number;
  comments: number;
  views?: number;
  timestamp: string;
  url: string;
}

export interface TwitterAccount {
  username: string;
  displayName: string;
  bio?: string;
  followers?: number;
  following?: number;
  verified?: boolean;
}

/**
 * Scrape tweets from a Twitter account
 */
export async function scrapeTweets(username: string, maxTweets: number = 20): Promise<Tweet[]> {
  console.log(`Scraping ${maxTweets} tweets from @${username}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HYPERBROWSER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://x.com/${username}`,
        goal: `Extract ${maxTweets} tweets with: content, likes, retweets, comments, timestamp. Format as JSON array.`,
        formats: ['json'],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('HyperBrowser error:', error);
      throw new Error(`Failed to scrape tweets: ${error}`);
    }

    const data = await response.json();
    
    // Parse the extracted content
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    
    return data.tweets || data.data || [];
  } catch (error) {
    console.error('Tweet scraping failed:', error);
    throw error;
  }
}

/**
 * Get account info
 */
export async function getTwitterAccount(username: string): Promise<TwitterAccount> {
  const response = await fetch(`${BASE_URL}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HYPERBROWSER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: `https://x.com/${username}`,
      goal: 'Extract: display name, bio, follower count, following count, verified status.',
      formats: ['json'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get account: ${await response.text()}`);
  }

  const data = await response.json();
  return data;
}

// ============ BLOG SCRAPING ============

export interface ScrapedBlog {
  title: string;
  content: string;
  excerpts: string[];
  headings: string[];
  links: string[];
  images: string[];
  author?: string;
  publishDate?: string;
  readingTime?: string;
}

/**
 * Scrape a blog post
 */
export async function scrapeBlog(url: string): Promise<ScrapedBlog> {
  console.log(`Scraping blog: ${url}...`);
  
  const response = await fetch(`${BASE_URL}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HYPERBROWSER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      goal: `Extract: title, main content (full text), key excerpts, all headings (H1-H3), internal/external links, featured image, author, publish date, reading time.`,
      formats: ['markdown', 'json'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to scrape blog: ${await response.text()}`);
  }

  const data = await response.json();
  
  return {
    title: data.title || 'Untitled',
    content: data.content || data.markdown || '',
    excerpts: data.excerpts || [],
    headings: data.headings || [],
    links: data.links || [],
    images: data.images || [],
    author: data.author,
    publishDate: data.publishDate,
    readingTime: data.readingTime,
  };
}

/**
 * Scrape multiple URLs in parallel
 */
export async function scrapeMultiple(urls: string[]): Promise<ScrapedBlog[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        return await scrapeBlog(url);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        return null;
      }
    })
  );
  
  return results.filter((r): r is ScrapedBlog => r !== null);
}

// ============ CONTENT ENGINE HELPERS ============

export interface ContentSource {
  type: 'twitter' | 'blog' | 'youtube' | 'linkedin';
  url: string;
  username?: string;
  content: Tweet | ScrapedBlog;
}

/**
 * Scrape content from a URL
 */
export async function scrapeContent(url: string): Promise<ContentSource> {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) {
    const username = extractUsername(url);
    const tweets = await scrapeTweets(username, 10);
    return {
      type: 'twitter',
      url,
      username,
      content: tweets[0],
    };
  }
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    // Use Apify for YouTube
    throw new Error('Use Apify for YouTube');
  }
  
  if (lowerUrl.includes('linkedin.com')) {
    // Use Apify for LinkedIn
    throw new Error('Use Apify for LinkedIn');
  }
  
  // Default: scrape as blog
  const blog = await scrapeBlog(url);
  return {
    type: 'blog',
    url,
    content: blog,
  };
}

function extractUsername(url: string): string {
  const match = url.match(/(?:x\.com|twitter\.com)\/([^/?]+)/);
  return match ? match[1] : '';
}

// ============ EXAMPLE USAGE ============

/**
 * Example: Scrape tweets from an account
 *
 * ```typescript
 * import { scrapeTweets, extractUsername } from './hyperbrowser';
 * 
 * async function getContent() {
 *   const tweets = await scrapeTweets('elonmusk', 10);
 *   console.log(tweets);
 * }
 * ```
 * 
 * Example: Scrape a blog post
 *
 * ```typescript
 * import { scrapeBlog } from './hyperbrowser';
 * 
 * async function getBlog() {
 *   const blog = await scrapeBlog('https://example.com/blog/post');
 *   console.log(blog.title);
 *   console.log(blog.content);
 * }
 * ```
 */

export default {
  scrapeTweets,
  getTwitterAccount,
  scrapeBlog,
  scrapeMultiple,
  scrapeContent,
};
