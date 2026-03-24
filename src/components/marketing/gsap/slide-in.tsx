'use client';

import { useRef } from 'react';
import { useGSAP, gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

type SlideInProps = {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
};

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className,
}: SlideInProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (prefersReducedMotion()) return;

      let x = 0;
      let y = 0;

      switch (direction) {
        case 'left':
          x = -distance;
          break;
        case 'right':
          x = distance;
          break;
        case 'up':
          y = distance;
          break;
        case 'down':
          y = -distance;
          break;
      }

      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          x,
          y,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
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
