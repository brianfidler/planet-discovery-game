// Halley's dialogue system: a queue with a typewriter, spoken voice,
// auto-advance, and a running log. Non-blocking — the player keeps control
// while Halley talks. A line advances when typing, the hold timer, AND
// speech (if active) have all finished.

import { BEATS } from './data/narrative.js';
import { emit } from './state.js';
import * as voice from './voice.js';

const TYPE_MS_PER_CHAR = 22;
const HOLD_BASE_MS = 2200;
const HOLD_MS_PER_CHAR = 26;

let queue = [];
let current = null;
let typeTimer = null;
let holdTimer = null;
let charIndex = 0;
let holdDone = false;
let speechDone = true;
let lineSeq = 0; // guards against stale utterance callbacks after a skip
let els = null;
export const dialogueLog = []; // { speaker, text }

export function initHalley() {
  els = {
    box: document.getElementById('dialogue'),
    speaker: document.getElementById('dialogue-speaker'),
    text: document.getElementById('dialogue-text'),
    hint: document.getElementById('dialogue-hint'),
  };
}

export function play(beatId) {
  const lines = BEATS[beatId];
  if (!lines) throw new Error(`Unknown narrative beat: ${beatId}`);
  for (const line of lines) queue.push(line);
  if (!current) next();
  emit('beatPlayed', beatId);
}

// Speak a single dynamic line (chat replies) outside the authored beats.
export function say(text) {
  queue.push({ t: text });
  if (!current) next();
}

export function isSpeaking() {
  return current !== null || queue.length > 0;
}

export function advance() {
  if (!current) return;
  if (charIndex < current.t.length) {
    // First press: finish typing instantly (speech keeps going).
    clearInterval(typeTimer);
    charIndex = current.t.length;
    els.text.textContent = current.t;
    scheduleHold();
  } else {
    next();
  }
}

function tryAdvance() {
  if (!current) return;
  if (charIndex >= current.t.length && holdDone && speechDone) next();
}

function next() {
  clearInterval(typeTimer);
  clearTimeout(holdTimer);
  voice.stop();
  current = queue.shift() || null;
  if (!current) {
    els.box.classList.remove('visible');
    return;
  }
  dialogueLog.push({ speaker: current.sys ? 'SYSTEM' : 'HALLEY', text: current.t });
  els.box.classList.add('visible');
  els.box.classList.toggle('sys', !!current.sys);
  els.speaker.textContent = current.sys ? '— EVENT —' : 'HALLEY';
  els.text.textContent = '';
  els.hint.textContent = queue.length > 0 ? '⏎ next' : '⏎ dismiss';
  charIndex = 0;
  holdDone = false;
  speechDone = true;
  const seq = ++lineSeq;
  if (!current.sys) {
    const speaking = voice.speak(current.t, () => {
      if (seq !== lineSeq) return;
      speechDone = true;
      tryAdvance();
    });
    if (speaking) speechDone = false;
  }
  typeTimer = setInterval(() => {
    charIndex++;
    els.text.textContent = current.t.slice(0, charIndex);
    if (charIndex >= current.t.length) {
      clearInterval(typeTimer);
      scheduleHold();
    }
  }, TYPE_MS_PER_CHAR);
}

function scheduleHold() {
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    holdDone = true;
    tryAdvance();
  }, HOLD_BASE_MS + current.t.length * HOLD_MS_PER_CHAR);
}
