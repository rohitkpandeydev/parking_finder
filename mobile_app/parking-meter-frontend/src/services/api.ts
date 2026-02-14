import { getApiBaseUrl } from '../config';
import { authStorage } from './authStorage';

export type ParkingMeter = {
  id: number;
  meter_code: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  address?: string;
  is_available: boolean;
  distance_km?: number;
};

export type ParkingSpot = {
  id: number;
  location: string;
  price: number;
  is_available: boolean;
  latitude: number;
  longitude: number;
};

export type ParkingSession = {
  id: number;
  user_id: number;
  meter_id: number;
  meter_code?: string;
  started_at: string;
  ends_at: string;
  duration_minutes: number;
  status: 'active' | 'ended';
  remaining_seconds?: number;
};

export type Reservation = {
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
};

export type ReservationDashboard = {
  active: Reservation[];
  past: Reservation[];
};

export type Payment = {
  id: number;
  reservation_id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: 'initiated' | 'succeeded' | 'failed';
  provider: string;
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
};

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const base = getApiBaseUrl().replace(/\/$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(url, { ...fetchOptions, headers, signal: fetchOptions.signal ?? controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
  const text = await res.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new Error(res.ok ? 'Invalid response' : text || res.statusText);
  }
  if (!res.ok) {
    const payload = data as { error?: string; errors?: Array<{ msg?: string }> };
    const validationMsg =
      Array.isArray(payload.errors) && payload.errors.length > 0
        ? payload.errors[0]?.msg
        : undefined;
    const errMsg = payload.error || validationMsg || res.statusText;
    throw new Error(errMsg);
  }
  return data;
}

export const api = {
  async getToken(): Promise<string | null> {
    return authStorage.getToken();
  },

  async login(payload: { email: string; password: string }) {
    const data = await request<{ token: string; user: unknown }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) await authStorage.setToken(data.token);
    return data;
  },

  async signup(payload: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) {
    const data = await request<{ user: unknown }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },

  async logout() {
    await authStorage.removeToken();
  },

  async getMeters(params?: {
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    available_only?: boolean;
  }): Promise<{ meters: ParkingMeter[] }> {
    const q = new URLSearchParams();
    if (params?.latitude != null) q.set('latitude', String(params.latitude));
    if (params?.longitude != null) q.set('longitude', String(params.longitude));
    if (params?.radius_km != null) q.set('radius_km', String(params.radius_km));
    if (params?.available_only) q.set('available_only', 'true');
    const token = await authStorage.getToken();
    return request<{ meters: ParkingMeter[] }>(`/api/meters?${q.toString()}`, { token });
  },

  async getMeterById(id: number): Promise<ParkingMeter> {
    const token = await authStorage.getToken();
    return request<ParkingMeter>(`/api/meters/${id}`, { token });
  },

  async getSpots(params?: {
    available_only?: boolean;
  }): Promise<{ spots: ParkingSpot[] }> {
    const q = new URLSearchParams();
    if (params?.available_only) q.set('available_only', 'true');
    const token = await authStorage.getToken();
    const suffix = q.toString() ? `?${q.toString()}` : '';
    return request<{ spots: ParkingSpot[] }>(`/api/spots${suffix}`, { token });
  },

  async reserveSpot(id: number, hours: number): Promise<{
    message: string;
    reservation_id: number;
    expires_at: string;
    booked_hours: number;
    base_cost: number;
    total_cost: number;
    spot: ParkingSpot;
  }> {
    const token = await authStorage.getToken();
    return request<{
      message: string;
      reservation_id: number;
      expires_at: string;
      booked_hours: number;
      base_cost: number;
      total_cost: number;
      spot: ParkingSpot;
    }>(`/api/spots/${id}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ hours }),
      token,
    });
  },

  async getReservationDashboard(): Promise<ReservationDashboard> {
    const token = await authStorage.getToken();
    if (!token) return { active: [], past: [] };
    return request<ReservationDashboard>('/api/reservations/me', { token });
  },

  async checkoutReservation(reservationId: number): Promise<{ message: string; reservation: Reservation }> {
    const token = await authStorage.getToken();
    if (!token) throw new Error('Not logged in');
    return request<{ message: string; reservation: Reservation }>(
      `/api/reservations/${reservationId}/checkout`,
      { method: 'POST', token }
    );
  },

  async createReservationPaymentIntent(
    reservationId: number
  ): Promise<{ message: string; payment: Payment; client_secret: string }> {
    const token = await authStorage.getToken();
    if (!token) throw new Error('Not logged in');
    return request<{ message: string; payment: Payment; client_secret: string }>(
      `/api/payments/reservations/${reservationId}/intent`,
      { method: 'POST', token }
    );
  },

  async confirmMockPayment(paymentId: number): Promise<{ message: string; payment: Payment }> {
    const token = await authStorage.getToken();
    if (!token) throw new Error('Not logged in');
    return request<{ message: string; payment: Payment }>(`/api/payments/${paymentId}/confirm`, {
      method: 'POST',
      token,
    });
  },

  async getActiveSession(): Promise<ParkingSession | null> {
    const token = await authStorage.getToken();
    if (!token) return null;
    try {
      return await request<ParkingSession>('/api/sessions/active', { token });
    } catch {
      return null;
    }
  },

  async startSession(payload: { meter_id: number; duration_minutes: number }) {
    const token = await authStorage.getToken();
    if (!token) throw new Error('Not logged in');
    const data = await request<{ session: ParkingSession }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    });
    return data.session;
  },

  async endSession(sessionId: number): Promise<{ session: ParkingSession }> {
    const token = await authStorage.getToken();
    if (!token) throw new Error('Not logged in');
    return request(`/api/sessions/${sessionId}/end`, { method: 'PATCH', token });
  },

  async listSessions(active_only?: boolean) {
    const token = await authStorage.getToken();
    if (!token) return { sessions: [] as ParkingSession[] };
    const q = active_only ? '?active_only=true' : '';
    const data = await request<{ sessions: ParkingSession[] }>(`/api/sessions${q}`, { token });
    return data;
  },
};
