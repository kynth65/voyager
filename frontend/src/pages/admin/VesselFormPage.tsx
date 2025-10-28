import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vesselService } from '../../services/vessel';
import Layout from '../../components/layout/Layout';

const vesselSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.string().min(1, 'Type is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VesselFormData>({
    resolver: zodResolver(vesselSchema),
    defaultValues: {
      status: 'active',
    },
  });

  // Fetch vessel data if editing
  const { data: vessel, isLoading } = useQuery({
    queryKey: ['vessel', id],
    queryFn: () => vesselService.getVesselById(Number(id)),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (vessel) {
      setValue('name', vessel.name);
      setValue('type', vessel.type);
      setValue('capacity', vessel.capacity);
      setValue('description', vessel.description || '');
      setValue('status', vessel.status);
      if (vessel.image) {
        setImagePreview(vessel.image);
      }
    }
  }, [vessel, setValue]);

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

  const onSubmit = (data: VesselFormData) => {
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

  if (isEditMode && isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vessel data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Vessel' : 'Add New Vessel'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEditMode
              ? 'Update vessel information and settings'
              : 'Create a new vessel for ferry or charter bookings'}
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
          {/* Vessel Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Image</label>
            {imagePreview && (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg"
                />
                {isEditMode && vessel?.image && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="mt-2 text-sm text-red-600 hover:text-red-900"
                  >
                    Delete Image
                  </button>
                )}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF up to 2MB</p>
          </div>

          {/* Vessel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vessel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Ocean Star"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Vessel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type...</option>
              <option value="Ferry">Ferry</option>
              <option value="Yacht">Yacht</option>
              <option value="Speedboat">Speedboat</option>
              <option value="Catamaran">Catamaran</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (passengers) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter vessel description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
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
              <option value="maintenance">Maintenance</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/vessels')}
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
                ? 'Update Vessel'
                : 'Create Vessel'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
