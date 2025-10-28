import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  UserCircle,
  Briefcase,
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
    roles: ['super_admin', 'company_admin'], // Only admins see this group
    items: [
      {
        label: 'Users',
        icon: Users,
        href: '/users',
        roles: ['super_admin', 'company_admin'],
      },
      {
        label: 'Companies',
        icon: Building2,
        href: '/companies',
        roles: ['super_admin'],
      },
      {
        label: 'Suppliers',
        icon: Briefcase,
        href: '/suppliers',
        roles: ['super_admin', 'company_admin'],
      },
    ],
  },
  {
    label: 'Operations',
    roles: ['super_admin', 'company_admin', 'agent'],
    items: [
      {
        label: 'Bookings',
        icon: Calendar,
        href: '/bookings',
        roles: ['super_admin', 'company_admin', 'agent'],
      },
      {
        label: 'Customers',
        icon: UserCircle,
        href: '/customers',
        roles: ['super_admin', 'company_admin', 'agent'],
      },
      {
        label: 'Products',
        icon: Package,
        href: '/products',
        roles: ['super_admin', 'company_admin'],
      },
    ],
  },
  {
    label: 'Finance',
    roles: ['super_admin', 'company_admin', 'agent'],
    items: [
      {
        label: 'Payments',
        icon: CreditCard,
        href: '/payments',
        roles: ['super_admin', 'company_admin', 'agent'],
      },
      {
        label: 'Invoices',
        icon: FileText,
        href: '/invoices',
        roles: ['super_admin', 'company_admin'],
      },
    ],
  },
  {
    label: 'Communication',
    roles: ['super_admin', 'company_admin', 'agent'],
    items: [
      {
        label: 'Messages',
        icon: MessageSquare,
        href: '/messages',
        roles: ['super_admin', 'company_admin', 'agent'],
      },
    ],
  },
  {
    label: 'Reports',
    roles: ['super_admin', 'company_admin'],
    items: [
      {
        label: 'Analytics',
        icon: BarChart3,
        href: '/analytics',
        roles: ['super_admin', 'company_admin'],
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
