import type { ReactNode } from 'react';
import { AlertCircle, Calendar, FileText } from 'lucide-react';
import type { Client } from '@/db/schema/clients';
import {
  PanelHeader,
  PanelContent,
  SectionLabel,
  PrimaryBtn,
  SecondaryBtn,
} from '@/components/panels';

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
      <PanelHeader
        breadcrumb="Clients"
        title="Delete Client"
        accentClass="bg-[var(--panel-accent-delete)]"
        titleColorClass="text-[var(--status-overdue-text)]"
        onClose={onClose}
      />
      <PanelContent>
        <p className="m-0 mb-4 text-[0.82rem] text-muted-foreground leading-relaxed">
          Are you sure you want to delete{' '}
          <strong className="font-semibold text-foreground">{client.name}</strong>
          ? This action cannot be undone.
        </p>

        {/* Warning banner */}
        <div className="p-[0.85rem] rounded-[10px] bg-[var(--status-overdue-bg)] border border-[var(--status-overdue-border)] mb-6 flex gap-2 items-start">
          <AlertCircle size={16} className="text-[var(--status-overdue-dot)] flex-shrink-0 mt-0.5" />
          <p className="m-0 text-[var(--font-size-meta)] text-[var(--status-overdue-text)] leading-snug">
            This client and all related data will be archived. You can restore it later if needed.
          </p>
        </div>

        {/* Related data summary */}
        {(hasAppointments || hasInvoices) && (
          <div className="mb-6">
            <SectionLabel>Related Records to Archive</SectionLabel>
            <div className="divide-y divide-primary/50">
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
          <div className="p-[0.85rem] rounded-[10px] bg-[var(--status-pending-bg)] border border-[var(--status-pending-border)] mb-6 flex gap-2 items-start">
            <AlertCircle size={16} className="text-[var(--status-pending-dot)] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-1 text-[var(--font-size-meta)] font-semibold text-[var(--status-pending-text)]">
                Outstanding Balance Warning
              </p>
              <p className="m-0 text-[var(--font-size-meta)] text-[var(--status-pending-text)]/90 leading-snug">
                This client has <strong>{relatedCounts.unpaid_invoices}</strong> unpaid invoice(s) totalling{' '}
                <strong>${(relatedCounts.unpaid_total / 100).toFixed(2)}</strong>. Consider collecting payment
                before deleting.
              </p>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        <div className="flex gap-2 mt-6 min-w-0 w-full">
          <PrimaryBtn
            type="button"
            onClick={onDelete}
            disabled={deleting}
            loading={deleting}
            loadingLabel="Deleting..."
            className="flex-1 !bg-destructive hover:!bg-destructive/90"
          >
            <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              Yes, Delete Client
            </span>
          </PrimaryBtn>
          <SecondaryBtn type="button" onClick={onBack}>
            <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Go Back</span>
          </SecondaryBtn>
        </div>
      </PanelContent>
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
    <div className="flex items-center justify-between py-[6px]">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[12px] text-muted-foreground font-medium">{label}</span>
      </div>
      <span className="text-[12px] font-medium text-foreground">{count}</span>
    </div>
  );
}
