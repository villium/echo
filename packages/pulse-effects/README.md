
# @villium/echo-fx

Real-time audio effects processing library for filters, delays, distortion and more.

## Features

- **BiQuad Filters** - Lowpass and highpass filtering with configurable frequency and Q
- **Delay Effects** - Echo and delay with feedback control
- **Compressor** - Dynamic range compression with attack/release

## Installation

```bash
npm install @villium/echo-fx
```

## Usage

```ts
import { BiQuadFilter, DelayEffect, Compressor } from '@villium/echo-fx';

// Create a lowpass filter
const filter = new BiQuadFilter();
filter.lowpass(1000, 44100, 0.707);

// Process audio samples
const filtered = filter.process(audioSample);

// Add delay effect
const delay = new DelayEffect(0.25, 44100, 0.3, 0.4);
const delayed = delay.process(audioSample);

// Compress dynamic range
const compressor = new Compressor(0.7, 4, 0.003, 0.1, 44100);
const compressed = compressor.process(audioSample);
```

## License

MIT
