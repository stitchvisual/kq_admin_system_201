'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { slideInRight } from '@/lib/motion/variants';
import {
  SheetHandle,
  PanelHeader,
  PanelContent,
  PanelFooter,
} from '@/components/panels/index';
import { cn } from '@/lib/utils';

export interface ContextPanelProps {
  breadcrumb: string;
  title: string;
  accentClass?: string;
  titleColorClass?: string;
  showAccentBar?: boolean;
  isOpen?: boolean;
  isClosing?: boolean;
  onClose: () => void;
  onToggle?: () => void;
  collapsed?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ContextPanel({
  breadcrumb,
  title,
  accentClass,
  titleColorClass,
  showAccentBar = true,
  isOpen = true,
  isClosing = false,
  onClose,
  onToggle,
  collapsed,
  children,
  footer,
  className,
}: ContextPanelProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col h-full min-h-0 bg-card overflow-hidden',
        className
      )}
      variants={slideInRight}
      initial="hidden"
      animate={isOpen && !isClosing ? "visible" : "hidden"}
      exit="exit"
    >
      <SheetHandle className="md:hidden" />

      {showAccentBar && accentClass && (
        <div className={cn('h-[3px] w-full flex-shrink-0', accentClass)} />
      )}

      <PanelHeader
        showAccentBar={false}
        breadcrumb={breadcrumb}
        title={title}
        accentClass={accentClass}
        titleColorClass={titleColorClass}
        onClose={onClose}
        onToggle={onToggle}
        collapsed={collapsed}
      />

      {children}

      {footer && <PanelFooter>{footer}</PanelFooter>}
    </motion.div>
  );
}

export default ContextPanel;