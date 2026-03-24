'use client';

import { useActionState } from 'react';
import { Button } from '@/components/marketing/ui/button';
import { ButtonLink } from '@/components/marketing/ui/button-link';
import { Section } from '@/components/marketing/ui/section';
import { Input } from '@/components/marketing/ui/input';
import { Textarea } from '@/components/marketing/ui/textarea';
import { Label } from '@/components/marketing/ui/label';
import { submitContactForm } from '@/lib/marketing-contact-actions';

export default function ContactPage() {
  const [state, formAction] = useActionState(submitContactForm, null);
  const isSubmitted = state?.success === true;

  return (
    <>
      <Section variant="lg">
        <div className="grid md:grid-cols-2 gap-16 md:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)]">
          <div className="min-w-0">
            <span className="eyebrow mb-6 block">Contact</span>
            <h1 className="text-h1 mb-8">Let's talk about your goals.</h1>
            <p className="text-body text-secondary mb-12 max-w-md">
              New client enquiries and scheduling requests are welcome. We respond with the same
              respect and care we bring to sessions.
            </p>

            <div className="rounded-lg border border-border bg-bg-subtle p-6 mb-10 max-w-md">
              <h2 className="text-h3 mb-3">Before You Submit</h2>
              <ul className="space-y-2 text-sm text-secondary">
                <li>Include your main goals so we can respond with relevant support options.</li>
                <li>Typical response time is within 1 business day.</li>
                <li>For booking-specific questions, we can suggest the best session type first.</li>
              </ul>
            </div>

            <div className="stack-6">
              <div>
                <h4 className="form-label mb-2">Email</h4>
                <a
                  href="mailto:hello@kqcollective.com"
                  className="text-h3 text-primary hover:text-terracotta transition-colors"
                >
                  hello@kqcollective.com
                </a>
              </div>

              <div>
                <h4 className="form-label mb-2">Social</h4>
                <div className="cluster">
                  <span className="text-body text-secondary">Instagram (coming soon)</span>
                  <span className="text-body text-secondary">LinkedIn (coming soon)</span>
                  <span className="text-body text-secondary">Twitter (coming soon)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border py-12 px-8 md:py-16 md:px-14 border-[var(--color-border-subtle)]">
            {isSubmitted ? (
              <div
                className="text-center py-12 space-y-6"
              >
                <h3 className="text-h3 text-terracotta mb-2" id="contact-success-heading">Message sent</h3>
                <p className="text-body text-secondary max-w-md mx-auto">
                  Thank you for reaching out. We aim to respond within one business day. Check your
                  inbox for our reply.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <ButtonLink href="/services" variant="outline" className="w-full sm:w-auto justify-center">
                    Explore services
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-10">
                {state?.message && !state?.success && (
                  <p className="form-error" role="alert">
                    {state.message}
                  </p>
                )}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    required
                    aria-invalid={!!state?.errors?.name}
                  />
                  {state?.errors?.name && (
                    <p className="form-error">{state.errors.name[0]}</p>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="jane@example.com"
                    required
                    aria-invalid={!!state?.errors?.email}
                  />
                  {state?.errors?.email && (
                    <p className="form-error">{state.errors.email[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    name="subject"
                    className="form-input form-select"
                    required
                    aria-invalid={!!state?.errors?.subject}
                  >
                    <option value="">Select a subject</option>
                    <option value="New Client Enquiry">New Client Enquiry</option>
                    <option value="NDIS Enquiry">NDIS Enquiry</option>
                    <option value="Scheduling">Scheduling</option>
                    <option value="Other">Other</option>
                  </select>
                  {state?.errors?.subject && (
                    <p className="form-error">{state.errors.subject[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    className="min-h-[160px]"
                    placeholder="Tell us about your goals..."
                    required
                    aria-invalid={!!state?.errors?.message}
                  />
                  {state?.errors?.message && (
                    <p className="form-error">{state.errors.message[0]}</p>
                  )}
                </div>

                <div className="pt-6">
                  <Button variant="primary" type="submit" className="w-full justify-center">
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}