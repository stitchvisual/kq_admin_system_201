"use client"

import React from 'react';
import { cardStyles, animations } from '@/styles/botanical';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, style, hoverable = true, className, ...props }: CardProps) {
  const { colors, shadows } = useThemeColors()

  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.primary}`,
        borderRadius: '10px',
        padding: '0.85rem',
        ...(hoverable && {
          cursor: 'pointer',
          transition: `${animations.smooth}, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }),
        ...style,
      }}
      className={cn(
        hoverable && 'card-hover',
        className
      )}
      onMouseEnter={(e) => {
        if (hoverable) {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = shadows.hover;
          el.style.transform = 'scale(1.01)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = shadows.subtle;
          el.style.transform = 'scale(1)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}
