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

export { ClientAvatar, ClientMiniAvatar } from '@/components/avatars/ClientAvatar';