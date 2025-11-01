import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Ship,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getDashboardStats,
  getRecentBookings,
  getBookingsByType,
  getPopularRoutes,
} from '../../services/dashboard';
import Layout from '../../components/layout/Layout';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['dashboard-recent-bookings'],
    queryFn: () => getRecentBookings(5),
  });

  // Fetch bookings by type
  const { data: bookingsByType } = useQuery({
    queryKey: ['dashboard-bookings-by-type'],
    queryFn: getBookingsByType,
  });

  // Fetch popular routes
  const { data: popularRoutes } = useQuery({
    queryKey: ['dashboard-popular-routes'],
    queryFn: () => getPopularRoutes(5),
  });

  if (statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      label: "Today's Bookings",
      value: stats?.bookings.today || 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: stats?.bookings.total || 0,
      trendLabel: 'Total',
    },
    {
      label: "Today's Revenue",
      value: `$${(stats?.revenue.today || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: `$${(stats?.revenue.total || 0).toFixed(2)}`,
      trendLabel: 'Total',
    },
    {
      label: 'Pending Bookings',
      value: stats?.bookings.pending || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      trend: stats?.bookings.confirmed || 0,
      trendLabel: 'Confirmed',
    },
    {
      label: 'Total Customers',
      value: stats?.customers || 0,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      trend: stats?.bookings.cancelled || 0,
      trendLabel: 'Cancelled',
    },
  ];

  const quickStats = [
    {
      label: 'Active Vessels',
      value: stats?.vessels || 0,
      icon: Ship,
      color: 'text-blue-600',
    },
    {
      label: 'Total Routes',
      value: stats?.routes || 0,
      icon: MapPin,
      color: 'text-green-600',
    },
    {
      label: 'Pending Payments',
      value: `$${(stats?.revenue.pending || 0).toFixed(2)}`,
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
  ];

  const statusBreakdown = [
    {
      label: 'Confirmed',
      count: stats?.bookings.confirmed || 0,
      color: 'bg-green-500',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    {
      label: 'Pending',
      count: stats?.bookings.pending || 0,
      color: 'bg-yellow-500',
      icon: Clock,
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Cancelled',
      count: stats?.bookings.cancelled || 0,
      color: 'bg-red-500',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
  ];

  const totalBookings = stats?.bookings.total || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's an overview of your ferry booking system.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-gray-500">
                        {stat.trend} {stat.trendLabel}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Booking Status Overview
            </h3>
            <div className="space-y-4">
              {statusBreakdown.map((item) => {
                const Icon = item.icon;
                const percentage = totalBookings > 0 ? (item.count / totalBookings) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookings by Vessel Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ship className="w-5 h-5 text-blue-600" />
              Bookings by Vessel Type
            </h3>
            <div className="space-y-4">
              {bookingsByType && bookingsByType.length > 0 ? (
                bookingsByType.map((item) => {
                  const totalTypeBookings = bookingsByType.reduce((sum, t) => sum + t.count, 0);
                  const percentage =
                    totalTypeBookings > 0 ? (item.count / totalTypeBookings) * 100 : 0;

                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {item.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No booking data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout - Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Recent Bookings
              </h3>
              <Link
                to="/admin/bookings"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading bookings...</p>
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.booking_reference}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.user.name} • {booking.passengers} passenger
                        {booking.passengers > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No recent bookings</p>
              )}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Popular Routes
              </h3>
              <Link
                to="/admin/routes"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {popularRoutes && popularRoutes.length > 0 ? (
                popularRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {route.origin} → {route.destination}
                      </p>
                      <p className="text-xs text-gray-500">${Number(route.price).toFixed(2)} per ticket</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">
                          {route.bookings_count}
                        </p>
                        <p className="text-xs text-gray-500">bookings</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No route data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
