export interface User {
  id: string;
  name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'superadmin' | 'admin' | 'agent' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string | null;
  avatar_url?: string | null;
  company_id?: string | null;
  preferences?: Record<string, unknown> | null;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LogoutResponse {
  message: string;
}
