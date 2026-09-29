/**
 * Load Discord env — skip vault placeholders, prefer real values from .env / bot .env.
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const botDir = path.join(__dirname);
const repoRoot = path.join(__dirname, "../..");

const envFiles = [
  path.join(repoRoot, ".env.production"),
  path.join(repoRoot, ".env"),
  path.join(repoRoot, ".env.local"),
  path.join(botDir, ".env"),
  path.join(botDir, ".env.webhooks"),
].filter((file) => fs.existsSync(file));

function cleanEnv(value) {
  if (!value) return value;
  return String(value).trim().replace(/^["']|["']$/g, "");
}

function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value);
  if (keyLooksLikeToken(v) === false && v.length < 10) return true;
  return /your_|placeholder|changeme|CONFIGURE|^\.\.\.$/i.test(v);
}

function keyLooksLikeToken(v) {
  return /^[\w-]{20,}\.[\w-]{4,}\.[\w-_{}]{20,}$/.test(v);
}

for (const file of envFiles) {
  dotenv.config({ path: file, override: false });
}

for (const key of Object.keys(process.env)) {
  if (!key.startsWith("DISCORD_") && key !== "BOT_TOKEN") continue;
  const cleaned = cleanEnv(process.env[key]);
  if (key === "DISCORD_BOT_TOKEN" || key === "BOT_TOKEN") {
    if (!cleaned || !keyLooksLikeToken(cleaned)) delete process.env[key];
    else process.env[key] = cleaned;
  } else if (isPlaceholder(cleaned)) {
    delete process.env[key];
  } else {
    process.env[key] = cleaned;
  }
}

// Fill gaps from lower-priority files after stripping bad production placeholders.
for (const file of [
  path.join(repoRoot, ".env"),
  path.join(repoRoot, ".env.local"),
  path.join(botDir, ".env"),
  path.join(botDir, ".env.webhooks"),
]) {
  if (!fs.existsSync(file)) continue;
  const parsed = dotenv.parse(fs.readFileSync(file));
  for (const [key, raw] of Object.entries(parsed)) {
    if (!key.startsWith("DISCORD_") && key !== "BOT_TOKEN") continue;
    if (process.env[key]) continue;
    const cleaned = cleanEnv(raw);
    if (key === "DISCORD_BOT_TOKEN" || key === "BOT_TOKEN") {
      if (keyLooksLikeToken(cleaned)) process.env[key] = cleaned;
    } else if (!isPlaceholder(cleaned)) {
      process.env[key] = cleaned;
    }
  }
}

module.exports = { envFiles, cleanEnv, isPlaceholder };
