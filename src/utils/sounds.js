// Web Audio API sound effects — no external files, instant playback
let ctx = null;
let activeNodes = 0;
const MAX_NODES = 60; // prevent audio overload from rapid clicks

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function canPlay() {
  return activeNodes < MAX_NODES;
}

function osc(type, freq, start, dur, vol = 0.15) {
  if (!canPlay()) return;
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.connect(g).connect(c.destination);
  activeNodes++;
  o.onended = () => { activeNodes--; };
  o.start(start);
  o.stop(start + dur);
}

function noise(start, dur, vol = 0.08) {
  if (!canPlay()) return;
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
  activeNodes++;
  src.onended = () => { activeNodes--; };
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

// Zoom in — quick rising tick
export function playZoomIn() {
  const t = getCtx().currentTime;
  osc('sine', 500, t, 0.04, 0.07);
  osc('sine', 750, t + 0.02, 0.04, 0.05);
}

// Zoom out — quick falling tick
export function playZoomOut() {
  const t = getCtx().currentTime;
  osc('sine', 700, t, 0.04, 0.07);
  osc('sine', 450, t + 0.02, 0.04, 0.05);
}

// Reset view — soft whoosh
export function playReset() {
  const t = getCtx().currentTime;
  noise(t, 0.12, 0.06);
  osc('sine', 400, t, 0.1, 0.06);
  osc('sine', 600, t + 0.04, 0.08, 0.04);
}

// Crate reveal — PUBG style: tension build → burst → reveal shine
export function playCrateReveal() {
  const t = getCtx().currentTime;

  // Phase 1: Low rumble tension build (0 - 0.6s)
  const c = getCtx();
  const rumbleLen = c.sampleRate * 0.6;
  const rumbleBuf = c.createBuffer(1, rumbleLen, c.sampleRate);
  const rumbleData = rumbleBuf.getChannelData(0);
  for (let i = 0; i < rumbleLen; i++) {
    const progress = i / rumbleLen;
    rumbleData[i] = (Math.random() * 2 - 1) * progress * 0.15;
  }
  const rumbleSrc = c.createBufferSource();
  const rumbleGain = c.createGain();
  rumbleSrc.buffer = rumbleBuf;
  rumbleGain.gain.setValueAtTime(0.01, t);
  rumbleGain.gain.linearRampToValueAtTime(0.18, t + 0.5);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
  rumbleSrc.connect(rumbleGain).connect(c.destination);
  rumbleSrc.start(t);
  rumbleSrc.stop(t + 0.65);

  // Rising tone during tension
  osc('sine', 120, t, 0.6, 0.06);
  osc('sine', 180, t + 0.15, 0.45, 0.06);
  osc('sine', 260, t + 0.3, 0.3, 0.08);
  osc('sine', 380, t + 0.45, 0.15, 0.1);

  // Phase 2: BURST (0.6s) — impact hit
  noise(t + 0.6, 0.08, 0.25);
  osc('sine', 80, t + 0.6, 0.12, 0.2);
  osc('square', 150, t + 0.6, 0.06, 0.1);

  // Phase 3: Reveal shine (0.7 - 1.2s) — sparkle chime
  const revealNotes = [880, 1175, 1397, 1760];
  revealNotes.forEach((freq, i) => {
    osc('sine', freq, t + 0.72 + i * 0.06, 0.3, 0.1);
    osc('triangle', freq * 1.5, t + 0.74 + i * 0.06, 0.2, 0.04);
  });

  // Final shimmer
  osc('sine', 2093, t + 1.0, 0.5, 0.06);
  osc('sine', 2637, t + 1.05, 0.4, 0.04);
}

// --- Golden pixel sounds ---

// Heartbeat — plays faster as proximity increases (0-1)
let heartbeatInterval = null;
let heartbeatPlaying = false;

export function startHeartbeat(proximity) {
  stopHeartbeat();
  if (proximity <= 0) return;
  heartbeatPlaying = true;

  const play = () => {
    if (!heartbeatPlaying) return;
    const t = getCtx().currentTime;
    const vol = 0.04 + proximity * 0.1;
    // Lub
    osc('sine', 60 + proximity * 40, t, 0.08, vol);
    osc('sine', 80 + proximity * 30, t + 0.02, 0.06, vol * 0.7);
    // Dub
    osc('sine', 50 + proximity * 30, t + 0.12, 0.06, vol * 0.8);
  };

  play();
  // Faster heartbeat = closer (1200ms far → 300ms close)
  const interval = Math.max(300, 1200 - proximity * 900);
  heartbeatInterval = setInterval(play, interval);
}

export function stopHeartbeat() {
  heartbeatPlaying = false;
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Golden pixel found — epic reveal with golden harmonics
export function playGoldenReveal() {
  const t = getCtx().currentTime;
  const c = getCtx();

  // Phase 1: Mystical tension (0 - 0.8s)
  const shimmerLen = c.sampleRate * 0.8;
  const shimmerBuf = c.createBuffer(1, shimmerLen, c.sampleRate);
  const shimmerData = shimmerBuf.getChannelData(0);
  for (let i = 0; i < shimmerLen; i++) {
    const p = i / shimmerLen;
    shimmerData[i] = (Math.random() * 2 - 1) * p * p * 0.2;
  }
  const shimmerSrc = c.createBufferSource();
  const shimmerGain = c.createGain();
  shimmerSrc.buffer = shimmerBuf;
  shimmerGain.gain.setValueAtTime(0.01, t);
  shimmerGain.gain.linearRampToValueAtTime(0.25, t + 0.7);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
  shimmerSrc.connect(shimmerGain).connect(c.destination);
  shimmerSrc.start(t);
  shimmerSrc.stop(t + 0.85);

  // Rising golden tones
  osc('sine', 220, t, 0.8, 0.05);
  osc('sine', 330, t + 0.15, 0.65, 0.06);
  osc('sine', 440, t + 0.3, 0.5, 0.07);
  osc('sine', 660, t + 0.5, 0.3, 0.09);
  osc('triangle', 880, t + 0.65, 0.15, 0.1);

  // Phase 2: GOLDEN BURST (0.8s)
  noise(t + 0.8, 0.1, 0.3);
  osc('sine', 100, t + 0.8, 0.15, 0.2);
  osc('square', 200, t + 0.8, 0.08, 0.12);

  // Phase 3: Magical chime (0.9 - 1.6s) — pentatonic golden scale
  const goldenNotes = [523, 659, 784, 988, 1175, 1319, 1568];
  goldenNotes.forEach((freq, i) => {
    osc('sine', freq, t + 0.95 + i * 0.07, 0.4, 0.1);
    osc('triangle', freq * 2, t + 0.97 + i * 0.07, 0.25, 0.03);
  });

  // Final golden shimmer
  osc('sine', 2093, t + 1.5, 0.6, 0.07);
  osc('sine', 2637, t + 1.55, 0.5, 0.05);
  osc('sine', 3136, t + 1.6, 0.4, 0.03);

  // Treasure mode toggle sound
}

export function playTreasureToggle(on) {
  const t = getCtx().currentTime;
  if (on) {
    // Mysterious enable — descending then ascending
    osc('sine', 440, t, 0.1, 0.08);
    osc('sine', 330, t + 0.06, 0.1, 0.06);
    osc('sine', 550, t + 0.14, 0.15, 0.1);
    osc('triangle', 880, t + 0.2, 0.12, 0.05);
  } else {
    // Disable — soft descend
    osc('sine', 550, t, 0.08, 0.06);
    osc('sine', 330, t + 0.06, 0.1, 0.04);
  }
}
