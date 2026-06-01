// sound.js — tiny Web Audio synth for very subtle, modern UI feedback.
// No audio assets: every cue is generated on the fly so it stays lightweight
// and works offline. Sounds are intentionally quiet and short.

let ctx = null;
let masterGain = null;
let enabled = true;

const STORAGE_KEY = 'csq_sound';

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'off') enabled = false;
} catch (e) {}

function audio() {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5; // global ceiling — keeps everything gentle
      masterGain.connect(ctx.destination);
    } catch (e) {
      ctx = null;
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// A single short tone with a fast attack and smooth exponential release.
function tone({ freq = 440, type = 'sine', dur = 0.06, gain = 0.05, slideTo = null, delay = 0 }) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Prime the audio context from a user gesture so the first real cue is instant
// (browsers block audio until the page has been interacted with).
export function primeSound() {
  audio();
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(value) {
  enabled = !!value;
  try { localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off'); } catch (e) {}
}

// Crisp high blip with a tiny pitch rise — for selecting a card/option.
export function playSelect() {
  tone({ freq: 540, type: 'triangle', dur: 0.05, gain: 0.045, slideTo: 880 });
  tone({ freq: 1320, type: 'sine', dur: 0.04, gain: 0.018, delay: 0.005 });
}

// Soft two-step rising chirp — for navigating to another page.
export function playNav() {
  tone({ freq: 480, type: 'sine', dur: 0.07, gain: 0.04 });
  tone({ freq: 760, type: 'sine', dur: 0.09, gain: 0.04, delay: 0.06 });
}

// Low muted tick — for toggles / minor switches.
export function playToggle() {
  tone({ freq: 320, type: 'square', dur: 0.035, gain: 0.025, slideTo: 240 });
}
