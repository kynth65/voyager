import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  BarChart3,
  FileDown,
  Filter,
} from 'lucide-react';
import { reportService } from '../../services/report';
import Layout from '../../components/layout/Layout';
import { format, subDays } from 'date-fns';

type ReportTab = 'bookings' | 'revenue' | 'popular-routes';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [exportLoading, setExportLoading] = useState(false);

  // Filter states for booking export
  const [bookingFilters, setBookingFilters] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    status: '' as '' | 'pending' | 'confirmed' | 'cancelled' | 'completed',
  });

  // Filter states for revenue report
  const [revenueFilters, setRevenueFilters] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    group_by: 'day' as 'day' | 'week' | 'month',
  });

  // Filter states for popular routes
  const [routesFilters, setRoutesFilters] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    limit: 10,
  });

  // Fetch revenue report
  const { data: revenueReport, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery({
    queryKey: ['revenue-report', revenueFilters],
    queryFn: () => reportService.generateRevenueReport(revenueFilters),
    enabled: activeTab === 'revenue',
  });

  // Fetch popular routes report
  const { data: routesReport, isLoading: routesLoading, refetch: refetchRoutes } = useQuery({
    queryKey: ['popular-routes-report', routesFilters],
    queryFn: () => reportService.generatePopularRoutesReport(routesFilters),
    enabled: activeTab === 'popular-routes',
  });

  // Handle CSV export
  const handleExportBookings = async () => {
    try {
      setExportLoading(true);
      const params = {
        start_date: bookingFilters.start_date,
        end_date: bookingFilters.end_date,
        ...(bookingFilters.status && { status: bookingFilters.status }),
      };
      const blob = await reportService.exportBookingsCSV(params);
      const filename = `bookings_export_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
      reportService.downloadFile(blob, filename);
    } catch (error) {
      console.error('Failed to export bookings:', error);
      alert('Failed to export bookings. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const tabs = [
    { id: 'revenue' as ReportTab, label: 'Revenue Report', icon: DollarSign },
    { id: 'popular-routes' as ReportTab, label: 'Popular Routes', icon: TrendingUp },
    { id: 'bookings' as ReportTab, label: 'Export Bookings', icon: FileDown },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          </div>
          <p className="text-gray-600">
            Generate detailed reports and export booking data for analysis
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Revenue Report Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Report Filters</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={revenueFilters.start_date}
                    onChange={(e) =>
                      setRevenueFilters({ ...revenueFilters, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={revenueFilters.end_date}
                    onChange={(e) =>
                      setRevenueFilters({ ...revenueFilters, end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group By
                  </label>
                  <select
                    value={revenueFilters.group_by}
                    onChange={(e) =>
                      setRevenueFilters({
                        ...revenueFilters,
                        group_by: e.target.value as 'day' | 'week' | 'month',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => refetchRevenue()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {revenueLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Generating report...</p>
                </div>
              </div>
            )}

            {/* Revenue Summary Cards */}
            {!revenueLoading && revenueReport && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      ${revenueReport.summary.total_revenue.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Report Period</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(revenueReport.period.start_date), 'MMM dd')} -{' '}
                      {format(new Date(revenueReport.period.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Completed Payments</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(revenueReport.summary.revenue_by_status.completed || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Revenue Over Time */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {revenueReport.revenue_over_time.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.period}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.booking_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ${item.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Routes by Revenue */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top Routes by Revenue
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {revenueReport.top_routes.map((route) => (
                          <tr key={route.route_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {route.route}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {route.booking_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ${route.total_revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Popular Routes Report Tab */}
        {activeTab === 'popular-routes' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Report Filters</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={routesFilters.start_date}
                    onChange={(e) =>
                      setRoutesFilters({ ...routesFilters, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={routesFilters.end_date}
                    onChange={(e) =>
                      setRoutesFilters({ ...routesFilters, end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Routes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={routesFilters.limit}
                    onChange={(e) =>
                      setRoutesFilters({ ...routesFilters, limit: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => refetchRoutes()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {routesLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Generating report...</p>
                </div>
              </div>
            )}

            {/* Routes Summary */}
            {!routesLoading && routesReport && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {routesReport.summary.total_bookings}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Passengers</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {routesReport.summary.total_passengers}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      ${routesReport.summary.total_revenue.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Avg per Booking</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      ${routesReport.summary.average_revenue_per_booking.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Popular Routes Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Most Popular Routes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vessel
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Passengers
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cancel Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {routesReport.routes.map((route, index) => (
                          <tr key={route.route_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {route.route}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {route.vessel_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${route.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {route.statistics.total_bookings}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {route.statistics.total_passengers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ${route.revenue.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  route.statistics.cancellation_rate > 20
                                    ? 'bg-red-100 text-red-800'
                                    : route.statistics.cancellation_rate > 10
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {route.statistics.cancellation_rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Export Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileDown className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Export Bookings to CSV</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Download a CSV file containing all bookings matching your filter criteria. This is
                useful for importing into Excel or other analysis tools.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={bookingFilters.start_date}
                      onChange={(e) =>
                        setBookingFilters({ ...bookingFilters, start_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={bookingFilters.end_date}
                      onChange={(e) =>
                        setBookingFilters({ ...bookingFilters, end_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Status
                    </label>
                    <select
                      value={bookingFilters.status}
                      onChange={(e) =>
                        setBookingFilters({
                          ...bookingFilters,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleExportBookings}
                    disabled={exportLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export to CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    What's included in the export?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Booking reference number</li>
                    <li>• Customer details (name, email)</li>
                    <li>• Route information (origin, destination)</li>
                    <li>• Vessel name</li>
                    <li>• Travel date and time</li>
                    <li>• Number of passengers</li>
                    <li>• Total amount and payment status</li>
                    <li>• Booking status and creation date</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
