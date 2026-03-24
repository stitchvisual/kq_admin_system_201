import { Section } from '@/components/marketing/ui/section';
import { FeatureCard as Card } from '@/components/marketing/ui/feature-card';
import Link from 'next/link';
import { ButtonLink } from '@/components/marketing/ui/button-link';
import styles from './home-events.module.css';
import type { Metadata } from 'next';
import { FadeIn } from '@/components/marketing/gsap/fade-in';
import { TestimonialsCarousel } from '@/components/marketing/ui/testimonials-carousel';

export const metadata: Metadata = {
  title: 'KQ Collective | Life Skills Training & NDIS Services',
  description:
    'Building independence, one session at a time. Life skills training and NDIS-funded support with a relationship-first approach. Small by design.',
};

type HomeEvent = {
  day: string;
  month: string;
  tag: string;
  title: string;
  time: string;
  location: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

const EVENTS: HomeEvent[] = [
  {
    day: '14',
    month: 'March 2026',
    tag: 'Social',
    title: 'Morning Tea & Connection Circle',
    time: '10:00 am - 12:00 pm',
    location: 'Northside Community Hall',
    description:
      'A relaxed morning tea for clients and their support networks. Share stories, enjoy a hot drink, and meet others in the KQ community.',
    ctaLabel: 'Register interest',
    ctaHref: '/contact',
  },
  {
    day: '22',
    month: 'March 2026',
    tag: 'Workshop',
    title: 'NDIS Planning Workshop',
    time: '1:00 pm - 3:30 pm',
    location: 'Online - Zoom',
    description:
      'Understand your NDIS plan, know your rights, and learn how to get the most from your supports. Facilitated by a community advocate.',
    ctaLabel: 'Register interest',
    ctaHref: '/contact',
  },
  {
    day: '05',
    month: 'April 2026',
    tag: 'Outing',
    title: 'Botanic Gardens Accessible Walk',
    time: '9:30 am - 11:30 am',
    location: 'Royal Botanic Gardens',
    description:
      'A gentle, fully accessible guided walk through the gardens. A chance to connect with nature and each other in a supported, welcoming environment.',
    ctaLabel: 'Register interest',
    ctaHref: '/contact',
  },
  {
    day: '12',
    month: 'April 2026',
    tag: 'Creative',
    title: 'Art & Expression Group',
    time: '11:00 am - 1:00 pm',
    location: 'Westside Arts Studio',
    description:
      'A relaxed creative session - no experience needed. Paint, draw, or craft alongside others. All materials provided. Carers welcome.',
    ctaLabel: 'Register interest',
    ctaHref: '/contact',
  },
  {
    day: '19',
    month: 'April 2026',
    tag: 'Wellness',
    title: 'Mindfulness & Breathwork Session',
    time: '2:00 pm - 3:00 pm',
    location: 'Online - Zoom',
    description:
      'A guided, gentle breathwork and mindfulness session designed to support emotional regulation and calm. Open to all abilities.',
    ctaLabel: 'Register interest',
    ctaHref: '/contact',
  },
  {
    day: '03',
    month: 'May 2026',
    tag: 'Community',
    title: 'Carers & Supporters Afternoon',
    time: '3:00 pm - 5:00 pm',
    location: 'Northside Community Hall',
    description:
      'An afternoon dedicated to the people who show up every day. Connect with other carers, share resources, and take a moment for yourself.',
    ctaLabel: 'Register interest',
    ctaHref: '/contact',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <FadeIn className="hero__content">
          <span className="hero__eyebrow eyebrow">Life Skills Training &middot; NDIS Services</span>
          <h1
            className="hero__heading"
            dangerouslySetInnerHTML={{
              __html: 'Building independence. <br /> <em>One session at a time.</em>',
            }}
          />
          <p className="hero__body">
            Support that is tailored, dependable, and delivered with genuine respect. We show up prepared and adapt as goals evolve.
          </p>
          <div className="hero__actions">
            <ButtonLink href="/contact">Get in Touch</ButtonLink>
            <ButtonLink href="/about" variant="outline">
              Learn More
            </ButtonLink>
          </div>
        </FadeIn>
        <FadeIn className="hero__media" delay={0.1}>
          <div className="w-full h-full bg-bg-subtle flex items-center justify-center text-tertiary">
            <span className="text-display opacity-20">KQ</span>
          </div>
        </FadeIn>
      </section>

      <Section container={false}>
        <div className="wrap">
          <FadeIn className="mb-10 text-center max-w-2xl mx-auto">
            <span className="eyebrow mb-3 block">What Clients Say</span>
            <h2 className="text-h2">Warm, consistent support that builds confidence</h2>
          </FadeIn>
        </div>
        <TestimonialsCarousel
          className="wrap-wide"
          items={[
            {
              quote:
                "KQ helped me build routines I can actually keep. It feels like they're on my side, not just checking boxes.",
              author: 'Samantha P.',
              role: 'NDIS Participant',
            },
            {
              quote:
                "Communication is clear and timely, and my son looks forward to every session. We've seen real progress.",
              author: 'Daniel R.',
              role: 'Parent',
            },
            {
              quote:
                'Professional, kind, and reliable. Sessions are tailored to my goals and I feel more independent each week.',
              author: 'Michael L.',
              role: 'Client',
            },
            {
              quote: "They meet me where I'm at. The small wins add up, and I feel heard.",
              author: 'Aisha K.',
              role: 'Client',
            },
            {
              quote:
                'Respectful, practical, and consistent. Exactly the support we were hoping to find.',
              author: 'Greg S.',
              role: 'Carer',
            },
            {
              quote: "Clear goals, clear communication, and no judgement. It's a relief.",
              author: 'Elena V.',
              role: 'NDIS Participant',
            },
          ]}
        />
      </Section>

      {/* Featured Services */}
      <Section>
        <FadeIn className="mb-12 text-center max-w-2xl mx-auto">
          <span className="eyebrow mb-4 block">What We Do</span>
          <h2 className="text-h2 mb-6">Support that feels like a partnership</h2>
          <p className="text-body text-secondary">
            For NDIS participants who want support that goes beyond task completion.
          </p>
        </FadeIn>

        <div className="grid-3">
          <FadeIn delay={0.05}>
            <Card
              title="Life Skills Training"
              excerpt="Practical, goal‑oriented sessions built around who you are and what you want to achieve."
              eyebrow="01"
              href="/services"
              image="https://placehold.co/600x400/F3D5C5/60665A?text=Life+Skills"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card
              title="Home & Daily Living"
              excerpt="Routines, organisation, meal planning, and systems that reduce friction day to day."
              eyebrow="02"
              href="/services"
              image="https://placehold.co/600x400/DDE2D7/60665A?text=Daily+Living"
            />
          </FadeIn>
          <FadeIn delay={0.15}>
            <Card
              title="Budgeting & Money"
              excerpt="Building confidence with money management, planning, and practical budgeting."
              eyebrow="03"
              href="/services"
              image="https://placehold.co/600x400/E8B79C/FFFFFF?text=Budgeting"
            />
          </FadeIn>
        </div>
      </Section>

      <Section className="bg-bg-subtle">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          <FadeIn className="h-full">
            <div className="rounded-lg border border-border bg-bg-surface p-6 h-full">
              <h3 className="text-h3 mb-2">Consistent Support</h3>
              <p className="text-body text-secondary">
                Sessions are planned around client goals and delivered with continuity you can rely
                on.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.05} className="h-full">
            <div className="rounded-lg border border-border bg-bg-surface p-6 h-full">
              <h3 className="text-h3 mb-2">Clear Communication</h3>
              <p className="text-body text-secondary">
                Families and participants receive timely updates around scheduling and progress.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="h-full">
            <div className="rounded-lg border border-border bg-bg-surface p-6 h-full">
              <h3 className="text-h3 mb-2">Practical Outcomes</h3>
              <p className="text-body text-secondary">
                Every session is designed to build everyday independence in real home and community
                contexts.
              </p>
            </div>
          </FadeIn>
        </div>
      </Section>

      <section className={styles.eventsSection} aria-labelledby="events-heading">
        <div className={styles.eventsInner}>
          <FadeIn className={styles.eventsHeader}>
            <div>
              <p className={styles.eventsEyebrow}>Community</p>
              <h2 className={styles.eventsTitle} id="events-heading">
                Events & <em>gatherings</em>
              </h2>
              <p className={styles.eventsSubtitle}>
                Community-run events open to all KQ Collective clients. Connect, learn, and grow
                alongside others on a similar journey.
              </p>
            </div>
            <Link href="/events" className={styles.eventsHeaderAction} aria-label="View all events">
              View all events
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </FadeIn>

          <div className={styles.eventsGrid}>
            {EVENTS.map(event => (
              <FadeIn key={event.title}>
                <article className={styles.eventCard}>
                  <div className={styles.eventDate}>
                    <span className={styles.eventDateDay}>{event.day}</span>
                    <span className={styles.eventDateMonth}>{event.month}</span>
                  </div>
                  <div className={styles.eventDivider} />
                  <span className={styles.eventTag}>{event.tag}</span>
                  <h3 className={styles.eventName}>{event.title}</h3>
                  <div className={styles.eventMeta}>
                    <span className={styles.eventMetaItem}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                        <path
                          d="M6 3v3l2 2"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>
                      {event.time}
                    </span>
                    <span className={styles.eventMetaItem}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 1C4.067 1 2.5 2.567 2.5 4.5 2.5 7.5 6 11 6 11s3.5-3.5 3.5-6.5C9.5 2.567 7.933 1 6 1z"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                        <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1" />
                      </svg>
                      {event.location}
                    </span>
                  </div>
                  <p className={styles.eventDescription}>{event.description}</p>
                  <Link href={event.ctaHref} className={styles.eventLink}>
                    {event.ctaLabel}
                    <svg
                      className={styles.eventLinkArrow}
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 7h10M8 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <Section variant="lg" className="bg-linen">
        <div className="grid-asym items-center">
          <FadeIn className="prose">
            <span className="eyebrow mb-4 block">Who We Are</span>
            <h2 className="text-h2 mb-6">Life skills training with professional warmth</h2>
            <p className="text-body mb-6">
              KQ Collective is a life skills training service built on one belief: every person deserves support that treats them as a full human being — not a case number or a checklist. Small by design. Real support requires knowing you well.
            </p>
            <ButtonLink href="/about" variant="dark">
              Read Our Story
            </ButtonLink>
          </FadeIn>
          <FadeIn
            className="relative aspect-square bg-bg-surface flex items-center justify-center border border-border overflow-hidden"
            delay={0.05}
          >
            <span className="text-display text-terracotta p-8">KQ</span>
          </FadeIn>
        </div>
      </Section>

      {/* Hidden Admin Login - visually hidden but accessible via keyboard (Tab to find it) */}
      <Link
        href="/auth"
        className="sr-only focus:not-sr-only focus:fixed focus:bottom-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-bg-surface focus:border focus:border-border focus:rounded-lg focus:text-sm focus:text-secondary focus:shadow-lg"
      >
        Admin Login
      </Link>
    </>
  );
}
