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
        
        // Use Apify Twitter scraper
        const tweets = await getTwitterPosts({
          from: user,
          maxItems: maxTweets,
          queryType: 'Latest',
          'filter:replies': options?.includeReplies ?? false,
          'include:nativeretweets': options?.includeRetweets ?? false,
        });
        
        // Normalize response format
        const normalizedTweets = tweets.map((tweet) => ({
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
        }));
        
        return NextResponse.json({ tweets: normalizedTweets });
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
