import apiClient from '../lib/axios';
import type {
  Booking,
  CreateFerryBookingRequest,
  CreateCharterBookingRequest,
  UpdateBookingRequest,
  BookingListParams,
  BookingListResponse,
  BookingStats,
} from '../types/booking';

export const bookingService = {
  /**
   * Get paginated list of bookings with optional filters
   */
  async getBookings(params?: BookingListParams): Promise<BookingListResponse> {
    const response = await apiClient.get<BookingListResponse>('/bookings', { params });
    return response.data;
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: number): Promise<Booking> {
    const response = await apiClient.get<{ data: Booking }>(`/bookings/${id}`);
    return response.data.data;
  },

  /**
   * Create a ferry booking
   */
  async createFerryBooking(data: CreateFerryBookingRequest): Promise<Booking> {
    const response = await apiClient.post<{ data: Booking }>('/bookings/ferry', data);
    return response.data.data;
  },

  /**
   * Create a charter booking
   */
  async createCharterBooking(data: CreateCharterBookingRequest): Promise<Booking> {
    const response = await apiClient.post<{ data: Booking }>('/bookings/charter', data);
    return response.data.data;
  },

  /**
   * Update an existing booking
   */
  async updateBooking(id: number, data: UpdateBookingRequest): Promise<Booking> {
    const response = await apiClient.put<{ data: Booking }>(`/bookings/${id}`, data);
    return response.data.data;
  },

  /**
   * Confirm a booking (admin only)
   */
  async confirmBooking(id: number): Promise<Booking> {
    const response = await apiClient.post<{ data: Booking }>(`/bookings/${id}/confirm`);
    return response.data.data;
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: number, reason?: string): Promise<Booking> {
    const response = await apiClient.post<{ data: Booking }>(`/bookings/${id}/cancel`, { reason });
    return response.data.data;
  },

  /**
   * Delete a booking (soft delete)
   */
  async deleteBooking(id: number): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  },

  /**
   * Download ferry ticket PDF
   */
  async downloadTicket(id: number): Promise<Blob> {
    const response = await apiClient.get(`/bookings/${id}/ticket`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download charter agreement PDF
   */
  async downloadAgreement(id: number): Promise<Blob> {
    const response = await apiClient.get(`/bookings/${id}/agreement`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get booking statistics (admin only)
   */
  async getBookingStats(): Promise<BookingStats> {
    const response = await apiClient.get<{ data: BookingStats }>('/bookings/stats');
    return response.data.data;
  },

  /**
   * Get customer's own bookings
   */
  async getMyBookings(params?: BookingListParams): Promise<BookingListResponse> {
    const response = await apiClient.get<BookingListResponse>('/bookings/my-bookings', { params });
    return response.data;
  },
};
