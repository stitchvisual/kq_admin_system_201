/**
 * Enhanced Button Component
 * =========================
 *
 * A feature-rich button that extends the botanical Button with:
 * - Loading state with spinner
 * - Success/error state variants
 * - Smooth press animations
 *
 * For standard buttons, use Button from '@/components/botanical'.
 * Use EnhancedButton when you need loading states or action feedback.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { colors, shadows, animations, typography } from '@/styles/botanical';

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows loading spinner and disables interaction */
  loading?: boolean;
  /** Text to display when loading (replaces children) */
  loadingText?: string;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnhancedButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  style,
  ...props
}: EnhancedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeStyles = {
    sm: { height: '32px', padding: '0 12px', fontSize: '0.75rem' },
    md: { height: '40px', padding: '0 16px', fontSize: '0.875rem' },
    lg: { height: '48px', padding: '0 24px', fontSize: '1rem' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primaryBase,
      color: 'white',
      border: 'none',
      boxShadow: shadows.button,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.secondary,
      border: `1px solid ${colors.primary}`,
      boxShadow: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primaryBase,
      border: `2px solid ${colors.primaryBase}`,
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.body,
      border: 'none',
      boxShadow: 'none',
    },
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: typography.body,
    fontWeight: 500,
    borderRadius: '8px',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: animations.smoothTransition,
    position: 'relative',
    overflow: 'hidden',
    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
    opacity: loading || disabled ? 0.7 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      className={cn('focus-ring', className)}
      style={buttonStyle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="animate-spin"
            style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
            }}
          />
        </span>
      )}
      <span
        style={{
          opacity: loading ? 0 : 1,
          transition: 'opacity 200ms',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
}

// ============================================================================
// STATE VARIANTS
// ============================================================================

interface StateButtonProps extends Omit<EnhancedButtonProps, 'variant'> {
  /** Additional style overrides */
  style?: React.CSSProperties;
}

/**
 * Success button - green variant for confirmations
 */
export function SuccessButton({ children, style, ...props }: StateButtonProps) {
  return (
    <EnhancedButton
      {...props}
      style={{
        backgroundColor: 'hsl(130 40% 45%)',
        color: 'white',
        ...style,
      }}
    >
      <CheckIcon />
      {children}
    </EnhancedButton>
  );
}

/**
 * Error button - red variant for destructive actions
 */
export function ErrorButton({ children, style, ...props }: StateButtonProps) {
  return (
    <EnhancedButton
      {...props}
      style={{
        backgroundColor: 'hsl(0 60% 50%)',
        color: 'white',
        ...style,
      }}
    >
      <AlertIcon />
      {children}
    </EnhancedButton>
  );
}

// ============================================================================
// ICONS (inline to avoid extra imports)
// ============================================================================

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
