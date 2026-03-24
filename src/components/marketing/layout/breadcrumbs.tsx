'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Overview',
  appointments: 'Appointments',
  invoices: 'Invoices',
  profile: 'Profile',
};

/** CUIDs are 25 chars, start with 'c'. UUIDs are 36 with hyphens. */
function isIdSegment(segment: string): boolean {
  return segment.length >= 20 && segment.length <= 40 && /^[a-z0-9-]+$/i.test(segment);
}

function getSegmentLabel(segment: string, _index: number, segments: string[]): string {
  if (segment in SEGMENT_LABELS) {
    return SEGMENT_LABELS[segment];
  }
  if (isIdSegment(segment)) {
    const parent = segments[segments.length - 2];
    if (parent === 'invoices') return 'Invoice';
    return 'Detail';
  }
  return segment;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname.startsWith('/dashboard')) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const items: { href: string; label: string; isLast: boolean }[] = [];
  let href = '';
  for (let i = 0; i < segments.length; i++) {
    href += (href ? '/' : '') + segments[i];
    const label = getSegmentLabel(segments[i], i, segments);
    items.push({ href: `/${href}`, label, isLast: i === segments.length - 1 });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-secondary">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden />
            )}
            {item.isLast ? (
              <span className="font-medium text-text-primary" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-terracotta transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
