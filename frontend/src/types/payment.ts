import type { Booking } from './booking';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'gcash' | 'paymaya';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  booking_id: number;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_id: string | null;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  booking?: Booking;
}

export interface CreatePaymentRequest {
  booking_id: number;
  payment_method: PaymentMethod;
  amount: number;
  notes?: string;
}

export interface ProcessPaymentRequest {
  payment_id: number;
  transaction_id?: string;
}

export interface PaymentListParams {
  page?: number;
  per_page?: number;
  booking_id?: number;
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface PaymentListResponse {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';

export interface Refund {
  id: number;
  booking_id: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  processed_by: number | null;
  approved_at: string | null;
  processed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  booking?: Booking;
  processedBy?: { id: number; name: string; email: string };
}

export interface CreateRefundRequest {
  booking_id: number;
  amount: number;
  reason: string;
  notes?: string;
}

export interface ProcessRefundRequest {
  refund_id: number;
  status: 'approve' | 'reject' | 'process';
  notes?: string;
}

export interface RefundListParams {
  page?: number;
  per_page?: number;
  booking_id?: number;
  status?: RefundStatus;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface RefundListResponse {
  data: Refund[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
