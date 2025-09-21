
# @villium/echo-beat

Beat detection, tempo analysis and rhythm pattern recognition for audio processing.

## Features

- **Tempo Detection** - BPM estimation from audio data
- **Beat Grid** - Generate beat positions at specified tempo
- **Rhythm Patterns** - Map onsets to rhythmic grids
- **Swing Analysis** - Detect swing ratio in timing
- **Beat Tracking** - Real-time beat following

## Installation

```bash
npm install @villium/echo-beat
```

## Usage

```ts
import { detectTempo, beatGrid, rhythmPattern } from '@villium/echo-beat';

// Detect tempo from audio
const tempoInfo = detectTempo(audioBuffer, 44100);
console.log(`BPM: ${tempoInfo.bpm}, Confidence: ${tempoInfo.confidence}`);

// Generate beat grid
const beats = beatGrid(audioBuffer.length, 120, 44100);

// Create rhythm pattern from onsets
const pattern = rhythmPattern(tempoInfo.beats, beats, 0.05);
```

## License

MIT
