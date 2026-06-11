// The galaxy: Vesper (hand-authored, carries the narrative) plus procedurally
// generated systems. Generation is CAUSAL and DETERMINISTIC — star class →
// luminosity → orbital distance → temperature band → palette, atmosphere,
// chemistry, and possible life. The same seed always produces the same world:
// permanence comes from determinism, not storage. Only player actions
// (discoveries, samples, flags) ever need saving.

import { mulberry32 } from '../util.js';
import { PLANETS, STAR } from './planets.js';

export const GENERATOR_VERSION = 1; // bump = worlds may change; record in saves
const GALAXY_SEED = 8181;

const STAR_CLASSES = [
  { class: 'M3V red dwarf', color: 0xff8866, luminosity: 0.4, weight: 4 },
  { class: 'K2V orange dwarf', color: 0xffc27a, luminosity: 0.7, weight: 3 },
  { class: 'G5V yellow dwarf', color: 0xfff0c2, luminosity: 1.0, weight: 2 },
  { class: 'F8V yellow-white', color: 0xf2f5ff, luminosity: 1.5, weight: 1 },
];

const NAME_HEADS = ['Kor', 'Tess', 'Mira', 'Eri', 'Dun', 'Sava', 'Quill', 'Ash', 'Bren', 'Lor'];
const NAME_TAILS = ['rin', 'mund', 'dane', 'vex', 'holm', 'quat', 'esse', 'mar', 'dell', 'ona'];

const BAND_PALETTES = {
  scorched: [
    { groundLow: 0x2a1c14, groundHigh: 0x8a4a28, sky: 0xc97f4a, fog: 0xb96f3e, sun: 0xffd2a0, sunIntensity: 2.4, ambient: 0x553322, particles: 'ash', flavor: 'a furnace world of slag plains and standing heat' },
    { groundLow: 0x241414, groundHigh: 0x6e3a3a, sky: 0xa85a3a, fog: 0x9a5236, sun: 0xffc090, sunIntensity: 2.2, ambient: 0x4a2a22, particles: 'ash', flavor: 'iron deserts under a swollen sun' },
  ],
  temperate: [
    { groundLow: 0x24332c, groundHigh: 0x5e7d62, sky: 0x9fb8a8, fog: 0x8aa896, sun: 0xfff4d6, sunIntensity: 1.8, ambient: 0x46584e, particles: 'spores', flavor: 'mist valleys and slow green light' },
    { groundLow: 0x33301f, groundHigh: 0x8a7d4a, sky: 0xc2b88a, fog: 0xb0a87e, sun: 0xfff0c8, sunIntensity: 1.9, ambient: 0x55503a, particles: 'none', flavor: 'dry savanna rock, patient and gold' },
  ],
  cold: [
    { groundLow: 0x1c2430, groundHigh: 0x4a5c70, sky: 0x8a9cb5, fog: 0x7a8ca5, sun: 0xe8f0ff, sunIntensity: 1.4, ambient: 0x3a4555, particles: 'none', flavor: 'blue tundra under thin pale light' },
    { groundLow: 0x222833, groundHigh: 0x5a6678, sky: 0x6a7a90, fog: 0x5e6e84, sun: 0xd8e4f5, sunIntensity: 1.3, ambient: 0x333d4d, particles: 'none', flavor: 'gravel oceans, frozen mid-wave' },
  ],
  frozen: [
    { groundLow: 0x2a2a3a, groundHigh: 0x8a8aa8, sky: 0x1a1c2e, fog: 0x202238, sun: 0x9aa2c8, sunIntensity: 0.9, ambient: 0x2a2a44, particles: 'none', flavor: 'violet ice and starlight at noon' },
    { groundLow: 0x202030, groundHigh: 0xb8bcd0, sky: 0x10121f, fog: 0x181a2c, sun: 0x8a92b8, sunIntensity: 0.8, ambient: 0x252540, particles: 'none', flavor: 'a white silence with a horizon' },
  ],
};

const SENSOR_DARK_ENVS = {
  THM: { sky: 0x05060f, fog: [0x070a18, 0.006], sun: 0x222244, sunIntensity: 0.15, ambient: 0x101030, ambientIntensity: 0.5 },
  EMF: { sky: 0x0a0618, fog: [0x120a26, 0.007], sun: 0x331a55, sunIntensity: 0.3, ambient: 0x221144, ambientIntensity: 0.7 },
  TMP: { sky: 0x1a0a08, fog: [0x200d0a, 0.006], sun: 0x884433, sunIntensity: 0.8, ambient: 0x331a14, ambientIntensity: 0.8 },
};

const DEPOSIT_POOLS = {
  scorched: [
    { material: 'vesperine', beat: 'vesperineScan' },
    { material: 'threnodine', beat: 'threnodineScan' },
    { material: 'basaltGlass', beat: null },
  ],
  temperate: [
    { material: 'levitine', beat: null },
    { material: 'halcium', beat: 'halciumScan' },
    { material: 'basaltGlass', beat: null },
  ],
  cold: [
    { material: 'halcium', beat: 'halciumScan' },
    { material: 'umbrium', beat: 'umbriumScan' },
  ],
  frozen: [
    { material: 'umbrium', beat: 'umbriumScan' },
    { material: 'basaltGlass', beat: null },
  ],
};

// Life chances per temperature band: [mats (T1), drifters (T2), choir (T3)]
const LIFE_CHANCES = {
  scorched: [0.4, 0.08, 0.12],
  temperate: [0.45, 0.2, 0.1],
  cold: [0.25, 0.15, 0.05],
  frozen: [0.08, 0.12, 0.02],
};

const LIFE_NAME_PARTS = {
  mats: ['Ember mats', 'Velvet mats', 'Rust film', 'Pale bloom', 'Cinder moss'],
  drifters: ['Static drifters', 'Hollow motes', 'Whisper veils', 'Grey lanterns'],
  choir: ['Lesser Choir', 'Glass Chorus', 'Tall Singers', 'Quiet Columns'],
};

function pickWeighted(rng, options) {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let roll = rng() * total;
  for (const o of options) {
    roll -= o.weight;
    if (roll <= 0) return o;
  }
  return options[options.length - 1];
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function tempBand(luminosity, orbitRadius) {
  const au = orbitRadius / 30;
  const insolation = luminosity / (au * au);
  if (insolation > 2) return 'scorched';
  if (insolation > 0.6) return 'temperate';
  if (insolation > 0.15) return 'cold';
  return 'frozen';
}

function generatePlanet(systemId, systemName, starClass, rng, index) {
  const orbitRadius = 18 + index * 13 + rng() * 7;
  const band = tempBand(starClass.luminosity, orbitRadius);
  const palette = pick(rng, BAND_PALETTES[band]);
  const seed = Math.floor(rng() * 1e9);
  const planetRng = mulberry32(seed);
  const id = `${systemId}-p${index + 1}`;
  const numeral = ['I', 'II', 'III', 'IV', 'V'][index];

  const deposits = [];
  const pool = [...DEPOSIT_POOLS[band]];
  const depositCount = planetRng() < 0.75 ? 1 + Math.floor(planetRng() * 2) : 0;
  for (let i = 0; i < depositCount && pool.length > 0; i++) {
    const entry = pool.splice(Math.floor(planetRng() * pool.length), 1)[0];
    deposits.push({
      material: entry.material,
      beat: entry.beat,
      x: (planetRng() - 0.5) * 160,
      z: (planetRng() - 0.5) * 160,
    });
  }

  const lifeforms = [];
  const [matsP, driftersP, choirP] = LIFE_CHANCES[band];
  if (planetRng() < matsP) {
    lifeforms.push({ type: 'genericMats', params: { seed: seed + 1, name: pick(planetRng, LIFE_NAME_PARTS.mats), planetId: id } });
  }
  if (planetRng() < driftersP) {
    lifeforms.push({ type: 'drifters', params: { seed: seed + 2, name: pick(planetRng, LIFE_NAME_PARTS.drifters), planetId: id } });
  }
  if (planetRng() < choirP) {
    lifeforms.push({ type: 'genericChoir', params: { seed: seed + 3, name: pick(planetRng, LIFE_NAME_PARTS.choir), planetId: id } });
  }

  const fogDensity = band === 'temperate' ? 0.009 : band === 'scorched' ? 0.0045 : 0.004;

  return {
    id,
    systemId,
    name: `${systemName} ${numeral}`,
    short: `${systemName} ${numeral}`,
    orbitRadius,
    orbitSpeed: 0.10 / (1 + index * 0.6),
    orbitPhase: rng() * Math.PI * 2,
    bodyRadius: 2.2 + planetRng() * 1.6,
    bodyColor: palette.groundHigh,
    procedural: true,
    band,
    formation: [
      `${starClass.class} → ${band === 'scorched' ? 'close, metal-starved accretion' : band === 'temperate' ? 'mid-disk accretion, volatiles retained' : 'far-disk accretion, ice-dominated'}`,
      `orbit ${orbitRadius.toFixed(0)} units → ${band} regime`,
      palette.flavor,
      lifeforms.length > 0 ? 'possibility space: nonzero' : 'possibility space: unresolved — absence is also data',
    ],
    stats: {
      gravity: `${(0.6 + planetRng() * 0.9).toFixed(1)} g`,
      regime: band,
      atmosphere: band === 'scorched' ? 'thin, mineral haze' : band === 'temperate' ? 'dense, weather-bearing' : 'trace, still',
      survey: 'unsurveyed',
    },
    surface: {
      seed,
      heightAmp: 6 + planetRng() * 6,
      heightFreq: 0.008 + planetRng() * 0.007,
      octaves: 3 + Math.floor(planetRng() * 2),
      groundLow: palette.groundLow,
      groundHigh: palette.groundHigh,
      particles: palette.particles,
      env: {
        VIS: {
          sky: palette.sky, fog: [palette.fog, fogDensity],
          sun: palette.sun, sunIntensity: palette.sunIntensity,
          ambient: palette.ambient, ambientIntensity: 1.0,
        },
        ...SENSOR_DARK_ENVS,
      },
    },
    lifeforms,
    deposits,
    zones: [],
    arriveBeat: null,
  };
}

function generateSystem(rng, index) {
  const name = `${pick(rng, NAME_HEADS)}${pick(rng, NAME_TAILS)}`;
  const id = `sys-${index}`;
  const starClass = pickWeighted(rng, STAR_CLASSES);
  const systemRng = mulberry32(Math.floor(rng() * 1e9));
  const planetCount = 2 + Math.floor(systemRng() * 4);
  const planets = [];
  for (let i = 0; i < planetCount; i++) {
    planets.push(generatePlanet(id, name, starClass, systemRng, i));
  }
  const angle = (index / 8) * Math.PI * 2 + rng() * 0.4;
  const dist = 90 + rng() * 130;
  return {
    id,
    name,
    starName: name,
    starClass: starClass.class,
    starColor: starClass.color,
    luminosity: starClass.luminosity,
    position: { x: Math.cos(angle) * dist, z: Math.sin(angle) * dist },
    planets,
    reachable: true,
    blurb: `${planetCount} planets. No survey on record. Nobody has ever looked.`,
  };
}

function buildGalaxy() {
  const rng = mulberry32(GALAXY_SEED);
  const systems = [];

  systems.push({
    id: 'vesper',
    name: 'Vesper',
    starName: STAR.name,
    starClass: STAR.spectralClass,
    starColor: STAR.color,
    luminosity: 0.7,
    position: { x: 0, z: 0 },
    planets: PLANETS,
    pulsePlanetId: 'hush',
    reachable: true,
    blurb: 'Source of the Hum. The reason we came.',
  });

  for (let i = 0; i < 5; i++) systems.push(generateSystem(rng, i));

  // Beyond drive range — visible, named, unreachable. The roadmap, in-fiction.
  for (let i = 5; i < 7; i++) {
    const sys = generateSystem(rng, i);
    sys.reachable = false;
    sys.blurb = 'Beyond current drive range. The next engine will get us there.';
    systems.push(sys);
  }

  return systems;
}

export const SYSTEMS = buildGalaxy();

export function getSystem(id) {
  const sys = SYSTEMS.find((s) => s.id === id);
  if (!sys) throw new Error(`Unknown system id: ${id}`);
  return sys;
}

export function resolvePlanet(planetId) {
  for (const sys of SYSTEMS) {
    const planet = sys.planets.find((p) => p.id === planetId);
    if (planet) return planet;
  }
  throw new Error(`Unknown planet id: ${planetId}`);
}
