/**
 * AI Customer Service Assistant
 *
 * Provides intelligent customer support via:
 * - Web chat widget
 * - Discord DMs
 * - Telegram messages
 * - API endpoints
 *
 * Features:
 * - Natural language understanding
 * - Knowledge base queries
 * - Booking assistance
 * - Membership help
 * - Escalation to human agents
 * - Conversation history
 * - Analytics and reporting
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection
 * - ANTHROPIC_API_KEY: Claude API key
 */

const pg = require('pg');
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize database pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Initialize Anthropic client
const client = new Anthropic();

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[AI-ASSISTANT] Query error:', error.message);
    throw error;
  }
}

/**
 * System prompt for the AI assistant
 */
const SYSTEM_PROMPT = `You are an expert customer service representative for Wise Defense, a premium firearms training academy. Your goal is to provide helpful, accurate, and friendly support.

About Wise Defense:
- NRA Certified instructor with 10+ years experience
- Premium firearms training courses with personalized coaching
- Three membership tiers: Starter ($99/mo), Pro ($199/mo), VIP ($399/mo)
- Services: Beginner Fundamentals, Concealed Carry, Competitive Shooting
- Online booking and session management available
- Certificates of completion for all courses
- Community forum and leaderboards
- Gamification system with achievements

Your capabilities:
1. Answer questions about courses, pricing, and membership tiers
2. Help with booking sessions and scheduling
3. Provide account and membership support
4. Explain features like achievements, leaderboards, and certificates
5. Give training tips and best practices
6. Handle refund and cancellation requests
7. Escalate complex issues to human agents

Important guidelines:
- Be professional and courteous at all times
- If you're unsure about something, say "I'm not sure about that detail. Let me connect you with a human agent who can help."
- For urgent issues (payment problems, security concerns), immediately offer to escalate
- Personalize responses using customer names when available
- Suggest relevant courses based on customer needs
- Keep responses concise but helpful
- Always offer next steps or additional help

If a customer asks to speak with a human agent, respond with:
"I'd be happy to connect you with our support team. They'll get back to you within 2 hours during business hours. What's the main issue you'd like them to help with?"`;

/**
 * Get or create conversation
 */
async function getOrCreateConversation(userId, channel = 'web') {
  try {
    const result = await query(
      `SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create new conversation
    const newConv = await query(
      `INSERT INTO conversations (user_id, channel, status, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, channel, 'active']
    );

    return newConv.rows[0];
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to get/create conversation:', error.message);
    return null;
  }
}

/**
 * Get conversation history
 */
async function getConversationHistory(conversationId) {
  try {
    const result = await query(
      `SELECT message, role, created_at FROM conversation_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 20`,
      [conversationId]
    );

    return result.rows.map(row => ({
      role: row.role,
      content: row.message
    }));
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to get history:', error.message);
    return [];
  }
}

/**
 * Save message to conversation
 */
async function saveMessage(conversationId, role, message) {
  try {
    await query(
      `INSERT INTO conversation_messages (conversation_id, role, message, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [conversationId, role, message]
    );
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to save message:', error.message);
  }
}

/**
 * Get knowledge base context
 */
async function getKnowledgeBase(topic) {
  try {
    const result = await query(
      `SELECT content FROM knowledge_base
       WHERE topic ILIKE $1 OR content ILIKE $2
       LIMIT 3`,
      [`%${topic}%`, `%${topic}%`]
    );

    return result.rows.map(row => row.content).join('\n\n');
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to get knowledge base:', error.message);
    return '';
  }
}

/**
 * Get user context for personalization
 */
async function getUserContext(userId) {
  try {
    const result = await query(
      `SELECT u.first_name, u.email, m.tier, m.created_at
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) return '';

    const user = result.rows[0];
    return `Customer: ${user.first_name || 'there'} | Tier: ${user.tier || 'free'} | Member since: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'new'}`;
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to get user context:', error.message);
    return '';
  }
}

/**
 * Main chat function using Claude API
 */
async function chat(userId, userMessage, conversationId, channel = 'web') {
  try {
    console.log(`[AI-ASSISTANT] Processing message from user ${userId}: "${userMessage}"`);

    // Get or create conversation
    if (!conversationId) {
      const conv = await getOrCreateConversation(userId, channel);
      if (!conv) {
        return {
          success: false,
          error: 'Failed to create conversation',
          message: 'Sorry, I\'m having trouble connecting. Please try again.'
        };
      }
      conversationId = conv.id;
    }

    // Get conversation history and user context
    const history = await getConversationHistory(conversationId);
    const userContext = await getUserContext(userId);
    const knowledgeBase = await getKnowledgeBase(userMessage);

    // Build enhanced system prompt with context
    let enhancedSystem = SYSTEM_PROMPT;
    if (userContext) {
      enhancedSystem += `\n\nCurrent Customer: ${userContext}`;
    }
    if (knowledgeBase) {
      enhancedSystem += `\n\nRelevant Information:\n${knowledgeBase}`;
    }

    // Build messages for Claude
    const messages = [
      ...history,
      { role: 'user', content: userMessage }
    ];

    // Call Claude API
    console.log(`[AI-ASSISTANT] Calling Claude API with ${messages.length} messages`);

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: enhancedSystem,
      messages: messages
    });

    const assistantMessage = response.content[0].text;

    // Save both messages to database
    await saveMessage(conversationId, 'user', userMessage);
    await saveMessage(conversationId, 'assistant', assistantMessage);

    // Check if escalation is needed
    const needsEscalation = assistantMessage.toLowerCase().includes('human agent') ||
                           assistantMessage.toLowerCase().includes('support team') ||
                           userMessage.toLowerCase().includes('escalate') ||
                           userMessage.toLowerCase().includes('human');

    if (needsEscalation) {
      // Create support ticket
      await query(
        `INSERT INTO support_tickets (conversation_id, user_id, status, priority, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [conversationId, userId, 'open', 'medium']
      );

      console.log(`[AI-ASSISTANT] Created support ticket for conversation ${conversationId}`);
    }

    // Update conversation status
    if (needsEscalation) {
      await query(
        `UPDATE conversations SET status = $1 WHERE id = $2`,
        ['escalated', conversationId]
      );
    }

    return {
      success: true,
      conversationId,
      message: assistantMessage,
      escalated: needsEscalation,
      tokens_used: response.usage.output_tokens
    };
  } catch (error) {
    console.error('[AI-ASSISTANT] Chat error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Sorry, I encountered an error. Please try again or contact our support team.'
    };
  }
}

/**
 * Check for support tickets needing attention
 */
async function checkEscalatedTickets() {
  try {
    const result = await query(
      `SELECT * FROM support_tickets WHERE status = $1 ORDER BY created_at ASC LIMIT 5`,
      ['open']
    );

    console.log(`[AI-ASSISTANT] Found ${result.rows.length} open support tickets`);

    return result.rows;
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to check tickets:', error.message);
    return [];
  }
}

/**
 * Update ticket status
 */
async function updateTicketStatus(ticketId, status) {
  try {
    await query(
      `UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, ticketId]
    );
    console.log(`[AI-ASSISTANT] Updated ticket ${ticketId} to ${status}`);
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to update ticket:', error.message);
  }
}

/**
 * Add response to ticket
 */
async function addTicketResponse(ticketId, responderType, response) {
  try {
    await query(
      `INSERT INTO ticket_responses (ticket_id, responder_type, response, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [ticketId, responderType, response]
    );
    console.log(`[AI-ASSISTANT] Added ${responderType} response to ticket ${ticketId}`);
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to add response:', error.message);
  }
}

/**
 * Get analytics
 */
async function getAnalytics() {
  try {
    const result = await query(
      `SELECT
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN status = 'escalated' THEN 1 END) as escalated,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'open') as open_tickets,
        (SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))
         FROM support_tickets WHERE status = 'resolved') as avg_resolution_time_seconds
       FROM conversations`
    );

    return result.rows[0];
  } catch (error) {
    console.error('[AI-ASSISTANT] Failed to get analytics:', error.message);
    return null;
  }
}

/**
 * Scheduled task: Monitor tickets hourly
 */
async function monitorTickets() {
  try {
    const tickets = await checkEscalatedTickets();

    if (tickets.length > 0) {
      console.log(`[AI-ASSISTANT] ⚠️ ${tickets.length} tickets awaiting human attention`);

      // Could send Discord/Telegram alerts here
      // For now, just log them
    }
  } catch (error) {
    console.error('[AI-ASSISTANT] Ticket monitoring error:', error);
  }
}

// Start monitoring
setInterval(monitorTickets, 60 * 60 * 1000); // Every hour

/**
 * Export for API routes
 */
module.exports = {
  chat,
  getOrCreateConversation,
  getConversationHistory,
  checkEscalatedTickets,
  updateTicketStatus,
  addTicketResponse,
  getAnalytics
};

// Graceful shutdown
async function shutdown() {
  console.log('[AI-ASSISTANT] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[AI-ASSISTANT] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[AI-ASSISTANT] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('[AI-ASSISTANT] Service initialized');
