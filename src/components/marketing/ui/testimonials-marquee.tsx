'use client';

import React from 'react';
import clsx from 'clsx';

type TestimonialsMarqueeProps = {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  speed?: 'slow' | 'base' | 'fast';
  direction?: 'left' | 'right';
  offsetSec?: number;
};

export function TestimonialsMarquee({
  children,
  className,
  pauseOnHover = true,
  speed = 'base',
  direction = 'left',
  offsetSec,
}: TestimonialsMarqueeProps) {
  const items = React.Children.toArray(children);
  const doubled = [...items, ...items];

  return (
    <div
      className={clsx(
        'marquee',
        pauseOnHover && 'marquee--pause-on-hover',
        speed === 'slow' && 'marquee--slow',
        speed === 'fast' && 'marquee--fast',
        direction === 'right' && 'marquee--reverse',
        className,
      )}
      aria-label="Client testimonials"
      role="region"
    >
      <div
        className="marquee__track"
        style={offsetSec ? ({ animationDelay: `-${offsetSec}s` } as React.CSSProperties) : undefined}
      >
        {doubled.map((child, idx) => (
          <div key={idx} className="marquee__item">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
