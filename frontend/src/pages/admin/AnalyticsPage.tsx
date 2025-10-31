import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { bookingService } from '../../services/booking';
import { paymentService } from '../../services/payment';
import { refundService } from '../../services/payment';
import Layout from '../../components/layout/Layout';

export default function AnalyticsPage() {
  // Fetch bookings data
  const { data: bookingsData } = useQuery({
    queryKey: ['analytics-bookings'],
    queryFn: () => bookingService.getBookings({ per_page: 1000 }),
  });

  // Fetch payments data
  const { data: paymentsData } = useQuery({
    queryKey: ['analytics-payments'],
    queryFn: () => paymentService.getPayments({ per_page: 1000 }),
  });

  // Fetch refunds data
  const { data: refundsData } = useQuery({
    queryKey: ['analytics-refunds'],
    queryFn: () => refundService.getRefunds({ per_page: 1000 }),
  });

  const bookings = bookingsData?.data || [];
  const payments = paymentsData?.data || [];
  const refunds = refundsData?.data || [];

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const completedPayments = payments.filter((p) => p.status === 'completed').length;

  const totalRefunds = refunds.length;
  const pendingRefunds = refunds.filter((r) => r.status === 'pending').length;
  const processedRefunds = refunds.filter((r) => r.status === 'processed').length;
  const totalRefundAmount = refunds
    .filter((r) => r.status === 'processed')
    .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

  const stats = [
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'blue',
      trend: confirmedBookings,
      trendLabel: 'Confirmed',
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      trend: completedPayments,
      trendLabel: 'Completed',
    },
    {
      label: 'Pending Bookings',
      value: pendingBookings,
      icon: AlertCircle,
      color: 'yellow',
      trend: cancelledBookings,
      trendLabel: 'Cancelled',
    },
    {
      label: 'Total Refunds',
      value: totalRefunds,
      icon: FileText,
      color: 'red',
      trend: pendingRefunds,
      trendLabel: 'Pending',
    },
  ];

  const paymentMethodStats = payments.reduce((acc, payment) => {
    const method = payment.payment_method || 'unknown';
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method]++;
    return acc;
  }, {} as Record<string, number>);

  const statusBreakdown = [
    { label: 'Confirmed', count: confirmedBookings, color: 'bg-green-500' },
    { label: 'Pending', count: pendingBookings, color: 'bg-yellow-500' },
    { label: 'Cancelled', count: cancelledBookings, color: 'bg-red-500' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of key metrics and performance indicators
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              yellow: 'bg-yellow-50 text-yellow-600',
              red: 'bg-red-50 text-red-600',
            };

            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-gray-500">
                        {stat.trend} {stat.trendLabel}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div className="space-y-4">
              {statusBreakdown.map((item) => {
                const percentage = totalBookings > 0 ? (item.count / totalBookings) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm text-gray-600">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {Object.entries(paymentMethodStats).map(([method, count]) => {
                const total = Object.values(paymentMethodStats).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;

                const methodLabels: Record<string, string> = {
                  cash: 'Cash',
                  credit_card: 'Credit Card',
                  debit_card: 'Debit Card',
                  bank_transfer: 'Bank Transfer',
                  gcash: 'GCash',
                  paymaya: 'PayMaya',
                };

                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {methodLabels[method] || method}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(paymentMethodStats).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No payment data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Payments</span>
                <span className="text-sm font-semibold text-gray-900">{payments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-green-600">{completedPayments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{pendingPayments}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                <span className="text-sm font-bold text-gray-900">${totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Refund Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              Refund Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Refunds</span>
                <span className="text-sm font-semibold text-gray-900">{totalRefunds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processed</span>
                <span className="text-sm font-semibold text-green-600">{processedRefunds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{pendingRefunds}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Total Amount</span>
                <span className="text-sm font-bold text-gray-900">${totalRefundAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Net Revenue
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gross Revenue</span>
                <span className="text-sm font-semibold text-gray-900">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Refunded</span>
                <span className="text-sm font-semibold text-red-600">-${totalRefundAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <span className="text-base font-bold text-gray-900">Net Revenue</span>
                <span className="text-base font-bold text-green-600">
                  ${(totalRevenue - totalRefundAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
