import { User } from './user';
import { Vessel } from './vessel';
import { Route } from './route';
import { Payment } from './payment';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Passenger {
  first_name: string;
  last_name: string;
  age?: number;
  id_number?: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  vessel_id: number;
  route_id: number;
  status: BookingStatus;
  booking_date: string; // Date of travel
  departure_time: string; // Scheduled departure time
  passengers: number;
  total_amount: number; // Calculated as route.price × passengers
  special_requirements: string | null;
  admin_notes: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: User;
  vessel?: Vessel;
  route?: Route;
  payment?: Payment;
}

export interface CreateBookingRequest {
  route_id: number;
  booking_date: string; // Date of travel
  departure_time: string; // Time (HH:MM format)
  passengers: number;
  special_requirements?: string;
}

export interface UpdateBookingRequest {
  booking_date?: string;
  departure_time?: string;
  passengers?: number;
  special_requirements?: string;
  admin_notes?: string;
}

export interface BookingListParams {
  page?: number;
  per_page?: number;
  status?: BookingStatus;
  user_id?: number;
  vessel_id?: number;
  route_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface BookingListResponse {
  data: Booking[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BookingStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  today_bookings: number;
}
