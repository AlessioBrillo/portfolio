import { describe, expect, it } from 'vitest';
import { flightPositionAt, resolveGaugeStop, SECTION_ORDER } from '@/lib/altitude';

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

  it('keeps out-of-order anchors on a valid ramp instead of dividing by zero', () => {
    expect(flightPositionAt(0.5, { ground: 0.4, cruise: 0.2, night: 0.6 })).toBeCloseTo(0.25, 5);
  });
});

describe('resolveGaugeStop', () => {
  const TARGETS = SECTION_ORDER.filter((id) =>
    ['hero', 'mosaic', 'ai-physics', 'sky-sport', 'contact'].includes(id),
  );

  it('lights the ground stop before any observation', () => {
    expect(resolveGaugeStop(null, TARGETS, SECTION_ORDER)).toBe(0);
  });

  it('lights the direct stop when the section is a target', () => {
    expect(resolveGaugeStop('sky-sport', TARGETS, SECTION_ORDER)).toBe(3);
  });

  it('walks backward to the nearest previous stop for non-target sections', () => {
    expect(resolveGaugeStop('who', TARGETS, SECTION_ORDER)).toBe(0);
    expect(resolveGaugeStop('work-school', TARGETS, SECTION_ORDER)).toBe(2);
    expect(resolveGaugeStop('experiences', TARGETS, SECTION_ORDER)).toBe(3);
  });

  it('falls back to the ground stop when the first section is not a target', () => {
    expect(resolveGaugeStop('hero', ['mosaic'], SECTION_ORDER)).toBe(0);
  });

  it('falls back to the ground stop when no earlier section is a target', () => {
    expect(resolveGaugeStop('who', ['contact'], SECTION_ORDER)).toBe(0);
  });
});
