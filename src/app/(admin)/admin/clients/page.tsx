'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Leaf, Mail, Phone, UserCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { RateCodeStatus } from './_components/RateCodeStatus';
import { ClientDetailPanel } from './_components/ClientDetailPanel';
import { ClientFormPanel } from './_components/ClientFormPanel';
import { ClientDeletePanel } from './_components/ClientDeletePanel';
import type { Client } from '@/db/schema/clients';
import type { NdisPricing } from '@/db/schema/ndis_pricing';
import { colors, animations } from '@/styles/botanical';
import { EmptyClients, DataTable, DataTableHeader, DataTableHeaderLabel, DataTableBody, DataTableRow, DataTableHeaderGrid, DataTableRowGrid } from '@/components/botanical';

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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pricingCodes, setPricingCodes] = useState<NdisPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPricingCodes, setLoadingPricingCodes] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [panelVisible, setPanelVisible] = useState(false);
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
    fetchClients();
  }, [search, page]);

  useEffect(() => {
    fetchPricingCodes();
  }, []);

  const fetchPricingCodes = async () => {
    setLoadingPricingCodes(true);
    try {
      const res = await fetch('/api/ndis-pricing');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        // Filter out Transport codes
        const filteredCodes = data.data.filter(
          (code: NdisPricing) => code.category !== 'Transport',
        );
        setPricingCodes(filteredCodes);
      } else {
        // Use fallback data if database is empty or API fails
        console.log('Using fallback NDIS pricing codes');
        const filteredFallback = fallbackPricingCodes.filter(
          (code: NdisPricing) => code.category !== 'Transport',
        );
        setPricingCodes(filteredFallback);
      }
    } catch (error) {
      console.error('Failed to fetch pricing codes, using fallback:', error);
      // Use fallback data on error
      const filteredFallback = fallbackPricingCodes.filter(
        (code: NdisPricing) => code.category !== 'Transport',
      );
      setPricingCodes(filteredFallback);
    } finally {
      setLoadingPricingCodes(false);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', page.toString());
      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPanel = (mode: PanelMode) => {
    setPanelMode(mode);
    setTimeout(() => setPanelVisible(true), 10);
  };

  const closePanel = () => {
    setPanelVisible(false);
    setTimeout(() => {
      setSelectedClient(null);
      setClientDetail(null);
      setRelatedCounts(null);
      setPanelMode('empty');
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
    setSelectedClient(client);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/detail`);
      const data = await res.json();
      if (data.success) {
        setClientDetail(data.data);
        openPanel('view');
      } else {
        toast.error('Failed to load client details');
      }
    } catch (error) {
      console.error('Failed to fetch client detail:', error);
      toast.error('Failed to load client details');
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
        await fetchClients();
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
        await fetchClients();
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
          <button
            onClick={openAddClient}
            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer text-xs font-semibold flex items-center gap-1.5 font-body transition-colors duration-150"
          >
            <Plus size={15} />
            <span>Add Client</span>
          </button>
        }
      />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          
          {/* Search */}
          <div className="relative mb-6 max-w-full md:max-w-[500px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: colors.faint, marginTop: -8 }}
            />
            <input
              type="text"
              placeholder="Search clients by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-[38px] pl-9 pr-3 rounded-lg border border-primary bg-card text-sm text-foreground outline-none box-border font-body transition-colors duration-150 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Client list */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 md:p-16 bg-card rounded-xl border border-primary">
              <EmptyClients onAddClient={openAddClient} />
            </div>
          ) : (
            <DataTable>
              {/* Desktop table header - Invoice style */}
              <div className="hidden md:grid md:grid-cols-[1fr_200px_160px_120px_100px] gap-4 px-4 py-3 border-b border-primary/80 items-center bg-mutedBg">
                <DataTableHeaderLabel>Name</DataTableHeaderLabel>
                <DataTableHeaderLabel>Email</DataTableHeaderLabel>
                <DataTableHeaderLabel>Phone</DataTableHeaderLabel>
                <DataTableHeaderLabel>NDIS #</DataTableHeaderLabel>
                <DataTableHeaderLabel>Rate Codes</DataTableHeaderLabel>
              </div>

              {/* Client rows - Invoice style */}
              <div className="divide-y" style={{ divideColor: colors.subtle }}>
                {clients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => handleClientClick(client)}
                    className="grid grid-cols-[1fr_200px_160px_120px_100px] gap-5 px-4 py-[0.85rem] border-b border-primary/80 items-center cursor-pointer transition-all duration-120 hover:bg-primary/3"
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
                      <div className="font-medium text-foreground text-[13px]">{client.name}</div>
                      <div className="flex items-center gap-1.5 text-secondary text-[13px]">
                        <Mail size={13} />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-secondary text-[13px]">
                        <Phone size={13} />
                        {client.phone || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 text-secondary text-[13px]">
                        <UserCheck size={13} />
                        {client.ndis_number || '-'}
                      </div>
                      <div>
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-1.5">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-primary bg-transparent cursor-pointer flex items-center justify-center text-body transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/7"
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
                      : 'bg-transparent text-body border-primary hover:bg-primary/7'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-primary bg-transparent cursor-pointer flex items-center justify-center text-body transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/7"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT DETAIL PANEL - Responsive: full-screen on mobile, 360px sidebar on desktop */}
        <aside
          className={`fixed inset-y-0 right-0 md:relative md:inset-auto md:w-[360px] bg-card border-l border-primary flex flex-col overflow-hidden transition-transform duration-280 ease-out z-40 ${
            panelMode === 'empty' ? 'translate-x-full md:w-0 md:border-l-0' : 'translate-x-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div
            className={`w-full md:w-[360px] flex flex-col h-full opacity-0 transition-opacity duration-240 ${
              panelVisible ? 'opacity-100 translate-x-0' : 'translate-x-5'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {panelMode === 'view' && clientDetail && selectedClient && (
              <ClientDetailPanel
                client={selectedClient}
                rateCodes={clientDetail.rate_codes}
                recentAppointments={clientDetail.recent_appointments}
                invoices={clientDetail.invoices}
                outstandingBalance={clientDetail.outstanding_balance}
                stats={clientDetail.stats}
                onClose={closePanel}
                onEdit={openEditClient}
                onDelete={openDeleteConfirm}
              />
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

          {/* Mobile backdrop */}
          {panelMode !== 'empty' && (
            <div
              className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
              onClick={closePanel}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
