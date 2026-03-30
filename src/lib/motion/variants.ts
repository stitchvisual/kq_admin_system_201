import type { Variants, Transition } from 'framer-motion';

/** Premium cubic bezier easing - smooth deceleration for polished feel */
export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Standard spring configuration for premium feel */
export const springPremium: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 30,
};

/** Gentle spring for larger elements */
export const springGentle: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 28,
};

/** Snappy spring for quick interactions */
export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

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

/* ─────────────────────────────────────────────────────────────────────────────
   Premium Page Transitions
   ───────────────────────────────────────────────────────────────────────────── */

/** Page enter animation - subtle fade + slide up */
export const pageEnter: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/** Content section with orchestrated entrance */
export const contentSection: Variants = {
  hidden: { 
    opacity: 0, 
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOutExpo,
    },
  },
};

/** Premium stagger container with configurable delay */
export const staggerPremium: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

/** Slow stagger for dramatic reveals */
export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** List item for use with stagger containers */
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: easeOutExpo,
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Premium Modal & Panel Animations
   ───────────────────────────────────────────────────────────────────────────── */

/** Premium modal with scale + fade */
export const modalPremium: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...springPremium,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/** Panel slide from right */
export const panelSlide: Variants = {
  hidden: { 
    opacity: 0, 
    x: '100%',
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 32,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Success/Error Micro-animations
   ───────────────────────────────────────────────────────────────────────────── */

/** Success checkmark pop */
export const successPop: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springSnappy,
    },
  },
};

/** Error shake */
export const errorShake: Variants = {
  hidden: { x: 0 },
  visible: {
    x: 0,
    transition: {
      duration: 0.4,
    },
  },
  shake: {
    x: [-4, 4, -4, 4, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Card & Item Hover Effects
   ───────────────────────────────────────────────────────────────────────────── */

/** Premium card hover */
export const cardHover: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    transition: {
      duration: 0.2,
      ease: easeOutExpo,
    },
  },
  hover: {
    y: -2,
    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.02)',
    transition: {
      duration: 0.2,
      ease: easeOutExpo,
    },
  },
};

/** List item hover with subtle lift */
export const listItemHover: Variants = {
  rest: {
    x: 0,
    backgroundColor: 'transparent',
    transition: {
      duration: 0.15,
      ease: easeOutExpo,
    },
  },
  hover: {
    x: 4,
    backgroundColor: 'rgba(130, 130, 100, 0.05)',
    transition: {
      duration: 0.15,
      ease: easeOutExpo,
    },
  },
};
