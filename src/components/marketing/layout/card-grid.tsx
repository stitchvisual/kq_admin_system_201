import * as React from 'react';
import { cn } from '@/lib/marketing-utils';

type Cols = 1 | 2 | 3 | 4;

const COL_CLASSES: Record<Cols, Record<string, string>> = {
  1: { sm: 'sm:grid-cols-1', md: 'md:grid-cols-1', lg: 'lg:grid-cols-1' },
  2: { sm: 'sm:grid-cols-2', md: 'md:grid-cols-2', lg: 'lg:grid-cols-2' },
  3: { sm: 'sm:grid-cols-3', md: 'md:grid-cols-3', lg: 'lg:grid-cols-3' },
  4: { sm: 'sm:grid-cols-4', md: 'md:grid-cols-4', lg: 'lg:grid-cols-4' },
};

type CardGridProps = {
  children: React.ReactNode;
  className?: string;
  smCols?: Cols;
  mdCols?: Cols;
  lgCols?: Cols;
  gapTight?: boolean;
};

export function CardGrid({
  children,
  className,
  smCols,
  mdCols = 2,
  lgCols = 3,
  gapTight,
}: CardGridProps) {
  const base = 'grid';
  const gap = gapTight ? 'gap-3 sm:gap-4' : 'gap-4 sm:gap-6';
  const baseCols = 'grid-cols-1';
  const sm = smCols ? COL_CLASSES[smCols].sm : '';
  const md = mdCols ? COL_CLASSES[mdCols].md : '';
  const lg = lgCols ? COL_CLASSES[lgCols].lg : '';
  return <div className={cn(base, gap, baseCols, sm, md, lg, className)}>{children}</div>;
}
