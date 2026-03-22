'use client';

import React from 'react';
import { AlertTriangle, FileText, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { invoiceStatus } from '@/styles/botanical';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  dueDate?: Date | string;
  issuedAt?: Date | string;
  size?: BadgeSize;
  showSubtext?: boolean;
  showIcon?: boolean;
  className?: string;
}

function getDaysDiff(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isOverdue(dueDate: Date | string): boolean {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return d < new Date();
}

const statusConfig: Record<InvoiceStatus | 'overdue', {
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
}> = {
  draft: {
    icon: FileText,
    ...invoiceStatus.draft,
  },
  issued: {
    icon: Send,
    ...invoiceStatus.issued,
  },
  paid: {
    icon: CheckCircle,
    ...invoiceStatus.paid,
  },
  cancelled: {
    icon: XCircle,
    ...invoiceStatus.overdue,
  },
  overdue: {
    icon: AlertTriangle,
    ...invoiceStatus.overdue,
  },
};

const sizeConfig: Record<BadgeSize, { fontSize: string; padding: string; iconSize: number }> = {
  sm: { fontSize: '0.65rem', padding: '2px 8px', iconSize: 10 },
  md: { fontSize: '0.72rem', padding: '3px 10px', iconSize: 12 },
  lg: { fontSize: 'var(--font-size-meta)', padding: '4px 12px', iconSize: 14 },
};

export function InvoiceStatusBadge({
  status,
  dueDate,
  issuedAt,
  size = 'md',
  showSubtext = false,
  showIcon = true,
  className,
}: InvoiceStatusBadgeProps) {
  const overdue = status === 'issued' && dueDate && isOverdue(dueDate);
  const config = overdue ? statusConfig.overdue : statusConfig[status];
  const sizeStyles = sizeConfig[size];
  
  const Icon = config.icon;
  
  let subtext = '';
  if (showSubtext) {
    if (overdue && dueDate) {
      const days = getDaysDiff(dueDate);
      subtext = `${days} day${days !== 1 ? 's' : ''} overdue`;
    } else if (status === 'issued' && issuedAt) {
      const days = getDaysDiff(issuedAt);
      subtext = days === 0 ? 'Sent today' : `Sent ${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (status === 'draft') {
      subtext = 'Ready to issue';
    } else if (status === 'paid') {
      subtext = 'Payment received';
    }
  }

  const displayStatus = overdue ? 'overdue' : status;

  return (
    <span
      className={cn('inline-flex items-center gap-1 font-semibold capitalize border rounded-full', className)}
      style={{
        fontSize: sizeStyles.fontSize,
        padding: sizeStyles.padding,
        background: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {showIcon && <Icon size={sizeStyles.iconSize} />}
      {displayStatus}
      {showSubtext && subtext && (
        <span style={{ fontWeight: 400, opacity: 0.8, marginLeft: 2 }}>
          · {subtext}
        </span>
      )}
    </span>
  );
}

interface InvoiceStatusBadgeCompactProps {
  status: InvoiceStatus;
  dueDate?: Date | string;
  daysOverdue?: number;
  className?: string;
}

export function InvoiceStatusBadgeCompact({
  status,
  dueDate,
  daysOverdue,
  className,
}: InvoiceStatusBadgeCompactProps) {
  const overdue = status === 'issued' && dueDate && isOverdue(dueDate);
  const config = overdue ? statusConfig.overdue : statusConfig[status];
  const Icon = config.icon;
  
  const displayText = overdue && daysOverdue 
    ? `${daysOverdue}d` 
    : status === 'draft' ? 'DFT'
    : status === 'issued' ? 'SNT'
    : status === 'paid' ? 'PAID'
    : status;

  return (
    <span
      className={cn('inline-flex items-center gap-0.5 font-semibold uppercase border rounded-full', className)}
      style={{
        fontSize: '0.6rem',
        padding: '2px 6px',
        background: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <Icon size={9} />
      {displayText}
    </span>
  );
}

export default InvoiceStatusBadge;
