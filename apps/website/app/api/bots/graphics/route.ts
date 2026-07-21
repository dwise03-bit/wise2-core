import { NextRequest, NextResponse } from 'next/server';

const GRAPHICS_API_KEY = process.env.GRAPHICS_API_KEY || '';
const GRAPHICS_API_BASE = 'https://api.graphics.wise2.net';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style, format = 'png' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    // Call Graphics API
    const response = await fetch(`${GRAPHICS_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GRAPHICS_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        style: style || 'professional',
        format,
        quality: 'high',
      }),
    });

    if (!response.ok) {
      throw new Error('Graphics API generation failed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      image: {
        url: data.url,
        id: data.id,
        prompt,
        style,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Graphics API error:', error);
    return NextResponse.json({ error: 'Graphics generation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    const response = await fetch(`${GRAPHICS_API_BASE}/images/${imageId}`, {
      headers: {
        Authorization: `Bearer ${GRAPHICS_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, image: data });
  } catch (error) {
    console.error('Graphics API fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
