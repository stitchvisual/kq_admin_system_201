'use client';

import React from 'react';
import { Send, Download, CheckSquare, Square, Loader2, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionSelectionBarProps {
  selectedCount: number;
  clientCount: number;
  totalAmount: number;
  travelKmTotal: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPreview?: () => void;
  onGenerate: () => void;
  generating: boolean;
  formatCurrency: (amount: number, inCents?: boolean) => string;
}

export function SessionSelectionBar({
  selectedCount,
  clientCount,
  totalAmount,
  travelKmTotal,
  onSelectAll,
  onDeselectAll,
  onPreview,
  onGenerate,
  generating,
  formatCurrency,
}: SessionSelectionBarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 z-10',
        'border-t border-primary bg-card/95 backdrop-blur-sm',
        'transition-all duration-200',
        hasSelection ? 'shadow-lg' : ''
      )}
    >
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <button
              onClick={onSelectAll}
              disabled={generating}
              className="h-7 px-2.5 rounded-md border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[11px] font-medium text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <CheckSquare size={12} />
              All
            </button>
            <button
              onClick={onDeselectAll}
              disabled={generating}
              className="h-7 px-2.5 rounded-md border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[11px] font-medium text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Square size={12} />
              None
            </button>
          </div>

          <div className="h-5 w-px bg-primary/50" />

          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock size={13} />
              <span className={cn('font-medium', hasSelection ? 'text-foreground' : '')}>
                {selectedCount} session{selectedCount !== 1 ? 's' : ''}
              </span>
            </span>
            
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users size={13} />
              <span className={cn('font-medium', hasSelection ? 'text-foreground' : '')}>
                {clientCount} client{clientCount !== 1 ? 's' : ''}
              </span>
            </span>

            {travelKmTotal > 0 && (
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{travelKmTotal.toFixed(1)} km</span> travel
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-body text-lg font-bold text-foreground">
              {formatCurrency(totalAmount, true)}
            </div>
          </div>

          {onPreview && (
            <button
              onClick={onPreview}
              disabled={!hasSelection || generating}
              className="h-9 px-4 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-sm font-medium text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] disabled:opacity-50 transition-colors"
            >
              Preview
            </button>
          )}

          <button
            onClick={onGenerate}
            disabled={!hasSelection || generating}
            className={cn(
              'h-9 px-5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all',
              'bg-[hsl(var(--color-primary))] text-white shadow-soft',
              'hover:opacity-90 hover:shadow-lift',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
            )}
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send size={14} />
                Generate & Issue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionSelectionBar;
