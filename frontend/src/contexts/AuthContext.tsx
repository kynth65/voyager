import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  // Role-based helper methods
  hasRole: (roles: string | string[]) => boolean;
  isSuperAdmin: () => boolean;
  isCompanyAdmin: () => boolean;
  isAgent: () => boolean;
  isCustomer: () => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const { user: currentUser } = await authService.getCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  };

  const refetchUser = async () => {
    if (token) {
      try {
        const { user: currentUser } = await authService.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        console.error('Failed to refetch user:', error);
      }
    }
  };

  // Role-based helper methods
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'super_admin';
  };

  const isCompanyAdmin = (): boolean => {
    return user?.role === 'company_admin';
  };

  const isAgent = (): boolean => {
    return user?.role === 'agent';
  };

  const isCustomer = (): boolean => {
    return user?.role === 'customer';
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Define permissions for each role (matches backend)
    const permissions: Record<string, string[]> = {
      super_admin: ['*'], // Super admin has all permissions
      company_admin: [
        'manage_company_users',
        'manage_company_bookings',
        'manage_company_customers',
        'view_company_reports',
        'manage_company_payments',
        'manage_company_invoices',
        'manage_company_documents',
      ],
      agent: [
        'create_bookings',
        'view_own_bookings',
        'update_own_bookings',
        'manage_customers',
        'create_payments',
        'view_own_payments',
        'generate_invoices',
        'upload_documents',
        'view_suppliers',
        'view_products',
      ],
      customer: [
        'view_own_bookings',
        'view_own_payments',
        'view_own_invoices',
        'view_own_documents',
        'update_own_profile',
      ],
    };

    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return true;
    }

    return permissions[user.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refetchUser,
        hasRole,
        isSuperAdmin,
        isCompanyAdmin,
        isAgent,
        isCustomer,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
