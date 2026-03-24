'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  EventInput,
  EventContentArg,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  DatesSetArg,
} from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import type { AppointmentWithClient } from '@/repositories/appointments.repository';
import type { Client } from '@/db/schema/clients';
import { getAppointmentStatusStyle, getClientPalette, GROUP_PALETTE, colors } from '@/styles/botanical';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ScheduleCalendarProps {
  appointments: AppointmentWithClient[];
  clients: Client[];
  selectedId?: string;
  loading?: boolean;
  targetDate?: Date; // Add this prop - when changed, calendar navigates to this date
  onAppointmentClick: (appointment: AppointmentWithClient) => void;
  onSlotSelect: (date: Date, startTime: string, endTime: string, endDate?: Date) => void;
  onAppointmentDrop: (appointmentId: string, newStart: Date, newEnd: Date) => void;
  onAppointmentResize: (appointmentId: string, newStart: Date, newEnd: Date) => void;
  onDateRangeChange: (start: Date, end: Date) => void;
}

// ============================================================================
// RESPONSIVE VIEW HOOK
// ============================================================================

function useResponsiveView() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return { isMobile, isTablet };
}

// ============================================================================
// APPOINTMENT → FC EVENT TRANSFORM
// ============================================================================

function appointmentToEvent(appt: AppointmentWithClient): EventInput {
  const palette = getAppointmentStatusStyle(appt.status || 'confirmed', appt.invoiced);
  const isGroup = appt.is_group;
  const displayName = isGroup
    ? `Group (${appt.participants?.length || appt.group_size || 0})`
    : (appt.client?.name ?? 'Unknown');

  return {
    id: appt.id,
    title: displayName,
    start: appt.starts_at,
    end: appt.ends_at,
    editable: appt.status !== 'completed' && appt.status !== 'cancelled' && !appt.invoiced,
    extendedProps: {
      appointment: appt,
      status: appt.status,
      isGroup,
      clientName: appt.client?.name ?? 'Unknown',
      clientId: appt.client_id,
      invoiced: appt.invoiced,
      participants: appt.participants,
      notes: appt.notes,
      palette,
    },
  };
}

// ============================================================================
// CUSTOM EVENT RENDERER
// ============================================================================

function EventContent({
  eventInfo,
  selectedId,
}: {
  eventInfo: EventContentArg;
  selectedId?: string;
}) {
  const { event } = eventInfo;
  // Get props with fallbacks for select mirror events (which don't have our custom props)
  const extendedProps = event.extendedProps || {};
  const palette = extendedProps.palette || getAppointmentStatusStyle('confirmed');
  const isGroup = extendedProps.isGroup || false;
  const clientName = extendedProps.clientName || 'New Session';
  const status = extendedProps.status || 'confirmed';
  const invoiced = extendedProps.invoiced || false;
  const isSelected = event.id === selectedId;
  const isTimeGrid = eventInfo.view.type.startsWith('timeGrid');
  const isList = eventInfo.view.type.startsWith('list');

  // --- List view ---
  if (isList) {
    return (
      <div className="flex items-center gap-2 py-0.5 w-full">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: palette.dot }} />
        <span className="text-[13px] font-semibold text-foreground truncate">{event.title}</span>
        <span
          className="text-[10px] font-semibold px-1.5 py-px rounded-full capitalize ml-auto flex-shrink-0"
          style={{ background: palette.bg, color: palette.text }}
        >
          {status}
        </span>
        {invoiced && (
          <span className="text-[9px] font-semibold text-muted-foreground bg-muted/50 px-1 py-px rounded-full flex-shrink-0">
            Inv
          </span>
        )}
      </div>
    );
  }

  // --- Month / DayGrid view ---
  if (!isTimeGrid) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 px-1 py-px rounded overflow-hidden w-full',
          isSelected && 'ring-1 ring-offset-1',
        )}
        style={{ background: palette.bg }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: palette.dot }}
        />
        <span className="text-[10px] font-semibold truncate" style={{ color: palette.text }}>
          {event.title}
        </span>
        {invoiced && (
          <span className="text-[8px] font-semibold text-muted-foreground/60 bg-muted/30 px-1 py-px rounded-full ml-auto flex-shrink-0">
            Inv
          </span>
        )}
      </div>
    );
  }

  // --- Time grid (week/day) — the main Google Cal-style card ---
  const durationMs =
    event.end && event.start ? event.end.getTime() - event.start.getTime() : 3600000;
  const durationMins = durationMs / 60000;
  const isShort = durationMins <= 30;
  const isTiny = durationMins <= 15;

  return (
    <div
      className={cn(
        'w-full h-full rounded-[4px] overflow-hidden border-l-[3px] flex flex-col cursor-pointer',
        'transition-shadow duration-150',
        isSelected && 'ring-2 ring-offset-1 shadow-md',
      )}
      style={{
        background: palette.bg,
        borderLeftColor: palette.dot,
        borderTop: `1px solid ${palette.border}`,
        borderRight: `1px solid ${palette.border}`,
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      {isTiny ? (
        // Very short: single-line — name + time inline
        <div className="flex items-center gap-1 px-1.5 h-full min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: palette.dot }}
          >
            {isGroup ? (
              <Users size={6} color="#fff" />
            ) : (
              <span className="text-[5px] font-bold text-white">
                {clientName?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <span
            className="text-[10px] font-semibold truncate leading-none"
            style={{ color: palette.text }}
          >
            {event.title}
          </span>
          <span
            className="text-[8px] ml-auto flex-shrink-0 leading-none"
            style={{ color: palette.text, opacity: 0.6 }}
          >
            {event.start?.toLocaleTimeString('en-AU', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>
      ) : isShort ? (
        // Short (30 min): name on top, time below — compact
        <div className="flex flex-col justify-center px-1.5 py-0.5 h-full min-w-0 gap-0">
          <div className="flex items-center gap-1 min-w-0">
            <div
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: palette.dot }}
            >
              {isGroup ? (
                <Users size={7} color="#fff" />
              ) : (
                <span className="text-[6px] font-bold text-white">
                  {clientName?.[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <span
              className="text-[11px] font-semibold truncate leading-tight"
              style={{ color: palette.text }}
            >
              {event.title}
            </span>
          </div>
          <span
            className="text-[9px] pl-[18px] leading-tight truncate"
            style={{ color: palette.text, opacity: 0.6 }}
          >
            {event.start?.toLocaleTimeString('en-AU', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}{' '}
            –{' '}
            {event.end?.toLocaleTimeString('en-AU', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>
      ) : (
        // Standard (1hr+): full layout with avatar, name, time, status
        <>
          <div className="flex items-center gap-1.5 px-2 pt-1.5 min-w-0">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: palette.dot }}
            >
              {isGroup ? (
                <Users size={9} color="#fff" />
              ) : (
                <span className="text-[8px] font-bold text-white">
                  {clientName
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <span
              className="text-[11px] font-semibold truncate leading-tight"
              style={{ color: palette.text }}
            >
              {event.title}
            </span>
          </div>
          <span
            className="text-[9px] px-2 mt-0.5 truncate leading-tight"
            style={{ color: palette.text, opacity: 0.6 }}
          >
            {event.start?.toLocaleTimeString('en-AU', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}{' '}
            –{' '}
            {event.end?.toLocaleTimeString('en-AU', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
          {durationMins >= 60 && (
            <div className="flex items-center gap-1 px-2 mt-auto pb-1">
              <span
                className="text-[8px] font-semibold px-1.5 py-px rounded-full capitalize"
                style={{
                  background: `${palette.dot}20`,
                  color: palette.text,
                }}
              >
                {status}
              </span>
              {invoiced && (
                <span className="text-[8px] font-semibold text-muted-foreground/60 bg-muted/30 px-1 py-px rounded-full">
                  Inv
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ScheduleCalendar({
  appointments,
  clients,
  selectedId,
  loading,
  targetDate, // Add this
  onAppointmentClick,
  onSlotSelect,
  onAppointmentDrop,
  onAppointmentResize,
  onDateRangeChange,
}: ScheduleCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useResponsiveView();

  // --- Transform appointments ---
  const events: EventInput[] = useMemo(() => appointments.map(appointmentToEvent), [appointments]);

  // --- Calculate smart scroll time ---
  // Google Cal behaviour: scroll so the current time is roughly 1/3 from top,
  // or if there are earlier appointments, scroll to show the first one.
  const scrollTime = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();

    if (appointments.length > 0) {
      // Find the earliest appointment today
      const todayAppts = appointments
        .filter(a => {
          const d = new Date(a.starts_at);
          return (
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        })
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

      if (todayAppts.length > 0) {
        const firstStart = new Date(todayAppts[0].starts_at);
        // Scroll to 1 hour before the first appointment
        const scrollHour = Math.max(0, firstStart.getHours() - 1);
        return `${scrollHour.toString().padStart(2, '0')}:00:00`;
      }
    }

    // No appointments today: scroll to 1 hour before current time (like Google Cal)
    const scrollHour = Math.max(0, currentHour - 1);
    return `${scrollHour.toString().padStart(2, '0')}:00:00`;
  }, [appointments]);

  // --- Responsive view switching ---
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    const currentView = api.view.type;
    const targetView = isMobile ? 'listDay' : isTablet ? 'timeGridDay' : 'timeGridWeek';

    if (currentView !== targetView) {
      // Defer view change to avoid flushSync warning during render
      setTimeout(() => api.changeView(targetView), 0);
    }
  }, [isMobile, isTablet]);

  // --- Navigate to target date when it changes (e.g., from mini calendar click) ---
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api || !targetDate) return;

    // Get the current visible date range
    const currentDate = api.getDate();
    
    // Calculate week starts for comparison
    const getCurrentWeekStart = (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const currentWeekStart = getCurrentWeekStart(currentDate);
    const targetWeekStart = getCurrentWeekStart(targetDate);

    // Only navigate if the week has actually changed
    if (currentWeekStart.getTime() !== targetWeekStart.getTime()) {
      // Defer to next tick to avoid flushSync error during React rendering
      setTimeout(() => api.gotoDate(targetDate), 0);
    }
  }, [targetDate]);

  // --- Resize observer to update calendar size when panel opens/closes ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce the update to avoid excessive recalculations
      requestAnimationFrame(() => {
        calendarRef.current?.getApi()?.updateSize();
      });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // --- Handlers ---
  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const appt = info.event.extendedProps.appointment as AppointmentWithClient;
      if (appt) onAppointmentClick(appt);
    },
    [onAppointmentClick],
  );

  const handleDateSelect = useCallback(
    (info: DateSelectArg) => {
      const startTime = info.start.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const endTime = info.end.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      onSlotSelect(info.start, startTime, endTime, info.end);
    },
    [onSlotSelect],
  );

  const handleEventDrop = useCallback(
    (info: EventDropArg) => {
      const { event } = info;
      if (!event.start || !event.end) {
        info.revert();
        return;
      }
      const appt = event.extendedProps.appointment as AppointmentWithClient;
      if (appt.invoiced || appt.status === 'completed' || appt.status === 'cancelled') {
        info.revert();
        return;
      }
      onAppointmentDrop(event.id, event.start, event.end);
    },
    [onAppointmentDrop],
  );

  const handleEventResize = useCallback(
    (info: EventResizeDoneArg) => {
      const { event } = info;
      if (!event.start || !event.end) {
        info.revert();
        return;
      }
      const appt = event.extendedProps.appointment as AppointmentWithClient;
      if (appt.invoiced || appt.status === 'completed' || appt.status === 'cancelled') {
        info.revert();
        return;
      }
      onAppointmentResize(event.id, event.start, event.end);
    },
    [onAppointmentResize],
  );

  const handleDatesSet = useCallback(
    (info: DatesSetArg) => {
      onDateRangeChange(info.start, info.end);
    },
    [onDateRangeChange],
  );

  // Handle single click on empty calendar cells
  const handleDateClick = useCallback(
    (info: { date: Date; view: { type: string } }) => {
      // Only handle clicks in timeGrid views (week/day) - not month or list views
      if (info.view.type.startsWith('timeGrid')) {
        const startTime = info.date.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        // Default to 1-hour session
        const endHour = info.date.getHours() + 1;
        const endDate = new Date(info.date);
        endDate.setHours(endHour);
        const endTime = endDate.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        onSlotSelect(info.date, startTime, endTime);
      }
    },
    [onSlotSelect],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'fc-botanical h-full',
        loading && 'opacity-60 pointer-events-none transition-opacity',
      )}
    >
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        // --- View ---
        initialView={isMobile ? 'listDay' : 'timeGridWeek'}
        // --- Toolbar ---
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        // --- Time grid: extend range for overnight sleepover appointments ---
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        slotDuration="00:15:00" // 15-min snap precision (like Google Cal)
        slotLabelInterval="01:00:00" // Show label every hour
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        scrollTime={scrollTime} // Smart auto-scroll to current time or first appointment
        scrollTimeReset={false} // Don't reset scroll when changing dates
        allDaySlot={false}
        nowIndicator={true} // Red "now" line like Google Cal
        // --- Locale ---
        locale="en-AU"
        firstDay={1}
        weekNumberCalculation="ISO"
        // --- Events ---
        events={events}
        eventContent={arg => <EventContent eventInfo={arg} selectedId={selectedId} />}
        // --- Interaction ---
        editable={true}
        selectable={true}
        selectMirror={true}
        eventResizableFromStart={false}
        dragRevertDuration={300}
        snapDuration="00:15:00"
        selectMinDistance={5}
        // --- Callbacks ---
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        datesSet={handleDatesSet}
        dateClick={handleDateClick}
        // --- Layout ---
        height="100%"
        expandRows={false} // Don't stretch rows — keep them compact
        stickyHeaderDates={true}
        dayMaxEvents={3}
        // --- Event display ---
        eventDisplay="block"
        eventBorderColor="transparent"
        eventBackgroundColor="transparent"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        // --- Visual guides ---
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '17:00',
        }}
      />
    </div>
  );
}
