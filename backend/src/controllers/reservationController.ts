import { Response } from 'express';
import { param, validationResult } from 'express-validator';
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

export const checkoutReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const reservationId = Number.parseInt(req.params.id ?? '', 10);
    const reservation = await reservationService.checkout(userId, reservationId);

    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    res.status(200).json({
      message: 'Reservation checked out',
      reservation,
    });
  } catch (error) {
    console.error('Checkout reservation error:', error);
    res.status(500).json({ error: 'Failed to checkout reservation' });
  }
};

export const checkoutReservationValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid reservation id is required'),
];
