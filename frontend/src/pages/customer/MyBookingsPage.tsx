import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { bookingService } from '../../services/booking';
import type { Booking, BookingStatus } from '../../types/booking';
import Layout from '../../components/layout/Layout';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Fetch customer's bookings
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-bookings', statusFilter],
    queryFn: () => bookingService.getBookings({ status: statusFilter || undefined }),
  });

  const bookings = data?.data || [];

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (id: number) => bookingService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setShowCancelModal(false);
      setBookingToCancel(null);
    },
  });

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel.id);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
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

  const formatTime = (timeString: string) => {
    // timeString is in HH:MM format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Ship className="w-12 h-12 text-blue-600 animate-bounce mx-auto mb-4" />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Error loading bookings. Please try again later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your ferry bookings</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="text-gray-600">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
            </span>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h2>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
            <button
              onClick={() => navigate('/browse-routes')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Routes
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {booking.route?.origin} → {booking.route?.destination}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booking Reference: <span className="font-mono font-medium">{booking.booking_reference}</span>
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Vessel */}
                    <div className="flex items-center gap-3">
                      <Ship className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Vessel</p>
                        <p className="font-medium">{booking.vessel?.name || 'Ferry'}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Travel Date</p>
                        <p className="font-medium">{formatDate(booking.booking_date)}</p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Departure Time</p>
                        <p className="font-medium">{formatTime(booking.departure_time)}</p>
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Passengers</p>
                        <p className="font-medium">{booking.passengers}</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  {booking.special_requirements && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 font-medium mb-1">Special Requirements:</p>
                      <p className="text-sm text-gray-700">{booking.special_requirements}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    {/* Total Amount */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-blue-600">${booking.total_amount}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelClick(booking)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelClick(booking)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  {booking.payment && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Payment: <span className="font-medium">{booking.payment.method.replace('_', ' ').toUpperCase()}</span>
                        {' • '}
                        Transaction ID: <span className="font-mono text-xs">{booking.payment.transaction_id}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking?
              <br />
              <span className="font-mono font-medium">{bookingToCancel.booking_reference}</span>
            </p>

            {cancelBookingMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {(cancelBookingMutation.error as any)?.response?.data?.message ||
                    'Failed to cancel booking. Please try again.'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                }}
                disabled={cancelBookingMutation.isPending}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelBookingMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelBookingMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
