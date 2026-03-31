'use client';

import { Globe, Edit, Trash2, Eye, EyeOff, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Event } from '@/db/schema/events';
import {
  SheetHandle,
  PanelHeader,
  PanelFooter,
  SectionLabel,
  MetaRow,
  PrimaryBtn,
  DangerBtn,
} from '@/components/panels';
import { ContextPanel } from '@/components/panels/ContextPanel';
import { fadeUp, staggerContainer } from '@/lib/motion/variants';

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Social: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Workshop: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Outing: { bg: 'bg-green-100', text: 'text-green-700' },
  Creative: { bg: 'bg-pink-100', text: 'text-pink-700' },
  Wellness: { bg: 'bg-teal-100', text: 'text-teal-700' },
  Community: { bg: 'bg-amber-100', text: 'text-amber-700' },
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

  const tagStyle = TAG_COLORS[event.tag] || TAG_COLORS.Community;
  const accentClass = tagStyle.bg.replace('bg-', 'bg-').replace('-100', '');

  return (
    <ContextPanel
      breadcrumb="Events"
      title="Event details"
      accentClass={accentClass}
      showAccentBar={true}
      isOpen={true}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <DangerBtn type="button" onClick={onDelete}>
            <Trash2 size={13} />
            Delete
          </DangerBtn>
          <PrimaryBtn type="button" onClick={onEdit} className="flex-1">
            <Edit size={13} />
            Edit
          </PrimaryBtn>
        </div>
      }
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'rounded-xl p-4 border',
          'bg-gradient-to-br from-card to-mutedBg/40',
          'border-[var(--color-semantic-border-default)]'
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-[16px] font-semibold text-foreground leading-tight mb-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                  tagStyle.bg,
                  tagStyle.text
                )}
              >
                {event.tag}
              </span>
              {!event.is_published && (
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  Draft
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <SectionLabel>Event Info</SectionLabel>
          <div className="space-y-0 divide-y divide-primary/50">
            <MetaRow
              label="Date"
              value={formatDate(event.event_date)}
            />
            <MetaRow
              label="Time"
              value={event.time}
            />
            <MetaRow
              label="Location"
              value={event.location}
            />
          </div>
        </motion.div>

        {/* Description */}
        {event.description && (
          <motion.div variants={fadeUp}>
            <SectionLabel>Description</SectionLabel>
            <div className="rounded-lg bg-muted/60 border border-[var(--color-semantic-border-default)] p-3 shadow-soft">
              <p className="text-[12px] text-secondary leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </motion.div>
        )}

        {/* Image URL */}
        {event.image_url && (
          <motion.div variants={fadeUp}>
            <SectionLabel>Featured Image</SectionLabel>
            <div className="rounded-lg bg-muted/60 border border-[var(--color-semantic-border-default)] p-3 shadow-soft">
              <a
                href={event.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12px] text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                <Globe size={13} className="flex-shrink-0" />
                <span className="truncate">{event.image_url}</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* Visibility Section */}
        <motion.div variants={fadeUp}>
          <SectionLabel>Visibility</SectionLabel>
          <div className="space-y-2">
            {/* Published Status */}
            <div className={cn(
              'flex items-center gap-2.5 p-3 rounded-lg border transition-all duration-200 shadow-subtle',
              event.is_published
                ? 'bg-[var(--status-completed-bg)] border-[var(--status-completed-border)]'
                : 'bg-muted/60 border-[var(--color-semantic-border-default)]'
            )}>
              {event.is_published ? (
                <>
                  <Eye size={15} className="text-[var(--status-completed-text)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-semibold text-[var(--status-completed-text)] block">Published</span>
                    <span className="text-[11px] text-[var(--status-completed-text)]/80 block">Visible on public website</span>
                  </div>
                </>
              ) : (
                <>
                  <EyeOff size={15} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-semibold text-muted-foreground block">Draft</span>
                    <span className="text-[11px] text-muted-foreground/80 block">Not visible to public</span>
                  </div>
                </>
              )}
            </div>

            {/* Homepage Status */}
            <div className={cn(
              'flex items-center gap-2.5 p-3 rounded-lg border transition-all duration-200 shadow-subtle',
              event.show_on_home
                ? 'bg-primary/10 border-primary'
                : 'bg-muted/60 border-[var(--color-semantic-border-default)]'
            )}>
              <Home
                size={15}
                className={cn(
                  'flex-shrink-0 transition-colors duration-200',
                  event.show_on_home ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'text-[12px] font-semibold block',
                  event.show_on_home ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {event.show_on_home ? 'Shows on homepage' : 'Hidden from homepage'}
                </span>
                <span className="text-[11px] text-secondary/80 block">
                  {event.show_on_home ? 'Featured on the events section' : 'Removed from homepage display'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timestamps */}
        <motion.div variants={fadeUp}>
          <SectionLabel>Timestamps</SectionLabel>
          <div className="space-y-0 divide-y divide-primary/50">
            <MetaRow
              label="Created"
              value={new Date(event.created_at).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            {event.updated_at && (
              <MetaRow
                label="Updated"
                value={new Date(event.updated_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      <div className="h-2" />
    </ContextPanel>
  );
}