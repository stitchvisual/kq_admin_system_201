import { Section } from '@/components/marketing/ui/section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | KQ Collective',
  description:
    'Terms of use for the KQ Collective website and client portal. Account use, confidentiality, and service agreements.',
};

export default function TermsPage() {
  return (
    <Section variant="lg">
      <div className="max-w-3xl stack-6">
        <h1 className="text-h1">Terms of Service</h1>
        <p className="text-body text-secondary">
          By using this website and client portal, you agree to provide accurate information,
          maintain account confidentiality, and use the platform for lawful purposes only.
        </p>
        <p className="text-body text-secondary">
          Appointment timing, cancellations, and invoice terms are confirmed directly during
          onboarding and service agreements. For questions about these terms, contact
          hello@kqcollective.com.
        </p>
      </div>
    </Section>
  );
}
