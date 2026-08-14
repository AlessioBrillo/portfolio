import type { CSSProperties, ReactElement } from 'react';
import { SCENE_SOFT_TEXT, useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';
import type { ImageAsset } from '@/types/domain';

interface ImageBlockProps extends ImageAsset {
  className?: string;
}

/**
 * Hairline-framed image with an optional mono caption. Photos are protagonists —
 * no heavy filters. Renders a labelled placeholder until a real src is provided.
 *
 * The asset contract (`ImageAsset`) carries the intrinsic `width`/`height`: the
 * browser reserves the photo's true proportions before bytes arrive, keeping
 * layout shift ~0 (ADR-0009's floor) when real photos land. While `src` is
 * absent the placeholder keeps its own 4/3 frame instead — a ratio for a photo
 * that does not exist would be lying to the layout.
 *
 * When `sources` (typed AVIF/WebP variants) are given, the image renders inside
 * a `<picture>` so the browser picks the best supported format; otherwise the
 * flat `srcSet`/`sizes` pass through to the `<img>`. `loading="lazy"` applies
 * in both paths — every photo sits below the fold.
 */
export function ImageBlock({
  alt,
  src,
  sources,
  srcSet,
  sizes,
  width,
  height,
  caption,
  className,
}: ImageBlockProps): ReactElement {
  const { softTone } = useSceneTone();
  const frameStyle: CSSProperties | undefined =
    src && width && height ? { aspectRatio: `${width} / ${height}` } : undefined;
  const image = (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      className="block h-full w-full object-cover"
    />
  );
  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div
        className="overflow-hidden rounded-[var(--radius-card)] border border-black/10"
        style={frameStyle}
      >
        {src ? (
          sources && sources.length > 0 ? (
            <picture>
              {sources.map((source) => (
                <source key={source.type} type={source.type} srcSet={source.srcSet} />
              ))}
              {image}
            </picture>
          ) : (
            image
          )
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
