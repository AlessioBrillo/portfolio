import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

interface ImageBlockProps {
  alt: string;
  src?: string;
  caption?: string;
  className?: string;
}

/**
 * Hairline-framed image with an optional mono caption. Photos are protagonists —
 * no heavy filters. Renders a labelled placeholder until a real src is provided.
 */
export function ImageBlock({ alt, src, caption, className }: ImageBlockProps): ReactElement {
  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-black/10">
        {src ? (
          <img src={src} alt={alt} loading="lazy" className="block h-full w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-black/5">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-light">
              {alt}
            </span>
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="font-mono text-xs uppercase tracking-widest text-muted-light">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
