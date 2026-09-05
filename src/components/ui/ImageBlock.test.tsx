import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { ToneProvider } from '@/components/ascent/ToneProvider';

describe('ImageBlock', () => {
  it('renders placeholder text when no src', () => {
    render(<ImageBlock alt="Placeholder image" />);
    expect(screen.getByText('Placeholder image')).toBeInTheDocument();
  });

  it('renders an img element when src is provided', () => {
    render(<ImageBlock alt="Photo" src="/photo.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Photo');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('passes srcSet and sizes through to the img', () => {
    render(
      <ImageBlock
        alt="Photo"
        src="/photo.jpg"
        srcSet="/photo.avif 1x, /photo@2x.avif 2x"
        sizes="(min-width: 768px) 50vw, 100vw"
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('srcset', '/photo.avif 1x, /photo@2x.avif 2x');
    expect(img).toHaveAttribute('sizes', '(min-width: 768px) 50vw, 100vw');
  });

  it('reserves the intrinsic ratio on the frame when width and height are given', () => {
    const { container } = render(
      <ImageBlock alt="Photo" src="/photo.jpg" width={1200} height={750} />,
    );
    expect(container.querySelector('figure > div')).toHaveStyle('aspect-ratio: 1200 / 750');
  });

  it('does not reserve a ratio when width or height is missing', () => {
    const { container } = render(<ImageBlock alt="Photo" src="/photo.jpg" width={1200} />);
    expect(container.querySelector('figure > div')).not.toHaveStyle('aspect-ratio: 1200 / 1');
  });

  it('keeps the placeholder frame when src is absent even with intrinsic dimensions', () => {
    const { container } = render(<ImageBlock alt="Photo" width={1200} height={1500} />);
    expect(screen.getByText('Photo')).toBeInTheDocument();
    expect(container.querySelector('figure > div')).not.toHaveStyle('aspect-ratio: 1200 / 1500');
  });

  it('renders typed picture sources before the fallback img when given', () => {
    const { container } = render(
      <ImageBlock
        alt="Photo"
        src="/photo-1600.jpg"
        sources={[
          {
            type: 'image/avif',
            srcSet: '/photo-480.avif 480w, /photo-960.avif 960w, /photo-1600.avif 1600w',
          },
          {
            type: 'image/webp',
            srcSet: '/photo-480.webp 480w, /photo-960.webp 960w, /photo-1600.webp 1600w',
          },
        ]}
        sizes="(min-width: 1024px) 40vw, 100vw"
      />,
    );
    const sources = container.querySelectorAll('picture source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('type', 'image/avif');
    expect(sources[1]).toHaveAttribute('type', 'image/webp');
    expect(screen.getByRole('img')).toHaveAttribute('src', '/photo-1600.jpg');
    expect(screen.getByRole('img')).toHaveAttribute('sizes', '(min-width: 1024px) 40vw, 100vw');
  });

  it('renders caption when provided', () => {
    render(<ImageBlock alt="Photo" caption="A nice view" />);
    expect(screen.getByText('A nice view')).toBeInTheDocument();
  });

  it('does not render caption when omitted', () => {
    const { container } = render(<ImageBlock alt="Photo" />);
    expect(container.querySelector('figcaption')).not.toBeInTheDocument();
  });

  it('uses the night muted tone for captions when the scene is on night', () => {
    render(
      <ToneProvider initialTone="night">
        <ImageBlock alt="Photo" caption="A night view" />
      </ToneProvider>,
    );
    expect(screen.getByText('A night view')).toHaveClass('text-phosphor-dim');
  });

  it('shows the image with full opacity after onLoad fires', () => {
    render(<ImageBlock alt="Photo" src="/photo.jpg" />);
    const img = screen.getByRole('img');
    // Initially opacity is 0 (image not loaded)
    expect(img).toHaveClass('opacity-0');
    // Fire onLoad
    fireEvent.load(img);
    // After load, opacity should be 100
    expect(img).toHaveClass('opacity-100');
  });
});
