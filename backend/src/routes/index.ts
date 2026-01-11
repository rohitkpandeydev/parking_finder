import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
