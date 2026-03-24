'use client';

import { useRef } from 'react';
import { useGSAP, gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

type StaggerContainerProps = {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  triggerStart?: string;
};

export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  triggerStart = 'top 85%',
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (prefersReducedMotion()) return;

      const elements = containerRef.current.children;

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 12,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: triggerStart,
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
