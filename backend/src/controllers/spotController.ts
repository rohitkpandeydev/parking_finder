import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { SpotService } from '../services/spotService';
import { AuthRequest } from '../middleware/authMiddleware';

const spotService = new SpotService();

export const listSpots = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const availableOnly = req.query.available_only === 'true';
    const spots = await spotService.list(availableOnly);
    res.status(200).json({ spots });
  } catch (error) {
    console.error('List spots error:', error);
    res.status(500).json({ error: 'Failed to fetch parking spots' });
  }
};

export const listSpotsValidation = [
  query('available_only').optional().isIn(['true', 'false']).withMessage('available_only must be true or false'),
];

export const reserveSpot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const id = Number.parseInt(req.params.id ?? '', 10);
    const hours = Number.parseInt(String(req.body.hours ?? ''), 10);
    const result = await spotService.reserve(userId, id, hours);

    if (result.status === 'not_found') {
      res.status(404).json({ error: 'Parking spot not found' });
      return;
    }

    if (result.status === 'unavailable') {
      res.status(409).json({ error: 'Parking spot is already reserved' });
      return;
    }

    res.status(200).json({
      message: 'Parking spot reserved',
      reservation_id: result.reservation_id,
      expires_at: result.expires_at,
      booked_hours: result.booked_hours,
      base_cost: result.base_cost,
      total_cost: result.total_cost,
      spot: result.spot,
    });
  } catch (error) {
    console.error('Reserve spot error:', error);
    res.status(500).json({ error: 'Failed to reserve parking spot' });
  }
};

export const reserveSpotValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid spot id is required'),
  body('hours').isInt({ min: 1, max: 24 }).withMessage('hours must be between 1 and 24'),
];
