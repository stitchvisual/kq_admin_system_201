'use client';

import Link from 'next/link';
import { AlertTriangle, FileText, Clock, ChevronRight } from 'lucide-react';
import { colors, radii, typography } from '@/styles/botanical';

interface AttentionItem {
  type: 'overdue' | 'uninvoiced' | 'incomplete' | 'stale_draft';
  message: string;
  link: string;
  severity: 'high' | 'medium';
}

interface AttentionListProps {
  overdueCount: number;
  overdueTotal: number;
  uninvoicedCount: number;
  incompletePastEnd: number;
  staleDraftsCount: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(cents / 100);
}

export function AttentionList({
  overdueCount,
  overdueTotal,
  uninvoicedCount,
  incompletePastEnd,
  staleDraftsCount,
}: AttentionListProps) {
  const items: AttentionItem[] = [];

  // Overdue invoices (high priority)
  if (overdueCount > 0) {
    items.push({
      type: 'overdue',
      message: `${overdueCount} overdue ${overdueCount === 1 ? 'invoice' : 'invoices'} — ${formatCurrency(overdueTotal)}`,
      link: '/admin/invoices?status=overdue',
      severity: 'high',
    });
  }

  // Uninvoiced sessions (medium priority)
  if (uninvoicedCount > 0) {
    items.push({
      type: 'uninvoiced',
      message: `${uninvoicedCount} ${uninvoicedCount === 1 ? 'session' : 'sessions'} ready to invoice`,
      link: '/admin/invoices',
      severity: 'medium',
    });
  }

  // Incomplete sessions past end time (medium priority)
  if (incompletePastEnd > 0) {
    items.push({
      type: 'incomplete',
      message: `${incompletePastEnd} ${incompletePastEnd === 1 ? 'session' : 'sessions'} today still need completing`,
      link: '#today-schedule',
      severity: 'medium',
    });
  }

  // Stale drafts (low-medium priority)
  if (staleDraftsCount > 0) {
    items.push({
      type: 'stale_draft',
      message: `${staleDraftsCount} draft ${staleDraftsCount === 1 ? 'invoice' : 'invoices'} waiting to be issued (3+ days old)`,
      link: '/admin/invoices?status=draft',
      severity: 'medium',
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2
        style={{
        fontFamily: typography.body,
        fontSize: 'var(--font-size-badge)',
        fontWeight: typography.weights.bold,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: colors.secondary,
          marginBottom: '0.75rem',
        }}
      >
        Needs Attention
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, index) => {
          const Icon = item.type === 'overdue' 
            ? AlertTriangle 
            : item.type === 'uninvoiced'
            ? FileText
            : Clock;

          const severityColors = item.severity === 'high'
            ? {
                bg: 'var(--status-overdue-bg)',
                border: 'var(--status-overdue-border)',
                text: 'var(--status-overdue-text)',
                icon: 'var(--status-overdue-dot)',
                leftBorder: 'var(--status-overdue-dot)',
              }
            : {
                bg: 'var(--status-pending-bg)',
                border: 'var(--status-pending-border)',
                text: 'var(--status-pending-text)',
                icon: 'var(--status-pending-dot)',
                leftBorder: 'var(--status-pending-dot)',
              };

          return (
            <Link
              key={index}
              href={item.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: radii.button,
                background: severityColors.bg,
                border: `1px solid ${severityColors.border}`,
                borderLeft: `3px solid ${severityColors.leftBorder}`,
                textDecoration: 'none',
                transition: 'all 120ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.severity === 'high' 
                  ? 'var(--status-overdue-bg)' 
                  : 'var(--status-pending-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = severityColors.bg;
              }}
            >
              <Icon size={16} style={{ color: severityColors.icon, flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  fontSize: '0.85rem',
                  color: severityColors.text,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.message}
              </span>
              <ChevronRight
                size={16}
                style={{ color: severityColors.icon, opacity: 0.6, flexShrink: 0 }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}