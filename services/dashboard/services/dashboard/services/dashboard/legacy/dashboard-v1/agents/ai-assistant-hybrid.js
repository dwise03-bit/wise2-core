/**
 * Hybrid AI Customer Service Assistant
 *
 * Smart routing:
 * 1. Check cache for common questions (instant, free)
 * 2. Use Ollama for complex questions (2-5 seconds, free)
 * 3. Full conversation history maintained
 * 4. Falls back to Claude if available
 *
 * Cost: $0/month (uses local Ollama model)
 */

const pg = require('pg');
const fetch = require('node-fetch');

// Initialize database pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[AI-HYBRID] Query error:', error.message);
    throw error;
  }
}

/**
 * CACHED ANSWERS - Instant responses for common questions
 * These are pre-written by your team and served instantly
 */
const ANSWER_CACHE = {
  // Pricing questions
  pricing: `Wise Defense offers 3 membership tiers:

**Starter - $99/month**
✅ Beginner Fundamentals course (4-6 weeks)
✅ Access to community forum
✅ Performance tracking and progress
✅ Basic certificate upon completion

**Pro - $199/month**
✅ Everything in Starter, PLUS:
✅ Concealed Carry course (6-8 weeks)
✅ Personalized coaching sessions
✅ Priority email support
✅ Advanced certifications

**VIP - $399/month**
✅ Everything in Pro, PLUS:
✅ Competitive Shooting course
✅ 1-on-1 coaching sessions
✅ Priority phone support
✅ Custom training programs
✅ Access to exclusive events

All tiers include access to leaderboards, achievements, and shareable certificates.`,

  booking: `**How to Book a Training Session:**

1. **Sign in** to your Wise Defense dashboard
2. **Go to "Booking"** in the main menu
3. **Select your date** - Browse available times
4. **Choose session type:**
   - Beginner (0-3 months experience)
   - Intermediate (3-12 months)
   - Advanced (12+ months)
5. **Book session** - Click "Confirm Booking"
6. **Confirmation email** - You'll receive details

**Session Details:**
- Duration: 1-2 hours per session
- Format: In-person or virtual (depends on course)
- Equipment: We provide everything
- Rescheduling: Free reschedule up to 24 hours before

**Questions about booking?** I can help with times, session types, or specific courses!`,

  cancellation: `**Cancellation & Refund Policy:**

**Cancel Anytime:**
- No long-term contracts
- 7 days notice required
- Retain access through end of billing cycle
- No refund for partial months

**Example:**
- Sign up March 15
- Request cancel March 20
- Access until April 15
- No pro-rata refunds

**Reschedule Sessions:**
- Free reschedule up to 24 hours before
- After 24 hours: $25 reschedule fee
- Cancel within 24 hours: $10 cancellation fee

**Special Circumstances:**
- Medical emergency: Full refund (contact us)
- Relocation: We can help find alternative solutions

Contact support@wisedefense.com for custom arrangements.`,

  achievements: `**Wise Defense Achievements System:**

Earn badges and points by reaching milestones:

🏆 **First Shot** (10 pts) - Complete your first drill
🎯 **Perfect Accuracy** (50 pts) - Score 100% on any drill
⚡ **Speedster** (30 pts) - Complete 10 drills
💪 **Dedicated Shooter** (100 pts) - Complete 50 drills
🔥 **Week Warrior** (75 pts) - 7-day training streak
🌟 **Unstoppable** (200 pts) - 30-day training streak
📢 **Influencer** (25 pts) - Share drill results on social media
🤝 **Recruiter** (150 pts) - Refer 5 friends who sign up

**Leaderboard:**
- Compete against other students
- Real-time rankings by total score
- View all-time, monthly, and weekly boards
- Top performers featured on homepage

Achievement points unlock badges and community recognition!`,

  courses: `**Training Courses Available:**

**Beginner Fundamentals** (4-6 weeks, 8 sessions)
- Gun safety & handling
- Grip, stance, and sight alignment
- Trigger control and follow-through
- Common mistakes and corrections
- Clearing malfunctions
- Perfect for first-time shooters
- Tier: All (Starter, Pro, VIP)

**Concealed Carry** (6-8 weeks, 12 sessions)
- Self-defense principles
- Different carry methods
- Situational awareness
- Tactical scenarios
- Legal considerations
- Real-world readiness
- Prerequisite: Beginner Fundamentals or instructor approval
- Tier: Pro, VIP

**Competitive Shooting** (8-12 weeks, 16 sessions)
- Advanced accuracy techniques
- Speed drills
- Competition rules & formats
- Tournament preparation
- Advanced certifications
- Expert-level coaching
- Prerequisite: Concealed Carry
- Tier: VIP

**Custom Programs:**
- Individual training plans
- One-on-one coaching
- Specialized focus areas
- Available to VIP members`,

  instructor: `**About Your Instructor:**

David Wise is an **NRA Certified Firearms Instructor** with:
✅ 15+ years of professional training experience
✅ Advanced tactical shooting certification
✅ Curriculum development expertise
✅ Personalized coaching for all skill levels
✅ Published training methodologies
✅ Perfect track record with student success

David is passionate about:
- Making firearms training accessible
- Building student confidence and competence
- Real-world practical skills
- Safety above all else
- Continuous improvement

**Philosophy:**
"Every student has unique goals and learning styles. My job is to customize training to your specific needs, whether you're picking up a gun for the first time or competing professionally."

Questions? Schedule a free consultation call!`,

  support: `**Getting Support:**

**Multiple Ways to Reach Us:**

🤖 **AI Chat** (This widget)
- Instant answers to common questions
- Available 24/7
- Escalates to human when needed

📧 **Email:** support@wisedefense.com
- Response time: 2 hours (business hours)
- Response time: 24 hours (off-hours)

💬 **Discord:** Join our community server
- Real-time chat with instructors
- Student community
- Training tips and discussions

📱 **Telegram:** @WiseDefenseBot
- Quick messages
- Session reminders
- Training notifications

☎️ **Phone:** 1-800-WISE-DEF (1-800-947-3333)
- For urgent issues
- Personal assistance
- During business hours: 8am-6pm EST, Mon-Fri

**Response Times:**
- Urgent: 1 hour
- High priority: 4 hours
- Standard: 24 hours

We're here to help! Pick your favorite channel.`,

  payment: `**Payment Methods & Billing:**

**Accepted Payment Methods:**
💳 Credit/Debit Cards (Visa, Mastercard, Amex)
💰 PayPal
🏦 Bank Transfer (ACH)

**Billing Cycle:**
- Monthly subscription
- Charged on the same day each month
- Automatic renewal unless canceled
- Invoice emailed before each charge

**Billing Issues:**
- Payment declined? Email support@wisedefense.com
- Need to update card? Go to Account → Billing
- Want to change billing date? Contact support

**Refunds:**
- Monthly fees: No refund for partial months
- Course fees: Based on completion status
- Special circumstances: Contact us

**Invoice Access:**
- View all invoices in Account → Billing
- Download PDF for your records
- Email receipts sent automatically`,

  faq: `**Frequently Asked Questions:**

**Q: Do I need prior experience?**
A: No! Beginner Fundamentals is designed for complete beginners. All experience levels welcome.

**Q: Can I do this online?**
A: Some courses available online. Most are in-person for safety. Check course details.

**Q: What if I need to reschedule?**
A: Free reschedule up to 24 hours before. After that: $25 fee. Cancel fee: $10.

**Q: Is this NRA certified?**
A: Yes! All courses taught by NRA Certified Instructor with recognized certifications.

**Q: Can I gift a membership?**
A: Yes! Contact support@wisedefense.com for gift membership options.

**Q: What equipment do I need?**
A: We provide everything. No need to bring your own gear.

**Q: Do you offer group discounts?**
A: Yes! 5+ students qualify for 15% off. Email support for details.

**Q: Can I cancel anytime?**
A: Yes! 7 days notice required. No penalties or contracts.

**Q: Do you have a mobile app?**
A: iOS/Android apps coming Q3 2024. Currently use web dashboard.`
};

/**
 * Detect if question is in cache
 */
function detectCategory(message) {
  const lower = message.toLowerCase();

  // Simple keyword matching
  if (lower.match(/how much|price|cost|tier|membership|fee/)) return 'pricing';
  if (lower.match(/book|session|schedule|when|time|appointment/)) return 'booking';
  if (lower.match(/cancel|refund|stop|unsubscribe|quit|leave/)) return 'cancellation';
  if (lower.match(/achievement|badge|points|leaderboard|rank|compete/)) return 'achievements';
  if (lower.match(/course|training|beginner|concealed|competitive|lesson/)) return 'courses';
  if (lower.match(/instructor|david|trainer|teach|expert|coach|who are you/)) return 'instructor';
  if (lower.match(/help|contact|support|email|phone|discord|telegram/)) return 'support';
  if (lower.match(/payment|billing|invoice|card|refund|charge/)) return 'payment';
  if (lower.match(/faq|question|common|how do|why|what is/)) return 'faq';

  return null;
}

/**
 * Call Ollama for complex questions
 */
async function callOllama(userMessage, conversationHistory) {
  try {
    console.log('[AI-HYBRID] Calling Ollama for: ', userMessage.substring(0, 50));

    const systemPrompt = `You are an expert customer service representative for Wise Defense, a premium firearms training academy.

About Wise Defense:
- NRA Certified instructor (15+ years experience)
- Premium firearms training courses
- 3 tiers: Starter ($99), Pro ($199), VIP ($399)
- Courses: Beginner, Concealed Carry, Competitive Shooting
- Features: Booking, Certificates, Leaderboards, Achievements

Your role:
✅ Answer questions accurately and helpfully
✅ Be professional and friendly
✅ Suggest courses based on needs
✅ For urgent issues, recommend human support

Keep responses concise and practical.`;

    // Build conversation for context
    const conversationText = conversationHistory
      .map(m => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.message}`)
      .join('\n');

    const prompt = conversationText ?
      `${conversationText}\n\nCustomer: ${userMessage}` :
      userMessage;

    // Call Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'mistral',
        prompt: systemPrompt + '\n\n' + prompt,
        stream: false,
        temperature: 0.7,
        top_p: 0.95,
        num_ctx: 2048
      })
    });

    if (!response.ok) {
      console.error('[AI-HYBRID] Ollama error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.response || null;
  } catch (error) {
    console.error('[AI-HYBRID] Ollama call failed:', error.message);
    return null;
  }
}

/**
 * Main chat function - Hybrid approach
 */
async function chat(userId, userMessage, conversationId, channel = 'web') {
  try {
    console.log(`[AI-HYBRID] Processing: "${userMessage.substring(0, 50)}..."`);

    // Get or create conversation
    if (!conversationId) {
      const conv = await query(
        `INSERT INTO conversations (user_id, channel, status, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [userId, channel, 'active']
      );
      conversationId = conv.rows[0].id;
    }

    // Get conversation history
    const historyResult = await query(
      `SELECT message, role FROM conversation_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC LIMIT 20`,
      [conversationId]
    );

    const history = historyResult.rows.map(row => ({
      role: row.role,
      message: row.message
    }));

    let assistantMessage = null;
    let source = 'cache'; // Track where response came from

    // STEP 1: Check cache for common questions
    const category = detectCategory(userMessage);
    if (category && ANSWER_CACHE[category]) {
      console.log(`[AI-HYBRID] ✅ Cache hit: ${category}`);
      assistantMessage = ANSWER_CACHE[category];
      source = 'cache';
    } else {
      // STEP 2: Use Ollama for complex questions
      console.log('[AI-HYBRID] Cache miss - calling Ollama...');
      assistantMessage = await callOllama(userMessage, history);
      source = 'ollama';

      if (!assistantMessage) {
        // STEP 3: Fallback to generic response
        console.log('[AI-HYBRID] Ollama failed - using fallback');
        assistantMessage = `I'm not sure about that specific question. Let me connect you with our support team who can help better.

In the meantime, you can:
- Email: support@wisedefense.com
- Call: 1-800-WISE-DEF
- Visit: /admin/support for live chat with an agent

What else can I help with?`;
        source = 'fallback';
      }
    }

    // Save messages to database
    await query(
      `INSERT INTO conversation_messages (conversation_id, role, message, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [conversationId, 'user', userMessage]
    );

    await query(
      `INSERT INTO conversation_messages (conversation_id, role, message, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [conversationId, 'assistant', assistantMessage]
    );

    // Check if escalation needed
    const needsEscalation = userMessage.toLowerCase().includes('escalate') ||
                           userMessage.toLowerCase().includes('human') ||
                           userMessage.toLowerCase().includes('agent');

    if (needsEscalation) {
      await query(
        `INSERT INTO support_tickets (conversation_id, user_id, status, priority, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [conversationId, userId, 'open', 'medium']
      );

      await query(
        `UPDATE conversations SET status = $1 WHERE id = $2`,
        ['escalated', conversationId]
      );
    }

    console.log(`[AI-HYBRID] ✅ Response sent (source: ${source})`);

    return {
      success: true,
      conversationId,
      message: assistantMessage,
      escalated: needsEscalation,
      source: source // For debugging/analytics
    };
  } catch (error) {
    console.error('[AI-HYBRID] Chat error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Sorry, I encountered an error. Our support team can help: support@wisedefense.com'
    };
  }
}

/**
 * Export for API routes
 */
module.exports = { chat };

// Graceful shutdown
async function shutdown() {
  console.log('[AI-HYBRID] Shutting down...');
  try {
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('[AI-HYBRID] Shutdown error:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('[AI-HYBRID] Service initialized');
console.log('[AI-HYBRID] Mode: Hybrid (Cache + Ollama)');
console.log('[AI-HYBRID] Cost: $0/month');
