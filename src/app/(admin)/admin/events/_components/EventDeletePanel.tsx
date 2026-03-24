'use client';

import { X, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Event } from '@/db/schema/events';

type EventDeletePanelProps = {
  event: Event;
  onClose: () => void;
  onBack: () => void;
  onDelete: () => void;
  deleting: boolean;
};

export function EventDeletePanel({
  event,
  onClose,
  onBack,
  onDelete,
  deleting,
}: EventDeletePanelProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary">
        <h2 className="text-lg font-semibold text-foreground font-display">Delete Event</h2>
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
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-terracotta/10 mb-4">
          <AlertTriangle size={24} className="text-terracotta" />
        </div>

        <p className="text-foreground mb-4">
          Are you sure you want to delete this event?
        </p>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <p className="font-medium text-foreground">{event.title}</p>
          <p className="text-sm text-secondary mt-1">{formatDate(event.event_date)}</p>
          <p className="text-sm text-secondary">{event.location}</p>
        </div>

        <p className="text-sm text-secondary">
          This action cannot be undone. The event will be permanently removed from the system.
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-primary bg-bg-surface">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={deleting}
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Back
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="flex-1 bg-terracotta hover:bg-terracotta/90"
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="mr-1.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}