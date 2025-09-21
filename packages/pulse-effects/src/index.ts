
export type NumericArray = ArrayLike<number>;

export function lowPassFilter(buffer: number[], cutoff: number, sampleRate: number): number[] {
  const rc = 1 / (cutoff * 2 * Math.PI);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  
  const result = [...buffer];
  for (let i = 1; i < result.length; i++) {
    result[i] = result[i - 1] + alpha * (buffer[i] - result[i - 1]);
  }
  return result;
}

export function highPassFilter(buffer: number[], cutoff: number, sampleRate: number): number[] {
  const rc = 1 / (cutoff * 2 * Math.PI);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  
  const result = [...buffer];
  for (let i = 1; i < result.length; i++) {
    result[i] = alpha * (result[i - 1] + buffer[i] - buffer[i - 1]);
  }
  return result;
}

export class BiquadFilter {
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;

  lowpass(frequency: number, sampleRate: number, Q = 0.707) {
    const w = 2 * Math.PI * frequency / sampleRate;
    const cosw = Math.cos(w);
    const sinw = Math.sin(w);
    const alpha = sinw / (2 * Q);

    const b0 = (1 - cosw) / 2;
    const b1 = 1 - cosw;
    const b2 = (1 - cosw) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosw;
    const a2 = 1 - alpha;

    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;
  }

  highpass(frequency: number, sampleRate: number, Q = 0.707) {
    const w = 2 * Math.PI * frequency / sampleRate;
    const cosw = Math.cos(w);
    const sinw = Math.sin(w);
    const alpha = sinw / (2 * Q);

    const b0 = (1 + cosw) / 2;
    const b1 = -(1 + cosw);
    const b2 = (1 + cosw) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosw;
    const a2 = 1 - alpha;

    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;
  }

  process(input: number): number {
    const output = this.b0 * input + this.b1 * this.x1 + this.b2 * this.x2
                  - this.a1 * this.y1 - this.a2 * this.y2;

    this.x2 = this.x1;
    this.x1 = input;
    this.y2 = this.y1;
    this.y1 = output;

    return output;
  }
}

// Fix for backwards compatibility
export const BiQuadFilter = BiquadFilter;

export class Compressor {
  private envelope = 0;
  private attack: number;
  private release: number;

  constructor(
    private threshold = 0.7,
    private ratio = 4,
    attackTime = 0.003,
    releaseTime = 0.1,
    sampleRate = 44100
  ) {
    this.attack = Math.exp(-1 / (attackTime * sampleRate));
    this.release = Math.exp(-1 / (releaseTime * sampleRate));
  }

  process(input: number): number {
    const inputLevel = Math.abs(input);
    const targetEnv = inputLevel > this.envelope ? inputLevel : this.envelope;
    const rate = inputLevel > this.envelope ? this.attack : this.release;
    this.envelope = targetEnv + (this.envelope - targetEnv) * rate;

    let gain = 1;
    if (this.envelope > this.threshold) {
      const excess = this.envelope - this.threshold;
      const compressedExcess = excess / this.ratio;
      gain = (this.threshold + compressedExcess) / this.envelope;
    }

    return input * gain;
  }
}

export function distortion(buffer: number[], amount = 0.5, type: 'soft' | 'hard' | 'tube' = 'soft') {
  for (let i = 0; i < buffer.length; i++) {
    const x = buffer[i] * (1 + amount);
    
    switch (type) {
      case 'soft':
        buffer[i] = Math.tanh(x);
        break;
      case 'hard':
        buffer[i] = Math.max(-1, Math.min(1, x));
        break;
      case 'tube':
        buffer[i] = x < 0 ? -Math.pow(-x, 0.7) : Math.pow(x, 0.7);
        break;
    }
  }
}

export function delay(buffer: number[], delayTime: number, feedback = 0.3, mix = 0.5, sampleRate = 44100) {
  const delayBufferSize = Math.floor(delayTime * sampleRate);
  const delayBuffer = new Array(delayBufferSize).fill(0);
  let writeIndex = 0;

  for (let i = 0; i < buffer.length; i++) {
    const delayed = delayBuffer[writeIndex];
    delayBuffer[writeIndex] = buffer[i] + delayed * feedback;
    buffer[i] = buffer[i] * (1 - mix) + delayed * mix;
    writeIndex = (writeIndex + 1) % delayBufferSize;
  }
}
