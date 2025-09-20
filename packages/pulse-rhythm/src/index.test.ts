
import { describe, it, expect } from 'vitest';
import { beatGrid, rhythmPattern, swingRatio } from './index.js';

describe('Beat Detection Functions', () => {
  it('should generate beat grid', () => {
    const beats = beatGrid(44100, 120, 44100); // 1 second at 120 BPM
    expect(beats).toHaveLength(2); // Should have 2 beats in 1 second at 120 BPM
    expect(beats[0]).toBe(0);
  });

  it('should create rhythm pattern', () => {
    const onsets = [0, 22050, 44100]; // Onsets at 0, 0.5s, 1s
    const gridBeats = [0, 22050, 44100];
    const pattern = rhythmPattern(onsets, gridBeats, 0.05);
    expect(pattern).toEqual([1, 1, 1]);
  });

  it('should calculate swing ratio', () => {
    const onsets = [0, 11025, 22050, 33075]; // Perfect 8th notes
    const expected = [0, 11025, 22050, 33075];
    const ratio = swingRatio(onsets, expected);
    expect(ratio).toBeCloseTo(0.5, 1);
  });
});
