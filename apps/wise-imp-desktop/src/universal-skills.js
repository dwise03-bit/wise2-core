/**
 * WISE² IMP universal skill registry, V1.
 * Safe metadata only. Handlers must be registered by the host application.
 * Do not advertise unavailable integrations as functional.
 */
export const UNIVERSAL_SKILLS = Object.freeze([
  { id: 'imp.remember', title: 'Remember', triggers: ['remember', 'save a note', 'remind me'], capability: 'memory.write', confirmation: 'write' },
  { id: 'imp.daily', title: 'Daily', triggers: ['my day', 'daily briefing', 'calendar today'], capability: 'calendar.read', confirmation: 'none' },
  { id: 'imp.scan', title: 'Scan', triggers: ['scan', 'read this', 'extract from'], capability: 'document.read', confirmation: 'none' },
  { id: 'imp.write', title: 'Write', triggers: ['draft', 'write', 'rewrite'], capability: 'text.generate', confirmation: 'none' },
  { id: 'imp.list', title: 'List', triggers: ['add to list', 'shopping list', 'checklist'], capability: 'list.write', confirmation: 'write' },
  { id: 'imp.find', title: 'Find', triggers: ['find', 'search for', 'compare'], capability: 'web.search', confirmation: 'none' },
]);

export function skillAvailability(skill, capabilities = {}) {
  return capabilities[skill.capability] === true ? 'available' : 'needs-setup';
}

export function resolveUniversalSkill(command, enabledIds = UNIVERSAL_SKILLS.map(s => s.id)) {
  const input = String(command || '').trim().toLowerCase();
  if (!input) return null;
  const candidates = UNIVERSAL_SKILLS.filter(s => enabledIds.includes(s.id));
  const matches = candidates.flatMap(skill => skill.triggers
    .filter(trigger => input === trigger || input.startsWith(trigger + ' ') || input.includes(' ' + trigger + ' '))
    .map(trigger => ({ skill, score: trigger.length })));
  matches.sort((a, b) => b.score - a.score);
  return matches[0]?.skill ?? null;
}

export function planUniversalSkill(command, capabilities = {}, enabledIds) {
  const skill = resolveUniversalSkill(command, enabledIds);
  if (!skill) return { status: 'unrecognized', command };
  if (skillAvailability(skill, capabilities) !== 'available') {
    return { status: 'needs-setup', skillId: skill.id, capability: skill.capability };
  }
  return { status: 'ready', skillId: skill.id, confirmation: skill.confirmation, command };
}
