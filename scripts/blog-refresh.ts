// Standalone cron script for blog refresh
// 
// This script is designed to run on Railway cron jobs.
// Schedule: "0 0 * * *" (daily at midnight)
// Command: npx tsx scripts/blog-refresh.ts

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HYPERBROWSER_API_KEY = process.env.HYPERBROWSER_API_KEY || '';

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[Blog Refresh] Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface BlogSource {
  id: string;
  url: string;
  domain: string;
  last_scraped_at: string | null;
  scrape_interval_hours: number;
  enabled: boolean;
}

interface ScrapedBlog {
  source_id: string;
  url: string;
  title: string;
  content: string;
  author: string | null;
  publish_date: string | null;
  is_new: boolean;
}

/**
 * Scrape a blog URL using HyperBrowser or basic fetch
 */
async function scrapeBlog(url: string): Promise<{
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
} | null> {
  console.log(`[Scraper] Scraping: ${url}`);

  try {
    // If HyperBrowser is configured, use it
    if (HYPERBROWSER_API_KEY) {
      const response = await fetch('https://api.hyperbrowser.io/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HYPERBROWSER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          extractors: ['title', 'text', 'metadata'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title || '',
          content: data.text || data.content || '',
          author: data.metadata?.author,
          publishDate: data.metadata?.publishedTime,
        };
      }
    }

    // Fallback to basic fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentEngine/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Basic HTML parsing
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Extract text content (simplified)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : html;
    
    // Remove script and style tags
    content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<[^>]+>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();

    // Limit content length
    content = content.slice(0, 10000);

    return { title, content };
  } catch (error) {
    console.error(`[Scraper] Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Process a single blog source
 */
async function processBlogSource(source: BlogSource): Promise<number> {
  console.log(`\n[Processing] ${source.domain}`);

  const scraped = await scrapeBlog(source.url);

  if (!scraped) {
    console.log(`[Processing] Failed to scrape ${source.domain}`);
    return 0;
  }

  const blogRecord: ScrapedBlog = {
    source_id: source.id,
    url: source.url,
    title: scraped.title,
    content: scraped.content,
    author: scraped.author || null,
    publish_date: scraped.publishDate || null,
    is_new: true,
  };

  // Upsert to database
  const { error: upsertError } = await supabase
    .from('scraped_blogs')
    .upsert(blogRecord, {
      onConflict: 'source_id,url',
      ignoreDuplicates: false,
    });

  if (upsertError) {
    console.error(`[Database] Error upserting blog:`, upsertError);
    return 0;
  }

  // Update source's last scraped timestamp
  await supabase
    .from('blog_sources')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', source.id);

  console.log(`[Processing] Saved blog from ${source.domain}`);
  return 1;
}

/**
 * Main function
 */
async function main() {
  console.log('========================================');
  console.log('[Blog Refresh] Starting cron job');
  console.log(`[Blog Refresh] Time: ${new Date().toISOString()}`);
  console.log('========================================');

  try {
    // Get all enabled blog sources
    const { data: sources, error } = await supabase
      .from('blog_sources')
      .select('*')
      .eq('enabled', true);

    if (error) {
      console.error('[Blog Refresh] Error fetching sources:', error);
      process.exit(1);
    }

    if (!sources || sources.length === 0) {
      console.log('[Blog Refresh] No enabled blog sources to refresh');
      process.exit(0);
    }

    console.log(`[Blog Refresh] Found ${sources.length} blog sources to refresh`);

    let blogsProcessed = 0;
    let sourcesFailed = 0;

    // Process each source
    for (const source of sources) {
      try {
        const count = await processBlogSource(source as BlogSource);
        blogsProcessed += count;
      } catch (error) {
        console.error(`[Blog Refresh] Failed to process ${source.domain}:`, error);
        sourcesFailed++;
      }
    }

    console.log('\n========================================');
    console.log('[Blog Refresh] Cron job completed');
    console.log(`[Blog Refresh] Sources processed: ${sources.length - sourcesFailed}`);
    console.log(`[Blog Refresh] Sources failed: ${sourcesFailed}`);
    console.log(`[Blog Refresh] Blogs scraped: ${blogsProcessed}`);
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('[Blog Refresh] Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main();
