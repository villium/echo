
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WaveformVisualizer, SpectrogramDisplay, AudioMeter } from './index';

// Mock canvas and context
const mockCanvas = {
  width: 800,
  height: 400,
  getContext: vi.fn()
} as unknown as HTMLCanvasElement;

const mockContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(800 * 400 * 4)
  })),
  drawImage: vi.fn()
} as unknown as CanvasRenderingContext2D;

beforeEach(() => {
  vi.clearAllMocks();
  (mockCanvas.getContext as any).mockReturnValue(mockContext);
});

describe('WaveformVisualizer', () => {
  it('should create a waveform visualizer', () => {
    const visualizer = new WaveformVisualizer(mockCanvas);
    expect(visualizer).toBeDefined();
  });

  it('should render audio buffer', () => {
    const visualizer = new WaveformVisualizer(mockCanvas);
    const audioBuffer = new Float32Array([0.1, 0.5, -0.3, 0.8]);
    
    visualizer.render(audioBuffer);
    
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });
});

describe('SpectrogramDisplay', () => {
  it('should create a spectrogram display', () => {
    const display = new SpectrogramDisplay(mockCanvas);
    expect(display).toBeDefined();
  });

  it('should update with frequency data', () => {
    const display = new SpectrogramDisplay(mockCanvas);
    const frequencyData = new Uint8Array([50, 100, 150, 200]);
    
    display.update(frequencyData);
    
    expect(mockContext.drawImage).toHaveBeenCalled();
  });
});

describe('AudioMeter', () => {
  it('should create an audio meter', () => {
    const meter = new AudioMeter(mockCanvas);
    expect(meter).toBeDefined();
  });

  it('should update meter level', () => {
    const meter = new AudioMeter(mockCanvas);
    
    meter.update(0.7, 0.9);
    
    expect(mockContext.fillRect).toHaveBeenCalled();
  });
});
