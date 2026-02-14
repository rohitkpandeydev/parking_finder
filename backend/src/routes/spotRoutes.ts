import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  listSpots,
  listSpotsValidation,
  reserveSpot,
  reserveSpotValidation,
} from '../controllers/spotController';

const router = Router();

router.get('/', listSpotsValidation, listSpots);
router.post('/:id/reserve', authenticateToken, reserveSpotValidation, reserveSpot);

export default router;
