
import { NumericArray, rms, onsetDetection } from '../../../src/index.js';

export interface BeatDetectionOptions {
  threshold?: number;
  minBpm?: number;
  maxBpm?: number;
  windowSize?: number;
}

export interface TempoAnalysisResult {
  bpm: number;
  confidence: number;
  beats: number[];
}

export function detectBeats(
  audioData: NumericArray, 
  sampleRate: number, 
  options: BeatDetectionOptions = {}
): number[] {
  const { threshold = 0.3, windowSize = 1024 } = options;
  
  // Simple onset-based beat detection
  const onsets = onsetDetection(audioData, threshold);
  
  // Filter onsets that are too close together (minimum 200ms apart)
  const minInterval = sampleRate * 0.2;
  const beats: number[] = [];
  let lastBeat = -minInterval;
  
  for (const onset of onsets) {
    if (onset - lastBeat >= minInterval) {
      beats.push(onset);
      lastBeat = onset;
    }
  }
  
  return beats;
}

export function analyzeTempo(
  audioData: NumericArray,
  sampleRate: number,
  options: BeatDetectionOptions = {}
): TempoAnalysisResult {
  const { minBpm = 60, maxBpm = 180 } = options;
  const beats = detectBeats(audioData, sampleRate, options);
  
  if (beats.length < 2) {
    return { bpm: 0, confidence: 0, beats };
  }
  
  // Calculate intervals between beats
  const intervals: number[] = [];
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i] - beats[i - 1]);
  }
  
  // Convert to BPM and find most common tempo
  const bpms = intervals.map(interval => 60 * sampleRate / interval);
  const validBpms = bpms.filter(bpm => bpm >= minBpm && bpm <= maxBpm);
  
  if (validBpms.length === 0) {
    return { bpm: 0, confidence: 0, beats };
  }
  
  // Calculate average BPM
  const avgBpm = validBpms.reduce((sum, bpm) => sum + bpm, 0) / validBpms.length;
  
  // Calculate confidence based on consistency
  const variance = validBpms.reduce((sum, bpm) => sum + Math.pow(bpm - avgBpm, 2), 0) / validBpms.length;
  const confidence = Math.max(0, 1 - variance / 1000);
  
  return {
    bpm: Math.round(avgBpm),
    confidence,
    beats
  };
}

export function extractRhythmPattern(
  beats: number[],
  sampleRate: number,
  patternLength = 16
): number[] {
  if (beats.length < 2) return [];
  
  // Calculate average beat interval
  const intervals = beats.slice(1).map((beat, i) => beat - beats[i]);
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  
  // Quantize beats to pattern grid
  const pattern = new Array(patternLength).fill(0);
  const stepSize = avgInterval / (patternLength / 4); // Assume 4/4 time
  
  for (const beat of beats) {
    const step = Math.round((beat % (avgInterval * 4)) / stepSize) % patternLength;
    pattern[step] = 1;
  }
  
  return pattern;
}

export function beatGrid(duration: number, bpm: number, sampleRate: number): number[] {
  const beatInterval = (60 / bpm) * sampleRate;
  const numBeats = Math.floor(duration / beatInterval);
  const beats: number[] = [];
  
  for (let i = 0; i < numBeats; i++) {
    beats.push(i * beatInterval);
  }
  
  return beats;
}

export function rhythmPattern(onsets: number[], gridBeats: number[], tolerance: number): number[] {
  const pattern: number[] = new Array(gridBeats.length).fill(0);
  
  for (let i = 0; i < gridBeats.length; i++) {
    const gridTime = gridBeats[i];
    const closestOnset = onsets.find(onset => 
      Math.abs(onset - gridTime) <= tolerance * gridTime
    );
    
    if (closestOnset !== undefined) {
      pattern[i] = 1;
    }
  }
  
  return pattern;
}

export function swingRatio(onsets: number[], expected: number[]): number {
  if (onsets.length < 2 || expected.length < 2) return 0.5;
  
  let totalDeviation = 0;
  let count = 0;
  
  for (let i = 0; i < Math.min(onsets.length, expected.length); i++) {
    if (i > 0) {
      const actualInterval = onsets[i] - onsets[i - 1];
      const expectedInterval = expected[i] - expected[i - 1];
      
      if (expectedInterval > 0) {
        const ratio = actualInterval / expectedInterval;
        totalDeviation += Math.abs(ratio - 1);
        count++;
      }
    }
  }
  
  if (count === 0) return 0.5;
  return Math.max(0, Math.min(1, 0.5 + (totalDeviation / count) * 0.1));
}

export class TempoTracker {
  private beatHistory: number[] = [];
  private readonly maxHistory = 8;
  
  update(audioData: NumericArray, sampleRate: number): TempoAnalysisResult {
    const analysis = analyzeTempo(audioData, sampleRate);
    
    if (analysis.bpm > 0) {
      this.beatHistory.push(analysis.bpm);
      if (this.beatHistory.length > this.maxHistory) {
        this.beatHistory.shift();
      }
    }
    
    // Return smoothed BPM
    if (this.beatHistory.length > 0) {
      const smoothedBpm = this.beatHistory.reduce((sum, bpm) => sum + bpm, 0) / this.beatHistory.length;
      return {
        ...analysis,
        bpm: Math.round(smoothedBpm)
      };
    }
    
    return analysis;
  }
  
  reset() {
    this.beatHistory = [];
  }
}
