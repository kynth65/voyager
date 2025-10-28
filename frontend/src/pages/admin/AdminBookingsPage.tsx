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
  Search,
  UserCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { bookingService } from '../../services/booking';
import type { Booking, BookingStatus } from '../../types/booking';
import Layout from '../../components/layout/Layout';

export default function AdminBookingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch all bookings (admin view)
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-bookings', statusFilter, searchQuery, fromDate, toDate],
    queryFn: () =>
      bookingService.getBookings({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        date_from: fromDate || undefined,
        date_to: toDate || undefined,
      }),
  });

  const bookings = data?.data || [];

  // Confirm booking mutation
  const confirmBookingMutation = useMutation({
    mutationFn: (id: number) => bookingService.confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setShowConfirmModal(false);
      setSelectedBooking(null);
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (id: number) => bookingService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setShowCancelModal(false);
      setSelectedBooking(null);
    },
  });

  const handleConfirmClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmBookingAction = () => {
    if (selectedBooking) {
      confirmBookingMutation.mutate(selectedBooking.id);
    }
  };

  const cancelBookingAction = () => {
    if (selectedBooking) {
      cancelBookingMutation.mutate(selectedBooking.id);
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
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Ship className="w-12 h-12 text-blue-600 animate-bounce mx-auto mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-gray-600 mt-2">Manage all ferry bookings across the system</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Reference or Customer
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Booking reference or customer name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-gray-600">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
            </span>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h2>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {booking.route?.origin} → {booking.route?.destination}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booking Reference:{' '}
                        <span className="font-mono font-medium">{booking.booking_reference}</span>
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Customer Info */}
                  {booking.user && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Customer Information</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">{booking.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">{booking.user.email}</span>
                        </div>
                        {booking.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600">{booking.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-900 font-medium mb-1">Special Requirements:</p>
                      <p className="text-sm text-blue-800">{booking.special_requirements}</p>
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
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmClick(booking)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Confirm Booking
                          </button>
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
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
                        Payment:{' '}
                        <span className="font-medium">
                          {booking.payment.method?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                        {' • '}
                        Transaction ID:{' '}
                        <span className="font-mono text-xs">{booking.payment.transaction_id || 'N/A'}</span>
                        {' • '}
                        Status:{' '}
                        <span
                          className={`font-medium ${
                            booking.payment.status === 'completed'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {booking.payment.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Booking</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to confirm this booking?
                <br />
                <span className="font-mono font-medium">{selectedBooking.booking_reference}</span>
                <br />
                <span className="text-sm">Customer: {selectedBooking.user?.name}</span>
              </p>

              {confirmBookingMutation.isError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    {(confirmBookingMutation.error as any)?.response?.data?.message ||
                      'Failed to confirm booking. Please try again.'}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedBooking(null);
                  }}
                  disabled={confirmBookingMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBookingAction}
                  disabled={confirmBookingMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {confirmBookingMutation.isPending ? 'Confirming...' : 'Yes, Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this booking?
                <br />
                <span className="font-mono font-medium">{selectedBooking.booking_reference}</span>
                <br />
                <span className="text-sm">Customer: {selectedBooking.user?.name}</span>
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
                    setSelectedBooking(null);
                  }}
                  disabled={cancelBookingMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={cancelBookingAction}
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
