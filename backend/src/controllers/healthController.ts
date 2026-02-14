import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    await checkDatabaseConnection();
    res.status(200).json({
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    res.status(503).json({
      status: 'degraded',
      database: 'down',
      timestamp: new Date().toISOString(),
    });
  }
};
