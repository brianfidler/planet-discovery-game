// Halley's voice via the Web Speech API. Zero assets, works offline.
// Local (on-device) voices are preferred — network voices can stall mid-line.

// Halley is voiced female with an Irish accent. macOS/iOS ship "Moira"
// (en-IE); platforms without an Irish voice fall back to female English.
const PREFERRED_VOICES = [
  'Moira', // macOS — Irish English, the canonical Halley
  'Samantha', 'Karen', 'Tessa', 'Serena', 'Fiona',
  'Google UK English Female',
  'Microsoft Emma Online (Natural) - English (Ireland)',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Google US English',
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
  // First choice: any Irish English voice (Moira on Apple, Emma on Edge, …).
  const irish = voices.filter((v) => v.lang?.replace('_', '-') === 'en-IE' || /irish|ireland/i.test(v.name));
  if (irish.length > 0) {
    return irish.find((v) => v.localService) || irish[0];
  }
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
    .replace(/\bhalley\b/gi, 'Hailey') // pronounced "hail-ee" — spoken only, text keeps the spelling
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
