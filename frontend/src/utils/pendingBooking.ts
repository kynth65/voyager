// Utility functions to manage pending bookings in localStorage

export interface PendingBookingData {
  route_id: number;
  booking_date: string;
  departure_time: string;
  passengers: number;
  special_requirements?: string;
  payment_method: string;
  route?: {
    id: number;
    origin: string;
    destination: string;
    price: number;
    duration: number;
    vessel_name: string;
  };
}

const PENDING_BOOKING_KEY = 'pending_booking';

/**
 * Save booking data to localStorage for later completion after login
 */
export function savePendingBooking(bookingData: PendingBookingData): void {
  try {
    localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(bookingData));
  } catch (error) {
    console.error('Failed to save pending booking:', error);
  }
}

/**
 * Retrieve pending booking data from localStorage
 */
export function getPendingBooking(): PendingBookingData | null {
  try {
    const data = localStorage.getItem(PENDING_BOOKING_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to parse pending booking:', error);
  }
  return null;
}

/**
 * Clear pending booking data from localStorage
 */
export function clearPendingBooking(): void {
  try {
    localStorage.removeItem(PENDING_BOOKING_KEY);
  } catch (error) {
    console.error('Failed to clear pending booking:', error);
  }
}

/**
 * Check if there is a pending booking
 */
export function hasPendingBooking(): boolean {
  return localStorage.getItem(PENDING_BOOKING_KEY) !== null;
}
