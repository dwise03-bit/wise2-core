export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DiscordWebhookPayload {
  username: 'WISE² AI Support';
  avatar_url?: string;
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{
      name: string;
      value: string;
      inline: boolean;
    }>;
    timestamp: string;
  }>;
}

export const sendToDiscord = async (
  message: string,
  userEmail: string,
  conversationId: string,
  messageHistory: ChatMessage[]
): Promise<boolean> => {
  // Placeholder: Discord webhook URL will be added later
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.log('[Discord Webhook] Placeholder - not configured yet. Configure in .env.local');
    // Gracefully continue without Discord for now
    return true;
  }

  try {
    const conversationText = messageHistory
      .map(msg => `${msg.role === 'user' ? '👤' : '🤖'} ${msg.content}`)
      .join('\n');

    const payload: DiscordWebhookPayload = {
      username: 'WISE² AI Support',
      embeds: [
        {
          title: 'New Chat Message - Escalation',
          description: message,
          color: 0x0094ff, // Electric blue
          fields: [
            {
              name: 'User Email',
              value: userEmail || 'Unknown',
              inline: true,
            },
            {
              name: 'Conversation ID',
              value: conversationId,
              inline: true,
            },
            {
              name: 'Conversation History',
              value: conversationText || 'No previous messages',
              inline: false,
            },
            {
              name: 'Timestamp',
              value: new Date().toISOString(),
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending to Discord:', error);
    return false;
  }
};
