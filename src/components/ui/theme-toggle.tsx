'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative h-10 w-10 rounded-full border border-border/40 bg-muted/40 hover:bg-muted/60 focus-ring"
        aria-label="Toggle theme"
        type="button"
      />
    );
  }

  const isDark = theme === 'dark';

  const handleToggle = () => {
    // Add transition class to html for smooth theme change
    document.documentElement.classList.add('theme-transitioning');

    // Start icon rotation animation
    setIsAnimating(true);

    // Toggle theme
    setTheme(isDark ? 'light' : 'dark');

    // Remove transition class and animation state after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsAnimating(false);
    }, 300);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        group relative
        h-10 w-10 rounded-full
        border border-border/40
        bg-background/50 backdrop-blur-sm
        hover:bg-muted/60
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]
        hover:scale-105 active:scale-95
        ${isAnimating ? 'animate-icon-spin' : ''}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      type="button"
    >
      {/* Glow effect on hover */}
      <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 transition-opacity duration-[var(--motion-duration-base)] group-hover:opacity-100" />

      {/* Icon container */}
      <span className="relative flex h-full w-full items-center justify-center">
        <Sun
          className={`
            h-5 w-5 text-primary
            transition-all duration-[var(--motion-duration-slow)] ease-[var(--motion-easing-default)]
            ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
          `}
          strokeWidth={2}
        />
        <Moon
          className={`
            absolute h-5 w-5 text-primary
            transition-all duration-[var(--motion-duration-slow)] ease-[var(--motion-easing-default)]
            ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
          strokeWidth={2}
        />
      </span>

      {/* Subtle ring on focus */}
      <span className="absolute -inset-0.5 rounded-full border-2 border-transparent opacity-0 transition-opacity duration-[var(--motion-duration-base)] group-focus-visible:opacity-100 group-focus-visible:border-primary/30" />
    </button>
  );
}
