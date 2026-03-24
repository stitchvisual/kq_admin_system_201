import React from 'react';
import clsx from 'clsx';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export function Display({ children, className, ...props }: TypographyProps) {
  return <h1 className={clsx('text-display', className)} {...props}>{children}</h1>;
}

export function H1({ children, className, ...props }: TypographyProps) {
  return <h1 className={clsx('text-h1', className)} {...props}>{children}</h1>;
}

export function H2({ children, className, ...props }: TypographyProps) {
  return <h2 className={clsx('text-h2', className)} {...props}>{children}</h2>;
}

export function H3({ children, className, ...props }: TypographyProps) {
  return <h3 className={clsx('text-h3', className)} {...props}>{children}</h3>;
}

export function Body({ children, className, ...props }: TypographyProps) {
  return <p className={clsx('text-body', className)} {...props}>{children}</p>;
}

export function Eyebrow({ children, className, ...props }: TypographyProps) {
  return <span className={clsx('eyebrow text-terracotta block mb-4', className)} {...props}>{children}</span>;
}
