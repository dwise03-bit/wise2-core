'use strict';

const { aiCommand, handleAiCommand } = require('./ai-executor');
const { clientCommand, handleClientCommand } = require('./client-portal');
const { creativeCommand, handleCreativeCommand } = require('./creative-studio');
const { edgeCommand, handleEdgeCommand } = require('./edge-control');
const { revenueCommand, handleRevenueCommand } = require('./revenue-ops');
const { adminCommand, handleAdminCommand } = require('./admin-ops');
const { deployCommand, handleDeployCommand } = require('./deploy-ops');

const FEATURE_COMMANDS = [
  { command: aiCommand, handler: handleAiCommand, name: 'ai' },
  { command: clientCommand, handler: handleClientCommand, name: 'client' },
  { command: creativeCommand, handler: handleCreativeCommand, name: 'create' },
  { command: edgeCommand, handler: handleEdgeCommand, name: 'edge' },
  { command: revenueCommand, handler: handleRevenueCommand, name: 'revenue' },
  { command: adminCommand, handler: handleAdminCommand, name: 'admin' },
  { command: deployCommand, handler: handleDeployCommand, name: 'deploy' },
];

function getCommandBuilders() {
  return FEATURE_COMMANDS.map(fc => fc.command);
}

async function handleFeatureCommand(interaction, jwtToken) {
  const commandName = interaction.commandName;

  for (const fc of FEATURE_COMMANDS) {
    if (fc.name === commandName) {
      return fc.handler(interaction, jwtToken);
    }
  }

  throw new Error(`Unknown feature command: ${commandName}`);
}

module.exports = {
  FEATURE_COMMANDS,
  getCommandBuilders,
  handleFeatureCommand,
};
