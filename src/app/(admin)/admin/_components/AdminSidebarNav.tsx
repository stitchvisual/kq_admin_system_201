'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar, Users, FileText, CalendarDays } from 'lucide-react';
import { colors, shadows, typography } from '@/styles/botanical';

const MotionLink = motion(Link);
const tooltipEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Schedule', icon: Calendar },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/invoices', label: 'Invoices', icon: FileText },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
] as const;

function SidebarNavItem({
  item,
}: {
  item: (typeof navItems)[number];
}) {
  const [tipOpen, setTipOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const linkRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    if (!tipOpen || typeof document === 'undefined') return;
    const el = linkRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [tipOpen]);

  return (
    <>
      <MotionLink
        ref={linkRef}
        href={item.href}
        className="sidebar-nav-link relative w-10 h-10 rounded-xl flex items-center justify-center"
        aria-label={item.label}
        onMouseEnter={() => setTipOpen(true)}
        onMouseLeave={() => setTipOpen(false)}
        onFocus={() => setTipOpen(true)}
        onBlur={() => setTipOpen(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.91 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      >
        <item.icon className="h-[18px] w-[18px]" aria-hidden />
      </MotionLink>
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {tipOpen && (
              <motion.span
                key="tooltip"
                role="tooltip"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15, ease: tooltipEase }}
                className="fixed px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap z-[10010] pointer-events-none -translate-y-1/2"
                style={{
                  top: coords.top,
                  left: coords.left,
                  background: colors.heading,
                  color: colors.card,
                  boxShadow: shadows.elevated,
                  fontFamily: typography.body,
                }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export function AdminSidebarNav() {
  return (
    <nav className="flex-1 flex flex-col items-center gap-2" aria-label="Main navigation">
      {navItems.map((item) => (
        <SidebarNavItem key={item.href} item={item} />
      ))}
    </nav>
  );
}
