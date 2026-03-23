'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, FileText, Send, CheckCircle, XCircle } from 'lucide-react';
import { invoiceStatus } from '@/styles/botanical';
import { StatusBadge, type StatusConfig } from '@/components/ui/status-badge';

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

const sizeToStatusBadgeSize = { sm: 'sm' as const, md: 'md' as const, lg: 'lg' as const };
const iconSizes = { sm: 10, md: 12, lg: 14 } as const;

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
  const Icon = config.icon;
  const badgeSize = sizeToStatusBadgeSize[size];

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
  const animationKey = `${status}-${overdue ? 'overdue' : 'current'}`;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={animationKey}
        className="inline-flex"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.15 }}
      >
        <StatusBadge
          label={displayStatus}
          config={config satisfies StatusConfig}
          icon={showIcon ? <Icon size={iconSizes[size]} /> : undefined}
          size={badgeSize}
          suffix={showSubtext && subtext ? `· ${subtext}` : undefined}
          className={className}
        />
      </motion.span>
    </AnimatePresence>
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

  const displayText =
    overdue && daysOverdue
      ? `${daysOverdue}d`
      : status === 'draft'
        ? 'DFT'
        : status === 'issued'
          ? 'SNT'
          : status === 'paid'
            ? 'PAID'
            : status;

  const compactKey = `${status}-${overdue ? 'od' : 'ok'}-${displayText}`;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={compactKey}
        className="inline-flex"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.15 }}
      >
        <StatusBadge
          label={displayText}
          config={config satisfies StatusConfig}
          icon={<Icon size={9} />}
          size="xs"
          className={`uppercase gap-0.5 ${className ?? ''}`}
        />
      </motion.span>
    </AnimatePresence>
  );
}

export default InvoiceStatusBadge;
