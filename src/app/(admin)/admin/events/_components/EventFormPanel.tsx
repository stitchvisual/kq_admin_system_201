'use client';

import { X, Loader2, Calendar, Clock, MapPin, Image, FileText, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TAG_OPTIONS = [
  { value: 'Social', label: 'Social' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Outing', label: 'Outing' },
  { value: 'Creative', label: 'Creative' },
  { value: 'Wellness', label: 'Wellness' },
  { value: 'Community', label: 'Community' },
];

type EventFormPanelProps = {
  mode: 'new' | 'edit';
  event?: { id: string; title: string };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  formData: {
    title: string;
    description: string;
    tag: string;
    event_date: string;
    time: string;
    location: string;
    image_url: string;
    is_published: boolean;
    show_on_home: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    tag: string;
    event_date: string;
    time: string;
    location: string;
    image_url: string;
    is_published: boolean;
    show_on_home: boolean;
  }>>;
};

export function EventFormPanel({
  mode,
  event,
  onClose,
  onSubmit,
  saving,
  formData,
  setFormData,
}: EventFormPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-mutedBg/30">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary bg-gradient-to-r from-card to-mutedBg/50 shadow-sm">
        <h2 className="text-lg font-bold text-foreground font-display tracking-tight">
          {mode === 'edit' ? 'Edit Event' : 'New Event'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Close"
        >
          <X size={18} className="text-secondary" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
              <FileText size={13} className="text-primary" />
              Title <span className="text-terracotta">*</span>
            </label>
            <div className="relative group">
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors duration-200" />
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-primary/80 bg-gradient-to-r from-card to-mutedBg/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-secondary/60"
                placeholder="Enter event title..."
                required
              />
            </div>
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
              <Tag size={13} className="text-primary" />
              Category
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              <select
                value={formData.tag}
                onChange={e => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-primary/80 bg-gradient-to-r from-card to-mutedBg/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 appearance-none cursor-pointer"
              >
                {TAG_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
              <FileText size={13} className="text-primary" />
              Description <span className="text-terracotta">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-primary/80 bg-gradient-to-r from-card to-mutedBg/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 min-h-[120px] resize-y placeholder:text-secondary/60 leading-relaxed"
              placeholder="Describe your event..."
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
                <Calendar size={13} className="text-primary" />
                Date <span className="text-terracotta">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={e => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-primary/80 bg-gradient-to-r from-card to-mutedBg/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
                <Clock size={13} className="text-primary" />
                Time <span className="text-terracotta">*</span>
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={formData.time}
                  onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-primary/80 bg-gradient-to-r from-card to-mutedBg/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-secondary/60"
                  placeholder="10:00 am - 12:00 pm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
              <MapPin size={13} className="text-primary" />
              Location <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-primary/80 bg-gradient-to-r from-card to-mutedBg/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-secondary/60"
                placeholder="Venue name or address"
                required
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
              <Image size={13} className="text-primary" />
              Image URL <span className="text-secondary font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="url"
                value={formData.image_url}
                onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-primary/80 bg-gradient-to-r from-card to-mutedBg/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-secondary/60"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <label className="group flex items-start gap-3.5 p-3.5 rounded-lg border-2 border-primary/60 bg-gradient-to-r from-card to-mutedBg/40 cursor-pointer hover:border-primary transition-all duration-200 hover:bg-mutedBg/60">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={e => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="peer appearance-none w-5 h-5 rounded-md border-2 border-primary/80 bg-card transition-all duration-200 checked:bg-primary checked:border-primary checked:shadow-md"
                />
                <Check size={10} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-foreground block">Publish event</span>
                <span className="text-xs text-secondary leading-relaxed block">Published events are visible on the public website</span>
              </div>
            </label>

            <label className="group flex items-start gap-3.5 p-3.5 rounded-lg border-2 border-primary/60 bg-gradient-to-r from-card to-mutedBg/40 cursor-pointer hover:border-primary transition-all duration-200 hover:bg-mutedBg/60">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={formData.show_on_home}
                  onChange={e => setFormData(prev => ({ ...prev, show_on_home: e.target.checked }))}
                  className="peer appearance-none w-5 h-5 rounded-md border-2 border-primary/80 bg-card transition-all duration-200 checked:bg-primary checked:border-primary checked:shadow-md"
                />
                <Check size={10} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-foreground block">Show on homepage</span>
                <span className="text-xs text-secondary leading-relaxed block">Display in the events section on home page</span>
              </div>
            </label>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-primary bg-gradient-to-r from-card to-mutedBg/50 shadow-[0_-2px_8px_rgba(45,58,49,0.04)]">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 hover:bg-muted/80 transition-all duration-200"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              mode === 'edit' ? 'Update' : 'Create'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}