'use client';

import { useRef } from 'react';
import { useGSAP, gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: number;
  className?: string;
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  y = 12,
  stagger = 0,
  className,
}: FadeInProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (prefersReducedMotion()) return;

      const elements =
        containerRef.current.children.length > 0
          ? containerRef.current.children
          : [containerRef.current];
      
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
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
