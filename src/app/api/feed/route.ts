import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/feed
 * Fetch feed posts from monitored accounts
 * Query params: platform?, accountId?, limit?, offset?
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerClient();

    // Build query
    let query = supabase
      .from('scraped_content')
      .select(`
        *,
        monitored_accounts (
          username,
          display_name,
          avatar_url,
          is_own_account
        )
      `)
      .order('posted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }
    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching feed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to frontend format
    const transformedPosts = posts?.map((post) => ({
      id: post.id,
      platform: post.platform,
      content: post.content,
      author: post.author_username,
      authorName: post.author_name || post.monitored_accounts?.display_name,
      authorAvatar: post.monitored_accounts?.avatar_url,
      url: post.url,
      timestamp: post.posted_at,
      likes: post.engagement?.likes || 0,
      comments: post.engagement?.comments || 0,
      shares: post.engagement?.shares || post.engagement?.retweets || 0,
      views: post.engagement?.views || 0,
      isNew: post.is_new,
      isOwnAccount: post.monitored_accounts?.is_own_account || false,
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (error: any) {
    console.error('Feed API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/feed/refresh
 * Trigger refresh for accounts
 * Body: { accountId?: string } - If not provided, refresh all
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, action } = body;

    if (action === 'mark_viewed') {
      // Mark posts as viewed
      const supabase = createServerClient();
      
      if (accountId) {
        await supabase
          .from('scraped_content')
          .update({ is_new: false })
          .eq('account_id', accountId);
      } else {
        await supabase
          .from('scraped_content')
          .update({ is_new: false })
          .eq('is_new', true);
      }

      return NextResponse.json({ success: true });
    }

    // For refresh, we'll return a message since actual scraping is handled by Railway cron
    // The cron job (scripts/feed-refresh.ts) runs every 30 minutes
    return NextResponse.json({ 
      message: 'Refresh triggered',
      accountId: accountId || 'all'
    });
  } catch (error: any) {
    console.error('Feed refresh error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
