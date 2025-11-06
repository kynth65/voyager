import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Ship,
  Clock,
  DollarSign,
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { routeService } from '../../services/route';
import type { RouteListParams, Route } from '../../types/route';
import Layout from '../../components/layout/Layout';
import { useDebounce } from '../../hooks/useDebounce';
import { colors } from '../../styles/colors';

export default function RoutesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

  // Debounce search input to avoid triggering queries on every keystroke
  const debouncedSearch = useDebounce(search, 500);

  const params: RouteListParams = {
    page,
    per_page: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as 'active' | 'inactive' }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['routes', params],
    queryFn: () => routeService.getRoutes(params),
  });

  const deleteMutation = useMutation({
    mutationFn: routeService.deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setRouteToDelete(null);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: routeService.restoreRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  const handleDeleteConfirm = () => {
    if (routeToDelete) {
      deleteMutation.mutate(routeToDelete.id);
    }
  };

  const handleRestore = (id: number) => {
    restoreMutation.mutate(id);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: colors.status.confirmed.bg,
            color: colors.status.confirmed.text,
            borderColor: colors.status.confirmed.border,
          }}
        >
          Active
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: colors.neutral[100],
          color: colors.neutral[700],
          borderColor: colors.neutral[300],
        }}
      >
        Inactive
      </span>
    );
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
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
              Error loading routes
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: colors.text.primary }}>
              Route Management
            </h1>
            <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
              Manage ferry routes and schedules
            </p>
          </div>
          <Link
            to="/admin/routes/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.primary.DEFAULT,
              color: colors.text.inverse,
            }}
          >
            <Plus className="w-4 h-4" />
            Add New Route
          </Link>
        </div>

        {/* Filters Card */}
        <div
          className="bg-white rounded-xl border p-6"
          style={{ borderColor: colors.border.DEFAULT }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5" style={{ color: colors.text.tertiary }} />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search routes..."
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.border.DEFAULT,
                  color: colors.text.primary,
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div
            className="flex items-center justify-between mt-4 pt-4 border-t"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
              {data?.total || 0} {data?.total === 1 ? 'route' : 'routes'} found
            </span>
            {(search || statusFilter) && (
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
            )}
          </div>
        </div>

        {/* Routes Table/Cards */}
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
                Loading routes...
              </p>
              <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                Please wait while we fetch the data
              </p>
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: colors.accent.light }}
              >
                <MapPin className="w-8 h-8" style={{ color: colors.primary.DEFAULT }} />
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: colors.text.primary }}>
                No routes found
              </p>
              <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
                {search || statusFilter
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first ferry route'}
              </p>
              <Link
                to="/admin/routes/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  color: colors.text.inverse,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Route
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: colors.border.DEFAULT }}>
                  <thead style={{ backgroundColor: colors.accent.light }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Route
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Vessel
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.border.DEFAULT }}>
                    {data.data.map((route) => (
                      <tr
                        key={route.id}
                        className={`hover:bg-opacity-50 transition-colors ${route.deleted_at ? 'opacity-60' : ''}`}
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => !route.deleted_at && (e.currentTarget.style.backgroundColor = colors.accent.light)}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2.5 rounded-lg flex-shrink-0"
                              style={{ backgroundColor: colors.accent.light }}
                            >
                              <MapPin className="w-5 h-5" style={{ color: colors.primary.DEFAULT }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: colors.text.primary }}>
                                {route.origin}
                                <ArrowRight className="w-4 h-4" style={{ color: colors.text.tertiary }} />
                                {route.destination}
                              </div>
                              {route.deleted_at && (
                                <span className="text-xs font-medium" style={{ color: colors.error.DEFAULT }}>
                                  Deleted
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.primary }}>
                            <Ship className="w-4 h-4" style={{ color: colors.text.tertiary }} />
                            {route.vessel?.name || `Vessel ID: ${route.vessel_id}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.primary }}>
                            <Clock className="w-4 h-4" style={{ color: colors.text.tertiary }} />
                            {formatDuration(route.duration)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: colors.text.primary }}>
                            <DollarSign className="w-4 h-4" style={{ color: colors.success.DEFAULT }} />
                            {route.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(route.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {route.deleted_at ? (
                            <button
                              onClick={() => handleRestore(route.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all hover:shadow-sm"
                              style={{
                                backgroundColor: colors.success.light,
                                color: colors.success.dark,
                              }}
                              title="Restore route"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Restore
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/routes/${route.id}/edit`)}
                                className="p-2 rounded-lg transition-all hover:shadow-sm"
                                style={{ backgroundColor: colors.accent.light }}
                                title="Edit route"
                              >
                                <Edit className="w-4 h-4" style={{ color: colors.primary.DEFAULT }} />
                              </button>
                              <button
                                onClick={() => setRouteToDelete(route)}
                                className="p-2 rounded-lg transition-all hover:shadow-sm"
                                style={{ backgroundColor: colors.error.light }}
                                title="Delete route"
                              >
                                <Trash2 className="w-4 h-4" style={{ color: colors.error.DEFAULT }} />
                              </button>
                            </div>
                          )}
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
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                      onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
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
                        Showing page <span className="font-semibold">{page}</span> of{' '}
                        <span className="font-semibold">{data.last_page}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                          onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
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

        {/* Delete Confirmation Modal */}
        {routeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
              style={{ borderColor: colors.border.DEFAULT }}
            >
              <div
                className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full"
                style={{ backgroundColor: colors.error.light }}
              >
                <AlertCircle className="w-7 h-7" style={{ color: colors.error.DEFAULT }} />
              </div>

              <h3 className="text-lg font-semibold text-center mb-2" style={{ color: colors.text.primary }}>
                Delete Route
              </h3>

              <p className="text-sm text-center mb-6" style={{ color: colors.text.secondary }}>
                Are you sure you want to delete the route{' '}
                <strong style={{ color: colors.text.primary }}>
                  {routeToDelete.origin} → {routeToDelete.destination}
                </strong>
                ? This action will soft delete the route and it can be restored later.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setRouteToDelete(null)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  style={{
                    backgroundColor: colors.neutral[100],
                    color: colors.text.primary,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  style={{
                    backgroundColor: colors.error.DEFAULT,
                    color: colors.text.inverse,
                  }}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
