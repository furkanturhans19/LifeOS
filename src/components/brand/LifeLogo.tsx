'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type LifeLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

/** Brand mark for Life — logo asset + optional wordmark. */
export function LifeLogo({
  size = 40,
  className,
  priority = false,
  showWordmark = false,
  wordmarkClassName,
}: LifeLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/brand/life-logo.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        draggable={false}
        className="rounded-[22%] object-cover select-none"
        aria-hidden
      />
      {showWordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight text-foreground',
            wordmarkClassName
          )}
        >
          Life
        </span>
      )}
    </span>
  );
}
