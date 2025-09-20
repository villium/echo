
# @villium/echo-chamber

Real-time audio visualization components for waveforms, spectrograms and audio analysis displays.

## Features

- **Waveform Visualization** - Real-time audio waveform rendering
- **Spectrogram Display** - Frequency domain visualization over time
- **Audio Meter** - Level and peak indicators
- **Frequency Analyzer** - Real-time spectrum analysis

## Installation

```bash
npm install @villium/echo-chamber
```

## Usage

```ts
import { WaveformVisualizer, SpectrogramDisplay } from '@villium/echo-chamber';

// Create waveform visualization
const waveform = new WaveformVisualizer(canvas, {
  color: '#00ff00',
  lineWidth: 2
});

// Render audio data
waveform.render(audioBuffer);

// Display spectrogram
const spectrogram = new SpectrogramDisplay(canvas, {
  fftSize: 2048,
  colorMap: 'viridis'
});

spectrogram.update(frequencyData);
```

## License

MIT
