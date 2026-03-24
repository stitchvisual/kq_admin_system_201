'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { TestimonialCard } from './testimonial-card';

type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
};

type TestimonialsCarouselProps = {
  items: Testimonial[];
  className?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;
};

export function TestimonialsCarousel({
  items,
  className,
  autoPlay = true,
  intervalMs = 6000,
  pauseOnHover = true,
}: TestimonialsCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const prefersReducedMotion = useReducedMotion();
  const count = items.length;
  const [isHovering, setIsHovering] = React.useState(false);

  React.useEffect(() => {
    if (!autoPlay || prefersReducedMotion || count <= 1 || isHovering) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, prefersReducedMotion, intervalMs, count, isHovering]);

  function goTo(i: number) {
    const next = ((i % count) + count) % count;
    setIndex(next);
  }

  return (
    <div
      className={clsx('testimonial-carousel', className)}
      onMouseEnter={pauseOnHover ? () => setIsHovering(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsHovering(false) : undefined}
    >
      <div className="testimonial-carousel__viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={`triple-${index}`}
            className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="testimonial-carousel__card">
              <TestimonialCard
                className="testimonial-card--auto w-full"
                quote={items[index].quote}
                author={items[index].author}
                role={items[index].role}
                avatarUrl={items[index].avatarUrl}
              />
            </div>
            <div className="testimonial-carousel__card hidden md:block">
              <TestimonialCard
                className="testimonial-card--auto w-full"
                quote={items[(index + 1) % count].quote}
                author={items[(index + 1) % count].author}
                role={items[(index + 1) % count].role}
                avatarUrl={items[(index + 1) % count].avatarUrl}
              />
            </div>
            <div className="testimonial-carousel__card hidden lg:block">
              <TestimonialCard
                className="testimonial-card--auto w-full"
                quote={items[(index + 2) % count].quote}
                author={items[(index + 2) % count].author}
                role={items[(index + 2) % count].role}
                avatarUrl={items[(index + 2) % count].avatarUrl}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {count > 1 && (
        <div className="testimonial-carousel__controls">
          <button
            type="button"
            aria-label="Previous testimonial"
            className="btn btn-ghost btn-sm"
            onClick={() => goTo(index - 1)}
          >
            Prev
          </button>
          <div className="testimonial-carousel__dots" role="tablist" aria-label="Testimonials pagination">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show testimonial ${i + 1}`}
                className={clsx('testimonial-carousel__dot', i === index && 'is-active')}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next testimonial"
            className="btn btn-ghost btn-sm"
            onClick={() => goTo(index + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
