import type { LucideIcon } from 'lucide-react';
import { colors } from '../../styles/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string | number;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
}

const colorVariants = {
  primary: {
    bgColor: colors.accent.light,
    iconColor: colors.primary.DEFAULT,
    trendColor: colors.text.secondary,
  },
  success: {
    bgColor: colors.success.light,
    iconColor: colors.success.DEFAULT,
    trendColor: colors.text.secondary,
  },
  warning: {
    bgColor: colors.warning.light,
    iconColor: colors.warning.DEFAULT,
    trendColor: colors.text.secondary,
  },
  info: {
    bgColor: colors.info.light,
    iconColor: colors.info.DEFAULT,
    trendColor: colors.text.secondary,
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
}: StatCardProps) {
  const colorConfig = colorVariants[color];

  return (
    <div
      className="bg-white rounded-xl border hover:shadow-md transition-all duration-200 p-6"
      style={{ borderColor: colors.border.DEFAULT }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            {label}
          </p>
          <p
            className="text-3xl font-semibold mb-3"
            style={{ color: colors.text.primary }}
          >
            {value}
          </p>
          {trend !== undefined && trendLabel && (
            <div className="flex items-center text-sm">
              <span style={{ color: colorConfig.trendColor }}>
                {trend} <span className="opacity-70">{trendLabel}</span>
              </span>
            </div>
          )}
        </div>
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: colorConfig.bgColor }}
        >
          <Icon
            className="w-6 h-6"
            style={{ color: colorConfig.iconColor }}
          />
        </div>
      </div>
    </div>
  );
}
