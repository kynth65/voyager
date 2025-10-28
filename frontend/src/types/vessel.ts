export type VesselType = 'ferry' | 'charter' | 'speedboat' | 'yacht';
export type VesselStatus = 'active' | 'inactive' | 'maintenance';

export interface Vessel {
  id: number;
  name: string;
  type: VesselType;
  capacity: number;
  description: string | null;
  image: string | null;
  image_url: string | null;
  status: VesselStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateVesselRequest {
  name: string;
  type: VesselType;
  capacity: number;
  description?: string;
  status?: VesselStatus;
}

export interface UpdateVesselRequest {
  name?: string;
  type?: VesselType;
  capacity?: number;
  description?: string;
  status?: VesselStatus;
}

export interface VesselListParams {
  page?: number;
  per_page?: number;
  type?: VesselType;
  status?: VesselStatus;
  search?: string;
}

export interface VesselListResponse {
  data: Vessel[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface VesselCapacityCheck {
  vessel_id: number;
  route_id: number;
  date: string;
  time: string;
  requested_passengers: number;
  available_capacity: number;
  is_available: boolean;
}
