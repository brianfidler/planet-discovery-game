# Planet Discovery Game (working title)

> A scientific exploration game about finding — and learning to recognize — alien
> life across a universe of simulated worlds. You go to the stars as a scientist,
> discover life is nearly everywhere, and learn that the real limit was never the
> universe — it was human perception. The journey ends at home, seeing the life
> that was always here.

This folder is the **design foundation** for the game. It is documentation and
planning, not yet a Unity project. It is structured so you can:

1. Read and refine the vision (start with `docs/VISION.md`).
2. Resolve the open decisions that are still genuinely yours to make
   (`docs/OPEN-DECISIONS.md`) — most importantly the **narrative tone (A/B/C)**.
3. Hand the whole `docs/` folder to **Claude Code** to scaffold the actual Unity
   project once the vertical-slice spec is locked.

## What's decided vs. what's open

**Locked design pillars** (see `docs/VISION.md` and `docs/systems/`):
- Causal/systemic planet generation (simulate causes, let properties emerge)
- Life you must learn to *perceive* — sensors as senses, tiered discovery
- Halley: a fallible AI partner trained on a universe it has left behind
- Two visual languages: handcrafted "human/known" vs. sensor-rendered "alien/unknown"
- Properties-based fabrication puzzles (not arbitrary recipes)
- Cross-planet resource dependencies + autonomous drones + half-life timing
- The Earth-return revelation as the emotional climax

**Still open** (see `docs/OPEN-DECISIONS.md`):
- The narrative frame / tone — the keystone decision, A/B/C, currently leaning B+C
- Interaction model, stakes & failure, progression spine, communication mechanic
- Your real-world constraints (hours/week, runway) — scope depends on this

## Folder map

```
Planet Discovery Game/
├── README.md                     ← you are here
├── docs/
│   ├── VISION.md                 ← the concept, pillars, tone, references
│   ├── OPEN-DECISIONS.md         ← the worksheet to fill in before a PRD
│   ├── VERTICAL-SLICE.md         ← scope of the first playable demo
│   ├── NARRATIVE.md              ← story frame, arc, Halley, the three tonal options
│   ├── systems/
│   │   ├── planet-generation.md
│   │   ├── perception-and-discovery.md
│   │   ├── halley-ai.md
│   │   ├── materials-and-fabrication.md
│   │   ├── logistics-drones-decay.md
│   │   ├── art-direction.md
│   │   └── audio.md
│   ├── marketing/
│   │   └── landing-page-copy.md
│   └── plans/                    ← (empty) Claude Code implementation plans go here
```

## Important note on scope

Everything in `docs/systems/` describes the **full long-term vision**. The
**vertical slice** (`docs/VERTICAL-SLICE.md`) is a deliberately tiny subset of it.
Do not build the systems docs directly — build the slice, prove the core loop,
then expand. The systems docs exist so the slice is built with the destination
in mind, not so they're all implemented at once.
