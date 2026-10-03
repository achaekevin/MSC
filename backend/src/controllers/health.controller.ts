import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

export const healthCheck = async (req: Request, res: Response): Promise<Response> => {
  let dbStatus = 'disconnected';
  try {
    // Quick probe
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected';

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'msc-backend',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
};

export const readinessCheck = (req: Request, res: Response): Response => {
  return res.status(200).json({ status: 'ready' });
};
