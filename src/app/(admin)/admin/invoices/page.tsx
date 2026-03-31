'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { AnimatePresence, motion } from 'framer-motion';
import { staggerContainerFast, fadeUp } from '@/lib/motion/variants';
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Calendar,
  Plus,
  Pencil,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { InvoiceWithClient, ClientSessionGroup as ClientSessionGroupType } from '@/repositories/invoices.repository';
import { StatCard, StatCardGrid } from '@/components/shared/StatCard';
import { EmptyInvoices } from '@/components/botanical/EmptyState';
import { InvoiceRow as InvoiceRowComponent } from '@/components/invoices/InvoiceRow';
import { InvoiceDetailPanel } from '@/components/invoices/InvoiceDetailPanel';
import { BulkIssueModal, BulkMarkPaidModal } from '@/components/invoices/BulkActionModal';
import { apiDataFetcher } from '@/lib/api-swr-fetcher';

// ============================================================================
// TYPES
// ============================================================================

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function fetchInvoiceList(url: string): Promise<{
  list: InvoiceWithClient[];
  pagination: PaginationInfo;
}> {
  const res = await fetch(url);
  const result = await res.json().catch(() => ({}));
  if (!res.ok || !result.success) {
    const msg = result.error?.message ?? `Failed to load invoices (${res.status})`;
    throw new Error(msg);
  }
  return {
    list: result.data,
    pagination:
      result.pagination ?? {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
  };
}

interface SummaryStats {
  outstanding: { count: number; total: number };
  overdue: { count: number; total: number };
  paid_this_month: { count: number; total: number };
  draft: { count: number; total: number };
}

type StatusFilter = 'all' | 'draft' | 'issued' | 'overdue' | 'paid' | 'cancelled';
type PanelMode = 'empty' | 'view';

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: string | number, inCents: boolean = false): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const dollars = inCents ? num / 100 : num;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(dollars);
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

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isOverdue(invoice: InvoiceWithClient): boolean {
  if (invoice.status !== 'issued') return false;
  return new Date(invoice.due_date) < new Date();
}

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UnifiedInvoicesPage() {
  // --- Invoice list state ---
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithClient | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelClosing, setPanelClosing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const invoicesUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));
    return `/api/invoices?${params}`;
  }, [statusFilter, pagination.page, pagination.limit]);

  const {
    data: invoiceListData,
    isLoading: loading,
    mutate: mutateInvoices,
  } = useSWR(invoicesUrl, fetchInvoiceList, {
    revalidateOnFocus: false,
  });

  const invoices = invoiceListData?.list ?? [];

  const {
    data: summaryStats,
    isLoading: statsLoading,
    mutate: mutateSummary,
  } = useSWR('/api/invoices/summary', () => apiDataFetcher<SummaryStats>('/api/invoices/summary'), {
    revalidateOnFocus: false,
  });

  // --- Bulk modal state ---
  const [showBulkIssueModal, setShowBulkIssueModal] = useState(false);
  const [showBulkMarkPaidModal, setShowBulkMarkPaidModal] = useState(false);

  // --- Pending billing state ---
  const [sessionGroups, setSessionGroups] = useState<ClientSessionGroupType[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [billingClientIds, setBillingClientIds] = useState<Set<string>>(new Set());
  const [billingAll, setBillingAll] = useState(false);

  const panelOpen = panelMode !== 'empty';

  // --- Computed values ---
  const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id));
  const hasSelectedDrafts = selectedInvoices.some(inv => inv.status === 'draft');
  const hasSelectedIssued = selectedInvoices.some(inv => inv.status === 'issued');

  // Session selection removed - no longer needed

  // --- Initialize dates ---
  useEffect(() => {
    const today = new Date();
    const defaultDue = addDays(today, 14);
    setDueDate(formatDateForInput(defaultDue));
  }, []);

  // --- Fetch data ---
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedIds(new Set());
  }, [statusFilter]);

  useEffect(() => {
    if (invoiceListData?.pagination) {
      setPagination(invoiceListData.pagination);
    }
  }, [invoiceListData?.pagination]);

  const fetchUninvoicedSessions = async (signal?: AbortSignal) => {
    setSessionsLoading(true);
    try {
      const res = await fetch(
        `/api/invoices/uninvoiced-sessions?startDate=1970-01-01&endDate=2099-12-31`,
        { signal, credentials: 'same-origin' }
      );
      const data = await res.json();
      if (data.success) {
        setSessionGroups(data.data);
      } else {
        toast.error(data.error?.message ?? 'Failed to load sessions');
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return;
      console.error('Failed to fetch uninvoiced sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUninvoicedSessions(controller.signal);
    return () => controller.abort();
  }, []);

  // --- Panel operations ---
  const openPanel = (mode: PanelMode) => {
    setPanelClosing(false);
    setPanelMode(mode);
    setTimeout(() => setPanelVisible(true), 75);
  };

  const closePanel = () => {
    setPanelVisible(false);
    setPanelClosing(true);
    setTimeout(() => {
      setSelectedInvoice(null);
      setPanelMode('empty');
      setPanelClosing(false);
    }, 300);
  };

  const handleInvoiceClick = async (invoice: InvoiceWithClient) => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedInvoice(data.data);
        openPanel('view');
      }
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    setEmailLoading(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Invoice emailed successfully');
      } else {
        const msg = data.error?.message ?? 'Failed to send email';
        toast.error(res.status === 503 ? 'Email sending is not configured.' : msg);
      }
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setEmailLoading(null);
    }
  };

  // --- Invoice actions ---
  const handleIssue = async (invoiceId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/issue`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await mutateInvoices();
        await mutateSummary();
        if (selectedInvoice?.id === invoiceId) {
          setSelectedInvoice(data.data);
        }
        toast.success('Invoice issued successfully');
      } else {
        toast.error(data.error?.message ?? 'Failed to issue invoice');
      }
    } catch (error) {
      console.error('Failed to issue invoice:', error);
      toast.error('Failed to issue invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkIssue = async () => {
    const drafts = invoices.filter(inv => selectedIds.has(inv.id) && inv.status === 'draft');
    if (drafts.length === 0) return;

    setActionLoading(true);
    let successCount = 0;
    for (const invoice of drafts) {
      try {
        const res = await fetch(`/api/invoices/${invoice.id}/issue`, { method: 'POST' });
        const data = await res.json();
        if (data.success) successCount++;
      } catch (error) {
        console.error('Failed to issue:', error);
      }
    }
    setActionLoading(false);
    setShowBulkIssueModal(false);
    toast.success(`Issued ${successCount} invoice(s)`);
    setSelectedIds(new Set());
    await mutateInvoices();
    await mutateSummary();
  };

  const handleMarkPaid = async (invoiceId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await mutateInvoices();
        await mutateSummary();
        if (selectedInvoice?.id === invoiceId) {
          setSelectedInvoice(data.data);
        }
        toast.success('Invoice marked as paid successfully');
      } else {
        toast.error(data.error?.message ?? 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      toast.error('Failed to mark as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkMarkPaid = async () => {
    const issued = invoices.filter(inv => selectedIds.has(inv.id) && inv.status === 'issued');
    if (issued.length === 0) return;

    setActionLoading(true);
    let successCount = 0;
    for (const invoice of issued) {
      try {
        const res = await fetch(`/api/invoices/${invoice.id}/mark-paid`, { method: 'POST' });
        const data = await res.json();
        if (data.success) successCount++;
      } catch (error) {
        console.error('Failed to mark paid:', error);
      }
    }
    setActionLoading(false);
    setShowBulkMarkPaidModal(false);
    toast.success(`Marked ${successCount} invoice(s) as paid`);
    setSelectedIds(new Set());
    await mutateInvoices();
    await mutateSummary();
  };

  const handleCancel = async (invoiceId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        closePanel();
        await mutateInvoices();
        await mutateSummary();
        toast.success('Invoice cancelled successfully');
      } else {
        toast.error(data.error?.message ?? 'Failed to cancel invoice');
      }
    } catch (error) {
      console.error('Failed to cancel invoice:', error);
      toast.error('Failed to cancel invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async (invoiceNumber: string, invoiceId: string) => {
    try {
      setPdfLoading(invoiceId);
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('[PDF] Server error:', res.status, body);
        throw new Error(`PDF generation failed (${res.status}): ${body}`);
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error('PDF is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleBulkDownload = async () => {
    const selected = invoices.filter(inv => selectedIds.has(inv.id));
    if (selected.length === 0) return;

    for (const invoice of selected) {
      await handleDownloadPdf(invoice.invoice_number, invoice.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast.success(`Downloaded ${selected.length} invoice(s)`);
  };

  const handleBillNow = async (clientId: string, autoEmail: boolean = false) => {
    if (billingClientIds.has(clientId)) return;

    setBillingClientIds(prev => new Set(prev).add(clientId));
    try {
      const res = await fetch('/api/invoices/bill-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          due_date: dueDate,
          notes: notes || undefined,
          auto_email: autoEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Invoice ${data.data.invoice_number} created and issued${autoEmail ? ', email sent' : ''}`);
        await fetchUninvoicedSessions();
        await mutateInvoices();
        await mutateSummary();
      } else {
        toast.error(data.error?.message ?? 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Failed to bill now:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setBillingClientIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  const handleBillAll = async () => {
    if (billingAll || sessionGroups.length === 0) return;
    if (!confirm(`Generate and issue ${sessionGroups.length} invoice(s)?`)) return;

    setBillingAll(true);
    let successCount = 0;
    for (const group of sessionGroups) {
      try {
        const res = await fetch('/api/invoices/bill-now', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: group.client_id,
            due_date: dueDate,
            notes: notes || undefined,
            auto_email: false,
          }),
        });
        const data = await res.json();
        if (data.success) successCount++;
      } catch (error) {
        console.error('Failed to bill client:', group.client_name, error);
      }
    }
    setBillingAll(false);
    toast.success(`Created and issued ${successCount} invoice(s)`);
    await fetchUninvoicedSessions();
    await mutateInvoices();
    await mutateSummary();
  };

  // --- Table selection ---
  const handleSelectAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map(inv => inv.id)));
    }
  };

  const handleSelectInvoice = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // --- Render ---
  return (
    <div className="flex h-screen flex-col bg-background font-body">
      {/* HEADER */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-card border-b border-primary shadow-sm px-6">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-primary opacity-90" />
          <h1 className="font-heading text-2xl font-semibold text-foreground m-0">
            Invoices
          </h1>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* MAIN CONTENT */}
        <div
          className={cn(
            'flex-1 overflow-y-auto p-6',
            panelOpen && 'max-md:overflow-hidden'
          )}
        >
          {/* Summary Stats */}
          <StatCardGrid>
            <StatCard
              icon={<FileText size={18} />}
              label="Outstanding"
              value={summaryStats ? formatCurrency(summaryStats.outstanding.total, true) : '$0.00'}
              valueCents={summaryStats?.outstanding.total ?? 0}
              subtext={summaryStats?.outstanding.count ? `${summaryStats.outstanding.count} invoice${summaryStats.outstanding.count !== 1 ? 's' : ''}` : 'None'}
              color="var(--status-confirmed-dot)"
              bg="var(--status-confirmed-bg)"
              borderColor="var(--status-confirmed-border)"
              isZero={!summaryStats?.outstanding?.count}
              onClick={() => setStatusFilter('issued')}
            />
            <StatCard
              icon={<AlertTriangle size={18} />}
              label="Overdue"
              value={summaryStats ? formatCurrency(summaryStats.overdue.total, true) : '$0.00'}
              valueCents={summaryStats?.overdue.total ?? 0}
              subtext={summaryStats?.overdue.count ? `${summaryStats.overdue.count} invoice${summaryStats.overdue.count !== 1 ? 's' : ''}` : 'None'}
              color="var(--status-overdue-dot)"
              bg="var(--status-overdue-bg)"
              borderColor="var(--status-overdue-border)"
              highlight={!!summaryStats?.overdue?.count}
              isZero={!summaryStats?.overdue?.count}
              onClick={() => setStatusFilter('overdue')}
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              label="Paid This Month"
              value={summaryStats ? formatCurrency(summaryStats.paid_this_month.total, true) : '$0.00'}
              valueCents={summaryStats?.paid_this_month.total ?? 0}
              subtext={summaryStats?.paid_this_month.count ? `${summaryStats.paid_this_month.count} invoice${summaryStats.paid_this_month.count !== 1 ? 's' : ''}` : 'None'}
              color="var(--status-completed-dot)"
              bg="var(--status-completed-bg)"
              borderColor="var(--status-completed-border)"
              isZero={!summaryStats?.paid_this_month?.count}
              onClick={() => setStatusFilter('paid')}
            />
            <StatCard
              icon={<Pencil size={18} />}
              label="Draft"
              value={summaryStats ? formatCurrency(summaryStats.draft.total, true) : '$0.00'}
              valueCents={summaryStats?.draft.total ?? 0}
              subtext={summaryStats?.draft.count ? `${summaryStats.draft.count} invoice${summaryStats.draft.count !== 1 ? 's' : ''}` : 'None'}
              color="var(--status-pending-dot)"
              bg="var(--status-pending-bg)"
              borderColor="var(--status-pending-border)"
              isZero={!summaryStats?.draft?.count}
              onClick={() => setStatusFilter('draft')}
            />
          </StatCardGrid>

          {/* Pending Billing Section */}
          <PendingBillingSection
            sessionGroups={sessionGroups}
            loading={sessionsLoading}
            dueDate={dueDate}
            notes={notes}
            billingClientIds={billingClientIds}
            billingAll={billingAll}
            onDueDateChange={setDueDate}
            onNotesChange={setNotes}
            onBillNow={handleBillNow}
            onBillAll={handleBillAll}
            formatCurrency={formatCurrency}
          />

          {/* Invoices List Section */}
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="mb-5 flex items-center gap-1 p-1 rounded-lg bg-mutedBg border border-[hsl(34_22%_74%)] relative">
              {statusTabs.map(tab => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'relative h-8 px-3.5 rounded-md text-sm font-medium cursor-pointer',
                    statusFilter === tab.value
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {statusFilter === tab.value && (
                    <motion.span
                      layoutId="invoice-status-tab-indicator"
                      className="absolute inset-0 rounded-md bg-card border border-primary/30 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            <InvoicesListContent
              statusFilter={statusFilter}
              selectedIds={selectedIds}
              hasSelectedDrafts={hasSelectedDrafts}
              hasSelectedIssued={hasSelectedIssued}
              loading={loading}
              invoices={invoices}
              selectedInvoice={selectedInvoice}
              actionLoading={actionLoading}
              pdfLoading={pdfLoading}
              pagination={pagination}
              onBulkIssue={() => setShowBulkIssueModal(true)}
              onBulkMarkPaid={() => setShowBulkMarkPaidModal(true)}
              onBulkDownload={handleBulkDownload}
              onClearSelection={() => setSelectedIds(new Set())}
              onSelectAll={handleSelectAll}
              onSelectInvoice={handleSelectInvoice}
              onInvoiceClick={handleInvoiceClick}
              onIssue={handleIssue}
              onMarkPaid={handleMarkPaid}
              onDownload={handleDownloadPdf}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* DETAIL PANEL — mobile backdrop */}
        {panelOpen && (
          <div
            className={cn(
              'md:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px]',
              'transition-opacity duration-200',
              panelVisible ? 'opacity-100' : 'opacity-0'
            )}
            onClick={closePanel}
            aria-hidden
          />
        )}

        {/* DETAIL PANEL — desktop column + mobile bottom sheet */}
        <aside
          className={cn(
            'relative flex flex-col overflow-hidden bg-card flex-shrink-0',
            'fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-[20px] rounded-b-none border-t border-primary',
            'md:border-t-0 md:border-l md:border-primary',
            'translate-y-full',
            'transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'md:translate-y-0',
            'md:transition-[width,opacity] md:duration-[280ms] md:ease-[cubic-bezier(0.16,1,0.3,1)]',
            (!panelOpen || panelClosing) && 'pointer-events-none',
            panelOpen && !panelClosing && (panelVisible ? 'translate-y-0' : 'translate-y-full'),
            (!panelOpen || panelClosing) && 'md:w-0 md:opacity-0 md:border-l-0 md:overflow-hidden',
            panelOpen && !panelClosing && 'md:w-[360px] md:opacity-100'
          )}
        >
          <div
            className={cn(
              'w-full md:w-[360px] h-full min-h-0 flex flex-col',
              'transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
              panelVisible ? 'md:delay-75' : 'md:delay-0',
              panelVisible
                ? 'translate-x-0 opacity-100'
                : 'max-md:translate-x-0 max-md:opacity-100 md:translate-x-4 md:opacity-0'
            )}
          >
            <AnimatePresence mode="wait">
              {panelMode === 'view' && selectedInvoice && (
                <InvoiceDetailPanel
                  key={selectedInvoice.id}
                  invoice={selectedInvoice}
                  onClose={closePanel}
                  onCancel={() => handleCancel(selectedInvoice.id)}
                  onIssue={() => handleIssue(selectedInvoice.id)}
                  onMarkPaid={() => handleMarkPaid(selectedInvoice.id)}
                  onDownload={() => handleDownloadPdf(selectedInvoice.invoice_number, selectedInvoice.id)}
                  onSendEmail={() => handleSendEmail(selectedInvoice.id)}
                  actionLoading={actionLoading}
                  pdfLoading={pdfLoading === selectedInvoice.id}
                  emailLoading={emailLoading === selectedInvoice.id}
                />
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* Bulk Action Modals */}
      <BulkIssueModal
        isOpen={showBulkIssueModal}
        onClose={() => setShowBulkIssueModal(false)}
        invoices={selectedInvoices.filter(inv => inv.status === 'draft')}
        onConfirm={handleBulkIssue}
        loading={actionLoading}
      />

      <BulkMarkPaidModal
        isOpen={showBulkMarkPaidModal}
        onClose={() => setShowBulkMarkPaidModal(false)}
        invoices={selectedInvoices.filter(inv => inv.status === 'issued')}
        onConfirm={handleBulkMarkPaid}
        loading={actionLoading}
      />
    </div>
  );
}

// ============================================================================
// PENDING BILLING SECTION COMPONENT
// ============================================================================

function PendingBillingSection({
  sessionGroups,
  loading,
  dueDate,
  notes,
  billingClientIds,
  billingAll,
  onDueDateChange,
  onNotesChange,
  onBillNow,
  onBillAll,
  formatCurrency,
}: {
  sessionGroups: ClientSessionGroupType[];
  loading: boolean;
  dueDate: string;
  notes: string;
  billingClientIds: Set<string>;
  billingAll: boolean;
  onDueDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
  onBillNow: (clientId: string, autoEmail: boolean) => void;
  onBillAll: () => void;
  formatCurrency: (amount: number, inCents?: boolean) => string;
}) {
  const totalSessions = sessionGroups.reduce((sum, g) => sum + g.sessions.length, 0);
  const totalAmount = sessionGroups.reduce((sum, g) => sum + g.estimated_total, 0) / 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Pending Billing
          </h2>
          {totalSessions > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalSessions} session{totalSessions !== 1 ? 's' : ''} across {sessionGroups.length} client{sessionGroups.length !== 1 ? 's' : ''} · {formatCurrency(totalAmount)} total
            </p>
          )}
        </div>
        {sessionGroups.length > 1 && (
          <button
            onClick={onBillAll}
            disabled={billingAll || sessionGroups.length === 0}
            className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {billingAll ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            Bill All
          </button>
        )}
      </div>

      {/* Settings row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Default Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => onDueDateChange(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-[hsl(34_22%_74%)] bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Default Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Invoice notes..."
            className="w-full h-9 px-3 rounded-lg border border-[hsl(34_22%_74%)] bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Client billing table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : sessionGroups.length > 0 ? (
        <div className="rounded-xl border border-primary bg-card overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid md:grid-cols-[1fr_80px_120px_140px] gap-4 items-center px-4 py-3 border-b border-primary bg-mutedBg">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sessions</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
          </div>

          {/* Client rows */}
          <motion.div
            className="divide-y divide-[var(--divide-color)]"
            style={{ ['--divide-color']: 'hsl(37 18% 89%)' } as React.CSSProperties}
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            {sessionGroups.map(group => (
              <motion.div
                key={group.client_id}
                variants={fadeUp}
                className="p-4 hover:bg-mutedBg/50 transition-colors"
              >
                {/* Mobile layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{group.client_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {group.total_sessions} session{group.total_sessions !== 1 ? 's' : ''} · {formatCurrency(group.estimated_total / 100)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onBillNow(group.client_id, false)}
                      disabled={billingClientIds.has(group.client_id)}
                      className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {billingClientIds.has(group.client_id) ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <FileText size={14} />
                      )}
                      Bill Now
                    </button>
                    <button
                      onClick={() => onBillNow(group.client_id, true)}
                      disabled={billingClientIds.has(group.client_id)}
                      className="flex-1 h-9 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[hsl(42_26%_87%)] disabled:opacity-50 transition-colors"
                    >
                      {billingClientIds.has(group.client_id) ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Bill & Email
                    </button>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid md:grid-cols-[1fr_80px_120px_140px] gap-4 items-center">
                  <span className="text-sm font-medium text-foreground">{group.client_name}</span>
                  <span className="text-sm text-muted-foreground">{group.total_sessions}</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(group.estimated_total / 100)}</span>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onBillNow(group.client_id, false)}
                      disabled={billingClientIds.has(group.client_id)}
                      className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {billingClientIds.has(group.client_id) ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <FileText size={13} />
                      )}
                      Bill Now
                    </button>
                    <button
                      onClick={() => onBillNow(group.client_id, true)}
                      disabled={billingClientIds.has(group.client_id)}
                      className="h-8 px-3 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] text-xs font-medium flex items-center gap-1.5 hover:bg-[hsl(42_26%_87%)] disabled:opacity-50 transition-colors"
                    >
                      {billingClientIds.has(group.client_id) ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                      Email
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-card border border-primary p-12">
          <Calendar size={36} className="mb-3 text-muted-foreground/60" />
          <p className="font-body text-sm font-medium text-foreground mb-1">No completed, uninvoiced sessions</p>
          <p className="text-xs text-muted-foreground max-w-sm text-center">
            Sessions must be marked as "completed" before they can be invoiced.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INVOICES LIST CONTENT COMPONENT
// ============================================================================

function InvoicesListContent({
  statusFilter,
  selectedIds,
  hasSelectedDrafts,
  hasSelectedIssued,
  loading,
  invoices,
  selectedInvoice,
  actionLoading,
  pdfLoading,
  pagination,
  onBulkIssue,
  onBulkMarkPaid,
  onBulkDownload,
  onClearSelection,
  onSelectAll,
  onSelectInvoice,
  onInvoiceClick,
  onIssue,
  onMarkPaid,
  onDownload,
  onPageChange,
}: {
  statusFilter: StatusFilter;
  selectedIds: Set<string>;
  hasSelectedDrafts: boolean;
  hasSelectedIssued: boolean;
  loading: boolean;
  invoices: InvoiceWithClient[];
  selectedInvoice: InvoiceWithClient | null;
  actionLoading: boolean;
  pdfLoading: string | null;
  pagination: PaginationInfo;
  onBulkIssue: () => void;
  onBulkMarkPaid: () => void;
  onBulkDownload: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onSelectInvoice: (id: string) => void;
  onInvoiceClick: (invoice: InvoiceWithClient) => void;
  onIssue: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onDownload: (invoiceNumber: string, id: string) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <>
      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-3">
          <span className="text-sm font-semibold text-primary">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            {hasSelectedDrafts && (
              <button
                onClick={onBulkIssue}
                disabled={actionLoading}
                className="h-8 px-3 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-sky-700 disabled:opacity-50"
              >
                <Send size={14} /> Issue Selected
              </button>
            )}
            {hasSelectedIssued && (
              <button
                onClick={onBulkMarkPaid}
                disabled={actionLoading}
                className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle size={14} /> Mark Paid
              </button>
            )}
            <button
              onClick={onBulkDownload}
              className="h-8 px-3 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-[hsl(42_26%_87%)]"
            >
              <Download size={14} /> Download PDFs
            </button>
            <button
              onClick={onClearSelection}
              className="h-8 px-3 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] text-xs font-semibold cursor-pointer hover:bg-[hsl(42_26%_87%)]"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted border border-primary animate-pulse" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-card border border-primary p-12">
          <EmptyInvoices statusFilter={statusFilter} />
        </div>
      ) : (
        <div className="rounded-xl border border-primary bg-card overflow-visible">
          {/* Desktop table header */}
          <div className="hidden lg:grid lg:grid-cols-[40px_120px_1fr_100px_100px_120px_100px_140px] gap-4 items-center px-4 py-3 border-b border-primary bg-mutedBg">
            <input
              type="checkbox"
              checked={selectedIds.size === invoices.length}
              onChange={onSelectAll}
              className="w-4 h-4 cursor-pointer accent-primary"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
          </div>

          {/* Invoice rows */}
          <motion.div
            className="divide-y divide-[var(--divide-color)]"
            style={{ ['--divide-color']: 'hsl(37 18% 89%)' } as React.CSSProperties}
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            {invoices.map(invoice => (
              <InvoiceRowComponent
                key={invoice.id}
                invoice={invoice}
                selected={selectedIds.has(invoice.id)}
                onSelect={() => onSelectInvoice(invoice.id)}
                onClick={() => onInvoiceClick(invoice)}
                onIssue={() => onIssue(invoice.id)}
                onMarkPaid={() => onMarkPaid(invoice.id)}
                onDownload={() => onDownload(invoice.invoice_number, invoice.id)}
                pdfLoading={pdfLoading === invoice.id}
                actionLoading={actionLoading}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-1.5">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="w-8 h-8 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] flex items-center justify-center text-[hsl(145_15%_35%)] disabled:opacity-50 hover:bg-[hsl(42_26%_87%)] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={cn(
                'w-8 h-8 rounded-lg border text-sm font-medium transition-colors',
                pagination.page === i + 1
                  ? 'bg-primary text-white border-primary'
                  : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)]'
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="w-8 h-8 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] flex items-center justify-center text-[hsl(145_15%_35%)] disabled:opacity-50 hover:bg-[hsl(42_26%_87%)] transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
