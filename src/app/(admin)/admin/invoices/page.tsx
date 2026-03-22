'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertTriangle,
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  Leaf,
  Clock,
  User,
  Users,
  Settings,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { InvoiceWithClient, ClientSessionGroup, UninvoicedSession } from '@/repositories/invoices.repository';
import type { Client } from '@/db/schema/clients';
import { StatCard, StatCardGrid } from '@/components/shared/StatCard';
import { EmptyInvoices } from '@/components/botanical';
import { colors, shadows, animations } from '@/styles/botanical';
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
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // --- Generate section state ---
  const [sessionGroups, setSessionGroups] = useState<ClientSessionGroup[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [travelKmMap, setTravelKmMap] = useState<Map<string, number | null>>(new Map());
  const [generating, setGenerating] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

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

  const totalUninvoicedSessions = sessionGroups.reduce((sum, g) => sum + g.sessions.length, 0);

  // --- Initialize dates ---
  useEffect(() => {
    const today = new Date();
    const defaultDue = addDays(today, 14);
    setDueDate(formatDateForInput(defaultDue));
    
    // Look back 4 weeks to catch all uninvoiced sessions
    const thisMonday = getWeekStart(today);
    const fourWeeksAgoMonday = addDays(thisMonday, -28);
    // Include up to today (not just last Sunday)
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
    fetchClients();
    fetchUninvoicedSessions();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchUninvoicedSessions();
    }
  }, [startDate, endDate]);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?limit=100');
      const data = await res.json();
      if (data.success) setClients(data.data);
    } catch (e) {
      console.error(e);
    }
  };

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

  const fetchUninvoicedSessions = async () => {
    if (!startDate || !endDate) return;
    
    setSessionsLoading(true);
    setSelectedSessionIds(new Set());
    setTravelKmMap(new Map());
    try {
      const res = await fetch(
        `/api/invoices/uninvoiced-sessions?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (data.success) {
        setSessionGroups(data.data);
        const validSessionIds = data.data.flatMap((group: ClientSessionGroup) =>
          group.sessions.filter((s: UninvoicedSession) => s.rate > 0).map((s: UninvoicedSession) => s.id)
        );
        setSelectedSessionIds(new Set(validSessionIds));
      }
    } catch (error) {
      console.error('Failed to fetch uninvoiced sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  // --- Panel operations ---
  const openPanel = (mode: PanelMode) => {
    setPanelMode(mode);
    setTimeout(() => setPanelVisible(true), 10);
  };

  const closePanel = () => {
    setPanelVisible(false);
    setTimeout(() => {
      setSelectedInvoice(null);
      setPanelMode('empty');
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
        // Auto-issue the generated invoices
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Stats */}
          <StatCardGrid>
            <StatCard
              icon={<FileText size={18} />}
              label="Outstanding"
              value={summaryStats ? formatCurrency(summaryStats.outstanding.total, true) : '$0.00'}
              subtext={summaryStats?.outstanding.count ? `${summaryStats.outstanding.count} invoice${summaryStats.outstanding.count !== 1 ? 's' : ''}` : 'None'}
              color="#7895aa"
              bg="rgba(120,149,170,0.12)"
              borderColor="rgba(120,149,170,0.3)"
              isZero={!summaryStats?.outstanding?.count}
              onClick={() => setStatusFilter('issued')}
            />
            <StatCard
              icon={<AlertTriangle size={18} />}
              label="Overdue"
              value={summaryStats ? formatCurrency(summaryStats.overdue.total, true) : '$0.00'}
              subtext={summaryStats?.overdue.count ? `${summaryStats.overdue.count} invoice${summaryStats.overdue.count !== 1 ? 's' : ''}` : 'None'}
              color="#a08090"
              bg="rgba(160,128,144,0.12)"
              borderColor="rgba(160,128,144,0.3)"
              highlight={!!summaryStats?.overdue?.count}
              isZero={!summaryStats?.overdue?.count}
              onClick={() => setStatusFilter('overdue')}
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              label="Paid This Month"
              value={summaryStats ? formatCurrency(summaryStats.paid_this_month.total, true) : '$0.00'}
              subtext={summaryStats?.paid_this_month.count ? `${summaryStats.paid_this_month.count} invoice${summaryStats.paid_this_month.count !== 1 ? 's' : ''}` : 'None'}
              color="#82a091"
              bg="rgba(130,160,145,0.12)"
              borderColor="rgba(130,160,145,0.3)"
              isZero={!summaryStats?.paid_this_month?.count}
              onClick={() => setStatusFilter('paid')}
            />
            <StatCard
              icon={<Pencil size={18} />}
              label="Draft"
              value={summaryStats ? formatCurrency(summaryStats.draft.total, true) : '$0.00'}
              subtext={summaryStats?.draft.count ? `${summaryStats.draft.count} invoice${summaryStats.draft.count !== 1 ? 's' : ''}` : 'None'}
              color="#b69470"
              bg="rgba(182,148,112,0.12)"
              borderColor="rgba(182,148,112,0.3)"
              isZero={!summaryStats?.draft?.count}
              onClick={() => setStatusFilter('draft')}
            />
          </StatCardGrid>

          {/* Tab Navigation - Refined Tab Bar Style */}
          <div
            className="mb-6 flex items-center gap-0.5 p-1 rounded-lg"
            style={{
              background: colors.mutedBg,
              border: `1px solid ${colors.primary}`,
            }}
          >
            <button
              onClick={() => setActiveTab('invoices')}
              className="h-9 px-4 rounded-md text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
              style={{
                background: activeTab === 'invoices' ? colors.card : 'transparent',
                color: activeTab === 'invoices' ? colors.primaryBase : colors.secondary,
                boxShadow: activeTab === 'invoices' ? shadows.subtle : 'none',
                transition: animations.default,
              }}
            >
              <FileText size={15} />
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className="h-9 px-4 rounded-md text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
              style={{
                background: activeTab === 'generate' ? colors.card : 'transparent',
                color: activeTab === 'generate' ? colors.primaryBase : colors.secondary,
                boxShadow: activeTab === 'generate' ? shadows.subtle : 'none',
                transition: animations.default,
              }}
            >
              <Plus size={15} />
              Generate
              {totalUninvoicedSessions > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    background: activeTab === 'generate'
                      ? colors.primaryBg
                      : 'transparent',
                    color: colors.primaryBase,
                    border: `1px solid ${colors.primary}`,
                  }}
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
              onBulkIssue={handleBulkIssue}
              onBulkMarkPaid={handleBulkMarkPaid}
              onBulkDownload={handleBulkDownload}
              onClearSelection={() => setSelectedIds(new Set())}
              onSelectAll={handleSelectAll}
              onSelectInvoice={handleSelectInvoice}
              onInvoiceClick={handleInvoiceClick}
              onIssue={handleIssue}
              onMarkPaid={handleMarkPaid}
              onDownload={handleDownloadPdf}
              onPageChange={handlePageChange}
              openPanel={openPanel}
            />
          )}
        </div>

        {/* DETAIL PANEL */}
        <aside
          className={cn(
            'relative flex flex-col overflow-hidden transition-all duration-[280ms] ease-out',
            panelMode === 'empty' ? 'w-0 border-none' : 'w-[380px] flex-shrink-0 bg-warm-white border-l border-primary'
          )}
        >
          <div
            className={cn(
              'h-full w-[380px] flex flex-col transition-all duration-[240ms] ease-out',
              panelVisible ? 'translate-x-0 opacity-100' : 'translate-x-[20px] opacity-0'
            )}
          >
            {panelMode === 'view' && selectedInvoice && (
              <ViewPanel
                invoice={selectedInvoice}
                onClose={closePanel}
                onCancel={() => handleCancel(selectedInvoice.id)}
                onIssue={() => handleIssue(selectedInvoice.id)}
                onMarkPaid={() => handleMarkPaid(selectedInvoice.id)}
                onDownload={() => handleDownloadPdf(selectedInvoice.invoice_number, selectedInvoice.id)}
                actionLoading={actionLoading}
                pdfLoading={pdfLoading === selectedInvoice.id}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
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
  sessionGroups: ClientSessionGroup[];
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
  const totalSessions = sessionGroups.reduce((sum, g) => sum + g.sessions.length, 0);

  return (
    <div className="space-y-4">
      {/* Date range and settings row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Date Range Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date Range</label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => onDueDateChange(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-primary bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Invoice notes..."
              className="w-full h-9 px-3 rounded-lg border border-primary bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
        <>
          <div className="flex items-center justify-between py-2 border-t border-primary/30">
            <div className="flex gap-2">
              <button onClick={onSelectAll} className="h-7 px-3 rounded-md border border-primary bg-transparent text-xs font-medium hover:bg-muted transition-colors">
                Select All
              </button>
              <button onClick={onDeselectAll} className="h-7 px-3 rounded-md border border-primary bg-transparent text-xs font-medium hover:bg-muted transition-colors">
                Deselect All
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedSessionIds.size} session{selectedSessionIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {sessionGroups.map(group => {
              const clientSessionsSelected = group.sessions.filter(s => selectedSessionIds.has(s.id)).length;
              const clientHasSelection = clientSessionsSelected > 0;
              const hasZeroRateSessions = group.sessions.some(s => s.rate === 0);

              return (
                <div
                  key={group.client_id}
                  className="rounded-lg border border-primary bg-muted/20 p-3"
                >
                  {/* Client header */}
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-primary/40">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={clientHasSelection}
                        onChange={() => onToggleClient(group.client_id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        {group.is_group ? (
                          <Users size={14} className="text-primary/70" />
                        ) : (
                          <User size={14} className="text-primary/70" />
                        )}
                        <span className="font-semibold text-sm">{group.client_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {group.total_sessions} session{group.total_sessions !== 1 ? 's' : ''} • {group.total_hours.toFixed(1)}h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasZeroRateSessions && (
                        <span className="text-xs text-amber-600 font-medium">⚠ $0 rate</span>
                      )}
                      <span className="font-semibold text-sm">{formatCurrency(group.estimated_total, true)}</span>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-1">
                    {group.sessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-background/50">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSessionIds.has(session.id)}
                            onChange={() => onToggleSession(group.client_id, session.id)}
                            disabled={session.rate === 0}
                            className="w-3.5 h-3.5 accent-primary cursor-pointer disabled:opacity-40"
                          />
                          <span className={session.rate === 0 ? 'text-muted-foreground' : ''}>
                            {new Date(session.starts_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-xs text-muted-foreground">{session.duration_hours.toFixed(1)}h</span>
                          {session.rate === 0 && (
                            <span className="text-xs text-amber-600 font-medium">$0/hr</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={travelKmMap.get(session.id) ?? session.travel_km ?? ''}
                              onChange={e => {
                                const val = e.target.value;
                                onTravelKmChange(session.id, val === '' ? null : parseFloat(val));
                              }}
                              placeholder="km"
                              className="w-12 h-6 px-1.5 text-xs rounded border border-primary bg-background text-right"
                            />
                            <span>km</span>
                          </div>
                          <span className="text-xs font-medium w-16 text-right">
                            {formatCurrency(session.duration_hours * session.rate, true)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generate button */}
          <div className="flex items-center justify-between pt-3 border-t border-primary/30">
            <div className="text-sm text-muted-foreground">
              {selectedClientCount} client{selectedClientCount !== 1 ? 's' : ''} • Total: {formatCurrency(selectedTotal, true)}
            </div>
            <button
              onClick={onGenerate}
              disabled={generating || selectedSessionIds.size === 0}
              className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Generate & Issue {selectedClientCount} Invoice{selectedClientCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Calendar size={32} className="mx-auto mb-2 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No completed, uninvoiced sessions in this date range</p>
          <p className="text-xs text-muted-foreground/70">
            Try expanding the date range above. Sessions must be marked as "completed" before they can be invoiced.
          </p>
        </div>
      )}
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
  openPanel,
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
  openPanel: (mode: PanelMode) => void;
}) {
  return (
    <>
      {/* Status Tabs - Refined Tab Bar Style */}
      <div
        className="mb-5 flex items-center gap-0.5 p-1 rounded-lg"
        style={{
          background: colors.mutedBg,
          border: `1px solid ${colors.primary}`,
        }}
      >
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className="h-8 px-3.5 rounded-md text-sm transition-all cursor-pointer"
            style={{
              background: statusFilter === tab.value ? colors.card : 'transparent',
              color: statusFilter === tab.value ? colors.primaryBase : colors.muted,
              fontWeight: statusFilter === tab.value ? 600 : 500,
              boxShadow: statusFilter === tab.value ? shadows.subtle : 'none',
              transition: animations.default,
            }}
          >
            {tab.label}
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
              <button onClick={onBulkIssue} disabled={actionLoading} className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-50">
                <Send size={14} /> Issue Selected
              </button>
            )}
            {hasSelectedIssued && (
              <button onClick={onBulkMarkPaid} disabled={actionLoading} className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-50">
                <CheckCircle size={14} /> Mark Paid
              </button>
            )}
            <button onClick={onBulkDownload} className="h-8 px-3 rounded-lg border border-primary bg-transparent text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-muted">
              <Download size={14} /> Download PDFs
            </button>
            <button
              onClick={onClearSelection}
              className="h-8 px-3 rounded-lg border border-primary bg-transparent text-xs font-semibold cursor-pointer hover:bg-muted"
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
          <div className="divide-y divide-[var(--divide-color)]" style={{ ['--divide-color']: 'hsl(37 18% 89%)' } as React.CSSProperties}>
            {invoices.map(invoice => {
              const overdue = isOverdue(invoice);
              return (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  overdue={overdue}
                  selected={selectedIds.has(invoice.id)}
                  onSelect={() => onSelectInvoice(invoice.id)}
                  onClick={() => onInvoiceClick(invoice)}
                  onIssue={() => onIssue(invoice.id)}
                  onMarkPaid={() => onMarkPaid(invoice.id)}
                  onDownload={() => onDownload(invoice.invoice_number, invoice.id)}
                  pdfLoading={pdfLoading === invoice.id}
                  actionLoading={actionLoading}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-1.5">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="w-8 h-8 rounded-lg border border-primary bg-transparent flex items-center justify-center disabled:opacity-50 hover:bg-muted transition-colors"
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
                  : 'bg-transparent border-primary hover:bg-muted'
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="w-8 h-8 rounded-lg border border-primary bg-transparent flex items-center justify-center disabled:opacity-50 hover:bg-muted transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}



// ============================================================================
// INVOICE ROW COMPONENT
// ============================================================================

function InvoiceRow({
  invoice,
  overdue,
  selected,
  onSelect,
  onClick,
  onIssue,
  onMarkPaid,
  onDownload,
  pdfLoading,
  actionLoading,
}: {
  invoice: InvoiceWithClient;
  overdue: boolean;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onIssue: () => void;
  onMarkPaid: () => void;
  onDownload: () => void;
  pdfLoading: boolean;
  actionLoading: boolean;
}) {
  const [showOverflow, setShowOverflow] = useState(false);

  const statusColor = overdue
    ? { bg: 'bg-red-500/15', text: 'text-red-900', border: 'border-red-500/30' }
    : invoice.status === 'paid'
      ? { bg: 'bg-green-600/15', text: 'text-green-900', border: 'border-green-600/30' }
      : invoice.status === 'issued'
        ? { bg: 'bg-blue-400/15', text: 'text-blue-900', border: 'border-blue-400/30' }
        : invoice.status === 'draft'
          ? { bg: 'bg-amber-600/15', text: 'text-amber-900', border: 'border-amber-600/30' }
          : { bg: 'bg-purple-400/15', text: 'text-purple-900', border: 'border-purple-400/30' };

  return (
    <div
      className="grid grid-cols-[40px_120px_1fr_100px_100px_120px_100px_140px] gap-4 px-4 py-[0.85rem] border-b border-primary/80 items-center cursor-pointer transition-all hover:bg-primary/5"
      style={{ background: selected ? 'hsl(130 13% 50% / 0.05)' : undefined }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={e => { e.stopPropagation(); onSelect(); }}
        onClick={e => e.stopPropagation()}
        className="w-4 h-4 cursor-pointer accent-primary"
      />
      <span onClick={onClick} className="text-sm font-semibold text-foreground cursor-pointer">
        {invoice.invoice_number}
      </span>
      <span onClick={onClick} className="text-sm text-muted-foreground cursor-pointer truncate">
        {invoice.client.name}
      </span>
      <span onClick={onClick} className="text-[13px] text-muted-foreground cursor-pointer">
        {formatDate(invoice.invoice_date)}
      </span>
      <span
        onClick={onClick}
        className={cn(
          'text-[13px] cursor-pointer',
          overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'
        )}
      >
        {formatDate(invoice.due_date)}
      </span>
      <span onClick={onClick} className="text-sm font-semibold text-foreground cursor-pointer">
        {formatCurrency(invoice.total)}
      </span>
      <span onClick={onClick}>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[11.5px] font-semibold py-[3px] px-2 rounded-full capitalize border',
            statusColor.bg,
            statusColor.text,
            statusColor.border
          )}
        >
          {overdue && <AlertTriangle size={11} />}
          {overdue ? 'overdue' : invoice.status}
        </span>
      </span>
      <div className="flex items-center justify-end gap-2 relative">
        {invoice.status === 'draft' && (
          <button
            onClick={e => { e.stopPropagation(); onIssue(); }}
            disabled={actionLoading}
            className="h-7 px-3 rounded-md bg-sky-600 text-white text-[11.5px] font-semibold flex items-center gap-1 hover:bg-sky-700 disabled:opacity-50"
          >
            <Send size={13} /> Issue
          </button>
        )}
        {invoice.status === 'issued' && (
          <button
            onClick={e => { e.stopPropagation(); onMarkPaid(); }}
            disabled={actionLoading}
            className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50"
            title="Mark as Paid"
          >
            <CheckCircle size={13} />
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDownload(); }}
          disabled={!!pdfLoading}
          className="w-7 h-7 rounded-md border border-primary bg-transparent flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50"
          title="Download PDF"
        >
          {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); setShowOverflow(!showOverflow); }}
          className="w-7 h-7 rounded-md border border-primary bg-transparent flex items-center justify-center text-muted-foreground hover:bg-muted"
        >
          <MoreHorizontal size={14} />
        </button>

        {showOverflow && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowOverflow(false)} />
            <div className="absolute right-0 top-full mt-1 bg-card border border-primary rounded-lg shadow-lg z-20 min-w-[140px] overflow-hidden">
              <button
                onClick={e => { e.stopPropagation(); setShowOverflow(false); onClick(); }}
                className="w-full py-2.5 px-3.5 bg-transparent text-[12.5px] text-foreground/80 text-left flex items-center gap-1.5 hover:bg-muted"
              >
                <Eye size={13} /> View Details
              </button>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <button
                  onClick={e => { e.stopPropagation(); setShowOverflow(false); }}
                  className="w-full py-2.5 px-3.5 bg-transparent text-red-600 text-left flex items-center gap-1.5 hover:bg-muted"
                >
                  <XCircle size={13} /> Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VIEW PANEL
// ============================================================================

function ViewPanel({
  invoice,
  onClose,
  onCancel,
  onIssue,
  onMarkPaid,
  onDownload,
  actionLoading,
  pdfLoading,
}: {
  invoice: InvoiceWithClient;
  onClose: () => void;
  onCancel: () => void;
  onIssue: () => void;
  onMarkPaid: () => void;
  onDownload: () => void;
  actionLoading: boolean;
  pdfLoading: boolean;
}) {
  const overdue = isOverdue(invoice);
  const canCancel = invoice.status !== 'paid' && invoice.status !== 'cancelled';

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-primary flex-shrink-0">
        <h2 className="font-heading text-base font-semibold text-foreground m-0">Invoice Details</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg border border-primary bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Invoice header card */}
        <div className="mb-5 rounded-lg bg-muted border border-primary p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-heading text-lg font-bold text-foreground">
              {invoice.invoice_number}
            </span>
            <StatusBadge status={invoice.status} overdue={overdue} />
          </div>
          <div className="mb-2 text-sm font-semibold text-foreground">
            {invoice.client.name}
          </div>
          <div className="font-heading text-2xl font-bold text-foreground">
            {formatCurrency(invoice.total)}
          </div>
        </div>

        {/* Details */}
        <div className="mb-5 flex flex-col gap-3">
          <InfoRow label="Invoice Date" value={formatDate(invoice.invoice_date)} />
          <InfoRow label="Due Date" value={formatDate(invoice.due_date)} highlight={!!overdue} />
          {invoice.issued_at && <InfoRow label="Issued" value={formatDate(invoice.issued_at)} />}
          {invoice.paid_at && <InfoRow label="Paid" value={formatDate(invoice.paid_at)} />}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {invoice.status === 'draft' && (
            <>
              <button onClick={onIssue} disabled={actionLoading} className="h-9 rounded-lg bg-sky-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-sky-700 disabled:opacity-50">
                <Send size={14} /> {actionLoading ? 'Issuing…' : 'Issue Invoice'}
              </button>
              <div className="flex gap-2">
                <button onClick={onDownload} disabled={!!pdfLoading} className="h-9 px-3.5 rounded-lg border border-primary bg-transparent text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50 flex-1">
                  {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download
                </button>
                <button onClick={onCancel} className="h-9 px-3.5 rounded-lg border border-red-500/30 bg-transparent text-red-600 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted flex-1">
                  <XCircle size={13} /> Cancel
                </button>
              </div>
            </>
          )}
          {invoice.status === 'issued' && (
            <>
              <button onClick={onMarkPaid} disabled={actionLoading} className="h-9 rounded-lg bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-emerald-700 disabled:opacity-50">
                <CheckCircle size={14} /> {actionLoading ? 'Saving…' : 'Mark as Paid'}
              </button>
              <div className="flex gap-2">
                <button onClick={onDownload} disabled={!!pdfLoading} className="h-9 px-3.5 rounded-lg border border-primary bg-transparent text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50 flex-1">
                  {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download
                </button>
                {canCancel && (
                  <button onClick={onCancel} className="h-9 px-3.5 rounded-lg border border-red-500/30 bg-transparent text-red-600 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted flex-1">
                    <XCircle size={13} /> Cancel
                  </button>
                )}
              </div>
            </>
          )}
          {(invoice.status === 'paid' || invoice.status === 'cancelled') && (
            <button onClick={onDownload} disabled={!!pdfLoading} className="h-9 px-3.5 rounded-lg border border-primary bg-transparent text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50">
              {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download PDF
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        {label}
      </span>
      <span className={cn(
        'text-sm',
        highlight ? 'text-red-600 font-semibold' : 'text-foreground font-medium'
      )}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status, overdue }: { status: string; overdue: boolean }) {
  const color = overdue
    ? { bg: 'bg-red-500/15', text: 'text-red-900', border: 'border-red-500/30' }
    : status === 'paid'
      ? { bg: 'bg-green-600/15', text: 'text-green-900', border: 'border-green-600/30' }
      : status === 'issued'
        ? { bg: 'bg-blue-400/15', text: 'text-blue-900', border: 'border-blue-400/30' }
        : status === 'draft'
          ? { bg: 'bg-amber-600/15', text: 'text-amber-900', border: 'border-amber-600/30' }
          : { bg: 'bg-purple-400/15', text: 'text-purple-900', border: 'border-purple-400/30' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11.5px] font-semibold py-[3px] px-2 rounded-full capitalize border',
        color.bg,
        color.text,
        color.border
      )}
    >
      {overdue && <AlertTriangle size={11} />}
      {overdue ? 'overdue' : status}
    </span>
  );
}