import * as React from 'react';
import { cn } from '@/lib/marketing-utils';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'dark' | 'danger';
export type ButtonSize = 'default' | 'sm';

type ButtonClassOptions = {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function getButtonClassName({
  className,
  variant = 'primary',
  size = 'default',
}: ButtonClassOptions) {
  return cn(
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'outline' && 'btn-outline',
    variant === 'ghost' && 'btn-ghost',
    variant === 'dark' && 'btn-dark',
    variant === 'danger' && 'btn-danger',
    size === 'sm' && 'btn-sm',
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        className={getButtonClassName({ className, variant, size })}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
