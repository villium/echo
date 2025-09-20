
import { describe, it, expect } from 'vitest';
import { rms, peak, normalize, zeroCrossingRate } from './index.js';

describe('Audio Analysis Functions', () => {
  const testBuffer = new Float32Array([-0.5, 0.8, -0.3, 0.6, -0.1]);

  it('should calculate RMS correctly', () => {
    const result = rms(testBuffer);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it('should find peak amplitude', () => {
    const result = peak(testBuffer);
    expect(result).toBeCloseTo(0.8);
  });

  it('should normalize audio buffer', () => {
    const buffer = new Float32Array([...testBuffer]);
    normalize(buffer, 0.5);
    const maxValue = Math.max(...buffer);
    expect(maxValue).toBeCloseTo(0.5, 2);
  });

  it('should calculate zero crossing rate', () => {
    const result = zeroCrossingRate(testBuffer);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe('number');
  });
});
