'use client';

import { X, Calendar, Clock, MapPin, Edit, Trash2, Eye, EyeOff, Home, Image, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Event } from '@/db/schema/events';

const TAG_COLORS: Record<string, string> = {
  Social: 'bg-blue-100 text-blue-700',
  Workshop: 'bg-purple-100 text-purple-700',
  Outing: 'bg-green-100 text-green-700',
  Creative: 'bg-pink-100 text-pink-700',
  Wellness: 'bg-teal-100 text-teal-700',
  Community: 'bg-amber-100 text-amber-700',
};

type EventDetailPanelProps = {
  event: Event;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function EventDetailPanel({
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailPanelProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', TAG_COLORS[event.tag] || TAG_COLORS.Community)}>
            {event.tag}
          </span>
          {!event.is_published && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Draft</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X size={18} className="text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="text-xl font-semibold text-foreground font-display mb-4">
          {event.title}
        </h3>

        {/* Meta info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-sm">
            <Calendar size={16} className="text-secondary mt-0.5 shrink-0" />
            <span className="text-foreground">{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Clock size={16} className="text-secondary mt-0.5 shrink-0" />
            <span className="text-foreground">{event.time}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={16} className="text-secondary mt-0.5 shrink-0" />
            <span className="text-foreground">{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-foreground whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* Image */}
        {event.image_url && (
          <div className="mb-6">
            <h4 className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Featured Image</h4>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Image size={14} />
              <a href={event.image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                {event.image_url}
              </a>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Visibility</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {event.is_published ? (
                <>
                  <Eye size={14} className="text-green-600" />
                  <span className="text-green-600 font-medium">Published</span>
                </>
              ) : (
                <>
                  <EyeOff size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Draft</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Home size={14} className={event.show_on_home ? 'text-primary' : 'text-muted-foreground'} />
              <span className={event.show_on_home ? 'text-foreground' : 'text-muted-foreground'}>
                {event.show_on_home ? 'Shows on homepage' : 'Hidden from homepage'}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Created: {new Date(event.created_at).toLocaleString()}</p>
          {event.updated_at && (
            <p>Updated: {new Date(event.updated_at).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-primary bg-bg-surface">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onDelete}
            className="flex-1 text-terracotta hover:bg-terracotta/10"
          >
            <Trash2 size={14} className="mr-1.5" />
            Delete
          </Button>
          <Button
            onClick={onEdit}
            className="flex-1"
          >
            <Edit size={14} className="mr-1.5" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}