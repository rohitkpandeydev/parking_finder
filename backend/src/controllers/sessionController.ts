import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/authMiddleware';
import { SessionService } from '../services/sessionService';

const sessionService = new SessionService();

export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const userId = req.userId!;
    const session = await sessionService.startSession(userId, {
      meter_id: req.body.meter_id,
      duration_minutes: req.body.duration_minutes,
    });
    res.status(201).json({ message: 'Parking session started', session });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to start session';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    if (msg.includes('not available')) {
      res.status(409).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
};

export const getActiveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const session = await sessionService.getActiveSession(userId);
    if (!session) {
      res.status(404).json({ error: 'No active parking session' });
      return;
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
};

export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const userId = req.userId!;
    const id = parseInt(req.params.id ?? '', 10);
    const session = await sessionService.getById(id, userId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const userId = req.userId!;
    const id = parseInt(req.params.id ?? '', 10);
    const session = await sessionService.endSession(id, userId);
    if (!session) {
      res.status(404).json({ error: 'Active session not found' });
      return;
    }
    res.status(200).json({ message: 'Parking session ended', session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end session' });
  }
};

export const listSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const userId = req.userId!;
    const active_only = req.query.active_only === 'true';
    const sessions = await sessionService.listByUser(userId, { active_only });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

export const startSessionValidation = [
  body('meter_id').isInt({ min: 1 }).withMessage('Valid meter_id is required'),
  body('duration_minutes').isInt({ min: 1, max: 480 }).withMessage('duration_minutes must be between 1 and 480'),
];

export const getSessionByIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid session id is required'),
];

export const listSessionsValidation = [
  query('active_only').optional().isIn(['true', 'false']).withMessage('active_only must be true or false'),
];
