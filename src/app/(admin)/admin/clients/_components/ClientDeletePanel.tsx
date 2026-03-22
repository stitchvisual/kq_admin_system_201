import { X, AlertCircle, Calendar, FileText, DollarSign } from 'lucide-react';
import type { Client } from '@/db/schema/clients';
import { colors, shadows, typography } from '@/styles/botanical';

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
      <PanelHeader title="Delete Client" onClose={onClose} accent="#a04040" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem' }}>
        <p
          style={{
            margin: '0 0 1rem',
            fontSize: '0.82rem',
            color: 'hsl(145 15% 35%)',
            lineHeight: 1.55,
          }}
        >
          Are you sure you want to delete{' '}
          <strong style={{ fontWeight: 600, color: 'hsl(145 15% 22%)' }}>
            {client.name}
          </strong>
          ? This action cannot be undone.
        </p>

        {/* Warning banner */}
        <div
          style={{
            padding: '0.85rem',
            borderRadius: 10,
            background: 'rgba(160,64,64,0.07)',
            border: '1px solid rgba(160,64,64,0.2)',
            marginBottom: '1.1rem',
            display: 'flex',
            gap: '0.65rem',
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
          <div style={{ marginBottom: '1.1rem' }}>
            <p
              style={{
                margin: '0 0 0.5rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'hsl(145 15% 50%)',
              }}
            >
              Related Records to Archive
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
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
              padding: '0.85rem',
              borderRadius: 10,
              background: 'rgba(182,148,112,0.10)',
              border: '1px solid rgba(182,148,112,0.3)',
              marginBottom: '1.1rem',
              display: 'flex',
              gap: '0.65rem',
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
            gap: '0.5rem',
            marginTop: '1.25rem',
          }}
        >
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              ...primaryBtnStyle('#a04040', 'rgba(160,64,64,0.1)'),
              flex: 1,
            }}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Client'}
          </button>
          <button onClick={onBack} style={secondaryBtnStyle}>
            Go Back
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
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.7rem',
        borderRadius: 6,
        background: 'hsl(47 22% 94%)',
        border: '1px solid hsl(37 18% 89%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: 'hsl(145 15% 48%)' }}>{icon}</span>
        <span style={{ fontSize: '0.75rem', color: 'hsl(145 15% 38%)', fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: '0.8rem',
          color: 'hsl(145 15% 22%)',
          fontWeight: 600,
        }}
      >
        {count}
      </span>
    </div>
  );
}

function PanelHeader({
  title,
  onClose,
  accent,
}: {
  title: string;
  onClose: () => void;
  accent?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.1rem 0.75rem',
        borderBottom: `1px solid ${colors.primary}`,
        flexShrink: 0,
      }}
    >
      <h2
        style={{
          fontFamily: typography.heading,
          fontSize: '1rem',
          fontWeight: 600,
          color: accent ?? colors.heading,
          margin: 0,
        }}
      >
        {title}
      </h2>
      <button
        onClick={onClose}
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
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

const primaryBtnStyle = (
  bg: string,
  hoverBg: string
): React.CSSProperties => ({
  height: 36,
  borderRadius: 8,
  border: 'none',
  background: bg,
  color: '#fff',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontFamily: typography.body,
  boxShadow: shadows.button,
});

const secondaryBtnStyle: React.CSSProperties = {
  height: 36,
  padding: '0 14px',
  borderRadius: 8,
  border: `1px solid ${colors.primary}`,
  background: 'transparent',
  color: colors.secondary,
  fontSize: '0.8rem',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  fontFamily: typography.body,
};