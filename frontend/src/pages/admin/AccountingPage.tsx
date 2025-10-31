import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  Calendar,
  Download,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { paymentService } from '../../services/payment';
import { refundService } from '../../services/payment';
import { bookingService } from '../../services/booking';
import Layout from '../../components/layout/Layout';

export default function AccountingPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch all data
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['accounting-payments', fromDate, toDate],
    queryFn: () =>
      paymentService.getPayments({
        per_page: 10000,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      }),
  });

  const { data: refundsData, isLoading: refundsLoading } = useQuery({
    queryKey: ['accounting-refunds', fromDate, toDate],
    queryFn: () =>
      refundService.getRefunds({
        per_page: 10000,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      }),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['accounting-bookings', fromDate, toDate],
    queryFn: () =>
      bookingService.getBookings({
        per_page: 10000,
        date_from: fromDate || undefined,
        date_to: toDate || undefined,
      }),
  });

  const payments = paymentsData?.data || [];
  const refunds = refundsData?.data || [];
  const bookings = bookingsData?.data || [];

  const isLoading = paymentsLoading || refundsLoading || bookingsLoading;

  // Calculate totals
  const completedPayments = payments.filter((p) => p.status === 'completed');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const failedPayments = payments.filter((p) => p.status === 'failed');

  const totalRevenue = completedPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );

  const failedAmount = failedPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );

  const processedRefunds = refunds.filter((r) => r.status === 'processed');
  const pendingRefunds = refunds.filter((r) => r.status === 'pending');

  const totalRefunds = processedRefunds.reduce(
    (sum, r) => sum + parseFloat(r.amount.toString()),
    0
  );

  const pendingRefundAmount = pendingRefunds.reduce(
    (sum, r) => sum + parseFloat(r.amount.toString()),
    0
  );

  const netRevenue = totalRevenue - totalRefunds;

  // Revenue by payment method
  const revenueByMethod = completedPayments.reduce((acc, payment) => {
    const method = payment.payment_method;
    if (!acc[method]) {
      acc[method] = { count: 0, amount: 0 };
    }
    acc[method].count++;
    acc[method].amount += parseFloat(payment.amount.toString());
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  // Revenue by date
  const revenueByDate = completedPayments.reduce((acc, payment) => {
    const date = payment.payment_date
      ? new Date(payment.payment_date).toISOString().split('T')[0]
      : new Date(payment.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += parseFloat(payment.amount.toString());
    return acc;
  }, {} as Record<string, number>);

  const revenueByDateSorted = Object.entries(revenueByDate)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const methodLabels: Record<string, string> = {
    cash: 'Cash',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer',
    gcash: 'GCash',
    paymaya: 'PayMaya',
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Transaction ID',
      'Booking Reference',
      'Customer',
      'Payment Method',
      'Amount',
      'Status',
    ];

    const rows = payments.map((payment) => [
      payment.payment_date || payment.created_at,
      payment.transaction_id || '',
      payment.booking?.booking_reference || '',
      payment.booking?.user?.name || '',
      methodLabels[payment.payment_method] || payment.payment_method,
      payment.amount,
      payment.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading accounting data...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Accounting & Financial Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive financial overview and accounting reports
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Date Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                <p className="mt-1 text-xs text-gray-500">{completedPayments.length} completed payments</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Payments</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
                <p className="mt-1 text-xs text-gray-500">{pendingPayments.length} pending payments</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(totalRefunds)}</p>
                <p className="mt-1 text-xs text-gray-500">{processedRefunds.length} processed refunds</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{formatCurrency(netRevenue)}</p>
                <p className="mt-1 text-xs text-gray-500">After refunds</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Payment Status Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Completed</p>
                    <p className="text-sm text-gray-600">{completedPayments.length} transactions</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Pending</p>
                    <p className="text-sm text-gray-600">{pendingPayments.length} transactions</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Failed</p>
                    <p className="text-sm text-gray-600">{failedPayments.length} transactions</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-600">{formatCurrency(failedAmount)}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">Total Payments</p>
                  <p className="text-xl font-bold text-gray-900">{payments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Refund Status Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Processed</p>
                    <p className="text-sm text-gray-600">{processedRefunds.length} refunds</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-600">-{formatCurrency(totalRefunds)}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Pending</p>
                    <p className="text-sm text-gray-600">{pendingRefunds.length} refunds</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-yellow-600">-{formatCurrency(pendingRefundAmount)}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Other Status</p>
                    <p className="text-sm text-gray-600">
                      {refunds.filter((r) => r.status !== 'processed' && r.status !== 'pending').length} refunds
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-600">-</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">Total Refunds</p>
                  <p className="text-xl font-bold text-gray-900">{refunds.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Payment Method */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Revenue by Payment Method
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(revenueByMethod)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .map(([method, data]) => {
                    const percentage = totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0;
                    const average = data.count > 0 ? data.amount / data.count : 0;

                    return (
                      <tr key={method} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {methodLabels[method] || method}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {data.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(data.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {formatCurrency(average)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                {Object.keys(revenueByMethod).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No payment data available
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {completedPayments.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {formatCurrency(
                      completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Daily Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Daily Revenue (Last 10 Days with Transactions)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueByDateSorted.map(([date, amount]) => {
                  const maxRevenue = Math.max(...Object.values(revenueByDate));
                  const percentage = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;

                  return (
                    <tr key={date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{formatDate(date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {revenueByDateSorted.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No revenue data available for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accounting Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Accounting Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Gross Revenue (Completed)</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Pending Payments</span>
                <span className="text-sm font-semibold text-yellow-700">{formatCurrency(pendingAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Failed Payments</span>
                <span className="text-sm font-semibold text-red-600">{formatCurrency(failedAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                <span className="text-sm font-medium text-gray-900">Total Payment Activity</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(totalRevenue + pendingAmount + failedAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Processed Refunds</span>
                <span className="text-sm font-semibold text-red-600">-{formatCurrency(totalRefunds)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Pending Refunds</span>
                <span className="text-sm font-semibold text-yellow-700">-{formatCurrency(pendingRefundAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                <span className="text-base font-bold text-gray-900">Net Revenue</span>
                <span className="text-base font-bold text-green-600">{formatCurrency(netRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Expected Net (after pending refunds)</span>
                <span>{formatCurrency(netRevenue - pendingRefundAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bookings.length > 0 ? ((completedPayments.length / bookings.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Avg Transaction</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
