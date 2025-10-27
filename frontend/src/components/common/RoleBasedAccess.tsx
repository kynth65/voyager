import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedAccessProps {
  children: ReactNode;
  roles?: string | string[];
  permission?: string;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user role or permission
 *
 * Usage examples:
 *
 * // Render only for super_admin
 * <RoleBasedAccess roles="super_admin">
 *   <button>Admin Only Button</button>
 * </RoleBasedAccess>
 *
 * // Render for multiple roles
 * <RoleBasedAccess roles={["super_admin", "company_admin"]}>
 *   <button>Admin Button</button>
 * </RoleBasedAccess>
 *
 * // Render based on permission
 * <RoleBasedAccess permission="create_bookings">
 *   <button>Create Booking</button>
 * </RoleBasedAccess>
 *
 * // With fallback content
 * <RoleBasedAccess roles="super_admin" fallback={<div>Access Denied</div>}>
 *   <button>Admin Only Button</button>
 * </RoleBasedAccess>
 */
export default function RoleBasedAccess({
  children,
  roles,
  permission,
  fallback = null
}: RoleBasedAccessProps) {
  const { hasRole, hasPermission } = useAuth();

  // Check role-based access
  if (roles) {
    if (!hasRole(roles)) {
      return <>{fallback}</>;
    }
  }

  // Check permission-based access
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
