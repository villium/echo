
import { describe, it, expect } from 'vitest';
import { lowPassFilter, highPassFilter, BiQuadFilter, Compressor, distortion } from './index.js';

describe('Audio Effects', () => {
  const testSignal = new Float32Array([0.5, -0.3, 0.8, -0.2, 0.1]);

  it('should apply low pass filter', () => {
    const result = lowPassFilter([...testSignal], 1000, 44100);
    expect(result).toHaveLength(testSignal.length);
    expect(result.every(val => typeof val === 'number')).toBe(true);
  });

  it('should apply high pass filter', () => {
    const result = highPassFilter([...testSignal], 1000, 44100);
    expect(result).toHaveLength(testSignal.length);
    expect(result.every(val => typeof val === 'number')).toBe(true);
  });

  it('should create and use biquad filter', () => {
    const filter = new BiQuadFilter();
    filter.lowpass(1000, 44100);
    const result = filter.process(0.5);
    expect(typeof result).toBe('number');
  });

  it('should compress audio signal', () => {
    const compressor = new Compressor(0.7, 4, 0.01, 0.1);
    const result = compressor.process(0.8);
    expect(typeof result).toBe('number');
    expect(Math.abs(result)).toBeLessThanOrEqual(1);
  });

  it('should apply distortion', () => {
    const buffer = [...testSignal];
    distortion(buffer, 0.3, 'soft');
    expect(buffer).toHaveLength(testSignal.length);
    expect(buffer.every(val => typeof val === 'number')).toBe(true);
  });
});
