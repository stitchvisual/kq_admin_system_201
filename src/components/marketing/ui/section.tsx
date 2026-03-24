'use client';

import React from 'react';
import clsx from 'clsx';
import { FadeIn } from '@/components/marketing/gsap/fade-in';
import { StaggerContainer } from '@/components/marketing/gsap/stagger-container';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'lg' | 'sm';
  className?: string;
  children: React.ReactNode;
  container?: boolean;
  motion?: 'none' | 'fade' | 'stagger';
  motionDelay?: number;
  motionStagger?: number;
}

export function Section({
  variant = 'default',
  className,
  children,
  container = true,
  motion = 'stagger',
  motionDelay = 0,
  motionStagger = 0.08,
  ...props
}: SectionProps) {
  const variants = {
    default: 'section',
    lg: 'section-lg',
    sm: 'section-sm',
  };

  return (
    <section className={clsx(variants[variant], className)} {...props}>
      {container ? (
        <div className="wrap">
          {motion === 'stagger' ? (
            <StaggerContainer delay={motionDelay} stagger={motionStagger}>
              {children}
            </StaggerContainer>
          ) : motion === 'fade' ? (
            <FadeIn delay={motionDelay}>{children}</FadeIn>
          ) : (
            children
          )}
        </div>
      ) : (
        motion === 'stagger' ? (
          <StaggerContainer delay={motionDelay} stagger={motionStagger}>
            {children}
          </StaggerContainer>
        ) : motion === 'fade' ? (
          <FadeIn delay={motionDelay}>{children}</FadeIn>
        ) : (
          children
        )
      )}
    </section>
  );
}
