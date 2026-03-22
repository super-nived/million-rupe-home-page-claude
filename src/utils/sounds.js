// Web Audio API sound effects — no external files, instant playback
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function osc(type, freq, start, dur, vol = 0.15) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.connect(g).connect(c.destination);
  o.start(start);
  o.stop(start + dur);
}

function noise(start, dur, vol = 0.08) {
  const c = getCtx();
  const len = c.sampleRate * dur;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * vol;
  const src = c.createBufferSource();
  const g = c.createGain();
  src.buffer = buf;
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  src.connect(g).connect(c.destination);
  src.start(start);
  src.stop(start + dur);
}

// Quick tap — pixel hover / click
export function playTap() {
  const t = getCtx().currentTime;
  osc('sine', 800, t, 0.06, 0.1);
  osc('sine', 1200, t + 0.01, 0.04, 0.06);
}

// Dice roll — discover button
export function playDice() {
  const t = getCtx().currentTime;
  for (let i = 0; i < 6; i++) {
    const freq = 300 + Math.random() * 400;
    noise(t + i * 0.05, 0.04, 0.12);
    osc('square', freq, t + i * 0.05, 0.03, 0.04);
  }
  // Final landing tone
  osc('sine', 880, t + 0.35, 0.12, 0.12);
  osc('sine', 1320, t + 0.38, 0.1, 0.08);
}

// Purchase success — ascending celebration chime
export function playCelebration() {
  const t = getCtx().currentTime;
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    osc('sine', freq, t + i * 0.08, 0.25, 0.12);
    osc('triangle', freq * 2, t + i * 0.08, 0.15, 0.04);
  });
  // Shimmer
  osc('sine', 1568, t + 0.45, 0.4, 0.08);
  osc('sine', 2093, t + 0.5, 0.35, 0.05);
}

// Error — descending tone
export function playError() {
  const t = getCtx().currentTime;
  osc('sawtooth', 400, t, 0.15, 0.08);
  osc('sawtooth', 280, t + 0.1, 0.2, 0.06);
}

// Button click — subtle pop
export function playClick() {
  const t = getCtx().currentTime;
  osc('sine', 600, t, 0.05, 0.08);
}
