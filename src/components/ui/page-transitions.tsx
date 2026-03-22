import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale' | 'flip';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function PageTransition({ 
  children, 
  duration = 300, 
  type = 'fade',
  direction = 'up',
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, duration / 2);

    return () => clearTimeout(timer);
  }, [pathname, children, duration]);

  const getTransitionStyle = () => {
    if (!isTransitioning) return {};

    const baseStyle = {
      transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      opacity: isTransitioning ? 0 : 1,
    };

    switch (type) {
      case 'fade':
        return baseStyle;
      case 'slide':
        const slideDistance = isTransitioning ? '20px' : '0';
        const slideDirection = direction === 'up' ? '-1' : direction === 'down' ? '1' : '0';
        const transform = direction === 'left' || direction === 'right' 
          ? `translateX(${direction === 'left' ? slideDistance : '-' + slideDistance})`
          : `translateY(${slideDirection === '-1' ? slideDistance : '-' + slideDistance})`;
        
        return {
          ...baseStyle,
          transform: isTransitioning ? transform : 'translate(0)',
        };
      case 'scale':
        return {
          ...baseStyle,
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
        };
      case 'flip':
        return {
          ...baseStyle,
          transform: isTransitioning ? 'rotateY(90deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={getTransitionStyle()}>
      {displayChildren}
    </div>
  );
}

interface SmoothRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'rotate';
}

export function SmoothReveal({ 
  children, 
  delay = 0, 
  duration = 600, 
  threshold = 0.1,
  className,
  animation = 'fade-up',
}: SmoothRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setTimeout(() => {
            setIsVisible(true);
            setHasBeenVisible(true);
          }, delay);
        }
      },
      { threshold }
    );

    const element = document.getElementById(`reveal-${delay}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay, threshold, hasBeenVisible]);

  const getAnimationStyle = () => {
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return { opacity: 0, transform: 'translateY(30px)' };
        case 'fade-down':
          return { opacity: 0, transform: 'translateY(-30px)' };
        case 'fade-left':
          return { opacity: 0, transform: 'translateX(30px)' };
        case 'fade-right':
          return { opacity: 0, transform: 'translateX(-30px)' };
        case 'scale':
          return { opacity: 0, transform: 'scale(0.9)' };
        case 'rotate':
          return { opacity: 0, transform: 'rotateY(15deg)' };
        default:
          return { opacity: 0 };
      }
    }

    return {
      opacity: 1,
      transform: 'none',
    };
  };

  return (
    <div
      id={`reveal-${delay}`}
      className={className}
      style={{
        ...getAnimationStyle(),
        transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
  duration?: number;
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({ 
  children, 
  delay = 100, 
  duration = 400,
  className,
  itemClassName,
}: StaggeredListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={itemClassName}
          style={{
            animation: `fadeInUp ${duration}ms ease-out ${index * delay}ms both`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface MorphingButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'expand' | 'shrink' | 'rotate' | 'morph';
  duration?: number;
}

export function MorphingButton({ 
  children, 
  onClick, 
  className, 
  variant = 'expand',
  duration = 300,
  ...props 
}: MorphingButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClick();
    }, duration);
  };

  const getMorphStyle = () => {
    if (!isAnimating) return {};

    switch (variant) {
      case 'expand':
        return { transform: 'scale(1.1)', filter: 'brightness(1.1)' };
      case 'shrink':
        return { transform: 'scale(0.95)', filter: 'brightness(0.9)' };
      case 'rotate':
        return { transform: 'rotate(360deg)' };
      case 'morph':
        return { borderRadius: '50%', transform: 'scale(0.8)' };
      default:
        return {};
    }
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      style={{
        ...getMorphStyle(),
        transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
      {...props}
    >
      {children}
    </button>
  );
}