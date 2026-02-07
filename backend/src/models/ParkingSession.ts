export type SessionStatus = 'active' | 'ended';

export interface ParkingSession {
  id: number;
  user_id: number;
  meter_id: number;
  started_at: Date;
  ends_at: Date;
  duration_minutes: number;
  status: SessionStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSessionInput {
  meter_id: number;
  duration_minutes: number;
}

export interface ParkingSessionResponse {
  id: number;
  user_id: number;
  meter_id: number;
  meter_code?: string;
  started_at: string;
  ends_at: string;
  duration_minutes: number;
  status: SessionStatus;
  remaining_seconds?: number;
}
