// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// Enhanced chat system: Smart routing + multi-turn memory + Hermes AI

/**
 * Expanded knowledge base organized by category
 */
const KNOWLEDGE_BASE: Record<string, Record<string, string>> = {
  pricing: {
    overview: `**Wise Defense Membership Tiers:**

🟢 **Starter - $99/month** | Best for: Getting started
✅ Beginner Fundamentals course (4-6 weeks)
✅ Community forum & peer support
✅ Performance tracking dashboard
✅ Certificates of completion
✅ Email support
💡 Free 7-day trial

🔵 **Pro - $199/month** | Best for: Serious learners
✅ Everything in Starter, PLUS:
✅ Concealed Carry course (6-8 weeks)
✅ 2 personalized coaching sessions/month
✅ Priority support
✅ Exclusive webinars
💡 Cancel anytime

🔴 **VIP - $399/month** | Best for: Professionals
✅ Everything in Pro, PLUS:
✅ Competitive Shooting course (8-12 weeks)
✅ Weekly 1-on-1 coaching
✅ 24/7 phone support
✅ Custom training programs
✅ Early access to new courses
💡 Best value for commitment`,

    comparison: `**Quick Comparison:**
| Feature | Starter | Pro | VIP |
|---------|---------|-----|-----|
| Courses | 1 | 2 | 3 |
| Coaching | None | 2x/mo | Weekly |
| Support | Email | Priority | 24/7 Phone |
| Price | $99 | $199 | $399 |
| Free Trial | ✅ | ✅ | ✅ |`,

    guarantee: `**30-Day Money-Back Guarantee**
Not satisfied? Full refund within 30 days. No questions asked.`
  },

  booking: {
    how: `**Book Your First Session:**
1. Log in → Dashboard → "Book Session"
2. Pick your instructor & time slot
3. Choose session type:
   - 📍 Range time (in-person)
   - 💻 Online coaching (video)
   - 🎥 Video review (form check)
4. Confirm payment
5. Get email confirmation + reminder

**Rescheduling:** Free until 24 hours before
**Cancellation:** Free until 7 days before`,

    availability: `**Available Hours:**
📅 Weekdays: 9 AM - 6 PM (EST)
📅 Weekends: 10 AM - 4 PM (EST)
🌙 After-hours: VIP members only
🎄 Holiday schedule: See calendar`,

    cancellation: `**Rescheduling & Cancellation:**
• Free reschedule: Until 24 hours before
• Free cancel: Until 7 days before
• Late cancellation: Forfeit session credit
• Exception: Contact support@wisedefense.com`,

    payment: `**Payment Options:**
💳 Credit/Debit card (all major cards)
💰 Monthly billing (auto-renew)
🔄 Cancel anytime before renewal
✨ No hidden fees ever`
  },

  courses: {
    overview: `**Our Three Training Paths:**

🔰 **Beginner Fundamentals** (4-6 weeks)
Learn safety, build confidence, master basics
├─ Safety protocols & mindset
├─ Weapon handling & familiarity
├─ Shooting fundamentals
└─ Maintenance & care

🔒 **Concealed Carry** (6-8 weeks)
Self-defense skills for everyday carry
├─ Legal requirements by state
├─ Holster selection & draw
├─ Real-world scenarios
└─ Situational awareness

🎯 **Competitive Shooting** (8-12 weeks)
Advanced skills for competition
├─ Speed & accuracy optimization
├─ Advanced techniques
├─ Competition rules & etiquette
└─ Match preparation`,

    prerequisites: `**Do I need any background?**
✅ **Beginner:** No prerequisites - start here
✅ **Concealed Carry:** Complete Beginner first
✅ **Competitive:** Complete Concealed Carry first
✅ **VIP Direct:** Instructors guide your path`,

    duration: `**How long are courses?**
⏱️ Beginner: 4-6 weeks
⏱️ Concealed Carry: 6-8 weeks
⏱️ Competitive: 8-12 weeks
🎯 Learn at your own pace - no time pressure`
  },

  support: {
    overview: `**Get Help - Multiple Options:**
🤖 **This AI Chat** (24/7) - Instant answers
📧 **Email:** support@wisedefense.com (2-hour response)
☎️ **Phone:** 1-800-WISE-DEF (Mon-Fri 8 AM-8 PM EST)
💬 **Discord:** Join our community
📱 **Telegram:** @WiseDefenseBot (quick questions)
🎥 **Video Call:** Schedule with instructor

Which would help most?`,

    urgent: `**For Urgent Issues:**
☎️ Call: 1-800-WISE-DEF
⏰ Mon-Fri: 8 AM - 8 PM EST
🎯 Available for technical & billing issues`,

    community: `**Join the Community:**
💬 Discord: Chat with instructors & students
🏆 Leaderboards: See top performers weekly
📚 Forum: Share tips & experiences
👥 Study groups: Connect with other students
📚 Resource library: Training guides & videos`
  },

  faq: {
    age: `**Age Requirements?**
✅ 18+ for all courses
👶 Youth programs available (12-17)
📧 Email support@wisedefense.com for youth`,

    equipment: `**Do I need my own gun?**
❌ No! We provide:
✅ Range access
✅ Firearms to use
✅ Safety equipment
💡 Bring yours if you prefer - we accommodate`,

    refund: `**Full Refund Policy:**
✅ 30-day money-back guarantee
✅ Cancel within 30 days: Full refund
📅 After 30 days: Cancel anytime (no charges after)
🎯 Zero hassle refunds`,

    travel: `**Can I learn from home?**
✅ VIP: Weekly video coaching available
✅ All courses: Online theory available
📍 Range practice: Book in-person sessions as needed
🌍 Traveling? Use video coaching`,

    nra: `**Is your instructor NRA certified?**
✅ Yes! 15+ years experience
🏆 NRA certified instructor
📜 State certified
🎓 Continuing education annually`
  }
};

/**
 * Smart category detection with multi-keyword patterns
 */
function detectCategory(message: string): { category: string; subcategory?: string } | null {
  const lower = message.toLowerCase();

  // Pricing queries
  if (lower.match(/price|cost|much|tier|membership|subscription|fee|charge|afford/)) {
    if (lower.match(/compar|vs|difference|better/)) return { category: 'pricing', subcategory: 'comparison' };
    if (lower.match(/guarantee|money.*back|refund|return/)) return { category: 'pricing', subcategory: 'guarantee' };
    return { category: 'pricing', subcategory: 'overview' };
  }

  // Booking queries
  if (lower.match(/book|schedule|appointment|session|time|when|available|reserve/)) {
    if (lower.match(/reschedule|cancel|modify|change/)) return { category: 'booking', subcategory: 'cancellation' };
    if (lower.match(/how|steps|process/)) return { category: 'booking', subcategory: 'how' };
    if (lower.match(/time|hours|open|when/)) return { category: 'booking', subcategory: 'availability' };
    return { category: 'booking', subcategory: 'how' };
  }

  // Course queries
  if (lower.match(/course|training|program|learn|class|lesson|content/)) {
    if (lower.match(/requirement|prerequisite|background|beginner|start/)) return { category: 'courses', subcategory: 'prerequisites' };
    if (lower.match(/how long|duration|weeks|time/)) return { category: 'courses', subcategory: 'duration' };
    return { category: 'courses', subcategory: 'overview' };
  }

  // Support queries
  if (lower.match(/help|support|contact|reach|question|issue|problem/)) {
    if (lower.match(/urgent|emergency|asap|now|immediately/)) return { category: 'support', subcategory: 'urgent' };
    if (lower.match(/community|discord|forum|group|forum|chat|social/)) return { category: 'support', subcategory: 'community' };
    return { category: 'support', subcategory: 'overview' };
  }

  // FAQ queries
  if (lower.match(/age|old|young|kid|child|youth/)) return { category: 'faq', subcategory: 'age' };
  if (lower.match(/gun|rifle|weapon|equipment|gear|provide/)) return { category: 'faq', subcategory: 'equipment' };
  if (lower.match(/guarantee|refund|money.*back/)) return { category: 'faq', subcategory: 'refund' };
  if (lower.match(/home|online|virtual|remote|travel|distance/)) return { category: 'faq', subcategory: 'travel' };
  if (lower.match(/certified|nra|credential|background|experience/)) return { category: 'faq', subcategory: 'nra' };

  return null;
}

/**
 * Detect frustration sentiment
 */
function detectFrustration(message: string): { isFrustrated: boolean; score: number } {
  const frustrated = message.toLowerCase();

  const frustrationKeywords = [
    'angry', 'frustrated', 'annoyed', 'upset', 'mad', 'hate', 'terrible', 'awful',
    'broken', 'doesn\'t work', 'not working', 'error', 'problem', 'issue', 'help',
    'urgent', 'asap', 'now', 'immediately', 'please help', 'stuck', 'confused',
    'waste', 'wasted', 'never', 'always fails', 'can\'t', 'won\'t', 'charging wrong',
    'refund', 'cancel', 'quit', 'leave', 'fed up', 'sick of', 'tired of'
  ];

  const allCapitalWords = message.split(' ').filter(w => /^[A-Z]{2,}$/.test(w)).length;
  let score = 0;

  // Check frustration keywords: +0.3 each
  frustrationKeywords.forEach(kw => {
    if (frustrated.includes(kw)) score += 0.3;
  });

  // All caps intensity: +0.2 per word (max 0.6)
  if (allCapitalWords > 0) {
    score += Math.min(0.6, allCapitalWords * 0.2);
  }

  // Exclamation marks intensity: +0.1 per ! (max 0.5)
  const exclamations = (message.match(/!/g) || []).length;
  if (exclamations > 0) {
    score += Math.min(0.5, exclamations * 0.1);
  }

  // Question marks (repeated): +0.1 per extra ?
  const questions = (message.match(/\?/g) || []).length;
  if (questions > 2) {
    score += Math.min(0.3, (questions - 2) * 0.1);
  }

  score = Math.min(1.0, score);

  return {
    isFrustrated: score >= 0.5,
    score: parseFloat(score.toFixed(2))
  };
}

/**
 * Call Hermes AI agent for complex questions
 */
async function callHermesAgent(userMessage: string): Promise<string | null> {
  const ollama_url = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'mistral';

  try {
    console.log(`[CHAT] Calling Hermes (${model}) at ${ollama_url}`);

    // System prompt for Wise Defense customer service
    const systemPrompt = `You are Hermes, a helpful AI assistant for Wise Defense LLC - a premium firearms training academy.
You provide accurate, friendly, and professional customer service about:
- Training courses (Beginner, Concealed Carry, Competitive Shooting)
- Membership tiers (Starter $99, Pro $199, VIP $399)
- Booking and scheduling sessions
- Course requirements and prerequisites
- Payment and refund policies
- Support contact information

Be concise (1-2 short paragraphs), friendly, and professional. If asked about something outside your scope, offer to connect them with support@wisedefense.com or 1-800-WISE-DEF.`;

    const response = await fetch(`${ollama_url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `System: ${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 200
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      console.error(`[CHAT] Ollama error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const answer = data.response?.trim() || null;

    if (answer) {
      console.log(`[CHAT] ✅ Hermes response received (${answer.length} chars)`);
    }

    return answer;
  } catch (error: any) {
    console.error(`[CHAT] Hermes/Ollama error: ${error.message}`);
    return null;
  }
}

/**
 * Send Discord alert for chat activity
 */
async function sendDiscordAlert(type: 'escalation' | 'new_conversation' | 'quick_reply' | 'high_priority', data: any) {
  try {
    const webhookUrl = process.env.DISCORD_ALERTS_WEBHOOK_URL || process.env.DISCORD_NEWS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('[CHAT] No Discord webhook configured');
      return;
    }

    let embed: any = {};

    if (type === 'escalation') {
      embed = {
        title: '🚨 Chat Escalation Alert',
        description: `User showing signs of frustration`,
        color: 16711680, // Red
        fields: [
          { name: 'User ID', value: data.userId, inline: true },
          { name: 'Frustration Score', value: `${(data.frustrationScore * 100).toFixed(0)}%`, inline: true },
          { name: 'Conversation ID', value: data.conversationId, inline: false },
          { name: 'Last Message', value: data.lastMessage.substring(0, 200), inline: false },
        ],
      };
    } else if (type === 'new_conversation') {
      embed = {
        title: '💬 New Chat Conversation',
        description: `User started a new chat session`,
        color: 6737151, // Blue
        fields: [
          { name: 'User ID', value: data.userId, inline: true },
          { name: 'Channel', value: data.channel || 'web', inline: true },
          { name: 'Conversation ID', value: data.conversationId, inline: false },
          { name: 'Time', value: new Date().toLocaleTimeString(), inline: false },
        ],
      };
    } else if (type === 'quick_reply') {
      const actionEmoji = {
        booking: '📅',
        pricing: '💰',
        courses: '📖',
        contact: '☎️',
        escalate: '👤',
      };
      embed = {
        title: `${actionEmoji[data.action] || '⚡'} Quick Reply Action`,
        description: `User clicked a quick reply button`,
        color: 15105570, // Orange
        fields: [
          { name: 'Action', value: data.action, inline: true },
          { name: 'Label', value: data.label, inline: true },
          { name: 'User ID', value: data.userId, inline: false },
          { name: 'Conversation ID', value: data.conversationId, inline: false },
        ],
      };
    } else if (type === 'high_priority') {
      embed = {
        title: '⭐ High Priority Message',
        description: `User asked about something important`,
        color: 16776960, // Yellow
        fields: [
          { name: 'Topic', value: data.topic, inline: true },
          { name: 'User ID', value: data.userId, inline: true },
          { name: 'Message', value: data.message.substring(0, 150), inline: false },
          { name: 'Conversation ID', value: data.conversationId, inline: false },
        ],
      };
    }

    embed.timestamp = new Date().toISOString();

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });

    console.log(`[CHAT] ${type} alert sent to Discord`);
  } catch (error) {
    console.error('[CHAT] Failed to send Discord alert:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.slice(7);

    let userId: string | null = null;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = String(payload.userId);
      }
    }

    if (!userId) {
      userId = 'guest';
    }

    const { message, conversationId, channel = 'web' } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // STEP 0: Detect frustration
    const frustration = detectFrustration(message);
    console.log(`[CHAT] Frustration score: ${frustration.score} (${frustration.isFrustrated ? 'FRUSTRATED' : 'ok'})`);

    let convId = conversationId;
    let isNewConversation = false;

    if (!convId) {
      try {
        const convResult = await query(
          `INSERT INTO conversations (user_id, channel, status, created_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING id`,
          [userId, channel, 'active']
        );
        convId = convResult.rows[0].id;
        isNewConversation = true;

        // Alert Discord for new conversation
        await sendDiscordAlert('new_conversation', {
          userId,
          channel,
          conversationId: convId
        });
      } catch (dbError) {
        convId = Date.now().toString();
      }
    }

    // Check frustration history in this conversation
    let frustrationCount = 0;
    try {
      const historyResult = await query(
        `SELECT COUNT(*) as count FROM conversation_messages
         WHERE conversation_id = $1 AND frustration_score >= 0.5`,
        [convId]
      );
      frustrationCount = parseInt(historyResult.rows[0].count) || 0;
    } catch (dbError) {
      console.log('[CHAT] Could not check frustration history');
    }

    // Detect high-priority topics
    const highPriorityTopics = ['booking', 'payment', 'refund', 'urgent', 'help', 'emergency'];
    const isHighPriority = highPriorityTopics.some(topic => message.toLowerCase().includes(topic));

    // Auto-escalate if 2+ frustrated messages
    let shouldEscalate = frustrationCount >= 1 && frustration.isFrustrated;
    if (shouldEscalate) {
      console.log('[CHAT] 🚨 AUTO-ESCALATING - User frustrated multiple times');
      await sendDiscordAlert('escalation', {
        userId,
        conversationId: convId,
        frustrationScore: frustration.score,
        lastMessage: message
      });
    }

    // Alert on high-priority topics
    if (isHighPriority && !isNewConversation) {
      const topic = highPriorityTopics.find(t => message.toLowerCase().includes(t)) || 'general';
      await sendDiscordAlert('high_priority', {
        userId,
        conversationId: convId,
        topic,
        message
      });
    }

    let assistantMessage = '';
    let source = 'cache';

    // STEP 1: Smart category detection
    const detected = detectCategory(message);
    if (detected) {
      const { category, subcategory } = detected;
      const kb = KNOWLEDGE_BASE[category];
      const answer = kb?.[subcategory || 'default'] || kb?.['overview'];

      if (answer) {
        console.log(`[CHAT] Knowledge base hit: ${category}/${subcategory || 'default'}`);
        assistantMessage = answer;
        source = 'knowledge-base';
      }
    }

    // STEP 2: Hermes AI for complex questions
    if (!assistantMessage) {
      console.log('[CHAT] Cache miss - trying Hermes agent');
      const agentResponse = await callHermesAgent(message);

      if (agentResponse) {
        assistantMessage = agentResponse;
        source = 'hermes-agent';
      } else {
        // STEP 3: Fallback response
        assistantMessage = `I'm not entirely sure about that, but our team can help! Let me connect you:\n\n📧 **Email:** support@wisedefense.com (2-hour response)\n☎️ **Phone:** 1-800-WISE-DEF (Mon-Fri 8 AM-8 PM EST)\n💬 **Discord:** Join our community chat\n\nWhat specific question can I answer?`;
        source = 'fallback';
      }
    }

    // Save messages (optional)
    try {
      await query(
        `INSERT INTO conversation_messages (conversation_id, sender, content, frustration_score, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [convId, 'user', message, frustration.score]
      );

      await query(
        `INSERT INTO conversation_messages (conversation_id, sender, content, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [convId, 'assistant', assistantMessage]
      );
    } catch (dbError) {
      console.log('[CHAT] Database logging skipped');
    }

    // Generate contextual quick replies based on message
    let quickReplies: any[] = [];

    // If escalating, add "Talk to Human" button
    if (shouldEscalate) {
      assistantMessage = `I understand you're having trouble. Let me connect you with our support team right away. They'll get back to you within 2 hours.\n\n${assistantMessage}`;
      quickReplies = [
        { label: '👤 Talk to Human Now', action: 'escalate', icon: '👤' },
        { label: '❓ Other Question', action: 'reset', icon: '❓' },
      ];
    } else if (source === 'knowledge-base' || source === 'hermes-agent') {
      if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
        quickReplies = [
          { label: '📅 Book Now', action: 'booking', icon: '📅' },
          { label: '❓ Other Questions', action: 'reset', icon: '❓' },
        ];
      } else if (message.toLowerCase().includes('book') || message.toLowerCase().includes('schedule')) {
        quickReplies = [
          { label: '💰 View Pricing', action: 'pricing', icon: '💰' },
          { label: '❓ More Info', action: 'reset', icon: '❓' },
        ];
      } else if (message.toLowerCase().includes('course')) {
        quickReplies = [
          { label: '💰 See Pricing', action: 'pricing', icon: '💰' },
          { label: '📅 Book Session', action: 'booking', icon: '📅' },
        ];
      } else {
        quickReplies = [
          { label: '📅 Book a Session', action: 'booking', icon: '📅' },
          { label: '💰 View Pricing', action: 'pricing', icon: '💰' },
          { label: '❓ Ask Another Q', action: 'reset', icon: '❓' },
        ];
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: convId,
      message: assistantMessage,
      source,
      escalated: shouldEscalate,
      frustrationScore: frustration.score,
      quickReplies
    });
  } catch (error) {
    console.error('[CHAT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', message: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    );
  }
}
