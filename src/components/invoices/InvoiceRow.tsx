'use client';

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, dropdownMenu } from '@/lib/motion/variants';
import {
  Download,
  Send,
  CheckCircle,
  MoreHorizontal,
  Eye,
  XCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InvoiceWithClient } from '@/repositories/invoices.repository';
import InvoiceStatusBadge, { type InvoiceStatus } from './InvoiceStatusBadge';

interface InvoiceRowProps {
  invoice: InvoiceWithClient;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onIssue: () => void;
  onMarkPaid: () => void;
  onDownload: () => void;
  onCancel?: () => void;
  pdfLoading: boolean;
  actionLoading: boolean;
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

function isOverdue(invoice: InvoiceWithClient): boolean {
  if (invoice.status !== 'issued') return false;
  return new Date(invoice.due_date) < new Date();
}

function getDaysOverdue(dueDate: Date | string): number {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function useBodyPortalTarget(): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEl(document.body);
  }, []);
  return el;
}

export function InvoiceRow({
  invoice,
  selected,
  onSelect,
  onClick,
  onIssue,
  onMarkPaid,
  onDownload,
  onCancel,
  pdfLoading,
  actionLoading,
}: InvoiceRowProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const portalTarget = useBodyPortalTarget();
  const overdue = isOverdue(invoice);
  const daysOverdue = overdue ? getDaysOverdue(invoice.due_date) : 0;
  const item_count = invoice.items?.length ?? 0;

  const updateMenuPosition = () => {
    const btn = moreBtnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setMenuPos({
      top: r.bottom + 4,
      right: Math.max(8, window.innerWidth - r.right),
    });
  };

  useLayoutEffect(() => {
    if (!showOverflow) return;
    updateMenuPosition();
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [showOverflow]);

  return (
    <motion.div
      className={cn(
        'invoice-row grid grid-cols-[40px_120px_1fr_100px_100px_120px_100px_140px] gap-4 px-4 py-[0.85rem]',
        'border-b border-[var(--color-semantic-border-default)] items-center cursor-pointer',
        'transition-colors duration-200 ease-smooth'
      )}
      variants={fadeUp}
      whileHover={{ 
        backgroundColor: 'var(--color-semantic-background-subtle)',
        transform: 'translateY(-0.5px)'
      }}
      whileTap={{ scale: 0.998 }}
      style={{ 
        background: selected 
          ? 'var(--color-semantic-accent-sage-subtle)' 
          : undefined 
      }}
      onClick={onClick}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 cursor-pointer accent-primary"
      />
      
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          {invoice.invoice_number}
        </span>
        {item_count > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {item_count} item{item_count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground truncate">
          {invoice.client.name}
        </span>
        {invoice.client.ndis_number && (
          <span className="text-[10px] text-muted-foreground/70">
            NDIS: {invoice.client.ndis_number}
          </span>
        )}
      </div>
      
      <span className="text-[13px] text-muted-foreground">
        {formatDate(invoice.invoice_date)}
      </span>
      
      <span
        className={cn(
          'text-[13px] flex items-center gap-1',
          overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'
        )}
      >
        {overdue && <Clock size={11} />}
        {formatDate(invoice.due_date)}
      </span>
      
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(invoice.total)}
      </span>
      
      <div>
        <InvoiceStatusBadge
          status={invoice.status as InvoiceStatus}
          dueDate={invoice.due_date ?? undefined}
          issuedAt={invoice.issued_at ?? undefined}
          size="sm"
        />
      </div>
      
      <div
        className="flex items-center justify-end gap-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {invoice.status === 'draft' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIssue();
            }}
            disabled={actionLoading}
            className="h-7 px-3 rounded-[var(--radius-button)] bg-[var(--color-semantic-brand-primary)] text-white text-[11.5px] font-semibold flex items-center gap-1 hover:bg-[var(--color-semantic-brand-hover)] disabled:opacity-50 transition-all duration-200 ease-smooth shadow-sm hover:shadow-md"
          >
            <Send size={13} /> Issue
          </button>
        )}
        
        {invoice.status === 'issued' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid();
            }}
            disabled={actionLoading}
            className="w-7 h-7 rounded-[var(--radius-button)] bg-[var(--status-completed-text)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all duration-200 ease-smooth shadow-sm"
            title="Mark as Paid"
          >
            {actionLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle size={13} />
            )}
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          disabled={!!pdfLoading}
          className="w-7 h-7 rounded-[var(--radius-button)] border border-[var(--color-semantic-border-default)] bg-[var(--color-semantic-background-muted)] flex items-center justify-center text-[var(--color-semantic-text-secondary)] hover:bg-[var(--color-semantic-border-default)] hover:translate-y-[-0.5px] disabled:opacity-50 transition-all duration-200 ease-smooth shadow-soft"
          title="Download PDF"
        >
          {pdfLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
        </button>
        
        <button
          ref={moreBtnRef}
          type="button"
          aria-expanded={showOverflow}
          aria-haspopup="menu"
          onClick={e => {
            e.stopPropagation();
            if (!showOverflow && moreBtnRef.current) {
              const r = moreBtnRef.current.getBoundingClientRect();
              setMenuPos({
                top: r.bottom + 4,
                right: Math.max(8, window.innerWidth - r.right),
              });
            }
            setShowOverflow(v => !v);
          }}
          className="w-7 h-7 rounded-[var(--radius-button)] border border-[var(--color-semantic-border-default)] bg-[var(--color-semantic-background-muted)] flex items-center justify-center text-[var(--color-semantic-text-secondary)] hover:bg-[var(--color-semantic-border-default)] hover:translate-y-[-0.5px] transition-all duration-200 ease-smooth"
        >
          <MoreHorizontal size={14} />
        </button>

        {portalTarget &&
          createPortal(
            <AnimatePresence>
              {showOverflow && (
                <>
                  <div
                    key="overflow-backdrop"
                    className="fixed inset-0 z-[10000] bg-transparent"
                    aria-hidden
                    onClick={() => setShowOverflow(false)}
                  />
                  <motion.div
                    key="overflow-menu"
                    role="menu"
                    className="fixed z-[10001] min-w-[160px] overflow-hidden rounded-lg border border-[var(--color-semantic-border-default)] bg-[var(--color-semantic-background-base)] shadow-xl"
                    style={{ top: menuPos.top, right: menuPos.right }}
                    variants={dropdownMenu}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={e => {
                        e.stopPropagation();
                        setShowOverflow(false);
                        onClick();
                      }}
                      className="flex w-full items-center gap-1.5 bg-[var(--color-semantic-background-muted)] px-3.5 py-2.5 text-left text-[12.5px] text-foreground transition-colors hover:bg-[var(--color-semantic-border-default)]"
                    >
                      <Eye size={13} /> View Details
                    </button>
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && onCancel && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={e => {
                          e.stopPropagation();
                          setShowOverflow(false);
                          onCancel();
                        }}
                        className="flex w-full items-center gap-1.5 bg-[var(--color-semantic-background-muted)] px-3.5 py-2.5 text-left text-red-600 transition-colors hover:bg-[var(--color-semantic-border-default)]"
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            portalTarget
          )}
      </div>
    </motion.div>
  );
}

interface InvoiceRowMobileProps {
  invoice: InvoiceWithClient;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onIssue: () => void;
  onMarkPaid: () => void;
  onDownload: () => void;
  pdfLoading: boolean;
  actionLoading: boolean;
}

export function InvoiceRowMobile({
  invoice,
  selected,
  onSelect,
  onClick,
  onIssue,
  onMarkPaid,
  onDownload,
  pdfLoading,
  actionLoading,
}: InvoiceRowMobileProps) {
  const overdue = isOverdue(invoice);
  
  return (
    <div
      className={cn(
        'invoice-row-mobile rounded-lg border border-primary p-3 mb-2 transition-all cursor-pointer',
        'hover:bg-primary/5 active:bg-primary/10',
        selected && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer accent-primary"
          />
          <span className="font-semibold text-sm">{invoice.invoice_number}</span>
        </div>
        <InvoiceStatusBadge
          status={invoice.status as InvoiceStatus}
          dueDate={invoice.due_date ?? undefined}
          size="sm"
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>{invoice.client.name}</span>
        <span className="font-semibold text-foreground">
          {formatCurrency(invoice.total)}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Due: {formatDate(invoice.due_date)}</span>
        <div className="flex gap-1.5">
          {invoice.status === 'draft' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onIssue();
              }}
              disabled={actionLoading}
              className="h-6 px-2.5 rounded bg-sky-600 text-white text-[10px] font-semibold flex items-center gap-1"
            >
              <Send size={10} /> Issue
            </button>
          )}
          {invoice.status === 'issued' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkPaid();
              }}
              disabled={actionLoading}
              className="h-6 px-2.5 rounded bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1"
            >
              <CheckCircle size={10} /> Paid
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            disabled={!!pdfLoading}
            className="h-6 px-2 rounded border border-primary text-[10px] font-medium"
          >
            {pdfLoading ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceRow;
