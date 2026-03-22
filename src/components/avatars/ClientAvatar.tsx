'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const CLIENT_COLORS = ['#7895aa', '#82a091', '#b69470', '#a08090', '#8a9ab0', '#9ab0a0'] as const;

function getClientColor(clientId: string): string {
  const hash = clientId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CLIENT_COLORS[hash % CLIENT_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

export interface ClientAvatarProps {
  name: string;
  clientId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-6 w-6 text-[0.625rem]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export function ClientAvatar({ name, clientId, size = 'md', className }: ClientAvatarProps) {
  const color = getClientColor(clientId);
  const initials = getInitials(name);
  const sizeClass = sizeMap[size];

  return (
    <Avatar className={className}>
      <AvatarFallback className={cn(sizeClass, 'font-bold text-white')} style={{ backgroundColor: color }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export interface ClientMiniAvatarProps {
  name: string;
  clientId: string;
  className?: string;
}

/** Compact inline avatar for table rows. */
export function ClientMiniAvatar({ name, clientId, className }: ClientMiniAvatarProps) {
  const color = getClientColor(clientId);
  const initials = getInitials(name);

  return (
    <span
      className={cn('inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold text-white mr-2 align-middle', className)}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}
