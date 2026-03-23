import type { Variants } from 'framer-motion';

/** Cubic bezier easing compatible with Framer Motion `Transition.ease` */
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035 },
  },
};

// Dropdown / popover origin: top-right
export const dropdownMenu: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -4,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

export const backdropVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};
