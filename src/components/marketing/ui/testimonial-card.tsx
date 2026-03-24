'use client';

import Image from 'next/image';
import clsx from 'clsx';

type TestimonialCardProps = {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  className?: string;
};

export function TestimonialCard({
  quote,
  author,
  role,
  avatarUrl,
  className,
}: TestimonialCardProps) {
  return (
    <article className={clsx('testimonial-card', className)}>
      <div>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={author}
            width={32}
            height={32}
            className="testimonial-card__avatar rounded-full object-cover"
          />
        ) : (
          <div className="testimonial-card__avatar" />
        )}
      </div>
      <p className="testimonial-card__quote">{quote}</p>
      <div className="testimonial-card__meta">
        <div>
          <p className="text-sm font-medium text-text-primary">{author}</p>
          {role ? <p className="text-xs text-text-tertiary">{role}</p> : null}
        </div>
      </div>
    </article>
  );
}
