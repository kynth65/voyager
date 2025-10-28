import { Vessel } from './vessel';

export interface Route {
  id: number;
  vessel_id: number;
  origin: string;
  destination: string;
  price: number;
  duration: number; // duration in minutes
  schedule: string | null; // JSON string or text describing schedule
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  vessel?: Vessel;
}

export interface CreateRouteRequest {
  vessel_id: number;
  origin: string;
  destination: string;
  price: number;
  duration: number;
  schedule?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateRouteRequest {
  vessel_id?: number;
  origin?: string;
  destination?: string;
  price?: number;
  duration?: number;
  schedule?: string;
  status?: 'active' | 'inactive';
}

export interface RouteListParams {
  page?: number;
  per_page?: number;
  vessel_id?: number;
  origin?: string;
  destination?: string;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface RouteListResponse {
  data: Route[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
