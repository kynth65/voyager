import type { User } from './auth';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'super_admin' | 'company_admin' | 'agent' | 'customer';
  status?: 'active' | 'inactive' | 'suspended';
  company_id?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'super_admin' | 'company_admin' | 'agent' | 'customer';
  status?: 'active' | 'inactive' | 'suspended';
  company_id?: string;
}

export interface UserListParams {
  page?: number;
  per_page?: number;
  role?: string;
  status?: string;
  company_id?: string;
  search?: string;
  trashed?: 'active' | 'archived' | 'all';
}

export interface UserListResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface UserResponse {
  message: string;
  user: User;
}

export interface AssignRoleRequest {
  role: 'super_admin' | 'company_admin' | 'agent' | 'customer';
}

export interface UserPermissionsResponse {
  role: string;
  permissions: string[];
}

export interface CheckPermissionRequest {
  permission: string;
}

export interface CheckPermissionResponse {
  permission: string;
  has_permission: boolean;
}
