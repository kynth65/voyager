import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { routeService } from '../../services/route';
import { vesselService } from '../../services/vessel';
import Layout from '../../components/layout/Layout';
import { colors } from '../../styles/colors';

const routeSchema = z.object({
  vessel_id: z.number().min(1, 'Please select a vessel'),
  origin: z.string().min(1, 'Origin is required').max(255),
  destination: z.string().min(1, 'Destination is required').max(255),
  price: z.number().min(0, 'Price must be a positive number'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  schedule: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function RouteFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [departureTimes, setDepartureTimes] = useState<string[]>([]);
  const [newDepartureTime, setNewDepartureTime] = useState<string>('');

  // Fetch route data if editing
  const { data: route, isLoading } = useQuery({
    queryKey: ['route', id],
    queryFn: () => routeService.getRouteById(Number(id)),
    enabled: isEditMode,
  });

  // Fetch vessels for dropdown
  const { data: vesselsData, isLoading: vesselsLoading } = useQuery({
    queryKey: ['vessels', { status: 'active' }],
    queryFn: () => vesselService.getVessels({ status: 'active', per_page: 100 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      status: 'active',
      vessel_id: 0,
      origin: '',
      destination: '',
      price: 0,
      duration: 0,
      schedule: '',
    },
  });

  // Pre-populate form when route data is loaded
  useEffect(() => {
    if (route) {
      // Parse departure times from schedule
      let times: string[] = [];
      if (route.schedule) {
        try {
          const parsed = typeof route.schedule === 'string'
            ? JSON.parse(route.schedule)
            : route.schedule;

          // Check if it's an array of times (new format)
          if (Array.isArray(parsed)) {
            times = parsed;
          } else if (parsed.departure_times && Array.isArray(parsed.departure_times)) {
            times = parsed.departure_times;
          }
        } catch (e) {
          console.error('Failed to parse schedule:', e);
        }
      }
      setDepartureTimes(times);

      reset({
        vessel_id: route.vessel_id,
        origin: route.origin,
        destination: route.destination,
        price: route.price,
        duration: route.duration,
        status: route.status,
      });
    }
  }, [route, reset]);

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

  const addDepartureTime = () => {
    if (!newDepartureTime) return;

    // Check if time already exists
    if (departureTimes.includes(newDepartureTime)) {
      setError('This departure time already exists');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Add the new time and sort
    const updatedTimes = [...departureTimes, newDepartureTime].sort();
    setDepartureTimes(updatedTimes);
    setNewDepartureTime('');
  };

  const removeDepartureTime = (timeToRemove: string) => {
    setDepartureTimes(departureTimes.filter(time => time !== timeToRemove));
  };

  const onSubmit = (data: RouteFormData) => {
    setError(null);
    setSuccess(null);

    // Validate that at least one departure time is set
    if (departureTimes.length === 0) {
      setError('Please add at least one departure time');
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...data,
      // Store departure times as JSON array
      schedule: JSON.stringify({ departure_times: departureTimes }),
    };

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2
              className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
              style={{ color: colors.primary.DEFAULT }}
            />
            <p className="text-base font-medium" style={{ color: colors.text.primary }}>
              Loading route data...
            </p>
            <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Please wait while we fetch the information
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/routes')}
            className="p-2 rounded-lg transition-all hover:shadow-sm"
            style={{ backgroundColor: colors.accent.light }}
            title="Back to routes"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: colors.primary.DEFAULT }} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold" style={{ color: colors.text.primary }}>
              {isEditMode ? 'Edit Route' : 'Add New Route'}
            </h1>
            <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
              {isEditMode ? 'Update route information and settings' : 'Create a new ferry route'}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div
            className="rounded-xl border p-4 flex items-start gap-3"
            style={{
              backgroundColor: colors.success.light,
              borderColor: colors.success.DEFAULT,
            }}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.success.dark }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.success.dark }}>
                {success}
              </p>
              <p className="text-xs mt-1" style={{ color: colors.success.dark, opacity: 0.8 }}>
                Redirecting to routes list...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="rounded-xl border p-4 flex items-start gap-3"
            style={{
              backgroundColor: colors.error.light,
              borderColor: colors.error.DEFAULT,
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.error.dark }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: colors.error.dark }}>
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: colors.error.dark }} />
            </button>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: colors.border.DEFAULT }}
          >
            {/* Form Header */}
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{
                backgroundColor: colors.accent.light,
                borderColor: colors.border.DEFAULT,
              }}
            >
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'white' }}
              >
                <MapPin className="w-5 h-5" style={{ color: colors.primary.DEFAULT }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                  Route Information
                </h2>
                <p className="text-xs" style={{ color: colors.text.secondary }}>
                  Fill in the route details below
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Vessel Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Vessel <span style={{ color: colors.error.DEFAULT }}>*</span>
                </label>
                {vesselsLoading ? (
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 border rounded-lg"
                    style={{ borderColor: colors.border.DEFAULT }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.primary.DEFAULT }} />
                    <span className="text-sm" style={{ color: colors.text.secondary }}>
                      Loading vessels...
                    </span>
                  </div>
                ) : (
                  <>
                    <select
                      {...register('vessel_id', { valueAsNumber: true })}
                      className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.vessel_id ? colors.error.DEFAULT : colors.border.DEFAULT,
                        color: colors.text.primary,
                      }}
                    >
                      <option value={0}>Select vessel...</option>
                      {vesselsData?.data.map((vessel) => (
                        <option key={vessel.id} value={vessel.id}>
                          {vessel.name} ({vessel.type} - {vessel.capacity} passengers)
                        </option>
                      ))}
                    </select>
                    {errors.vessel_id && (
                      <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.vessel_id.message}
                      </p>
                    )}
                    {!vesselsData || vesselsData.data.length === 0 ? (
                      <p className="mt-1.5 text-xs" style={{ color: colors.warning.dark }}>
                        No active vessels available. Please create a vessel first.
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              {/* Route Path Section */}
              <div
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: colors.accent.light,
                  borderColor: colors.border.DEFAULT,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <ArrowRight className="w-5 h-5" style={{ color: colors.primary.DEFAULT }} />
                  <h3 className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                    Route Path
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                      Origin <span style={{ color: colors.error.DEFAULT }}>*</span>
                    </label>
                    <input
                      type="text"
                      {...register('origin')}
                      placeholder="e.g., Manila Port"
                      className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.origin ? colors.error.DEFAULT : colors.border.DEFAULT,
                        color: colors.text.primary,
                        backgroundColor: 'white',
                      }}
                      onFocus={(e) => {
                        if (!errors.origin) {
                          e.target.style.borderColor = colors.primary.DEFAULT;
                          e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.origin ? colors.error.DEFAULT : colors.border.DEFAULT;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.origin && (
                      <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.origin.message}
                      </p>
                    )}
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                      Destination <span style={{ color: colors.error.DEFAULT }}>*</span>
                    </label>
                    <input
                      type="text"
                      {...register('destination')}
                      placeholder="e.g., Batangas Port"
                      className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.destination ? colors.error.DEFAULT : colors.border.DEFAULT,
                        color: colors.text.primary,
                        backgroundColor: 'white',
                      }}
                      onFocus={(e) => {
                        if (!errors.destination) {
                          e.target.style.borderColor = colors.primary.DEFAULT;
                          e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.destination ? colors.error.DEFAULT : colors.border.DEFAULT;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.destination && (
                      <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.destination.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Route Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                    Duration (minutes) <span style={{ color: colors.error.DEFAULT }}>*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5" style={{ color: colors.text.tertiary }} />
                    </div>
                    <input
                      type="number"
                      {...register('duration', { valueAsNumber: true })}
                      placeholder="e.g., 120"
                      className="block w-full pl-11 pr-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.duration ? colors.error.DEFAULT : colors.border.DEFAULT,
                        color: colors.text.primary,
                      }}
                      onFocus={(e) => {
                        if (!errors.duration) {
                          e.target.style.borderColor = colors.primary.DEFAULT;
                          e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.duration ? colors.error.DEFAULT : colors.border.DEFAULT;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  {errors.duration && (
                    <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.duration.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs" style={{ color: colors.text.tertiary }}>
                    Enter duration in minutes (e.g., 120 for 2 hours)
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                    Price per Passenger <span style={{ color: colors.error.DEFAULT }}>*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5" style={{ color: colors.text.tertiary }} />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="e.g., 500.00"
                      className="block w-full pl-11 pr-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.price ? colors.error.DEFAULT : colors.border.DEFAULT,
                        color: colors.text.primary,
                      }}
                      onFocus={(e) => {
                        if (!errors.price) {
                          e.target.style.borderColor = colors.primary.DEFAULT;
                          e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.price ? colors.error.DEFAULT : colors.border.DEFAULT;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.price.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs" style={{ color: colors.text.tertiary }}>
                    Price in USD per passenger
                  </p>
                </div>
              </div>

              {/* Fixed Departure Times */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Fixed Departure Schedule <span style={{ color: colors.error.DEFAULT }}>*</span>
                </label>
                <div
                  className="rounded-xl border p-5"
                  style={{
                    backgroundColor: colors.accent.light,
                    borderColor: colors.border.DEFAULT,
                  }}
                >
                  {/* Add Departure Time Input */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <input
                        type="time"
                        value={newDepartureTime}
                        onChange={(e) => setNewDepartureTime(e.target.value)}
                        className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                        style={{
                          borderColor: colors.border.DEFAULT,
                          color: colors.text.primary,
                          backgroundColor: 'white',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = colors.primary.DEFAULT;
                          e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = colors.border.DEFAULT;
                          e.target.style.boxShadow = 'none';
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addDepartureTime();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addDepartureTime}
                      disabled={!newDepartureTime}
                      className="px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: colors.primary.DEFAULT,
                        color: colors.text.inverse,
                      }}
                    >
                      Add Time
                    </button>
                  </div>

                  {/* List of Departure Times */}
                  {departureTimes.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium mb-2" style={{ color: colors.text.secondary }}>
                        Scheduled Departure Times ({departureTimes.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {departureTimes.map((time) => (
                          <div
                            key={time}
                            className="flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-lg"
                            style={{ borderColor: colors.border.DEFAULT }}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" style={{ color: colors.primary.DEFAULT }} />
                              <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                                {time}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDepartureTime(time)}
                              className="p-1 rounded hover:bg-red-50 transition-colors"
                              title="Remove this time"
                            >
                              <X className="w-4 h-4" style={{ color: colors.error.DEFAULT }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{
                        backgroundColor: 'white',
                        borderWidth: '2px',
                        borderStyle: 'dashed',
                        borderColor: colors.border.DEFAULT,
                      }}
                    >
                      <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: colors.text.tertiary }} />
                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        No departure times added yet
                      </p>
                      <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                        Add at least one departure time to continue
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-xs" style={{ color: colors.text.tertiary }}>
                    Add fixed departure times for this route (e.g., 08:00, 12:00, 16:00, 20:00)
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Status
                </label>
                <select
                  {...register('status')}
                  className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.status ? colors.error.DEFAULT : colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && (
                  <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {/* Form Footer with Actions */}
            <div
              className="px-6 py-4 border-t flex items-center justify-between gap-4"
              style={{
                backgroundColor: colors.accent.light,
                borderColor: colors.border.DEFAULT,
              }}
            >
              <p className="text-xs" style={{ color: colors.text.secondary }}>
                <span style={{ color: colors.error.DEFAULT }}>*</span> Required fields
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/routes')}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.neutral[100],
                    color: colors.text.primary,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.primary.DEFAULT,
                    color: colors.text.inverse,
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {isEditMode ? 'Update Route' : 'Create Route'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
