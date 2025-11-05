/**
 * Voyager Design System - Color Palette
 *
 * Minimalist, professional color scheme for the boat booking system.
 * All colors are carefully selected for accessibility (WCAG AA compliance).
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    DEFAULT: '#272343',      // Main brand color - Dark navy
    light: '#3d3a5c',        // Lighter shade for hover states
    dark: '#1a1829',         // Darker shade for active states
  },

  // Accent Colors (Mint/Cyan)
  accent: {
    DEFAULT: '#bae8e8',      // Primary accent - Light cyan
    light: '#e3f6f5',        // Subtle backgrounds
    dark: '#8fd3d3',         // Darker accent for emphasis
  },

  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors
  success: {
    DEFAULT: '#10b981',      // Green
    light: '#d1fae5',
    dark: '#059669',
  },

  warning: {
    DEFAULT: '#f59e0b',      // Amber
    light: '#fef3c7',
    dark: '#d97706',
  },

  error: {
    DEFAULT: '#ef4444',      // Red
    light: '#fee2e2',
    dark: '#dc2626',
  },

  info: {
    DEFAULT: '#3b82f6',      // Blue
    light: '#dbeafe',
    dark: '#2563eb',
  },

  // Background Colors
  background: {
    DEFAULT: '#f9fafb',      // Main background
    subtle: '#ffffff',       // Card backgrounds
    overlay: 'rgba(39, 35, 67, 0.5)', // Modal overlays
  },

  // Text Colors
  text: {
    primary: '#272343',      // Main text
    secondary: 'rgba(39, 35, 67, 0.7)',  // Secondary text
    tertiary: 'rgba(39, 35, 67, 0.5)',   // Tertiary/placeholder text
    inverse: '#ffffff',      // Text on dark backgrounds
  },

  // Border Colors
  border: {
    DEFAULT: '#e3f6f5',      // Subtle borders
    focus: '#272343',        // Focus state borders
    light: '#f5f5f5',        // Very subtle borders
  },

  // Role-Based Colors (for badges and status indicators)
  roles: {
    superadmin: {
      bg: '#f3e8ff',
      text: '#6b21a8',
      border: '#e9d5ff',
    },
    admin: {
      bg: '#e3f6f5',
      text: '#272343',
      border: '#bae8e8',
    },
    customer: {
      bg: '#f5f5f5',
      text: '#272343',
      border: '#e5e5e5',
    },
  },

  // Booking Status Colors
  status: {
    pending: {
      bg: '#fef3c7',
      text: '#92400e',
      border: '#fde68a',
    },
    confirmed: {
      bg: '#d1fae5',
      text: '#065f46',
      border: '#a7f3d0',
    },
    cancelled: {
      bg: '#fee2e2',
      text: '#991b1b',
      border: '#fecaca',
    },
    completed: {
      bg: '#e0e7ff',
      text: '#3730a3',
      border: '#c7d2fe',
    },
  },
} as const;

/**
 * Helper function to get rgba color with custom opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Gradient backgrounds
 */
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.DEFAULT} 0%, ${colors.primary.light} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accent.light} 0%, ${colors.accent.DEFAULT} 100%)`,
  subtle: `radial-gradient(at 100% 0%, ${colors.accent.light} 0%, transparent 50%), radial-gradient(at 0% 100%, ${colors.neutral[100]} 0%, transparent 50%)`,
} as const;

/**
 * Box shadows
 */
export const shadows = {
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  primary: '0 4px 6px -1px rgba(39, 35, 67, 0.2)',
  primaryHover: '0 10px 15px -3px rgba(39, 35, 67, 0.3)',
} as const;

export default colors;
