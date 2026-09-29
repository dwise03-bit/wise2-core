const { askGrok, grokHealth } = require('./grok');

async function askAI({ provider = 'grok', ...request }) {
  if (provider !== 'grok') throw new Error(`Unsupported AI provider: ${provider}`);
  return askGrok(request);
}

module.exports = { askAI, grokHealth };
