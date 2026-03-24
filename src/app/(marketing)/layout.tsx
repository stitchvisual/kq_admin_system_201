import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/layout/Navbar';
import { Footer } from '@/components/marketing/layout/Footer';
import { config } from '@/lib/marketing-config';

export const metadata: Metadata = {
  title: 'KQ Collective',
  description: 'NDIS life skills support on the Mid North Coast of NSW.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="marketing" className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {config.env.mockMode && (
        <div className="bg-terracotta-low border-b border-terracotta-mid px-4 py-2 text-center text-sm font-medium tracking-wide text-terracotta">
          MOCK MODE
        </div>
      )}
      <Navbar />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
