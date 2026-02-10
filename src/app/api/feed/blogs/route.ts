import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { scrapeBlog } from '@/lib/hyperbrowser';

/**
 * GET /api/feed/blogs
 * Get all blog sources and scraped blogs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceId = searchParams.get('sourceId');

    const supabase = createServerClient();

    // Get blog sources
    const { data: sources, error: sourcesError } = await supabase
      .from('blog_sources')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: false });

    if (sourcesError) {
      console.error('Error fetching blog sources:', sourcesError);
      return NextResponse.json({ error: sourcesError.message }, { status: 500 });
    }

    // Get scraped blogs
    let blogsQuery = supabase
      .from('scraped_blogs')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(50);

    if (sourceId) {
      blogsQuery = blogsQuery.eq('source_id', sourceId);
    }

    const { data: blogs, error: blogsError } = await blogsQuery;

    if (blogsError) {
      console.error('Error fetching blogs:', blogsError);
      return NextResponse.json({ error: blogsError.message }, { status: 500 });
    }

    return NextResponse.json({
      sources: sources?.map((s) => ({
        id: s.id,
        url: s.url,
        domain: s.domain,
        title: s.title,
        lastScrapedAt: s.last_scraped_at,
      })),
      blogs: blogs?.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
        content: b.content,
        author: b.author,
        publishDate: b.publish_date,
        excerpts: b.excerpts,
        readingTime: b.reading_time,
      })),
    });
  } catch (error: any) {
    console.error('Blogs API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/feed/blogs
 * Add a new blog source and scrape it
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, action, sourceId } = body;

    const supabase = createServerClient();

    // Refresh existing source
    if (action === 'refresh' && sourceId) {
      const { data: source } = await supabase
        .from('blog_sources')
        .select('url')
        .eq('id', sourceId)
        .single();

      if (!source) {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
      }

      // Scrape the blog
      const blogData = await scrapeBlog(source.url);

      // Update or insert scraped blog
      const { error: blogError } = await supabase
        .from('scraped_blogs')
        .upsert({
          source_id: sourceId,
          url: source.url,
          title: blogData.title,
          content: blogData.content,
          author: blogData.author,
          publish_date: blogData.publishDate,
          headings: blogData.headings,
          excerpts: blogData.excerpts,
          images: blogData.images,
          reading_time: blogData.readingTime,
          scraped_at: new Date().toISOString(),
        }, {
          onConflict: 'source_id,url',
        });

      if (blogError) {
        console.error('Error saving blog:', blogError);
      }

      // Update last scraped time
      await supabase
        .from('blog_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', sourceId);

      return NextResponse.json({ success: true, blog: blogData });
    }

    // Add new source
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Parse domain from URL
    let domain: string;
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Check if source already exists
    const { data: existing } = await supabase
      .from('blog_sources')
      .select('id')
      .eq('url', url)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Blog source already exists', id: existing.id },
        { status: 409 }
      );
    }

    // Scrape the blog first
    let blogData;
    try {
      blogData = await scrapeBlog(url);
    } catch (error) {
      console.error('Error scraping blog:', error);
      // Continue anyway, we'll store the source
    }

    // Insert new source
    const { data: source, error: sourceError } = await supabase
      .from('blog_sources')
      .insert({
        url,
        domain,
        title: blogData?.title || domain,
        last_scraped_at: blogData ? new Date().toISOString() : null,
        enabled: true,
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Error creating blog source:', sourceError);
      return NextResponse.json({ error: sourceError.message }, { status: 500 });
    }

    // Save scraped blog if we got data
    if (blogData) {
      await supabase
        .from('scraped_blogs')
        .insert({
          source_id: source.id,
          url,
          title: blogData.title,
          content: blogData.content,
          author: blogData.author,
          publish_date: blogData.publishDate,
          headings: blogData.headings,
          excerpts: blogData.excerpts,
          images: blogData.images,
          reading_time: blogData.readingTime,
        });
    }

    return NextResponse.json({
      source: {
        id: source.id,
        url: source.url,
        domain: source.domain,
        title: source.title,
        lastScrapedAt: source.last_scraped_at,
      },
      blog: blogData,
    });
  } catch (error: any) {
    console.error('Add blog source error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/feed/blogs
 * Remove a blog source
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceId = searchParams.get('id');

    if (!sourceId) {
      return NextResponse.json({ error: 'Source ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Delete scraped blogs first
    await supabase
      .from('scraped_blogs')
      .delete()
      .eq('source_id', sourceId);

    // Delete source
    const { error } = await supabase
      .from('blog_sources')
      .delete()
      .eq('id', sourceId);

    if (error) {
      console.error('Error deleting blog source:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: sourceId });
  } catch (error: any) {
    console.error('Delete blog source error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
