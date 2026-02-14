export type PaymentStatus = 'initiated' | 'succeeded' | 'failed';

export interface Payment {
  id: number;
  reservation_id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentIntentResponse {
  payment: Payment;
  client_secret: string;
}
