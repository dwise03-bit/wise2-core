const { grokHealth } = require('./lib/ai-router');
const { askAI } = require('./lib/ai-router');

const cooldowns = new Map();
const MEMORY_TTL_MS = 30 * 60 * 1000;
const memory = new Map();
const MAX_PROMPT = 6000;

function splitMessage(text, max = 1900) {
  const chunks = [];
  for (let i = 0; i < text.length; i += max) chunks.push(text.slice(i, i + max));
  return chunks.length ? chunks : [''];
}

function key(interaction) { return `${interaction.guildId || 'dm'}:${interaction.user.id}:${interaction.channelId || 'unknown'}`; }
function canUse(interaction) {
  const id = interaction.user.id;
  const until = cooldowns.get(id) || 0;
  if (until > Date.now()) return false;
  cooldowns.set(id, Date.now() + 8000);
  return true;
}

const command = {
  data: {
    name: 'grok', description: 'Ask WISE² Grok for operational intelligence',
    options: [
      { name: 'prompt', description: 'Your question or request', type: 3, required: false },
      { name: 'reset', description: 'Clear your recent Grok conversation', type: 5, required: false },
    ],
  },
  async execute(interaction) {
    const reset = interaction.options.getBoolean('reset') || false;
    if (reset) {
      memory.delete(key(interaction));
      return interaction.reply({ content: '✅ WISE² Grok conversation reset.', ephemeral: true });
    }
    const prompt = interaction.options.getString('prompt')?.trim();
    if (!prompt) return interaction.reply({ content: 'Provide a prompt, or set reset:true.', ephemeral: true });
    if (prompt.length > MAX_PROMPT) return interaction.reply({ content: `Prompt is too long (maximum ${MAX_PROMPT} characters).`, ephemeral: true });
    if (!canUse(interaction)) return interaction.reply({ content: 'Please wait a few seconds before asking Grok again.', ephemeral: true });
    await interaction.deferReply();
    try {
      const saved = memory.get(key(interaction));
      const history = saved && saved.expiresAt > Date.now() ? saved.messages.slice(-6) : [];
      const result = await askAI({ provider: 'grok', messages: [...history, { role: 'user', content: prompt }] });
      memory.set(key(interaction), { messages: [...history, { role: 'user', content: prompt }, { role: 'assistant', content: result.text }].slice(-8), expiresAt: Date.now() + MEMORY_TTL_MS });
      const chunks = splitMessage(`**WISE² GROK**\n${result.text}\n\n*Provider: ${result.provider} · WISE² Intelligence Layer*`);
      await interaction.editReply({ content: chunks[0] });
      for (const chunk of chunks.slice(1)) await interaction.followUp({ content: chunk });
    } catch (error) { await interaction.editReply({ content: `**WISE² GROK**\n${error.message}` }); }
  },
};

module.exports = { command, splitMessage, grokHealth, _resetForTests: () => { cooldowns.clear(); memory.clear(); } };
