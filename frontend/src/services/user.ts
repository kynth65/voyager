import axios from '../lib/axios';
import type { User } from '../types/auth';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
  UserListResponse,
  UserResponse,
  AssignRoleRequest,
  UserPermissionsResponse,
  CheckPermissionRequest,
  CheckPermissionResponse,
} from '../types/user';

/**
 * Get paginated list of users with optional filters
 */
export async function getUsers(params?: UserListParams): Promise<UserListResponse> {
  const response = await axios.get<UserListResponse>('/users', { params });
  return response.data;
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<User> {
  const response = await axios.get<User>(`/users/${id}`);
  return response.data;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  const response = await axios.post<UserResponse>('/users', data);
  return response.data;
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
  const response = await axios.put<UserResponse>(`/users/${id}`, data);
  return response.data;
}

/**
 * Soft delete a user
 */
export async function deleteUser(id: string): Promise<{ message: string }> {
  const response = await axios.delete<{ message: string }>(`/users/${id}`);
  return response.data;
}

/**
 * Restore a soft-deleted user
 */
export async function restoreUser(id: string): Promise<UserResponse> {
  const response = await axios.post<UserResponse>(`/users/${id}/restore`);
  return response.data;
}

/**
 * Permanently delete a user (force delete)
 */
export async function forceDeleteUser(
  id: string,
  confirmation: string
): Promise<{ message: string }> {
  const response = await axios.delete<{ message: string }>(`/users/${id}/force`, {
    data: { confirmation },
  });
  return response.data;
}

/**
 * Assign a role to a user
 */
export async function assignRole(id: string, data: AssignRoleRequest): Promise<UserResponse> {
  const response = await axios.post<UserResponse>(`/users/${id}/assign-role`, data);
  return response.data;
}

/**
 * Get user's permissions
 */
export async function getUserPermissions(id: string): Promise<UserPermissionsResponse> {
  const response = await axios.get<UserPermissionsResponse>(`/users/${id}/permissions`);
  return response.data;
}

/**
 * Check if user has a specific permission
 */
export async function checkUserPermission(
  id: string,
  data: CheckPermissionRequest
): Promise<CheckPermissionResponse> {
  const response = await axios.post<CheckPermissionResponse>(
    `/users/${id}/check-permission`,
    data
  );
  return response.data;
}
