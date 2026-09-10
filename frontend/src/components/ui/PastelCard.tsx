import React from 'react';
import { LucideIcon } from 'lucide-react';

export type PastelCardVariant = 'peach' | 'sky' | 'sunlight' | 'rose' | 'mint';

interface PastelCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: PastelCardVariant;
  subtitle?: string;
  badge?: string;
  badgePositive?: boolean;
}

const VARIANT_STYLES: Record<
  PastelCardVariant,
  {
    bg: string;
    iconBg: string;
    iconColor: string;
    border: string;
  }
> = {
  peach: {
    bg: 'bg-[#FFEADB]',
    iconBg: 'bg-[#FF9F45]',
    iconColor: 'text-white',
    border: 'border-[#FFDEC4]',
  },
  sky: {
    bg: 'bg-[#E1F1FD]',
    iconBg: 'bg-[#38BDF8]',
    iconColor: 'text-white',
    border: 'border-[#CEE7FC]',
  },
  sunlight: {
    bg: 'bg-[#FEF6D8]',
    iconBg: 'bg-[#FACC15]',
    iconColor: 'text-white',
    border: 'border-[#FDF0BE]',
  },
  rose: {
    bg: 'bg-[#FEE4E8]',
    iconBg: 'bg-[#FB7185]',
    iconColor: 'text-white',
    border: 'border-[#FCD3DC]',
  },
  mint: {
    bg: 'bg-[#E1F7E8]',
    iconBg: 'bg-[#4ADE80]',
    iconColor: 'text-white',
    border: 'border-[#C8F2D4]',
  },
};

export const PastelCard: React.FC<PastelCardProps> = ({
  title,
  value,
  icon: Icon,
  variant,
  subtitle,
  badge,
  badgePositive = true,
}) => {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`p-5 rounded-3xl ${styles.bg} border ${styles.border} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group`}
    >
      {/* Top Row: Icon Circle + Badge */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-2xl ${styles.iconBg} ${styles.iconColor} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {badge && (
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              badgePositive
                ? 'bg-white/80 text-emerald-700 border border-emerald-200'
                : 'bg-white/80 text-rose-700 border border-rose-200'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Metric Label & Large Bold Number */}
      <div>
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-[#64748B] mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
