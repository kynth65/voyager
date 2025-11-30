import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ship,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { vesselService } from '../../services/vessel';
import type { VesselListParams, Vessel, VesselType, VesselStatus } from '../../types/vessel';
import Layout from '../../components/layout/Layout';
import { useDebounce } from '../../hooks/useDebounce';
import { colors } from '../../styles/colors';
import { getVesselImage } from '../../utils/vesselImages';

export default function VesselsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<VesselType | ''>('');
  const [statusFilter, setStatusFilter] = useState<VesselStatus | ''>('');
  const [vesselToDelete, setVesselToDelete] = useState<Vessel | null>(null);

  // Debounce search input to avoid triggering queries on every keystroke
  const debouncedSearch = useDebounce(search, 500);

  const params: VesselListParams = {
    page,
    per_page: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(typeFilter && { type: typeFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['vessels', params],
    queryFn: () => vesselService.getVessels(params),
  });

  const deleteMutation = useMutation({
    mutationFn: vesselService.deleteVessel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      setVesselToDelete(null);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: vesselService.restoreVessel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });

  const handleDeleteConfirm = () => {
    if (vesselToDelete) {
      deleteMutation.mutate(vesselToDelete.id);
    }
  };

  const handleRestore = (id: number) => {
    restoreMutation.mutate(id);
  };

  const getStatusBadge = (status: VesselStatus) => {
    const statusConfig = {
      active: {
        bg: colors.status.confirmed.bg,
        text: colors.status.confirmed.text,
        border: colors.status.confirmed.border,
        icon: CheckCircle,
      },
      inactive: {
        bg: colors.neutral[100],
        text: colors.neutral[700],
        border: colors.neutral[300],
        icon: XCircle,
      },
      maintenance: {
        bg: colors.status.pending.bg,
        text: colors.status.pending.text,
        border: colors.status.pending.border,
        icon: Clock,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
      >
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: VesselType) => {
    const typeConfig: Record<VesselType, { bg: string; text: string; border: string }> = {
      ferry: { bg: colors.info.light, text: colors.info.dark, border: colors.info.DEFAULT },
      charter: { bg: colors.success.light, text: colors.success.dark, border: colors.success.DEFAULT },
      speedboat: { bg: colors.accent.light, text: colors.primary.DEFAULT, border: colors.accent.dark },
      yacht: { bg: colors.warning.light, text: colors.warning.dark, border: colors.warning.DEFAULT },
    };

    const config = typeConfig[type];

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
      >
        <Ship className="w-3.5 h-3.5" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
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
              Error loading vessels
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
              Vessel Management
            </h1>
            <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
              Manage your fleet of boats and vessels
            </p>
          </div>
          <Link
            to="/admin/vessels/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.primary.DEFAULT,
              color: colors.text.inverse,
            }}
          >
            <Plus className="w-4 h-4" />
            Add New Vessel
          </Link>
        </div>

        {/* Filters Card */}
        <div
          className="bg-white rounded-xl border p-6"
          style={{ borderColor: colors.border.DEFAULT }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="Search vessels..."
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
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as VesselType | '');
                  setPage(1);
                }}
                className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.border.DEFAULT,
                  color: colors.text.primary,
                }}
              >
                <option value="">All Types</option>
                <option value="ferry">Ferry</option>
                <option value="charter">Charter</option>
                <option value="speedboat">Speedboat</option>
                <option value="yacht">Yacht</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as VesselStatus | '');
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
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div
            className="flex items-center justify-between mt-4 pt-4 border-t"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
              {data?.total || 0} {data?.total === 1 ? 'vessel' : 'vessels'} found
            </span>
            {(search || typeFilter || statusFilter) && (
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

        {/* Vessels Table */}
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
                Loading vessels...
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
                <Ship className="w-8 h-8" style={{ color: colors.primary.DEFAULT }} />
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: colors.text.primary }}>
                No vessels found
              </p>
              <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
                {search || typeFilter || statusFilter
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by adding your first vessel to the fleet'}
              </p>
              <Link
                to="/admin/vessels/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  color: colors.text.inverse,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Vessel
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: colors.border.DEFAULT }}>
                  <thead style={{ backgroundColor: colors.accent.light }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Vessel
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Capacity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                        Description
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
                    {data.data.map((vessel) => (
                      <tr
                        key={vessel.id}
                        className={`hover:bg-opacity-50 transition-colors ${vessel.deleted_at ? 'opacity-60' : ''}`}
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => !vessel.deleted_at && (e.currentTarget.style.backgroundColor = colors.accent.light)}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {vessel.image || getVesselImage(vessel.name) ? (
                              <img
                                src={vessel.image || getVesselImage(vessel.name) || ''}
                                alt={vessel.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                style={{ border: `2px solid ${colors.border.DEFAULT}` }}
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: colors.accent.light }}
                              >
                                <Ship className="w-6 h-6" style={{ color: colors.primary.DEFAULT }} />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-semibold mb-0.5" style={{ color: colors.text.primary }}>
                                {vessel.name}
                              </div>
                              {vessel.deleted_at && (
                                <span className="text-xs font-medium" style={{ color: colors.error.DEFAULT }}>
                                  Deleted
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(vessel.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                            <Users className="w-4 h-4" style={{ color: colors.text.tertiary }} />
                            {vessel.capacity} passengers
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {vessel.description ? (
                            <div className="text-sm max-w-xs truncate" style={{ color: colors.text.secondary }} title={vessel.description}>
                              {vessel.description}
                            </div>
                          ) : (
                            <span className="text-sm italic" style={{ color: colors.text.tertiary }}>
                              No description
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(vessel.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {vessel.deleted_at ? (
                            <button
                              onClick={() => handleRestore(vessel.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all hover:shadow-sm"
                              style={{
                                backgroundColor: colors.success.light,
                                color: colors.success.dark,
                              }}
                              title="Restore vessel"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Restore
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/vessels/${vessel.id}/edit`)}
                                className="p-2 rounded-lg transition-all hover:shadow-sm"
                                style={{ backgroundColor: colors.accent.light }}
                                title="Edit vessel"
                              >
                                <Edit className="w-4 h-4" style={{ color: colors.primary.DEFAULT }} />
                              </button>
                              <button
                                onClick={() => setVesselToDelete(vessel)}
                                className="p-2 rounded-lg transition-all hover:shadow-sm"
                                style={{ backgroundColor: colors.error.light }}
                                title="Delete vessel"
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
        {vesselToDelete && (
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
                Delete Vessel
              </h3>

              <p className="text-sm text-center mb-6" style={{ color: colors.text.secondary }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: colors.text.primary }}>{vesselToDelete.name}</strong>? This
                action will soft delete the vessel and it can be restored later.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setVesselToDelete(null)}
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
