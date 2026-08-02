import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AltitudeGauge } from '@/components/navigation/AltitudeGauge';

const mockUseCurrentSection = vi.fn();
const mockUseReducedMotion = vi.fn();
const mockUseAltitudeProfile = vi.fn();
const mockUseScrollProgress = vi.fn();

vi.mock('@/hooks/useCurrentSection', () => ({
  useCurrentSection: (...args: unknown[]) => mockUseCurrentSection(...args),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: (...args: unknown[]) => mockUseReducedMotion(...args),
}));

vi.mock('@/hooks/useAltitudeProfile', () => ({
  useAltitudeProfile: () => mockUseAltitudeProfile(),
}));

vi.mock('@/hooks/useScrollProgress', () => ({
  useScrollProgress: () => mockUseScrollProgress(),
}));

describe('AltitudeGauge', () => {
  beforeEach(() => {
    mockUseAltitudeProfile.mockReturnValue(0);
    mockUseScrollProgress.mockReturnValue(0);
  });

  it('renders all altitude stops', () => {
    mockUseCurrentSection.mockReturnValue(null);
    render(<AltitudeGauge />);
    expect(screen.getByText('GROUND')).toBeInTheDocument();
    expect(screen.getByText('CLIMB')).toBeInTheDocument();
    expect(screen.getByText('CRUISE')).toBeInTheDocument();
    expect(screen.getByText('DESCENT')).toBeInTheDocument();
    expect(screen.getByText('NIGHT')).toBeInTheDocument();
  });

  it('renders as a navigation landmark', () => {
    mockUseCurrentSection.mockReturnValue(null);
    render(<AltitudeGauge />);
    expect(screen.getByRole('navigation', { name: /altitude/i })).toBeInTheDocument();
  });

  it('marks the first stop as current when no section is observed', () => {
    mockUseCurrentSection.mockReturnValue(null);
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-current', 'step');
  });

  it('renders all five buttons', () => {
    mockUseCurrentSection.mockReturnValue(null);
    render(<AltitudeGauge />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('activates GROUND when hero section is current', () => {
    mockUseCurrentSection.mockReturnValue('hero');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-current', 'step');
    expect(buttons[1]).not.toHaveAttribute('aria-current');
  });

  it('activates CLIMB when mosaic section is current', () => {
    mockUseCurrentSection.mockReturnValue('mosaic');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveAttribute('aria-current', 'step');
  });

  it('activates CRUISE when ai-physics section is current', () => {
    mockUseCurrentSection.mockReturnValue('ai-physics');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveAttribute('aria-current', 'step');
  });

  it('activates DESCENT when sky-sport section is current', () => {
    mockUseCurrentSection.mockReturnValue('sky-sport');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[3]).toHaveAttribute('aria-current', 'step');
  });

  it('activates NIGHT when contact section is current', () => {
    mockUseCurrentSection.mockReturnValue('contact');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[4]).toHaveAttribute('aria-current', 'step');
  });

  it('maps sections without a direct stop to the nearest previous stop', () => {
    mockUseCurrentSection.mockReturnValue('who');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-current', 'step');
  });

  it('maps work-school between ai-physics and sky-sport to cruise', () => {
    mockUseCurrentSection.mockReturnValue('work-school');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveAttribute('aria-current', 'step');
  });

  it('maps experiences between descent and night to descent', () => {
    mockUseCurrentSection.mockReturnValue('experiences');
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[3]).toHaveAttribute('aria-current', 'step');
  });

  it('scrolls smoothly to a stop by default', () => {
    mockUseCurrentSection.mockReturnValue(null);
    mockUseReducedMotion.mockReturnValue(false);
    const scrollIntoView = vi.fn();
    const section = { scrollIntoView } as unknown as HTMLElement;
    const spy = vi.spyOn(document, 'getElementById').mockReturnValue(section);
    render(<AltitudeGauge />);
    fireEvent.click(screen.getByRole('button', { name: 'CRUISE' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    spy.mockRestore();
  });

  it('scrolls with native behaviour under reduced motion', () => {
    mockUseCurrentSection.mockReturnValue(null);
    mockUseReducedMotion.mockReturnValue(true);
    const scrollIntoView = vi.fn();
    const section = { scrollIntoView } as unknown as HTMLElement;
    const spy = vi.spyOn(document, 'getElementById').mockReturnValue(section);
    render(<AltitudeGauge />);
    fireEvent.click(screen.getByRole('button', { name: 'NIGHT' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    spy.mockRestore();
  });

  it('fills the altitude track to the current flight position', () => {
    mockUseCurrentSection.mockReturnValue(null);
    mockUseAltitudeProfile.mockReturnValue(0.6);
    render(<AltitudeGauge />);
    expect(screen.getByTestId('gauge-altitude-fill')).toHaveStyle({ height: '60%' });
  });

  it('renders the mobile journey progress bar', () => {
    mockUseCurrentSection.mockReturnValue(null);
    mockUseScrollProgress.mockReturnValue(0.25);
    render(<AltitudeGauge />);
    expect(screen.getByTestId('gauge-progress-fill')).toHaveStyle({ width: '25%' });
  });
});
