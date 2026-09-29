import { NextRequest, NextResponse } from 'next/server';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  resolved?: boolean;
}

const conversations: Map<string, Message[]> = new Map();

// Hermes Bot knowledge base
const HERMES_RESPONSES: Record<string, string> = {
  hello: 'Hello! I\'m Hermes, your WISE² customer service bot. How can I help you today?',
  hi: 'Hello! I\'m Hermes, your WISE² customer service bot. How can I help you today?',
  pricing: 'Check out our pricing page at wise2.net/pricing for details on Starter, Professional, and Enterprise plans.',
  price: 'Check out our pricing page at wise2.net/pricing for details on Starter ($29), Professional ($99), and Enterprise (custom).',
  cost: 'Check out our pricing page at wise2.net/pricing for details on our plans.',
  features: 'WISE² includes Music Generation, Video Creation, Image Design, Voice Synthesis, Batch Processing, and Fast Rendering.',
  bots: 'WISE² Bot Suite includes Discord OAuth, Graphics API, Analytics Bot, and Hermes Support. Learn more at wise2.net/bots',
  bot: 'WISE² Bot Suite includes Discord OAuth, Graphics API, Analytics Bot, and Hermes Support. Learn more at wise2.net/bots',
  status: 'All WISE² services are operational. Real-time status: https://status.wise2.net',
  support: 'Need help? Email us at support@wise2.net or join our Discord at https://discord.gg/wise2',
  help: 'I can help you with pricing, features, API access, account issues, or general questions. What do you need?',
  signup: 'Sign up at wise2.net/auth/signup to get started with your free trial!',
  account: 'For account issues, please contact support@wise2.net with your email address.',
  api: 'Access our API documentation at api.wise2.net/docs',
  docs: 'Check out our documentation at wise2.net/docs or api.wise2.net/docs',
  discord: 'Join our community on Discord: https://discord.gg/wise2',
  dashboard: 'Access your dashboard at dashboard.wise2.net after logging in.',
  studio: 'Create amazing content in WISE² Studio at wise2.net/studio',
  try: 'Start your free trial at wise2.net/auth/signup!',
  free: 'We offer a free trial when you sign up. No credit card required!',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, message, userId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation
    if (!conversations.has(convId)) {
      conversations.set(convId, []);
    }

    const conversation = conversations.get(convId)!;

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    conversation.push(userMsg);

    // Generate bot response
    let botResponse = generateHermesResponse(message);

    // Send to Discord if webhook configured
    if (process.env.DISCORD_SUPPORT_WEBHOOK) {
      await fetch(process.env.DISCORD_SUPPORT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '💬 Support Ticket',
            description: message,
            color: 0x00d9ff,
            fields: [
              { name: 'User ID', value: userId || 'anonymous', inline: true },
              { name: 'Conversation ID', value: convId, inline: true },
              { name: 'Bot Response', value: botResponse, inline: false },
            ],
            timestamp: new Date().toISOString(),
          }],
          username: 'Hermes Support Bot',
        }),
      }).catch(err => console.error('Discord webhook error:', err));
    }

    // Add bot response
    const botMsg: Message = {
      id: `msg_${Date.now()}_bot`,
      content: botResponse,
      sender: 'bot',
      timestamp: new Date().toISOString(),
    };
    conversation.push(botMsg);

    return NextResponse.json({
      success: true,
      conversationId: convId,
      message: userMsg,
      response: botMsg,
      conversation: conversation.slice(-10), // Return last 10 messages
    });
  } catch (error) {
    console.error('Hermes bot error:', error);
    return NextResponse.json({ error: 'Bot processing failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      conversationId,
      messages: conversation,
      messageCount: conversation.length,
    });
  } catch (error) {
    console.error('Hermes fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

function generateHermesResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(HERMES_RESPONSES)) {
    if (lower.includes(keyword)) {
      return response;
    }
  }

  // Default response
  return 'Thanks for reaching out! I\'m here to help. You can ask me about pricing, features, API access, or sign up. For more complex issues, please email support@wise2.net';
}
