import apiClient from '../lib/axios';
import type {
  Route,
  CreateRouteRequest,
  UpdateRouteRequest,
  RouteListParams,
  RouteListResponse,
} from '../types/route';

export const routeService = {
  /**
   * Get paginated list of routes with optional filters
   */
  async getRoutes(params?: RouteListParams): Promise<RouteListResponse> {
    const response = await apiClient.get<RouteListResponse>('/routes', { params });
    return response.data;
  },

  /**
   * Get a single route by ID
   */
  async getRouteById(id: number): Promise<Route> {
    const response = await apiClient.get<{ data: Route }>(`/routes/${id}`);
    return response.data.data;
  },

  /**
   * Create a new route
   */
  async createRoute(data: CreateRouteRequest): Promise<Route> {
    const response = await apiClient.post<{ data: Route }>('/routes', data);
    return response.data.data;
  },

  /**
   * Update an existing route
   */
  async updateRoute(id: number, data: UpdateRouteRequest): Promise<Route> {
    const response = await apiClient.put<{ data: Route }>(`/routes/${id}`, data);
    return response.data.data;
  },

  /**
   * Soft delete a route
   */
  async deleteRoute(id: number): Promise<void> {
    await apiClient.delete(`/routes/${id}`);
  },

  /**
   * Restore a soft-deleted route
   */
  async restoreRoute(id: number): Promise<Route> {
    const response = await apiClient.post<{ data: Route }>(`/routes/${id}/restore`);
    return response.data.data;
  },
};
