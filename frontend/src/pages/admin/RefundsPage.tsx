import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
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
  Check,
  X,
  Clock,
  Loader2,
  User,
} from 'lucide-react';
import { refundService } from '../../services/payment';
import type { Refund, RefundStatus } from '../../types/payment';
import Layout from '../../components/layout/Layout';
import { useDebounce } from '../../hooks/useDebounce';
import { colors } from '../../styles/colors';

export default function RefundsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<RefundStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [processingRefundId, setProcessingRefundId] = useState<number | null>(null);

  // Debounce search input to avoid triggering queries on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch all refunds
  const { data, isLoading, error } = useQuery({
    queryKey: ['refunds', statusFilter, debouncedSearchQuery, fromDate, toDate, page],
    queryFn: () =>
      refundService.getRefunds({
        status: statusFilter || undefined,
        search: debouncedSearchQuery || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page,
        per_page: 15,
      }),
  });

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: (data: { refund_id: number; action: 'approve' | 'reject' | 'process'; notes?: string }) =>
      refundService.processRefund({
        refund_id: data.refund_id,
        status: data.action,
        notes: data.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      setProcessingRefundId(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to process refund');
      setProcessingRefundId(null);
    },
  });

  const refunds = data?.data || [];

  const getStatusBadge = (status: RefundStatus) => {
    const badges = {
      pending: { bg: colors.status.pending.bg, text: colors.status.pending.text, border: colors.status.pending.border, icon: Clock },
      approved: { bg: colors.info.light, text: colors.info.dark, border: colors.info.DEFAULT, icon: CheckCircle },
      rejected: { bg: colors.status.cancelled.bg, text: colors.status.cancelled.text, border: colors.status.cancelled.border, icon: XCircle },
      processed: { bg: colors.status.confirmed.bg, text: colors.status.confirmed.text, border: colors.status.confirmed.border, icon: CheckCircle },
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
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const handleProcessRefund = (refundId: number, action: 'approve' | 'reject' | 'process') => {
    const notes = action === 'reject' ? prompt('Enter reason for rejection:') : undefined;
    if (action === 'reject' && !notes) {
      return;
    }

    setProcessingRefundId(refundId);
    processRefundMutation.mutate({ refund_id: refundId, action, notes: notes || undefined });
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
              Error loading refunds
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
            Refund Management
          </h1>
          <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
            Review and process customer refund requests
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
                  placeholder="Search by booking reference..."
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
              className="pt-4 mt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4"
              style={{ borderColor: colors.border.DEFAULT }}
            >
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as RefundStatus | '');
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processed">Processed</option>
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
              {data?.total || 0} {data?.total === 1 ? 'refund' : 'refunds'} found
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

        {/* Refunds Table */}
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
                Loading refunds...
              </p>
              <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                Please wait while we fetch the data
              </p>
            </div>
          ) : refunds.length === 0 ? (
            <div className="p-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: colors.accent.light }}
              >
                <FileText className="w-8 h-8" style={{ color: colors.primary.DEFAULT }} />
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: colors.text.primary }}>
                No refunds found
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {statusFilter || searchQuery || fromDate || toDate
                  ? 'Try adjusting your filters to see more results'
                  : 'Refund requests will appear here when customers request them'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: colors.border.DEFAULT }}>
                  <thead style={{ backgroundColor: colors.accent.light }}>
                    <tr>
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
                        Reason
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
                    {refunds.map((refund: Refund) => (
                      <tr key={refund.id} className="hover:bg-opacity-50 transition-colors" style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent.light}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-semibold" style={{ color: colors.primary.DEFAULT }}>
                            {refund.booking?.booking_reference}
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
                                {refund.booking?.user?.name}
                              </div>
                              <div className="text-xs truncate" style={{ color: colors.text.secondary }}>
                                {refund.booking?.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold" style={{ color: colors.text.primary }}>
                            <DollarSign className="w-4 h-4 mr-1" style={{ color: colors.success.DEFAULT }} />
                            {refund.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm truncate" style={{ color: colors.text.primary }} title={refund.reason}>
                              {refund.reason}
                            </div>
                            {refund.admin_notes && (
                              <div
                                className="text-xs truncate mt-1 italic"
                                style={{ color: colors.text.tertiary }}
                                title={refund.admin_notes}
                              >
                                Note: {refund.admin_notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(refund.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm" style={{ color: colors.text.primary }}>
                            <Calendar className="w-4 h-4 mr-2" style={{ color: colors.text.tertiary }} />
                            <div>
                              <div>{formatDate(refund.created_at)}</div>
                              {refund.processed_at && (
                                <div className="text-xs mt-0.5" style={{ color: colors.text.secondary }}>
                                  Processed: {formatDateTime(refund.processed_at)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/bookings/${refund.booking_id}`)}
                              className="p-2 rounded-lg transition-all hover:shadow-sm"
                              style={{ backgroundColor: colors.accent.light }}
                              title="View booking"
                            >
                              <Eye className="h-4 w-4" style={{ color: colors.primary.DEFAULT }} />
                            </button>
                            {refund.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleProcessRefund(refund.id, 'approve')}
                                  disabled={processingRefundId === refund.id}
                                  className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: colors.success.light,
                                    color: colors.success.dark,
                                  }}
                                  title="Approve refund"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleProcessRefund(refund.id, 'reject')}
                                  disabled={processingRefundId === refund.id}
                                  className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: colors.error.light,
                                    color: colors.error.dark,
                                  }}
                                  title="Reject refund"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {refund.status === 'approved' && (
                              <button
                                onClick={() => handleProcessRefund(refund.id, 'process')}
                                disabled={processingRefundId === refund.id}
                                className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg border transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundColor: colors.info.light,
                                  color: colors.info.dark,
                                  borderColor: colors.info.DEFAULT,
                                }}
                                title="Process refund"
                              >
                                Process
                              </button>
                            )}
                          </div>
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
