import type { CSSProperties, ReactElement } from 'react';
import { SCENE_SOFT_TEXT, useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';

interface ImageBlockProps {
  alt: string;
  src?: string;
  srcSet?: string;
  sizes?: string;
  /** Intrinsic photo dimensions in px — a reserved ratio reserves layout (CLS), ADR-0009. */
  width?: number;
  height?: number;
  caption?: string;
  className?: string;
}

/**
 * Hairline-framed image with an optional mono caption. Photos are protagonists —
 * no heavy filters. Renders a labelled placeholder until a real src is provided.
 *
 * `width`/`height` map to an inline `aspect-ratio` on the frame: the browser
 * reserves the photo's true proportions before bytes arrive, keeping layout
 * shift ~0 (ADR-0009's floor) when real photos land. While they are absent the
 * placeholder keeps its own 4/3 frame. `srcSet`/`sizes` pass through for
 * responsive delivery (author pre-converts AVIF/WebP variants).
 */
export function ImageBlock({
  alt,
  src,
  srcSet,
  sizes,
  width,
  height,
  caption,
  className,
}: ImageBlockProps): ReactElement {
  const { softTone } = useSceneTone();
  const frameStyle: CSSProperties | undefined =
    width && height ? { aspectRatio: `${width} / ${height}` } : undefined;
  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div
        className="overflow-hidden rounded-[var(--radius-card)] border border-black/10"
        style={frameStyle}
      >
        {src ? (
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-black/5">
            <span
              className={`font-mono text-xs uppercase tracking-widest ${SCENE_SOFT_TEXT[softTone]}`}
            >
              {alt}
            </span>
          </div>
        )}
      </div>
      {caption ? (
        <figcaption
          className={`font-mono text-xs uppercase tracking-widest ${SCENE_SOFT_TEXT[softTone]}`}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
