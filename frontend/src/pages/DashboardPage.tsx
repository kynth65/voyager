import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Calendar, Ship, BookOpen, Package, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { bookingService } from '../services/booking';
import { colors } from '../styles/colors';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect admin and superadmin to their dashboard
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Fetch customer's recent bookings
  const { data: bookingsData } = useQuery({
    queryKey: ['my-recent-bookings'],
    queryFn: () => bookingService.getBookings({ per_page: 3 }),
  });

  const recentBookings = bookingsData?.data || [];
  const totalBookings = bookingsData?.total || 0;

  const getRoleBadge = (role: string) => {
    const roleConfig = colors.roles[role as keyof typeof colors.roles] || colors.roles.customer;
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: roleConfig.bg,
          color: roleConfig.text,
          borderColor: roleConfig.border,
        }}
      >
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: colors.status.confirmed,
      pending: colors.status.pending,
      cancelled: colors.status.cancelled,
      completed: colors.status.completed,
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: config.bg,
          color: config.text,
          borderColor: config.border,
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div
          className="rounded-2xl overflow-hidden p-8"
          style={{
            background: `linear-gradient(135deg, ${colors.primary.DEFAULT} 0%, ${colors.primary.light} 100%)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-4 rounded-2xl backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <User className="w-8 h-8" style={{ color: colors.text.inverse }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: colors.text.inverse }}>
                Welcome back, {user?.first_name || user?.name}!
              </h1>
              <p className="mt-1 opacity-90" style={{ color: colors.text.inverse }}>
                Explore ferry routes and manage your bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Bookings */}
          <div
            className="bg-white rounded-xl border p-6 hover:shadow-md transition-all"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  Total Bookings
                </p>
                <p className="text-3xl font-semibold mt-2" style={{ color: colors.text.primary }}>
                  {totalBookings}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: colors.accent.light }}
              >
                <Package className="w-6 h-6" style={{ color: colors.primary.DEFAULT }} />
              </div>
            </div>
          </div>

          {/* Quick Action: Browse Routes */}
          <button
            onClick={() => navigate('/browse-routes')}
            className="bg-white rounded-xl border p-6 hover:shadow-md transition-all text-left group"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  Browse Routes
                </p>
                <p className="text-sm mt-2" style={{ color: colors.text.primary }}>
                  Find your next journey
                </p>
              </div>
              <div
                className="p-4 rounded-xl group-hover:scale-110 transition-transform"
                style={{ backgroundColor: colors.success.light }}
              >
                <Ship className="w-6 h-6" style={{ color: colors.success.DEFAULT }} />
              </div>
            </div>
          </button>

          {/* Quick Action: My Bookings */}
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-white rounded-xl border p-6 hover:shadow-md transition-all text-left group"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  My Bookings
                </p>
                <p className="text-sm mt-2" style={{ color: colors.text.primary }}>
                  View booking history
                </p>
              </div>
              <div
                className="p-4 rounded-xl group-hover:scale-110 transition-transform"
                style={{ backgroundColor: colors.info.light }}
              >
                <BookOpen className="w-6 h-6" style={{ color: colors.info.DEFAULT }} />
              </div>
            </div>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Details Card */}
          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.accent.light,
              }}
            >
              <h3
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: colors.text.primary }}
              >
                <User className="w-5 h-5" />
                Account Details
              </h3>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div className="flex items-start justify-between">
                  <dt
                    className="flex items-center text-sm font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </dt>
                  <dd className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {user?.name}
                  </dd>
                </div>

                <div className="flex items-start justify-between">
                  <dt
                    className="flex items-center text-sm font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </dt>
                  <dd className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {user?.email}
                  </dd>
                </div>

                {user?.phone && (
                  <div className="flex items-start justify-between">
                    <dt
                      className="flex items-center text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </dt>
                    <dd className="text-sm font-medium" style={{ color: colors.text.primary }}>
                      {user.phone}
                    </dd>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <dt
                    className="flex items-center text-sm font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Member Since
                  </dt>
                  <dd className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {formatDate(user?.created_at || '')}
                  </dd>
                </div>

                <div className="flex items-start justify-between">
                  <dt
                    className="flex items-center text-sm font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Role
                  </dt>
                  <dd>{getRoleBadge(user?.role || 'customer')}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Recent Bookings Card */}
          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.accent.light,
              }}
            >
              <h3
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: colors.text.primary }}
              >
                <Calendar className="w-5 h-5" />
                Recent Bookings
              </h3>
              {totalBookings > 3 && (
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="text-sm font-medium hover:underline"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  View All
                </button>
              )}
            </div>
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Ship
                    className="w-12 h-12 mx-auto mb-3 opacity-40"
                    style={{ color: colors.text.tertiary }}
                  />
                  <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
                    No bookings yet
                  </p>
                  <button
                    onClick={() => navigate('/browse-routes')}
                    className="px-6 py-2 rounded-xl font-medium text-sm hover:shadow-md transition-all"
                    style={{
                      backgroundColor: colors.primary.DEFAULT,
                      color: colors.text.inverse,
                    }}
                  >
                    Browse Routes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-lg hover:shadow-sm transition-all cursor-pointer"
                      style={{ backgroundColor: colors.accent.light }}
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p
                          className="text-sm font-semibold font-mono"
                          style={{ color: colors.text.primary }}
                        >
                          {booking.booking_reference}
                        </p>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-xs mb-1" style={{ color: colors.text.secondary }}>
                        {booking.route?.origin} → {booking.route?.destination}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs" style={{ color: colors.text.tertiary }}>
                          {formatDate(booking.booking_date)} • {booking.passengers} passenger
                          {booking.passengers > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: colors.primary.DEFAULT }}>
                          ${booking.total_amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
