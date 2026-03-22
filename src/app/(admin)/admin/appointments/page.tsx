'use client';

import React, { useState, useEffect } from 'react';
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
  formatWeekRange,
  formatTimeRange,
  formatDuration,
} from '@/lib/date-utils';
import type { AppointmentWithClient } from '@/repositories/appointments.repository';
import type { Client } from '@/db/schema/clients';
import type { NdisPricing } from '@/db/schema/ndis_pricing';
import { 
  colors,
  shadows,
  typography,
  animations,
  getClientPalette, 
  GROUP_PALETTE, 
  getAppointmentStatusStyle,
} from '@/styles/botanical';
import ScheduleCalendar from './_components/ScheduleCalendar';
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
      if (data.success) setAppointments(data.data);
    } catch (e) {
      console.error(e);
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
    setPanelMode(mode);
    setTimeout(() => setPanelVisible(true), 10);
  };

  const closePanel = () => {
    setPanelVisible(false);
    setPanelCollapsed(false);
    setTimeout(() => {
      setSelectedAppointment(null);
      setPanelMode('empty');
      setCompleteNotes('');
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
        toast.error(data.message || 'Failed to save');
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
                      fontSize: isT ? '0.7rem' : '0.7rem',
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
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            onClick={closePanel}
          />
        )}

        {/* RIGHT DETAIL PANEL - Single panel with responsive behavior */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[380px] bg-card border-l border-primary flex flex-col transition-all duration-280 ease-out overflow-hidden md:relative md:inset-auto md:flex-shrink-0 md:min-w-0 ${
            !panelVisible || panelMode === 'empty' ? 'translate-x-full md:translate-x-0 md:w-0 md:border-l-0' :
            panelCollapsed ? 'translate-x-0 md:w-12' : 'translate-x-0 md:w-[360px]'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div
            className={`w-full flex flex-col h-full overflow-hidden opacity-0 transition-opacity duration-240 ${
              panelVisible ? 'opacity-100 translate-x-0' : 'translate-x-5'
            } ${panelCollapsed ? 'md:opacity-0 md:overflow-hidden' : ''}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
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

function PanelHeader({ title, onClose, accent, onToggle, collapsed }: { title: string; onClose: () => void; accent?: string; onToggle?: () => void; collapsed?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-primary flex-shrink-0">
      <div className="flex items-center gap-2.5">
        {onToggle && (
          <button 
            onClick={onToggle} 
            className="hidden md:flex w-7 h-7 rounded-lg border border-primary bg-card cursor-pointer items-center justify-center text-secondary hover:bg-primary/7 hover:text-foreground transition-all duration-200 hover:shadow-sm active:scale-95"
            title={collapsed ? "Expand panel" : "Collapse panel"}
          >
            {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        <h2 className="font-heading text-[15px] font-semibold m-0 tracking-tight" style={{ color: accent ?? 'hsl(145 15% 22%)' }}>{title}</h2>
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-lg border border-primary bg-card cursor-pointer flex items-center justify-center text-secondary hover:bg-muted hover:text-foreground transition-all duration-200 hover:shadow-sm active:scale-95">
        <X size={15} />
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-[0.65rem] items-start">
      <div className="mt-0.5 text-faint flex-shrink-0">{icon}</div>
      <div>
        <p className="m-0 text-[10.5px] font-semibold tracking-[0.06em] uppercase text-secondary">{label}</p>
        <p className="m-[2px]_0 text-[13px] text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}

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
  const isGroup = appt.is_group;
  const palette = isCompleted ? { dot: '#839977', bg: 'rgba(131,153,119,0.12)', text: '#3a4d34' } : isGroup ? GROUP_PALETTE : getClientPalette(appt.client_id || appt.id);

  return (
    <>
      <PanelHeader title="Session Details" onClose={onClose} onToggle={onToggle} collapsed={collapsed} />
      <div className="flex-1 overflow-y-auto p-4">
        {/* Client/Group card */}
        <div className={`flex ${isGroup ? 'items-start' : 'items-center'} gap-3 p-3.5 rounded-[10px] mb-5`} style={{ background: palette.bg, border: `1px solid ${palette.dot}28` }}>
          {isGroup ? (
            <div className="w-[38px] h-[38px] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: palette.dot }}>
              <Users size={18} color="#fff" />
            </div>
          ) : (
            <div className="w-[38px] h-[38px] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: palette.dot }}>
              <span className="text-[13px] font-bold text-white">{appt.client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}</span>
            </div>
          )}
          <div className="flex-1">
            <p className="m-0 font-heading text-[15px] font-semibold text-foreground">
              {isGroup ? `Group Session (${appt.participants?.length || appt.group_size || 0} participants)` : appt.client?.name ?? 'Unknown Client'}
            </p>
            <div className="inline-flex items-center gap-1 mt-1">
              <span className="text-[10.5px] font-semibold px-2 rounded-[99px]" style={{ padding: '1px 8px', background: isCompleted ? 'rgba(131,153,119,0.22)' : 'rgba(90,127,168,0.15)', color: isCompleted ? '#4a6640' : '#3a6080', textTransform: 'capitalize' }}>
                {appt.status}
              </span>
              {isGroup && (
                <span className="text-[10.5px] font-semibold px-2 rounded-[99px]" style={{ padding: '1px 8px', background: 'rgba(107,163,152,0.15)', color: '#1e4a44' }}>
                  Group
                </span>
              )}
              {appt.invoiced && (
                <span className="text-[10.5px] font-semibold px-2 rounded-[99px]" style={{ padding: '1px 8px', background: 'rgba(172,163,118,0.2)', color: '#5a5225' }}>Invoiced</span>
              )}
            </div>
          </div>
        </div>

        {/* Participant list for group sessions */}
        {isGroup && appt.participants && appt.participants.length > 0 && (
          <div className="mb-5">
            <p className="m-0 mb-2 text-[11px] font-bold tracking-[0.06em] uppercase text-secondary">Participants</p>
            <div className="flex flex-col gap-[0.4rem]">
              {appt.participants.map((p, idx) => {
                const client = clients.find(c => c.id === p.client_id);
                const clientPalette = getClientPalette(p.client_id);
                const splitPercent = Math.round(parseFloat(p.split_rate) * 100);
                return (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-[6px]" style={{ background: 'hsl(47 22% 94%)', border: '1px solid hsl(37 18% 89%)' }}>
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: clientPalette.dot }}>
                      <span className="text-[10px] font-bold text-white">{client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}</span>
                    </div>
                    <span className="flex-1 text-[13px] text-foreground font-medium">{client?.name ?? 'Unknown'}</span>
                    <span className="text-[11.5px] text-secondary font-semibold">{splitPercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="flex flex-col gap-[0.85rem] mb-5">
          <InfoRow icon={<Calendar size={14} />} label="Date" value={new Date(appt.starts_at).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
          <InfoRow icon={<Clock size={14} />} label="Time" value={formatTimeRange(new Date(appt.starts_at), new Date(appt.ends_at))} />
          <InfoRow icon={<Clock size={14} />} label="Duration" value={formatDuration(new Date(appt.starts_at), new Date(appt.ends_at))} />
          {isGroup && appt.rate_code && (
            <InfoRow icon={<FileText size={14} />} label="Rate Code" value={appt.rate_code} />
          )}
          {appt.invoiced && appt.invoice_ref && (
            <InfoRow icon={<FileText size={14} />} label="Invoice" value={appt.invoice_ref} />
          )}
        </div>

        {/* Notes */}
        {appt.notes && (
          <div className="mb-5">
            <p className="m-0 mb-[0.4rem] text-[10.5px] font-bold tracking-[0.06em] uppercase text-secondary">Session Notes</p>
            <div className="px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed" style={{ background: 'hsl(47 22% 94%)', border: '1px solid hsl(37 18% 89%)', color: 'hsl(145 15% 28%)', lineHeight: 1.55 }}>
              {appt.notes}
            </div>
          </div>
        )}

        {/* Actions */}
        {!appt.invoiced ? (
          <div className="flex flex-col gap-2">
            {isPending && (
              <>
                <button onClick={onConfirm} disabled={confirming} className="h-9 rounded-lg border-none flex items-center justify-center gap-1.5 font-semibold cursor-pointer text-white" style={{ background: '#7895aa' }}>
                  <CheckCircle size={14} />
                  {confirming ? 'Confirming…' : 'Confirm Appointment'}
                </button>
                <div className="flex gap-2">
                  <button onClick={onEdit} className="h-9 px-3.5 rounded-lg border border-secondary bg-transparent text-body text-[13px] font-medium cursor-pointer flex items-center justify-center gap-1 flex-1">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={onDelete} className="h-9 px-3.5 rounded-lg border bg-transparent text-[13px] font-medium cursor-pointer flex items-center justify-center gap-1 flex-1" style={{ borderColor: 'rgba(160,64,64,0.3)', color: '#a04040' }}>
                    <Trash2 size={13} /> Cancel
                  </button>
                </div>
              </>
            )}
            {isConfirmed && (
              <>
                <button onClick={onComplete} disabled={completing} className="h-9 rounded-lg border-none flex items-center justify-center gap-1.5 font-semibold cursor-pointer text-white" style={{ background: '#5a8a60' }}>
                  <CheckCircle size={14} />
                  {completing ? 'Completing…' : 'Mark Complete'}
                </button>
                <div className="flex gap-2">
                  <button onClick={onEdit} className="h-9 px-3.5 rounded-lg border border-secondary bg-transparent text-body text-[13px] font-medium cursor-pointer flex items-center justify-center gap-1 flex-1">
                    <Pencil size={13} /> Reschedule
                  </button>
                  <button onClick={onDelete} className="h-9 px-3.5 rounded-lg border bg-transparent text-[13px] font-medium cursor-pointer flex items-center justify-center gap-1 flex-1" style={{ borderColor: 'rgba(160,64,64,0.3)', color: '#a04040' }}>
                    <Trash2 size={13} /> Cancel
                  </button>
                </div>
              </>
            )}
            {isCompleted && (
              <button className="h-9 px-3.5 rounded-lg border border-secondary bg-transparent text-body text-[13px] font-medium cursor-pointer flex items-center justify-center gap-1">
                <FileText size={13} /> View Invoice
              </button>
            )}
          </div>
        ) : (
          <p className="text-[12.5px] text-secondary text-center italic">
            This session has been invoiced and cannot be modified.
          </p>
        )}
      </div>
    </>
  );
}

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

  const addParticipant = () => {
    setFormData({
      ...formData,
      participants: [...formData.participants, ''],
    });
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_: any, i: number) => i !== index),
    });
  };

  const updateParticipant = (index: number, clientId: string) => {
    const updated = [...formData.participants];
    updated[index] = clientId;
    setFormData({ ...formData, participants: updated });
  };

  return (
    <>
      <PanelHeader title={panelMode === 'new' ? 'Book Session' : 'Reschedule Session'} onClose={onClose} onToggle={onToggle} collapsed={collapsed} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem' }}>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            
            {/* Session Type Toggle */}
            <FormField label="Session Type">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_group: false, participants: [], rate_code: '' })}
                  className={`flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-sm ${
                    !isGroup 
                      ? 'border-[hsl(130_13%_50%)] bg-[hsl(130_13%_50%/0.1)] text-[hsl(130_13%_35%)]' 
                      : 'border-[hsl(37_18%_85%)] bg-transparent text-secondary hover:text-foreground'
                  }`}
                >
                  <User size={14} /> Individual
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_group: true, client_id: '' })}
                  className={`flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-sm ${
                    isGroup 
                      ? 'border-[hsl(130_13%_50%)] bg-[hsl(130_13%_50%/0.1)] text-[hsl(130_13%_35%)]' 
                      : 'border-[hsl(37_18%_85%)] bg-transparent text-secondary hover:text-foreground'
                  }`}
                >
                  <Users size={14} /> Group
                </button>
              </div>
            </FormField>

            {/* Individual: Single client selector */}
            {!isGroup && (
              <FormField label="Client">
                <select
                  value={formData.client_id}
                  onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                  required
                  className="w-full h-9 px-2.5 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none cursor-pointer focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200"
                >
                  <option value="">Select a client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
            )}

            {/* Group: Rate code + participants */}
            {isGroup && (
              <>
                <FormField label="Rate Code">
                  <select
                    value={formData.rate_code}
                    onChange={e => setFormData({ ...formData, rate_code: e.target.value })}
                    required
                    className="w-full h-9 px-2.5 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none cursor-pointer focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200"
                  >
                    <option value="">Select a rate code…</option>
                    {rateCodes.map(rc => (
                      <option key={rc.id} value={rc.support_item_code}>
                        {rc.support_item_code} — {rc.support_item_name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label={`Participants (${participantCount}) — split evenly`}>
                  <div className="flex flex-col gap-2">
                    {formData.participants.map((clientId: string, idx: number) => (
                      <div key={idx} className="flex gap-[0.4rem] items-center">
                        <select
                          value={clientId}
                          onChange={e => updateParticipant(idx, e.target.value)}
                          required
                          className="flex-1 h-9 px-2.5 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none cursor-pointer focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200"
                        >
                          <option value="">Select…</option>
                          {clients.filter(c => !formData.participants.includes(c.id) || c.id === clientId).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeParticipant(idx)}
                          className="w-7 h-7 rounded-lg border border-[hsl(37_18%_85%)] bg-transparent cursor-pointer flex items-center justify-center text-red hover:bg-red/7 transition-all duration-200 hover:shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addParticipant}
                      className="h-8 rounded-lg border border-dashed border-[hsl(37_18%_70%)] bg-transparent cursor-pointer text-[12px] text-secondary flex items-center justify-center gap-1 transition-colors duration-200 hover:border-[hsl(130_13%_50%)] hover:text-[hsl(130_13%_35%)]"
                    >
                      <Plus size={12} /> Add Participant
                    </button>
                  </div>
                </FormField>
              </>
            )}

            {/* Date */}
            <FormField label="Date">
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                required 
                className="w-full h-9 px-2.5 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200"
              />
            </FormField>

            {/* Start + Duration */}
            <div className="grid grid-cols-2 gap-[0.65rem]">
              <FormField label="Start Time">
                <input 
                  type="time" 
                  value={formData.start_time} 
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })} 
                  required 
                  className="w-full h-9 px-2.5 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200"
                />
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
                  className="w-full h-9 px-2.5 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none cursor-pointer focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200"
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
              <FormField label="End Time">
                <input 
                  type="time" 
                  value={formData.end_time} 
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })} 
                  required 
                  className="w-full h-9 px-2.5 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200"
                />
              </FormField>
            )}

            {/* Status */}
            <FormField label="Status">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'pending' })}
                  className={`flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-sm ${
                    formData.status === 'pending'
                      ? 'border-[#b69470] bg-[#b69470/0.15] text-[#6b4d2f]' 
                      : 'border-[hsl(37_18%_85%)] bg-transparent text-secondary hover:text-foreground'
                  }`}
                >
                  <Clock size={14} /> Pending
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'confirmed' })}
                  className={`flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-sm ${
                    formData.status === 'confirmed'
                      ? 'border-[#7895aa] bg-[#7895aa/0.15] text-[#2d4a5c]' 
                      : 'border-[hsl(37_18%_85%)] bg-transparent text-secondary hover:text-foreground'
                  }`}
                >
                  <CheckCircle size={14} /> Confirmed
                </button>
              </div>
            </FormField>

            {/* Notes */}
            <FormField label="Notes (optional)">
              <textarea 
                value={formData.notes} 
                onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                rows={3} 
                placeholder="Session notes…" 
                className="w-full min-h-[72px] px-2.5 py-2 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none resize-y focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200 leading-relaxed"
              />
            </FormField>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              type="submit"
              disabled={saving || (isGroup && formData.participants.length < 2)}
              className={`flex-1 h-9 rounded-lg border-none flex items-center justify-center gap-1.5 font-semibold cursor-pointer text-white transition-all duration-200 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isGroup && formData.participants.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ background: 'hsl(130 13% 48%)' }}
            >
              {saving ? 'Saving…' : panelMode === 'new' ? 'Book Session' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="h-9 px-3.5 rounded-lg border border-[hsl(37_18%_86%)] bg-transparent text-[13px] text-[hsl(145_15%_38%)] font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-muted hover:text-foreground hover:shadow-sm active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ============================================================================
// DELETE PANEL
// ============================================================================

function DeletePanel({ appt, onClose, onBack, onDelete, deleting, onToggle, collapsed }: { appt: AppointmentWithClient; onClose: () => void; onBack: () => void; onDelete: () => void; deleting: boolean; onToggle?: () => void; collapsed?: boolean }) {
  const isGroup = appt.is_group;
  const displayName = isGroup ? `Group Session (${appt.participants?.length || 0} participants)` : appt.client?.name;
  
  return (
    <>
      <PanelHeader title="Cancel Session" onClose={onClose} accent="#a04040" onToggle={onToggle} collapsed={collapsed} />
      <div className="flex-1 overflow-y-auto px-[1.1rem]">
        <div className="px-[0.85rem] py-3 rounded-[10px] mb-[1.1rem] flex gap-[0.65rem] items-start" style={{ background: 'rgba(160,64,64,0.07)', border: '1px solid rgba(160,64,64,0.2)' }}>
          <AlertCircle size={16} color="#a04040" className="mt-0.5 flex-shrink-0" />
          <p className="m-0 text-[13px] leading-[1.5]" style={{ color: '#7a3030' }}>
            Cancel session with <strong>{displayName}</strong> on{' '}
            <strong>{new Date(appt.starts_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>?{' '}
            This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onDelete} 
            disabled={deleting} 
            className="flex-1 h-9 rounded-lg border-none flex items-center justify-center gap-1.5 font-semibold cursor-pointer text-white transition-all duration-200 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#a04040' }}
          >
            {deleting ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
          <button 
            onClick={onBack} 
            className="h-9 px-3.5 rounded-lg border border-[hsl(37_18%_86%)] bg-transparent text-[13px] text-[hsl(145_15%_38%)] font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-muted hover:text-foreground hover:shadow-sm active:scale-95"
          >
            Go back
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// COMPLETE PANEL
// ============================================================================

function CompletePanel({ appt, notes, setNotes, onClose, onBack, onComplete, completing, onToggle, collapsed }: { appt: AppointmentWithClient; notes: string; setNotes: (n: string) => void; onClose: () => void; onBack: () => void; onComplete: () => void; completing: boolean; onToggle?: () => void; collapsed?: boolean }) {
  const isGroup = appt.is_group;
  const displayName = isGroup ? `Group Session (${appt.participants?.length || 0} participants)` : appt.client?.name;
  
  return (
    <>
      <PanelHeader title="Complete Session" onClose={onClose} accent="#4a6640" onToggle={onToggle} collapsed={collapsed} />
      <div className="flex-1 overflow-y-auto px-[1.1rem]">
        <p className="m-0 mb-4 text-[13px] leading-[1.55]" style={{ color: 'hsl(145 15% 35%)' }}>
          Mark session with <strong>{displayName}</strong> as complete and add any notes.
        </p>
        <FormField label="Session Notes">
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            rows={4} 
            placeholder="How did the session go?" 
            className="w-full min-h-[96px] px-2.5 py-2 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-[hsl(145_15%_22%)] outline-none resize-y focus:border-[hsl(130_13%_50%)] focus:ring-2 focus:ring-[hsl(130_13%_50%/0.2)] transition-all duration-200 leading-relaxed"
          />
        </FormField>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={onComplete} 
            disabled={completing} 
            className="flex-1 h-9 rounded-lg border-none flex items-center justify-center gap-1.5 font-semibold cursor-pointer text-white transition-all duration-200 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#5a8a60' }}
          >
            <CheckCircle size={14} />
            {completing ? 'Saving…' : 'Complete Session'}
          </button>
          <button 
            onClick={onBack} 
            className="h-9 px-3.5 rounded-lg border border-[hsl(37_18%_86%)] bg-transparent text-[13px] text-[hsl(145_15%_38%)] font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-muted hover:text-foreground hover:shadow-sm active:scale-95"
          >
            Back
          </button>
        </div>
      </div>
    </>
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