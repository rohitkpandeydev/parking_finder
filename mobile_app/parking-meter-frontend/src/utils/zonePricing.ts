import { VehicleType } from "./types";


type ZonePricing = {
  graceMinutes: number;
  rates: Record<VehicleType, number>; // per minute
};

export const ZONE_PRICING: Record<string, ZonePricing> = {
  A1: {
    graceMinutes: 5,
    rates: {
      Car: 2,
      Bike: 1,
      Truck: 4,
    },
  },
  B1: {
    graceMinutes: 10,
    rates: {
      Car: 1.5,
      Bike: 1,
      Truck: 3,
    },
  },
  C1: {
    graceMinutes: 0,
    rates: {
      Car: 1,
      Bike: 0.5,
      Truck: 2,
    },
  },
};
