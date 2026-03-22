'use client';

import React, { useState } from 'react';
import { User, Users, ChevronDown, ChevronRight, AlertTriangle, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClientSessionGroup as ClientSessionGroupType, UninvoicedSession } from '@/repositories/invoices.repository';
import TravelKmInput from './TravelKmInput';

interface ClientSessionGroupProps {
  group: ClientSessionGroupType;
  selectedSessionIds: Set<string>;
  travelKmMap: Map<string, number | null>;
  onToggleSession: (sessionId: string) => void;
  onToggleAll: () => void;
  onTravelKmChange: (sessionId: string, km: number | null) => void;
  formatCurrency: (amount: number, inCents?: boolean) => string;
  defaultExpanded?: boolean;
  travelRatePerKm: number;
}

export function ClientSessionGroup({
  group,
  selectedSessionIds,
  travelKmMap,
  onToggleSession,
  onToggleAll,
  onTravelKmChange,
  formatCurrency,
  defaultExpanded = true,
  travelRatePerKm,
}: ClientSessionGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const clientSelectedCount = group.sessions.filter(s => selectedSessionIds.has(s.id)).length;
  const hasSelection = clientSelectedCount > 0;
  const allSelected = clientSelectedCount === group.sessions.length;
  const hasZeroRateSessions = group.sessions.some(s => s.rate === 0);
  const selectedTotal = group.sessions
    .filter(s => selectedSessionIds.has(s.id))
    .reduce((sum, s) => sum + (s.rate * s.duration_hours), 0);
  const selectedTravelTotal = group.sessions
    .filter(s => selectedSessionIds.has(s.id))
    .reduce((sum, s) => {
      const km = travelKmMap.get(s.id) ?? s.travel_km ?? 0;
      return sum + (km * travelRatePerKm);
    }, 0);

  return (
    <div className="rounded-lg border border-primary bg-muted/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate = hasSelection && !allSelected;
              }
            }}
            onChange={(e) => {
              e.stopPropagation();
              onToggleAll();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer accent-primary"
          />
          
          <div className="flex items-center gap-2">
            {group.is_group ? (
              <Users size={15} className="text-muted-foreground" />
            ) : (
              <User size={15} className="text-muted-foreground" />
            )}
            <span className="font-semibold text-sm text-foreground">{group.client_name}</span>
          </div>
          
          <span className="text-xs text-muted-foreground">
            {group.total_sessions} session{group.total_sessions !== 1 ? 's' : ''} · {group.total_hours.toFixed(1)}h
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {hasZeroRateSessions && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <AlertTriangle size={11} />
              $0 rate
            </span>
          )}
          <span className="font-semibold text-sm text-foreground">
            {formatCurrency(group.estimated_total, true)}
          </span>
          {expanded ? (
            <ChevronDown size={15} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={15} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-primary/50 divide-y divide-primary/30">
          {group.sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              selected={selectedSessionIds.has(session.id)}
              travelKm={travelKmMap.get(session.id) ?? session.travel_km}
              onToggle={() => onToggleSession(session.id)}
              onTravelKmChange={(km) => onTravelKmChange(session.id, km)}
              formatCurrency={formatCurrency}
              travelRatePerKm={travelRatePerKm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SessionRowProps {
  session: UninvoicedSession;
  selected: boolean;
  travelKm: number | null;
  onToggle: () => void;
  onTravelKmChange: (km: number | null) => void;
  formatCurrency: (amount: number, inCents?: boolean) => string;
  travelRatePerKm: number;
}

function SessionRow({
  session,
  selected,
  travelKm,
  onToggle,
  onTravelKmChange,
  formatCurrency,
  travelRatePerKm,
}: SessionRowProps) {
  const hasZeroRate = session.rate === 0;
  const sessionTotal = session.rate * session.duration_hours;
  const travelCost = (travelKm ?? 0) * travelRatePerKm;
  const lineTotal = sessionTotal + travelCost;

  const sessionDate = new Date(session.starts_at);
  const formattedDate = sessionDate.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors',
        hasZeroRate && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          disabled={hasZeroRate}
          className={cn(
            'w-3.5 h-3.5 cursor-pointer accent-primary',
            hasZeroRate && 'cursor-not-allowed'
          )}
        />
        
        <div className="flex items-center gap-3">
          <span className={cn('text-sm', hasZeroRate && 'text-muted-foreground')}>
            {formattedDate}
          </span>
          <span className="text-xs text-muted-foreground">
            {session.duration_hours.toFixed(1)}h
          </span>
          {hasZeroRate && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <AlertTriangle size={10} />
              $0/hr
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TravelKmInput
          value={travelKm}
          onChange={onTravelKmChange}
          disabled={!selected}
          travelRate={travelRatePerKm}
        />
        
        <div className="text-right min-w-[70px]">
          {travelCost > 0 ? (
            <div>
              <span className="text-xs font-medium text-foreground">
                {formatCurrency(lineTotal, true)}
              </span>
              <div className="text-[10px] text-muted-foreground">
                ({formatCurrency(sessionTotal, true)} + {formatCurrency(travelCost, true)} travel)
              </div>
            </div>
          ) : (
            <span className="text-xs font-medium text-foreground">
              {formatCurrency(sessionTotal, true)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientSessionGroup;
