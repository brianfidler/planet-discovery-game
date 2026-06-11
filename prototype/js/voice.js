// Halley's voice via the Web Speech API. Zero assets, works offline.
// Local (on-device) voices are preferred — network voices can stall mid-line.

const PREFERRED_VOICES = [
  'Samantha', // macOS — warm, clear
  'Karen', 'Moira', 'Tessa', 'Daniel',
  'Google UK English Female', 'Google US English',
  'Microsoft Aria Online (Natural) - English (United States)',
];
const RATE = 1.04;
const PITCH = 1.06;
const VOLUME = 0.95;
const SAFETY_MS_PER_CHAR = 80;
const SAFETY_BASE_MS = 5000;

let enabled = true;
let chosenVoice = null;

function supported() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((x) => x.name === name);
    if (v) return v;
  }
  const english = voices.filter((v) => v.lang?.startsWith('en'));
  return english.find((v) => v.localService) || english[0] || voices[0];
}

if (typeof window !== 'undefined' && supported()) {
  window.speechSynthesis.onvoiceschanged = () => { chosenVoice = pickVoice(); };
}

function stripForSpeech(text) {
  return text
    .replace(/[▮◦↳]/g, ' ')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

// Speaks a line; returns true if speech actually started. onEnd always fires
// exactly once (end, error, cancel, or safety timeout — Chrome sometimes
// swallows the end event).
export function speak(text, onEnd) {
  if (!enabled || !supported()) return false;
  stop();
  if (!chosenVoice) chosenVoice = pickVoice();
  const utterance = new SpeechSynthesisUtterance(stripForSpeech(text));
  if (chosenVoice) utterance.voice = chosenVoice;
  utterance.rate = RATE;
  utterance.pitch = PITCH;
  utterance.volume = VOLUME;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(safety);
    onEnd?.();
  };
  const safety = setTimeout(finish, text.length * SAFETY_MS_PER_CHAR + SAFETY_BASE_MS);
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stop() {
  if (supported()) window.speechSynthesis.cancel();
}

export function toggle() {
  enabled = !enabled;
  if (!enabled) stop();
  return enabled;
}

export function isEnabled() {
  return enabled && supported();
}
