import { describe, expect, it } from 'vitest';
import { flightPositionAt } from '@/lib/altitude';

const ANCHORS = { ground: 0, cruise: 0.5, night: 1 };

describe('flightPositionAt', () => {
  it('starts at ground level and climbs linearly', () => {
    expect(flightPositionAt(0, ANCHORS)).toBe(0);
    expect(flightPositionAt(0.2, ANCHORS)).toBeCloseTo(0.4, 5);
  });

  it('peaks at cruise', () => {
    expect(flightPositionAt(0.5, ANCHORS)).toBe(1);
  });

  it('descends back to the ground by the night landing', () => {
    expect(flightPositionAt(0.75, ANCHORS)).toBeCloseTo(0.5, 5);
    expect(flightPositionAt(1, ANCHORS)).toBe(0);
  });

  it('stays grounded before takeoff and after landing', () => {
    const late = { ground: 0.1, cruise: 0.5, night: 0.9 };
    expect(flightPositionAt(0.05, late)).toBe(0);
    expect(flightPositionAt(0.95, late)).toBe(0);
  });

  it('degrades gracefully on degenerate anchors', () => {
    expect(flightPositionAt(0.5, { ground: 0.5, cruise: 0.5, night: 1 })).toBe(0);
    expect(flightPositionAt(0.75, { ground: 0, cruise: 0.75, night: 0.75 })).toBe(0);
  });
});
