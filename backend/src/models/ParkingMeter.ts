export interface ParkingMeter {
  id: number;
  meter_code: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  address?: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ParkingMeterResponse {
  id: number;
  meter_code: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  address?: string;
  is_available: boolean;
  distance_km?: number;
}
