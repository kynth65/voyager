import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Ship,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  getDashboardStats,
  getRecentBookings,
  getBookingsByType,
  getPopularRoutes,
} from '../../services/dashboard';
import Layout from '../../components/layout/Layout';
import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import RecentBookingsTable from '../../components/dashboard/RecentBookingsTable';
import { colors } from '../../styles/colors';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();

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
            <Loader2
              className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
              style={{ color: colors.primary.DEFAULT }}
            />
            <p style={{ color: colors.text.secondary }}>Loading dashboard...</p>
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
      color: 'primary' as const,
      trend: stats?.bookings.total || 0,
      trendLabel: 'Total',
    },
    {
      label: "Today's Revenue",
      value: `$${(stats?.revenue.today || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'success' as const,
      trend: `$${(stats?.revenue.total || 0).toFixed(2)}`,
      trendLabel: 'Total',
    },
    {
      label: 'Pending Bookings',
      value: stats?.bookings.pending || 0,
      icon: Clock,
      color: 'warning' as const,
      trend: stats?.bookings.confirmed || 0,
      trendLabel: 'Confirmed',
    },
    {
      label: 'Total Customers',
      value: stats?.customers || 0,
      icon: Users,
      color: 'info' as const,
      trend: stats?.bookings.cancelled || 0,
      trendLabel: 'Cancelled',
    },
  ];

  const quickStats = [
    {
      label: 'Active Vessels',
      value: stats?.vessels || 0,
      icon: Ship,
    },
    {
      label: 'Total Routes',
      value: stats?.routes || 0,
      icon: MapPin,
    },
    {
      label: 'Pending Payments',
      value: `$${(stats?.revenue.pending || 0).toFixed(2)}`,
      icon: AlertCircle,
    },
  ];

  const statusBreakdown = [
    {
      label: 'Confirmed',
      count: stats?.bookings.confirmed || 0,
      ...colors.status.confirmed,
      icon: CheckCircle,
    },
    {
      label: 'Pending',
      count: stats?.bookings.pending || 0,
      ...colors.status.pending,
      icon: Clock,
    },
    {
      label: 'Cancelled',
      count: stats?.bookings.cancelled || 0,
      ...colors.status.cancelled,
      icon: XCircle,
    },
  ];

  const totalBookings = stats?.bookings.total || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: colors.text.primary }}>
            {user?.role === 'superadmin' ? 'Superadmin' : 'Admin'} Dashboard
          </h1>
          <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
            Welcome back! Here's an overview of your ferry booking system.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              trendLabel={stat.trendLabel}
            />
          ))}
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl border p-5 hover:shadow-md transition-all"
                style={{ borderColor: colors.border.DEFAULT }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: colors.accent.light }}
                  >
                    <Icon className="w-5 h-5" style={{ color: colors.primary.DEFAULT }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                      {stat.label}
                    </p>
                    <p className="text-xl font-semibold mt-0.5" style={{ color: colors.text.primary }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status Breakdown */}
          <div
            className="bg-white rounded-xl border p-6"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <h3
              className="text-lg font-semibold mb-6 flex items-center gap-2"
              style={{ color: colors.text.primary }}
            >
              <TrendingUp className="w-5 h-5" />
              Booking Status Overview
            </h3>
            <div className="space-y-5">
              {statusBreakdown.map((item) => {
                const Icon = item.icon;
                const percentage = totalBookings > 0 ? (item.count / totalBookings) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded-lg"
                          style={{ backgroundColor: item.bg }}
                        >
                          <Icon className="w-4 h-4" style={{ color: item.text }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                        {item.count}{' '}
                        <span className="font-normal" style={{ color: colors.text.secondary }}>
                          ({percentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-2.5"
                      style={{ backgroundColor: colors.border.DEFAULT }}
                    >
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.text,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookings by Vessel Type */}
          <div
            className="bg-white rounded-xl border p-6"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <h3
              className="text-lg font-semibold mb-6 flex items-center gap-2"
              style={{ color: colors.text.primary }}
            >
              <Ship className="w-5 h-5" />
              Bookings by Vessel Type
            </h3>
            <div className="space-y-5">
              {bookingsByType && bookingsByType.length > 0 ? (
                bookingsByType.map((item, index) => {
                  const totalTypeBookings = bookingsByType.reduce((sum, t) => sum + t.count, 0);
                  const percentage =
                    totalTypeBookings > 0 ? (item.count / totalTypeBookings) * 100 : 0;

                  // Alternate colors for visual distinction
                  const vesselColors = [
                    colors.info.DEFAULT,
                    colors.success.DEFAULT,
                    colors.warning.DEFAULT,
                    colors.primary.DEFAULT,
                  ];
                  const barColor = vesselColors[index % vesselColors.length];

                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm font-medium capitalize"
                          style={{ color: colors.text.primary }}
                        >
                          {item.type}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                          {item.count}{' '}
                          <span className="font-normal" style={{ color: colors.text.secondary }}>
                            ({percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-2.5"
                        style={{ backgroundColor: colors.border.DEFAULT }}
                      >
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Ship
                    className="w-12 h-12 mx-auto mb-3 opacity-40"
                    style={{ color: colors.text.tertiary }}
                  />
                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                    No booking data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout - Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <RecentBookingsTable
            bookings={recentBookings || []}
            isLoading={bookingsLoading}
            emptyMessage="No recent bookings"
            viewAllLink="/admin/bookings"
          />

          {/* Popular Routes */}
          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: colors.border.DEFAULT }}
            >
              <h3
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: colors.text.primary }}
              >
                <MapPin className="w-5 h-5" />
                Popular Routes
              </h3>
              <Link
                to="/admin/routes"
                className="text-sm font-medium hover:underline transition-all"
                style={{ color: colors.primary.DEFAULT }}
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {popularRoutes && popularRoutes.length > 0 ? (
                <div className="space-y-3">
                  {popularRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all"
                      style={{ backgroundColor: colors.accent.light }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold mb-1"
                          style={{ color: colors.text.primary }}
                        >
                          {route.origin} → {route.destination}
                        </p>
                        <p className="text-xs" style={{ color: colors.text.secondary }}>
                          ${Number(route.price).toFixed(2)} per ticket
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p
                          className="text-lg font-semibold"
                          style={{ color: colors.primary.DEFAULT }}
                        >
                          {route.bookings_count}
                        </p>
                        <p className="text-xs" style={{ color: colors.text.tertiary }}>
                          bookings
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin
                    className="w-12 h-12 mx-auto mb-3 opacity-40"
                    style={{ color: colors.text.tertiary }}
                  />
                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                    No route data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
