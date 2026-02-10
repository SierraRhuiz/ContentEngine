import { NextRequest, NextResponse } from 'next/server';

const KIMI_API_KEY = process.env.NEXT_PUBLIC_KIMI_API_KEY || '';
const BASE_URL = 'https://api.moonshot.ai/v1';

export async function POST(request: NextRequest) {
  try {
    const { messages, mode } = await request.json();

    if (!KIMI_API_KEY) {
      return NextResponse.json(
        { error: 'Kimi API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages,
        temperature: 1,  // Kimi K2.5 requires exactly 1
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Kimi API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
