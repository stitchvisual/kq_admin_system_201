'use client';

import React from 'react';
import { X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Panel Header ─────────────────────────────────────────────────────── */

interface PanelHeaderProps {
  breadcrumb: string; // e.g. "Invoices" or "Clients"
  title: string; // e.g. "Invoice details"
  /** Tailwind bg class for the 3px top bar (ignored when showAccentBar is false) */
  accentClass?: string;
  titleColorClass?: string; // Override for destructive panels
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
              className="hidden md:flex w-7 h-7 rounded-lg border border-[var(--color-semantic-border-default)] bg-[var(--color-semantic-background-muted)] flex-shrink-0 items-center justify-center text-[var(--color-semantic-text-secondary)] hover:bg-[var(--color-semantic-border-default)] hover:text-foreground transition-colors duration-[var(--motion-duration-fast)] transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
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
            <h2
              className={cn(
                'font-heading text-[15px] font-semibold leading-tight m-0',
                titleColorClass,
              )}
            >
              {title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className={cn(
            'w-7 h-7 rounded-lg border border-[var(--color-semantic-border-default)] bg-[var(--color-semantic-background-muted)] flex-shrink-0',
            'flex items-center justify-center text-[var(--color-semantic-text-secondary)]',
            'hover:bg-[var(--color-semantic-border-default)] hover:text-foreground',
            'transition-colors duration-[var(--motion-duration-fast)] transition-transform duration-[var(--motion-duration-fast)]',
            'active:scale-95',
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
  return <div className="flex-1 overflow-y-auto p-5 min-w-0">{children}</div>;
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

export function PrimaryBtn({
  children,
  loading,
  loadingLabel,
  className,
  ...props
}: PrimaryBtnProps) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        'h-11 md:h-10 w-full rounded-lg relative overflow-hidden',
        'bg-gradient-to-b from-[var(--color-semantic-brand-primary)] to-[var(--color-semantic-brand-hover)] text-white',
        'text-[13px] md:text-[13px] font-medium',
        'flex items-center justify-center gap-2',
        'shadow-button hover:shadow-button-hover hover:-translate-y-0.5',
        'transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]',
        'active:translate-y-0 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0',
        'before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.08] before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-[var(--motion-duration-fast)]',
        className,
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

export function SecondaryBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'h-11 md:h-10 flex-1 rounded-lg',
        'border border-[var(--color-semantic-border-default)] bg-[var(--color-semantic-background-muted)]',
        'text-[12px] font-medium text-[var(--color-semantic-text-primary)]',
        'flex items-center justify-center gap-1.5',
        'hover:bg-[var(--color-semantic-border-default)] hover:border-[var(--color-semantic-border-strong)] hover:-translate-y-0.5 hover:shadow-soft',
        'transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]',
        'active:translate-y-0 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ─── Destructive action button ─────────────────────────────────────────── */

export function DangerBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'h-11 md:h-10 flex-1 rounded-lg',
        'border border-[var(--color-semantic-brand-primary)]/40 bg-[var(--color-semantic-brand-primary)]/6',
        'text-[12px] font-medium text-[var(--color-semantic-brand-primary)]',
        'flex items-center justify-center gap-1.5',
        'hover:bg-[var(--color-semantic-brand-primary)]/12 hover:border-[var(--color-semantic-brand-primary)]/55 hover:-translate-y-0.5',
        'transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]',
        'active:translate-y-0 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}
