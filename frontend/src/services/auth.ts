import apiClient from '../lib/axios';
import type { LoginRequest, RegisterRequest, AuthResponse, LogoutResponse, User } from '../types/auth';

export const authService = {
  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/register', data);
    return response.data;
  },

  /**
   * Login user and get auth token
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/login', data);
    return response.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/logout');
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ user: User }> {
    const response = await apiClient.get<{ user: User }>('/user');
    return response.data;
  },
};
