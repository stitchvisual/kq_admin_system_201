'use client';

import { X, AlertTriangle, Trash2, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EventDeletePanelProps = {
  eventTitle: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
};

export function EventDeletePanel({
  eventTitle,
  onClose,
  onConfirm,
  loading,
}: EventDeletePanelProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-mutedBg/30">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary bg-gradient-to-r from-card to-mutedBg/50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-50/80">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-foreground font-display tracking-tight">
            Delete Event
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Close"
        >
          <X size={18} className="text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Warning Box */}
          <div className="p-5 rounded-xl border-2 border-red-200/70 bg-gradient-to-br from-red-50/90 to-red-50/60 shadow-sm">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-red-900 mb-2">This action cannot be undone</h3>
                <p className="text-sm text-red-800/90 leading-relaxed">
                  You are about to permanently delete this event from the system. This action will remove all event data and cannot be reversed.
                </p>
              </div>
            </div>
          </div>

          {/* Event to delete */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
              Event to delete
            </h4>
            <div className="p-4 rounded-lg border-2 border-primary/60 bg-gradient-to-r from-card to-mutedBg/40 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground break-words">
                    {eventTitle}
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    ID: Event-{eventTitle.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consequences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
              What will happen
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3.5 rounded-lg border-2 border-primary/60 bg-gradient-to-r from-card to-mutedBg/40">
                <XCircle size={16} className="text-terracotta mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Event details will be removed</p>
                  <p className="text-xs text-secondary mt-0.5">Title, description, date, time, and location</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-lg border-2 border-primary/60 bg-gradient-to-r from-card to-mutedBg/40">
                <XCircle size={16} className="text-terracotta mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Published status will be lost</p>
                  <p className="text-xs text-secondary mt-0.5">The event will no longer appear on the website</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-lg border-2 border-primary/60 bg-gradient-to-r from-card to-mutedBg/40">
                <XCircle size={16} className="text-terracotta mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Homepage placement will be removed</p>
                  <p className="text-xs text-secondary mt-0.5">Will be removed from featured events section</p>
                </div>
              </div>
            </div>
          </div>

          {/* Safe alternative */}
          <div className="p-4 rounded-lg border-2 border-primary/60 bg-gradient-to-r from-card to-mutedBg/40">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Check size={16} className="text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">Alternative: Unpublish instead</p>
                <p className="text-xs text-blue-800/90 leading-relaxed">
                  If you want to temporarily remove the event from the website, consider unpublishing it instead of deleting. You can always republish it later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-primary bg-gradient-to-r from-card to-mutedBg/50 shadow-[0_-2px_8px_rgba(45,58,49,0.04)]">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 hover:bg-muted/80 transition-all duration-200"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-2 border-red-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}