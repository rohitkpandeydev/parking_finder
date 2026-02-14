export interface Reservation {
  id: number;
  user_id: number;
  spot_id: number;
  location: string;
  price: number;
  status: 'active' | 'expired' | 'cancelled' | 'completed';
  reserved_at: string;
  expires_at: string;
  booked_hours: number;
  base_cost: number;
  overtime_cost: number;
  total_cost: number;
  checked_out_at: string | null;
  overtime_minutes: number;
  is_overdue: boolean;
  estimated_total_cost: number;
  payment_status: 'unpaid' | 'paid' | 'waived';
  paid_at: string | null;
}

export interface ReservationDashboardResponse {
  active: Reservation[];
  past: Reservation[];
}
