'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, FileText, Clock, ChevronRight } from 'lucide-react';
import { colors, radii, typography } from '@/styles/botanical';
import { fadeUp, staggerContainerFast } from '@/lib/motion/variants';

const MotionLink = motion(Link);

interface AttentionItem {
  type: 'overdue' | 'uninvoiced' | 'incomplete' | 'stale_draft';
  message: string;
  detail?: string;
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

function buildGenerateAllUninvoicedLink(): string {
  // Use a very wide range so users see all completed, uninvoiced sessions.
  const params = new URLSearchParams({
    tab: 'generate',
    startDate: '1970-01-01',
    endDate: '2099-12-31',
  });
  return `/admin/invoices?${params.toString()}`;
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
      detail: 'Completed sessions that have not been added to an invoice yet',
      link: buildGenerateAllUninvoicedLink(),
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

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          style={{ marginBottom: '1.5rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
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

          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {items.map((item) => {
                const Icon =
                  item.type === 'overdue'
                    ? AlertTriangle
                    : item.type === 'uninvoiced'
                      ? FileText
                      : Clock;

                const severityColors =
                  item.severity === 'high'
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
                  <MotionLink
                    key={item.type}
                    href={item.link}
                    variants={fadeUp}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.99 }}
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
                    }}
                  >
                    <Icon size={16} style={{ color: severityColors.icon, flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
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
                      {item.detail && (
                        <span
                          style={{
                            display: 'block',
                            marginTop: '0.15rem',
                            fontSize: '0.75rem',
                            color: severityColors.text,
                            opacity: 0.75,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.detail}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      size={16}
                      style={{ color: severityColors.icon, opacity: 0.6, flexShrink: 0 }}
                    />
                  </MotionLink>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
