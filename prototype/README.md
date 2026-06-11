# THE CATALOGUE — Vertical-Slice Prototype

A playable 3D prototype of the Planet Discovery Game, built per `docs/VERTICAL-SLICE.md`.
Zero build step: vanilla JS modules + Three.js from CDN.

## Run it

```
cd prototype
npx serve .
```

…then open the printed URL (usually `http://localhost:3000`). Any static server works
(`python3 -m http.server` too). It must be served over HTTP — ES modules don't load
from `file://`. Needs network access for the Three.js CDN on first load.

## Controls

| Input | Action |
|---|---|
| Click planet → **Land** | Travel (star map) |
| **WASD** + mouse | Walk / look (click to capture the mouse) |
| **1–4** | Switch sense: Visual / Thermal / EM field / Temporal |
| **Hold E** | Scan / sample what's under the crosshair |
| **G** or **M** | Return to orbit |
| **X / J / F** | Elements chart / Journal / Fabricator |
| **⏎** | Advance dialogue |

## Why this isn't Unity (yet)

The design docs target Unity for the full game. This prototype exists to prove the
**north-star beat** — *switch to the right sense, and life that was invisible a second
ago lights up* — in the cheapest possible medium, before committing to engine work.
Everything here (planet data, narrative beats, element properties, the discovery-tier
model) is data-driven and ports directly into C# ScriptableObjects.

## What the slice proves (mapping to docs)

- **One system, 3 hand-tuned planets** with causal formation stories — Cinder, Brume, Hush.
- **Sensor toggle as the core verb** — the Slow Choir is invisible until Thermal; the
  Patient Ones are invisible until Temporal. Detection rarity > presence rarity: Hush
  reads dead until you return with a better instrument.
- **Fallible Halley** — two genuine confidently-wrong moments the player catches
  ("98.2% biologically null"; Sir Reginald, the rock that walks).
- **One real cross-planet dependency** — the Temporal Imager needs Chronium, which only
  exists on Cinder (grown by the Choir), to perceive life on Hush.
- **Properties-match fabrication** — slots demand *properties*, not recipes; wrong
  housings fail legibly and hilariously; materials are never lost.
- **Expanded periodic table** — the Vesper Extension (Z 119–126), each element with
  simulated properties tied to a lifeform or mechanic, highlighted as NOT FOUND ON
  EARTH with Theorized → Detected → Sampled progression.
- **Two visual languages** — handcrafted pod + clean HUD (known) vs. procedural
  sensor-rendered terrain and life (unknown).
- **Tone B + thread of C** — diminished Earth subtext, the Hum mystery engine, and an
  ending that points the whole game home.
- **Discovery tiers** — trace mats (T1), Sir Reginald (T2), the Choir (T3), the
  Greeters (T4), the Patient Ones (T5, model-breaking), plus one entry that
  *declines to be catalogued*.

## The emotional beats (spoilers)

- **Wonder** — the Choir reveal on Cinder: dead rocks become a thermal song.
- **Hilarity** — Brume: the Greeters mock the docking alarm, impersonate Halley,
  and replay a 1963 Earth laugh track they think is how we sing; Sir Reginald.
- **Fear** — Hush: a contact that *declines to meet you*, then the Temporal reveal —
  the mountains are breathing, they are all facing Earth, and the cliff you parked
  next to has an eye.
- **The twist** — the Hum is a catalogue, and humanity is its newest entry.

## Accessibility note (per docs)

Life is never indicated by color alone — every reveal also uses motion (pulsing,
breathing, cascading waves) and shape, and all sensor modes are text-labeled.

## Not in the slice (by design)

Translation mechanics, drone logistics, decay timers, procedural creatures,
terraforming, the Earth-return sequence itself (the end card references it).
