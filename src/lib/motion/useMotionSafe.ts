import { useReducedMotion } from 'framer-motion';

export function useMotionSafe() {
  const shouldReduce = useReducedMotion();
  return {
    // Pass as `transition` override to any motion component
    safeTransition: shouldReduce ? { duration: 0 } : undefined,
    // Pass as `animate` to skip to final state instantly
    shouldAnimate: !shouldReduce,
  };
}
