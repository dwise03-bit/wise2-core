/**
 * Intent Classifier - NLP-based message routing
 *
 * Classifies natural language requests into WISE² intents
 * without requiring explicit slash commands.
 */

import { Intent } from '../types';

const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  // Information & Reporting
  [Intent.CHAT]: [/^(hey|hi|hello|bye|thanks|ok|alright|good|nice|cool)/i],
  [Intent.STATUS]: [
    /\bstatus\b/i,
    /what'?s (?:the )?status/i,
    /how (?:is|are) (?:things|services)/i,
    /\bup\b/i,
    /running\?/i,
  ],
  [Intent.HEALTH]: [
    /\bhealth\b/i,
    /health check/i,
    /system health/i,
    /\bdoctor\b/i,
    /diagnos/i,
  ],
  [Intent.SEARCH]: [
    /search/i,
    /find/i,
    /look (?:for|up)/i,
    /query/i,
    /what is/i,
  ],
  [Intent.MEMORY]: [
    /remember/i,
    /memory/i,
    /note/i,
    /save/i,
    /forget/i,
  ],
  [Intent.REPORT]: [
    /report/i,
    /summary/i,
    /analyze/i,
    /show me/i,
    /give me/i,
  ],

  // Customer & Business
  [Intent.CUSTOMER]: [
    /customer/i,
    /client/i,
    /account/i,
    /tenant/i,
    /customer list/i,
  ],
  [Intent.LEAD]: [
    /lead/i,
    /prospect/i,
    /pipeline/i,
    /conversion/i,
    /follow[- ]?up/i,
  ],
  [Intent.CRM]: [
    /crm/i,
    /relationship/i,
    /contact/i,
    /opportunity/i,
  ],
  [Intent.DEMO]: [
    /demo/i,
    /demonstration/i,
    /showcase/i,
    /try it/i,
    /test drive/i,
  ],
  [Intent.CONTENT]: [
    /content/i,
    /copy/i,
    /write/i,
    /generate/i,
    /create/i,
  ],

  // Development & Coding
  [Intent.CODE]: [
    /code/i,
    /implement/i,
    /build/i,
    /develop/i,
    /feature/i,
  ],
  [Intent.REVIEW]: [
    /review/i,
    /audit/i,
    /check/i,
    /inspect/i,
    /refactor/i,
  ],
  [Intent.DEBUG]: [
    /debug/i,
    /error/i,
    /broken/i,
    /fix/i,
    /issue/i,
    /bug/i,
  ],
  [Intent.BUILD]: [
    /build/i,
    /compile/i,
    /test/i,
    /run tests/i,
  ],
  [Intent.TEST]: [
    /test/i,
    /acceptance/i,
    /verify/i,
    /validate/i,
  ],

  // AI & Models
  [Intent.LOCAL_AI]: [
    /local (?:ai|model)/i,
    /ollama/i,
    /mac (?:ai|model)/i,
    /gpu (?:server|model)/i,
  ],
  [Intent.REMOTE_AI]: [
    /claude/i,
    /anthropic/i,
    /remote (?:ai|model)/i,
    /cloud (?:ai|model)/i,
  ],
  [Intent.REASONING]: [
    /reason/i,
    /think/i,
    /analyze/i,
    /consider/i,
  ],

  // Operations
  [Intent.DEVOPS]: [
    /devops/i,
    /ops/i,
    /operations/i,
    /infrastructure/i,
    /server/i,
  ],
  [Intent.DEPLOY]: [
    /deploy/i,
    /release/i,
    /launch/i,
    /roll out/i,
    /push/i,
  ],
  [Intent.INFRASTRUCTURE]: [
    /infra/i,
    /network/i,
    /docker/i,
    /container/i,
    /vpc/i,
  ],
  [Intent.DATABASE]: [
    /database/i,
    /postgres/i,
    /mysql/i,
    /mongo/i,
    /redis/i,
    /sql/i,
    /\bdb\b/i,
  ],
  [Intent.MONITORING]: [
    /monitor/i,
    /alert/i,
    /check (?:on|status)/i,
    /uptime/i,
    /log/i,
  ],

  // Business Modules
  [Intent.HVAC]: [
    /hvac/i,
    /heating/i,
    /cooling/i,
    /thermostat/i,
  ],
  [Intent.DEFENSE]: [
    /defense/i,
    /security/i,
    /radar/i,
    /safety/i,
  ],
  [Intent.TRADING]: [
    /trading/i,
    /aether/i,
    /market/i,
    /crypto/i,
  ],
  [Intent.SOUND_LAB]: [
    /sound\s*lab/i,
    /audio/i,
    /music/i,
  ],
  [Intent.JINGLE_LAB]: [
    /jingle\s*lab/i,
    /composition/i,
  ],
  [Intent.LIVE_STUDIO]: [
    /live\s*studio/i,
    /stream/i,
    /broadcast/i,
  ],

  // System
  [Intent.ADMIN]: [
    /admin/i,
    /lock operations/i,
    /unlock/i,
    /emergency/i,
    /configuration/i,
  ],
  [Intent.SECURITY]: [
    /security/i,
    /authorize/i,
    /permission/i,
    /access/i,
    /secret/i,
  ],
  [Intent.HELP]: [
    /\bhelp\b/i,
    /\bwhat can you/i,
    /\bhow do i\b/i,
    /command/i,
  ],
};

/**
 * Classify a user message into a WISE² intent
 */
export function classifyIntent(text: string): Intent[] {
  const normalized = text.toLowerCase().trim();
  const scores: Map<Intent, number> = new Map();

  // Score each intent based on pattern matches
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;

    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        score++;
      }
    }

    if (score > 0) {
      scores.set(intent as Intent, score);
    }
  }

  // Return intents sorted by score (highest first)
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([intent]) => intent);
}

/**
 * Get the primary intent, or return a default
 */
export function getPrimaryIntent(text: string, defaultIntent = Intent.CHAT): Intent {
  const intents = classifyIntent(text);
  return intents.length > 0 ? intents[0] : defaultIntent;
}

/**
 * Check if text matches an intent strongly
 */
export function intentMatches(text: string, intent: Intent, threshold = 1): boolean {
  const normalized = text.toLowerCase().trim();
  const patterns = INTENT_PATTERNS[intent] || [];

  let matches = 0;
  for (const pattern of patterns) {
    if (pattern.test(normalized)) {
      matches++;
    }
  }

  return matches >= threshold;
}
