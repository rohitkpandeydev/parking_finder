import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  checkoutReservation,
  checkoutReservationValidation,
  listMyReservations,
} from '../controllers/reservationController';

const router = Router();

router.use(authenticateToken);
router.get('/me', listMyReservations);
router.post('/:id/checkout', checkoutReservationValidation, checkoutReservation);

export default router;
