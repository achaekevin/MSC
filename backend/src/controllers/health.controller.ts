import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

export const healthCheck = async (req: Request, res: Response): Promise<Response> => {
  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
    dbStatus = dbLatencyMs < 300 ? 'connected' : 'degraded';
  } catch {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected' || dbStatus === 'degraded';
  const mem = process.memoryUsage();

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    service: 'msc-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs
    },
    system: {
      nodeVersion: process.version,
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
    }
  });
};

export const readinessCheck = (req: Request, res: Response): Response => {
  return res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
};
