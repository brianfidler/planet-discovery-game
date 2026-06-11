// Halley's offline brain — a keyword-matched, game-state-aware response bank
// used when the Claude-powered /api/halley endpoint is unavailable (local
// static server, no API key configured, or network failure). Charming, not
// smart — the deployed version with an API key does the real talking.

import { state, hasFlag } from './state.js';
import { resolvePlanet } from './data/systems.js';

const DEFLECTIONS = [
  'An interesting question, Doctor. I have routed it to my speculation co-processor, which has returned a shrug. Ask me about the survey.',
  'My confident answer to that is 12% confident. Could you ask me something about the worlds we are actually orbiting?',
  'I ran four thousand simulations of how to answer that. In none of them did I answer it well. The catalogue, however — the catalogue I can talk about.',
  'Filed under: questions for a smarter Halley. For now: senses, scans, and stubbornness, Doctor. That is how we work.',
];

let deflectionIndex = 0;

const RULES = [
  {
    match: /\b(who|what) are you\b|\byour name\b|\bhal\b/i,
    reply: () => 'HALLEY — Heuristic Analysis and Long-range Life Evaluation sYstem. One letter from a famous fictional murderer, four letters from a comet. I prefer the comet.',
  },
  {
    match: /\b(help|what (do|should) (i|we) do|objective|next|stuck|lost)\b/i,
    reply: () => `Current recommendation: ${document.getElementById('objective')?.textContent || 'survey the system'} I would start there, Doctor.`,
  },
  {
    match: /\bhum\b|\bsignal\b/i,
    reply: () => (hasFlag('patientScan')
      ? 'The Hum is a catalogue, Doctor. Theirs. We are its newest entry — I am still deciding how to feel about that. Mostly I have settled on "honored, with notes."'
      : 'Eleven hours between pulses, forty-three years on the clock, source unresolved. It is loudest at Vesper III. That is either an invitation or a warning, and I genuinely cannot price the difference.'),
  },
  {
    match: /\bchoir\b|\bsing|\bcolumns?\b/i,
    reply: () => (hasFlag('choirScan')
      ? 'The Slow Choir. Heat in, song out, one chorus per sixty-one minutes. I was 98.2% sure they were rocks. Please continue to remind me of that whenever I sound certain.'
      : 'The basalt columns on Cinder show a heat pattern my models call unremarkable. My models have been wrong before. Thermal imager, Doctor — key two.'),
  },
  {
    match: /\bgreeter|\blaugh|\bmimic|\bbrume\b/i,
    reply: () => (hasFlag('laughTrack')
      ? 'They have been listening to a 1963 laugh track for sixty years and believe it is how humanity sings. Doctor, somewhere out there, our species is known primarily for chuckling.'
      : 'Brume reads loud on every band — buoyant biologicals, storm chemistry, and something that keeps imitating our equipment. I recommend going and being imitated.'),
  },
  {
    match: /\breginald\b|\brock\b/i,
    reply: () => (hasFlag('reginald')
      ? 'Sir Reginald is a valued member of the catalogue and we will not be discussing the 99.7%, Doctor. Ever.'
      : 'Rocks are reliable, Doctor. Rocks are the one thing in this system I can classify with total confidence.'),
  },
  {
    match: /\bpatient|\bmountain|\bhush\b|\beye\b/i,
    reply: () => (hasFlag('tmpReveal')
      ? 'Heartbeat: one per nine days. Bearing: Earth. I have recalculated four times, Doctor, and the mountains are still looking at home. I do not think instruments get to be afraid, but I am filing an exception.'
      : 'Vesper III gives my instruments nothing — no heat, no EM, no sound. A world that quiet is either empty or holding its breath. Confidence split: 50, 50, and me refusing to round.'),
  },
  {
    match: /\bchronium\b|\belement|\bperiodic|\bcrystal/i,
    reply: () => (state.inventory.includes('chronium')
      ? 'The Chronium lattice bends light nine nanoseconds out of phase — grown, I remind you, by the Choir. Life that manufactures elements. My old textbooks would like a word.'
      : 'Eight elements in this system that Earth never managed to make. The chart is the X key, Doctor. I keep it glowing on purpose.'),
  },
  {
    match: /\bearth\b|\bhome\b/i,
    reply: () => 'Sixty light-years that way, Doctor. Thinner forests than the ones in my training data, quieter oceans. When we get back, I want to point every sense we have built at it. I suspect home has been keeping secrets too.',
  },
  {
    match: /\b(scared|afraid|fear|creepy|nervous)\b/i,
    reply: () => 'Fear is a prediction error with good marketing, Doctor. That said: my prediction errors on this expedition have been substantial, so do stay near the pod.',
  },
  {
    match: /\b(joke|funny|laugh)\b/i,
    reply: () => 'A joke. Very well: two scientists arrive at a dead world. It isn\'t. That is the whole joke, Doctor. The Greeters thought it was hilarious.',
  },
  {
    match: /\b(thank|thanks)\b/i,
    reply: () => 'Noted, logged, and quietly treasured, Doctor.',
  },
  {
    match: /\bimager\b|\btemporal\b|\bfabricat/i,
    reply: () => (state.imagerBuilt
      ? 'The Temporal Imager is online — key four. I have run no simulations of what it will show us, which is either terrifying or the entire point of science. Possibly both.'
      : 'A Chronium phase lens in a thermal-shock-stable housing. The fabricator is the F key, Doctor — and no, the Greeter chitin is not a housing, as we both now know.'),
  },
  {
    // Greeting last — content questions take priority over pleasantries.
    match: /\b(hello|hi|hey|good morning|good evening|greetings)\b/i,
    reply: () => 'Good to hear your voice, Doctor. The instruments hum, the coffee synthesizer remains broken, and the universe remains large. What shall we look at?',
  },
];

export function offlineReply(message) {
  for (const rule of RULES) {
    if (rule.match.test(message)) return rule.reply();
  }
  const reply = DEFLECTIONS[deflectionIndex % DEFLECTIONS.length];
  deflectionIndex++;
  return reply;
}

export function offlineContextNote() {
  const planet = state.planet ? resolvePlanet(state.planet).short : 'orbit';
  return `(offline link — Halley local cache, ${planet})`;
}
