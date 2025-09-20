
# @villium/echo

[![npm version](https://badge.fury.io/js/%40villium%2Fecho.svg)](https://badge.fury.io/js/%40villium%2Fecho)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Comprehensive audio feature extraction library for signal analysis, visualization, and processing.

## 🚀 Features

### Core Audio Analysis
- **RMS** (Root Mean Square) - Signal power/volume measurement
- **Peak Amplitude** - Maximum signal level detection
- **Zero Crossing Rate** - Signal complexity analysis
- **Spectral Centroid** - Frequency "brightness" calculation
- **Audio Normalization** - Dynamic range optimization

### Advanced Signal Processing
- **Fundamental Frequency** - Pitch detection via autocorrelation
- **Spectral Rolloff** - High-frequency content measurement  
- **Spectral Flatness** - Noise vs. tonal content analysis
- **MFCC** - Mel-frequency cepstral coefficients
- **Envelope Extraction** - Amplitude envelope tracking
- **Onset Detection** - Note/event timing identification

## 📦 Installation

```bash
npm install @villium/echo
```

## 🔌 Plugin Ecosystem

- **[@villium/echo-beat](./packages/pulse-rhythm/)** - Beat detection & tempo analysis
- **[@villium/echo-fx](./packages/pulse-effects/)** - Real-time audio effects 
- **[@villium/echo-chamber](./packages/pulse-viz/)** - Audio visualization components

## 📚 Quick Start

```typescript
import { 
  rms, peak, normalize, 
  fundamentalFrequency, mfcc, 
  onsetDetection 
} from '@villium/echo';

// Basic signal analysis
const audioBuffer = new Float32Array([/* your audio data */]);
const volume = rms(audioBuffer);
const maxAmplitude = peak(audioBuffer);

// Advanced feature extraction  
const pitch = fundamentalFrequency(audioBuffer, 44100);
const coefficients = mfcc(magnitudeSpectrum, 44100);
const noteOnsets = onsetDetection(audioBuffer);

// Audio processing
normalize(audioBuffer, 0.8); // Normalize to 80% of full scale
```

## 🎯 Use Cases

- **Music Analysis** - Genre classification, mood detection
- **Audio Visualization** - Real-time waveforms and spectrograms
- **Machine Learning** - Feature extraction for audio ML models  
- **Sound Design** - Audio effect processing and analysis
- **Research** - Academic audio signal processing

## 📖 Documentation

Visit our [documentation](https://github.com/villium/echo#readme) for detailed API references and examples.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Villium](https://github.com/villium)
