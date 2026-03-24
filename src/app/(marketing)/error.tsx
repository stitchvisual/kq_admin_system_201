'use client';

import { useEffect } from 'react';
import { Button } from '@/components/marketing/ui/button';
import { ButtonLink } from '@/components/marketing/ui/button-link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-display text-2xl font-medium text-text-primary">
        Something went wrong
      </h1>
      <p className="max-w-md text-center text-text-secondary">
        An error occurred while loading this page. You can try again or return home.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} variant="primary" size="sm">
          Try again
        </Button>
        <ButtonLink href="/" variant="outline" size="sm">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
