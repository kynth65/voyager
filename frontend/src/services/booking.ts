import apiClient from '../lib/axios';
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingListParams,
  BookingListResponse,
  BookingStats,
  CapacityCheckRequest,
  CapacityCheckResponse,
} from '../types/booking';

export const bookingService = {
  /**
   * Get paginated list of bookings with optional filters
   * Admin sees all bookings, customers see only their own
   */
  async getBookings(params?: BookingListParams): Promise<BookingListResponse> {
    const response = await apiClient.get<BookingListResponse>('/bookings', { params });
    return response.data;
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: number): Promise<Booking> {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Create a new booking with payment
   */
  async createBooking(data: CreateBookingRequest): Promise<{ message: string; booking: Booking }> {
    const response = await apiClient.post<{ message: string; booking: Booking }>('/bookings', data);
    return response.data;
  },

  /**
   * Update an existing booking
   */
  async updateBooking(id: number, data: UpdateBookingRequest): Promise<Booking> {
    const response = await apiClient.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  /**
   * Confirm a booking (admin only)
   */
  async confirmBooking(id: number): Promise<{ message: string; booking: Booking }> {
    const response = await apiClient.post<{ message: string; booking: Booking }>(`/bookings/${id}/confirm`);
    return response.data;
  },

  /**
   * Cancel a booking (customer can cancel their own, admin can cancel any)
   */
  async cancelBooking(id: number): Promise<{ message: string; booking: Booking }> {
    const response = await apiClient.post<{ message: string; booking: Booking }>(`/bookings/${id}/cancel`);
    return response.data;
  },

  /**
   * Delete a booking (soft delete)
   */
  async deleteBooking(id: number): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  },

  /**
   * Check vessel capacity for a route, date, and time
   */
  async checkCapacity(vesselId: number, params: CapacityCheckRequest): Promise<CapacityCheckResponse> {
    const response = await apiClient.get<CapacityCheckResponse>(`/vessels/${vesselId}/capacity`, { params });
    return response.data;
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
   * Get booking statistics (admin only)
   */
  async getBookingStats(): Promise<BookingStats> {
    const response = await apiClient.get<BookingStats>('/bookings/stats');
    return response.data;
  },
};
