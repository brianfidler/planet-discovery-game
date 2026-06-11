// The expanded periodic table. Real elements are the muted backdrop;
// the Vesper Extension (Z 119–126) is the point — every novel element has
// simulated properties that drive a mechanic or a lifeform, so learning the
// chemistry IS learning the game (per docs/systems/planet-generation.md).

// Standard 18-column layout. '.' = empty cell, '*' = f-block marker.
export const TABLE_ROWS = [
  'H . . . . . . . . . . . . . . . . He',
  'Li Be . . . . . . . . . . B C N O F Ne',
  'Na Mg . . . . . . . . . . Al Si P S Cl Ar',
  'K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr',
  'Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe',
  'Cs Ba La Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn',
  'Fr Ra Ac Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og',
];

export const F_BLOCK_ROWS = [
  '. . Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu . .',
  '. . Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr . .',
];

// The Vesper Extension — period 8, none ever synthesized or observed on Earth.
export const NOVEL_ELEMENTS = [
  {
    symbol: 'Vs', z: 119, name: 'Vesperine',
    group: 'Superheavy alkali metal',
    halfLife: '14 days',
    phase: 'Soft silver metal',
    density: '3.1 g/cm³',
    keyProperty: 'Hyperredox — releases stored stellar fusion energy on contact with water vapor. A battery chemistry physics said was impossible.',
    origin: 'Cinder — evaporite basins near the vent fields',
    earthNote: 'Theorized on Earth as "ununennium." Every synthesis attempt since 2019 has failed. Here it crystallizes out of the ground.',
    note: 'Its 14-day half-life means Vesperine cannot be stockpiled — harvest it when you need it (see logistics & decay design).',
  },
  {
    symbol: 'Hc', z: 120, name: 'Halcium',
    group: 'Superheavy alkaline earth',
    halfLife: '~30,000 years (island of stability)',
    phase: 'Dense grey metal',
    density: '19.4 g/cm³',
    keyProperty: 'Thermal-shock immune to a degree no Earth alloy approaches. Hull plating, instrument housings, anything that must not crack.',
    origin: 'Brume — exposed core fragments on the storm-scoured ridges',
    earthNote: 'The first confirmed island-of-stability element. Earth predicted it for seventy years and never made a single atom.',
    note: 'A valid housing material for fabricated instruments.',
  },
  {
    symbol: 'Ch', z: 121, name: 'Chronium',
    group: 'Superactinide',
    halfLife: '9.2 years',
    phase: 'Translucent amber crystal',
    density: '12.8 g/cm³',
    keyProperty: 'Temporal refraction — photons crossing the lattice arrive 9 nanoseconds out of phase. An imager built around it sees time the way eyes see space.',
    origin: 'Cinder — grown in the cores of the Slow Choir. The life makes the element.',
    earthNote: 'No Earth theory predicted a stable-enough 121. No Earth theory predicted biology would be the thing synthesizing it.',
    note: 'The heart of the Temporal Imager — the cross-planet key to Vesper III.',
  },
  {
    symbol: 'Ub', z: 122, name: 'Umbrium',
    group: 'Superactinide',
    halfLife: '800 years',
    phase: 'Matte black powder',
    density: '15.2 g/cm³',
    keyProperty: 'Broadband electromagnetic absorption — 99.4% of incident radiation, radio through gamma. The quietest substance ever measured.',
    origin: 'Hush — the regolith is laced with it planet-wide',
    earthNote: 'Earth instruments would classify an Umbrium-rich world as a sensor malfunction.',
    note: 'The reason Hush reads as dead. The dark is not absence — it is material.',
  },
  {
    symbol: 'Le', z: 123, name: 'Levitine',
    group: 'Superactinide',
    halfLife: '60 years',
    phase: 'Iridescent foil',
    density: '0.9 g/cm³',
    keyProperty: 'Room-temperature diamagnetic superconductor — levitates in any planetary magnetic field.',
    origin: 'Brume — trace aerosol in the atmosphere; concentrated in Greeter float-bladders',
    earthNote: 'Earth spent a century hunting a room-temperature superconductor. On Brume, it rains out of thunderstorms.',
    note: 'Do not use as an instrument housing. It will leave.',
  },
  {
    symbol: 'Mi', z: 124, name: 'Mirium',
    group: 'Superactinide',
    halfLife: '22 years',
    phase: 'Amber gel (bound state)',
    density: '4.4 g/cm³',
    keyProperty: 'Autocatalytic mimicry — re-templates neighboring molecules into copies of any pattern it samples. The chemistry of imitation.',
    origin: 'Brume — the Greeters’ entire dermis is a Mirium gel',
    earthNote: 'Earth chemistry has self-replication. It does not have self-impersonation.',
    note: 'Keep away from molecules you are fond of.',
  },
  {
    symbol: 'Td', z: 125, name: 'Threnodine',
    group: 'Superactinide',
    halfLife: '140 years',
    phase: 'Smoky violet crystal',
    density: '9.7 g/cm³',
    keyProperty: 'Piezothermal — converts heat gradients directly into low-frequency acoustic vibration. Heat in, voice out.',
    origin: 'Cinder — the cores of the Slow Choir columns',
    earthNote: 'The Choir’s 61-minute song is this element, metabolized. Earth has no word for an instrument that is also an organ.',
    note: 'The voice of the first alien life humanity ever confirmed.',
  },
  {
    symbol: 'Ps', z: 126, name: 'Patiens',
    group: 'Superactinide — center of the island of stability',
    halfLife: 'Effectively stable',
    phase: 'Pale grey ceramic',
    density: '21.0 g/cm³',
    keyProperty: 'Deep-time stabilizer — tissue doped with Patiens exchanges almost no entropy with its surroundings. A thousand years pass like an afternoon.',
    origin: 'Hush — structural element of the Patient Ones',
    earthNote: 'Z=126 was Earth’s most-predicted undiscovered element. Nobody predicted it would be load-bearing in a nervous system.',
    note: 'The grail. Biology that breaks every model Halley was trained on.',
  },
];

// Inventory materials. Elements reference the table; composites do not.
export const MATERIALS = {
  chronium: {
    name: 'Chronium crystal', element: 'Ch',
    props: ['temporal-refraction'],
    desc: 'Amber lattice grown by the Slow Choir. Light leaves it 9 ns younger than it should be.',
  },
  basaltGlass: {
    name: 'Basalt glass', element: null,
    props: ['housing', 'thermal-shock-stable'],
    desc: 'Vitrified flow rock from Cinder. Ugly, honest, and very hard to crack.',
  },
  vesperine: {
    name: 'Vesperine salt', element: 'Vs',
    props: ['energy'],
    desc: 'Hyperredox energy salt. Decays in 14 days — use it or lose it.',
  },
  halcium: {
    name: 'Halcium plate', element: 'Hc',
    props: ['housing', 'thermal-shock-stable'],
    desc: 'Island-of-stability structural metal. Thermal-shock immune.',
  },
  levitine: {
    name: 'Levitine foil', element: 'Le',
    props: ['housing', 'superconductor', 'buoyant'],
    desc: 'Room-temperature superconductor. Mildly opposed to staying put.',
  },
  greeterChitin: {
    name: 'Greeter chitin (gift)', element: 'Mi',
    props: ['housing', 'mimetic'],
    desc: 'Iridescent curl of Mirium-rich shell, deposited at your feet on purpose.',
  },
  threnodine: {
    name: 'Threnodine shard', element: 'Td',
    props: ['acoustic'],
    desc: 'A sliver of the Choir’s voice. Warm to the touch. Faintly humming.',
  },
  umbrium: {
    name: 'Umbrium regolith', element: 'Ub',
    props: ['absorber'],
    desc: 'A handful of the quietest substance ever measured.',
  },
  patiens: {
    name: 'Patiens sample', element: 'Ps',
    props: ['deep-time'],
    desc: 'Shed ceramic tissue of a Patient One. It will outlast the star.',
  },
};

// The one cross-planet dependency the slice must prove:
// the Temporal Imager needs Chronium (Cinder) to perceive life on Hush.
export const IMAGER_RECIPE = {
  name: 'Temporal Imager',
  slots: [
    { id: 'lens', label: 'Phase lens', requires: 'temporal-refraction', hint: 'Needs a material that refracts light through time itself.' },
    { id: 'housing', label: 'Instrument housing', requires: 'thermal-shock-stable', hint: 'Needs a housing that survives the thermal shock of temporal compression.' },
  ],
};
