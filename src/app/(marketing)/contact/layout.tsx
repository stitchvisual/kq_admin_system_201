import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | KQ Collective',
  description:
    'Get in touch with KQ Collective. Send a message about life skills training, NDIS support, or booking a session.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
