import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Database Keep-Alive Service
 * 
 * Sends a lightweight `SELECT 1` query every 5 minutes to prevent
 * Aiven free-tier MySQL from sleeping due to inactivity.
 * The query is trivial and adds no meaningful load to the database.
 */
export function startDbKeepAlive(intervalMs: number = 5 * 60 * 1000) {
  if (keepAliveInterval) {
    return; // Already running
  }

  keepAliveInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      logger.warn({ err }, '[DB Keep-Alive] Ping failed — database may be temporarily unreachable.');
    }
  }, intervalMs);

  // Prevent the interval from blocking Node.js shutdown
  if (keepAliveInterval.unref) {
    keepAliveInterval.unref();
  }

  logger.info(`[DB Keep-Alive] Started — pinging database every ${Math.round(intervalMs / 60000)} minutes.`);
}

export function stopDbKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    logger.info('[DB Keep-Alive] Stopped.');
  }
}
