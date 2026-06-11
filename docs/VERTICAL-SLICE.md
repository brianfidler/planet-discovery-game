# Vertical Slice

The bridge from "great idea" to "I'm a developer making this." A tiny, complete
experience true to the soul of the full game. **Everyone who skips this fails to ship
anything.** Build this, prove the loop, then expand.

## The one feeling it must deliver (north-star)

> You switch to the right sense, and life that was invisible a second ago lights up
> in front of you.

If the slice nails that single beat, the concept is proven. Everything else serves it.

## In scope

- **One star system, 3 planets**, causally generated but can be hand-tuned/seeded for
  the demo (the generator need not be fully general yet).
- **Halley in basic form** — fallible hypotheses with confidence levels; the diegetic
  teacher; one or two genuine "confidently wrong" moments.
- **One core sensor mechanic** — switching to a non-default sense (e.g. thermal or
  spectral) reveals life invisible in the default view. This is the heart.
- **3–4 hand-authored life forms** across the planets, in the sensor-rendered art
  style, tuned to the discovery tiers (a trace biosignature; a confirmed simple life;
  one "complex"/surprising find).
- **One genuine cross-planet dependency** — a tool needed for planet C requires a
  material found only on planet A/B, proving the "press onward to unlock" feeling
  with minimal machinery.
- **Basic fabrication** as a properties-match (even if just one or two tools).
- **Two visual languages** present even if rough: a handcrafted ship interior / hub
  vs. the sensor-rendered alien exterior.
- **~2 hours of gameplay max.**

## Explicitly NOT in the slice

- Translation / first contact (design later)
- Drone logistics network + half-life decay timing
- Procedural creature *generator* (hand-author instead)
- Terraforming
- Expanded periodic table as a full system (fake the few materials you need)
- Credibility/accolade meta-progression
- The Earth-return sequence (it's the ending; reference it, don't build it yet)

## Success criteria

- A new player understands what to do within ~15 minutes, taught by Halley.
- The "switch sense → life appears" beat lands as a genuine *oh!* in playtests.
- The build is crash-free across many seeds (see testing approach below).
- At least one playtester unprompted describes the discovery moment as exciting.

## Rough timeline

Given prior shipping experience (Solo Acquire) + AI assistance: ~6–12 months solo.
The non-compressible half is iteration — playtesting, tuning, polish. AI can't carry
much of that load.

## Architecture principles to honor from day one

- **Separate the simulation layer from presentation.** Chemistry, generation,
  fabrication, discovery logic live in clean, testable C# with no rendering deps.
  This is what makes both automated testing and later expansion possible.
- **Seed + state serialization** from the first commit.
- **Accessibility (esp. colorblind) cues** designed in, not retrofitted.

## Testing approach (build the harness early)

- Unit tests on the deterministic core.
- Property-based tests on the generator — most important invariant: **every generated
  universe is solvable** (always a valid material path to required tools). Defends
  against soft-locks.
- Fuzzing / "monkey" agents across thousands of seeds for crashes/glitches.
- Heuristic "completionist" bots to catch soft-locks and balance issues.
- (RL/LLM-driven agents = overkill for now.)
- Remember: **agents find bugs, not fun.** Humans must validate that discovery feels
  wondrous. The agents are the unglamorous safety net, never a substitute for play.
