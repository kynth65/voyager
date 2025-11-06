import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Ship,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { vesselService } from '../../services/vessel';
import Layout from '../../components/layout/Layout';
import { colors } from '../../styles/colors';

const vesselSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.enum(['ferry', 'charter', 'speedboat', 'yacht'] as const),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance'] as const),
});

type VesselFormData = z.infer<typeof vesselSchema>;

export default function VesselFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch vessel data if editing
  const { data: vessel, isLoading } = useQuery({
    queryKey: ['vessel', id],
    queryFn: () => vesselService.getVesselById(Number(id)),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VesselFormData>({
    resolver: zodResolver(vesselSchema),
    defaultValues: {
      status: 'active',
      name: '',
      type: 'ferry',
      capacity: 0,
      description: '',
    },
  });

  // Pre-populate form when vessel data is loaded
  useEffect(() => {
    if (vessel) {
      reset({
        name: vessel.name,
        type: vessel.type,
        capacity: vessel.capacity,
        description: vessel.description || '',
        status: vessel.status,
      });

      // Set image preview if vessel has an image
      if (vessel.image_url) {
        setImagePreview(vessel.image_url);
      } else if (vessel.image) {
        // Fallback to image path if image_url is not available
        setImagePreview(`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${vessel.image}`);
      }
    }
  }, [vessel, reset]);

  const createMutation = useMutation({
    mutationFn: vesselService.createVessel,
    onSuccess: async (data) => {
      // Upload image if provided
      if (imageFile) {
        try {
          await vesselService.uploadVesselImage(data.id, imageFile);
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
      setSuccess('Vessel created successfully!');
      setTimeout(() => navigate('/admin/vessels'), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create vessel');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: VesselFormData) => vesselService.updateVessel(Number(id), data),
    onSuccess: async () => {
      // Upload image if provided
      if (imageFile && id) {
        try {
          await vesselService.uploadVesselImage(Number(id), imageFile);
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
      setSuccess('Vessel updated successfully!');
      setTimeout(() => navigate('/admin/vessels'), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update vessel');
    },
  });

  const onSubmit: SubmitHandler<VesselFormData> = (data) => {
    setError(null);
    setSuccess(null);
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    if (id && window.confirm('Are you sure you want to delete the image?')) {
      try {
        await vesselService.deleteVesselImage(Number(id));
        setImagePreview(null);
        setImageFile(null);
        setSuccess('Image deleted successfully');
      } catch (err) {
        setError('Failed to delete image');
      }
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    setImageFile(null);
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
              Loading vessel data...
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
            onClick={() => navigate('/admin/vessels')}
            className="p-2 rounded-lg transition-all hover:shadow-sm"
            style={{ backgroundColor: colors.accent.light }}
            title="Back to vessels"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: colors.primary.DEFAULT }} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold" style={{ color: colors.text.primary }}>
              {isEditMode ? 'Edit Vessel' : 'Add New Vessel'}
            </h1>
            <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
              {isEditMode
                ? 'Update vessel information and settings'
                : 'Create a new vessel for ferry or charter bookings'}
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
                Redirecting to vessels list...
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
                <Ship className="w-5 h-5" style={{ color: colors.primary.DEFAULT }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                  Vessel Information
                </h2>
                <p className="text-xs" style={{ color: colors.text.secondary }}>
                  Fill in the details below
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Vessel Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
                  Vessel Image
                </label>

                {imagePreview ? (
                  <div className="space-y-3">
                    <div
                      className="relative inline-block rounded-xl overflow-hidden border-2"
                      style={{ borderColor: colors.border.DEFAULT }}
                    >
                      <img
                        src={imagePreview}
                        alt="Vessel preview"
                        className="h-48 w-auto object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImagePreview}
                        className="absolute top-2 right-2 p-2 rounded-lg shadow-lg transition-all hover:shadow-xl"
                        style={{
                          backgroundColor: colors.error.DEFAULT,
                        }}
                        title="Remove image"
                      >
                        <X className="w-4 h-4" style={{ color: colors.text.inverse }} />
                      </button>
                    </div>
                    {isEditMode && vessel?.image && (
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="text-sm font-medium hover:underline transition-all"
                        style={{ color: colors.error.DEFAULT }}
                      >
                        Delete current image permanently
                      </button>
                    )}
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:shadow-sm"
                    style={{
                      borderColor: colors.border.DEFAULT,
                      backgroundColor: colors.accent.light,
                    }}
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <div
                        className="p-4 rounded-full mb-3"
                        style={{ backgroundColor: 'white' }}
                      >
                        <ImageIcon className="w-8 h-8" style={{ color: colors.primary.DEFAULT }} />
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                        Click to upload vessel image
                      </p>
                      <p className="text-xs" style={{ color: colors.text.secondary }}>
                        PNG, JPG, GIF up to 2MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Vessel Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Vessel Name <span style={{ color: colors.error.DEFAULT }}>*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g., Ocean Star, Pacific Explorer"
                  className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.name ? colors.error.DEFAULT : colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    if (!errors.name) {
                      e.target.style.borderColor = colors.primary.DEFAULT;
                      e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? colors.error.DEFAULT : colors.border.DEFAULT;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Two Column Layout for Type and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vessel Type */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                    Type <span style={{ color: colors.error.DEFAULT }}>*</span>
                  </label>
                  <select
                    {...register('type')}
                    className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: errors.type ? colors.error.DEFAULT : colors.border.DEFAULT,
                      color: colors.text.primary,
                    }}
                  >
                    <option value="">Select type...</option>
                    <option value="ferry">Ferry</option>
                    <option value="charter">Charter</option>
                    <option value="speedboat">Speedboat</option>
                    <option value="yacht">Yacht</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                    Capacity (passengers) <span style={{ color: colors.error.DEFAULT }}>*</span>
                  </label>
                  <input
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    placeholder="e.g., 100"
                    className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: errors.capacity ? colors.error.DEFAULT : colors.border.DEFAULT,
                      color: colors.text.primary,
                    }}
                    onFocus={(e) => {
                      if (!errors.capacity) {
                        e.target.style.borderColor = colors.primary.DEFAULT;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.capacity ? colors.error.DEFAULT : colors.border.DEFAULT;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.capacity && (
                    <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.capacity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Enter vessel description, amenities, and features..."
                  className="block w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 resize-none"
                  style={{
                    borderColor: errors.description ? colors.error.DEFAULT : colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    if (!errors.description) {
                      e.target.style.borderColor = colors.primary.DEFAULT;
                      e.target.style.boxShadow = `0 0 0 3px ${colors.accent.light}`;
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.description ? colors.error.DEFAULT : colors.border.DEFAULT;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.DEFAULT }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.description.message}
                  </p>
                )}
                <p className="mt-1.5 text-xs" style={{ color: colors.text.tertiary }}>
                  Optional: Add details about the vessel's features and amenities
                </p>
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
                  <option value="maintenance">Maintenance</option>
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
                  onClick={() => navigate('/admin/vessels')}
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
                      {isEditMode ? 'Update Vessel' : 'Create Vessel'}
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
