#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const TRADING_DIR = './apps/website/app/trading';

// Find all TSX files
const files = glob.sync(`${TRADING_DIR}/**/*.tsx`);

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf-8');
  let modified = false;

  // Fix buttons without onClick (but not those with type=)
  // Match: <button followed by optional whitespace and className, but no onClick
  const buttonRegex = /<button\s+(?!.*onClick)(?!.*type=)([^>]*?)>/g;

  const newContent = content.replace(buttonRegex, (match) => {
    // Check if this button already has onClick
    if (match.includes('onClick')) {
      return match;
    }

    // Add onClick handler
    modified = true;
    return match.replace(/className="/g, 'onClick={() => console.log("Button clicked - feature coming soon")} className="');
  });

  if (modified) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`✓ Fixed ${file}`);
  }
});

console.log('Done!');
