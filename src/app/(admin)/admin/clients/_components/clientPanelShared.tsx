'use client';

import { X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { colors, shadows, typography, sizes } from '@/styles/botanical';

/** Spacing and layout tokens shared by Client detail / form / delete panels */
export const CLIENT_PANEL = {
  contentPadding: '1.25rem',
  sectionMarginBottom: '1.5rem',
  listGap: '0.5rem',
  headerPadding: '1rem 1.25rem 0.75rem',
  horizontalActionGap: '0.5rem',
  horizontalActionMarginTop: '1.5rem',
  verticalActionGap: '0.75rem',
} as const;

/** Scrollable panel body (below header) */
export const clientPanelContentScroll: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: CLIENT_PANEL.contentPadding,
};

/** Uppercase section title (Rate codes, Balance, etc.) */
export const clientPanelSectionLabel: CSSProperties = {
  margin: '0 0 0.5rem',
  fontSize: typography.sizes.label,
  fontWeight: typography.weights.bold,
  letterSpacing: typography.letterSpacing.label,
  textTransform: 'uppercase',
  color: colors.muted,
};

/** Text inside buttons — ellipsis when space is tight */
export const clientPanelBtnLabel: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Standard list row shell (rate rows, sessions, invoices, related counts) */
export const clientPanelListRowShell: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem 0.7rem',
  borderRadius: 6,
  background: colors.mutedBg,
  border: `1px solid ${colors.primary}`,
};

export function ClientPanelHeader({
  title,
  onClose,
  titleColor,
  breadcrumb,
}: {
  title: string;
  onClose: () => void;
  /** e.g. destructive accent for delete panel */
  titleColor?: string;
  /** Optional context breadcrumb above the title */
  breadcrumb?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: CLIENT_PANEL.headerPadding,
        borderBottom: `1px solid ${colors.primary}`,
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {breadcrumb && (
          <span className="text-[11px] uppercase text-muted-foreground tracking-wider block mb-1">
            {breadcrumb}
          </span>
        )}
        <h2
          style={{
            fontFamily: typography.heading,
            fontSize: typography.sizes.cardTitle,
            fontWeight: typography.weights.heading,
            color: titleColor ?? colors.heading,
            margin: 0,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: 'none',
          background: colors.mutedBg,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.muted,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

const panelPrimaryBase: CSSProperties = {
  height: sizes.buttonHeight,
  borderRadius: 8,
  border: 'none',
  color: '#fff',
  fontSize: 'var(--font-size-meta)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontFamily: typography.body,
  boxShadow: shadows.button,
  overflow: 'hidden',
  minWidth: 0,
  maxWidth: '100%',
  background: colors.primaryBase,
};

/** Stacked full-width primary (e.g. Edit client) */
export function clientPanelPrimaryFullWidth(overrides?: CSSProperties): CSSProperties {
  return {
    ...panelPrimaryBase,
    width: '100%',
    ...overrides,
  };
}

/** Primary in a horizontal button row (flex sibling) */
export function clientPanelPrimaryFlexible(overrides?: CSSProperties): CSSProperties {
  return {
    ...panelPrimaryBase,
    flex: 1,
    ...overrides,
  };
}

const panelSecondaryBase: CSSProperties = {
  height: sizes.buttonHeight,
  padding: '0 14px',
  borderRadius: 8,
  border: `1px solid ${colors.primary}`,
  background: 'transparent',
  color: colors.secondary,
  fontSize: 'var(--font-size-meta)',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  fontFamily: typography.body,
  overflow: 'hidden',
  maxWidth: '100%',
};

/** Secondary in a horizontal row (Cancel, Go back) */
export function clientPanelSecondaryCompact(overrides?: CSSProperties): CSSProperties {
  return {
    ...panelSecondaryBase,
    flexShrink: 0,
    ...overrides,
  };
}

/** Stacked full-width secondary (e.g. Delete client) */
export function clientPanelSecondaryFullWidth(overrides?: CSSProperties): CSSProperties {
  return {
    ...panelSecondaryBase,
    width: '100%',
    minWidth: 0,
    ...overrides,
  };
}
