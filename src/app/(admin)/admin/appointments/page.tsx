'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  X,
  Plus,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  getWeekStart,
  getWeekDays,
  formatDateForInput,
  formatTimeForInput,
  formatTimeRange,
  formatDuration,
} from '@/lib/date-utils';
import type { AppointmentWithClient } from '@/repositories/appointments.repository';
import type { Client } from '@/db/schema/clients';
import type { NdisPricing } from '@/db/schema/ndis_pricing';
import { colors, getClientPalette, GROUP_PALETTE } from '@/styles/botanical';
import ScheduleCalendar from './_components/ScheduleCalendar';
import {
  SheetHandle,
  PanelHeader,
  PanelFooter,
  SectionLabel,
  MetaRow,
  PrimaryBtn,
  SecondaryBtn,
  DangerBtn,
} from '@/components/panels';
import { cn } from '@/lib/utils';

type PanelMode = 'empty' | 'view' | 'new' | 'edit' | 'deleteConfirm' | 'complete';

// ============================================================================
// MINI-CALENDAR HELPERS
// ============================================================================

function getMiniCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const offset = startDow === 0 ? 6 : startDow - 1;
  const days: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AppointmentsPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  const [appointments, setAppointments] = useState<AppointmentWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rateCodes, setRateCodes] = useState<NdisPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithClient | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelClosing, setPanelClosing] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const today = new Date();
  const [miniMonth, setMiniMonth] = useState(today.getMonth());
  const [miniYear, setMiniYear] = useState(today.getFullYear());

  const [formData, setFormData] = useState({
    client_id: '',
    date: '',
    start_time: '',
    duration: '60',
    end_time: '',
    notes: '',
    is_group: false,
    rate_code: '',
    participants: [] as string[], // just client IDs, split calculated automatically
    status: 'confirmed' as 'pending' | 'confirmed',
  });

  const weekDays = getWeekDays(weekStart);

  // Responsive: single day on mobile, full week on desktop
  const displayedDays = weekDays; // Full week always, but we'll filter in rendering

  const isToday = (day: Date) =>
    day.getDate() === today.getDate() &&
    day.getMonth() === today.getMonth() &&
    day.getFullYear() === today.getFullYear();

  const isDayInCurrentWeek = (d: number, month: number, year: number) => {
    return weekDays.some(
      wd => wd.getDate() === d && wd.getMonth() === month && wd.getFullYear() === year,
    );
  };

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => { fetchAppointments(); }, [weekStart]);
  useEffect(() => { fetchClients(); }, []);
  useEffect(() => { fetchRateCodes(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const weekStartStr = formatDateForInput(weekStart);
      const res = await fetch(`/api/appointments?weekStart=${weekStartStr}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      } else if (!res.ok) {
        toast.error(data?.error?.message || `Failed to load appointments (${res.status})`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?limit=100');
      const data = await res.json();
      if (data.success) setClients(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRateCodes = async () => {
    try {
      const res = await fetch('/api/ndis-pricing');
      const data = await res.json();
      if (data.success) setRateCodes(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // ============================================================================
  // PANEL TRANSITIONS
  // ============================================================================

  const openPanel = (mode: PanelMode) => {
    setPanelClosing(false);
    setPanelMode(mode);
    setTimeout(() => setPanelVisible(true), 75);
  };

  const closePanel = () => {
    setPanelVisible(false);
    setPanelClosing(true);
    setPanelCollapsed(false);
    setTimeout(() => {
      setSelectedAppointment(null);
      setPanelMode('empty');
      setCompleteNotes('');
      setPanelClosing(false);
      setFormData({ client_id: '', date: '', start_time: '', duration: '60', end_time: '', notes: '', is_group: false, rate_code: '', participants: [], status: 'confirmed' });
    }, 300);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedAppointment(null);
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    setFormData({
      client_id: '',
      date: formatDateForInput(slotDate),
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      duration: '60',
      end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
      notes: '',
      is_group: false,
      rate_code: '',
      participants: [],
      status: 'confirmed',
    });
    openPanel('new');
  };

  const handleAppointmentClick = (appt: AppointmentWithClient) => {
    setSelectedAppointment(appt);
    openPanel('view');
  };

  const openEditMode = () => {
    if (!selectedAppointment) return;
    setFormData({
      client_id: selectedAppointment.client_id || '',
      date: formatDateForInput(new Date(selectedAppointment.starts_at)),
      start_time: formatTimeForInput(new Date(selectedAppointment.starts_at)),
      duration: 'custom',
      end_time: formatTimeForInput(new Date(selectedAppointment.ends_at)),
      notes: selectedAppointment.notes || '',
      is_group: selectedAppointment.is_group || false,
      rate_code: selectedAppointment.rate_code || '',
      participants: selectedAppointment.participants?.map(p => p.client_id) || [],
      status: (selectedAppointment.status === 'pending' ? 'pending' : 'confirmed'),
    });
    setPanelMode('edit');
  };

  // ============================================================================
  // FULLCALENDAR HANDLERS
  // ============================================================================

  // FullCalendar: slot selection (creates new appointment)
  const handleSlotSelect = (date: Date, startTime: string, endTime: string) => {
    setSelectedAppointment(null);
    setFormData({
      client_id: '',
      date: formatDateForInput(date),
      start_time: startTime,
      duration: 'custom',
      end_time: endTime,
      notes: '',
      is_group: false,
      rate_code: '',
      participants: [],
      status: 'confirmed',
    });
    openPanel('new');
  };

  // FullCalendar: drag-drop reschedule
  const handleAppointmentDrop = async (appointmentId: string, newStart: Date, newEnd: Date) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          starts_at: newStart.toISOString(),
          ends_at: newEnd.toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Session rescheduled');
        await fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to reschedule');
        await fetchAppointments(); // Refetch to revert visual
      }
    } catch {
      toast.error('Failed to reschedule');
      await fetchAppointments();
    }
  };

  // FullCalendar: resize (change duration)
  const handleAppointmentResize = async (appointmentId: string, newStart: Date, newEnd: Date) => {
    await handleAppointmentDrop(appointmentId, newStart, newEnd);
  };

  // FullCalendar: date range changed (user navigated)
  const handleDateRangeChange = (start: Date, end: Date) => {
    setWeekStart(getWeekStart(start));
    const midpoint = new Date((start.getTime() + end.getTime()) / 2);
    setMiniMonth(midpoint.getMonth());
    setMiniYear(midpoint.getFullYear());
  };

  // ============================================================================
  // CRUD
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const startDate = new Date(`${formData.date}T${formData.start_time}:00`);
      const endDate = new Date(`${formData.date}T${formData.end_time}:00`);
      
      // Build payload based on session type
      const payload = formData.is_group
        ? {
            is_group: true,
            rate_code: formData.rate_code,
            participants: formData.participants,
            starts_at: startDate.toISOString(),
            ends_at: endDate.toISOString(),
            notes: formData.notes,
            status: formData.status,
          }
        : {
            client_id: formData.client_id,
            starts_at: startDate.toISOString(),
            ends_at: endDate.toISOString(),
            notes: formData.notes,
            status: formData.status,
          };
      
      const url = panelMode === 'edit' && selectedAppointment
        ? `/api/appointments/${selectedAppointment.id}`
        : '/api/appointments';
      const method = panelMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        toast.success(panelMode === 'edit' ? 'Session rescheduled' : 'Session booked');
        await fetchAppointments();
        if (selectedAppointment) {
          setSelectedAppointment(data.data);
          setPanelMode('view');
        } else {
          closePanel();
        }
      } else {
        toast.error(data?.error?.message || 'Failed to save');
      }
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointment) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Appointment cancelled');
        await fetchAppointments();
        closePanel();
      } else {
        toast.error(data.message || 'Failed to cancel');
      }
    } catch (e) {
      toast.error('Failed to cancel');
    } finally {
      setDeleting(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedAppointment) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: completeNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Session completed');
        await fetchAppointments();
        setSelectedAppointment(data.data);
        setPanelMode('view');
      } else {
        toast.error(data.message || 'Failed to complete');
      }
    } catch (e) {
      toast.error('Failed to complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAppointment) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Appointment confirmed');
        await fetchAppointments();
        setSelectedAppointment(data.data);
        setPanelMode('view');
      } else {
        toast.error(data.message || 'Failed to confirm');
      }
    } catch (e) {
      toast.error('Failed to confirm');
    } finally {
      setConfirming(false);
    }
  };

  // ============================================================================
  // MINI CALENDAR
  // ============================================================================

  const miniDays = getMiniCalendarDays(miniYear, miniMonth);
  const miniMonthName = new Date(miniYear, miniMonth, 1).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const jumpToWeekContaining = (d: number) => {
    const date = new Date(miniYear, miniMonth, d);
    setWeekStart(getWeekStart(date));
  };

  // ============================================================================
  // STATS
  // ============================================================================

  const weekConfirmed = appointments.filter(a => a.status === 'confirmed').length;
  const weekCompleted = appointments.filter(a => a.status === 'completed').length;
  const weekTotal = appointments.length;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-screen flex-col bg-background font-body">
      {/* TOP HEADER - Simplified */}
      <header className="bg-card border-b border-primary px-6 h-14 flex items-center flex-shrink-0 z-20 shadow-sm">
        <h1 className="font-heading text-lg font-semibold text-foreground m-0">
          Schedule
        </h1>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="w-[220px] hidden md:flex flex-col bg-card border-r border-primary p-5 gap-6 overflow-y-auto flex-shrink-0">
          {/* Mini calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { const d = new Date(miniYear, miniMonth - 1, 1); setMiniMonth(d.getMonth()); setMiniYear(d.getFullYear()); }} className="w-[22px] h-[22px] rounded border-none bg-transparent cursor-pointer flex items-center justify-center text-secondary">
                <ChevronLeft size={13} />
              </button>
              <span className="text-[11px] font-semibold text-foreground tracking-[0.04em] uppercase">
                {miniMonthName}
              </span>
              <button onClick={() => { const d = new Date(miniYear, miniMonth + 1, 1); setMiniMonth(d.getMonth()); setMiniYear(d.getFullYear()); }} className="w-[22px] h-[22px] rounded border-none bg-transparent cursor-pointer flex items-center justify-center text-secondary">
                <ChevronRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-0.75">
              {DOW_LABELS.map((l, i) => (
                <div key={i} className="text-center text-[10px] font-semibold text-faint py-0.5">{l}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {miniDays.map((d, i) => {
                if (d === null) return <div key={i} />;
                const isT = d === today.getDate() && miniMonth === today.getMonth() && miniYear === today.getFullYear();
                const inWeek = isDayInCurrentWeek(d, miniMonth, miniYear);
                return (
                  <button
                    key={i}
                    onClick={() => jumpToWeekContaining(d)}
                    className="w-full aspect-square rounded-full border-none cursor-pointer transition-colors duration-150 hover:bg-primary/7"
                    style={{
                      fontSize: 'var(--font-size-badge)',
                      fontWeight: isT ? 700 : inWeek ? 600 : 400,
                      background: isT ? 'hsl(130 13% 50%)' : inWeek ? 'hsl(130 13% 50% / 0.12)' : 'transparent',
                      color: isT ? '#fff' : inWeek ? 'hsl(130 13% 35%)' : 'hsl(145 15% 35%)',
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-primary" />

          <div>
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-secondary mb-3">This Week</p>
            <div className="flex flex-col gap-2">
              <StatPill label="Total" value={weekTotal} color="hsl(145 15% 35%)" bg="hsl(145 15% 35% / 0.08)" />
              <StatPill label="Upcoming" value={weekConfirmed} color="#5a7fa8" bg="rgba(90,127,168,0.10)" />
              <StatPill label="Completed" value={weekCompleted} color="#5a8a60" bg="rgba(90,138,96,0.10)" />
            </div>
          </div>

          <div className="h-px bg-primary" />

          <div>
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-secondary mb-2.5">Status</p>
            <div className="flex flex-col gap-[0.45rem]">
              <LegendDot color="#b69470" label="Pending" />
              <LegendDot color="#7895aa" label="Confirmed" />
              <LegendDot color="#7a9968" label="Completed" />
              <LegendDot color="#a88c9e" label="Cancelled" />
            </div>
          </div>
        </aside>

        {/* CALENDAR */}
        <div className="flex-1 overflow-hidden">
          <ScheduleCalendar
            appointments={appointments}
            clients={clients}
            selectedId={selectedAppointment?.id}
            loading={loading}
            targetDate={weekStart}
            onAppointmentClick={handleAppointmentClick}
            onSlotSelect={handleSlotSelect}
            onAppointmentDrop={handleAppointmentDrop}
            onAppointmentResize={handleAppointmentResize}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* MOBILE BACKDROP */}
        {panelMode !== 'empty' && (
          <div
            className={cn(
              'md:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px]',
              'transition-opacity duration-200',
              panelVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={closePanel}
            aria-hidden
          />
        )}

        {/* MOBILE BOTTOM SHEET */}
        <div
          className={cn(
            'md:hidden fixed inset-x-0 bottom-0 z-50',
            'flex flex-col bg-card rounded-t-[20px] rounded-b-none border-t border-primary',
            'max-h-[88vh] overflow-hidden',
            'transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            (!panelVisible || panelMode === 'empty' || panelClosing) && 'translate-y-full'
          )}
        >
          <div
            key={panelMode}
            className="flex flex-col h-full min-h-0 animate-in fade-in-0 duration-150"
          >
            {panelMode === 'view' && selectedAppointment && (
              <ViewPanel
                appt={selectedAppointment}
                clients={clients}
                onClose={closePanel}
                onEdit={openEditMode}
                onDelete={() => setPanelMode('deleteConfirm')}
                onComplete={() => { setCompleteNotes(''); setPanelMode('complete'); }}
                onConfirm={handleConfirm}
                confirming={confirming}
                completing={completing}
                onToggle={() => setPanelCollapsed(!panelCollapsed)}
                collapsed={panelCollapsed}
              />
            )}
            {(panelMode === 'new' || panelMode === 'edit') && (
              <FormPanel panelMode={panelMode} formData={formData} setFormData={setFormData} clients={clients} rateCodes={rateCodes} onClose={closePanel} onSubmit={handleSubmit} saving={saving} onToggle={() => setPanelCollapsed(!panelCollapsed)} collapsed={panelCollapsed} />
            )}
            {panelMode === 'deleteConfirm' && selectedAppointment && (
              <DeletePanel appt={selectedAppointment} onClose={closePanel} onBack={() => setPanelMode('view')} onDelete={handleDelete} deleting={deleting} onToggle={() => setPanelCollapsed(!panelCollapsed)} collapsed={panelCollapsed} />
            )}
            {panelMode === 'complete' && selectedAppointment && (
              <CompletePanel appt={selectedAppointment} notes={completeNotes} setNotes={setCompleteNotes} onClose={closePanel} onBack={() => setPanelMode('view')} onComplete={handleComplete} completing={completing} onToggle={() => setPanelCollapsed(!panelCollapsed)} collapsed={panelCollapsed} />
            )}
          </div>
        </div>

        {/* DESKTOP RIGHT SLIDE-OUT */}
        <aside
          className={cn(
            'hidden md:flex flex-col overflow-hidden bg-card border-l border-primary flex-shrink-0',
            'transition-[width] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            !(panelVisible && panelMode !== 'empty' && !panelClosing) && 'md:w-0 md:border-l-0',
            panelVisible && panelMode !== 'empty' && !panelClosing && !panelCollapsed && 'md:w-[360px]',
            panelVisible && panelMode !== 'empty' && !panelClosing && panelCollapsed && 'md:w-12'
          )}
        >
          {panelCollapsed ? (
            <button
              type="button"
              onClick={() => setPanelCollapsed(false)}
              className="w-12 h-full flex items-center justify-center border-l border-primary bg-soft-cream/40 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Expand panel"
              aria-label="Expand panel"
            >
              <ChevronLeft size={16} />
            </button>
          ) : (
          <div
            key={panelMode}
            className={cn(
              'w-[360px] h-full min-h-0 flex flex-col animate-in fade-in-0 duration-150',
              'transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
              panelVisible && panelMode !== 'empty' ? 'opacity-100 translate-x-0 md:delay-75' : 'opacity-0 translate-x-4 md:delay-0'
            )}
          >
            {panelMode === 'view' && selectedAppointment && (
              <ViewPanel
                appt={selectedAppointment}
                clients={clients}
                onClose={closePanel}
                onEdit={openEditMode}
                onDelete={() => setPanelMode('deleteConfirm')}
                onComplete={() => { setCompleteNotes(''); setPanelMode('complete'); }}
                onConfirm={handleConfirm}
                confirming={confirming}
                completing={completing}
                onToggle={() => setPanelCollapsed(!panelCollapsed)}
                collapsed={panelCollapsed}
              />
            )}
            {(panelMode === 'new' || panelMode === 'edit') && (
              <FormPanel panelMode={panelMode} formData={formData} setFormData={setFormData} clients={clients} rateCodes={rateCodes} onClose={closePanel} onSubmit={handleSubmit} saving={saving} onToggle={() => setPanelCollapsed(!panelCollapsed)} collapsed={panelCollapsed} />
            )}
            {panelMode === 'deleteConfirm' && selectedAppointment && (
              <DeletePanel appt={selectedAppointment} onClose={closePanel} onBack={() => setPanelMode('view')} onDelete={handleDelete} deleting={deleting} onToggle={() => setPanelCollapsed(!panelCollapsed)} collapsed={panelCollapsed} />
            )}
            {panelMode === 'complete' && selectedAppointment && (
              <CompletePanel appt={selectedAppointment} notes={completeNotes} setNotes={setCompleteNotes} onClose={closePanel} onBack={() => setPanelMode('view')} onComplete={handleComplete} completing={completing} onToggle={() => setPanelCollapsed(!panelCollapsed)} collapsed={panelCollapsed} />
            )}
          </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatPill({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-lg" style={{ background: bg }}>
      <span className="text-[11.5px] font-medium">{label}</span>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[0.45rem]">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[11.5px] text-secondary">{label}</span>
    </div>
  );
}

// Accent colours by panel/status
const ACCENT = {
  viewConfirmed: '#7895aa',
  viewCompleted: '#5a8a60',
  viewPending: '#b69470',
  form: 'var(--color-primary)',
  complete: '#5a8a60',
  cancel: '#a04040',
} as const;

// ============================================================================
// VIEW PANEL
// ============================================================================

function ViewPanel({ appt, clients, onClose, onEdit, onDelete, onComplete, onConfirm, confirming, completing, onToggle, collapsed }: {
  appt: AppointmentWithClient;
  clients: Client[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onConfirm: () => void;
  confirming: boolean;
  completing: boolean;
  onToggle?: () => void;
  collapsed?: boolean;
}) {
  const isPending = appt.status === 'pending';
  const isConfirmed = appt.status === 'confirmed';
  const isCompleted = appt.status === 'completed';
  const isCancelled = appt.status === 'cancelled';
  const isGroup = appt.is_group;
  const displayName = isGroup ? `Group Session (${appt.participants?.length || appt.group_size || 0} participants)` : appt.client?.name ?? 'Unknown Client';
  const initials = isGroup ? '' : (appt.client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?');

  const viewAccent = isCancelled ? ACCENT.cancel : isCompleted ? ACCENT.viewCompleted : isConfirmed ? ACCENT.viewConfirmed : ACCENT.viewPending;
  const heroPalette = isCancelled ? { dot: '#a88c9e', bg: 'rgba(168,140,158,0.14)', border: 'rgba(168,140,158,0.35)' } : isCompleted ? { dot: '#5a8a60', bg: 'rgba(90,138,96,0.12)', border: 'rgba(90,138,96,0.28)' } : isGroup ? { dot: GROUP_PALETTE.dot, bg: GROUP_PALETTE.bg, border: 'rgba(107,163,152,0.35)' } : (() => { const p = getClientPalette(appt.client_id || appt.id); return { dot: p.dot, bg: p.bg, border: `${p.dot}45` }; })();

  const formattedDate = new Date(appt.starts_at).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTimeRange = formatTimeRange(new Date(appt.starts_at), new Date(appt.ends_at));
  const formattedDuration = formatDuration(new Date(appt.starts_at), new Date(appt.ends_at));

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: viewAccent }} aria-hidden />

      <PanelHeader
        breadcrumb="Schedule"
        title="Session details"
        showAccentBar={false}
        titleColorClass="text-foreground"
        onClose={onClose}
        onToggle={onToggle}
        collapsed={collapsed}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-4 border',
            'animate-in fade-in-0 zoom-in-[0.98] duration-200'
          )}
          style={{ background: heroPalette.bg, borderColor: heroPalette.border }}
        >
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: heroPalette.dot }}>
            {isGroup ? <Users size={16} color="#fff" /> : <span className="text-[13px] font-medium text-white">{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-[15px] font-semibold text-foreground truncate mb-1">{displayName}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusPill status={appt.status} />
              {isGroup && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[rgba(107,163,152,0.18)] text-[#1e4a44]">Group</span>}
              {appt.invoiced && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[rgba(172,163,118,0.18)] text-[#7a6a30]">Invoiced</span>}
            </div>
          </div>
        </div>

        {isGroup && appt.participants && appt.participants.length > 0 && (
          <div>
            <SectionLabel>Participants</SectionLabel>
            <div className="divide-y divide-primary/50">
              {appt.participants.map((p, idx) => {
                const client = clients.find(c => c.id === p.client_id);
                const cp = getClientPalette(p.client_id);
                const splitPercent = Math.round(parseFloat(p.split_rate) * 100);
                return (
                  <div key={idx} className="flex items-center gap-2 py-[6px]">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: cp.dot }}>
                      <span className="text-[10px] font-medium text-white">{client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}</span>
                    </div>
                    <span className="flex-1 text-[12px] font-medium text-foreground truncate">{client?.name ?? 'Unknown'}</span>
                    <span className="text-[11px] text-muted-foreground font-medium">{splitPercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <SectionLabel>Session</SectionLabel>
          <div className="divide-y divide-primary/50">
            <MetaRow label="Date" value={formattedDate} />
            <MetaRow label="Time" value={formattedTimeRange} />
            <MetaRow label="Duration" value={formattedDuration} />
            {isGroup && appt.rate_code && <MetaRow label="Rate code" value={appt.rate_code} />}
            {appt.invoiced && appt.invoice_ref && <MetaRow label="Invoice" value={appt.invoice_ref} />}
          </div>
        </div>

        {appt.notes && (
          <div className="rounded-lg bg-soft-cream border border-primary p-3">
            <SectionLabel>Notes</SectionLabel>
            <p className="text-[12px] text-muted-foreground leading-relaxed m-0">{appt.notes}</p>
          </div>
        )}

        {appt.invoiced && (
          <div className="rounded-lg bg-[rgba(172,163,118,0.12)] border border-[rgba(172,163,118,0.25)] px-3 py-2.5">
            <p className="text-[12px] text-[#5a5225] m-0">
              This session is invoiced and cannot be modified.
              {appt.invoice_ref && <span className="font-medium ml-1">{appt.invoice_ref}</span>}
            </p>
          </div>
        )}

        {!appt.invoiced && !isCancelled && (
          <PanelFooter>
            {isPending && (
              <>
                <PrimaryBtn onClick={onConfirm} loading={confirming} loadingLabel="Confirming…" style={{ background: ACCENT.viewConfirmed }} className="hover:opacity-90">
                  <CheckCircle size={14} />
                  Confirm appointment
                </PrimaryBtn>
                <div className="flex gap-2">
                  <SecondaryBtn type="button" onClick={onEdit}>
                    <Pencil size={13} />
                    Reschedule
                  </SecondaryBtn>
                  <DangerBtn type="button" onClick={onDelete}>
                    <Trash2 size={13} />
                    Cancel
                  </DangerBtn>
                </div>
              </>
            )}
            {isConfirmed && (
              <>
                <PrimaryBtn onClick={onComplete} loading={completing} loadingLabel="Saving…" style={{ background: ACCENT.viewCompleted }} className="hover:opacity-90">
                  <CheckCircle size={14} />
                  Mark complete
                </PrimaryBtn>
                <div className="flex gap-2">
                  <SecondaryBtn type="button" onClick={onEdit}>
                    <Pencil size={13} />
                    Reschedule
                  </SecondaryBtn>
                  <DangerBtn type="button" onClick={onDelete}>
                    <Trash2 size={13} />
                    Cancel
                  </DangerBtn>
                </div>
              </>
            )}
            {isCompleted && (
              <Link
                href="/admin/invoices?tab=generate"
                className={cn(
                  'h-11 md:h-10 w-full rounded-lg border border-primary bg-card',
                  'text-[12px] font-medium text-foreground/70 flex items-center justify-center gap-1.5',
                  'hover:bg-muted hover:text-foreground transition-all duration-150'
                )}
              >
                <FileText size={13} />
                Go to invoices
              </Link>
            )}
          </PanelFooter>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'rgba(90,138,96,0.12)', text: '#3a5a3e' },
    confirmed: { bg: 'rgba(120,149,170,0.12)', text: '#2d4a5c' },
    pending: { bg: 'rgba(182,148,112,0.14)', text: '#6b4d2f' },
    cancelled: { bg: 'rgba(168,140,158,0.14)', text: '#6b3a5c' },
  };
  const c = config[status] ?? config.confirmed;
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const inputClasses = 'w-full h-9 px-3 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200';
const textareaClasses = 'w-full min-h-[72px] py-2 px-3 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-foreground outline-none resize-y focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 leading-relaxed';

// ============================================================================
// FORM PANEL
// ============================================================================

function FormPanel({ panelMode, formData, setFormData, clients, rateCodes, onClose, onSubmit, saving, onToggle, collapsed }: {
  panelMode: 'new' | 'edit';
  formData: any;
  setFormData: any;
  clients: Client[];
  rateCodes: NdisPricing[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  onToggle?: () => void;
  collapsed?: boolean;
}) {
  const isGroup = formData.is_group;
  const participantCount = formData.participants.length;

  const addParticipant = () => setFormData({ ...formData, participants: [...formData.participants, ''] });
  const removeParticipant = (index: number) => setFormData({ ...formData, participants: formData.participants.filter((_: any, i: number) => i !== index) });
  const updateParticipant = (index: number, clientId: string) => {
    const updated = [...formData.participants];
    updated[index] = clientId;
    setFormData({ ...formData, participants: updated });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />
      <div className="h-[3px] w-full flex-shrink-0 bg-primary" aria-hidden />

      <PanelHeader
        breadcrumb="Schedule"
        title={panelMode === 'new' ? 'Book session' : 'Reschedule session'}
        showAccentBar={false}
        onClose={onClose}
        onToggle={onToggle}
        collapsed={collapsed}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label="Session type">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_group: false, participants: [], rate_code: '' })}
                className={cn('flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all', !isGroup ? 'border-primary/50 bg-primary/10 text-primary' : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground')}
              >
                <User size={14} /> Individual
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_group: true, client_id: '' })}
                className={cn('flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all', isGroup ? 'border-primary/50 bg-primary/10 text-primary' : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground')}
              >
                <Users size={14} /> Group
              </button>
            </div>
          </FormField>

          {!isGroup && (
            <FormField label="Client">
              <select value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })} required className={cn(inputClasses, 'cursor-pointer')}>
                <option value="">Select a client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          )}

          {isGroup && (
            <>
              <FormField label="Rate code">
                <select value={formData.rate_code} onChange={e => setFormData({ ...formData, rate_code: e.target.value })} required className={cn(inputClasses, 'cursor-pointer')}>
                  <option value="">Select a rate code…</option>
                  {rateCodes.map(rc => <option key={rc.id} value={rc.support_item_code}>{rc.support_item_code} — {rc.support_item_name}</option>)}
                </select>
              </FormField>
              <FormField label={`Participants (${participantCount}) — split evenly`}>
                <div className="flex flex-col gap-2">
                  {formData.participants.map((clientId: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={clientId} onChange={e => updateParticipant(idx, e.target.value)} required className={cn(inputClasses, 'flex-1 cursor-pointer')}>
                        <option value="">Select…</option>
                        {clients.filter(c => !formData.participants.includes(c.id) || c.id === clientId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button type="button" onClick={() => removeParticipant(idx)} className="w-7 h-7 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] flex items-center justify-center text-[hsl(145_15%_35%)] hover:bg-[hsl(42_26%_87%)] hover:text-destructive hover:border-destructive/40 transition-colors flex-shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addParticipant} className="h-8 rounded-lg border border-dashed border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)]/50 text-[12px] text-[hsl(145_15%_35%)] flex items-center justify-center gap-1 hover:bg-[hsl(42_26%_92%)] hover:border-[hsl(34_22%_68%)] hover:text-foreground transition-colors">
                    <Plus size={12} /> Add participant
                  </button>
                </div>
              </FormField>
            </>
          )}

          <FormField label="Date">
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className={inputClasses} />
          </FormField>

          <div className="grid grid-cols-2 gap-2">
            <FormField label="Start time">
              <input type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required className={inputClasses} />
            </FormField>
            <FormField label="Duration">
              <select
                value={formData.duration}
                onChange={e => {
                  const dur = e.target.value;
                  let end_time = formData.end_time;
                  if (dur !== 'custom') {
                    const [h, m] = formData.start_time.split(':').map(Number);
                    const total = h * 60 + m + parseInt(dur);
                    end_time = `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
                  }
                  setFormData({ ...formData, duration: dur, end_time });
                }}
                className={cn(inputClasses, 'cursor-pointer')}
              >
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="custom">Custom</option>
              </select>
            </FormField>
          </div>

          {formData.duration === 'custom' && (
            <FormField label="End time">
              <input type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} required className={inputClasses} />
            </FormField>
          )}

          <FormField label="Status">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pending' })}
                className={cn('flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all', formData.status === 'pending' ? 'border-[rgba(182,148,112,0.4)] bg-[rgba(182,148,112,0.10)] text-[#6b4d2f]' : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground')}
              >
                <Clock size={14} /> Pending
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'confirmed' })}
                className={cn('flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all', formData.status === 'confirmed' ? 'border-[rgba(120,149,170,0.4)] bg-[rgba(120,149,170,0.10)] text-[#2d4a5c]' : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground')}
              >
                <CheckCircle size={14} /> Confirmed
              </button>
            </div>
          </FormField>

          <FormField label="Notes (optional)">
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Session notes…" className={textareaClasses} />
          </FormField>

          <PanelFooter>
            <div className="flex gap-2">
              <PrimaryBtn type="submit" loading={saving} loadingLabel="Saving…" disabled={isGroup && formData.participants.length < 2} className="flex-1">
                {panelMode === 'new' ? 'Book session' : 'Save changes'}
              </PrimaryBtn>
              <SecondaryBtn type="button" onClick={onClose} className="flex-none px-4">
                Cancel
              </SecondaryBtn>
            </div>
          </PanelFooter>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// DELETE PANEL
// ============================================================================

function DeletePanel({ appt, onClose, onBack, onDelete, deleting, onToggle, collapsed }: { appt: AppointmentWithClient; onClose: () => void; onBack: () => void; onDelete: () => void; deleting: boolean; onToggle?: () => void; collapsed?: boolean }) {
  const isGroup = appt.is_group;
  const displayName = isGroup ? `Group Session (${appt.participants?.length || 0} participants)` : appt.client?.name ?? 'Unknown';
  const initials = isGroup ? '' : (appt.client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?');
  const formattedDate = new Date(appt.starts_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  const formattedTime = formatTimeRange(new Date(appt.starts_at), new Date(appt.ends_at));

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: ACCENT.cancel }} aria-hidden />

      <PanelHeader
        breadcrumb="Schedule"
        title="Cancel session"
        showAccentBar={false}
        titleColorClass="text-[#a04040]"
        onClose={onClose}
        onToggle={onToggle}
        collapsed={collapsed}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        <div className={cn('flex items-center gap-3 rounded-xl p-4 border', 'animate-in fade-in-0 zoom-in-[0.98] duration-200')} style={{ background: 'rgba(160,64,64,0.08)', borderColor: 'rgba(160,64,64,0.25)' }}>
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: ACCENT.cancel }}>
            {isGroup ? <Users size={16} color="#fff" /> : <span className="text-[13px] font-medium text-white">{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-[15px] font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{formattedDate} · {formattedTime}</p>
          </div>
        </div>

        <div>
          <SectionLabel>Session</SectionLabel>
          <div className="divide-y divide-primary/50">
            <MetaRow label="Date" value={formattedDate} />
            <MetaRow label="Time" value={formattedTime} />
          </div>
        </div>

        <div className="rounded-lg px-3 py-2.5 flex gap-2 items-start" style={{ background: 'rgba(160,64,64,0.07)', border: '1px solid rgba(160,64,64,0.2)' }}>
          <AlertCircle size={16} color="#a04040" className="mt-0.5 flex-shrink-0" />
          <p className="m-0 text-[12px] leading-relaxed" style={{ color: '#7a3030' }}>
            Cancel session with <strong>{displayName}</strong>? This cannot be undone.
          </p>
        </div>

        <PanelFooter>
          <div className="flex gap-2">
            <DangerBtn type="button" onClick={onDelete} disabled={deleting} className="flex-1 hover:opacity-90" style={{ borderColor: 'rgba(160,64,64,0.4)', background: ACCENT.cancel, color: '#fff' }}>
              {deleting ? 'Cancelling…' : 'Yes, cancel session'}
            </DangerBtn>
            <SecondaryBtn type="button" onClick={onBack} className="flex-none px-4">
              Go back
            </SecondaryBtn>
          </div>
        </PanelFooter>

        <div className="h-2" />
      </div>
    </div>
  );
}

// ============================================================================
// COMPLETE PANEL
// ============================================================================

function CompletePanel({ appt, notes, setNotes, onClose, onBack, onComplete, completing, onToggle, collapsed }: { appt: AppointmentWithClient; notes: string; setNotes: (n: string) => void; onClose: () => void; onBack: () => void; onComplete: () => void; completing: boolean; onToggle?: () => void; collapsed?: boolean }) {
  const isGroup = appt.is_group;
  const displayName = isGroup ? `Group Session (${appt.participants?.length || 0} participants)` : appt.client?.name ?? 'Unknown';
  const initials = isGroup ? '' : (appt.client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?');
  const formattedDate = new Date(appt.starts_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  const formattedTime = formatTimeRange(new Date(appt.starts_at), new Date(appt.ends_at));

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: ACCENT.complete }} aria-hidden />

      <PanelHeader
        breadcrumb="Schedule"
        title="Complete session"
        showAccentBar={false}
        onClose={onClose}
        onToggle={onToggle}
        collapsed={collapsed}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        <div className={cn('flex items-center gap-3 rounded-xl p-4 border', 'animate-in fade-in-0 zoom-in-[0.98] duration-200')} style={{ background: 'rgba(90,138,96,0.10)', borderColor: 'rgba(90,138,96,0.28)' }}>
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: ACCENT.complete }}>
            {isGroup ? <Users size={16} color="#fff" /> : <span className="text-[13px] font-medium text-white">{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-[15px] font-semibold text-foreground truncate">{displayName}</p>
          </div>
        </div>

        <div>
          <SectionLabel>Session</SectionLabel>
          <div className="divide-y divide-primary/50">
            <MetaRow label="Date" value={formattedDate} />
            <MetaRow label="Time" value={formattedTime} />
          </div>
        </div>

        <div className="rounded-lg bg-[rgba(90,138,96,0.08)] border border-[rgba(90,138,96,0.2)] px-3 py-2.5 flex items-start gap-2">
          <CheckCircle size={14} style={{ color: '#5a8a60' }} className="mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-[#3a5a3e] leading-relaxed m-0">
            Completing this session makes it available to invoice. You can add notes below.
          </p>
        </div>

        <FormField label="Session notes">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did the session go?" minLength={0} className={cn(textareaClasses, 'min-h-[80px]')} />
        </FormField>

        <PanelFooter>
          <div className="flex gap-2">
            <PrimaryBtn onClick={onComplete} loading={completing} loadingLabel="Saving…" style={{ background: ACCENT.complete }} className="flex-1 hover:opacity-90">
              <CheckCircle size={14} />
              Complete session
            </PrimaryBtn>
            <SecondaryBtn type="button" onClick={onBack} className="flex-none px-4">
              Back
            </SecondaryBtn>
          </div>
        </PanelFooter>

        <div className="h-2" />
      </div>
    </div>
  );
}

// ============================================================================
// FORM HELPERS
// ============================================================================

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10.5px] font-bold tracking-[0.06em] uppercase text-secondary">
        {label}
      </p>
      {children}
    </div>
  );
}