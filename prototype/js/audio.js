// Synthesized ambience — no audio assets. One drone per world, the Hum on
// Hush, a discovery chime, and a few narrative stingers. All gated behind a
// user gesture per browser autoplay policy.

let ctx = null;
let master = null;
let droneNodes = [];
let humTimer = null;
let muted = false;

const DRONES = {
  space: { freqs: [55, 110.5], type: 'sine', gain: 0.05, filter: 400 },
  cinder: { freqs: [49, 73.7, 98.2], type: 'sawtooth', gain: 0.02, filter: 220 },
  brume: { freqs: [130.8, 196.3, 261.9], type: 'triangle', gain: 0.03, filter: 900 },
  hush: { freqs: [36], type: 'sine', gain: 0.025, filter: 120 },
};

export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ctx.destination);
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.2);
  return muted;
}

function stopDrone() {
  for (const n of droneNodes) {
    try { n.stop ? n.stop() : n.disconnect(); } catch { /* already stopped */ }
  }
  droneNodes = [];
  if (humTimer) { clearInterval(humTimer); humTimer = null; }
}

export function setAmbience(key) {
  if (!ctx) return;
  stopDrone();
  const cfg = DRONES[key] || DRONES.space;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cfg.filter;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(cfg.gain, ctx.currentTime + 2.5);
  filter.connect(gain);
  gain.connect(master);
  for (const f of cfg.freqs) {
    const osc = ctx.createOscillator();
    osc.type = cfg.type;
    osc.frequency.value = f;
    osc.detune.value = (Math.random() - 0.5) * 12;
    osc.connect(filter);
    osc.start();
    droneNodes.push(osc);
  }
  droneNodes.push(filter, gain);
  // The Hum: an 11-second sub pulse, only on Hush (scaled from 11 hours —
  // diegetically, Halley is time-compressing it so you can hear it).
  if (key === 'hush') {
    humTimer = setInterval(() => pulse(31, 1.8, 0.16), 11000);
    pulse(31, 1.8, 0.16);
  }
}

function pulse(freq, duration, peak) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.1);
}

export function chime() {
  if (!ctx) return;
  const notes = [523.3, 784.0, 1046.5];
  notes.forEach((f, i) => {
    setTimeout(() => pulse(f, 1.2, 0.08), i * 120);
  });
}

export function dreadSwell() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(28, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 6);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 140;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 5);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 9);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 9.5);
}

// The Greeters replaying a 60-year-old broadcast: rhythmic filtered-noise
// bursts — the ghost of a laugh track.
export function laughTrackCrackle() {
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * 0.15;
  for (let burst = 0; burst < 7; burst++) {
    setTimeout(() => {
      if (muted) return;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 700 + Math.random() * 600;
      const gain = ctx.createGain();
      gain.gain.value = 0.07;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start();
    }, burst * 260 + Math.random() * 80);
  }
}
