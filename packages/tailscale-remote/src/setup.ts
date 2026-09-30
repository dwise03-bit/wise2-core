import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface SetupConfig {
  tailscaleApiKey: string;
  openaiApiKey: string;
  machineName?: string;
  port?: number;
}

async function setup(config: SetupConfig) {
  console.log('🚀 Setting up Tailscale + Codex Remote Service...\n');

  try {
    // 1. Create .env file
    await createEnvFile(config);

    // 2. Install Tailscale (macOS)
    await installTailscale();

    // 3. Setup launchd service (macOS)
    if (process.platform === 'darwin') {
      await setupLaunchd(config);
    }

    // 4. Initialize Tailscale
    await initializeTailscale(config);

    console.log('\n✅ Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run build');
    console.log('3. Run: npm start');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function createEnvFile(config: SetupConfig) {
  console.log('📝 Creating environment file...');

  const envContent = `
# Tailscale Configuration
TAILSCALE_API_KEY=${config.tailscaleApiKey}
TAILSCALE_MACHINE_NAME=${config.machineName || 'wise2-mac'}

# OpenAI / ChatGPT Configuration
OPENAI_API_KEY=${config.openaiApiKey}
OPENAI_MODEL=gpt-4

# Service Configuration
PORT=${config.port || 3009}
NODE_ENV=production

# Logging
LOG_LEVEL=info
`;

  writeFileSync('.env', envContent.trim());
  console.log('✅ Environment file created: .env\n');
}

async function installTailscale() {
  console.log('📦 Checking Tailscale installation...');

  try {
    await execAsync('tailscale version');
    console.log('✅ Tailscale already installed\n');
  } catch (error) {
    if (process.platform === 'darwin') {
      console.log('📥 Installing Tailscale via Homebrew...');
      try {
        await execAsync('brew install tailscale');
        console.log('✅ Tailscale installed\n');
      } catch (error) {
        console.log(
          '⚠️  Manual installation needed: https://tailscale.com/download/mac\n'
        );
      }
    }
  }
}

async function setupLaunchd(config: SetupConfig) {
  console.log('🔧 Setting up macOS launchd service...');

  const launchAgentDir = path.join(
    process.env.HOME || '',
    'Library/LaunchAgents'
  );
  const plistPath = path.join(launchAgentDir, 'com.wise2.codex-remote.plist');

  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.wise2.codex-remote</string>
	<key>ProgramArguments</key>
	<array>
		<string>${process.execPath}</string>
		<string>${path.resolve('./dist/index.js')}</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>KeepAlive</key>
	<true/>
	<key>StandardOutPath</key>
	<string>${process.env.HOME}/.wise2/logs/codex-remote.log</string>
	<key>StandardErrorPath</key>
	<string>${process.env.HOME}/.wise2/logs/codex-remote-error.log</string>
	<key>EnvironmentVariables</key>
	<dict>
		<key>PATH</key>
		<string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
		<key>NODE_ENV</key>
		<string>production</string>
	</dict>
</dict>
</plist>`;

  // Create LaunchAgents directory if needed
  if (!existsSync(launchAgentDir)) {
    mkdirSync(launchAgentDir, { recursive: true });
  }

  // Create logs directory
  const logsDir = path.join(process.env.HOME || '', '.wise2/logs');
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  writeFileSync(plistPath, plistContent);
  console.log(`✅ LaunchAgent created: ${plistPath}`);
  console.log(`   Load with: launchctl load ${plistPath}\n`);
}

async function initializeTailscale(config: SetupConfig) {
  console.log('🔐 Initializing Tailscale...');

  try {
    const { stdout } = await execAsync('tailscale status 2>&1');

    if (stdout.includes('Logged in')) {
      console.log('✅ Tailscale already authenticated\n');
    } else {
      console.log(
        '⚠️  Tailscale authentication needed. Run: tailscale login\n'
      );
    }
  } catch (error) {
    console.log('⚠️  Unable to check Tailscale status. Please run: tailscale login\n');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const tailscaleKey = process.env.TAILSCALE_API_KEY || args[0] || '';
const openaiKey = process.env.OPENAI_API_KEY || args[1] || '';

if (!tailscaleKey || !openaiKey) {
  console.error('❌ Missing required arguments:');
  console.error('   TAILSCALE_API_KEY');
  console.error('   OPENAI_API_KEY');
  console.error('\nUsage: npm run setup TAILSCALE_KEY OPENAI_KEY');
  process.exit(1);
}

setup({
  tailscaleApiKey: tailscaleKey,
  openaiApiKey: openaiKey,
  machineName: 'wise2-mac',
  port: 3009,
});
