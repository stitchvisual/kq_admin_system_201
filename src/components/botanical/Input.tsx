"use client"

import React, { useState } from 'react';
import { formStyles, radii, typography, sizes, spacing } from '@/styles/botanical';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

export function Input({ label, error = false, style, className, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useThemeColors()
  
  const getInputStyle = (): React.CSSProperties => {
    return {
      width: '100%',
      height: sizes.inputHeight,
      padding: spacing.inputPadding,
      borderRadius: radii.input,
      border: `1px solid ${colors.primary}`,
      background: colors.card,
      fontSize: typography.sizes.body,
      color: colors.heading,
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: typography.body,
      borderColor: error 
        ? 'hsl(0 84.2% 60.2%)' 
        : isFocused 
          ? colors.primaryBase 
          : colors.primary,
      backgroundColor: isFocused
        ? colors.mutedBg
        : colors.card,
      ...(isFocused && {
        boxShadow: `0 0 0 3px ${colors.primaryBg}`,
      }),
      transition: 'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
      ...style,
    };
  };

  const getLabelStyle = (): React.CSSProperties => {
    return {
      fontSize: typography.sizes.label,
      fontWeight: typography.weights.bold,
      letterSpacing: typography.letterSpacing.label,
      textTransform: 'uppercase',
      color: error ? 'hsl(0 84.2% 60.2%)' : colors.muted,
    };
  };

  return (
    <>
      {label && <label style={getLabelStyle()}>{label}</label>}
      <input
        style={getInputStyle()}
        className={cn('focus-ring', className)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </>
  );
}
