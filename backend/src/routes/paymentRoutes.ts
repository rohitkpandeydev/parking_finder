import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  confirmMockPayment,
  confirmMockPaymentValidation,
  createReservationPaymentIntent,
  createReservationPaymentIntentValidation,
} from '../controllers/paymentController';

const router = Router();

router.use(authenticateToken);
router.post('/reservations/:reservationId/intent', createReservationPaymentIntentValidation, createReservationPaymentIntent);
router.post('/:paymentId/confirm', confirmMockPaymentValidation, confirmMockPayment);

export default router;
