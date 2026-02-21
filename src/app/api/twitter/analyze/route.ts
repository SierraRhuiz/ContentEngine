import { NextRequest, NextResponse } from 'next/server';
import { processTwitterContent } from '@/lib/twitter-agent';

/**
 * API Route: /api/twitter/analyze
 * Processes input and returns content analysis for Twitter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, context } = body;
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }
    
    // Process the content
    const result = await processTwitterContent(input, context);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
    
  } catch (error) {
    console.error('Twitter agent error:', error);
    return NextResponse.json(
      { error: 'Failed to process content' },
      { status: 500 }
    );
  }
}
