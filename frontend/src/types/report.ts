export interface BookingExportParams {
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  route_id?: number;
}

export interface RevenueReportParams {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}

export interface PopularRoutesReportParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface RevenueReportPeriod {
  start_date: string;
  end_date: string;
  group_by: 'day' | 'week' | 'month';
}

export interface RevenueByStatus {
  pending?: number;
  completed?: number;
  failed?: number;
  refunded?: number;
}

export interface RevenueReportSummary {
  total_revenue: number;
  revenue_by_status: RevenueByStatus;
}

export interface RevenueOverTimeData {
  period: string;
  booking_count: number;
  revenue: number;
}

export interface TopRouteRevenue {
  route_id: number;
  route: string;
  booking_count: number;
  total_revenue: number;
}

export interface RevenueReport {
  period: RevenueReportPeriod;
  summary: RevenueReportSummary;
  revenue_over_time: RevenueOverTimeData[];
  top_routes: TopRouteRevenue[];
}

export interface RouteStatistics {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_passengers: number;
  cancellation_rate: number;
}

export interface RouteRevenue {
  total: number;
  average_per_booking: number;
}

export interface PopularRouteData {
  route_id: number;
  route: string;
  vessel_name: string;
  price: number;
  statistics: RouteStatistics;
  revenue: RouteRevenue;
}

export interface PopularRoutesReportSummary {
  total_bookings: number;
  total_passengers: number;
  total_revenue: number;
  average_revenue_per_booking: number;
}

export interface PopularRoutesReportPeriod {
  start_date: string;
  end_date: string;
}

export interface PopularRoutesReport {
  period: PopularRoutesReportPeriod;
  summary: PopularRoutesReportSummary;
  routes: PopularRouteData[];
}
