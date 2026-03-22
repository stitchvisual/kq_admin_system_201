"use client"

import React, { useState } from 'react';
import { buttonStyles, animations, radii, typography, sizes } from '@/styles/botanical';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'nav';
  bg?: string;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', bg, children, style, className, ...props }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { colors, shadows } = useThemeColors()
  
  const getStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          height: sizes.buttonHeight,
          borderRadius: radii.button,
          border: 'none',
          background: bg || colors.primaryBase,
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: typography.weights.heading,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: typography.body,
          boxShadow: shadows.button,
          transform: isPressed ? 'scale(0.98)' : 'scale(1)',
          transition: `${animations.transformSubtle}, ${animations.buttonShadow}`,
        };
      case 'secondary':
        return {
          height: sizes.buttonHeight,
          padding: '0 14px',
          borderRadius: radii.button,
          border: `1px solid ${colors.primary}`,
          background: 'transparent',
          color: colors.secondary,
          fontSize: '0.8rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          fontFamily: typography.body,
          transform: isPressed ? 'scale(0.98)' : 'scale(1)',
          transition: animations.subtle,
          backgroundColor: isPressed ? colors.mutedBg : 'transparent',
        };
      case 'nav':
        return {
          width: sizes.navBtn,
          height: sizes.navBtn,
          borderRadius: radii.button,
          border: `1px solid ${colors.primary}`,
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.secondary,
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          transition: animations.transformSubtle,
          backgroundColor: isPressed ? colors.mutedBg : 'transparent',
        };
      default:
        return {
          height: sizes.buttonHeight,
          borderRadius: radii.button,
          border: 'none',
          background: bg || colors.primaryBase,
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: typography.weights.heading,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: typography.body,
          boxShadow: shadows.button,
          transform: isPressed ? 'scale(0.98)' : 'scale(1)',
          transition: `${animations.transformSubtle}, ${animations.buttonShadow}`,
        };
    }
  };

  const getHoverStyle = (hoverBg?: string): React.CSSProperties => {
    if (variant === 'secondary' || variant === 'nav') {
      return {
        backgroundColor: colors.mutedBg,
      };
    }
    // Primary buttons get darker on hover
    return {
      backgroundColor: hoverBg || colors.primaryHover,
      transform: 'scale(1.02)',
    };
  };

  return (
    <button
      style={{ ...getStyle(), ...style }}
      className={cn('focus-ring', className)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </button>
  );
}
