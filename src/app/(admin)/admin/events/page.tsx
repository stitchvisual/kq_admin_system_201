'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, Clock, Eye, EyeOff, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useMobilePanel } from '@/context/MobilePanelContext';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { EventFormPanel } from './_components/EventFormPanel';
import { EventDetailPanel } from './_components/EventDetailPanel';
import { EventDeletePanel } from './_components/EventDeletePanel';
import { colors } from '@/styles/botanical';
import { EmptyEvents } from '@/components/botanical/EmptyState';
import { DataTable, DataTableHeaderLabel } from '@/components/botanical/DataTable';
import { cn } from '@/lib/utils';
import type { Event } from '@/db/schema/events';

type PanelMode = 'empty' | 'view' | 'new' | 'edit' | 'deleteConfirm';

const TAG_COLORS: Record<string, string> = {
  Social: 'bg-blue-100 text-blue-700',
  Workshop: 'bg-purple-100 text-purple-700',
  Outing: 'bg-green-100 text-green-700',
  Creative: 'bg-pink-100 text-pink-700',
  Wellness: 'bg-teal-100 text-teal-700',
  Community: 'bg-amber-100 text-amber-700',
};

export default function EventsPage() {
  const { setOpen: setMobilePanelOpen } = useMobilePanel();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelClosing, setPanelClosing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: 'Community',
    event_date: '',
    time: '',
    location: '',
    image_url: '',
    is_published: false,
    show_on_home: true,
  });

  useEffect(() => {
    fetchEvents();
  }, [search, page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', page.toString());
      const res = await fetch(`/api/admin/events?${params}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPanel = (mode: PanelMode) => {
    setPanelClosing(false);
    setPanelMode(mode);
    setTimeout(() => setPanelVisible(true), 75);
  };

  const closePanel = () => {
    setPanelVisible(false);
    setPanelClosing(true);
    setTimeout(() => {
      setSelectedEvent(null);
      setPanelMode('empty');
      setPanelClosing(false);
      setFormData({
        title: '',
        description: '',
        tag: 'Community',
        event_date: '',
        time: '',
        location: '',
        image_url: '',
        is_published: false,
        show_on_home: true,
      });
    }, 300);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    openPanel('view');
  };

  const openAddEvent = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      tag: 'Community',
      event_date: '',
      time: '',
      location: '',
      image_url: '',
      is_published: false,
      show_on_home: true,
    });
    openPanel('new');
  };

  const openEditEvent = () => {
    if (!selectedEvent) return;
    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.description,
      tag: selectedEvent.tag,
      event_date: selectedEvent.event_date.toISOString().split('T')[0],
      time: selectedEvent.time,
      location: selectedEvent.location,
      image_url: selectedEvent.image_url || '',
      is_published: selectedEvent.is_published,
      show_on_home: selectedEvent.show_on_home,
    });
    setPanelMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = panelMode === 'edit' && selectedEvent
        ? `/api/admin/events/${selectedEvent.id}`
        : '/api/admin/events';
      const method = panelMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          event_date: formData.event_date, // Send as ISO date string (YYYY-MM-DD)
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(panelMode === 'edit' ? 'Event updated' : 'Event created');
        await fetchEvents();
        if (panelMode === 'edit' && selectedEvent) {
          const updated = events.find(e => e.id === selectedEvent.id);
          if (updated) setSelectedEvent(data.data);
        } else {
          closePanel();
        }
      } else {
        toast.error(data.error?.message ?? 'Failed to save event');
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = () => {
    setPanelMode('deleteConfirm');
  };

  const panelOpen = panelMode !== 'empty';

  // Raise main above bottom nav when panel is open on mobile
  useEffect(() => {
    setMobilePanelOpen(panelOpen);
    return () => setMobilePanelOpen(false);
  }, [panelOpen, setMobilePanelOpen]);

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Event deleted');
        await fetchEvents();
        closePanel();
      } else {
        toast.error(data.error?.message ?? 'Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background font-body">
      {/* HEADER */}
      <PageHeader
        icon={<Calendar size={16} className="text-primary" />}
        title="Events"
        subtitle="Manage community events and gatherings"
        action={
          events.length > 0 ? (
            <Button onClick={openAddEvent} size="sm" className="gap-1.5">
              <Plus size={14} />
              Add Event
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
              placeholder="Search events by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full min-w-0 h-full bg-transparent border-0 py-0 pl-0 pr-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Events list */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 md:p-20 bg-card rounded-xl border border-primary">
              <EmptyEvents onAddEvent={openAddEvent} />
            </div>
          ) : (
            <div className="w-full min-w-0">
            <DataTable className="w-full min-w-0">
              {/* Desktop table header */}
              <div className="hidden md:grid md:grid-cols-[1fr_120px_140px_80px_60px] md:w-full gap-5 px-5 py-4 border-b border-primary/80 items-center bg-mutedBg">
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Event</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Date</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Location</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Status</DataTableHeaderLabel>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <DataTableHeaderLabel>Home</DataTableHeaderLabel>
                </div>
              </div>

              {/* Event rows */}
              <div className="divide-y divide-[var(--divide-color)] w-full min-w-0" style={{ ['--divide-color']: colors.subtle } as React.CSSProperties}>
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="grid w-full min-w-0 grid-cols-[1fr_120px_140px_80px_60px] gap-6 px-5 py-4 border-b border-primary/80 items-center cursor-pointer transition-all duration-120 hover:bg-primary/3"
                  >
                    {/* Mobile card layout */}
                    <div className="md:hidden flex flex-col gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', TAG_COLORS[event.tag] || TAG_COLORS.Community)}>
                          {event.tag}
                        </span>
                        {!event.is_published && (
                          <span className="text-xs text-muted-foreground">(Draft)</span>
                        )}
                      </div>
                      <div className="font-medium text-foreground text-base">{event.title}</div>
                      <div className="flex flex-col gap-2 text-sm text-secondary">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {formatDate(event.event_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {event.location}
                        </div>
                      </div>
                    </div>

                    {/* Desktop: row */}
                    <div className="hidden md:contents">
                      <div className="min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', TAG_COLORS[event.tag] || TAG_COLORS.Community)}>
                            {event.tag}
                          </span>
                        </div>
                        <div className="truncate font-medium text-foreground text-[13px]">{event.title}</div>
                      </div>
                      <div className="min-w-0 overflow-hidden text-secondary text-[13px]">
                        {formatDate(event.event_date)}
                      </div>
                      <div className="min-w-0 overflow-hidden flex items-center gap-1.5 text-secondary text-[13px]">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        {event.is_published ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <Eye size={12} />
                            Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <EyeOff size={12} />
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 overflow-hidden text-secondary text-xs">
                        {event.show_on_home ? 'Yes' : 'No'}
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

        {/* Event panel — mobile backdrop */}
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

        {/* Event panel — desktop column + mobile bottom sheet */}
        <aside
          className={cn(
            'relative flex flex-col overflow-hidden bg-card flex-shrink-0',
            'fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-[20px] rounded-b-none border-t border-primary',
            'max-md:bg-[hsl(var(--color-card))] max-md:shadow-soft-lg max-md:pb-[env(safe-area-inset-bottom)]',
            'md:border-t-0 md:border-l md:border-primary',
            'translate-y-full',
            'transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'md:relative md:inset-auto md:z-auto md:max-h-none md:rounded-none',
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
            {panelMode === 'view' && selectedEvent && (
              <EventDetailPanel
                event={selectedEvent}
                onClose={closePanel}
                onEdit={openEditEvent}
                onDelete={openDeleteConfirm}
              />
            )}
            {(panelMode === 'new' || panelMode === 'edit') && (
              <EventFormPanel
                mode={panelMode}
                event={selectedEvent ?? undefined}
                onClose={closePanel}
                onSubmit={handleSubmit}
                saving={saving}
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {panelMode === 'deleteConfirm' && selectedEvent && (
              <EventDeletePanel
                event={selectedEvent}
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