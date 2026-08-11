import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Email me</Button>);
    expect(screen.getByRole('button', { name: 'Email me' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('keeps an explicit type', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled attribute is set', () => {
    render(<Button disabled>Locked</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('carries the sole orange surface (never diluted)', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-orange');
    expect(screen.getByRole('button')).toHaveClass('text-ink');
  });

  it('merges a custom className', () => {
    render(<Button className="mt-4">CTA</Button>);
    expect(screen.getByRole('button')).toHaveClass('mt-4');
  });

  it('passes through extra attributes', () => {
    render(<Button aria-label="Custom label">x</Button>);
    expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
  });
});
