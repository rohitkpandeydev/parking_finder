import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ReservationService } from '../services/reservationService';

const reservationService = new ReservationService();

export const listMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const dashboard = await reservationService.listByUser(userId);
    res.status(200).json(dashboard);
  } catch (error) {
    console.error('List reservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};
