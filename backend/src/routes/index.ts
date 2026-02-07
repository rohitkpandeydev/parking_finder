import { Router } from 'express';
import authRoutes from './authRoutes';
import meterRoutes from './meterRoutes';
import sessionRoutes from './sessionRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/meters', meterRoutes);
router.use('/sessions', sessionRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
