'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Send, CheckCircle2, DollarSign, Ban, FileEdit } from 'lucide-react';
import { colors, typography } from '@/styles/botanical';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const emptyStateEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center empty-state',
        className,
      )}
      style={{ minHeight: '200px' }}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: emptyStateEase }}
    >
      {icon && (
        <motion.div
          className="mb-4"
          style={{
            fontSize: '3rem',
            color: colors.muted,
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          {icon}
        </motion.div>
      )}
      <h3
        className="mb-2"
        style={{
          fontSize: typography.sizes.cardTitle,
          fontWeight: typography.weights.heading,
          fontFamily: typography.heading,
          color: colors.heading,
        }}
      >
        {title}
      </h3>
      <p
        className="mb-6 max-w-md"
        style={{
          fontSize: typography.sizes.body,
          fontWeight: typography.weights.body,
          color: colors.secondary,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

export function EmptyClients({ onAddClient }: { onAddClient?: () => void }) {
  return (
    <EmptyState
      icon={<Users size={48} />}
      title="No clients yet"
      description="Add your first client to start scheduling sessions and managing invoices."
      actionLabel="Add Client"
      onAction={onAddClient}
    />
  );
}

export function EmptyInvoices({
  statusFilter,
}: {
  statusFilter?: 'all' | 'draft' | 'issued' | 'overdue' | 'paid' | 'cancelled';
}) {
  const getInvoiceEmptyState = () => {
    switch (statusFilter) {
      case 'draft':
        return {
          title: 'No draft invoices',
          description: "Generated invoices that haven't been issued will appear here.",
          icon: <FileEdit size={48} />,
        };
      case 'issued':
        return {
          title: 'No issued invoices',
          description: 'Draft invoices can be issued to send them to clients.',
          icon: <Send size={48} />,
        };
      case 'overdue':
        return {
          title: 'No overdue invoices',
          description: 'Great! All issued invoices are up to date.',
          icon: <CheckCircle2 size={48} />,
        };
      case 'paid':
        return {
          title: 'No paid invoices yet',
          description: 'Paid invoices will appear here once clients settle their accounts.',
          icon: <DollarSign size={48} />,
        };
      case 'cancelled':
        return {
          title: 'No cancelled invoices',
          description: 'Cancelled invoices will appear here.',
          icon: <Ban size={48} />,
        };
      default:
        return {
          title: 'No invoices generated',
          description:
            'Complete sessions to create invoices, or check back after completing appointments.',
          icon: <FileText size={48} />,
        };
    }
  };

  const { title, description, icon } = getInvoiceEmptyState();

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
    />
  );
}
