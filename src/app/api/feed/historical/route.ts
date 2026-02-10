import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getTwitterPosts } from '@/lib/apify';
import { getLinkedInPosts } from '@/lib/apify';

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
      const tweets = await getTwitterPosts({
        from: account.username,
        maxItems: limit,
        queryType: 'Latest',
        'filter:replies': false,
      });

      posts = tweets.map((tweet) => ({
        account_id: accountId,
        platform: 'twitter',
        external_id: tweet.id,
        content: tweet.text,
        author_username: tweet.author?.userName || account.username,
        author_name: tweet.author?.name || account.display_name,
        url: tweet.url,
        posted_at: tweet.createdAt,
        engagement: {
          likes: tweet.likeCount || 0,
          retweets: tweet.retweetCount || 0,
          comments: tweet.replyCount || 0,
          quotes: tweet.quoteCount || 0,
          views: tweet.viewCount || 0,
          bookmarks: tweet.bookmarkCount || 0,
        },
        metadata: {
          isReply: tweet.isReply,
          isRetweet: tweet.isRetweet,
          isQuote: tweet.isQuote,
          media: tweet.media,
          lang: tweet.lang,
        },
        is_new: true,
      }));

      // Update account with author info if available
      if (tweets[0]?.author) {
        await supabase
          .from('monitored_accounts')
          .update({
            display_name: tweets[0].author.name,
            avatar_url: tweets[0].author.profilePicture,
            bio: tweets[0].author.description,
            followers_count: tweets[0].author.followers,
          })
          .eq('id', accountId);
      }
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
