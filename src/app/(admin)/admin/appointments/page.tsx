'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import useSWR from 'swr';
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
import { OVERNIGHT_SLEEPOVER_NDIS_CODE } from '@/lib/appointment-pricing';
import type { AppointmentWithClient } from '@/repositories/appointments.repository';
import type { Client } from '@/db/schema/clients';
import type { NdisPricing } from '@/db/schema/ndis_pricing';
import { colors, getClientPalette, GROUP_PALETTE } from '@/styles/botanical';
import { apiDataFetcher } from '@/lib/api-swr-fetcher';
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
import { BookingTimeSelect, SessionTimePreview } from './_components/BookingTimeSelect';

function CalendarSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30 text-sm text-muted-foreground animate-pulse">
      Loading calendar…
    </div>
  );
}

const ScheduleCalendar = dynamic(() => import('./_components/ScheduleCalendar'), {
  ssr: false,
  loading: () => <CalendarSkeleton />,
});

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

  const appointmentsKey = `/api/appointments?weekStart=${formatDateForInput(weekStart)}`;

  const {
    data: appointments = [],
    isLoading: loading,
    mutate: mutateAppointments,
  } = useSWR(
    appointmentsKey,
    (url: string) => apiDataFetcher<AppointmentWithClient[]>(url),
    {
      revalidateOnFocus: false,
      onError: () => toast.error('Failed to load appointments'),
    },
  );

  const { data: clients = [] } = useSWR(
    '/api/clients?limit=100',
    (url: string) => apiDataFetcher<Client[]>(url),
    { revalidateOnFocus: false },
  );

  const { data: rateCodes = [] } = useSWR(
    '/api/ndis-pricing',
    (url: string) => apiDataFetcher<NdisPricing[]>(url),
    { revalidateOnFocus: false },
  );

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithClient | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);


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
    end_date: '', // For overnight sleepovers: end date when different from start date
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
      setPanelClosing(false);
      setFormData({
        client_id: '',
        date: '',
        start_time: '',
        duration: '60',
        end_time: '',
        end_date: '',
        notes: '',
        is_group: false,
        rate_code: '',
        participants: [],
        status: 'confirmed',
      });
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
      end_date: '',
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
    const startDate = new Date(selectedAppointment.starts_at);
    const endDate = new Date(selectedAppointment.ends_at);
    const startDateStr = formatDateForInput(startDate);
    const endDateStr = formatDateForInput(endDate);
    const isOvernight = startDateStr !== endDateStr;
    setFormData({
      client_id: selectedAppointment.client_id || '',
      date: startDateStr,
      start_time: formatTimeForInput(startDate),
      duration: isOvernight ? 'overnight' : 'custom',
      end_time: formatTimeForInput(endDate),
      end_date: isOvernight ? endDateStr : '',
      notes: selectedAppointment.notes || '',
      is_group: selectedAppointment.is_group || false,
      rate_code: selectedAppointment.rate_code || '',
      participants: selectedAppointment.participants?.map(p => p.client_id) || [],
      status: selectedAppointment.status === 'pending' ? 'pending' : 'confirmed',
    });
    setPanelMode('edit');
  };

  // ============================================================================
  // FULLCALENDAR HANDLERS
  // ============================================================================

  // FullCalendar: slot selection (creates new appointment)
  const handleSlotSelect = (date: Date, startTime: string, endTime: string, endDate?: Date) => {
    setSelectedAppointment(null);
    const dateStr = formatDateForInput(date);
    const isOvernight = endDate && formatDateForInput(endDate) !== dateStr;
    setFormData({
      client_id: '',
      date: formatDateForInput(date),
      start_time: startTime,
      duration: isOvernight ? 'overnight' : 'custom',
      end_time: endTime,
      end_date: isOvernight ? formatDateForInput(endDate!) : '',
      notes: '',
      is_group: false,
      rate_code: '',
      participants: [],
      status: 'confirmed',
    });
    openPanel('new');
  };

  // FullCalendar: drag-drop reschedule with optimistic update
  const handleAppointmentDrop = async (appointmentId: string, newStart: Date, newEnd: Date) => {
    const previousAppointments = appointments;

    const optimistic = appointments.map(appt => {
      if (appt.id === appointmentId) {
        return { ...appt, starts_at: newStart, ends_at: newEnd };
      }
      return appt;
    });
    void mutateAppointments(optimistic, { revalidate: false });

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
        await mutateAppointments();
      } else {
        toast.error(data.message || 'Failed to reschedule');
        void mutateAppointments(previousAppointments, { revalidate: false });
      }
    } catch {
      toast.error('Failed to reschedule');
      void mutateAppointments(previousAppointments, { revalidate: false });
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

  const handleQuickBill = async () => {
    if (!selectedAppointment) return;
    
    // For uninvoiced appointments, build the appointment_ids array
    // Group sessions use composite IDs (apptId-clientId) for each participant
    // Solo sessions use just the appointment ID
    const appointmentIds = selectedAppointment.is_group
      ? selectedAppointment.participants?.map(p => `${selectedAppointment.id}-${p.client_id}`) || []
      : [selectedAppointment.id];
    
    // Use default due date (14 days from now)
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    const dueDateStr = formatDateForInput(defaultDue);
    
    try {
      const res = await fetch('/api/invoices/bill-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedAppointment.client_id || '',
          due_date: dueDateStr,
          auto_email: false,
          appointment_ids: appointmentIds,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(`Invoice ${data.data.invoice_number} created and issued`);
        await mutateAppointments();
        closePanel();
      } else {
        toast.error(data.error?.message || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Failed to quick bill:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const startDate = new Date(`${formData.date}T${formData.start_time}:00`);
      const endDateStr = formData.duration === 'overnight' && formData.end_date
        ? formData.end_date
        : formData.date;
      const endDate = new Date(`${endDateStr}T${formData.end_time}:00`);

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

      const url =
        panelMode === 'edit' && selectedAppointment
          ? `/api/appointments/${selectedAppointment.id}`
          : '/api/appointments';
      const method = panelMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(panelMode === 'edit' ? 'Session rescheduled' : 'Session booked');
        await mutateAppointments();
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
        await mutateAppointments();
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

  const handleComplete = async (notes: string) => {
    if (!selectedAppointment) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Session completed');
        await mutateAppointments();
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

  // Removed handleConfirm function - confirm step is now merged into complete action

  // ============================================================================
  // MINI CALENDAR
  // ============================================================================

  const miniDays = getMiniCalendarDays(miniYear, miniMonth);
  const miniMonthName = new Date(miniYear, miniMonth, 1).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  });
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
        <h1 className="font-heading text-lg font-semibold text-foreground m-0">Schedule</h1>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-[220px] hidden md:flex flex-col bg-card border-r border-primary p-5 gap-6 overflow-y-auto flex-shrink-0">
          {/* Mini calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  const d = new Date(miniYear, miniMonth - 1, 1);
                  setMiniMonth(d.getMonth());
                  setMiniYear(d.getFullYear());
                }}
                className="w-[22px] h-[22px] rounded border-none bg-transparent cursor-pointer flex items-center justify-center text-secondary"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[11px] font-semibold text-foreground tracking-[0.04em] uppercase">
                {miniMonthName}
              </span>
              <button
                onClick={() => {
                  const d = new Date(miniYear, miniMonth + 1, 1);
                  setMiniMonth(d.getMonth());
                  setMiniYear(d.getFullYear());
                }}
                className="w-[22px] h-[22px] rounded border-none bg-transparent cursor-pointer flex items-center justify-center text-secondary"
              >
                <ChevronRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-0.75">
              {DOW_LABELS.map((l, i) => (
                <div key={i} className="text-center text-[10px] font-semibold text-faint py-0.5">
                  {l}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {miniDays.map((d, i) => {
                if (d === null) return <div key={i} />;
                const isT =
                  d === today.getDate() &&
                  miniMonth === today.getMonth() &&
                  miniYear === today.getFullYear();
                const inWeek = isDayInCurrentWeek(d, miniMonth, miniYear);
                return (
                  <button
                    key={i}
                    onClick={() => jumpToWeekContaining(d)}
                    className="w-full aspect-square rounded-full border-none cursor-pointer transition-colors duration-150 hover:bg-primary/7"
                    style={{
                      fontSize: 'var(--font-size-badge)',
                      fontWeight: isT ? 700 : inWeek ? 600 : 400,
                      background: isT
                        ? 'hsl(130 13% 50%)'
                        : inWeek
                          ? 'hsl(130 13% 50% / 0.12)'
                          : 'transparent',
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
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-secondary mb-3">
              This Week
            </p>
            <div className="flex flex-col gap-2">
              <StatPill
                label="Total"
                value={weekTotal}
                color="hsl(145 15% 35%)"
                bg="hsl(145 15% 35% / 0.08)"
              />
              <StatPill
                label="Upcoming"
                value={weekConfirmed}
                color="#5a7fa8"
                bg="rgba(90,127,168,0.10)"
              />
              <StatPill
                label="Completed"
                value={weekCompleted}
                color="#5a8a60"
                bg="rgba(90,138,96,0.10)"
              />
            </div>
          </div>

          <div className="h-px bg-primary" />

          <div>
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-secondary mb-2.5">
              Status
            </p>
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
              panelVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
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
            (!panelVisible || panelMode === 'empty' || panelClosing) && 'translate-y-full',
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
                onComplete={() => setPanelMode('complete')}
                onQuickBill={handleQuickBill}
                completing={completing}
                onToggle={() => setPanelCollapsed(!panelCollapsed)}
                collapsed={panelCollapsed}
              />
            )}
            {(panelMode === 'new' || panelMode === 'edit') && (
              <FormPanel
                panelMode={panelMode}
                formData={formData}
                setFormData={setFormData}
                clients={clients}
                rateCodes={rateCodes}
                onClose={closePanel}
                onSubmit={handleSubmit}
                saving={saving}
                onToggle={() => setPanelCollapsed(!panelCollapsed)}
                collapsed={panelCollapsed}
              />
            )}
            {panelMode === 'deleteConfirm' && selectedAppointment && (
              <DeletePanel
                appt={selectedAppointment}
                onClose={closePanel}
                onBack={() => setPanelMode('view')}
                onDelete={handleDelete}
                deleting={deleting}
                onToggle={() => setPanelCollapsed(!panelCollapsed)}
                collapsed={panelCollapsed}
              />
            )}
            {panelMode === 'complete' && selectedAppointment && (
              <CompletePanel
                appt={selectedAppointment}

                onClose={closePanel}
                onBack={() => setPanelMode('view')}
                onComplete={handleComplete}
                completing={completing}
                onToggle={() => setPanelCollapsed(!panelCollapsed)}
                collapsed={panelCollapsed}
              />
            )}
          </div>
        </div>

        {/* DESKTOP RIGHT SLIDE-OUT */}
        <aside
          className={cn(
            'hidden md:flex flex-col overflow-hidden bg-card border-l border-primary flex-shrink-0',
            'transition-[width] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            !(panelVisible && panelMode !== 'empty' && !panelClosing) && 'md:w-0 md:border-l-0',
            panelVisible &&
              panelMode !== 'empty' &&
              !panelClosing &&
              !panelCollapsed &&
              'md:w-[360px]',
            panelVisible && panelMode !== 'empty' && !panelClosing && panelCollapsed && 'md:w-12',
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
                panelVisible && panelMode !== 'empty'
                  ? 'opacity-100 translate-x-0 md:delay-75'
                  : 'opacity-0 translate-x-4 md:delay-0',
              )}
            >
              {panelMode === 'view' && selectedAppointment && (
                <ViewPanel
                  appt={selectedAppointment}
                  clients={clients}
                  onClose={closePanel}
                  onEdit={openEditMode}
                  onDelete={() => setPanelMode('deleteConfirm')}
                  onComplete={() => setPanelMode('complete')}
                  onQuickBill={handleQuickBill}
                  completing={completing}
                  onToggle={() => setPanelCollapsed(!panelCollapsed)}
                  collapsed={panelCollapsed}
                />
              )}
              {(panelMode === 'new' || panelMode === 'edit') && (
                <FormPanel
                  panelMode={panelMode}
                  formData={formData}
                  setFormData={setFormData}
                  clients={clients}
                  rateCodes={rateCodes}
                  onClose={closePanel}
                  onSubmit={handleSubmit}
                  saving={saving}
                  onToggle={() => setPanelCollapsed(!panelCollapsed)}
                  collapsed={panelCollapsed}
                />
              )}
              {panelMode === 'deleteConfirm' && selectedAppointment && (
                <DeletePanel
                  appt={selectedAppointment}
                  onClose={closePanel}
                  onBack={() => setPanelMode('view')}
                  onDelete={handleDelete}
                  deleting={deleting}
                  onToggle={() => setPanelCollapsed(!panelCollapsed)}
                  collapsed={panelCollapsed}
                />
              )}
              {panelMode === 'complete' && selectedAppointment && (
                <CompletePanel
                  appt={selectedAppointment}

                  onClose={closePanel}
                  onBack={() => setPanelMode('view')}
                  onComplete={handleComplete}
                  completing={completing}
                  onToggle={() => setPanelCollapsed(!panelCollapsed)}
                  collapsed={panelCollapsed}
                />
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

function StatPill({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-2 py-1 rounded-lg"
      style={{ background: bg }}
    >
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
// NEXT ACTION SYSTEM
// ============================================================================

type NextAction = {
  label: string;
  icon: React.ElementType;
  action: () => void;
  variant?: 'primary' | 'secondary';
};

function getNextAction(
  appt: AppointmentWithClient,
  onComplete: () => void,
  onPrepareInvoice: () => void,
  onQuickBill: () => void,
): NextAction | null {
  const { status, invoiced } = appt;

  if (status === 'cancelled') {
    return null;
  }

  if (status === 'completed') {
    if (invoiced) {
      // Already invoiced - no action needed
      return null;
    }
    // Completed but not invoiced - show quick bill option
    return {
      label: 'Quick Bill',
      icon: FileText,
      action: onQuickBill,
      variant: 'primary',
    };
  }

  // pending or confirmed - mark complete
  return {
    label: 'Mark Complete',
    icon: CheckCircle,
    action: onComplete,
    variant: 'primary',
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

// ============================================================================
// VIEW PANEL
// ============================================================================

function ViewPanel({
  appt,
  clients,
  onClose,
  onEdit,
  onDelete,
  onComplete,
  onToggle,
  collapsed,
  onQuickBill,
}: {
  appt: AppointmentWithClient;
  clients: Client[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onToggle?: () => void;
  collapsed?: boolean;
  onQuickBill?: () => void;
}) {
  const palette = getClientPalette(appt.client_id || appt.title || 'unknown');

  const handlePrepareInvoice = () => {
    // Navigate to invoices page with client filter
    const params = new URLSearchParams({
      tab: 'generate',
      clientId: appt.client_id || '',
    });
    window.location.href = `/admin/invoices?${params.toString()}`;
  };

  const nextAction = getNextAction(appt, onComplete, handlePrepareInvoice, onQuickBill || (() => {}));

  const start = new Date(appt.starts_at);
  const end = new Date(appt.ends_at);
  const durationMs = end.getTime() - start.getTime();
  const durationHrs = durationMs / (1000 * 60 * 60);
  const isOvernight = formatDateForInput(start) !== formatDateForInput(end);

  // Calculate estimated total for inline preview
  let estimatedTotal = 0;
  let hourlyRate = 0;
  let travelKmCost = 0;

  if (appt.rate_code) {
    const matchingRate = rateCodes?.find(rc => rc.code === appt.rate_code);
    if (matchingRate) {
      hourlyRate = parseFloat(matchingRate.price);
      estimatedTotal = hourlyRate * durationHrs;
    }
  }

  if (appt.travel_km) {
    travelKmCost = parseFloat(String(appt.travel_km)) * 0.85; // Standard travel rate
    estimatedTotal += travelKmCost;
  }

  const statusColor = appt.status === 'completed'
    ? { bg: 'var(--status-completed-bg)', text: 'var(--status-completed-text)', dot: 'var(--status-completed-dot)' }
    : appt.status === 'confirmed'
    ? { bg: 'var(--status-confirmed-bg)', text: 'var(--status-confirmed-text)', dot: 'var(--status-confirmed-dot)' }
    : { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)', dot: 'var(--status-pending-dot)' };

  const clientName = appt.is_group
    ? 'Group Session'
    : appt.client?.name ?? 'Unknown';

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />

      <div className="h-[3px] w-full flex-shrink-0" style={{ background: palette.dot }} />

      <PanelHeader
        showAccentBar={false}
        breadcrumb="Schedule"
        title="Session details"
        onClose={onClose}
        onToggle={onToggle}
        collapsed={collapsed}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        {/* Hero Section */}
        <div
          className={cn(
            'rounded-xl p-4 border',
            'bg-gradient-to-br from-card to-mutedBg/40',
            'border-[var(--color-semantic-border-default)]'
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-[16px] font-semibold text-foreground leading-tight mb-1">
                {clientName}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {appt.is_group && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--status-group-bg)] text-[var(--status-group-text)] flex items-center gap-1">
                    <Users size={9} />
                    {appt.participants?.length || appt.group_size || 0}
                  </span>
                )}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: statusColor.bg, color: statusColor.text }}
                >
                  {appt.status}
                </span>
                {appt.invoiced && (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FileText size={8} />
                    Invoiced
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-foreground">
              <Calendar size={13} className="text-muted-foreground" />
              {start.toLocaleDateString('en-AU', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-foreground">
              <Clock size={13} className="text-muted-foreground" />
              {formatTimeRange(start, end)}
              {isOvernight && (
                <span className="text-[11px] text-muted-foreground ml-1">
                  (Overnight)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Inline Invoice Preview - show if not pending/cancelled */}
        {appt.status !== 'pending' && appt.status !== 'cancelled' && (
          <div>
            <SectionLabel>Invoice Preview</SectionLabel>
            <div
              className={cn(
                'rounded-lg p-4 border',
                'bg-gradient-to-br from-[var(--color-semantic-brand-primary)]/6 to-[var(--color-semantic-brand-primary)]/3',
                'border-[var(--color-semantic-brand-primary)]/25'
              )}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-muted-foreground">Duration</span>
                  <span className="text-[12px] font-medium text-foreground">
                    {formatDuration(durationHrs)}
                  </span>
                </div>
                {hourlyRate > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-muted-foreground">Rate</span>
                    <span className="text-[12px] font-medium text-foreground">
                      ${hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                )}
                {appt.travel_km && (
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-muted-foreground">Travel</span>
                    <span className="text-[12px] font-medium text-foreground">
                      {appt.travel_km} km × $0.85 = ${travelKmCost.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-[var(--color-semantic-border-default)] my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-semibold text-foreground">Estimated Total</span>
                  <span className="text-[15px] font-bold text-foreground">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Section */}
        <div>
          <SectionLabel>Details</SectionLabel>
          <div className="space-y-0 divide-y divide-primary/50">
            <MetaRow
              label="Status"
              value={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            />
            {appt.rate_code && (
              <MetaRow
                label="Rate Code"
                value={appt.rate_code}
              />
            )}
            <MetaRow
              label="Duration"
              value={formatDuration(durationHrs)}
            />
            {isOvernight && (
              <MetaRow
                label="End Date"
                value={end.toLocaleDateString('en-AU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            )}
          </div>
        </div>

        {/* Notes */}
        {appt.notes && (
          <div>
            <SectionLabel>Notes</SectionLabel>
            <div className="rounded-lg bg-muted/60 border border-[var(--color-semantic-border-default)] p-3">
              <p className="text-[12px] text-secondary leading-relaxed whitespace-pre-wrap">
                {appt.notes}
              </p>
            </div>
          </div>
        )}

        <div className="h-2" />
      </div>

      <PanelFooter>
        {nextAction && (
          <PrimaryBtn
            onClick={nextAction.action}
            className={cn(nextAction.variant === 'secondary' && 'bg-[var(--color-semantic-brand-muted)]')}
          >
            <nextAction.icon size={14} />
            {nextAction.label}
          </PrimaryBtn>
        )}
        <div className="flex gap-2">
          <SecondaryBtn type="button" onClick={onEdit}>
            <Pencil size={13} />
            Edit
          </SecondaryBtn>
          <DangerBtn type="button" onClick={onDelete}>
            <Trash2 size={13} />
            Delete
          </DangerBtn>
        </div>
      </PanelFooter>
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
    <span
      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const inputClasses =
  'w-full h-9 px-3 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200';
const textareaClasses =
  'w-full min-h-[72px] py-2 px-3 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)] text-[13px] text-foreground outline-none resize-y focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 leading-relaxed';

// ============================================================================
// FORM PANEL
// ============================================================================

function FormPanel({
  panelMode,
  formData,
  setFormData,
  clients,
  rateCodes,
  onClose,
  onSubmit,
  saving,
  onToggle,
  collapsed,
}: {
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

  const addParticipant = () =>
    setFormData({ ...formData, participants: [...formData.participants, ''] });
  const removeParticipant = (index: number) =>
    setFormData({
      ...formData,
      participants: formData.participants.filter((_: any, i: number) => i !== index),
    });
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
                onClick={() =>
                  setFormData({ ...formData, is_group: false, participants: [], rate_code: '' })
                }
                className={cn(
                  'flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all',
                  !isGroup
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground',
                )}
              >
                <User size={14} /> Individual
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    is_group: true,
                    client_id: '',
                    rate_code:
                      formData.duration === 'overnight'
                        ? OVERNIGHT_SLEEPOVER_NDIS_CODE
                        : formData.rate_code,
                  })
                }
                className={cn(
                  'flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all',
                  isGroup
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground',
                )}
              >
                <Users size={14} /> Group
              </button>
            </div>
          </FormField>

          {!isGroup && (
            <FormField label="Client">
              <select
                value={formData.client_id}
                onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                required
                className={cn(inputClasses, 'cursor-pointer')}
              >
                <option value="">Select a client…</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {isGroup && (
            <>
              <FormField label="Rate code">
                {formData.duration === 'overnight' ? (
                  <div
                    className={cn(
                      inputClasses,
                      'flex items-center text-[12px] text-muted-foreground cursor-default',
                    )}
                  >
                    {OVERNIGHT_SLEEPOVER_NDIS_CODE} — Night-Time Sleepover (automatic for overnight)
                  </div>
                ) : (
                  <select
                    value={formData.rate_code}
                    onChange={e => setFormData({ ...formData, rate_code: e.target.value })}
                    required
                    className={cn(inputClasses, 'cursor-pointer')}
                  >
                    <option value="">Select a rate code…</option>
                    {rateCodes.map(rc => (
                      <option key={rc.id} value={rc.support_item_code}>
                        {rc.support_item_code} — {rc.support_item_name}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
              <FormField label={`Participants (${participantCount}) — split evenly`}>
                <div className="flex flex-col gap-2">
                  {formData.participants.map((clientId: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={clientId}
                        onChange={e => updateParticipant(idx, e.target.value)}
                        required
                        className={cn(inputClasses, 'flex-1 cursor-pointer')}
                      >
                        <option value="">Select…</option>
                        {clients
                          .filter(c => !formData.participants.includes(c.id) || c.id === clientId)
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeParticipant(idx)}
                        className="w-7 h-7 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] flex items-center justify-center text-[hsl(145_15%_35%)] hover:bg-[hsl(42_26%_87%)] hover:text-destructive hover:border-destructive/40 transition-colors flex-shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="h-8 rounded-lg border border-dashed border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)]/50 text-[12px] text-[hsl(145_15%_35%)] flex items-center justify-center gap-1 hover:bg-[hsl(42_26%_92%)] hover:border-[hsl(34_22%_68%)] hover:text-foreground transition-colors"
                  >
                    <Plus size={12} /> Add participant
                  </button>
                </div>
              </FormField>
            </>
          )}

          <FormField label="Date">
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
              className={inputClasses}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-2 items-start">
            <BookingTimeSelect
              label="Start time"
              value={formData.start_time}
              onChange={start_time => setFormData({ ...formData, start_time })}
              className={inputClasses}
            />
            <FormField label="Duration">
              <select
                value={formData.duration}
                onChange={e => {
                  const dur = e.target.value;
                  let end_time = formData.end_time;
                  let end_date = formData.end_date;
                  if (dur === 'overnight') {
                    // Default: end next day at 8am
                    const start = new Date(`${formData.date}T${formData.start_time}:00`);
                    const nextDay = new Date(start);
                    nextDay.setDate(nextDay.getDate() + 1);
                    end_date = formatDateForInput(nextDay);
                    end_time = '08:00';
                  } else if (dur !== 'custom') {
                    const [h, m] = formData.start_time.split(':').map(Number);
                    const total = h * 60 + m + parseInt(dur);
                    const endH = Math.floor(total / 60) % 24;
                    const endM = total % 60;
                    end_time = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                    end_date = '';
                  } else {
                    end_date = '';
                  }
                  const rate_code =
                    dur === 'overnight' && formData.is_group
                      ? OVERNIGHT_SLEEPOVER_NDIS_CODE
                      : dur !== 'overnight' && formData.is_group && formData.rate_code === OVERNIGHT_SLEEPOVER_NDIS_CODE
                        ? ''
                        : formData.rate_code;
                  setFormData({ ...formData, duration: dur, end_time, end_date, rate_code });
                }}
                className={cn(inputClasses, 'cursor-pointer')}
              >
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="overnight">Overnight sleepover</option>
                <option value="custom">Custom</option>
              </select>
            </FormField>
          </div>

          {(formData.duration === 'custom' || formData.duration === 'overnight') && (
            <>
              {formData.duration === 'overnight' && (
                <FormField label="End date">
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    min={formData.date}
                    className={inputClasses}
                  />
                </FormField>
              )}
              <BookingTimeSelect
                label="End time"
                value={formData.end_time}
                onChange={end_time => setFormData({ ...formData, end_time })}
                className={inputClasses}
              />
            </>
          )}

          <SessionTimePreview
            dateStr={formData.date}
            startHHmm={formData.start_time}
            endHHmm={formData.end_time}
            endDateStr={formData.end_date}
            duration={formData.duration}
          />

          <FormField label="Status">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pending' })}
                className={cn(
                  'flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all',
                  formData.status === 'pending'
                    ? 'border-[rgba(182,148,112,0.4)] bg-[rgba(182,148,112,0.10)] text-[#6b4d2f]'
                    : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground',
                )}
              >
                <Clock size={14} /> Pending
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'confirmed' })}
                className={cn(
                  'flex-1 h-9 rounded-lg border font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all',
                  formData.status === 'confirmed'
                    ? 'border-[rgba(120,149,170,0.4)] bg-[rgba(120,149,170,0.10)] text-[#2d4a5c]'
                    : 'border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] hover:text-foreground',
                )}
              >
                <CheckCircle size={14} /> Confirmed
              </button>
            </div>
          </FormField>

          <FormField label="Notes (optional)">
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Session notes…"
              className={textareaClasses}
            />
          </FormField>

          <PanelFooter>
            <div className="flex gap-2">
              <PrimaryBtn
                type="submit"
                loading={saving}
                loadingLabel="Saving…"
                disabled={
                  (isGroup && formData.participants.length < 2) ||
                  (isGroup && formData.duration !== 'overnight' && !formData.rate_code)
                }
                className="flex-1"
              >
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

function DeletePanel({
  appt,
  onClose,
  onBack,
  onDelete,
  deleting,
  onToggle,
  collapsed,
}: {
  appt: AppointmentWithClient;
  onClose: () => void;
  onBack: () => void;
  onDelete: () => void;
  deleting: boolean;
  onToggle?: () => void;
  collapsed?: boolean;
}) {
  const isGroup = appt.is_group;
  const displayName = isGroup
    ? `Group Session (${appt.participants?.length || 0} participants)`
    : (appt.client?.name ?? 'Unknown');
  const initials = isGroup
    ? ''
    : (appt.client?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? '?');
  const formattedDate = new Date(appt.starts_at).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = formatTimeRange(new Date(appt.starts_at), new Date(appt.ends_at));

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: ACCENT.cancel }}
        aria-hidden
      />

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
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-4 border',
            'animate-in fade-in-0 zoom-in-[0.98] duration-200',
          )}
          style={{ background: 'rgba(160,64,64,0.08)', borderColor: 'rgba(160,64,64,0.25)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: ACCENT.cancel }}
          >
            {isGroup ? (
              <Users size={16} color="#fff" />
            ) : (
              <span className="text-[13px] font-medium text-white">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-[15px] font-semibold text-foreground truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formattedDate} · {formattedTime}
            </p>
          </div>
        </div>

        <div>
          <SectionLabel>Session</SectionLabel>
          <div className="divide-y divide-primary/50">
            <MetaRow label="Date" value={formattedDate} />
            <MetaRow label="Time" value={formattedTime} />
          </div>
        </div>

        <div
          className="rounded-lg px-3 py-2.5 flex gap-2 items-start"
          style={{ background: 'rgba(160,64,64,0.07)', border: '1px solid rgba(160,64,64,0.2)' }}
        >
          <AlertCircle size={16} color="#a04040" className="mt-0.5 flex-shrink-0" />
          <p className="m-0 text-[12px] leading-relaxed" style={{ color: '#7a3030' }}>
            Cancel session with <strong>{displayName}</strong>? This cannot be undone.
          </p>
        </div>

        <PanelFooter>
          <div className="flex gap-2">
            <DangerBtn
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="flex-1 hover:opacity-90"
              style={{
                borderColor: 'rgba(160,64,64,0.4)',
                background: ACCENT.cancel,
                color: '#fff',
              }}
            >
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

function CompletePanel({
  appt,
  onClose,
  onBack,
  onComplete,
  completing,
  onToggle,
  collapsed,
}: {
  appt: AppointmentWithClient;
  onClose: () => void;
  onBack: () => void;
  onComplete: (notes: string) => void;
  completing: boolean;
  onToggle?: () => void;
  collapsed?: boolean;
}) {
  const [notes, setNotes] = useState('');
  const isGroup = appt.is_group;
  const displayName = isGroup
    ? `Group Session (${appt.participants?.length || 0} participants)`
    : (appt.client?.name ?? 'Unknown');
  const initials = isGroup
    ? ''
    : (appt.client?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? '?');
  const formattedDate = new Date(appt.starts_at).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = formatTimeRange(new Date(appt.starts_at), new Date(appt.ends_at));

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: ACCENT.complete }}
        aria-hidden
      />

      <PanelHeader
        breadcrumb="Schedule"
        title="Complete session"
        showAccentBar={false}
        onClose={onClose}
        onToggle={onToggle}
        collapsed={collapsed}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-4 border',
            'animate-in fade-in-0 zoom-in-[0.98] duration-200',
          )}
          style={{ background: 'rgba(90,138,96,0.10)', borderColor: 'rgba(90,138,96,0.28)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: ACCENT.complete }}
          >
            {isGroup ? (
              <Users size={16} color="#fff" />
            ) : (
              <span className="text-[13px] font-medium text-white">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-[15px] font-semibold text-foreground truncate">
              {displayName}
            </p>
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
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How did the session go?"
            minLength={0}
            className={cn(textareaClasses, 'min-h-[80px]')}
          />
        </FormField>

        <PanelFooter>
          <div className="flex gap-2">
            <PrimaryBtn
              onClick={() => onComplete(notes)}
              loading={completing}
              loadingLabel="Saving…"
              style={{ background: ACCENT.complete }}
              className="flex-1 hover:opacity-90"
            >
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
