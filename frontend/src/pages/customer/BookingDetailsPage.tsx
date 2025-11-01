import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
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
  MapPin,
  CreditCard,
  RefreshCw,
  FileText,
  Download,
} from 'lucide-react';
import { bookingService } from '../../services/booking';
import { refundService } from '../../services/payment';
import type { BookingStatus } from '../../types/booking';
import type { RefundStatus } from '../../types/payment';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(Number(id)),
    enabled: !!id,
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });

  // Confirm booking mutation (admin only)
  const confirmBookingMutation = useMutation({
    mutationFn: (bookingId: number) => bookingService.confirmBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });

  // Request refund mutation
  const requestRefundMutation = useMutation({
    mutationFn: (data: { booking_id: number; amount: number; reason: string }) =>
      refundService.createRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      setShowRefundModal(false);
      setRefundReason('');
      alert('Refund request submitted successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to submit refund request');
    },
  });

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(Number(id));
    }
  };

  const handleConfirm = () => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      confirmBookingMutation.mutate(Number(id));
    }
  };

  const handleRequestRefund = () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund request');
      return;
    }
    if (booking && booking.status === 'cancelled' && booking.payment) {
      requestRefundMutation.mutate({
        booking_id: booking.id,
        amount: booking.total_amount,
        reason: refundReason,
      });
    }
  };

  const handleDownloadTicket = async () => {
    if (!id) return;

    setIsDownloadingTicket(true);
    try {
      const blob = await bookingService.downloadTicket(Number(id));

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Voyager-Ticket-${booking?.booking_reference || id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to download ticket. Please try again.');
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  const getRefundStatusBadge = (status: RefundStatus) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending Review' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' },
      processed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Refund Processed' },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-5 h-5" />
        {badge.label}
      </span>
    );
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
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-5 h-5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Ship className="w-12 h-12 text-blue-600 animate-bounce mx-auto mb-4" />
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-2">Reference: <span className="font-mono font-medium">{booking.booking_reference}</span></p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Origin</p>
                <p className="text-lg font-medium text-gray-900">{booking.route?.origin}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="text-lg font-medium text-gray-900">{booking.route?.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Travel Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Ship className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Vessel</p>
                <p className="font-medium text-gray-900">{booking.vessel?.name || 'Ferry'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Travel Date</p>
                <p className="font-medium text-gray-900">{formatDate(booking.booking_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Departure Time</p>
                <p className="font-medium text-gray-900">{formatTime(booking.departure_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Passengers</p>
                <p className="font-medium text-gray-900">{booking.passengers}</p>
              </div>
            </div>
          </div>

          {booking.special_requirements && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-1">Special Requirements:</p>
              <p className="text-sm text-blue-800">{booking.special_requirements}</p>
            </div>
          )}
        </div>

        {/* Customer Information (Admin view) */}
        {isAdmin && booking.user && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{booking.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{booking.user.email}</p>
              </div>
              {booking.user.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{booking.user.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information */}
        {booking.payment && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">${booking.total_amount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {booking.payment.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-900">{booking.payment.transaction_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    booking.payment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.payment.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Information */}
        {booking.refund && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              Refund Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Refund Status</p>
                  <div className="mt-2">
                    {getRefundStatusBadge(booking.refund.status)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Refund Amount</p>
                  <p className="text-2xl font-bold text-blue-600">${booking.refund.amount}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                <p className="text-sm text-gray-600">{booking.refund.reason}</p>
              </div>

              {booking.refund.admin_notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-600">{booking.refund.admin_notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Requested Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(booking.refund.created_at)}
                  </p>
                </div>
                {booking.refund.processed_at && (
                  <div>
                    <p className="text-sm text-gray-600">Processed Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(booking.refund.processed_at)}
                    </p>
                  </div>
                )}
              </div>

              {booking.refund.status === 'processed' && (
                <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      Your refund has been processed and will be credited to your account within 5-7 business days.
                    </p>
                  </div>
                </div>
              )}

              {booking.refund.status === 'approved' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      Your refund request has been approved and is being processed.
                    </p>
                  </div>
                </div>
              )}

              {booking.refund.status === 'rejected' && (
                <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-200">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      Your refund request has been rejected. Please contact support for more information.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Booked on {formatDate(booking.created_at)}</p>
            </div>
            <div className="flex gap-3">
              {(booking.status === 'confirmed' || booking.status === 'completed') && (
                <button
                  onClick={handleDownloadTicket}
                  disabled={isDownloadingTicket}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isDownloadingTicket ? 'Downloading...' : 'Download Ticket'}
                </button>
              )}
              {isAdmin && booking.status === 'pending' && (
                <button
                  onClick={handleConfirm}
                  disabled={confirmBookingMutation.isPending}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirmBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                </button>
              )}
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={handleCancel}
                  disabled={cancelBookingMutation.isPending}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
              {booking.status === 'cancelled' && !booking.refund && booking.payment && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Request Refund
                </button>
              )}
            </div>
          </div>

          {/* Error Messages */}
          {cancelBookingMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                {(cancelBookingMutation.error as any)?.response?.data?.message ||
                  'Failed to cancel booking. Please try again.'}
              </p>
            </div>
          )}
          {confirmBookingMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                {(confirmBookingMutation.error as any)?.response?.data?.message ||
                  'Failed to confirm booking. Please try again.'}
              </p>
            </div>
          )}

          {/* Success Messages */}
          {cancelBookingMutation.isSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Booking cancelled successfully!</p>
            </div>
          )}
          {confirmBookingMutation.isSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Booking confirmed successfully!</p>
            </div>
          )}
        </div>

        {/* Refund Request Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Request Refund
                </h3>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={requestRefundMutation.isPending}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You are requesting a refund for this cancelled booking.
                </p>
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <p className="text-sm font-medium text-blue-900">
                    Refund Amount: ${booking.total_amount}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Refund <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please provide a reason for your refund request..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={requestRefundMutation.isPending}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  disabled={requestRefundMutation.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestRefund}
                  disabled={requestRefundMutation.isPending || !refundReason.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestRefundMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
