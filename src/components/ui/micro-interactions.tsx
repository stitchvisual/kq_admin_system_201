import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Hook to detect reduced motion preference
function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

interface MicroInteractionProps {
  children: React.ReactNode;
  className?: string;
  trigger?: 'hover' | 'click' | 'focus';
  intensity?: 'subtle' | 'normal' | 'strong';
}

export function MicroInteraction({
  children,
  className,
  trigger = 'hover',
  intensity = 'normal',
  ...props
}: MicroInteractionProps) {
  const [isActive, setIsActive] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const intensityMap = {
    subtle: { scale: 1.02, duration: 150 },
    normal: { scale: 1.05, duration: 200 },
    strong: { scale: 1.08, duration: 250 },
  };

  const currentIntensity = intensityMap[intensity];

  const handleInteraction = () => {
    if (prefersReducedMotion) return;
    setIsActive(true);
    setTimeout(() => setIsActive(false), currentIntensity.duration);
  };

  return (
    <div
      className={cn('transition-transform', className)}
      style={{
        transform: isActive && !prefersReducedMotion
          ? `scale(${currentIntensity.scale})`
          : 'scale(1)',
        transitionDuration: `${currentIntensity.duration}ms`,
      }}
      onMouseEnter={trigger === 'hover' ? handleInteraction : undefined}
      onClick={trigger === 'click' ? handleInteraction : undefined}
      onFocus={trigger === 'focus' ? handleInteraction : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  pulse?: boolean;
}

export function NotificationBadge({
  count,
  className,
  maxCount = 99,
  variant = 'primary',
  pulse = true,
  ...props
}: NotificationBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(count);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (count !== prevCountRef.current) {
      if (!prefersReducedMotion) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
      prevCountRef.current = count;
    }
  }, [count, prefersReducedMotion]);

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        'min-w-[20px] h-5 px-2 rounded-full text-xs font-bold',
        variantStyles[variant],
        pulse && count > 0 && !prefersReducedMotion && 'animate-pulse',
        isAnimating && !prefersReducedMotion && 'animate-bounce',
        className,
      )}
      {...props}
    >
      {displayCount}
    </div>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export function ProgressRing({
  progress,
  size = 40,
  strokeWidth = 4,
  className,
  color = 'hsl(130, 13%, 56%)',
  backgroundColor = 'hsl(var(--color-muted) / 0.3)',
  animated = true,
  ...props
}: ProgressRingProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (currentProgress / 100) * circumference;

  useEffect(() => {
    if (animated && !prefersReducedMotion) {
      const timer = setTimeout(() => setCurrentProgress(progress), 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentProgress(progress);
    }
  }, [progress, animated, prefersReducedMotion]);

  return (
    <div className={cn('relative', className)} {...props}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: animated && !prefersReducedMotion ? 'stroke-dashoffset 0.5s ease-out' : 'none',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold">{Math.round(currentProgress)}%</span>
      </div>
    </div>
  );
}

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function FloatingActionButton({
  icon,
  onClick,
  className,
  color = 'hsl(130, 13%, 56%)',
  size = 'md',
  tooltip,
  ...props
}: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  return (
    <div className="relative">
      <button
        className={cn(
          'rounded-full shadow-lg transition-all duration-200',
          'flex items-center justify-center text-white',
          sizeMap[size],
          !prefersReducedMotion && isPressed ? 'scale-95' : !prefersReducedMotion && isHovered ? 'scale-110' : 'scale-100',
          className,
        )}
        style={{ backgroundColor: color }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={onClick}
        {...props}
      >
        {icon}
      </button>
      {tooltip && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2',
            'px-2 py-1 bg-gray-800 text-white text-xs rounded',
            'whitespace-nowrap transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
  pulse?: boolean;
}

export function StatusIndicator({
  status,
  className,
  pulse = true,
  ...props
}: StatusIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} {...props}>
      <div
        className={cn(
          'w-3 h-3 rounded-full',
          statusColors[status],
          pulse && status === 'online' && !prefersReducedMotion && 'animate-pulse',
        )}
      />
      {pulse && status === 'online' && !prefersReducedMotion && (
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
      )}
    </div>
  );
}
