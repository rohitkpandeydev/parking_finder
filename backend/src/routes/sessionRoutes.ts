import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  startSession,
  getActiveSession,
  getSessionById,
  endSession,
  listSessions,
  startSessionValidation,
  getSessionByIdValidation,
  listSessionsValidation,
} from '../controllers/sessionController';

const router = Router();

router.use(authenticateToken);

router.post('/', startSessionValidation, startSession);
router.get('/active', getActiveSession);
router.get('/', listSessionsValidation, listSessions);
router.get('/:id', getSessionByIdValidation, getSessionById);
router.patch('/:id/end', getSessionByIdValidation, endSession);

export default router;
