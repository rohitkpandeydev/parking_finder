import { ZONE_PRICING } from './zonePricing';
import { VehicleType } from './types';

export const calculateAmount = (
  zone: string,
  vehicleType: VehicleType,
  durationMinutes: number
) => {
  console.log('Calculating amount for:', { zone, vehicleType, durationMinutes });
  const pricing = ZONE_PRICING[zone];

  if (!pricing) return 0;

  const billableMinutes = Math.max(
    durationMinutes - pricing.graceMinutes,
    0
  );

  const ratePerMinute = pricing.rates[vehicleType];

  return Math.ceil(billableMinutes * ratePerMinute);
};
