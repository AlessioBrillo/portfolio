import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AltitudeGauge } from '@/components/navigation/AltitudeGauge';

describe('AltitudeGauge', () => {
  it('renders all altitude stops', () => {
    render(<AltitudeGauge />);
    expect(screen.getByText('GROUND')).toBeInTheDocument();
    expect(screen.getByText('CLIMB')).toBeInTheDocument();
    expect(screen.getByText('CRUISE')).toBeInTheDocument();
    expect(screen.getByText('DESCENT')).toBeInTheDocument();
    expect(screen.getByText('NIGHT')).toBeInTheDocument();
  });

  it('renders as a navigation landmark', () => {
    render(<AltitudeGauge />);
    expect(screen.getByRole('navigation', { name: /altitude/i })).toBeInTheDocument();
  });

  it('marks the first stop as current when progress is 0', () => {
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-current', 'true');
  });

  it('renders buttons with smooth-scroll targets', () => {
    render(<AltitudeGauge />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
