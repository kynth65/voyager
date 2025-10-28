import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { routeService } from '../../services/route';
import { vesselService } from '../../services/vessel';
import Layout from '../../components/layout/Layout';

const routeSchema = z.object({
  vessel_id: z.number().min(1, 'Please select a vessel'),
  origin: z.string().min(1, 'Origin is required').max(255),
  destination: z.string().min(1, 'Destination is required').max(255),
  price: z.number().min(0, 'Price must be a positive number'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  schedule: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function RouteFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      status: 'active',
    },
  });

  // Fetch route data if editing
  const { data: route, isLoading } = useQuery({
    queryKey: ['route', id],
    queryFn: () => routeService.getRouteById(Number(id)),
    enabled: isEditMode,
  });

  // Fetch vessels for dropdown
  const { data: vesselsData } = useQuery({
    queryKey: ['vessels', { status: 'active' }],
    queryFn: () => vesselService.getVessels({ status: 'active', per_page: 100 }),
  });

  useEffect(() => {
    if (route) {
      setValue('vessel_id', route.vessel_id);
      setValue('origin', route.origin);
      setValue('destination', route.destination);
      setValue('price', route.price);
      setValue('duration', route.duration);
      setValue('schedule', route.schedule || '');
      setValue('status', route.status);
    }
  }, [route, setValue]);

  const createMutation = useMutation({
    mutationFn: routeService.createRoute,
    onSuccess: () => {
      setSuccess('Route created successfully!');
      setTimeout(() => navigate('/admin/routes'), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create route');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RouteFormData) => routeService.updateRoute(Number(id), data),
    onSuccess: () => {
      setSuccess('Route updated successfully!');
      setTimeout(() => navigate('/admin/routes'), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update route');
    },
  });

  const onSubmit = (data: RouteFormData) => {
    setError(null);
    setSuccess(null);
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading route data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Route' : 'Add New Route'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEditMode ? 'Update route information and settings' : 'Create a new ferry route'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Vessel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vessel <span className="text-red-500">*</span>
            </label>
            <select
              {...register('vessel_id', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Select vessel...</option>
              {vesselsData?.data.map((vessel) => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name} ({vessel.type})
                </option>
              ))}
            </select>
            {errors.vessel_id && (
              <p className="mt-1 text-sm text-red-600">{errors.vessel_id.message}</p>
            )}
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('origin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Manila Port"
            />
            {errors.origin && <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>}
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('destination')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Batangas Port"
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 120"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">Enter duration in minutes (e.g., 120 for 2 hours)</p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Passenger (₱) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
            <textarea
              {...register('schedule')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Daily departures at 8:00 AM, 12:00 PM, 4:00 PM"
            />
            {errors.schedule && (
              <p className="mt-1 text-sm text-red-600">{errors.schedule.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Describe the departure schedule (optional)
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/routes')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEditMode
                ? 'Update Route'
                : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
