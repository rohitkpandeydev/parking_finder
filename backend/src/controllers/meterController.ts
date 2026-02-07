import { Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { MeterService } from '../services/meterService';

const meterService = new MeterService();

export const listMeters = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const latitude = req.query.latitude != null ? Number(req.query.latitude) : undefined;
    const longitude = req.query.longitude != null ? Number(req.query.longitude) : undefined;
    const radius_km = req.query.radius_km != null ? Number(req.query.radius_km) : undefined;
    const available_only = req.query.available_only === 'true';

    const meters = await meterService.list({
      ...(latitude != null && { latitude }),
      ...(longitude != null && { longitude }),
      ...(radius_km != null && { radius_km }),
      available_only,
    });
    res.status(200).json({ meters });
  } catch (error) {
    console.error('List meters error:', error);
    res.status(500).json({ error: 'Failed to fetch parking meters' });
  }
};

export const getMeterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = parseInt(req.params.id ?? '', 10);
    const meter = await meterService.getById(id);
    if (!meter) {
      res.status(404).json({ error: 'Parking meter not found' });
      return;
    }
    res.status(200).json(meter);
  } catch (error) {
    console.error('Get meter error:', error);
    res.status(500).json({ error: 'Failed to fetch parking meter' });
  }
};

export const listMetersValidation = [
  query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius_km').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Invalid radius_km'),
  query('available_only').optional().isIn(['true', 'false']).withMessage('available_only must be true or false'),
];

export const getMeterByIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid meter id is required'),
];
