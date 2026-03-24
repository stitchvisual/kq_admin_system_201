import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { getButtonClassName, type ButtonSize, type ButtonVariant } from '@/components/marketing/ui/button';

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

export function ButtonLink({
  children,
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClassName({ className, variant, size })}
      {...props}
    >
      {children}
    </Link>
  );
}
