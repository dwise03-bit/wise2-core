// Monitoring System Startup Script
require('dotenv').config();

const Orchestrator = require('./orchestrator');

const orchestrator = new Orchestrator();
const INTERVAL_MINUTES = parseInt(process.env.MONITORING_INTERVAL_MINUTES || '480');
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

console.log(`
╔════════════════════════════════════════════════════════╗
║     Wise Defense Multi-Agent Monitoring System         ║
║                   Starting Up...                       ║
╚════════════════════════════════════════════════════════╝

Configuration:
  • Interval: ${INTERVAL_MINUTES} minutes
  • Agents: 9 (5 site metrics + 4 bot monitors)
  • Database: ${process.env.DATABASE_URL ? '✓ Configured' : '✗ Not found'}
  • Discord Webhook: ${process.env.DISCORD_MONITORING_WEBHOOK_URL ? '✓ Configured' : process.env.DISCORD_ALERTS_WEBHOOK_URL ? '✓ Configured (fallback)' : '✗ Not found'}
  • Environment: ${process.env.NODE_ENV || 'development'}

Starting first cycle immediately...
`);

// Run first cycle immediately
orchestrator.runCycle().then(result => {
  if (result.success) {
    console.log(`\n✅ First cycle successful!`);
    console.log(`📅 Next cycle in ${INTERVAL_MINUTES} minutes...\n`);
  } else {
    console.error(`\n❌ First cycle failed:`, result.error);
  }

  // Schedule cycles every N minutes
  setInterval(() => {
    orchestrator.runCycle().catch(error => {
      console.error('Cycle error:', error);
    });
  }, INTERVAL_MS);

  console.log(`🔄 Monitoring cycle scheduled every ${INTERVAL_MINUTES} minutes`);
}).catch(error => {
  console.error('Failed to start monitoring system:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n\n📭 Shutting down monitoring system gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n\n📭 Shutting down monitoring system...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});
