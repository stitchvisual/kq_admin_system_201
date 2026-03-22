import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: boolean;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  direction = 'up',
  scale = true,
  hover = true,
  onClick,
  style: customStyle,
  ...props
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translateY(20px)';
        case 'down':
          return 'translateY(-20px)';
        case 'left':
          return 'translateX(20px)';
        case 'right':
          return 'translateX(-20px)';
        default:
          return 'translateY(20px)';
      }
    }
    return 'translate(0)';
  };

  const cardStyle = {
    transform: getTransform() + (scale && !isVisible ? ' scale(0.95)' : ' scale(1)'),
    opacity: isVisible ? 1 : 0,
    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'transition-all duration-300',
        hover && 'hover:transform hover:scale-105 hover:shadow-lg',
        className,
      )}
      style={{ ...cardStyle, ...customStyle }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

interface HoverEffectProps {
  children: React.ReactNode;
  className?: string;
  effect?: 'lift' | 'glow' | 'border' | 'shadow';
  intensity?: 'subtle' | 'normal' | 'strong';
}

export function HoverEffect({
  children,
  className,
  effect = 'lift',
  intensity = 'normal',
  ...props
}: HoverEffectProps) {
  const intensityMap = {
    subtle: { transform: 'translateY(-2px)', shadow: '0 4px 12px rgba(0,0,0,0.08)' },
    normal: { transform: 'translateY(-4px)', shadow: '0 8px 24px rgba(0,0,0,0.12)' },
    strong: { transform: 'translateY(-8px)', shadow: '0 16px 32px rgba(0,0,0,0.16)' },
  };

  const [isHovered, setIsHovered] = useState(false);

  const getStyle = () => {
    if (!isHovered) return {};

    switch (effect) {
      case 'lift':
        return {
          transform: intensityMap[intensity].transform,
          boxShadow: intensityMap[intensity].shadow,
        };
      case 'glow':
        return {
          filter: 'brightness(1.1)',
          boxShadow: '0 0 20px rgba(130, 13%, 56%, 0.3)',
        };
      case 'border':
        return {
          borderColor: 'hsl(130, 13%, 56%)',
          borderWidth: '2px',
        };
      case 'shadow':
        return {
          boxShadow: intensityMap[intensity].shadow,
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={cn('transition-all duration-300', className)}
      style={getStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

export function RippleEffect({
  children,
  className,
  color = 'hsl(130, 13%, 56%, 0.3)',
  duration = 600,
  ...props
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLDivElement>(null);

  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, duration);
  };

  return (
    <div
      ref={buttonRef}
      className={cn('relative overflow-hidden', className)}
      onClick={createRipple}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
            animation: `ripple ${duration}ms ease-out`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

interface MagneticCursorProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}

export function MagneticCursor({
  children,
  className,
  strength = 0.3,
  radius = 100,
  ...props
}: MagneticCursorProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < radius) {
        const force = (1 - distance / radius) * strength;
        setPosition({
          x: deltaX * force,
          y: deltaY * force,
        });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, radius]);

  return (
    <div
      ref={elementRef}
      className={cn('transition-transform duration-100', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
}

export function ParallaxCard({
  children,
  className,
  speed = 0.5,
  direction = 'vertical',
  ...props
}: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementY = rect.top + scrollY;
      const centerY = window.innerHeight / 2;
      const relativeY = (rect.top - centerY) / centerY;

      if (direction === 'vertical') {
        setTransform({
          x: 0,
          y: relativeY * speed * 50,
        });
      } else {
        setTransform({
          x: relativeY * speed * 50,
          y: 0,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <div
      ref={cardRef}
      className={cn('transition-transform duration-300 ease-out', className)}
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
