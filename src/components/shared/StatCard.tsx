'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import { colors, radii, typography, shadows } from '@/styles/botanical';

function formatAudFromCents(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(cents / 100);
}

/** Counts up from 0 to `cents` on mount / when `cents` changes */
function AnimatedCentsValue({ cents }: { cents: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(() => formatAudFromCents(0));

  useEffect(() => {
    motionVal.set(cents);
  }, [cents, motionVal]);

  useMotionValueEvent(spring, 'change', latest => {
    setDisplay(formatAudFromCents(Math.round(latest)));
  });

  return <>{display}</>;
}

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  /** Amount in cents — when set, the value animates from 0 with a spring (use with formatted `value` as fallback for SSR) */
  valueCents?: number;
  subtext?: string;
  color: string;
  bg: string;
  borderColor: string;
  highlight?: boolean;
  isZero?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  valueCents,
  subtext,
  color,
  bg,
  borderColor,
  highlight = false,
  isZero = false,
  onClick,
  href,
  className = '',
}: StatCardProps) {
  const interactive = !!(onClick || href);

  const cardStyle: React.CSSProperties = {
    padding: '1rem 1.25rem',
    borderRadius: radii.card,
    background: bg,
    border: isZero ? `1.5px dashed ${borderColor}` : `1px solid ${borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'relative',
    boxShadow: highlight
      ? `0 0 0 2px ${color}40`
      : `inset 0 1px 0 rgba(255,255,255,0.7), ${shadows.subtle}`,
    cursor: interactive ? 'pointer' : 'default',
    opacity: isZero ? 0.75 : 1,
    textDecoration: 'none',
  };

  const hoverAnimation = interactive
    ? {
        y: -2,
        scale: 1.02,
        boxShadow: highlight
          ? `0 0 0 2px ${color}50, 0 4px 16px -2px rgba(62,44,28,0.13)`
          : `inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px -2px rgba(62,44,28,0.13)`,
      }
    : undefined;

  const valueNode = valueCents !== undefined ? <AnimatedCentsValue cents={valueCents} /> : value;

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: typography.sizes.label,
            fontWeight: typography.weights.bold,
            letterSpacing: typography.letterSpacing.label,
            textTransform: 'uppercase',
            color,
            opacity: isZero ? 0.7 : 0.9,
          }}
        >
          {label}
        </span>
        <div style={{ color, opacity: isZero ? 0.5 : 0.8 }}>{icon}</div>
      </div>
      <div>
        <div
          style={{
            fontFamily: typography.heading,
            fontSize: '1.5rem',
            fontWeight: typography.weights.bold,
            color: isZero ? colors.muted : colors.heading,
            marginBottom: '0.25rem',
            lineHeight: 1.15,
          }}
        >
          {valueNode}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: typography.sizes.small,
              color: isZero ? colors.muted : colors.secondary,
              fontWeight: 500,
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </>
  );

  const motionTransition = { type: 'spring' as const, stiffness: 300, damping: 28 };

  if (href) {
    return (
      <motion.a
        href={href}
        className={className}
        style={cardStyle}
        whileHover={hoverAnimation}
        whileTap={interactive ? { scale: 0.99 } : undefined}
        transition={motionTransition}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      className={className}
      style={cardStyle}
      onClick={onClick}
      whileHover={hoverAnimation}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      transition={motionTransition}
    >
      {content}
    </motion.div>
  );
}

// StatCard Grid Container
export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {children}
    </div>
  );
}

// Skeleton loader for stat cards
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 10,
            background: 'var(--color-semantic-background-muted)',
            border: '1px solid var(--color-semantic-border-default)',
            minHeight: 88,
          }}
        />
      ))}
    </div>
  );
}
