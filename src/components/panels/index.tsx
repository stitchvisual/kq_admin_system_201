'use client';

import React from 'react';
import { X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Panel Header ─────────────────────────────────────────────────────── */

interface PanelHeaderProps {
  breadcrumb: string;          // e.g. "Invoices" or "Clients"
  title: string;               // e.g. "Invoice details"
  /** Tailwind bg class for the 3px top bar (ignored when showAccentBar is false) */
  accentClass?: string;
  titleColorClass?: string;    // Override for destructive panels
  /** When false, render header row only (use a separate accent bar above, e.g. invoice panel) */
  showAccentBar?: boolean;
  onClose: () => void;
  /** Optional collapse toggle (desktop only). Renders ChevronLeft/Right before title. */
  onToggle?: () => void;
  collapsed?: boolean;
}

export function PanelHeader({
  breadcrumb,
  title,
  accentClass,
  titleColorClass = 'text-foreground',
  showAccentBar = true,
  onClose,
  onToggle,
  collapsed,
}: PanelHeaderProps) {
  return (
    <>
      {showAccentBar && accentClass && (
        <div className={cn('h-[3px] w-full flex-shrink-0', accentClass)} />
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-primary flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="hidden md:flex w-7 h-7 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] flex-shrink-0 items-center justify-center text-[hsl(145_15%_35%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground transition-colors duration-150 transition-transform duration-100 active:scale-95"
              title={collapsed ? 'Expand panel' : 'Collapse panel'}
              aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
              {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground mb-0.5">
              {breadcrumb}
            </p>
            <h2 className={cn('font-heading text-[15px] font-semibold leading-tight m-0', titleColorClass)}>
              {title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className={cn(
            'w-7 h-7 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] flex-shrink-0',
            'flex items-center justify-center text-[hsl(145_15%_35%)]',
            'hover:bg-[hsl(42_26%_87%)] hover:text-foreground',
            'transition-colors duration-150 transition-transform duration-100',
            'active:scale-95'
          )}
        >
          <X size={14} />
        </button>
      </div>
    </>
  );
}

/* ─── Mobile drag handle ────────────────────────────────────────────────── */

export function SheetHandle({ className }: { className?: string }) {
  return (
    <div className={cn('md:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0', className)}>
      <div className="w-9 h-1 rounded-full bg-[var(--sheet-handle-color)]" />
    </div>
  );
}

/* ─── Scrollable panel content ───────────────────────────────────────────── */

export function PanelContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto p-5 min-w-0">
      {children}
    </div>
  );
}

/* ─── Section label ─────────────────────────────────────────────────────── */

export { SectionLabel } from '@/components/shared/SectionLabel';

/* ─── Meta row (label + value, for divide-y sections) ─────────────────────── */

export function MetaRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center py-[5px]">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className={cn('text-[12px] font-medium text-foreground', valueClassName)}>{value}</span>
    </div>
  );
}

/* ─── Divider row ───────────────────────────────────────────────────────── */

export function PanelDivider() {
  return <div className="h-px bg-primary/60 my-1" />;
}

/* ─── Action footer ─────────────────────────────────────────────────────── */

export function PanelFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-4 pb-5 border-t border-primary bg-soft-cream/60 flex-shrink-0">
      {children}
    </div>
  );
}

/* ─── Primary action button ─────────────────────────────────────────────── */

interface PrimaryBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
}

export function PrimaryBtn({ children, loading, loadingLabel, className, ...props }: PrimaryBtnProps) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        'h-11 md:h-10 w-full rounded-lg',
        'bg-[hsl(var(--color-primary))] text-white',
        'text-[13px] md:text-[13px] font-medium',
        'flex items-center justify-center gap-2',
        'shadow-sm hover:opacity-90 hover:shadow-md',
        'transition-all duration-150 transition-shadow duration-150',
        'transition-transform duration-100 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          {loadingLabel ?? 'Saving…'}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ─── Secondary action button ───────────────────────────────────────────── */

export function SecondaryBtn({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'h-11 md:h-10 flex-1 rounded-lg',
        'border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)]',
        'text-[12px] font-medium text-[hsl(145_15%_28%)]',
        'flex items-center justify-center gap-1.5',
        'hover:bg-[hsl(42_26%_87%)] hover:border-[hsl(34_22%_68%)]',
        'transition-all duration-150 transition-transform duration-100 active:scale-[0.98]',
        'disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

/* ─── Destructive action button ─────────────────────────────────────────── */

export function DangerBtn({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'h-11 md:h-10 flex-1 rounded-lg',
        'border border-[rgba(160,64,64,0.40)] bg-[rgba(160,64,64,0.06)]',
        'text-[12px] font-medium text-[#a04040]',
        'flex items-center justify-center gap-1.5',
        'hover:bg-[rgba(160,64,64,0.12)] hover:border-[rgba(160,64,64,0.55)]',
        'transition-all duration-150 transition-transform duration-100 active:scale-[0.98]',
        'disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}
