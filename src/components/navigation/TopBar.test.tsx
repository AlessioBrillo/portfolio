import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToneProvider } from '@/components/ascent/ToneProvider';
import { TopBar } from '@/components/navigation/TopBar';

const mockUseCurrentSection = vi.fn();
const mockUseReducedMotion = vi.fn();

vi.mock('@/hooks/useCurrentSection', () => ({
  useCurrentSection: (...args: unknown[]) => mockUseCurrentSection(...args),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: (...args: unknown[]) => mockUseReducedMotion(...args),
}));

function setScrollY(y: number): void {
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: y,
  });
}

function scroll(): void {
  act(() => {
    window.dispatchEvent(new Event('scroll', { cancelable: true }));
    vi.advanceTimersByTime(16);
  });
}

describe('TopBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setScrollY(0);
    mockUseCurrentSection.mockReturnValue(null);
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function headerClass(): string {
    const { container } = render(<TopBar />);
    return container.querySelector('header')!.className;
  }

  it('is visible on mount', () => {
    expect(headerClass()).toContain('translate-y-0');
  });

  it('hides when scrolling down past the threshold', () => {
    const { container } = render(<TopBar />);
    const header = container.querySelector('header')!;

    setScrollY(600);
    scroll();
    expect(header.className).toContain('-translate-y-full');
  });

  it('reveals again when scrolling up', () => {
    const { container } = render(<TopBar />);
    const header = container.querySelector('header')!;

    setScrollY(600);
    scroll();
    expect(header.className).toContain('-translate-y-full');

    setScrollY(200);
    scroll();
    expect(header.className).toContain('translate-y-0');
  });

  it('stays visible under reduced motion regardless of direction', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { container } = render(<TopBar />);
    const header = container.querySelector('header')!;

    setScrollY(600);
    scroll();
    expect(header.className).toContain('translate-y-0');

    setScrollY(200);
    scroll();
    expect(header.className).toContain('translate-y-0');
  });

  it('ignores sub-threshold scroll jitter', () => {
    const { container } = render(<TopBar />);
    const header = container.querySelector('header')!;

    setScrollY(4);
    scroll();
    expect(header.className).toContain('translate-y-0');

    setScrollY(5);
    scroll();
    expect(header.className).toContain('translate-y-0');
  });

  it('renders the name and contact link', () => {
    mockUseCurrentSection.mockReturnValue(null);
    const { getByRole } = render(<TopBar />);
    expect(getByRole('link', { name: 'Alessio Brillo' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('follows the live scene tone on a blend section (ADR-0011)', () => {
    mockUseCurrentSection.mockReturnValue('sky-sport');
    const { container } = render(
      <ToneProvider initialTone="night">
        <TopBar />
      </ToneProvider>,
    );
    const header = container.querySelector('header')!;
    expect(header.className).toContain('bg-night/70');
    expect(header.className).toContain('text-cream');
  });

  it('keeps explicit solid-night sections dark even when the scene reads paper', () => {
    mockUseCurrentSection.mockReturnValue('contact');
    const { container } = render(
      <ToneProvider initialTone="paper">
        <TopBar />
      </ToneProvider>,
    );
    const header = container.querySelector('header')!;
    expect(header.className).toContain('bg-night/70');
    expect(header.className).toContain('text-cream');
  });
});
