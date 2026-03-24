import React from 'react';
import { Section } from '@/components/marketing/ui/section';
import { ButtonLink } from '@/components/marketing/ui/button-link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | KQ Collective',
  description:
    'KQ Collective is a life skills training service built on relationship-first, NDIS-funded support. Small by design. Founded by Kirsten Quinn.',
};

export default function AboutPage() {
  return (
    <>
      <Section variant="lg" className="text-center">
        <span className="eyebrow mb-6 block">Our Story</span>
        <h1 className="text-h1 mb-8">KQ Collective</h1>
        <p className="text-body text-secondary max-w-2xl mx-auto text-lg">
          KQ Collective is a life skills training service built on one belief: every person deserves
          support that treats them as a full human being &mdash; not a case number or a checklist.
          Founded by Kirsten Quinn, we take a relationship‑first approach to NDIS‑funded support.
          Small by design. Intentionally so.
        </p>
      </Section>

      <Section className="bg-linen">
        <div className="grid-asym items-center gap-12">
          <div className="aspect-[3/4] bg-bg-subtle relative">
            <div className="absolute inset-0 flex items-center justify-center text-tertiary">
              Image
            </div>
          </div>
          <div className="prose">
            <h2 className="text-h2 mb-6">Why We Exist</h2>
            <p className="text-body mb-6">
              We exist to make independence feel possible &mdash; not as an end goal, but as an
              everyday reality.
            </p>
            <p className="text-body mb-6">
              Our promise is simple: every client receives support that is tailored, dependable, and
              delivered with genuine respect. We show up prepared. We adapt as goals evolve.
            </p>
            <h3 className="text-h3 mb-4">Who We&apos;re For</h3>
            <p className="text-body">
              Adults living with disability who want support that goes beyond task completion.
              People with clear goals for their home, routines, and futures &mdash; and a worker who
              listens before they act.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="text-center mb-16">
          <span className="eyebrow mb-4 block">How We Work</span>
          <h2 className="text-h2">Professional warmth. Real partnership.</h2>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-body">
            Not the biggest, not the cheapest &mdash; the best fit for people who want support that
            feels like a real partnership. The brand goal is simple: make KQ Collective feel like
            the obvious choice for clients who value quality over volume.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact">Contact us</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
