'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { staggerContainerFast } from '@/lib/motion/variants';
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertTriangle,
  Calendar,
  Plus,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { InvoiceWithClient, ClientSessionGroup as ClientSessionGroupType, UninvoicedSession } from '@/repositories/invoices.repository';
import { StatCard, StatCardGrid } from '@/components/shared/StatCard';
import { EmptyInvoices } from '@/components/botanical';
import {
  InvoiceRow as InvoiceRowComponent,
  InvoiceDetailPanel,
  BulkIssueModal,
  BulkMarkPaidModal,
  SessionSelectionBar,
  ClientSessionGroup as ClientSessionGroupComponent,
  GenerateDateRangeSelector,
} from '@/components/invoices';
import { DateRangePicker } from '@/components/ui/date-range-picker';

// ============================================================================
// TYPES
// ============================================================================

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOverdue(invoice: InvoiceWithClient): boolean {
  if (invoice.status !== 'issued') return false;
  return new Date(invoice.due_date) < new Date();
}

const TRAVEL_RATE_PER_KM = parseFloat(process.env.NEXT_PUBLIC_TRAVEL_RATE || '0.97');

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
  // --- Tab state ---
  const [activeTab, setActiveTab] = useState<'invoices' | 'generate'>('invoices');

  // --- Invoice list state ---
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithClient | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelClosing, setPanelClosing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // --- Bulk modal state ---
  const [showBulkIssueModal, setShowBulkIssueModal] = useState(false);
  const [showBulkMarkPaidModal, setShowBulkMarkPaidModal] = useState(false);

  // --- Generate section state ---
  const [sessionGroups, setSessionGroups] = useState<ClientSessionGroupType[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [travelKmMap, setTravelKmMap] = useState<Map<string, number | null>>(new Map());
  const [generating, setGenerating] = useState(false);

  const panelOpen = panelMode !== 'empty';

  // --- Computed values ---
  const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id));
  const hasSelectedDrafts = selectedInvoices.some(inv => inv.status === 'draft');
  const hasSelectedIssued = selectedInvoices.some(inv => inv.status === 'issued');

  const selectedClientCount = sessionGroups.filter(group =>
    group.sessions.some(s => selectedSessionIds.has(s.id))
  ).length;

  const selectedTotal = sessionGroups.reduce((total, group) => {
    const groupTotal = group.sessions
      .filter(s => selectedSessionIds.has(s.id))
      .reduce((sum, s) => sum + (s.rate * s.duration_hours), 0);
    return total + groupTotal;
  }, 0);

  const selectedTravelTotal = sessionGroups.reduce((total, group) => {
    return group.sessions
      .filter(s => selectedSessionIds.has(s.id))
      .reduce((sum, s) => {
        const km = travelKmMap.get(s.id) ?? s.travel_km ?? 0;
        return sum + (km * TRAVEL_RATE_PER_KM);
      }, total);
  }, 0);

  const totalUninvoicedSessions = sessionGroups.reduce((sum, g) => sum + g.sessions.length, 0);

  // --- Initialize dates ---
  useEffect(() => {
    const today = new Date();
    const defaultDue = addDays(today, 14);
    setDueDate(formatDateForInput(defaultDue));
    
    const thisMonday = getWeekStart(today);
    const fourWeeksAgoMonday = addDays(thisMonday, -28);
    setStartDate(formatDateForInput(fourWeeksAgoMonday));
    setEndDate(formatDateForInput(today));
  }, []);

  // --- Fetch data ---
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedIds(new Set());
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, pagination.page]);

  useEffect(() => {
    fetchSummaryStats();
  }, []);

  const fetchUninvoicedSessions = async (signal?: AbortSignal) => {
    if (!startDate || !endDate) return;

    setSessionsLoading(true);
    setSelectedSessionIds(new Set());
    setTravelKmMap(new Map());
    try {
      const res = await fetch(
        `/api/invoices/uninvoiced-sessions?startDate=${startDate}&endDate=${endDate}`,
        { signal, credentials: 'same-origin' }
      );
      const data = await res.json();
      if (data.success) {
        setSessionGroups(data.data);
        const validSessionIds = data.data.flatMap((group: ClientSessionGroupType) =>
          group.sessions.filter((s: UninvoicedSession) => s.rate > 0).map((s: UninvoicedSession) => s.id)
        );
        setSelectedSessionIds(new Set(validSessionIds));
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
    if (!startDate || !endDate) return;

    const controller = new AbortController();
    fetchUninvoicedSessions(controller.signal);
    return () => controller.abort();
  }, [startDate, endDate]);

  const fetchSummaryStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/invoices/summary');
      const data = await res.json();
      if (data.success) {
        setSummaryStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));
      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

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
        await fetchInvoices();
        await fetchSummaryStats();
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
    await fetchInvoices();
    await fetchSummaryStats();
  };

  const handleMarkPaid = async (invoiceId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await fetchInvoices();
        await fetchSummaryStats();
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
    await fetchInvoices();
    await fetchSummaryStats();
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
        await fetchInvoices();
        await fetchSummaryStats();
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

  // --- Generate section operations ---
  const toggleSession = (clientId: string, sessionId: string) => {
    const newSelected = new Set(selectedSessionIds);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessionIds(newSelected);
  };

  const toggleClient = (clientId: string) => {
    const group = sessionGroups.find(g => g.client_id === clientId);
    if (!group) return;

    const clientSessionIds = group.sessions.map(s => s.id);
    const clientHasAnySelected = clientSessionIds.some(id => selectedSessionIds.has(id));

    const newSelected = new Set(selectedSessionIds);
    if (clientHasAnySelected) {
      clientSessionIds.forEach(id => newSelected.delete(id));
    } else {
      group.sessions
        .filter(s => s.rate > 0)
        .forEach(s => newSelected.add(s.id));
    }
    setSelectedSessionIds(newSelected);
  };

  const selectAllSessions = () => {
    const allValidSessionIds = sessionGroups.flatMap(g =>
      g.sessions.filter(s => s.rate > 0).map(s => s.id)
    );
    setSelectedSessionIds(new Set(allValidSessionIds));
  };

  const deselectAllSessions = () => {
    setSelectedSessionIds(new Set());
  };

  const handleTravelKmChange = (sessionId: string, km: number | null) => {
    setTravelKmMap(prev => {
      const newMap = new Map(prev);
      newMap.set(sessionId, km);
      return newMap;
    });
  };

  const handleGenerate = async () => {
    if (selectedSessionIds.size === 0) {
      toast.error('Please select at least one session');
      return;
    }

    setGenerating(true);
    try {
      const clientsPayload = sessionGroups
        .map(g => ({
          client_id: g.client_id,
          sessions: g.sessions
            .filter(s => selectedSessionIds.has(s.id))
            .map(s => ({
              ...s,
              travel_km: travelKmMap.get(s.id) ?? s.travel_km,
            })),
        }))
        .filter(c => c.sessions.length > 0);

      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clients: clientsPayload,
          due_date: dueDate,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        for (const invoice of data.data) {
          await fetch(`/api/invoices/${invoice.id}/issue`, { method: 'POST' });
        }
        toast.success(`Generated and issued ${data.data.length} invoice(s)`);
        await fetchUninvoicedSessions();
        await fetchInvoices();
        await fetchSummaryStats();
      } else {
        toast.error(data.error?.message ?? 'Failed to generate invoices');
      }
    } catch (error) {
      console.error('Failed to generate invoices:', error);
      toast.error('Failed to generate invoices');
    } finally {
      setGenerating(false);
    }
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

          {/* Tab Navigation */}
          <div className="mb-6 flex items-center gap-0.5 p-1 rounded-lg bg-mutedBg border border-[hsl(34_22%_74%)]">
            <button
              onClick={() => setActiveTab('invoices')}
              className={cn(
                'h-9 px-4 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'invoices'
                  ? 'bg-card text-foreground font-semibold shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText size={15} />
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={cn(
                'h-9 px-4 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'generate'
                  ? 'bg-card text-foreground font-semibold shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Plus size={15} />
              Generate
              {totalUninvoicedSessions > 0 && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-bold',
                    activeTab === 'generate'
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-transparent text-primary border border-primary/50'
                  )}
                >
                  {totalUninvoicedSessions}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'generate' ? (
            <GenerateTabContent
              sessionGroups={sessionGroups}
              selectedSessionIds={selectedSessionIds}
              travelKmMap={travelKmMap}
              startDate={startDate}
              endDate={endDate}
              dueDate={dueDate}
              notes={notes}
              loading={sessionsLoading}
              generating={generating}
              selectedClientCount={selectedClientCount}
              selectedTotal={selectedTotal}
              selectedTravelTotal={selectedTravelTotal}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onDueDateChange={setDueDate}
              onNotesChange={setNotes}
              onToggleSession={toggleSession}
              onToggleClient={toggleClient}
              onSelectAll={selectAllSessions}
              onDeselectAll={deselectAllSessions}
              onTravelKmChange={handleTravelKmChange}
              onGenerate={handleGenerate}
              formatCurrency={formatCurrency}
            />
          ) : (
            <InvoicesTabContent
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
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
          )}
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
            'md:relative md:inset-auto md:z-auto md:max-h-none md:h-full md:rounded-none md:border-t-0',
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
// GENERATE TAB CONTENT COMPONENT
// ============================================================================

function GenerateTabContent({
  sessionGroups,
  selectedSessionIds,
  travelKmMap,
  startDate,
  endDate,
  dueDate,
  notes,
  loading,
  generating,
  selectedClientCount,
  selectedTotal,
  selectedTravelTotal,
  onStartDateChange,
  onEndDateChange,
  onDueDateChange,
  onNotesChange,
  onToggleSession,
  onToggleClient,
  onSelectAll,
  onDeselectAll,
  onTravelKmChange,
  onGenerate,
  formatCurrency,
}: {
  sessionGroups: ClientSessionGroupType[];
  selectedSessionIds: Set<string>;
  travelKmMap: Map<string, number | null>;
  startDate: string;
  endDate: string;
  dueDate: string;
  notes: string;
  loading: boolean;
  generating: boolean;
  selectedClientCount: number;
  selectedTotal: number;
  selectedTravelTotal: number;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
  onToggleSession: (clientId: string, sessionId: string) => void;
  onToggleClient: (clientId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onTravelKmChange: (sessionId: string, km: number | null) => void;
  onGenerate: () => void;
  formatCurrency: (amount: number, inCents?: boolean) => string;
}) {
  return (
    <div className="flex flex-col h-full pb-20">
      {/* Date range and settings row */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Session period</label>
          <GenerateDateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Due Date</label>
            <DateRangePicker
              startDate={dueDate}
              endDate={dueDate}
              onStartDateChange={onDueDateChange}
              onEndDateChange={onDueDateChange}
              mode="single"
              presets={true}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Invoice notes..."
              className="w-full h-9 px-3 rounded-lg border border-[hsl(34_22%_74%)] bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Session list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : sessionGroups.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {sessionGroups.map(group => (
            <ClientSessionGroupComponent
              key={group.client_id}
              group={group}
              selectedSessionIds={selectedSessionIds}
              travelKmMap={travelKmMap}
              onToggleSession={(sessionId) => onToggleSession(group.client_id, sessionId)}
              onToggleAll={() => onToggleClient(group.client_id)}
              onTravelKmChange={onTravelKmChange}
              formatCurrency={formatCurrency}
              travelRatePerKm={TRAVEL_RATE_PER_KM}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center empty-state">
          <Calendar size={36} className="mb-3 text-muted-foreground/60" />
          <p className="font-body text-sm font-medium text-foreground mb-1">No completed, uninvoiced sessions in this date range</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try expanding the date range above. Sessions must be marked as &quot;completed&quot; before they can be invoiced.
          </p>
        </div>
      )}

      {/* Sticky Selection Bar */}
      <SessionSelectionBar
        selectedCount={selectedSessionIds.size}
        clientCount={selectedClientCount}
        totalAmount={selectedTotal + selectedTravelTotal}
        travelKmTotal={sessionGroups.reduce((sum, g) => {
          return g.sessions
            .filter(s => selectedSessionIds.has(s.id))
            .reduce((s, session) => s + (travelKmMap.get(session.id) ?? session.travel_km ?? 0), sum);
        }, 0)}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onGenerate={onGenerate}
        generating={generating}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

// ============================================================================
// INVOICES TAB CONTENT COMPONENT
// ============================================================================

function InvoicesTabContent({
  statusFilter,
  setStatusFilter,
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
  setStatusFilter: (filter: StatusFilter) => void;
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
      {/* Status Tabs — sliding indicator via shared layoutId */}
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
        <div className="rounded-xl border border-primary bg-card overflow-hidden">
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
