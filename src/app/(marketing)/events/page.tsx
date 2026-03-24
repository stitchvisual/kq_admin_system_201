import { Section } from '@/components/marketing/ui/section';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FadeIn } from '@/components/marketing/motion/FadeIn';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Event } from '@/db/schema/events';
import { eventsService } from '@/services/events.service';

export const metadata: Metadata = {
  title: 'Events | KQ Collective',
  description:
    'Community events, workshops, and gatherings for KQ Collective clients. Connect, learn, and grow alongside others.',
};

const TAG_COLORS: Record<string, string> = {
  Social: 'bg-blue-100 text-blue-700',
  Workshop: 'bg-purple-100 text-purple-700',
  Outing: 'bg-green-100 text-green-700',
  Creative: 'bg-pink-100 text-pink-700',
  Wellness: 'bg-teal-100 text-teal-700',
  Community: 'bg-amber-100 text-amber-700',
};

async function getEvents(): Promise<Event[]> {
  try {
    // Avoid self-HTTP fetches from Server Components during static generation.
    return await eventsService.getPublishedUpcoming(20);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Section variant="lg" className="bg-linen">
        <FadeIn className="max-w-3xl">
          <span className="eyebrow mb-6 block text-terracotta">Community</span>
          <h1 className="text-h1 mb-6">Events & Gatherings</h1>
          <p className="text-lg text-muted-foreground">
            Join us for workshops, social outings, and community sessions designed to build skills and connections.
          </p>
        </FadeIn>
      </Section>

      {/* Upcoming Events */}
      <Section>
        <div className="mb-10 flex items-end justify-between border-b border-border pb-4">
          <h2 className="text-h2">Upcoming Events</h2>
        </div>

        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-lg text-muted-foreground">No upcoming events scheduled at the moment. Check back soon!</p>
            <p className="text-sm text-muted-foreground mt-4">
              Interested in hosting or suggesting an event?{' '}
              <Link href="/contact" className="text-terracotta hover:underline">
                Get in touch
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:border-terracotta/50 transition-colors"
              >
                {event.image_url ? (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-linen to-bg-subtle flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${TAG_COLORS[event.tag] || TAG_COLORS.Community}`}>
                      {event.tag}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${TAG_COLORS[event.tag] || TAG_COLORS.Community}`}>
                      {event.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-terracotta transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-terracotta" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-terracotta" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-terracotta" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      {/* Contact CTA */}
      <Section className="bg-bg-subtle">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-h2 mb-4">Want to stay updated?</h2>
          <p className="text-body text-secondary mb-8">
            Contact us to learn about upcoming events or to suggest a workshop topic.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </Section>
    </div>
  );
}