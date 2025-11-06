import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Clock,
} from 'lucide-react';
import { paymentService } from '../../services/payment';
import type { Payment, PaymentStatus, PaymentMethod } from '../../types/payment';
import Layout from '../../components/layout/Layout';
import { useDebounce } from '../../hooks/useDebounce';
import { colors } from '../../styles/colors';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input to avoid triggering queries on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch all payments
  const { data, isLoading, error } = useQuery({
    queryKey: ['payments', statusFilter, methodFilter, debouncedSearchQuery, fromDate, toDate, page],
    queryFn: () =>
      paymentService.getPayments({
        status: statusFilter || undefined,
        payment_method: methodFilter || undefined,
        search: debouncedSearchQuery || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page,
        per_page: 15,
      }),
  });

  const payments = data?.data || [];

  const getStatusBadge = (status: PaymentStatus) => {
    const badges = {
      pending: { bg: colors.status.pending.bg, text: colors.status.pending.text, border: colors.status.pending.border, icon: Clock },
      completed: { bg: colors.status.confirmed.bg, text: colors.status.confirmed.text, border: colors.status.confirmed.border, icon: CheckCircle },
      failed: { bg: colors.status.cancelled.bg, text: colors.status.cancelled.text, border: colors.status.cancelled.border, icon: XCircle },
      refunded: { bg: colors.neutral[100], text: colors.neutral[700], border: colors.neutral[300], icon: AlertCircle },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
      >
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMethodBadge = (method: PaymentMethod) => {
    const methodLabels: Record<PaymentMethod, string> = {
      cash: 'Cash',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      bank_transfer: 'Bank Transfer',
      gcash: 'GCash',
      paymaya: 'PayMaya',
    };

    const methodColors: Record<PaymentMethod, { bg: string; text: string; border: string }> = {
      cash: { bg: colors.success.light, text: colors.success.dark, border: colors.success.DEFAULT },
      credit_card: { bg: colors.info.light, text: colors.info.dark, border: colors.info.DEFAULT },
      debit_card: { bg: colors.info.light, text: colors.info.dark, border: colors.info.DEFAULT },
      bank_transfer: { bg: colors.accent.light, text: colors.primary.DEFAULT, border: colors.accent.dark },
      gcash: { bg: colors.info.light, text: colors.info.dark, border: colors.info.DEFAULT },
      paymaya: { bg: colors.success.light, text: colors.success.dark, border: colors.success.DEFAULT },
    };

    const colorConfig = methodColors[method];

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        style={{ backgroundColor: colorConfig.bg, color: colorConfig.text, borderColor: colorConfig.border }}
      >
        <CreditCard className="w-3.5 h-3.5" />
        {methodLabels[method]}
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setMethodFilter('');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.error.light }}
            >
              <AlertCircle className="w-8 h-8" style={{ color: colors.error.DEFAULT }} />
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>
              Error loading payments
            </p>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: colors.text.primary }}>
            Payment Management
          </h1>
          <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
            View and track all payment transactions
          </p>
        </div>

        {/* Filters Card */}
        <div
          className="bg-white rounded-xl border p-6"
          style={{ borderColor: colors.border.DEFAULT }}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5" style={{ color: colors.text.tertiary }} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by transaction ID or booking reference..."
                  className="block w-full pl-11 pr-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary.DEFAULT;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.DEFAULT;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-5 py-2.5 border text-sm font-medium rounded-lg transition-all hover:shadow-sm"
              style={{
                borderColor: colors.border.DEFAULT,
                color: colors.text.primary,
                backgroundColor: showFilters ? colors.accent.light : 'white',
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div
              className="pt-4 mt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              style={{ borderColor: colors.border.DEFAULT }}
            >
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as PaymentStatus | '');
                    setPage(1);
                  }}
                  className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Payment Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => {
                    setMethodFilter(e.target.value as PaymentMethod | '');
                    setPage(1);
                  }}
                  className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                />
              </div>
            </div>
          )}

          {/* Filter Summary */}
          <div
            className="flex items-center justify-between mt-4 pt-4 border-t"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
              {data?.total || 0} {data?.total === 1 ? 'payment' : 'payments'} found
            </span>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:shadow-sm"
              style={{
                color: colors.text.secondary,
                backgroundColor: colors.accent.light,
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div
          className="bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: colors.border.DEFAULT }}
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2
                className="w-10 h-10 animate-spin mx-auto mb-4"
                style={{ color: colors.primary.DEFAULT }}
              />
              <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                Loading payments...
              </p>
              <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                Please wait while we fetch the data
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: colors.accent.light }}
              >
                <CreditCard className="w-8 h-8" style={{ color: colors.primary.DEFAULT }} />
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: colors.text.primary }}>
                No payments found
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {statusFilter || methodFilter || searchQuery || fromDate || toDate
                  ? 'Try adjusting your filters to see more results'
                  : 'Payment transactions will appear here when bookings are paid'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: colors.border.DEFAULT }}>
                  <thead style={{ backgroundColor: colors.accent.light }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Booking
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.border.DEFAULT }}>
                    {payments.map((payment: Payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-opacity-50 transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent.light}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium" style={{ color: colors.text.primary }}>
                            {payment.transaction_id || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-semibold" style={{ color: colors.primary.DEFAULT }}>
                            {payment.booking?.booking_reference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: colors.accent.light }}
                            >
                              <User className="w-4 h-4" style={{ color: colors.primary.DEFAULT }} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: colors.text.primary }}>
                                {payment.booking?.user?.name}
                              </div>
                              <div className="text-xs truncate" style={{ color: colors.text.secondary }}>
                                {payment.booking?.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold" style={{ color: colors.text.primary }}>
                            <DollarSign className="w-4 h-4 mr-1" style={{ color: colors.success.DEFAULT }} />
                            {payment.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getMethodBadge(payment.payment_method)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm" style={{ color: colors.text.primary }}>
                            <Calendar className="w-4 h-4 mr-2" style={{ color: colors.text.tertiary }} />
                            {payment.payment_date ? formatDateTime(payment.payment_date) : formatDate(payment.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => navigate(`/bookings/${payment.booking_id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all hover:shadow-sm"
                            style={{
                              backgroundColor: colors.accent.light,
                              color: colors.primary.DEFAULT,
                            }}
                            title="View booking"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.last_page > 1 && (
                <div
                  className="px-6 py-4 flex items-center justify-between border-t"
                  style={{
                    backgroundColor: colors.accent.light,
                    borderColor: colors.border.DEFAULT,
                  }}
                >
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: colors.border.DEFAULT,
                        color: colors.text.primary,
                        backgroundColor: 'white',
                      }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.last_page}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: colors.border.DEFAULT,
                        color: colors.text.primary,
                        backgroundColor: 'white',
                      }}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm" style={{ color: colors.text.primary }}>
                        Showing <span className="font-semibold">{(page - 1) * 15 + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(page * 15, data.total)}</span> of{' '}
                        <span className="font-semibold">{data.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-l-lg border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                          style={{
                            borderColor: colors.border.DEFAULT,
                            color: colors.text.primary,
                            backgroundColor: 'white',
                          }}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span
                          className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                          style={{
                            borderColor: colors.border.DEFAULT,
                            color: colors.text.primary,
                            backgroundColor: 'white',
                          }}
                        >
                          Page {page} of {data.last_page}
                        </span>
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === data.last_page}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-lg border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                          style={{
                            borderColor: colors.border.DEFAULT,
                            color: colors.text.primary,
                            backgroundColor: 'white',
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
