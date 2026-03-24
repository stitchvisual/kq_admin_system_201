'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Plus, Search, Leaf, Mail, Phone, UserCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useMobilePanel } from '@/context/MobilePanelContext';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { RateCodeStatus } from './_components/RateCodeStatus';
import { ClientDetailPanel } from './_components/ClientDetailPanel';
import { ClientFormPanel } from './_components/ClientFormPanel';
import { ClientDeletePanel } from './_components/ClientDeletePanel';
import { SkeletonClientDetail } from '@/components/ui/enhanced-skeleton';
import type { Client } from '@/db/schema/clients';
import type { NdisPricing } from '@/db/schema/ndis_pricing';
import { colors } from '@/styles/botanical';
import { EmptyClients } from '@/components/botanical/EmptyState';
import { DataTable, DataTableHeaderLabel } from '@/components/botanical/DataTable';
import { cn } from '@/lib/utils';

type PanelMode = 'empty' | 'view' | 'new' | 'edit' | 'deleteConfirm';

// Fallback NDIS pricing codes in case database isn't populated
const fallbackPricingCodes: NdisPricing[] = [
  {
    id: 'fallback-1',
    category: 'Core Support',
    support_item_code: '01_010_0107_1_1',
    support_item_name: 'Assistance with Self-Care Activities - Weekday',
    unit: 'Hour',
    national_price: '65.20',
    remote_price: '91.28',
    very_remote_price: '97.84',
    created_at: new Date(),
  },
  {
    id: 'fallback-2',
    category: 'Core Support',
    support_item_code: '04_104_0125_6_1',
    support_item_name: 'Access Community Social and Rec Activ - Weekday',
    unit: 'Hour',
    national_price: '70.23',
    remote_price: '98.32',
    very_remote_price: '105.35',
    created_at: new Date(),
  },
  {
    id: 'fallback-3',
    category: 'Core Support',
    support_item_code: '04_105_0125_6_1',
    support_item_name: 'Access Community Social and Rec Activ - Saturday',
    unit: 'Hour',
    national_price: '98.83',
    remote_price: '138.36',
    very_remote_price: '148.25',
    created_at: new Date(),
  },
  {
    id: 'fallback-4',
    category: 'Core Support',
    support_item_code: '04_106_0125_6_1',
    support_item_name: 'Access Community Social and Rec Activ - Sunday',
    unit: 'Hour',
    national_price: '127.43',
    remote_price: '178.40',
    very_remote_price: '191.15',
    created_at: new Date(),
  },
  {
    id: 'fallback-5',
    category: 'Provider Travel',
    support_item_code: '04_799_0104_6_1',
    support_item_name: 'Provider travel - non-labour costs',
    unit: 'Each',
    national_price: '1.00',
    remote_price: null,
    very_remote_price: null,
    created_at: new Date(),
  },
  {
    id: 'fallback-6',
    category: 'Transport',
    support_item_code: '04_590_0125_6_1',
    support_item_name: 'Activity Based Transport',
    unit: 'Each',
    national_price: '1.00',
    remote_price: null,
    very_remote_price: null,
    created_at: new Date(),
  },
  {
    id: 'fallback-7',
    category: 'Capacity Building',
    support_item_code: '09_009_0117_6_3',
    support_item_name: 'Skills Development and Training',
    unit: 'Hour',
    national_price: '80.06',
    remote_price: '112.08',
    very_remote_price: '120.09',
    created_at: new Date(),
  },
];

async function fetchClientsPage(
  url: string,
): Promise<{ clients: Client[]; totalPages: number }> {
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message ?? 'Failed to load clients');
  }
  return {
    clients: data.data,
    totalPages: data.pagination?.totalPages ?? 1,
  };
}

async function fetchNdisPricingForClients(url: string): Promise<NdisPricing[]> {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.data && data.data.length > 0) {
      return data.data.filter((code: NdisPricing) => code.category !== 'Transport');
    }
  } catch {
    /* use fallback below */
  }
  return fallbackPricingCodes.filter((code: NdisPricing) => code.category !== 'Transport');
}

export default function ClientsPage() {
  const { setOpen: setMobilePanelOpen } = useMobilePanel();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelClosing, setPanelClosing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetail, setClientDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [relatedCounts, setRelatedCounts] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ndis_number: '',
    address: '',
    suburb: '',
    weekday_code: '',
    saturday_code: '',
    sunday_code: '',
  });

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const clientsKey = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    return `/api/clients?${params}`;
  }, [page, debouncedSearch]);

  const {
    data: clientsPageData,
    isLoading: loading,
    mutate: mutateClients,
  } = useSWR(clientsKey, fetchClientsPage, { revalidateOnFocus: false });

  const clients = clientsPageData?.clients ?? [];
  const totalPages = clientsPageData?.totalPages ?? 1;

  const { data: pricingCodes = [], isLoading: loadingPricingCodes } = useSWR(
    '/api/ndis-pricing',
    fetchNdisPricingForClients,
    { revalidateOnFocus: false },
  );

  const openPanel = (mode: PanelMode) => {
    setPanelClosing(false);
    setPanelMode(mode);
    setTimeout(() => setPanelVisible(true), 75);
  };

  const closePanel = () => {
    setPanelVisible(false);
    setPanelClosing(true);
    setTimeout(() => {
      setSelectedClient(null);
      setClientDetail(null);
      setRelatedCounts(null);
      setPanelMode('empty');
      setPanelClosing(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        ndis_number: '',
        address: '',
        suburb: '',
        weekday_code: '',
        saturday_code: '',
        sunday_code: '',
      });
    }, 300);
  };

  const handleClientClick = async (client: Client) => {
    // Immediately set client and open panel with skeleton for instant feedback
    setSelectedClient(client);
    setClientDetail(null); // Clear previous detail to show skeleton
    setLoadingDetail(true);
    openPanel('view'); // Open panel immediately - skeleton will show while loading
    
    try {
      const res = await fetch(`/api/clients/${client.id}/detail`);
      const data = await res.json();
      if (data.success) {
        setClientDetail(data.data);
      } else {
        toast.error('Failed to load client details');
        closePanel(); // Close panel on error
      }
    } catch (error) {
      console.error('Failed to fetch client detail:', error);
      toast.error('Failed to load client details');
      closePanel(); // Close panel on error
    } finally {
      setLoadingDetail(false);
    }
  };

  const openAddClient = () => {
    setSelectedClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      ndis_number: '',
      address: '',
      suburb: '',
      weekday_code: '',
      saturday_code: '',
      sunday_code: '',
    });
    openPanel('new');
  };

  const openEditClient = () => {
    if (!selectedClient) return;
    setFormData({
      name: selectedClient.name,
      email: selectedClient.email,
      phone: selectedClient.phone ?? '',
      ndis_number: selectedClient.ndis_number ?? '',
      address: selectedClient.address ?? '',
      suburb: selectedClient.suburb ?? '',
      weekday_code: selectedClient.weekday_code ?? '',
      saturday_code: selectedClient.saturday_code ?? '',
      sunday_code: selectedClient.sunday_code ?? '',
    });
    setPanelMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = panelMode === 'edit' && selectedClient
        ? `/api/clients/${selectedClient.id}`
        : '/api/clients';
      const method = panelMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(panelMode === 'edit' ? 'Client updated' : 'Client created');
        await mutateClients();
        if (panelMode === 'edit') {
          const client = selectedClient;
          if (client) {
            await handleClientClick(client);
          }
        } else {
          closePanel();
        }
      } else {
        toast.error(data.error?.message ?? 'Failed to save client');
      }
    } catch (error) {
      console.error('Failed to save client:', error);
      toast.error('Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = async () => {
    if (!selectedClient) return;
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}/related-counts`);
      const data = await res.json();
      if (data.success) {
        setRelatedCounts(data.data);
        setPanelMode('deleteConfirm');
      }
    } catch (error) {
      console.error('Failed to fetch related counts:', error);
      toast.error('Failed to load client data');
    }
  };

  const panelOpen = panelMode !== 'empty';

  // Raise main above bottom nav when panel is open on mobile
  useEffect(() => {
    setMobilePanelOpen(panelOpen);
    return () => setMobilePanelOpen(false);
  }, [panelOpen, setMobilePanelOpen]);

  const handleDelete = async () => {
    if (!selectedClient) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Client deleted');
        await mutateClients();
        closePanel();
      } else {
        toast.error(data.error?.message ?? 'Failed to delete client');
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background font-body">
      {/* HEADER */}
      <PageHeader
        icon={<Leaf size={16} className="text-primary" />}
        title="Clients"
        subtitle="Manage your client information"
        action={
          clients.length > 0 ? (
            <Button onClick={openAddClient} size="sm" className="gap-1.5">
              <Plus size={14} />
              Add Client
            </Button>
          ) : undefined
        }
      />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* MAIN CONTENT */}
        <div
          className={cn(
            'flex-1 min-w-0 overflow-auto p-6 md:p-8',
            panelOpen && 'max-md:overflow-hidden'
          )}
        >
          
          {/* Search */}
          <div className="mb-8 max-w-full md:max-w-[500px] grid grid-cols-[auto_1fr] items-center gap-2 h-[38px] px-3 rounded-lg border border-primary bg-card font-body focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0 transition-shadow duration-150">
            <Search size={16} className="shrink-0" style={{ color: colors.faint }} />
            <input
              type="text"
              placeholder="Search clients by name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full min-w-0 h-full bg-transparent border-0 py-0 pl-0 pr-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Client list */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 md:p-20 bg-card rounded-xl border border-primary">
              <EmptyClients onAddClient={openAddClient} />
            </div>
          ) : (
            <div className="w-full min-w-0">
            <DataTable className="w-full min-w-0">
              {/* Desktop table header - Invoice style */}
              <div className="hidden md:grid md:grid-cols-[1fr_200px_160px_120px_100px] md:w-full gap-5 px-5 py-4 border-b border-primary/80 items-center bg-mutedBg">
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Name</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Email</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Phone</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>NDIS #</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Rate Codes</DataTableHeaderLabel>
                </div>
              </div>

              {/* Client rows - Invoice style */}
              <div className="divide-y divide-[var(--divide-color)] w-full min-w-0" style={{ ['--divide-color']: colors.subtle } as React.CSSProperties}>
                {clients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => handleClientClick(client)}
                    className="client-table-row grid w-full min-w-0 grid-cols-[1fr_200px_160px_120px_100px] gap-6 px-5 py-4 border-b border-primary/80 items-center cursor-pointer transition-all duration-120 hover:bg-primary/3"
                  >
                    {/* Mobile card layout */}
                    <div className="md:hidden flex flex-col gap-2 mb-3">
                      <div className="font-medium text-foreground text-base">{client.name}</div>
                      <div className="flex flex-col gap-2 text-sm text-secondary">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          {client.phone || '-'}
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} />
                          {client.ndis_number || '-'}
                        </div>
                      </div>
                      <div className="mt-1">
                        <RateCodeStatus
                          weekday={client.weekday_code}
                          saturday={client.saturday_code}
                          sunday={client.sunday_code}
                        />
                      </div>
                    </div>

                    {/* Desktop: Invoice style row */}
                    <div className="hidden md:contents">
                      <div className="min-w-0 overflow-hidden">
                        <div className="truncate font-medium text-foreground text-[13px]">{client.name}</div>
                      </div>
                      <div className="min-w-0 overflow-hidden flex items-center gap-1.5 text-secondary text-[13px]">
                        <Mail size={13} className="shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="min-w-0 overflow-hidden flex items-center gap-1.5 text-secondary text-[13px]">
                        <Phone size={13} className="shrink-0" />
                        <span className="truncate">{client.phone || '-'}</span>
                      </div>
                      <div className="min-w-0 overflow-hidden flex items-center gap-1.5 text-secondary text-[13px]">
                        <UserCheck size={13} className="shrink-0" />
                        <span className="truncate">{client.ndis_number || '-'}</span>
                      </div>
                      <div className="min-w-0 overflow-hidden flex items-center">
                        <RateCodeStatus
                          weekday={client.weekday_code}
                          saturday={client.saturday_code}
                          sunday={client.sunday_code}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DataTable>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-1.5">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] cursor-pointer flex items-center justify-center text-[hsl(145_15%_35%)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(42_26%_87%)]"
              >
                <ChevronLeft size={14} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg border text-sm font-medium cursor-pointer flex items-center justify-center font-body transition-all duration-150 ${
                    page === i + 1
                      ? 'bg-primary text-white border-primary'
                      : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] cursor-pointer flex items-center justify-center text-[hsl(145_15%_35%)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(42_26%_87%)]"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Client panel — mobile backdrop */}
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

        {/* Client panel — desktop column + mobile bottom sheet */}
        <aside
          className={cn(
            'relative flex flex-col overflow-hidden bg-card flex-shrink-0',
            'fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-[20px] rounded-b-none border-t border-primary',
            'max-md:bg-[hsl(var(--color-card))] max-md:shadow-soft-lg max-md:pb-[env(safe-area-inset-bottom)]',
            'md:border-t-0 md:border-l md:border-primary',
            'translate-y-full',
            'transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'md:relative md:inset-auto md:z-auto md:max-h-none md:h-full md:rounded-none',
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
            {panelMode === 'view' && selectedClient && (
              loadingDetail || !clientDetail ? (
                <SkeletonClientDetail />
              ) : (
              <ClientDetailPanel
                client={selectedClient}
                rateCodes={clientDetail.rate_codes}
                recentAppointments={clientDetail.recent_appointments}
                invoices={clientDetail.invoices}
                outstandingBalance={clientDetail.outstanding_balance}
                onClose={closePanel}
                onEdit={openEditClient}
                onDelete={openDeleteConfirm}
              />
              )
            )}
            {(panelMode === 'new' || panelMode === 'edit') && (
              <ClientFormPanel
                mode={panelMode}
                client={selectedClient ?? undefined}
                pricingCodes={pricingCodes}
                loadingPricingCodes={loadingPricingCodes}
                onClose={closePanel}
                onSubmit={handleSubmit}
                saving={saving}
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {panelMode === 'deleteConfirm' && selectedClient && relatedCounts && (
              <ClientDeletePanel
                client={selectedClient}
                relatedCounts={relatedCounts}
                onClose={closePanel}
                onBack={() => setPanelMode('view')}
                onDelete={handleDelete}
                deleting={deleting}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
