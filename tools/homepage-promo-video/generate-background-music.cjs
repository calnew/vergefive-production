const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, 'assets', 'promo-background.wav');
const sampleRate = 44100;
const duration = 94;
const channels = 2;
const totalSamples = sampleRate * duration;
const bpm = 92;
const beat = 60 / bpm;

function sine(t, hz) {
  return Math.sin(2 * Math.PI * hz * t);
}

function tri(t, hz) {
  return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * hz * t));
}

function decay(x, length) {
  if (x < 0 || x > length) return 0;
  return Math.pow(1 - x / length, 2.4);
}

function softClip(v) {
  return Math.tanh(v * 1.4) / 1.4;
}

function globalEnvelope(t) {
  const fadeIn = Math.min(1, t / 3.5);
  const fadeOut = Math.min(1, (duration - t) / 5);
  return Math.max(0, Math.min(fadeIn, fadeOut, 1));
}

const progression = [
  { root: 146.83, chord: [146.83, 220.00, 293.66, 369.99] }, // Dm-ish
  { root: 130.81, chord: [130.81, 196.00, 261.63, 329.63] }, // C
  { root: 164.81, chord: [164.81, 246.94, 329.63, 392.00] }, // Em-ish
  { root: 110.00, chord: [110.00, 164.81, 220.00, 293.66] }  // A-ish
];
const melody = [293.66, 329.63, 392.00, 369.99, 329.63, 293.66, 246.94, 293.66];

const data = Buffer.alloc(totalSamples * channels * 2);
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  const beatPos = t / beat;
  const step = Math.floor(beatPos * 2); // eighth notes
  const bar = Math.floor(beatPos / 4);
  const chord = progression[Math.floor(bar / 2) % progression.length];
  const eighthPhase = t - Math.floor(beatPos * 2) * (beat / 2);
  const quarterPhase = t - Math.floor(beatPos) * beat;
  const barPhase = t - Math.floor(beatPos / 4) * beat * 4;

  let v = 0;

  // Warm pad keeps continuity but stays low enough not to hum over the voice.
  chord.chord.forEach((hz, index) => {
    v += sine(t, hz / 2) * (0.018 - index * 0.002);
  });

  // Short chord plucks create the actual music feel.
  const pluckEnv = decay(eighthPhase, 0.28);
  if (step % 2 === 0 || step % 8 === 3) {
    chord.chord.forEach((hz, index) => {
      v += tri(t, hz * (index === 3 ? 1 : 0.5)) * pluckEnv * (0.055 - index * 0.007);
    });
  }

  // Subtle bass pulse on downbeats.
  const bassEnv = decay(quarterPhase, 0.38);
  if (Math.floor(beatPos) % 2 === 0) {
    v += sine(t, chord.root / 2) * bassEnv * 0.095;
  }

  // Light kick/snare/hat so it reads as music, not a drone.
  const beatIndex = Math.floor(beatPos) % 4;
  if (beatIndex === 0) v += sine(t, 58) * decay(quarterPhase, 0.16) * 0.12;
  if (beatIndex === 2) v += (Math.random() * 2 - 1) * decay(quarterPhase, 0.12) * 0.028;
  v += (Math.random() * 2 - 1) * decay(eighthPhase, 0.04) * 0.012;

  // Small optimistic melody every other bar.
  if (bar % 4 === 1 || bar % 4 === 3) {
    const note = melody[step % melody.length];
    v += sine(t, note * 2) * decay(eighthPhase, 0.18) * 0.032;
  }

  // Tiny stereo shimmer, different on each side.
  const env = globalEnvelope(t);
  const left = softClip(v * env);
  const right = softClip((v * 0.92 + sine(t, chord.chord[2] * 1.5) * decay(barPhase, 1.2) * 0.01) * env);

  data.writeInt16LE(Math.round(left * 32767), i * 4);
  data.writeInt16LE(Math.round(right * 32767), i * 4 + 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * channels * 2, 28);
header.writeUInt16LE(channels * 2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

fs.writeFileSync(out, Buffer.concat([header, data]));
console.log(out);