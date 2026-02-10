import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/feed/tone
 * Get voice profile for user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    const supabase = createServerClient();

    let query = supabase
      .from('voice_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (accountId) {
      query = query.eq('account_id', accountId);
    } else {
      query = query.eq('is_primary', true);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching voice profiles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const profile = profiles?.[0];
    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
        tone: profile.tone,
        themes: profile.themes,
        vocabulary: profile.vocabulary,
        patterns: profile.patterns,
        examplePosts: profile.example_posts,
        isPrimary: profile.is_primary,
      },
    });
  } catch (error: any) {
    console.error('Tone API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/feed/tone/extract
 * Extract voice profile from posts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, posts, name, isPrimary } = body;

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: 'Posts are required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Call Kimi to analyze posts and extract voice profile
    const KIMI_API_KEY = process.env.NEXT_PUBLIC_KIMI_API_KEY || '';
    const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'system',
            content: `Analyze these posts and extract a voice profile. Return ONLY valid JSON with this exact structure:
{
  "tone": "A brief description of the overall tone (e.g., 'Direct, slightly sarcastic, no fluff')",
  "themes": ["Array", "of", "common", "themes"],
  "vocabulary": ["frequently", "used", "words"],
  "patterns": ["Writing patterns like 'Questions as hooks'", "Short sentences"]
}

Focus on identifying:
- The dominant emotional tone and personality
- Recurring topics and themes
- Distinctive word choices and phrases
- Structural patterns in how content is written`,
          },
          {
            role: 'user',
            content: `Analyze these ${posts.length} posts and extract the voice profile:\n\n${posts
              .slice(0, 50)
              .map((p: string) => `"${p}"`)
              .join('\n\n')}`,
          },
        ],
        temperature: 1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Kimi API error:', error);
      return NextResponse.json({ error: 'Failed to analyze posts' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let profile;
    try {
      // Try direct parse
      profile = JSON.parse(content);
    } catch {
      // Try to extract JSON from response
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        profile = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse voice profile' }, { status: 500 });
      }
    }

    // If isPrimary, unset other primary profiles
    if (isPrimary) {
      await supabase
        .from('voice_profiles')
        .update({ is_primary: false })
        .eq('is_primary', true);
    }

    // Save to database
    const { data: savedProfile, error: saveError } = await supabase
      .from('voice_profiles')
      .insert({
        account_id: accountId || null,
        name: name || 'My Voice Profile',
        tone: profile.tone,
        themes: profile.themes,
        vocabulary: profile.vocabulary,
        patterns: profile.patterns,
        example_posts: posts.slice(0, 10),
        is_primary: isPrimary ?? true,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving voice profile:', saveError);
      // Return the profile anyway, just not saved
      return NextResponse.json({ profile, saved: false });
    }

    return NextResponse.json({
      profile: {
        id: savedProfile.id,
        name: savedProfile.name,
        tone: savedProfile.tone,
        themes: savedProfile.themes,
        vocabulary: savedProfile.vocabulary,
        patterns: savedProfile.patterns,
        isPrimary: savedProfile.is_primary,
      },
      saved: true,
    });
  } catch (error: any) {
    console.error('Extract tone error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/feed/tone
 * Delete a voice profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('id');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('id', profileId);

    if (error) {
      console.error('Error deleting voice profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: profileId });
  } catch (error: any) {
    console.error('Delete tone error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
