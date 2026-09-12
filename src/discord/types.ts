/**
 * WISE² Discord Integration Types
 */

export interface DiscordIntent {
  intent: string;
  confidence: number;
  category: IntentCategory;
  source: 'discord';
  userId: string;
  timestamp: Date;
  error?: string;
}

export interface DiscordRouteRequest {
  intent: string;
  userId: string;
  source: 'discord';
  metadata: DiscordMetadata;
}

export interface DiscordMetadata {
  discordUserId: string;
  discordUsername?: string;
  channel?: string;
  guildId?: string;
  messageId?: string;
  timestamp: string;
  role?: 'viewer' | 'operator' | 'owner';
  originalInput?: string;
}

export interface DiscordRouteResult {
  intent: string;
  status: 'success' | 'pending' | 'failed' | 'denied';
  message?: string;
  description?: string;
  data?: Record<string, unknown>;
  confirmationId?: string;
  error?: string;
  riskLevel?: 0 | 1 | 2 | 3;
  requiresConfirmation?: boolean;
}

export interface DiscordConfirmation {
  confirmationId: string;
  intent: string;
  userId: string;
  approved?: boolean;
  token?: string;
  status: 'pending' | 'approved' | 'denied';
  expiresAt: Date;
}

export interface DiscordConfirmationResponse {
  confirmationId: string;
  status: 'approved' | 'denied';
  result?: DiscordRouteResult;
  error?: string;
}

export interface DiscordCommandConfig {
  name: string;
  description: string;
  options?: DiscordCommandOption[];
}

export interface DiscordCommandOption {
  name: string;
  description: string;
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role';
  required?: boolean;
  choices?: Array<{ name: string; value: string }>;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedConfig {
  title: string;
  description: string;
  color: string;
  fields: DiscordEmbedField[];
  footer: { text: string };
  timestamp: Date;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  isBot: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'dm' | 'group_dm' | 'category' | 'news' | 'store';
  guildId?: string;
}

export interface DiscordBotConfig {
  token: string;
  intents: number[];
  impServiceUrl: string;
  logDir: string;
  memoryDir: string;
  port: number;
  prefix?: string;
}

export interface DiscordBotStatus {
  service: string;
  uptime: string;
  totalIntents: number;
  totalConfirmations: number;
  connectedGuilds: number;
  lastActivity: Date;
}

export interface DiscordInteractionResponse {
  content?: string;
  embeds?: DiscordEmbedConfig[];
  components?: DiscordActionRow[];
  ephemeral?: boolean;
}

export interface DiscordActionRow {
  type: 'buttons' | 'select_menu';
  components: DiscordComponent[];
}

export interface DiscordComponent {
  type: 'button' | 'select_menu';
  customId: string;
  label?: string;
  style?: 'primary' | 'secondary' | 'success' | 'danger' | 'link';
  emoji?: { name: string; id?: string };
  options?: DiscordSelectOption[];
}

export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: { name: string; id?: string };
}

export type IntentCategory =
  | 'query'
  | 'command'
  | 'management'
  | 'automation'
  | 'integration'
  | 'alert'
  | 'status'
  | 'unknown';

export interface DiscordAuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  intent: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface DiscordErrorResponse {
  error: string;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
