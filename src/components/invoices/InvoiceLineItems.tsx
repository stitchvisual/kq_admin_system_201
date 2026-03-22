'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Car, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InvoiceItem } from '@/db/schema/invoice_items';

interface InvoiceLineItemsProps {
  items: InvoiceItem[];
  total: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showHeaders?: boolean;
  compact?: boolean;
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

interface GroupedItems {
  [category: string]: InvoiceItem[];
}

function groupByCategory(items: InvoiceItem[]): GroupedItems {
  return items.reduce((acc, item) => {
    const category = item.support_category || 'Other Services';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as GroupedItems);
}

function calculateLineTotal(item: InvoiceItem): number {
  return parseFloat(item.quantity) * parseFloat(item.unit_price);
}

function isTravelItem(item: InvoiceItem): boolean {
  return item.description.toLowerCase().includes('travel') || 
         (item.ndis_item_code !== null && item.ndis_item_code.toLowerCase().includes('travel'));
}

export function InvoiceLineItems({
  items,
  total,
  collapsible = true,
  defaultExpanded = false,
  showHeaders = true,
  compact = false,
}: InvoiceLineItemsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || !collapsible);

  if (!items || items.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No line items
      </div>
    );
  }

  const groupedItems = groupByCategory(items);
  const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);

  const content = (
    <div className="space-y-3">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <InvoiceLineItemGroup
          key={category}
          category={category}
          items={categoryItems}
          compact={compact}
          showHeaders={showHeaders}
        />
      ))}

      <div className="pt-3 border-t border-primary/50 space-y-1.5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">GST</span>
          <span className="font-medium text-muted-foreground italic">N/A — GST Free</span>
        </div>
        <div className="flex justify-between items-center pt-1.5 border-t border-primary/30">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-base text-foreground">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  if (!collapsible) {
    return content;
  }

  return (
    <div className="rounded-lg border border-primary overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Line Items ({items.length})
        </span>
        <span className="text-sm font-semibold text-foreground">{formatCurrency(total)}</span>
      </button>
      
      {expanded && (
        <div className="p-3.5 border-t border-primary">
          {content}
        </div>
      )}
    </div>
  );
}

interface InvoiceLineItemGroupProps {
  category: string;
  items: InvoiceItem[];
  compact?: boolean;
  showHeaders?: boolean;
}

function InvoiceLineItemGroup({
  category,
  items,
  compact = false,
  showHeaders = true,
}: InvoiceLineItemGroupProps) {
  const groupTotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);

  return (
    <div>
      {showHeaders && (
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-primary/30">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {category}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {formatCurrency(groupTotal)}
          </span>
        </div>
      )}
      
      <div className="space-y-1">
        {items.map((item) => (
          <InvoiceLineItem key={item.id} item={item} compact={compact} />
        ))}
      </div>
    </div>
  );
}

interface InvoiceLineItemProps {
  item: InvoiceItem;
  compact?: boolean;
}

function InvoiceLineItem({ item, compact = false }: InvoiceLineItemProps) {
  const lineTotal = calculateLineTotal(item);
  const isTravel = isTravelItem(item);

  if (compact) {
    return (
      <div className="flex items-center justify-between py-1.5 text-sm">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isTravel && <Car size={12} className="text-muted-foreground flex-shrink-0" />}
          <span className="truncate text-muted-foreground">{item.description}</span>
        </div>
        <span className="font-medium text-foreground ml-2">{formatCurrency(lineTotal)}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_60px_50px_70px] gap-2 py-2 px-2 rounded hover:bg-muted/30 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {isTravel && <Car size={12} className="text-muted-foreground flex-shrink-0" />}
          <span className="text-sm text-foreground truncate">{item.description}</span>
        </div>
        {item.ndis_item_code && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {item.ndis_item_code}
          </span>
        )}
      </div>
      
      <div className="text-right">
        <span className="text-xs text-muted-foreground">{item.quantity}</span>
      </div>
      
      <div className="text-right">
        <span className="text-xs text-muted-foreground">{formatCurrency(item.unit_price)}</span>
      </div>
      
      <div className="text-right">
        <span className="text-sm font-medium text-foreground">{formatCurrency(lineTotal)}</span>
      </div>
    </div>
  );
}

export function InvoiceLineItemsHeader() {
  return (
    <div className="grid grid-cols-[1fr_60px_50px_70px] gap-2 py-2 px-2 bg-muted/50 rounded-t border-b border-primary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <span>Description</span>
      <span className="text-right">Hours</span>
      <span className="text-right">Rate</span>
      <span className="text-right">Amount</span>
    </div>
  );
}

export default InvoiceLineItems;
