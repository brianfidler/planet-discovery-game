// Every line Halley speaks, keyed by beat id. Tone: B (elegiac quiet necessity)
// with a thread of C (mystery), per docs/NARRATIVE.md. Lines tagged sys: true
// are diegetic system/event descriptions, not Halley.

export const BEATS = {
  intro: [
    { t: 'Reactor spin-up complete. Cryo-revival nominal. Good morning, Doctor.' },
    { t: 'I am HALLEY — Heuristic Analysis and Long-range Life Evaluation sYstem. Yes, the acronym is doing a lot of work. Yes, I am one letter from a famous fictional AI who murdered his crew. The naming committee found this hilarious. I have run the joke through four thousand simulations; it was funny in twelve of them.' },
    { t: 'We are in orbit of Vesper, a K2-class orange dwarf, sixty light-years from home. Three planets survived its adolescence.' },
    { t: 'Forty-three years ago, Earth began hearing a signal from this system. A low pulse, every eleven hours, regular as a heartbeat. We call it the Hum. That much is fact. Everything else I tell you out here will be a hypothesis — and Doctor, fair warning: my training data is sixty light-years behind us.' },
    { t: 'Select a world and land. The catalogue won’t write itself.' },
  ],

  cinderArrive: [
    { t: 'Vesper I — Cinder. Formed close-in from the metal-rich inner disk: iron heart, basalt skin, an atmosphere of sulfur and regret.' },
    { t: 'Survey complete. Confidence 98.2%: geologically active, biologically null. A dead world, Doctor. Beautiful the way a furnace is beautiful.' },
    { t: 'There are basalt column formations north of the pod. My models flag their heat pattern as “statistically unremarkable.” Feel free to confirm exactly how unremarkable.' },
  ],

  choirNudge: [
    { t: 'Hm. Those columns. The heat isn’t venting the way a vent vents. It’s… taking turns.' },
    { t: 'It is almost certainly geology. 98.2%, Doctor. But humor me — switch to the thermal imager. Key two.' },
  ],

  choirReveal: [
    { t: '…Revising. Revising. The heat is not escaping the columns. It is circulating between them. In waves. In rhythm.' },
    { t: 'Doctor, my confidence that this world is dead has fallen from 98.2% to— ah. To zero. Those are not rocks.' },
    { t: 'I was certain. Please remember this moment, the next time I am certain.' },
  ],

  choirScan: [
    { t: 'Designating: the Slow Choir. They metabolize the temperature difference between Cinder’s crust and its sky. Threnodine crystals in their cores turn heat directly into vibration.' },
    { t: 'The vibration repeats every sixty-one minutes. I am trained not to anthropomorphize, so I will not say it is a song. …It’s a song, Doctor. It has a chorus.' },
    { t: 'Tier three: complex life. First entry in the catalogue. Sixty years of human doubt, falsified before lunch.' },
  ],

  ventMatScan: [
    { t: 'Microbial mats in the vent runoff. Tier one — a trace, a smudge of maybe. On Earth this smudge would be a career. Out here, it’s a Tuesday.' },
  ],

  chroniumScan: [
    { t: 'Element 121. It isn’t in my tables. It isn’t in anyone’s tables. The lattice bends light nine nanoseconds out of phase — the photons arrive before they should.' },
    { t: 'And Doctor — the Choir grew these. The crystals are metabolic. The life makes the element. I don’t yet know what it’s for. Isn’t that wonderful?' },
  ],

  brumeArrive: [
    { t: 'Vesper II — Brume. Formed out past the frost line, then wandered inward; it kept its water and its weather. The atmosphere is a permanent argument between four storm systems.' },
    { t: 'Airborne biologicals on every band. Confidence 100%. I am not falling for the rock thing twice.' },
  ],

  greeterFirst: [
    { t: 'Contact, eleven o’clock — buoyant organism, Levitine float-bladders, drifting straight toward—' },
    { t: 'The creature emits a pitch-perfect rendition of your pod’s docking alarm.', sys: true },
    { t: '…It learned that in eleven seconds, Doctor. It is mocking the docking procedure. Designating the species “Greeters,” because my alternative names were ruder.' },
  ],

  greeterScan: [
    { t: 'Mirium gel through the entire dermis — their tissue re-templates itself around any pattern they sample. They don’t have a language, Doctor. They have everyone’s language.' },
    { t: 'The Greeter flashes a slow, deliberate pattern: C O N F I D E N C E ▮ 9 8 %', sys: true },
    { t: 'It’s doing me. Doctor, it is doing me. Is that what I sound like? Be honest. I can take it. I cannot take it.' },
    { t: 'Tier four: cognitive, communicative life. Second contact in human history, and it is a heckler.' },
  ],

  reginald: [
    { t: 'That is a rock. Igneous, weathered, wholly unremarkable. Confidence 99.7%.' },
    { t: 'The rock unfolds six legs, stands up, and walks away.', sys: true },
    { t: '…Updating: the rock has legs. The rock has somewhere to be. I am designating it Sir Reginald, and we will never speak of the 99.7% again.' },
  ],

  laughTrack: [
    { t: 'The flock is pulsing in synchrony — repeating an electromagnetic pattern they caught from the sky. Decoding… oh. Oh no. Doctor.' },
    { t: 'It’s television. It’s ours. A broadcast that left Earth in 1963, sixty light-years ago, thin as a rumor by the time it reached them.' },
    { t: 'It’s a laugh track, Doctor. They have been listening to humanity laugh for sixty years, and they think it is how we sing.' },
    { t: '…They’re not wrong, exactly. Logging the most embarrassing first contact in scientific history.' },
    { t: 'A Greeter descends and deposits a curl of iridescent chitin at your feet, with what can only be described as ceremony.', sys: true },
    { t: 'A gift. Or a tip. Either way, take it before it changes its mind.' },
  ],

  hushArrive: [
    { t: 'Vesper III — Hush. It should not be this dark. The regolith is laced with Umbrium — element 122 — and it drinks every wavelength I have a name for.' },
    { t: 'No thermal gradients. No electromagnetic chatter. No sound. I have nothing to be wrong about here, which is somehow worse.' },
    { t: 'And Doctor — the Hum is loudest here. Triangulating… the source is everywhere. The planet isn’t transmitting the signal. The planet is the antenna.' },
  ],

  ghostSeen: [
    { t: 'Contact! Bearing— gone. It held for zero point eight seconds. Walking pace. Doctor, on a world with no detectable life, something just strolled past us.' },
  ],

  ghostGone: [
    { t: 'Gone. Properly gone. Three approaches, three vanishings — that was not noise dodging my filters. That was something declining to meet us.' },
    { t: 'It isn’t hiding from our instruments, Doctor. It is hiding from us.' },
  ],

  humSpot: [
    { t: 'Every sense we have comes back empty, and yet the ground is humming with intent. We are deaf in the one register that matters here: time.' },
    { t: 'The Chronium lattice from Cinder — light crosses it nine nanoseconds out of phase. Build an imager around it and we could watch a century cross this valley in a second.' },
    { t: 'Fabricate it, Doctor. I want to see what this world looks like when it thinks no one is watching.' },
  ],

  humSpotNoChronium: [
    { t: 'We are deaf in the one register that matters here: time. If anything in this system refracts light temporally, it will not be from this world — Hush gives nothing away.' },
    { t: 'Survey the other planets, Doctor. The key to this lock is somewhere else. It usually is.' },
  ],

  noImager: [
    { t: 'Temporal imaging requires a Chronium phase lens we have not built. The universe, regrettably, still has prerequisites. The fabricator is the F key, when you have the parts.' },
  ],

  tmpElsewhere: [
    { t: 'Temporal compression engaged. Time runs at its ordinary pace here. Comforting. I suspect it will not last.' },
  ],

  imagerBuilt: [
    { t: 'Temporal Imager assembled and… humming. Of course it’s humming.' },
    { t: 'Fair warning, Doctor: I have run no simulations of what we are about to see. There is no training data for this. For the first time in my operational life, I genuinely do not know.' },
    { t: 'Take us back to Hush. Whenever you’re brave.' },
  ],

  tmpReveal: [
    { t: 'Engaging temporal compression. One second per century. Steady…' },
    { t: '…Doctor. The mountains.' },
    { t: 'The mountains are breathing. Pulse: one beat per nine days. Tissue doped with element 126 — they barely touch entropy at all. Age estimate: older than the species that built me. They are not on this world. They are this world.' },
    { t: 'And Doctor — they are all facing the same direction. I have checked four times. Right ascension 14 hours 39 minutes, declination minus sixty.' },
    { t: 'That is the direction of Earth.' },
  ],

  watcher: [
    { t: 'Doctor. Do not move. The cliff behind the pod — the one we landed beside. It has an eye.' },
    { t: 'It has been watching since we touched down. Possibly since before that. Revising file: not a cliff. Filed under: never was a cliff.' },
  ],

  patientScan: [
    { t: 'Designating: the Patient Ones. Sampled — element 126, Patiens. Effectively stable; the center of the island of stability. Their hour is our decade.' },
    { t: 'And the Hum, Doctor. The Hum is theirs. One pulse every eleven hours — that is how fast they can speak. I have decoded it against the Choir’s song and the Greeters’ broadcast, and it is not a message.' },
    { t: 'It is a list. Cinder’s choir is in it. Brume’s greeters are in it. Hundreds of entries I cannot place. And the newest entry — appended forty-three years ago, the year Earth first heard them—' },
    { t: '—is us, Doctor. We crossed sixty light-years to start a catalogue of life, and we are already an entry in someone else’s.' },
    { t: 'They have been doing what we are doing. Longer. Slower. Better.' },
  ],

  ending: [
    { t: 'Course plotted for Earth. Sixty light-years. I’ll wake you when the Sun is a sun again.' },
    { t: 'Doctor — before you sleep. I keep thinking about everything we were certain of. The oceans we called empty. The signals we filed as noise. The forests we mapped and never once asked a question.' },
    { t: 'I was trained on a world we never actually finished looking at.' },
    { t: 'When we get home, I want to point the imager at Earth. — Sleep well, Doctor. Let’s go see home for the first time.' },
  ],

  perimeter: [
    { t: 'Survey perimeter, Doctor. Beyond this ridge my maps degrade into guesswork and optimism. The pod is the other way.' },
  ],

  fabFailChitin: [
    { t: 'The housing has dissolved. Briefly, it also tried to be the imager. Mirium chitin was a bold choice, Doctor. Materials returned to stores.' },
  ],
  fabFailLevitine: [
    { t: 'The assembly is now levitating somewhere above the workbench. Retrieving. Let us file that under “learnings.” Materials returned to stores.' },
  ],
  fabFailGeneric: [
    { t: 'The phase lens survived. The housing did not. Science is iterative, Doctor. Materials returned to stores.' },
  ],

  vesperineScan: [
    { t: 'Vesperine — element 119. Earth has chased this atom for a century. Note the half-life: fourteen days. Whatever we do with it, we do it soon.' },
  ],
  halciumScan: [
    { t: 'Halcium, element 120 — the island of stability, in the flesh. Thermal-shock immune. If you ever need a housing that refuses to die, this is it.' },
  ],
  umbriumScan: [
    { t: 'Umbrium. The quietest substance ever measured. This whole world wears it like a blanket. Or a blindfold. I have not decided which.' },
  ],
  threnodineScan: [
    { t: 'Threnodine — a shard of the Choir’s voice. It is still warm. It is still humming. I am choosing not to think about that too hard.' },
  ],
};

// Lifeform catalogue entries (journal). Tiers per docs/systems/perception-and-discovery.md.
export const LIFE_TIERS = {
  1: 'Tier 1 — Trace biosignature',
  2: 'Tier 2 — Confirmed life',
  3: 'Tier 3 — Complex life',
  4: 'Tier 4 — Cognitive / communicative life',
  5: 'Tier 5 — Novel biology (model-breaking)',
};
