// Waveform Visualization
export class WaveformVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: WaveformOptions;

  constructor(canvas: HTMLCanvasElement, options: Partial<WaveformOptions> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context from canvas');
    this.ctx = ctx;

    this.options = {
      color: '#00ff00',
      lineWidth: 2,
      backgroundColor: '#000000',
      ...options
    };
  }

  render(audioBuffer: Float32Array | number[]): void {
    const { width, height } = this.canvas;
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.strokeStyle = this.options.color;
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.beginPath();

    const step = audioBuffer.length / width;
    const centerY = height / 2;

    for (let x = 0; x < width; x++) {
      const index = Math.floor(x * step);
      const y = centerY + (audioBuffer[index] || 0) * centerY;

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }
}

// Spectrogram Display
export class SpectrogramDisplay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: SpectrogramOptions;
  private imageData: ImageData;

  constructor(canvas: HTMLCanvasElement, options: Partial<SpectrogramOptions> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context from canvas');
    this.ctx = ctx;

    this.options = {
      fftSize: 2048,
      colorMap: 'viridis',
      minDb: -100,
      maxDb: 0,
      ...options
    };

    this.imageData = this.ctx.createImageData(canvas.width, canvas.height);
  }

  update(frequencyData: Uint8Array): void {
    // Shift existing data left
    const { width, height } = this.canvas;
    this.ctx.drawImage(this.canvas, -1, 0);

    // Draw new column
    for (let y = 0; y < height; y++) {
      const freqIndex = Math.floor((y / height) * frequencyData.length);
      const value = frequencyData[freqIndex] / 255;
      const color = this.getColor(value);

      this.ctx.fillStyle = color;
      this.ctx.fillRect(width - 1, height - y - 1, 1, 1);
    }
  }

  private getColor(value: number): string {
    // Simple viridis-like color mapping
    const r = Math.floor(255 * Math.pow(value, 0.5));
    const g = Math.floor(255 * value);
    const b = Math.floor(255 * Math.pow(value, 2));
    return `rgb(${r},${g},${b})`;
  }
}

// Audio Meter
export class AudioMeter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: MeterOptions;

  constructor(canvas: HTMLCanvasElement, options: Partial<MeterOptions> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context from canvas');
    this.ctx = ctx;

    this.options = {
      orientation: 'vertical',
      peakHold: true,
      backgroundColor: '#000000',
      meterColor: '#00ff00',
      peakColor: '#ff0000',
      ...options
    };
  }

  update(level: number, peak?: number): void {
    const { width, height } = this.canvas;
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    if (this.options.orientation === 'vertical') {
      const meterHeight = height * level;
      this.ctx.fillStyle = this.options.meterColor;
      this.ctx.fillRect(0, height - meterHeight, width, meterHeight);

      if (peak !== undefined && this.options.peakHold) {
        const peakY = height - (height * peak);
        this.ctx.fillStyle = this.options.peakColor;
        this.ctx.fillRect(0, peakY, width, 2);
      }
    } else {
      const meterWidth = width * level;
      this.ctx.fillStyle = this.options.meterColor;
      this.ctx.fillRect(0, 0, meterWidth, height);

      if (peak !== undefined && this.options.peakHold) {
        const peakX = width * peak;
        this.ctx.fillStyle = this.options.peakColor;
        this.ctx.fillRect(peakX, 0, 2, height);
      }
    }
  }
}

// Type definitions
export interface WaveformOptions {
  color: string;
  lineWidth: number;
  backgroundColor: string;
}

export interface SpectrogramOptions {
  fftSize: number;
  colorMap: 'viridis' | 'plasma' | 'magma';
  minDb: number;
  maxDb: number;
}

export interface MeterOptions {
  orientation: 'vertical' | 'horizontal';
  peakHold: boolean;
  backgroundColor: string;
  meterColor: string;
  peakColor: string;
}