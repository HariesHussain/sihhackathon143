import React from 'react';

export type StatusType =
  | 'AVAILABLE'
  | 'MATCHED'
  | 'IN_TRANSIT'
  | 'CLAIMED_VERIFIED'
  | 'EXPIRED'
  | 'GRADE_A'
  | 'GRADE_B'
  | 'INEDIBLE'
  | 'NORMAL'
  | 'WARNING'
  | 'CRITICAL'
  | 'ACTIVE'
  | 'INACTIVE';

interface StatusPillProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let displayLabel = label || status;

  switch (normalized) {
    case 'CLAIMED_VERIFIED':
    case 'GRADE_A':
    case 'NORMAL':
    case 'ACTIVE':
    case 'REDEEMED':
      styles = 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      if (!label) {
        if (normalized === 'CLAIMED_VERIFIED') displayLabel = 'Verified Claim';
        if (normalized === 'GRADE_A') displayLabel = 'Grade A (Pristine)';
      }
      break;

    case 'AVAILABLE':
    case 'GRADE_B':
    case 'PENDING':
      styles = 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      if (!label) {
        if (normalized === 'AVAILABLE') displayLabel = 'Available Now';
        if (normalized === 'GRADE_B') displayLabel = 'Grade B (Fast Track)';
      }
      break;

    case 'MATCHED':
    case 'IN_TRANSIT':
    case 'WARNING':
    case 'REFUNDED':
      styles = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      if (!label) {
        if (normalized === 'MATCHED') displayLabel = 'Driver Assigned';
        if (normalized === 'IN_TRANSIT') displayLabel = 'En Route';
      }
      break;

    case 'EXPIRED':
    case 'INEDIBLE':
    case 'CRITICAL':
    case 'CANCELLED':
    case 'INACTIVE':
      styles = 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]';
      if (!label) {
        if (normalized === 'INEDIBLE') displayLabel = 'Bio-Compost Only';
      }
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs ${sizeClasses} ${styles} tracking-tight`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      <span>{displayLabel}</span>
    </span>
  );
};
