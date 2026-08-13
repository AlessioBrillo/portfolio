import { render, screen } from '@testing-library/react';
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
    render(<ImageBlock alt="Photo" width={1200} height={750} />);
    expect(screen.getByText('Photo')).toBeInTheDocument();
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
    expect(screen.getByText('A night view')).toHaveClass('text-muted-dark');
  });
});
