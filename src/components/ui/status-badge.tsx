'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusConfig {
  bg: string;
  text: string;
  border: string;
}

export interface StatusBadgeProps {
  label: string;
  config: StatusConfig;
  icon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Optional suffix rendered after label (e.g. subtext like "· Sent 3 days ago") */
  suffix?: React.ReactNode;
  className?: string;
}

const sizeStyles = {
  xs: { fontSize: '0.6rem', padding: '2px 6px', iconSize: 9 },
  sm: { fontSize: '0.65rem', padding: '2px 8px', iconSize: 10 },
  md: { fontSize: '0.72rem', padding: '3px 10px', iconSize: 12 },
  lg: { fontSize: 'var(--font-size-meta)', padding: '4px 12px', iconSize: 14 },
};

export function StatusBadge({ label, config, icon, size = 'md', suffix, className }: StatusBadgeProps) {
  const s = sizeStyles[size];
  return (
    <span
      className={cn('inline-flex items-center gap-1 font-semibold capitalize border rounded-full', className)}
      style={{
        fontSize: s.fontSize,
        padding: s.padding,
        background: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {icon}
      {label}
      {suffix != null && (
        <span style={{ fontWeight: 400, opacity: 0.8, marginLeft: 2 }}>{suffix}</span>
      )}
    </span>
  );
}
