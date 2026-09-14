/**
 * WISE² Discord Command Center
 * Command Registry and Loader
 * Provides modular command organization and deployment
 */

const fs = require('fs');
const path = require('path');

// Command categories aligned with WISE² operations
const COMMANDS = {
  system: {},
  deployment: {},
  ai: {},
  crm: {},
  onboarding: {},
  hvac: {},
  phone: {},
  development: {},
  security: {},
  monitoring: {},
};

/**
 * Load all commands from category subdirectories
 * @returns {Object} Loaded commands organized by category
 */
function loadCommands() {
  const commandDir = __dirname;
  const categories = Object.keys(COMMANDS);

  for (const category of categories) {
    const categoryPath = path.join(commandDir, category);

    if (!fs.existsSync(categoryPath)) {
      continue;
    }

    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.js') && !f.startsWith('_'));

    for (const file of files) {
      try {
        const command = require(path.join(categoryPath, file));
        if (command.data && command.execute) {
          COMMANDS[category][command.data.name] = command;
          console.log(`✓ Loaded ${category}/${command.data.name}`);
        }
      } catch (error) {
        console.error(`✗ Failed to load command ${file}:`, error.message);
      }
    }
  }

  return COMMANDS;
}

/**
 * Get all commands flattened for Discord registration
 * @returns {Array} All loaded commands
 */
function getAllCommands() {
  const all = [];
  for (const category in COMMANDS) {
    for (const commandName in COMMANDS[category]) {
      all.push(COMMANDS[category][commandName]);
    }
  }
  return all;
}

/**
 * Get a specific command by name
 * @param {string} name - Command name
 * @returns {Object} Command object or null
 */
function getCommand(name) {
  for (const category in COMMANDS) {
    if (COMMANDS[category][name]) {
      return COMMANDS[category][name];
    }
  }
  return null;
}

module.exports = {
  loadCommands,
  getAllCommands,
  getCommand,
  COMMANDS,
};
