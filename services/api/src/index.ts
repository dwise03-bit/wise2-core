/**
 * Wise² API Service Entry Point
 * Starts the Express server and initializes all connections
 */

import { createServer, startServer, stopServer } from './server';
import { logger } from './logger';

async function main(): Promise<void> {
  try {
    logger.info('Wise² API Service starting...');

    // Create Express app
    const app = await createServer();
    logger.info('Express app created');

    // Start server
    await startServer(app);

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      await stopServer();
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      await stopServer();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Fatal error during startup', { error });
    process.exit(1);
  }
}

main();
