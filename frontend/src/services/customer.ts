import api from '../lib/axios';
import type { User } from '../types/auth';

export interface CustomerListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CustomerListResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CustomerBooking {
  id: number;
  booking_reference: string;
  booking_date: string;
  departure_time: string;
  status: string;
  passengers: number;
  total_amount: number;
  route: {
    id: number;
    origin: string;
    destination: string;
    price: number;
  };
  vessel: {
    id: number;
    name: string;
    type: string;
  };
  created_at: string;
}

export interface CustomerDetailsResponse {
  user: User;
  bookings: CustomerBooking[];
  stats: {
    total_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_spent: number;
  };
}

export const customerService = {
  /**
   * Get paginated list of customers with optional search
   */
  getCustomers: async (params: CustomerListParams = {}): Promise<CustomerListResponse> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  /**
   * Get customer details with booking history
   */
  getCustomerById: async (id: number): Promise<CustomerDetailsResponse> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  /**
   * Get customer bookings only
   */
  getCustomerBookings: async (id: number): Promise<CustomerBooking[]> => {
    const response = await api.get(`/customers/${id}/bookings`);
    return response.data;
  },
};
