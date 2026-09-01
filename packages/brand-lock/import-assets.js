#!/usr/bin/env node
/**
 * WISE² Brand Lock — Authentic Asset Importer
 * Scans for authentic originals, calculates SHA-256, locks in registry
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = '/Users/danielwise/Projects/wise2-core';
const REGISTRY_DIR = path.join(REPO_ROOT, 'packages/brand-lock/registry');

const AUTHENTICATED_ASSETS = {
  'PAIGE': [
    { source: 'client-handoff', filePath: '.tmp/petals-handoff/extracted/Petals_and_Potions_Partner_Handoff/02_PAIGE/paige_brand_portrait_product.png', type: 'hero' },
    { source: 'client-handoff', filePath: '.tmp/petals-handoff/extracted/Petals_and_Potions_Partner_Handoff/02_PAIGE/paige_client_handoff_outdoor.png', type: 'photography' },
    { source: 'client-handoff', filePath: '.tmp/petals-handoff/extracted/Petals_and_Potions_Partner_Handoff/02_PAIGE/paige_reference_01.jpg', type: 'reference' },
    { source: 'client-handoff', filePath: '.tmp/petals-handoff/extracted/Petals_and_Potions_Partner_Handoff/02_PAIGE/paige_reference_02.jpg', type: 'reference' },
    { source: 'client-handoff', filePath: '.tmp/petals-handoff/extracted/Petals_and_Potions_Partner_Handoff/01_BRAND/brand_board_paige.png', type: 'reference' },
  ],
  'CJAYS': [
    { source: 'production-app', filePath: 'CJAYS/mobile-app/app/src/main/res/drawable/cjays_rekon_icon.png', type: 'icon' },
  ],
  'LEXIS_INKS': [
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/hero-reference.jpg', type: 'hero' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/shop-reference.jpg', type: 'reference' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/story-reference.jpg', type: 'reference' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/lexis-inks-memorial.jpg', type: 'photography' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/sheila.jpg', type: 'photography' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/pen-white.jpg', type: 'product' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/pen-red.jpg', type: 'product' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/pen-pink.jpg', type: 'product' },
    { source: 'production-app', filePath: 'apps/lexis-inks-demo/public/pen-blue.jpg', type: 'product' },
  ],
  'WISE_IMP': [
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/idle-gold.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/idle-green.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/idle-magenta.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/wave-gold.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/wave-magenta.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/thinking-gold.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/thinking-magenta.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/thinking-green.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/celebrate-gold.png', type: 'animation' },
    { source: 'production-app', filePath: 'apps/website/public/wise-imp/celebrate-blue.png', type: 'animation' },
  ],
  'SENCERE_PIFF_CITY': [
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/piff-city-rabbit-hero.png', type: 'hero' },
  ],
  'SENCERE_BLAKKHAIL': [
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail-brand-board.jpg', type: 'reference' },
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail/sencere-rabbit-logo.png', type: 'logo' },
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail/blakkhail-wordmark.png', type: 'logo' },
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail/blakkhail-wordmark-gold.jpg', type: 'logo' },
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail/sencere-emblem.jpg', type: 'icon' },
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail/piff-city-skull.png', type: 'icon' },
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail/piff-city-skull.jpg', type: 'icon' },
    { source: 'production-app', filePath: 'apps/website/public/sencere-assets/blakkhail/blakkhail-drop-ad.png', type: 'hero' },
  ],
  'SENCERE_LEGACY_BLAKKHAIL': [
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/home/P3190168.jpg', type: 'photography' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/home/P7210319.jpg', type: 'photography' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210354.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210356.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210350.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210351.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210321.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210348.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210360.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210362.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/shop/P7210358.jpg', type: 'product' },
    { source: 'legacy-archive', filePath: 'apps/website/public/sencere-assets/legacy-blakkhail/look-book/P3190167.jpg', type: 'photography' },
  ],
  'WISE2_LEADERSHIP': [
    { source: 'team-uploads', filePath: 'apps/website/public/uploads/daniel-real.jpg', type: 'photography' },
    { source: 'team-uploads', filePath: 'apps/website/public/uploads/darrin-real.jpg', type: 'photography' },
  ],
  'WISE2_BRAND': [
    { source: 'production-app', filePath: 'apps/website/public/brand/wise2-brand-identity.png', type: 'reference' },
    { source: 'production-app', filePath: 'apps/website/public/brand/wise2-hero-united-source.png', type: 'hero' },
  ],
};

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function importAuthenticAssets() {
  console.log('🔐 WISE² Brand Lock — Importing Authentic Assets\n');

  if (!fs.existsSync(REGISTRY_DIR)) {
    fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  }

  const registry = {};
  let totalImported = 0;

  for (const [brand, assetConfigs] of Object.entries(AUTHENTICATED_ASSETS)) {
    console.log(`\n📦 Processing ${brand}...`);
    const authenticAssets = [];

    for (const config of assetConfigs) {
      const fullPath = path.join(REPO_ROOT, config.filePath);

      if (!fs.existsSync(fullPath)) {
        console.warn(`  ⚠️  Missing: ${config.filePath}`);
        continue;
      }

      const stats = fs.statSync(fullPath);
      const sha256 = calculateSHA256(fullPath);
      const assetId = `${brand.toLowerCase()}-${path.basename(config.filePath).replace(/\.[^.]+$/, '')}-${sha256.slice(0, 8)}`;

      const asset = {
        id: assetId,
        brand,
        type: config.type,
        filePath: config.filePath,
        fileName: path.basename(config.filePath),
        sha256,
        fileSize: stats.size,
        dateImported: new Date().toISOString(),
        source: config.source,
        locked: true,
      };

      authenticAssets.push(asset);
      console.log(`  ✓ ${asset.fileName} (${(stats.size / 1024).toFixed(1)}KB) — ${sha256.slice(0, 16)}...`);
      totalImported++;
    }

    registry[brand] = {
      brand,
      assets: authenticAssets,
      totalAssets: authenticAssets.length,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`  → ${authenticAssets.length} assets registered`);
  }

  // Write registry
  const registryPath = path.join(REGISTRY_DIR, 'authenticated-assets.json');
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

  console.log(`\n✅ Registry saved: ${registryPath}`);
  console.log(`\n📊 Summary:`);
  for (const [brand, entry] of Object.entries(registry)) {
    console.log(`   ${brand}: ${entry.totalAssets} assets`);
  }
  console.log(`\n   TOTAL: ${totalImported} authentic assets locked`);
}

importAuthenticAssets().catch(console.error);
