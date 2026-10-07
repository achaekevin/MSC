import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { backupSchedulerService } from './services/backupScheduler.service.js';

const PORT = env.PORT || 5000;
const HOST = env.HOST || '0.0.0.0';

const startServer = async () => {
  logger.info(`Starting Mwancha Senior Community (MSC) backend service in ${env.NODE_ENV} mode...`);

  // Connect to database
  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    logger.warn('Initial database connection failed. Server will continue and retry upon incoming requests.');
  }

  const server = app.listen(PORT, HOST, () => {
    logger.info(`🚀 MSC Backend is actively listening on ${HOST}:${PORT}`);
    logger.info(`📖 Swagger API Documentation available at: http://${HOST}:${PORT}/api/docs`);
    logger.info(`🏥 Health check probe available at: http://${HOST}:${PORT}/health`);
    logger.info(`🌐 Network access enabled - server accessible from LAN/WAN`);
    
    if (env.NODE_ENV === 'development') {
      logger.info(`🔓 Development mode: CORS allows all origins`);
    }

    // Start Automated Backup & Retention Daemon
    backupSchedulerService.start();
  });

  // Graceful Shutdown Handling (Section 62)
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful server termination...`);
    backupSchedulerService.stop();
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      logger.info('Graceful shutdown complete. Exiting process.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds if hanging
    setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing termination.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch(error => {
  logger.error({ error }, 'Fatal error during backend initialization.');
  process.exit(1);
});
