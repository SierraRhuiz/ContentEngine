import { NextRequest, NextResponse } from 'next/server';
import { scrapeBlog } from '@/lib/hyperbrowser';
import { getTwitterPosts, getLinkedInPosts, getYouTubeTranscript } from '@/lib/apify';

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
        
        // Check if all results are mock data
        const isMockData = (tweets: any[]) => {
          if (tweets.length === 0) return true;
          const firstText = tweets[0]?.text || '';
          return firstText.includes('KaitoEasyAPI') || firstText.includes('mock data');
        };
        
        let apifyTweets: any[] = [];
        let useScrapling = false;
        
        try {
          // Try Apify first
          console.log(`[Scrape API] Trying Apify for @${user}`);
          const tweets = await getTwitterPosts({
            from: user,
            maxItems: maxTweets,
            queryType: 'Latest',
            'filter:replies': options?.includeReplies ?? false,
            'include:nativeretweets': options?.includeRetweets ?? false,
          });
          
          // Normalize Apify response
          apifyTweets = tweets.map((tweet) => ({
            id: tweet.id,
            content: tweet.text,
            text: tweet.text,
            author: tweet.author?.userName || user,
            authorName: tweet.author?.name || user,
            authorAvatar: tweet.author?.profilePicture,
            likes: tweet.likeCount || 0,
            retweets: tweet.retweetCount || 0,
            comments: tweet.replyCount || 0,
            views: tweet.viewCount || 0,
            quotes: tweet.quoteCount || 0,
            bookmarks: tweet.bookmarkCount || 0,
            timestamp: tweet.createdAt,
            url: tweet.url,
            isReply: tweet.isReply,
            isRetweet: tweet.isRetweet,
            isQuote: tweet.isQuote,
            media: tweet.media,
            source: 'apify'
          }));
          
          // Check if Apify returned mock data
          if (isMockData(apifyTweets)) {
            console.log('[Scrape API] Apify returned mock data, trying Scrapling fallback...');
            useScrapling = true;
          }
          
        } catch (error: any) {
          console.log(`[Scrape API] Apify failed: ${error.message}, trying Scrapling fallback...`);
          useScrapling = true;
        }
        
        // If Apify failed or returned mock data, try Scrapling
        if (useScrapling) {
          try {
            console.log(`[Scrape API] Trying Scrapling fallback for @${user}`);
            
            // Call Scrapling endpoint
            const scraplingResponse = await fetch('http://localhost:3000/api/scrape/scrapling', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user, maxTweets })
            });
            
            if (scraplingResponse.ok) {
              const scraplingData = await scraplingResponse.json();
              if (scraplingData.tweets && scraplingData.tweets.length > 0) {
                console.log(`[Scrape API] Scrapling returned ${scraplingData.tweets.length} tweets`);
                return NextResponse.json({ 
                  tweets: scraplingData.tweets,
                  source: 'scrapling'
                });
              }
            }
            
            // Scrapling also failed
            console.log('[Scrape API] Scrapling also returned no results');
            
          } catch (scraplingError: any) {
            console.error(`[Scrape API] Scrapling failed: ${scraplingError.message}`);
          }
          
          // Both failed - return mock data warning with explanation
          return NextResponse.json({ 
            tweets: apifyTweets, // Return the mock data from Apify with warning
            source: 'apify',
            warning: 'No credits available. Add credits at https://console.apify.com/billing or install Scrapling: pip install scrapling && scrapling install'
          });
        }
        
        // Apify succeeded with real data
        return NextResponse.json({ 
          tweets: apifyTweets,
          source: 'apify'
        });
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
        // Use Apify YouTube transcript scraper
        const transcript = await getYouTubeTranscript(url);
        return NextResponse.json({ 
          youtube: {
            ...transcript,
            success: true,
          }
        });
      }

      case 'linkedin': {
        const profileUrl = url || (username ? `https://www.linkedin.com/in/${username}` : null);
        if (!profileUrl) {
          return NextResponse.json({ error: 'Missing URL or username' }, { status: 400 });
        }
        
        // Use Apify LinkedIn scraper
        const posts = await getLinkedInPosts([profileUrl]);
        
        // Normalize response format
        const normalizedPosts = posts.map((post) => ({
          id: post.urn,
          content: post.text,
          author: post.authorFullName,
          authorUsername: post.authorProfileId,
          authorHeadline: post.authorHeadline,
          authorUrl: post.authorProfileUrl,
          url: post.url,
          timestamp: post.postedAtISO,
          timeSincePosted: post.timeSincePosted,
          likes: post.reactions?.length || 0,
          comments: post.comments?.length || 0,
          isRepost: post.isRepost,
          type: post.type,
          images: post.images,
        }));
        
        return NextResponse.json({ linkedin: normalizedPosts });
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
