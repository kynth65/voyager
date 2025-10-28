import apiClient from '../lib/axios';
import type {
  Payment,
  CreatePaymentRequest,
  ProcessPaymentRequest,
  PaymentListParams,
  PaymentListResponse,
  Refund,
  CreateRefundRequest,
  ProcessRefundRequest,
  RefundListParams,
  RefundListResponse,
} from '../types/payment';

export const paymentService = {
  /**
   * Get paginated list of payments with optional filters
   */
  async getPayments(params?: PaymentListParams): Promise<PaymentListResponse> {
    const response = await apiClient.get<PaymentListResponse>('/payments', { params });
    return response.data;
  },

  /**
   * Get a single payment by ID
   */
  async getPaymentById(id: number): Promise<Payment> {
    const response = await apiClient.get<{ data: Payment }>(`/payments/${id}`);
    return response.data.data;
  },

  /**
   * Create a new payment record
   */
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post<{ data: Payment }>('/payments', data);
    return response.data.data;
  },

  /**
   * Process a mock payment (instant confirmation)
   */
  async processPayment(data: ProcessPaymentRequest): Promise<Payment> {
    const response = await apiClient.post<{ data: Payment }>(`/payments/${data.payment_id}/process`, {
      transaction_id: data.transaction_id,
    });
    return response.data.data;
  },
};

export const refundService = {
  /**
   * Get paginated list of refunds with optional filters
   */
  async getRefunds(params?: RefundListParams): Promise<RefundListResponse> {
    const response = await apiClient.get<RefundListResponse>('/refunds', { params });
    return response.data;
  },

  /**
   * Get a single refund by ID
   */
  async getRefundById(id: number): Promise<Refund> {
    const response = await apiClient.get<{ data: Refund }>(`/refunds/${id}`);
    return response.data.data;
  },

  /**
   * Create a new refund request
   */
  async createRefund(data: CreateRefundRequest): Promise<Refund> {
    const response = await apiClient.post<{ data: Refund }>('/refunds', data);
    return response.data.data;
  },

  /**
   * Process a refund (approve/reject)
   */
  async processRefund(data: ProcessRefundRequest): Promise<Refund> {
    const response = await apiClient.post<{ data: Refund }>(`/refunds/${data.refund_id}/process`, {
      status: data.status,
      notes: data.notes,
    });
    return response.data.data;
  },
};
