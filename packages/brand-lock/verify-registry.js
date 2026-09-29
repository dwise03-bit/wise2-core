#!/usr/bin/env node
/**
 * WISE² Brand Lock — Registry Verification
 * Validates SHA-256 hashes against locked originals
 * Detects any tampering or modifications
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = '/Users/danielwise/Projects/wise2-core';
const REGISTRY_PATH = path.join(REPO_ROOT, 'packages/brand-lock/registry/authenticated-assets.json');

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function verifyRegistry() {
  console.log('🔍 WISE² Brand Lock — Verifying Registry Integrity\n');

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('❌ Registry not found:', REGISTRY_PATH);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  let totalAssets = 0;
  let verified = 0;
  let corrupted = 0;
  let missing = 0;

  for (const [brand, entry] of Object.entries(registry)) {
    console.log(`\n🔐 ${brand}`);
    const brandVerified = [];
    const brandCorrupted = [];
    const brandMissing = [];

    for (const asset of entry.assets) {
      totalAssets++;
      const fullPath = path.join(REPO_ROOT, asset.filePath);

      if (!fs.existsSync(fullPath)) {
        console.log(`  ❌ MISSING: ${asset.fileName}`);
        brandMissing.push(asset);
        missing++;
        continue;
      }

      const actualSHA256 = calculateSHA256(fullPath);
      if (actualSHA256 === asset.sha256) {
        console.log(`  ✓ ${asset.fileName}`);
        brandVerified.push(asset);
        verified++;
      } else {
        console.log(`  ⚠️  CORRUPTED: ${asset.fileName}`);
        console.log(`     Expected: ${asset.sha256.slice(0, 16)}...`);
        console.log(`     Got:      ${actualSHA256.slice(0, 16)}...`);
        brandCorrupted.push(asset);
        corrupted++;
      }
    }

    console.log(`  → ${brandVerified.length}/${entry.assets.length} verified`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Verification Results:`);
  console.log(`   Total assets:   ${totalAssets}`);
  console.log(`   ✓ Verified:     ${verified}`);
  console.log(`   ⚠️  Corrupted:   ${corrupted}`);
  console.log(`   ❌ Missing:     ${missing}`);
  console.log('='.repeat(60));

  if (corrupted === 0 && missing === 0) {
    console.log('\n✅ All locked assets are intact!');
    return true;
  } else {
    console.log('\n⚠️  Registry integrity compromised!');
    return false;
  }
}

const isValid = verifyRegistry();
process.exit(isValid ? 0 : 1);
