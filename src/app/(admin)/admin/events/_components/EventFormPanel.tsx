'use client';

import { X, Loader2, Calendar, Clock, MapPin, Image, FileText, Tag } from 'lucide-react';
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary">
        <h2 className="text-lg font-semibold text-foreground font-display">
          {mode === 'edit' ? 'Edit Event' : 'New Event'}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X size={18} className="text-secondary" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-primary bg-bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Event title"
                required
              />
            </div>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <select
                value={formData.tag}
                onChange={e => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-primary bg-bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                {TAG_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-terracotta">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-primary bg-bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
              placeholder="Describe the event..."
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date <span className="text-terracotta">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={e => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-primary bg-bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Time <span className="text-terracotta">*</span>
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={formData.time}
                  onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-primary bg-bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="10:00 am - 12:00 pm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Location <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-primary bg-bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Venue name or address"
                required
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Image URL <span className="text-secondary">(optional)</span>
            </label>
            <div className="relative">
              <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="url"
                value={formData.image_url}
                onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-primary bg-bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={e => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="w-4 h-4 rounded border-primary text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">
                <span className="font-medium">Publish event</span>
                <span className="block text-secondary text-xs">Published events are visible on the public website</span>
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_on_home}
                onChange={e => setFormData(prev => ({ ...prev, show_on_home: e.target.checked }))}
                className="w-4 h-4 rounded border-primary text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">
                <span className="font-medium">Show on homepage</span>
                <span className="block text-secondary text-xs">Display in the events section on the home page</span>
              </span>
            </label>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-primary bg-bg-surface">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            className="flex-1"
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