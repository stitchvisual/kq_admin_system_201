'use client';

import React from 'react';
import { useThemeColors } from '@/hooks/use-theme-colors';

// ============================================================================
// DATE INPUT COMPONENT
// ============================================================================

interface DateInputProps {
  /** Label text displayed above the input */
  label?: string;
  /** Current date value in YYYY-MM-DD format */
  value: string;
  /** Callback when date changes */
  onChange: (date: string) => void;
  /** Placeholder text (not typically shown for date inputs) */
  placeholder?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Minimum date in YYYY-MM-DD format */
  min?: string;
  /** Maximum date in YYYY-MM-DD format */
  max?: string;
  /** Additional wrapper styles */
  style?: React.CSSProperties;
  /** Additional input className */
  className?: string;
  /** ID for the input element */
  id?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

export function DateInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  min,
  max,
  style,
  className,
  id,
  'data-testid': testId,
}: DateInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const { colors } = useThemeColors()

  const getLabelStyle = (): React.CSSProperties => ({
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: '0.5rem',
  });

  const getInputStyle = (): React.CSSProperties => ({
    width: '100%',
    height: 36,
    padding: '0 10px',
    borderRadius: 8,
    border: `1px solid ${colors.primary}`,
    background: colors.card,
    fontSize: '0.82rem',
    color: colors.heading,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
    ...(isFocused && {
      borderColor: colors.primaryBase,
      boxShadow: `0 0 0 2px ${colors.primaryBg}`,
    }),
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  });

  const inputElement = (
    <input
      type="date"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      data-testid={testId}
      className={className}
      style={getInputStyle()}
    />
  );

  if (!label) {
    return <div style={style}>{inputElement}</div>;
  }

  return (
    <div style={style}>
      <p style={getLabelStyle()}>{label}</p>
      {inputElement}
    </div>
  );
}

// ============================================================================
// DATE RANGE INPUT COMPONENT
// ============================================================================

interface DateRangeInputProps {
  /** Start date value in YYYY-MM-DD format */
  startDate: string;
  /** End date value in YYYY-MM-DD format */
  endDate: string;
  /** Callback when start date changes */
  onStartDateChange: (date: string) => void;
  /** Callback when end date changes */
  onEndDateChange: (date: string) => void;
  /** Start date label */
  startLabel?: string;
  /** End date label */
  endLabel?: string;
  /** Gap between inputs */
  gap?: string | number;
  /** Additional wrapper styles */
  style?: React.CSSProperties;
}

export function DateRangeInput({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  gap = '1rem',
  style,
}: DateRangeInputProps) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-end', ...style }}>
      <div style={{ flex: 1 }}>
        <DateInput
          label={startLabel}
          value={startDate}
          onChange={onStartDateChange}
          max={endDate || undefined}
        />
      </div>
      <div style={{ flex: 1 }}>
        <DateInput
          label={endLabel}
          value={endDate}
          onChange={onEndDateChange}
          min={startDate || undefined}
        />
      </div>
    </div>
  );
}

export default DateInput;