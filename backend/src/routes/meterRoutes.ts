import { Router } from 'express';
import {
  listMeters,
  getMeterById,
  listMetersValidation,
  getMeterByIdValidation,
} from '../controllers/meterController';

const router = Router();

router.get('/', listMetersValidation, listMeters);
router.get('/:id', getMeterByIdValidation, getMeterById);

export default router;
