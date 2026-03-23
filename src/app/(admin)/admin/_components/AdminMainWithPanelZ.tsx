'use client';

import { useMobilePanel } from '@/context/MobilePanelContext';
import { cn } from '@/lib/utils';

export function AdminMainWithPanelZ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isOpen } = useMobilePanel();
  return (
    <main
      className={cn(
        className,
        isOpen && 'max-md:z-[60] max-md:relative'
      )}
    >
      {children}
    </main>
  );
}
