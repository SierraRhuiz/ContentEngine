import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/feed/scheduler
 * Get scheduler status - now powered by Railway cron jobs
 */
export async function GET() {
  try {
    const supabase = createServerClient();

    // Get counts of monitored accounts and blog sources
    const [accountsResult, blogsResult] = await Promise.all([
      supabase
        .from('monitored_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('enabled', true),
      supabase
        .from('blog_sources')
        .select('*', { count: 'exact', head: true })
        .eq('enabled', true),
    ]);

    return NextResponse.json({
      status: 'active',
      provider: 'railway-cron',
      schedules: {
        feedRefresh: {
          schedule: '*/30 * * * *',
          description: 'Every 30 minutes',
          accountsMonitored: accountsResult.count || 0,
        },
        blogRefresh: {
          schedule: '0 0 * * *',
          description: 'Daily at midnight',
          sourcesMonitored: blogsResult.count || 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * POST /api/feed/scheduler
 * Trigger manual refresh or manage settings
 * 
 * Note: With Railway cron, we can only trigger manual refreshes.
 * Scheduling is handled automatically by Railway.
 * 
 * Body: { action, accountId? }
 * Actions: trigger_feed, trigger_blog, status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, accountId, sourceId } = body;

    const supabase = createServerClient();

    switch (action) {
      case 'trigger_feed': {
        // Trigger immediate feed refresh by calling the internal API
        if (!accountId) {
          return NextResponse.json({ error: 'accountId required' }, { status: 400 });
        }

        const { data: account, error } = await supabase
          .from('monitored_accounts')
          .select('*')
          .eq('id', accountId)
          .single();

        if (error || !account) {
          return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Call the historical endpoint to trigger a fetch
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/feed/historical`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: account.id,
            platform: account.platform,
            username: account.username,
            maxItems: 20,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          return NextResponse.json({ error: error.message || 'Failed to trigger refresh' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          triggered: {
            accountId,
            username: account.username,
            platform: account.platform,
          },
        });
      }

      case 'trigger_all_feeds': {
        // Trigger refresh for all enabled accounts
        const { data: accounts } = await supabase
          .from('monitored_accounts')
          .select('*')
          .eq('enabled', true);

        if (!accounts || accounts.length === 0) {
          return NextResponse.json({
            success: true,
            triggered: 0,
            message: 'No enabled accounts to refresh',
          });
        }

        // Note: In production, this would be better handled by calling the cron script directly
        // For now, we just return the count of accounts that would be refreshed
        return NextResponse.json({
          success: true,
          message: 'To refresh all accounts, run: npm run cron:feed',
          accountsCount: accounts.length,
          accounts: accounts.map((a) => ({
            id: a.id,
            username: a.username,
            platform: a.platform,
          })),
        });
      }

      case 'trigger_all_blogs': {
        // Trigger refresh for all enabled blog sources
        const { data: sources } = await supabase
          .from('blog_sources')
          .select('*')
          .eq('enabled', true);

        if (!sources || sources.length === 0) {
          return NextResponse.json({
            success: true,
            triggered: 0,
            message: 'No enabled blog sources to refresh',
          });
        }

        return NextResponse.json({
          success: true,
          message: 'To refresh all blogs, run: npm run cron:blog',
          sourcesCount: sources.length,
          sources: sources.map((s) => ({
            id: s.id,
            domain: s.domain,
            url: s.url,
          })),
        });
      }

      case 'status': {
        // Get detailed status
        const [accounts, sources] = await Promise.all([
          supabase
            .from('monitored_accounts')
            .select('id, username, platform, last_scraped_at, enabled')
            .eq('enabled', true),
          supabase
            .from('blog_sources')
            .select('id, domain, last_scraped_at, enabled')
            .eq('enabled', true),
        ]);

        return NextResponse.json({
          success: true,
          accounts: accounts.data || [],
          blogSources: sources.data || [],
        });
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            validActions: ['trigger_feed', 'trigger_all_feeds', 'trigger_all_blogs', 'status'],
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Scheduler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
