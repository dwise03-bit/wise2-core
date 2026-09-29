/**
 * Discord Integration Utilities
 * Handles Discord webhook notifications and community links
 */

export const DISCORD_CONFIG = {
  serverInvite: process.env.NEXT_PUBLIC_DISCORD_SERVER_INVITE || 'https://discord.gg/wise2',
  webhookUrl: process.env.DISCORD_WEBHOOK_URL,
  communityLink: process.env.NEXT_PUBLIC_DISCORD_COMMUNITY_LINK || 'https://discord.gg/wise2',
};

/**
 * Send message to Discord webhook
 */
export async function sendDiscordNotification(
  message: string,
  options?: {
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    thumbnail?: string;
    authorName?: string;
    authorIcon?: string;
  }
) {
  if (!DISCORD_CONFIG.webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return false;
  }

  try {
    const embeds: any[] = [];

    // Create embed if options provided
    if (options) {
      embeds.push({
        title: options.title,
        description: options.description || message,
        color: options.color || 0x0055ff, // WISE² blue
        fields: options.fields,
        thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
        author: options.authorName
          ? {
              name: options.authorName,
              icon_url: options.authorIcon,
            }
          : undefined,
        timestamp: new Date().toISOString(),
      });
    }

    const payload = {
      content: !options ? message : undefined,
      embeds: embeds.length > 0 ? embeds : undefined,
      username: 'WISE² Bot',
      avatar_url: 'https://wise2.net/logo.png',
    };

    const response = await fetch(DISCORD_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Discord notification error:', error);
    return false;
  }
}

/**
 * Notify Discord on new form submission
 */
export async function notifyFormSubmission(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  type?: 'contact' | 'inquiry' | 'signup';
}) {
  const fields = [
    {
      name: 'Email',
      value: data.email,
      inline: true,
    },
    {
      name: 'Subject',
      value: data.subject,
      inline: true,
    },
    {
      name: 'Message',
      value: data.message.length > 1024 ? data.message.substring(0, 1021) + '...' : data.message,
      inline: false,
    },
  ];

  return sendDiscordNotification('New form submission received', {
    title: `${data.type?.toUpperCase() || 'FORM'} Submission from ${data.name}`,
    color: 0x0055ff,
    fields,
    authorName: data.name,
  });
}

/**
 * Notify Discord on new signup
 */
export async function notifyNewSignup(data: {
  email: string;
  name?: string;
  plan?: string;
}) {
  const fields = [
    {
      name: 'Email',
      value: data.email,
      inline: true,
    },
  ];

  if (data.plan) {
    fields.push({
      name: 'Plan',
      value: data.plan,
      inline: true,
    });
  }

  return sendDiscordNotification('New user signup', {
    title: `New Signup: ${data.name || 'User'}`,
    description: `Email: ${data.email}`,
    color: 0x00ff00, // Green for success
    fields,
  });
}

/**
 * Notify Discord on subscription event
 */
export async function notifySubscriptionEvent(data: {
  customerId: string;
  subscriptionId: string;
  event: 'created' | 'updated' | 'canceled';
  plan?: string;
  amount?: number;
}) {
  const colorMap = {
    created: 0x00ff00, // Green
    updated: 0x0055ff, // Blue
    canceled: 0xff0000, // Red
  };

  const fields = [
    {
      name: 'Subscription ID',
      value: data.subscriptionId,
      inline: false,
    },
    {
      name: 'Event',
      value: data.event.toUpperCase(),
      inline: true,
    },
  ];

  if (data.plan) {
    fields.push({
      name: 'Plan',
      value: data.plan,
      inline: true,
    });
  }

  if (data.amount) {
    fields.push({
      name: 'Amount',
      value: `$${(data.amount / 100).toFixed(2)}`,
      inline: true,
    });
  }

  return sendDiscordNotification('Subscription event', {
    title: `Subscription ${data.event}`,
    color: colorMap[data.event],
    fields,
  });
}
