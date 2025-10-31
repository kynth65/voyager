import {
  LayoutDashboard,
  Users,
  Ship,
  Route as RouteIcon,
  Calendar,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  UserCircle,
  Home,
  BookOpen,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  roles?: string[]; // If undefined, visible to all roles
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  roles?: string[]; // If undefined, visible to all roles
}

export const navigationConfig: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      {
        label: 'Overview',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
    ],
  },
  {
    label: 'Management',
    roles: ['superadmin'], // Only superadmin can manage system
    items: [
      {
        label: 'User Management',
        icon: Users,
        href: '/users',
        roles: ['superadmin'],
      },
      {
        label: 'Vessels',
        icon: Ship,
        href: '/admin/vessels',
        roles: ['superadmin'],
      },
      {
        label: 'Routes',
        icon: RouteIcon,
        href: '/admin/routes',
        roles: ['superadmin'],
      },
    ],
  },
  {
    label: 'Booking',
    roles: ['customer'],
    items: [
      {
        label: 'Browse Routes',
        icon: Home,
        href: '/browse-routes',
        roles: ['customer'],
      },
      {
        label: 'My Bookings',
        icon: BookOpen,
        href: '/my-bookings',
        roles: ['customer'],
      },
    ],
  },
  {
    label: 'Bookings',
    roles: ['superadmin', 'admin'],
    items: [
      {
        label: 'All Bookings',
        icon: Calendar,
        href: '/admin/bookings',
        roles: ['superadmin', 'admin'],
      },
      {
        label: 'Customers',
        icon: UserCircle,
        href: '/admin/customers',
        roles: ['superadmin', 'admin'],
      },
    ],
  },
  {
    label: 'Finance',
    roles: ['superadmin', 'admin'],
    items: [
      {
        label: 'Accounting',
        icon: DollarSign,
        href: '/admin/accounting',
        roles: ['superadmin', 'admin'],
      },
      {
        label: 'Payments',
        icon: CreditCard,
        href: '/admin/payments',
        roles: ['superadmin', 'admin'],
      },
      {
        label: 'Refunds',
        icon: FileText,
        href: '/admin/refunds',
        roles: ['superadmin', 'admin'],
      },
    ],
  },
  {
    label: 'Reports',
    roles: ['superadmin', 'admin'],
    items: [
      {
        label: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics',
        roles: ['superadmin', 'admin'],
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Profile',
        icon: Settings,
        href: '/profile',
      },
    ],
  },
];

/**
 * Filter navigation based on user role
 */
export function getNavigationForRole(role: string): NavGroup[] {
  return navigationConfig
    .filter((group) => !group.roles || group.roles.includes(role))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}
