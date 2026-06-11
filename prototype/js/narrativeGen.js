// Halley's voice for the procedural frontier: deterministic, seed-picked
// survey lines for worlds no writer has met. Authored beats stay in Vesper;
// these keep her present everywhere else.

import { say } from './halley.js';
import { mulberry32 } from './util.js';

const SYSTEM_ARRIVALS = [
  (s) => `Jump complete. The ${s.name} system — ${s.starClass}. No survey on record, Doctor. We are the first eyes here. Try not to blink.`,
  (s) => `${s.name}. ${s.starClass}, ${s.planets.length} worlds, zero footnotes. I love an empty page.`,
  (s) => `Arrived: ${s.name}. My charts list this star as a catalogue number and a shrug. Let's improve on the shrug.`,
];

const BAND_OPENERS = {
  scorched: [
    (p) => `${p.name}. Surface reads hot enough to argue with. Standard advice applies: trust the thermal band, not your eyes.`,
    (p) => `Touchdown on ${p.name}. A kiln with a horizon, Doctor. If anything lives here, it will live in the heat gradients.`,
  ],
  temperate: [
    (p) => `${p.name}. Liquid-water regime, weather on the scanners. Statistically promising — and I have learned what my statistics are worth.`,
    (p) => `Touchdown on ${p.name}. Mild, wet, breathable-adjacent. On Earth we would call this real estate. Here we call it a candidate.`,
  ],
  cold: [
    (p) => `${p.name}. Cold, slow, patient terrain. Life here would be in no hurry. Neither should we be.`,
    (p) => `Touchdown on ${p.name}. The kind of cold that keeps secrets, Doctor. Bring every sense we own.`,
  ],
  frozen: [
    (p) => `${p.name}. Deep-freeze regime — my instruments describe it as 'archival.' Whatever is here has been here a very long time.`,
    (p) => `Touchdown on ${p.name}. Starlight at noon and ice to the core. A world in cold storage. Let's read the label.`,
  ],
};

const LIFE_HINTS = [
  'I am seeing texture in the noise floor. Could be geology. I have a poor record with that sentence.',
  'Faint structure on the secondary bands, Doctor. Walk the terrain and cycle your senses — one of them will catch it.',
  'Something in the readings refuses to average out. Recommend a sensor sweep on foot.',
];

const NULL_HINTS = [
  'First pass reads quiet. Remember the rule, Doctor: a confirmed silence is still science. Survey it anyway.',
  'Nothing on the obvious bands. "Nothing" has burned me before — but if this world is truly empty, that constrains every model we have. Worth the walk.',
];

function pickWith(seed, arr) {
  return arr[Math.floor(mulberry32(seed)() * arr.length)];
}

export function announceSystemArrival(sys) {
  const idx = sys.id.length + sys.planets.length;
  say(pickWith(idx, SYSTEM_ARRIVALS)(sys));
}

export function announcePlanetArrival(planet) {
  const seed = planet.surface.seed;
  say(pickWith(seed, BAND_OPENERS[planet.band] || BAND_OPENERS.cold)(planet));
  say(planet.lifeforms.length > 0
    ? pickWith(seed + 1, LIFE_HINTS)
    : pickWith(seed + 1, NULL_HINTS));
}
