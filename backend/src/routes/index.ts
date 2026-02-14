import { Router } from 'express';
import authRoutes from './authRoutes';
import meterRoutes from './meterRoutes';
import sessionRoutes from './sessionRoutes';
import healthRoutes from './healthRoutes';
import spotRoutes from './spotRoutes';
import reservationRoutes from './reservationRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/meters', meterRoutes);
router.use('/spots', spotRoutes);
router.use('/reservations', reservationRoutes);
router.use('/sessions', sessionRoutes);

export default router;
