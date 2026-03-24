import React from 'react';
import Image from 'next/image';
import { Card, CardBody, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/marketing/ui/card';
import { ButtonLink } from '@/components/marketing/ui/button-link';

interface FeatureCardProps {
  title: string;
  excerpt: string;
  eyebrow?: string;
  href?: string;
  image?: string;
}

export function FeatureCard({ title, excerpt, eyebrow, href, image }: FeatureCardProps) {
  return (
    <Card className="flex flex-col h-full">
      {image && (
        <div className="card__image-wrap">
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={image}
              alt={title}
              fill
              className="card__image"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
      )}
      <CardBody>
        <CardHeader>
          {eyebrow && (
            <span className="card__eyebrow">{eyebrow}</span>
          )}
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="card__excerpt">{excerpt}</p>
        </CardContent>
        {href && (
          <CardFooter>
            <ButtonLink href={href} variant="ghost">
              Explore Service
            </ButtonLink>
          </CardFooter>
        )}
      </CardBody>
    </Card>
  );
}
