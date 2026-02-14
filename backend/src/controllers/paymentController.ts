import { Response } from 'express';
import { param, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/authMiddleware';
import { PaymentService } from '../services/paymentService';

const paymentService = new PaymentService();

export const createReservationPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const reservationId = Number.parseInt(req.params.reservationId ?? '', 10);
    const intent = await paymentService.createReservationPaymentIntent(userId, reservationId);

    res.status(200).json({
      message: 'Payment intent created',
      ...intent,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create payment intent';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    if (msg.includes('Checkout')) {
      res.status(409).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
};

export const confirmMockPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const paymentId = Number.parseInt(req.params.paymentId ?? '', 10);
    const payment = await paymentService.confirmMockPayment(userId, paymentId);

    res.status(200).json({
      message: 'Mock payment confirmed',
      payment,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to confirm payment';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
};

export const createReservationPaymentIntentValidation = [
  param('reservationId').isInt({ min: 1 }).withMessage('Valid reservation id is required'),
];

export const confirmMockPaymentValidation = [
  param('paymentId').isInt({ min: 1 }).withMessage('Valid payment id is required'),
];
