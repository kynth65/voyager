import apiClient from '../lib/axios';
import type {
  Vessel,
  CreateVesselRequest,
  UpdateVesselRequest,
  VesselListParams,
  VesselListResponse,
} from '../types/vessel';

export const vesselService = {
  /**
   * Get paginated list of vessels with optional filters
   */
  async getVessels(params?: VesselListParams): Promise<VesselListResponse> {
    const response = await apiClient.get<VesselListResponse>('/vessels', { params });
    return response.data;
  },

  /**
   * Get a single vessel by ID
   */
  async getVesselById(id: number): Promise<Vessel> {
    const response = await apiClient.get<{ data: Vessel }>(`/vessels/${id}`);
    return response.data.data;
  },

  /**
   * Create a new vessel
   */
  async createVessel(data: CreateVesselRequest): Promise<Vessel> {
    const response = await apiClient.post<{ data: Vessel }>('/vessels', data);
    return response.data.data;
  },

  /**
   * Update an existing vessel
   */
  async updateVessel(id: number, data: UpdateVesselRequest): Promise<Vessel> {
    const response = await apiClient.put<{ data: Vessel }>(`/vessels/${id}`, data);
    return response.data.data;
  },

  /**
   * Soft delete a vessel
   */
  async deleteVessel(id: number): Promise<void> {
    await apiClient.delete(`/vessels/${id}`);
  },

  /**
   * Restore a soft-deleted vessel
   */
  async restoreVessel(id: number): Promise<Vessel> {
    const response = await apiClient.post<{ data: Vessel }>(`/vessels/${id}/restore`);
    return response.data.data;
  },

  /**
   * Upload vessel image
   */
  async uploadVesselImage(id: number, file: File): Promise<Vessel> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<{ data: Vessel }>(`/vessels/${id}/image`, formData);
    return response.data.data;
  },

  /**
   * Delete vessel image
   */
  async deleteVesselImage(id: number): Promise<void> {
    await apiClient.delete(`/vessels/${id}/image`);
  },

  /**
   * Check vessel availability for charter booking
   */
  async checkAvailability(id: number, startDate: string, endDate: string): Promise<VesselAvailability> {
    const response = await apiClient.get<{ data: VesselAvailability }>(
      `/vessels/${id}/availability`,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data.data;
  },
};
