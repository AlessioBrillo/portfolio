import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImageBlock } from '@/components/ui/ImageBlock';

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

  it('renders caption when provided', () => {
    render(<ImageBlock alt="Photo" caption="A nice view" />);
    expect(screen.getByText('A nice view')).toBeInTheDocument();
  });

  it('does not render caption when omitted', () => {
    const { container } = render(<ImageBlock alt="Photo" />);
    expect(container.querySelector('figcaption')).not.toBeInTheDocument();
  });
});
