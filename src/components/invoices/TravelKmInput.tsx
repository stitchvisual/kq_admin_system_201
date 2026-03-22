'use client';

import React, { useCallback } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TravelKmInputProps {
  value: number | null;
  onChange: (km: number | null) => void;
  disabled?: boolean;
  travelRate?: number;
  compact?: boolean;
  className?: string;
}

export function TravelKmInput({
  value,
  onChange,
  disabled = false,
  travelRate = 0.97,
  compact = false,
  className,
}: TravelKmInputProps) {
  const hasValue = value !== null && value > 0;
  const travelCost = (value ?? 0) * travelRate;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
        onChange(null);
      } else {
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0) {
          onChange(num);
        }
      }
    },
    [onChange]
  );

  const formatCost = (cost: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(cost);
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5',
          disabled && 'opacity-50',
          className
        )}
      >
        {hasValue && <Car size={11} className="text-muted-foreground" />}
        <input
          type="number"
          min="0"
          step="0.5"
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder="km"
          className={cn(
            'w-12 h-6 px-1.5 text-[11px] rounded border border-primary bg-background text-right',
            'focus:outline-none focus:ring-1 focus:ring-primary/30',
            'disabled:cursor-not-allowed'
          )}
        />
        <span className="text-[10px] text-muted-foreground">km</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {hasValue && <Car size={12} className="text-muted-foreground" />}
        <input
          type="number"
          min="0"
          step="0.5"
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0"
          className={cn(
            'w-14 h-7 px-2 text-xs rounded-md border border-primary bg-background text-right',
            'focus:outline-none focus:ring-1 focus:ring-primary/30',
            'disabled:cursor-not-allowed',
            hasValue && 'border-primary/70 bg-muted/30'
          )}
        />
        <span className="text-xs text-muted-foreground">km</span>
      </div>

      {hasValue && (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          +{formatCost(travelCost)}
        </span>
      )}
    </div>
  );
}

export default TravelKmInput;
