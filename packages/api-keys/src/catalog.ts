import type { ApiField, ApiService, Profile, ProfileId } from './types.ts';
import { PROFILE_IDS } from './types.ts';

export const PROFILES: Profile[] = [
  {
    id: 'core',
    name: 'Core business',
    summary: 'Payments, Google login, Discord, and email. Start here for most clients.',
  },
  {
    id: 'phone',
    name: 'Phone + AI',
    summary: 'Core keys plus Twilio and OpenAI for the WISE² phone line.',
  },
  {
    id: 'field-service',
    name: 'Field service',
    summary: 'Phone profile plus Jobber so jobs, customers, and invoices can sync.',
  },
  {
    id: 'hvac',
    name: 'HVAC / Get Down',
    summary: 'Same as field service. Use for HVAC and pressure-washing clients.',
  },
  {
    id: 'studio',
    name: 'Studio / live',
    summary: 'YouTube, Twitch, and music generation keys.',
  },
  {
    id: 'full',
    name: 'Full stack',
    summary: 'Every client-facing integration WISE² can store.',
  },
];

export const SERVICES: ApiService[] = [
  { id: 'stripe', name: 'Stripe', category: 'Payments', summary: 'Cards, subscriptions, and invoices' },
  { id: 'google', name: 'Google', category: 'Login', summary: 'Sign in with Google' },
  { id: 'discord', name: 'Discord', category: 'Comms', summary: 'Bot, guild, and alerts' },
  { id: 'sendgrid', name: 'SendGrid', category: 'Email', summary: 'Transactional email' },
  { id: 'resend', name: 'Resend', category: 'Email', summary: 'Alternative transactional email' },
  { id: 'twilio', name: 'Twilio', category: 'Phone', summary: 'Voice and SMS' },
  { id: 'openai', name: 'OpenAI', category: 'AI', summary: 'Phone agent and text models' },
  { id: 'anthropic', name: 'Anthropic', category: 'AI', summary: 'Claude models' },
  { id: 'jobber', name: 'Jobber', category: 'Field', summary: 'Customers, jobs, and invoices' },
  { id: 'github', name: 'GitHub', category: 'Developer', summary: 'Repo access for the client workspace' },
  { id: 'youtube', name: 'YouTube', category: 'Media', summary: 'Channel and live video' },
  { id: 'twitch', name: 'Twitch', category: 'Media', summary: 'Live streaming' },
  { id: 'suno', name: 'Suno', category: 'Media', summary: 'Music generation' },
];

const CORE: ProfileId[] = ['core', 'phone', 'field-service', 'hvac', 'full'];
const PHONE: ProfileId[] = ['phone', 'field-service', 'hvac', 'full'];
const FIELD: ProfileId[] = ['field-service', 'hvac', 'full'];
const STUDIO: ProfileId[] = ['studio', 'full'];
const FULL: ProfileId[] = ['full'];

export const FIELDS: ApiField[] = [
  {
    envVariable: 'STRIPE_SECRET_KEY',
    name: 'Stripe Secret Key',
    serviceId: 'stripe',
    requiredIn: CORE,
    optionalIn: STUDIO,
    prefix: ['sk_live_', 'sk_test_'],
    minLength: 20,
    docsUrl: 'https://dashboard.stripe.com/apikeys',
    clientSteps: [
      'Open https://dashboard.stripe.com/apikeys while signed into the client Stripe account.',
      'Under Standard keys, click Reveal for Secret key.',
      'Copy the full key (starts with sk_live_ or sk_test_).',
      'Paste it here. We store it privately and never show the full value again.',
    ],
  },
  {
    envVariable: 'STRIPE_PUBLISHABLE_KEY',
    name: 'Stripe Publishable Key',
    serviceId: 'stripe',
    requiredIn: CORE,
    optionalIn: STUDIO,
    prefix: ['pk_live_', 'pk_test_'],
    minLength: 20,
    docsUrl: 'https://dashboard.stripe.com/apikeys',
    clientSteps: [
      'On the same Stripe API keys page, copy the Publishable key.',
      'It starts with pk_live_ or pk_test_ and is safe to use in the browser.',
    ],
  },
  {
    envVariable: 'STRIPE_WEBHOOK_SECRET',
    name: 'Stripe Webhook Secret',
    serviceId: 'stripe',
    requiredIn: [],
    optionalIn: CORE.concat(STUDIO),
    prefix: 'whsec_',
    minLength: 16,
    docsUrl: 'https://dashboard.stripe.com/webhooks',
    clientSteps: [
      'Open https://dashboard.stripe.com/webhooks.',
      'Open the WISE² endpoint (or create one if we asked you to).',
      'Reveal Signing secret and copy the value starting with whsec_.',
    ],
  },
  {
    envVariable: 'GOOGLE_CLIENT_ID',
    name: 'Google Client ID',
    serviceId: 'google',
    requiredIn: CORE,
    optionalIn: [],
    minLength: 20,
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    clientSteps: [
      'Open Google Cloud Console → APIs & Services → Credentials.',
      'Open the OAuth 2.0 Client ID used for WISE² (Web application).',
      'Copy the Client ID.',
    ],
  },
  {
    envVariable: 'GOOGLE_CLIENT_SECRET',
    name: 'Google Client Secret',
    serviceId: 'google',
    requiredIn: CORE,
    optionalIn: [],
    minLength: 12,
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    clientSteps: [
      'On the same OAuth client page, copy the Client secret.',
      'If you do not see it, click Reset secret, then copy the new value.',
    ],
  },
  {
    envVariable: 'DISCORD_BOT_TOKEN',
    name: 'Discord Bot Token',
    serviceId: 'discord',
    requiredIn: CORE,
    optionalIn: [],
    minLength: 20,
    docsUrl: 'https://discord.com/developers/applications',
    clientSteps: [
      'Open https://discord.com/developers/applications.',
      'Select the client bot → Bot → Reset Token or copy the existing token.',
      'Paste the token here. Treat it like a password.',
    ],
  },
  {
    envVariable: 'DISCORD_GUILD_ID',
    name: 'Discord Server ID',
    serviceId: 'discord',
    requiredIn: CORE,
    optionalIn: [],
    minLength: 8,
    docsUrl: 'https://support.discord.com/hc/en-us/articles/206346498',
    clientSteps: [
      'In Discord, turn on User Settings → Advanced → Developer Mode.',
      'Right-click the client server name → Copy Server ID.',
    ],
  },
  {
    envVariable: 'DISCORD_WEBHOOK_URL',
    name: 'Discord Alerts Webhook',
    serviceId: 'discord',
    requiredIn: [],
    optionalIn: CORE,
    prefix: 'https://discord.com/api/webhooks/',
    minLength: 40,
    docsUrl: 'https://support.discord.com/hc/en-us/articles/228383668',
    clientSteps: [
      'In the client Discord server, open a channel → Edit Channel → Integrations → Webhooks.',
      'Create a webhook named WISE² Alerts and copy the webhook URL.',
    ],
  },
  {
    envVariable: 'SENDGRID_API_KEY',
    name: 'SendGrid API Key',
    serviceId: 'sendgrid',
    requiredIn: [],
    optionalIn: CORE,
    prefix: 'SG.',
    minLength: 20,
    docsUrl: 'https://app.sendgrid.com/settings/api_keys',
    clientSteps: [
      'Open https://app.sendgrid.com/settings/api_keys.',
      'Create an API key with Mail Send permission.',
      'Copy it immediately. SendGrid will not show it again.',
    ],
  },
  {
    envVariable: 'RESEND_API_KEY',
    name: 'Resend API Key',
    serviceId: 'resend',
    requiredIn: [],
    optionalIn: CORE,
    prefix: 're_',
    minLength: 10,
    docsUrl: 'https://resend.com/api-keys',
    clientSteps: [
      'Open https://resend.com/api-keys.',
      'Create a key and copy the value starting with re_.',
    ],
  },
  {
    envVariable: 'TWILIO_ACCOUNT_SID',
    name: 'Twilio Account SID',
    serviceId: 'twilio',
    requiredIn: PHONE,
    optionalIn: [],
    prefix: 'AC',
    minLength: 32,
    docsUrl: 'https://console.twilio.com',
    clientSteps: [
      'Open https://console.twilio.com.',
      'Copy Account SID from the console home (starts with AC).',
    ],
  },
  {
    envVariable: 'TWILIO_AUTH_TOKEN',
    name: 'Twilio Auth Token',
    serviceId: 'twilio',
    requiredIn: PHONE,
    optionalIn: [],
    minLength: 16,
    docsUrl: 'https://console.twilio.com',
    clientSteps: [
      'On the Twilio console home, click the eye icon next to Auth Token.',
      'Copy the token. Do not send it in email or chat logs.',
    ],
  },
  {
    envVariable: 'TWILIO_PHONE_NUMBER',
    name: 'Twilio Phone Number',
    serviceId: 'twilio',
    requiredIn: PHONE,
    optionalIn: [],
    prefix: '+',
    minLength: 10,
    docsUrl: 'https://console.twilio.com/us1/develop/phone-numbers/manage/incoming',
    clientSteps: [
      'Open Phone Numbers → Manage → Active numbers.',
      'Copy the number in E.164 form, for example +19195551212.',
    ],
  },
  {
    envVariable: 'OPENAI_API_KEY',
    name: 'OpenAI API Key',
    serviceId: 'openai',
    requiredIn: PHONE,
    optionalIn: STUDIO.concat(FULL),
    prefix: 'sk-',
    minLength: 20,
    docsUrl: 'https://platform.openai.com/api-keys',
    clientSteps: [
      'Open https://platform.openai.com/api-keys.',
      'Create a key, copy it once, and paste it here.',
    ],
  },
  {
    envVariable: 'ANTHROPIC_API_KEY',
    name: 'Anthropic API Key',
    serviceId: 'anthropic',
    requiredIn: [],
    optionalIn: PHONE.concat(STUDIO),
    prefix: 'sk-ant-',
    minLength: 20,
    docsUrl: 'https://console.anthropic.com/settings/keys',
    clientSteps: [
      'Open https://console.anthropic.com/settings/keys.',
      'Create a key and copy the value starting with sk-ant-.',
    ],
  },
  {
    envVariable: 'JOBBER_ACCOUNT_ID',
    name: 'Jobber Account ID',
    serviceId: 'jobber',
    requiredIn: FIELD,
    optionalIn: [],
    minLength: 4,
    docsUrl: 'https://app.getjobber.com',
    clientSteps: [
      'Sign in at https://app.getjobber.com.',
      'Open Settings → Account and copy the Account ID.',
    ],
  },
  {
    envVariable: 'JOBBER_ACCESS_TOKEN',
    name: 'Jobber Access Token',
    serviceId: 'jobber',
    requiredIn: FIELD,
    optionalIn: [],
    minLength: 16,
    docsUrl: 'https://app.getjobber.com',
    clientSteps: [
      'In Jobber, open Settings → API (or Developers).',
      'Create a personal access token named WISE² Revenue Engine, or copy an existing one.',
      'Copy it immediately if Jobber only shows it once.',
    ],
  },
  {
    envVariable: 'GITHUB_TOKEN',
    name: 'GitHub Token',
    serviceId: 'github',
    requiredIn: [],
    optionalIn: FULL,
    prefix: ['ghp_', 'github_pat_'],
    minLength: 20,
    docsUrl: 'https://github.com/settings/tokens',
    clientSteps: [
      'Open https://github.com/settings/tokens.',
      'Create a fine-grained token with access to the client repo.',
      'Copy the token starting with ghp_ or github_pat_.',
    ],
  },
  {
    envVariable: 'YOUTUBE_API_KEY',
    name: 'YouTube API Key',
    serviceId: 'youtube',
    requiredIn: STUDIO,
    optionalIn: FULL,
    minLength: 16,
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    clientSteps: [
      'In Google Cloud, enable YouTube Data API v3.',
      'Create an API key and copy it.',
    ],
  },
  {
    envVariable: 'TWITCH_CLIENT_ID',
    name: 'Twitch Client ID',
    serviceId: 'twitch',
    requiredIn: [],
    optionalIn: STUDIO,
    minLength: 8,
    docsUrl: 'https://dev.twitch.tv/console/apps',
    clientSteps: [
      'Open https://dev.twitch.tv/console/apps.',
      'Open the client app and copy the Client ID.',
    ],
  },
  {
    envVariable: 'TWITCH_CLIENT_SECRET',
    name: 'Twitch Client Secret',
    serviceId: 'twitch',
    requiredIn: [],
    optionalIn: STUDIO,
    minLength: 8,
    docsUrl: 'https://dev.twitch.tv/console/apps',
    clientSteps: [
      'On the same Twitch app page, generate or copy the Client Secret.',
    ],
  },
  {
    envVariable: 'SUNO_API_KEY',
    name: 'Suno API Key',
    serviceId: 'suno',
    requiredIn: [],
    optionalIn: STUDIO,
    minLength: 8,
    docsUrl: 'https://suno.com',
    clientSteps: [
      'Open the Suno developer or account API settings the client was given.',
      'Copy the API key.',
    ],
  },
];

export function isProfileId(value: string): value is ProfileId {
  return (PROFILE_IDS as readonly string[]).includes(value);
}

export function getProfile(id: string): Profile {
  const profile = PROFILES.find((item) => item.id === id);
  if (!profile) {
    throw new Error(`Unknown profile: ${id}. Use one of: ${PROFILE_IDS.join(', ')}`);
  }
  return profile;
}

export function getService(id: string): ApiService | undefined {
  return SERVICES.find((item) => item.id === id);
}

export function getField(envVariable: string): ApiField | undefined {
  return FIELDS.find((field) => field.envVariable === envVariable);
}

export function fieldsForProfile(profile: ProfileId): ApiField[] {
  return FIELDS.filter(
    (field) => field.requiredIn.includes(profile) || field.optionalIn.includes(profile),
  );
}

export function isRequired(field: ApiField, profile: ProfileId): boolean {
  return field.requiredIn.includes(profile);
}
