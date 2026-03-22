"use client"

import React from 'react';
import { radii, colors } from '@/styles/botanical';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'draft' | 'issued' | 'paid' | 'overdue';
  children?: React.ReactNode;
}

export function Badge({ status, children, style, className, ...props }: BadgeProps) {
  const { appointmentStatus, invoiceStatus } = useThemeColors()

  const getStyle = (): React.CSSProperties => {
    switch (status) {
      case 'pending':
      case 'draft':
        return {
          fontSize: '0.65rem',
          fontWeight: 600,
          padding: '1px 8px',
          borderRadius: radii.badge,
          background: appointmentStatus.pending.bg,
          color: appointmentStatus.pending.text,
          textTransform: 'capitalize',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        };
      case 'confirmed':
      case 'issued':
        return {
          fontSize: '0.65rem',
          fontWeight: 600,
          padding: '1px 8px',
          borderRadius: radii.badge,
          background: appointmentStatus.confirmed.bg,
          color: appointmentStatus.confirmed.text,
          textTransform: 'capitalize',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        };
      case 'completed':
      case 'paid':
        return {
          fontSize: '0.65rem',
          fontWeight: 600,
          padding: '1px 8px',
          borderRadius: radii.badge,
          background: appointmentStatus.completed.bg,
          color: appointmentStatus.completed.text,
          textTransform: 'capitalize',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        };
      case 'cancelled':
        return {
          fontSize: '0.65rem',
          fontWeight: 600,
          padding: '1px 8px',
          borderRadius: radii.badge,
          background: appointmentStatus.cancelled.bg,
          color: appointmentStatus.cancelled.text,
          textTransform: 'capitalize',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        };
      case 'overdue':
        return {
          fontSize: '0.65rem',
          fontWeight: 600,
          padding: '1px 8px',
          borderRadius: radii.badge,
          background: invoiceStatus.overdue.bg,
          color: invoiceStatus.overdue.text,
          textTransform: 'capitalize',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        };
      default:
        return {
          fontSize: '0.65rem',
          fontWeight: 600,
          padding: '1px 8px',
          borderRadius: radii.badge,
          background: colors.primaryBase,
          color: '#fff',
          textTransform: 'capitalize',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        };
    }
  };

  return (
    <span style={getStyle()} className={cn(className)} {...props}>
      {children || status}
    </span>
  );
}