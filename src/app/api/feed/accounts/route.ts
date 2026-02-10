import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Note: Feed refresh is now handled by Railway cron jobs (scripts/feed-refresh.ts)
// instead of BullMQ. Accounts are automatically refreshed every 30 minutes.

/**
 * GET /api/feed/accounts
 * Get all monitored accounts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');

    const supabase = createServerClient();

    let query = supabase
      .from('monitored_accounts')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: false });

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data: accounts, error } = await query;

    if (error) {
      console.error('Error fetching accounts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get post counts for each account
    const accountsWithCounts = await Promise.all(
      (accounts || []).map(async (account) => {
        const { count: totalCount } = await supabase
          .from('scraped_content')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', account.id);

        const { count: newCount } = await supabase
          .from('scraped_content')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', account.id)
          .eq('is_new', true);

        return {
          id: account.id,
          platform: account.platform,
          username: account.username,
          displayName: account.display_name,
          avatarUrl: account.avatar_url,
          isOwnAccount: account.is_own_account,
          lastScrapedAt: account.last_scraped_at,
          scrapeIntervalMinutes: account.scrape_interval_minutes,
          postCount: totalCount || 0,
          newPostCount: newCount || 0,
        };
      })
    );

    return NextResponse.json({ accounts: accountsWithCounts });
  } catch (error: any) {
    console.error('Accounts API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/feed/accounts
 * Add a new monitored account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, username, isOwnAccount, displayName, avatarUrl } = body;

    if (!platform || !username) {
      return NextResponse.json(
        { error: 'Platform and username are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if account already exists
    const { data: existing } = await supabase
      .from('monitored_accounts')
      .select('id')
      .eq('platform', platform)
      .eq('username', username.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Account already exists', id: existing.id },
        { status: 409 }
      );
    }

    // Insert new account
    const { data: account, error } = await supabase
      .from('monitored_accounts')
      .insert({
        platform,
        username: username.toLowerCase().replace('@', ''),
        display_name: displayName || username,
        avatar_url: avatarUrl,
        is_own_account: isOwnAccount || false,
        scrape_interval_minutes: 30,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Note: Feed refresh is handled by Railway cron job (runs every 30 minutes)
    // Account will be picked up automatically on next cron run

    return NextResponse.json({
      account: {
        id: account.id,
        platform: account.platform,
        username: account.username,
        displayName: account.display_name,
        avatarUrl: account.avatar_url,
        isOwnAccount: account.is_own_account,
        lastScrapedAt: account.last_scraped_at,
        postCount: 0,
        newPostCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/feed/accounts
 * Remove a monitored account
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    // Note: No need to cancel cron jobs - disabled accounts are skipped automatically

    const supabase = createServerClient();

    // Delete scraped content first (cascade should handle this, but being explicit)
    await supabase
      .from('scraped_content')
      .delete()
      .eq('account_id', accountId);

    // Delete account
    const { error } = await supabase
      .from('monitored_accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      console.error('Error deleting account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: accountId });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/feed/accounts
 * Update a monitored account
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Map frontend field names to database field names
    const dbUpdates: Record<string, any> = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.isOwnAccount !== undefined) dbUpdates.is_own_account = updates.isOwnAccount;
    if (updates.scrapeIntervalMinutes !== undefined) dbUpdates.scrape_interval_minutes = updates.scrapeIntervalMinutes;
    if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;
    if (updates.lastScrapedAt !== undefined) dbUpdates.last_scraped_at = updates.lastScrapedAt;

    dbUpdates.updated_at = new Date().toISOString();

    const { data: account, error } = await supabase
      .from('monitored_accounts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      account: {
        id: account.id,
        platform: account.platform,
        username: account.username,
        displayName: account.display_name,
        avatarUrl: account.avatar_url,
        isOwnAccount: account.is_own_account,
        lastScrapedAt: account.last_scraped_at,
      },
    });
  } catch (error: any) {
    console.error('Update account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
