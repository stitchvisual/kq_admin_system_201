'use client';

import React from 'react';
import { colors, radii, typography, shadows } from '@/styles/botanical';

export interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon, title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <header
      className={className}
      style={{
        background: colors.page,
        borderBottom: `1px solid ${colors.primary}`,
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 20,
        boxShadow: shadows.subtle,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
        {icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.button,
              background: colors.primaryBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h1
            style={{
              fontFamily: typography.heading,
              fontSize: typography.sizes.pageTitle,
              fontWeight: typography.weights.heading,
              color: colors.heading,
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: typography.sizes.small,
                color: colors.secondary,
                margin: 0,
                marginTop: '0.125rem',
                letterSpacing: '0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </header>
  );
}

// Client Avatar component for consistent identity markers
export interface ClientAvatarProps {
  name: string;
  clientId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ClientAvatar({ name, clientId, size = 'md' }: ClientAvatarProps) {
  const colors = [
    '#7895aa', '#82a091', '#b69470', '#a08090', '#8a9ab0', '#9ab0a0',
  ];
  
  const hash = clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const sizeMap = {
    sm: { width: 24, height: 24, fontSize: '0.625rem' },
    md: { width: 32, height: 32, fontSize: '0.75rem' },
    lg: { width: 40, height: 40, fontSize: 'var(--font-size-body)' },
  };
  
  const dims = sizeMap[size];
  
  return (
    <div
      style={{
        width: dims.width,
        height: dims.height,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: '#fff',
          fontSize: dims.fontSize,
          fontWeight: 700,
        }}
      >
        {initials || '?'}
      </span>
    </div>
  );
}

// Inline mini avatar for table rows
export function ClientMiniAvatar({ name, clientId }: { name: string; clientId: string }) {
  const colors = [
    '#7895aa', '#82a091', '#b69470', '#a08090', '#8a9ab0', '#9ab0a0',
  ];
  
  const hash = clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginRight: 8,
        verticalAlign: 'middle',
      }}
    >
      <span
        style={{
          color: '#fff',
          fontSize: '0.6rem',
          fontWeight: 600,
        }}
      >
        {initials || '?'}
      </span>
    </div>
  );
}