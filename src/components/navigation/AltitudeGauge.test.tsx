import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AltitudeGauge } from '@/components/navigation/AltitudeGauge';

const mockUseCurrentSection = vi.fn();

vi.mock('@/hooks/useCurrentSection', () => ({
  useCurrentSection: (...args: unknown[]) => mockUseCurrentSection(...args),
}));

describe('AltitudeGauge', () => {
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
});
