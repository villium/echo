export type NumericArray = ArrayLike<number>;

function toArray(a: NumericArray): number[] {
  return Array.prototype.slice.call(a as any);
}
export function rms(b: NumericArray) {
  const a = toArray(b);
  return Math.sqrt(a.reduce((s, x) => s + x * x, 0) / (a.length || 1));
}
export function peak(b: NumericArray) {
  const a = toArray(b);
  let m = 0;
  for (let i = 0; i < a.length; i++) {
    const v = Math.abs(a[i]);
    if (v > m) m = v;
  }
  return m;
}
export function zeroCrossingRate(b: NumericArray) {
  const a = toArray(b);
  if (a.length <= 1) return 0;
  let z = 0;
  for (let i = 1; i < a.length; i++) {
    if ((a[i - 1] >= 0 && a[i] < 0) || (a[i - 1] < 0 && a[i] >= 0)) z++;
  }
  return z / (a.length - 1);
}
export function spectralCentroid(mags: NumericArray, fs: number) {
  const a = toArray(mags);
  const n = a.length;
  if (!n) return 0;
  const hz = fs / (2 * n);
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += i * hz * a[i];
    den += a[i];
  }
  return den === 0 ? 0 : num / den;
}
export function normalize(buf: number[] | Float32Array, target = 1) {
  const p = peak(buf);
  if (p === 0) return 1;
  const s = target / p;
  for (let i = 0; i < buf.length; i++) buf[i] *= s;
  return s;
}

export function autocorrelation(b: NumericArray, maxLag?: number) {
  const a = toArray(b);
  const n = a.length;
  const lag = Math.min(maxLag || Math.floor(n / 2), n - 1);
  const result: number[] = [];
  
  for (let i = 0; i <= lag; i++) {
    let sum = 0;
    for (let j = 0; j < n - i; j++) {
      sum += a[j] * a[j + i];
    }
    result.push(sum / (n - i));
  }
  return result;
}

export function fundamentalFrequency(b: NumericArray, sampleRate: number, minFreq = 80, maxFreq = 800) {
  const corr = autocorrelation(b);
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);
  
  let maxCorr = 0;
  let bestPeriod = 0;
  
  for (let period = minPeriod; period <= maxPeriod && period < corr.length; period++) {
    if (corr[period] > maxCorr) {
      maxCorr = corr[period];
      bestPeriod = period;
    }
  }
  
  return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
}

export function spectralRolloff(mags: NumericArray, fs: number, threshold = 0.85) {
  const a = toArray(mags);
  const totalEnergy = a.reduce((sum, mag) => sum + mag, 0);
  const targetEnergy = totalEnergy * threshold;
  
  let cumulativeEnergy = 0;
  for (let i = 0; i < a.length; i++) {
    cumulativeEnergy += a[i];
    if (cumulativeEnergy >= targetEnergy) {
      return (i * fs) / (2 * a.length);
    }
  }
  return (fs / 2);
}

export function spectralFlatness(mags: NumericArray) {
  const a = toArray(mags);
  if (a.length === 0) return 0;
  
  let geometricMean = 1;
  let arithmeticMean = 0;
  let validCount = 0;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] > 0) {
      geometricMean *= Math.pow(a[i], 1 / a.length);
      arithmeticMean += a[i];
      validCount++;
    }
  }
  
  if (validCount === 0) return 0;
  arithmeticMean /= a.length;
  
  return arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;
}

export function mfcc(mags: NumericArray, fs: number, numCoeffs = 13, numFilters = 26) {
  const a = toArray(mags);
  const melFilters = createMelFilterBank(a.length, fs, numFilters);
  const filterOutputs: number[] = [];
  
  for (let i = 0; i < numFilters; i++) {
    let sum = 0;
    for (let j = 0; j < a.length; j++) {
      sum += a[j] * melFilters[i][j];
    }
    filterOutputs.push(Math.log(Math.max(sum, 1e-10)));
  }
  
  return dct(filterOutputs).slice(0, numCoeffs);
}

function createMelFilterBank(fftSize: number, fs: number, numFilters: number): number[][] {
  const melMin = hzToMel(0);
  const melMax = hzToMel(fs / 2);
  const melPoints = Array.from({ length: numFilters + 2 }, (_, i) => 
    melMin + (i * (melMax - melMin)) / (numFilters + 1)
  );
  const hzPoints = melPoints.map(melToHz);
  const binPoints = hzPoints.map(hz => Math.floor((fftSize + 1) * hz / fs));
  
  const filters: number[][] = [];
  for (let i = 1; i <= numFilters; i++) {
    const filter = new Array(fftSize).fill(0);
    const left = binPoints[i - 1];
    const center = binPoints[i];
    const right = binPoints[i + 1];
    
    for (let j = left; j < center; j++) {
      filter[j] = (j - left) / (center - left);
    }
    for (let j = center; j < right; j++) {
      filter[j] = (right - j) / (right - center);
    }
    filters.push(filter);
  }
  return filters;
}

function hzToMel(hz: number): number {
  return 2595 * Math.log10(1 + hz / 700);
}

function melToHz(mel: number): number {
  return 700 * (Math.pow(10, mel / 2595) - 1);
}

function dct(input: number[]): number[] {
  const n = input.length;
  const output: number[] = [];
  
  for (let k = 0; k < n; k++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += input[i] * Math.cos((Math.PI * k * (2 * i + 1)) / (2 * n));
    }
    output.push(sum);
  }
  return output;
}

export function envelope(b: NumericArray, windowSize = 1024) {
  const a = toArray(b);
  const result: number[] = [];
  
  for (let i = 0; i < a.length; i += windowSize) {
    const window = a.slice(i, Math.min(i + windowSize, a.length));
    result.push(rms(window));
  }
  return result;
}

export function onsetDetection(b: NumericArray, threshold = 0.1) {
  const env = envelope(b, 512);
  const onsets: number[] = [];
  
  for (let i = 1; i < env.length - 1; i++) {
    const diff = env[i] - env[i - 1];
    const nextDiff = env[i + 1] - env[i];
    
    if (diff > threshold && nextDiff < diff * 0.5) {
      onsets.push(i * 512);
    }
  }
  return onsets;
}
