export interface DashboardStats {
  bookings: {
    today: number;
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  revenue: {
    today: number;
    total: number;
    pending: number;
  };
  customers: number;
  vessels: number;
  routes: number;
}

export interface RecentBooking {
  id: number;
  booking_reference: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  vessel: {
    id: number;
    name: string;
    type: string;
  };
  route: {
    id: number;
    origin: string;
    destination: string;
    price: number;
  };
  payment: {
    id: number;
    amount: number;
    status: string;
  } | null;
  booking_date: string;
  departure_time: string;
  passengers: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface BookingsByType {
  type: string;
  count: number;
}

export interface RevenuePeriodData {
  date?: string;
  label: string;
  revenue: number;
  start_date?: string;
  end_date?: string;
  year?: number;
}

export interface RevenueStats {
  total_revenue: number;
  pending_payments: number;
  failed_payments: number;
  revenue_by_period: RevenuePeriodData[];
}

export interface PopularRoute {
  id: number;
  origin: string;
  destination: string;
  price: number;
  bookings_count: number;
  vessel?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface BookingTrendData {
  date?: string;
  label: string;
  count: number;
  start_date?: string;
  end_date?: string;
}

export interface BookingTrends {
  data: BookingTrendData[];
}
