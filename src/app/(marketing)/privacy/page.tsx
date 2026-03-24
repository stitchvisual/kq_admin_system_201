import { Section } from '@/components/marketing/ui/section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | KQ Collective',
  description:
    'How KQ Collective collects, uses, and protects your personal information. We do not sell your data.',
};

export default function PrivacyPage() {
  return (
    <Section variant="lg">
      <div className="max-w-3xl stack-6">
        <h1 className="text-h1">Privacy Policy</h1>
        <p className="text-body text-secondary">
          We collect only the personal information needed to provide support services, manage
          appointments, and communicate with clients. We do not sell your personal information.
        </p>
        <p className="text-body text-secondary">
          Information is stored securely and accessed only by authorized staff. If you would like a
          copy of your information or request changes, email hello@kqcollective.com.
        </p>
      </div>
    </Section>
  );
}
