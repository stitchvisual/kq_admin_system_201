import type { ReactNode } from 'react';
import { AlertCircle, Calendar, FileText } from 'lucide-react';
import type { Client } from '@/db/schema/clients';
import { colors, radii, spacing } from '@/styles/botanical';
import {
  CLIENT_PANEL,
  ClientPanelHeader,
  clientPanelBtnLabel,
  clientPanelContentScroll,
  clientPanelListRowShell,
  clientPanelPrimaryFlexible,
  clientPanelSecondaryCompact,
  clientPanelSectionLabel,
} from './clientPanelShared';

interface ClientDeletePanelProps {
  client: Client;
  relatedCounts: {
    appointments: number;
    invoices: number;
    unpaid_invoices: number;
    unpaid_total: number;
  };
  onClose: () => void;
  onBack: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export function ClientDeletePanel({
  client,
  relatedCounts,
  onClose,
  onBack,
  onDelete,
  deleting,
}: ClientDeletePanelProps) {
  const hasAppointments = relatedCounts.appointments > 0;
  const hasInvoices = relatedCounts.invoices > 0;
  const hasUnpaid = relatedCounts.unpaid_invoices > 0;

  return (
    <>
      <ClientPanelHeader title="Delete Client" onClose={onClose} titleColor="#a04040" />
      <div style={clientPanelContentScroll}>
        <p
          style={{
            margin: '0 0 1rem',
            fontSize: '0.82rem',
            color: colors.secondary,
            lineHeight: 1.55,
          }}
        >
          Are you sure you want to delete{' '}
          <strong style={{ fontWeight: 600, color: colors.heading }}>
            {client.name}
          </strong>
          ? This action cannot be undone.
        </p>

        {/* Warning banner */}
        <div
          style={{
            padding: spacing.card,
            borderRadius: radii.card,
            background: 'rgba(160,64,64,0.07)',
            border: '1px solid rgba(160,64,64,0.2)',
            marginBottom: CLIENT_PANEL.sectionMarginBottom,
            display: 'flex',
            gap: CLIENT_PANEL.listGap,
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={16} color="#a04040" style={{ flexShrink: 0, marginTop: 2 }} />
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: '#7a3030',
              lineHeight: 1.45,
            }}
          >
            This client and all related data will be archived. You can restore it later if needed.
          </p>
        </div>

        {/* Related data summary */}
        {(hasAppointments || hasInvoices) && (
          <div style={{ marginBottom: CLIENT_PANEL.sectionMarginBottom }}>
            <p style={clientPanelSectionLabel}>
              Related Records to Archive
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: CLIENT_PANEL.listGap,
              }}
            >
              {hasAppointments && (
                <RelatedCountItem
                  icon={<Calendar size={13} />}
                  label="Appointments"
                  count={relatedCounts.appointments}
                />
              )}
              {hasInvoices && (
                <RelatedCountItem
                  icon={<FileText size={13} />}
                  label="Invoices"
                  count={relatedCounts.invoices}
                />
              )}
            </div>
          </div>
        )}

        {/* Outstanding balance warning */}
        {hasUnpaid && (
          <div
            style={{
              padding: spacing.card,
              borderRadius: radii.card,
              background: 'rgba(182,148,112,0.10)',
              border: '1px solid rgba(182,148,112,0.3)',
              marginBottom: CLIENT_PANEL.sectionMarginBottom,
              display: 'flex',
              gap: CLIENT_PANEL.listGap,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={16} color="#b69470" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: '0 0 0.3rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#6b4d2f',
                }}
              >
                Outstanding Balance Warning
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: '#7a5a3a',
                  lineHeight: 1.45,
                }}
              >
                This client has <strong>{relatedCounts.unpaid_invoices}</strong> unpaid invoice(s) totalling{' '}
                <strong>${(relatedCounts.unpaid_total / 100).toFixed(2)}</strong>. Consider collecting payment
                before deleting.
              </p>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        <div
          style={{
            display: 'flex',
            gap: CLIENT_PANEL.horizontalActionGap,
            marginTop: CLIENT_PANEL.horizontalActionMarginTop,
            minWidth: 0,
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            style={clientPanelPrimaryFlexible({
              background: '#a04040',
              opacity: deleting ? 0.7 : 1,
              cursor: deleting ? 'not-allowed' : 'pointer',
            })}
          >
            <span style={clientPanelBtnLabel}>
              {deleting ? 'Deleting...' : 'Yes, Delete Client'}
            </span>
          </button>
          <button type="button" onClick={onBack} style={clientPanelSecondaryCompact()}>
            <span style={clientPanelBtnLabel}>Go Back</span>
          </button>
        </div>
      </div>
    </>
  );
}

function RelatedCountItem({
  icon,
  label,
  count,
}: {
  icon: ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div
      style={{
        ...clientPanelListRowShell,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: colors.muted }}>{icon}</span>
        <span style={{ fontSize: '0.75rem', color: colors.secondary, fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: '0.8rem',
          color: colors.heading,
          fontWeight: 600,
        }}
      >
        {count}
      </span>
    </div>
  );
}