'use client';

import React from 'react';
import { colors, radii, typography, shadows } from '@/styles/botanical';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
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
  const cardStyle: React.CSSProperties = {
    padding: '1rem 1.25rem',
    borderRadius: radii.card,
    background: bg,
    border: isZero ? `1.5px dashed ${borderColor}` : `1px solid ${borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'relative',
    boxShadow: highlight ? `0 0 0 2px ${color}40` : `inset 0 1px 0 rgba(255,255,255,0.7), ${shadows.subtle}`,
    transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: onClick || href ? 'pointer' : 'default',
    opacity: isZero ? 0.75 : 1,
    textDecoration: 'none',
  };

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
          {value}
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

  // Add hover effects via inline handlers
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick || href) {
      const el = e.currentTarget as HTMLElement;
      el.style.boxShadow = highlight 
        ? `0 0 0 2px ${color}50, 0 4px 16px -2px rgba(62,44,28,0.13)` 
        : `inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px -2px rgba(62,44,28,0.13), 0 8px 24px -4px rgba(62,44,28,0.08)`;
      el.style.transform = 'translateY(-2px) scale(1.02)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.boxShadow = highlight 
      ? `0 0 0 2px ${color}40` 
      : isZero 
        ? 'none' 
        : `inset 0 1px 0 rgba(255,255,255,0.7), ${shadows.subtle}`;
    el.style.transform = 'translateY(0) scale(1)';
  };

  if (href) {
    return (
      <a 
        href={href} 
        className={className}
        style={cardStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <div 
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </div>
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
            background: 'hsl(47 22% 94%)',
            border: '1px solid hsl(37 18% 89%)',
            minHeight: 88,
          }}
        />
      ))}
    </div>
  );
}