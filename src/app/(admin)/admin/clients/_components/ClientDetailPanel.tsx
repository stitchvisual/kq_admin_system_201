import { Pencil, Trash2, Calendar, FileText, AlertCircle } from 'lucide-react';
import type { Client } from '@/db/schema/clients';
import { colors, invoiceStatus, radii, spacing, typography } from '@/styles/botanical';
import {
  CLIENT_PANEL,
  ClientPanelHeader,
  clientPanelBtnLabel,
  clientPanelContentScroll,
  clientPanelListRowShell,
  clientPanelPrimaryFullWidth,
  clientPanelSecondaryFullWidth,
  clientPanelSectionLabel,
} from './clientPanelShared';

interface ClientDetailPanelProps {
  client: Client;
  rateCodes: {
    weekday: { code: string; name: string; price: string } | null;
    saturday: { code: string; name: string; price: string } | null;
    sunday: { code: string; name: string; price: string } | null;
  };
  recentAppointments: Array<{
    id: string;
    starts_at: Date;
    ends_at: Date;
    status: string;
    invoiced: boolean;
    is_group: boolean;
  }>;
  invoices: Array<{
    id: string;
    invoice_number: string;
    total: number;
    status: string;
    invoice_date: Date | null;
  }>;
  outstandingBalance: number;
  stats: {
    total_sessions: number;
    total_invoiced: number;
    total_paid: number;
  };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientDetailPanel({
  client,
  rateCodes,
  recentAppointments,
  invoices,
  outstandingBalance,
  stats,
  onClose,
  onEdit,
  onDelete,
}: ClientDetailPanelProps) {
  const initials = client.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const green = colors.primaryBase;
  const amber = '#b69470';

  return (
    <>
      <ClientPanelHeader title="Client Details" onClose={onClose} />
      <div style={clientPanelContentScroll}>
        {/* Client Info Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: spacing.card,
            borderRadius: radii.card,
            background: colors.primaryBg,
            border: `1px solid ${colors.primary}`,
            marginBottom: CLIENT_PANEL.sectionMarginBottom,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
              {initials}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <p
              style={{
                margin: 0,
                fontFamily: typography.heading,
                fontSize: '0.95rem',
                fontWeight: typography.weights.heading,
                color: colors.heading,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {client.name}
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: typography.sizes.small,
                color: colors.muted,
              }}
            >
              {client.ndis_number ? `NDIS: ${client.ndis_number}` : ''}
            </p>
          </div>
        </div>

        {/* Rate Code Status */}
        <div style={{ marginBottom: CLIENT_PANEL.sectionMarginBottom }}>
          <p style={clientPanelSectionLabel}>
            Rate Codes
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: CLIENT_PANEL.listGap,
            }}
          >
            <RateCodeRow label="Weekday" rate={rateCodes.weekday} />
            <RateCodeRow label="Saturday" rate={rateCodes.saturday} />
            <RateCodeRow label="Sunday" rate={rateCodes.sunday} />
          </div>
        </div>

        {/* Outstanding Balance */}
        <div style={{ marginBottom: CLIENT_PANEL.sectionMarginBottom }}>
          <p style={clientPanelSectionLabel}>
            Balance
          </p>
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: radii.button,
              background: outstandingBalance === 0
                ? 'rgba(90,138,96,0.08)'
                : 'rgba(182,148,112,0.10)',
              border: `1px solid ${outstandingBalance === 0 ? 'rgba(90,138,96,0.2)' : 'rgba(182,148,112,0.25)'}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 600,
                color: outstandingBalance === 0 ? '#5a8a60' : amber,
              }}
            >
              {outstandingBalance === 0 ? 'All paid up' : `Outstanding: $${(outstandingBalance / 100).toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Recent Sessions */}
        {recentAppointments.length > 0 && (
          <div style={{ marginBottom: CLIENT_PANEL.sectionMarginBottom }}>
            <p style={clientPanelSectionLabel}>
              Recent Sessions ({recentAppointments.length})
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: CLIENT_PANEL.listGap,
              }}
            >
              {recentAppointments.slice(0, 5).map((appt, idx) => (
                <SessionRow key={idx} appointment={appt} />
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        {invoices.length > 0 && (
          <div style={{ marginBottom: CLIENT_PANEL.sectionMarginBottom }}>
            <p style={clientPanelSectionLabel}>
              Invoices ({invoices.length})
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: CLIENT_PANEL.listGap,
              }}
            >
              {invoices.map((invoice, idx) => (
                <InvoiceRow key={idx} invoice={invoice} />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ marginBottom: CLIENT_PANEL.sectionMarginBottom }}>
          <p style={clientPanelSectionLabel}>
            Statistics
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: CLIENT_PANEL.listGap,
            }}
          >
            <StatRow label="Total Sessions" value={stats.total_sessions} />
            <StatRow
              label="Total Invoiced"
              value={`$${(stats.total_invoiced / 100).toFixed(2)}`}
            />
            <StatRow label="Total Paid" value={`$${(stats.total_paid / 100).toFixed(2)}`} />
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: CLIENT_PANEL.verticalActionGap,
          }}
        >
          <button
            type="button"
            onClick={onEdit}
            style={clientPanelPrimaryFullWidth()}
          >
            <Pencil size={13} style={{ flexShrink: 0 }} />
            <span style={clientPanelBtnLabel}>Edit Client</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            style={clientPanelSecondaryFullWidth({
              color: invoiceStatus.overdue.text,
              border: `1px solid ${invoiceStatus.overdue.border}`,
            })}
          >
            <Trash2 size={13} style={{ flexShrink: 0 }} />
            <span style={clientPanelBtnLabel}>Delete Client</span>
          </button>
        </div>
      </div>
    </>
  );
}

function RateCodeRow({
  label,
  rate,
}: {
  label: string;
  rate: { code: string; name: string; price: string } | null;
}) {
  const green = colors.primaryBase;
  const amber = '#b69470';

  return (
    <div
      style={{
        ...clientPanelListRowShell,
      }}
    >
      <span style={{ fontSize: '0.72rem', color: colors.secondary, fontWeight: 500 }}>
        {label}
      </span>
      {rate ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              color: colors.heading,
              fontWeight: 500,
            }}
          >
            ${rate.price}
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: green,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertCircle size={12} style={{ color: amber }} />
          <span
            style={{
              fontSize: '0.7rem',
              color: amber,
              fontWeight: 600,
            }}
          >
            Not set
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: amber,
            }}
          />
        </div>
      )}
    </div>
  );
}

function SessionRow({
  appointment,
}: {
  appointment: {
    id: string;
    starts_at: Date;
    ends_at: Date;
    status: string;
    invoiced: boolean;
    is_group: boolean;
  };
}) {
  const date = new Date(appointment.starts_at);
  const startDate = new Date(appointment.starts_at);
  const endDate = new Date(appointment.ends_at);
  const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const statusColors: Record<string, string> = {
    pending: 'rgba(182,148,112,0.15)',
    confirmed: 'rgba(120,149,170,0.15)',
    completed: 'rgba(131,153,119,0.15)',
    cancelled: 'rgba(168,140,158,0.15)',
  };

  const statusTextColors: Record<string, string> = {
    pending: '#b69470',
    confirmed: '#7895aa',
    completed: '#839977',
    cancelled: '#a88c9e',
  };

  return (
    <div
      style={{
        ...clientPanelListRowShell,
        fontSize: '0.73rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={12} style={{ color: colors.muted }} />
        <span style={{ color: colors.heading, fontWeight: 500 }}>
          {date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: colors.secondary }}>{duration}</span>
        <div
          style={{
            padding: '1px 6px',
            borderRadius: 99,
            background: statusColors[appointment.status] || 'rgba(120,149,170,0.15)',
            color: statusTextColors[appointment.status] || '#7895aa',
            fontSize: '0.62rem',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {appointment.status === 'completed' ? '✓' : '●'}
        </div>
        {appointment.invoiced && (
          <div
            style={{
              padding: '1px 6px',
              borderRadius: 99,
              background: 'rgba(172,163,118,0.2)',
              color: '#aca376',
              fontSize: '0.62rem',
              fontWeight: 600,
            }}
          >
            Invoiced
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceRow({
  invoice,
}: {
  invoice: {
    id: string;
    invoice_number: string;
    total: number;
    status: string;
    invoice_date: Date | null;
  };
}) {
  const statusColors: Record<string, string> = {
    draft: 'rgba(182,148,112,0.15)',
    issued: 'rgba(182,148,112,0.15)',
    paid: 'rgba(131,153,119,0.15)',
    cancelled: 'rgba(168,140,158,0.15)',
  };

  const statusTextColors: Record<string, string> = {
    draft: '#b69470',
    issued: '#b69470',
    paid: '#839977',
    cancelled: '#a88c9e',
  };

  return (
    <div
      style={{
        ...clientPanelListRowShell,
        fontSize: '0.73rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={12} style={{ color: colors.muted }} />
        <span style={{ color: colors.heading, fontWeight: 500 }}>
          {invoice.invoice_number}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: colors.heading, fontWeight: 600 }}>
          ${(invoice.total / 100).toFixed(2)}
        </span>
        <div
          style={{
            padding: '1px 6px',
            borderRadius: 99,
            background: statusColors[invoice.status] || 'rgba(120,149,170,0.15)',
            color: statusTextColors[invoice.status] || '#7895aa',
            fontSize: '0.62rem',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {invoice.status}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        ...clientPanelListRowShell,
      }}
    >
      <span style={{ fontSize: '0.72rem', color: colors.secondary, fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.8rem', color: colors.heading, fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}