import { Link } from 'react-router-dom';
import { Calendar, Eye, Loader2 } from 'lucide-react';
import { colors } from '../../styles/colors';
import type { RecentBooking } from '../../types/dashboard';

interface RecentBookingsTableProps {
  bookings: RecentBooking[];
  isLoading: boolean;
  emptyMessage?: string;
  viewAllLink?: string;
}

export default function RecentBookingsTable({
  bookings,
  isLoading,
  emptyMessage = 'No recent bookings',
  viewAllLink = '/admin/bookings',
}: RecentBookingsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: {
        ...colors.status.confirmed,
      },
      pending: {
        ...colors.status.pending,
      },
      cancelled: {
        ...colors.status.cancelled,
      },
      completed: {
        ...colors.status.completed,
      },
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

  return (
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
          <Calendar className="w-5 h-5" />
          Recent Bookings
        </h3>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm font-medium hover:underline transition-all"
            style={{ color: colors.primary.DEFAULT }}
          >
            View All
          </Link>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2
                className="w-8 h-8 animate-spin mx-auto mb-2"
                style={{ color: colors.primary.DEFAULT }}
              />
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Loading bookings...
              </p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar
              className="w-12 h-12 mx-auto mb-3 opacity-40"
              style={{ color: colors.text.tertiary }}
            />
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all"
                style={{ backgroundColor: colors.accent.light }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate mb-1"
                    style={{ color: colors.text.primary }}
                  >
                    {booking.booking_reference}
                  </p>
                  <p className="text-xs" style={{ color: colors.text.secondary }}>
                    {booking.user.name} • {booking.passengers} passenger
                    {booking.passengers > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                    {booking.route.origin} → {booking.route.destination}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  {getStatusBadge(booking.status)}
                  <Link
                    to={`/admin/bookings/${booking.id}`}
                    className="p-2 rounded-lg hover:shadow-sm transition-all"
                    style={{ backgroundColor: colors.background.subtle }}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" style={{ color: colors.primary.DEFAULT }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
