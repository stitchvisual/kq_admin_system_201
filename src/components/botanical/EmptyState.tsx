import React from 'react';
import { Users, Calendar, Search, FileText, Send, CheckCircle2, DollarSign, Ban, PlusCircle, BarChart3, Sparkles, FileEdit, CalendarPlus } from 'lucide-react';
import { colors, typography } from '@/styles/botanical';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export type EmptyStateVariant =
  | 'no-data' // Generic empty list/table
  | 'no-results' // Search returned nothing
  | 'not-found' // 404/error state
  | 'get-started'; // First-time user guidance

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  iconClassName?: string;
}

/**
 * Empty state component for displaying helpful messages when no data exists
 * Includes gentle animations and optional call-to-action button
 */
export function EmptyState({
  variant = 'no-data',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconClassName,
}: EmptyStateProps) {
  // Default content based on variant
  const defaultContent = {
    'no-data': {
      title: title || 'No data to display',
      description: description || 'There are no items to show at the moment.',
    },
    'no-results': {
      title: title || 'No results found',
      description: description || 'Try adjusting your search or filter criteria.',
    },
    'not-found': {
      title: title || 'Item not found',
      description: description || 'The requested item could not be found.',
    },
    'get-started': {
      title: title || 'Get started',
      description: description || 'Begin by adding your first item.',
    },
  };

  const content = defaultContent[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center empty-state',
        className,
      )}
      style={{
        minHeight: '300px',
        animation: 'fadeIn 500ms ease',
      }}
    >
      {/* Icon with gentle float animation */}
      {icon && (
        <div
          className={cn('mb-4', iconClassName)}
          style={{
            fontSize: '3rem',
            color: colors.muted,
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h3
        className="mb-2"
        style={{
          fontSize: typography.sizes.cardTitle,
          fontWeight: typography.weights.heading,
          fontFamily: typography.heading,
          color: colors.heading,
        }}
      >
        {content.title}
      </h3>

      {/* Description */}
      <p
        className="mb-6 max-w-md"
        style={{
          fontSize: typography.sizes.body,
          fontWeight: typography.weights.body,
          color: colors.secondary,
          lineHeight: 1.6,
        }}
      >
        {content.description}
      </p>

      {/* Action button (optional) */}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          style={{
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Empty state for empty client list
 */
export function EmptyClients({ onAddClient }: { onAddClient?: () => void }) {
  return (
    <EmptyState
      variant="get-started"
      icon={<Users size={48} />}
      title="No clients yet"
      description="Add your first client to start scheduling sessions and managing invoices."
      actionLabel="Add Client"
      onAction={onAddClient}
    />
  );
}

/**
 * Empty state for empty appointments
 */
export function EmptyAppointments({ onBookSession }: { onBookSession?: () => void }) {
  return (
    <EmptyState
      variant="no-data"
      icon={<CalendarPlus size={48} />}
      title="No sessions this week"
      description="Click any time slot in the calendar to book a new appointment."
      actionLabel={onBookSession ? 'Book Session' : undefined}
      onAction={onBookSession}
    />
  );
}

/**
 * Empty state for no search results in appointments
 */
export function NoAppointmentResults() {
  return (
    <EmptyState
      variant="no-results"
      icon={<Search size={48} />}
      title="No appointments found"
      description="Try adjusting the date range or clearing search filters."
    />
  );
}

/**
 * Empty state for empty invoice list
 */
export function EmptyInvoices({
  statusFilter,
  onViewSchedule,
}: {
  statusFilter?: 'all' | 'draft' | 'issued' | 'overdue' | 'paid' | 'cancelled';
  onViewSchedule?: () => void;
}) {
  // Customize message based on filter
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
      variant="no-data"
      icon={icon}
      title={title}
      description={description}
      actionLabel={statusFilter === 'all' && onViewSchedule ? 'View Schedule' : undefined}
      onAction={statusFilter === 'all' ? onViewSchedule : undefined}
    />
  );
}

/**
 * Empty state for empty invoice generation view
 */
export function EmptyInvoiceGenerate() {
  return (
    <EmptyState
      variant="no-data"
      icon={<FileEdit size={48} />}
      title="No sessions ready for invoicing"
      description="Mark sessions as complete first, then they'll appear here for invoice generation."
    />
  );
}

/**
 * Empty state for empty dashboard
 */
export function EmptyDashboard({ onBookSession }: { onBookSession?: () => void }) {
  return (
    <EmptyState
      variant="get-started"
      icon={<BarChart3 size={48} />}
      title="Your dashboard is ready"
      description="Schedule your first session to see activity and generate invoices."
      actionLabel={onBookSession ? 'Book Session' : undefined}
      onAction={onBookSession}
    />
  );
}

/**
 * Empty state for 404 / not found
 */
export function NotFound() {
  return (
    <EmptyState
      variant="not-found"
      icon={<Sparkles size={48} />}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
    />
  );
}
