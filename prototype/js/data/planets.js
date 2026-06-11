// The Vesper system. Three hand-tuned worlds, each with a causal formation
// story (simulate causes, let properties emerge) and per-sensor environments.
// Positions are local surface coordinates; the pod is always at the origin.

export const STAR = {
  name: 'Vesper',
  spectralClass: 'K2V orange dwarf',
  color: 0xffc27a,
};

export const PLANETS = [
  {
    id: 'cinder',
    name: 'Vesper I — Cinder',
    short: 'Cinder',
    orbitRadius: 26,
    orbitSpeed: 0.09,
    orbitPhase: 0.8,
    bodyRadius: 2.6,
    bodyColor: 0xb35b34,
    formation: [
      'K2V star → metal-rich inner disk',
      'close accretion → iron-dominated bulk',
      'full differentiation → thin basalt crust over a live mantle',
      'volcanic outgassing → SO₂/CO₂ haze',
      'steep day–night gradients → heat-flow chemistry',
      'possibility space: thermosynthetic life',
    ],
    stats: { gravity: '1.1 g', tempC: '–40 to 310 °C', atmosphere: 'SO₂ / CO₂, thin', day: '54 h' },
    surface: {
      seed: 1101,
      heightAmp: 9,
      heightFreq: 0.012,
      octaves: 4,
      groundLow: 0x2a201c,
      groundHigh: 0x7a4630,
      particles: 'ash',
      env: {
        VIS: { sky: 0xc97f4a, fog: [0xb96f3e, 0.0045], sun: 0xffd2a0, sunIntensity: 2.6, ambient: 0x553322, ambientIntensity: 0.9 },
        THM: { sky: 0x05060f, fog: [0x070a18, 0.006], sun: 0x222244, sunIntensity: 0.15, ambient: 0x101030, ambientIntensity: 0.5 },
        EMF: { sky: 0x0a0618, fog: [0x120a26, 0.007], sun: 0x331a55, sunIntensity: 0.3, ambient: 0x221144, ambientIntensity: 0.7 },
        TMP: { sky: 0x1a0a08, fog: [0x200d0a, 0.006], sun: 0x884433, sunIntensity: 0.8, ambient: 0x331a14, ambientIntensity: 0.8 },
      },
    },
    lifeforms: ['slowChoir', 'ventMats'],
    deposits: [
      { material: 'chronium', x: 18, z: -68, beat: 'chroniumScan' },
      { material: 'basaltGlass', x: -26, z: -30 },
      { material: 'vesperine', x: 44, z: 22, beat: 'vesperineScan' },
      { material: 'threnodine', x: -8, z: -84, beat: 'threnodineScan' },
    ],
    zones: [
      { x: 0, z: -70, r: 48, beat: 'choirNudge' },
      { x: 0, z: -70, r: 44, beat: 'choirReveal', sensor: 'THM' },
    ],
    arriveBeat: 'cinderArrive',
  },

  {
    id: 'brume',
    name: 'Vesper II — Brume',
    short: 'Brume',
    orbitRadius: 42,
    orbitSpeed: 0.055,
    orbitPhase: 2.4,
    bodyRadius: 3.4,
    bodyColor: 0x6fae9a,
    formation: [
      'K2V star → frost-line volatiles survive',
      'formed far out → ice-and-silicate bulk',
      'migrated inward → kept its water and weather',
      'dense N₂/O₂ atmosphere → permanent storm cells',
      'charged aerosols → Levitine fallout',
      'possibility space: buoyant, mimetic life',
    ],
    stats: { gravity: '0.8 g', tempC: '4 to 28 °C', atmosphere: 'N₂ / O₂, dense, storm-wracked', day: '19 h' },
    surface: {
      seed: 2202,
      heightAmp: 6,
      heightFreq: 0.010,
      octaves: 4,
      groundLow: 0x24332c,
      groundHigh: 0x5e7d62,
      particles: 'spores',
      env: {
        VIS: { sky: 0x9fb8a8, fog: [0x8aa896, 0.010], sun: 0xfff4d6, sunIntensity: 1.8, ambient: 0x46584e, ambientIntensity: 1.2 },
        THM: { sky: 0x060812, fog: [0x080c1a, 0.008], sun: 0x222244, sunIntensity: 0.2, ambient: 0x141a33, ambientIntensity: 0.6 },
        EMF: { sky: 0x0b0720, fog: [0x140d30, 0.009], sun: 0x442a77, sunIntensity: 0.4, ambient: 0x2a1a55, ambientIntensity: 0.8 },
        TMP: { sky: 0x16100a, fog: [0x1c140c, 0.008], sun: 0x886644, sunIntensity: 0.7, ambient: 0x33281a, ambientIntensity: 0.8 },
      },
    },
    lifeforms: ['greeterScout', 'greeterFlock', 'sirReginald'],
    deposits: [
      { material: 'halcium', x: -52, z: 40, beat: 'halciumScan' },
      { material: 'levitine', x: 30, z: 58 },
    ],
    zones: [
      { x: 12, z: -26, r: 22, beat: 'greeterFirst' },
      { x: -38, z: -62, r: 28, beat: 'laughTrack', sensor: 'EMF' },
    ],
    arriveBeat: 'brumeArrive',
  },

  {
    id: 'hush',
    name: 'Vesper III — Hush',
    short: 'Hush',
    orbitRadius: 62,
    orbitSpeed: 0.03,
    orbitPhase: 4.6,
    bodyRadius: 3.0,
    bodyColor: 0x241f33,
    formation: [
      'K2V star → outer-disk leftovers',
      'late heavy bombardment → Umbrium-laced regolith',
      'tidally settled → windless, seismically silent',
      'absorbs 99.4% of incident EM → reads as null',
      'the Hum triangulates here, source: everywhere',
      'possibility space: unknown. The instruments are wrong, or the question is.',
    ],
    stats: { gravity: '0.95 g', tempC: '–80 °C, eerily uniform', atmosphere: 'thin argon, perfectly still', day: 'tidally locked' },
    surface: {
      seed: 3303,
      heightAmp: 7,
      heightFreq: 0.008,
      octaves: 3,
      groundLow: 0x0c0a14,
      groundHigh: 0x2a2440,
      particles: 'none',
      env: {
        VIS: { sky: 0x05040a, fog: [0x070610, 0.004], sun: 0x6a5a88, sunIntensity: 0.5, ambient: 0x1a1628, ambientIntensity: 0.9 },
        THM: { sky: 0x03030a, fog: [0x05050e, 0.005], sun: 0x111133, sunIntensity: 0.1, ambient: 0x0c0c22, ambientIntensity: 0.5 },
        EMF: { sky: 0x070313, fog: [0x0c0620, 0.005], sun: 0x2a1a44, sunIntensity: 0.2, ambient: 0x1c1138, ambientIntensity: 0.7 },
        TMP: { sky: 0x230607, fog: [0x2c0a0a, 0.0045], sun: 0xaa3322, sunIntensity: 1.0, ambient: 0x441111, ambientIntensity: 0.9 },
      },
    },
    lifeforms: ['emfGhost', 'patientOnes', 'watcherCliff'],
    deposits: [
      { material: 'umbrium', x: -22, z: 34, beat: 'umbriumScan' },
    ],
    zones: [
      { x: 0, z: -60, r: 36, beat: 'humSpotRouter' },
    ],
    arriveBeat: 'hushArrive',
  },
];

export function getPlanet(id) {
  const p = PLANETS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown planet id: ${id}`);
  return p;
}

// Mound positions for the Patient Ones — baked into Hush's heightmap so the
// creatures ARE the terrain until the temporal imager says otherwise.
export const PATIENT_MOUNDS = [
  { x: 0, z: -150, amp: 26, sigma: 26 },
  { x: 120, z: -90, amp: 22, sigma: 22 },
  { x: -130, z: -70, amp: 24, sigma: 24 },
  { x: 150, z: 60, amp: 20, sigma: 20 },
  { x: -140, z: 90, amp: 25, sigma: 24 },
  { x: 40, z: 160, amp: 22, sigma: 22 },
  { x: -60, z: -170, amp: 28, sigma: 27 },
];

export const WATCHER_CLIFF = { x: 34, z: 30, amp: 16, sigma: 10 };
