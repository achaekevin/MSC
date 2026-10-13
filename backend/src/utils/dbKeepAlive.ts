import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

let keepAliveInterval: ReturnType<typeof setInterval> | null = null;
let consecutiveFailures = 0;
const MAX_FAILURES_BEFORE_RECONNECT = 3;

/**
 * Database Keep-Alive Service
 * 
 * Sends a lightweight `SELECT 1` query every 3 minutes to prevent
 * Aiven free-tier MySQL from sleeping due to inactivity.
 * 
 * Includes automatic reconnection logic: if 3 consecutive pings fail,
 * the Prisma client is disconnected and reconnected to recover from
 * broken connection pools (e.g. after Railway redeploys or network blips).
 */
async function pingDatabase(): Promise<void> {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    if (consecutiveFailures > 0) {
      logger.info(`[DB Keep-Alive] Connection recovered after ${consecutiveFailures} failed attempt(s).`);
    }
    consecutiveFailures = 0;
  } catch (err) {
    consecutiveFailures++;
    logger.warn(
      { err, consecutiveFailures },
      `[DB Keep-Alive] Ping failed (attempt ${consecutiveFailures}) — database may be temporarily unreachable.`
    );

    // After multiple consecutive failures, attempt to reconnect the Prisma client
    if (consecutiveFailures >= MAX_FAILURES_BEFORE_RECONNECT) {
      logger.warn('[DB Keep-Alive] Max consecutive failures reached — attempting Prisma reconnection...');
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        logger.info('[DB Keep-Alive] Prisma reconnection successful.');
        consecutiveFailures = 0;
      } catch (reconnectErr) {
        logger.error({ err: reconnectErr }, '[DB Keep-Alive] Prisma reconnection failed.');
      }
    }
  }
}

export function startDbKeepAlive(intervalMs: number = 3 * 60 * 1000) {
  if (keepAliveInterval) {
    return; // Already running
  }

  // Fire an immediate ping on startup so there is no unprotected gap
  pingDatabase();

  keepAliveInterval = setInterval(pingDatabase, intervalMs);

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
    consecutiveFailures = 0;
    logger.info('[DB Keep-Alive] Stopped.');
  }
}

