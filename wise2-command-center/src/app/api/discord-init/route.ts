import { NextRequest, NextResponse } from 'next/server';
import { discordBotHandler } from '@/lib/discord-bot';

/**
 * Initialize Discord bot
 * Called once on server startup
 */
export async function GET(request: NextRequest) {
  try {
    const initialized = await discordBotHandler.initialize();

    if (initialized) {
      return NextResponse.json(
        {
          success: true,
          message: 'Discord bot initialized successfully',
          status: 'online',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Discord bot initialization failed. Check environment variables.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Discord bot initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
