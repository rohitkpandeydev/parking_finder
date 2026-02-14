export interface Reservation {
  id: number;
  user_id: number;
  spot_id: number;
  location: string;
  price: number;
  status: 'active' | 'expired' | 'cancelled' | 'completed';
  reserved_at: string;
  expires_at: string;
}

export interface ReservationDashboardResponse {
  active: Reservation[];
  past: Reservation[];
}
