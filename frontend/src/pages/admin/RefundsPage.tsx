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
} from 'lucide-react';
import { refundService } from '../../services/payment';
import type { Refund, RefundStatus } from '../../types/payment';
import Layout from '../../components/layout/Layout';
import { useDebounce } from '../../hooks/useDebounce';

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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      processed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Error loading refunds. Please try again later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage refund requests and process refunds
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by booking reference..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as RefundStatus | '');
                    setPage(1);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processed">Processed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-700">
              {data?.total || 0} {data?.total === 1 ? 'refund' : 'refunds'} found
            </span>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading refunds...</p>
            </div>
          ) : refunds.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No refunds found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Ref
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refunds.map((refund: Refund) => (
                      <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium text-blue-600">
                            {refund.booking?.booking_reference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {refund.booking?.user?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {refund.booking?.user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            {refund.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={refund.reason}>
                            {refund.reason}
                          </div>
                          {refund.admin_notes && (
                            <div className="text-xs text-gray-500 max-w-xs truncate" title={refund.admin_notes}>
                              Note: {refund.admin_notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(refund.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(refund.created_at)}
                          </div>
                          {refund.processed_at && (
                            <div className="text-xs text-gray-500">
                              Processed: {formatDateTime(refund.processed_at)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/bookings/${refund.booking_id}`)}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                              title="View booking"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {refund.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleProcessRefund(refund.id, 'approve')}
                                  disabled={processingRefundId === refund.id}
                                  className="inline-flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                  title="Approve refund"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleProcessRefund(refund.id, 'reject')}
                                  disabled={processingRefundId === refund.id}
                                  className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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
                                className="inline-flex items-center px-3 py-1 text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded border border-blue-200 transition-colors disabled:opacity-50"
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
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.last_page}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(page - 1) * 15 + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(page * 15, data.total)}</span> of{' '}
                        <span className="font-medium">{data.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {page} of {data.last_page}
                        </span>
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === data.last_page}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
