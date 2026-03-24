import React from 'react';
import { Section } from '@/components/marketing/ui/section';
import { FeatureCard as Card } from '@/components/marketing/ui/feature-card';
import { ButtonLink } from '@/components/marketing/ui/button-link';
import type { Metadata } from 'next';
import { FadeIn } from '@/components/marketing/motion/FadeIn';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Services | KQ Collective',
  description:
    'Life skills training, home and daily living support, and community participation for NDIS participants. Goal-focused, respectful support.',
};

export default function ServicesPage() {
  return (
    <>
      <Section variant="lg" className="bg-off-white">
        <FadeIn className="max-w-3xl">
          <span className="eyebrow mb-6 block">What We Do</span>
          <h1 className="text-h1 mb-8">Life skills training for everyday independence.</h1>
        </FadeIn>
      </Section>

      <Section>
        <div className="grid-3 gap-y-12">
          <FadeIn>
            <Card
              title="Life Skills Training"
              excerpt="Goal‑focused support tailored to you: practical, respectful, and consistent."
              eyebrow="01"
              image="https://placehold.co/600x400/F3D5C5/60665A?text=Life+Skills"
            />
          </FadeIn>
          <FadeIn delay={0.05}>
            <Card
              title="Home & Daily Living"
              excerpt="Routines, organisation, and systems that make day‑to‑day life easier."
              eyebrow="02"
              image="https://placehold.co/600x400/DDE2D7/60665A?text=Daily+Living"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card
              title="Budgeting & Money"
              excerpt="Planning, tracking, and building confidence with money management."
              eyebrow="03"
              image="https://placehold.co/600x400/E8B79C/FFFFFF?text=Budgeting"
            />
          </FadeIn>
          <FadeIn delay={0.15}>
            <Card
              title="Cooking & Nutrition"
              excerpt="Meal planning, shopping, and safe cooking skills for independence."
              eyebrow="04"
              image="https://placehold.co/600x400/F4F1EC/60665A?text=Cooking"
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <Card
              title="Travel & Transport"
              excerpt="Public transport, trip planning, and safe community navigation."
              eyebrow="05"
              image="https://placehold.co/600x400/859272/FFFFFF?text=Travel"
            />
          </FadeIn>
          <FadeIn delay={0.25}>
            <Card
              title="Community Participation"
              excerpt="Confidence and support to engage in activities that matter to you."
              eyebrow="06"
              image="https://placehold.co/600x400/60665A/F3D5C5?text=Community"
            />
          </FadeIn>
        </div>
      </Section>

      <Section className="bg-coffee text-inverse">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <span className="eyebrow text-terracotta mb-4 block">Work With Us</span>
          <h2 className="text-h2 text-inverse mb-6">Ready to start your support?</h2>
          <p className="text-body text-inverse opacity-90 mb-8">
            We are currently accepting new client enquiries subject to availability. Let&apos;s talk
            about your goals.
          </p>
          <ButtonLink href="/contact">
            Get in Touch
          </ButtonLink>
        </FadeIn>
      </Section>
    </>
  );
}
