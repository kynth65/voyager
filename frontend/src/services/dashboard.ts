import axios from '../lib/axios';
import type {
  DashboardStats,
  RecentBooking,
  BookingsByType,
  RevenueStats,
  PopularRoute,
  BookingTrends,
} from '../types/dashboard';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get('/dashboard/stats');
  return response.data;
};

/**
 * Get recent bookings
 */
export const getRecentBookings = async (limit: number = 10): Promise<RecentBooking[]> => {
  const response = await axios.get('/dashboard/bookings/recent', {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Get bookings by vessel type
 */
export const getBookingsByType = async (): Promise<BookingsByType[]> => {
  const response = await axios.get('/dashboard/bookings/by-type');
  return response.data.data;
};

/**
 * Get revenue statistics
 */
export const getRevenueStats = async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<RevenueStats> => {
  const response = await axios.get('/dashboard/revenue', {
    params: { period },
  });
  return response.data;
};

/**
 * Get popular routes
 */
export const getPopularRoutes = async (limit: number = 5): Promise<PopularRoute[]> => {
  const response = await axios.get('/dashboard/routes/popular', {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Get booking trends
 */
export const getBookingTrends = async (period: 'day' | 'week' | 'month' = 'month'): Promise<BookingTrends> => {
  const response = await axios.get('/dashboard/bookings/trends', {
    params: { period },
  });
  return response.data;
};
