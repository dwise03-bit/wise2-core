// YouTube OAuth2 Authorization Script
// Generates an access token for YouTube API v3 uploads

const fs = require("fs");
const readline = require("readline");
const axios = require("axios");

const CLIENT_SECRETS_FILE = "./client_secrets.json";
const TOKEN_FILE = ".env";

async function getAuthCode() {
  // Load client secrets
  if (!fs.existsSync(CLIENT_SECRETS_FILE)) {
    console.error(`❌ Missing ${CLIENT_SECRETS_FILE}`);
    console.error("1. Go to https://console.cloud.google.com");
    console.error("2. Create OAuth 2.0 Client ID (Desktop app)");
    console.error("3. Download JSON and save as client_secrets.json in this directory");
    process.exit(1);
  }

  const secrets = JSON.parse(fs.readFileSync(CLIENT_SECRETS_FILE, "utf-8"));
  const secretsData = secrets.installed || secrets.web;
  const { client_id, client_secret } = secretsData;

  // Use "out of band" (oob) redirect for CLI apps - Google displays code on screen
  const redirectUri = "urn:ietf:wg:oauth:2.0:oob";

  // Generate authorization URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${client_id}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("https://www.googleapis.com/auth/youtube.upload")}` +
    `&access_type=offline`;

  console.log("\n🔐 YouTube OAuth2 Authorization");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n1. Open this URL in your browser:");
  console.log(`   ${authUrl}\n`);
  console.log("2. Authorize the app");
  console.log("3. Copy the authorization code from the redirect URL\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("4. Paste the authorization code here: ", (code) => {
      rl.close();
      resolve({ code, client_id, client_secret });
    });
  });
}

async function exchangeCodeForToken({ code, client_id, client_secret }) {
  console.log("\n⏳ Exchanging code for access token...");

  try {
    const res = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id,
      client_secret,
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
      grant_type: "authorization_code",
    });

    return res.data.access_token;
  } catch (err) {
    console.error("❌ Token exchange failed:", err.response?.data?.error_description || err.message);
    process.exit(1);
  }
}

async function saveToken(token) {
  // Append to .env
  const line = `\nYOUTUBE_OAUTH_TOKEN=${token}`;

  if (fs.existsSync(TOKEN_FILE)) {
    const content = fs.readFileSync(TOKEN_FILE, "utf-8");
    if (!content.includes("YOUTUBE_OAUTH_TOKEN")) {
      fs.appendFileSync(TOKEN_FILE, line);
      console.log(`\n✅ Token saved to .env`);
    } else {
      console.log(`\n⚠️  YOUTUBE_OAUTH_TOKEN already exists in .env`);
    }
  } else {
    fs.writeFileSync(TOKEN_FILE, line.trim());
    console.log(`\n✅ Token saved to .env`);
  }

  console.log("\n🚀 Authorization complete!");
  console.log("Restart the VPS dashboard container for the token to take effect:");
  console.log("   ssh ubuntu@51.81.80.252");
  console.log("   docker-compose restart dashboard\n");
}

async function run() {
  try {
    const { code, client_id, client_secret } = await getAuthCode();
    const token = await exchangeCodeForToken({ code, client_id, client_secret });
    await saveToken(token);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

run();
