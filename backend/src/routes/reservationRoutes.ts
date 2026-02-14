import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { listMyReservations } from '../controllers/reservationController';

const router = Router();

router.use(authenticateToken);
router.get('/me', listMyReservations);

export default router;
