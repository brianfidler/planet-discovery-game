# Open Decisions

The keystone is **the narrative key (A/B/C)** in `NARRATIVE.md`. Resolve that first;
most of the below falls out of it. For each item: the question, the option-space, and
a lean to react against. Where a lean is marked *(yours)*, it's a taste call the
developer should own.

If you only go deep on two before drafting a PRD, make them **#2 (stakes)** and
**#6 (tone/frame)** — the genuine taste decisions that color everything else.

---

### 1. Interaction model — what you physically do, and from what viewpoint
- Options: first-person on foot w/ toggleable sensor modes; third-person; top-down.
- Lean: first-person on foot; travel via star-map interface (not manual piloting —
  huge build cost, not where the value lives). Tiny verb set: move, look, switch
  sense, scan/sample, fabricate.

### 2. Stakes and failure — where you sit on cozy ↔ tense, and what's lost *(yours)*
- Options: cozy (no death; failure wastes time/resources); moderate (lose materials/
  a drone/forced retreat; no permadeath); survival-tense (you can die).
- Lean: cozy-to-moderate. Tension from *losing investment*, not dying. Optional
  harder mode later.

### 3. Slice north-star + explicit "not now" list
- Proposed north-star: **switch to the right sense, and life that was invisible a
  second ago lights up in front of you.**
- Proposed slice cuts: no translation, no drone network, no procedural creature
  generator (hand-author 3–4 life forms), no terraforming, no logistics web.

### 4. Communication / translation — what the player actually does at first contact
- Options: linguistic-puzzle (build a lexicon); signal-and-response (observe,
  hypothesize, test); Halley-mediated (it proposes, you confirm/correct).
- Lean: signal-and-response with Halley's fallible hypotheses — reuses existing loops
  so communication is a *special case of discovery*. Out of the slice.

### 5. Progression spine + ending
- Options: open sandbox; authored arc; hybrid (open exploration + narrative spine).
- Lean: hybrid with an authored ending (the Earth reveal *is* the ending). Advance
  mainly by *capability*; credibility/accolades secondary.

### 6. Narrative frame, tone, ethics — why you're out here & whether choices weigh *(yours)*
- Frame: curiosity/golden-age ↔ necessity ↔ between. Ethics: none / soft (felt, not
  punished) / hard (tracked consequences).
- Lean (loose): mostly hopeful frame with a quiet undercurrent; *soft* ethics where
  terraforming over undetected life carries emotional weight, not a fail state. This
  is the call to most make your own.

### 7. Audio — commitment + direction
- Options: ambient generative soundscapes per world; score reserved for key beats;
  sound-as-gameplay (each sense sounds different; life has audio signatures).
- Lean: all three. Budget one good composer or quality library early. Audio is a
  pillar, not a late task.

### 8. Onboarding — how a newcomer learns this without drowning
- Options: Halley teaches diegetically one system at a time; dedicated tutorial level;
  contextual learn-by-doing.
- Lean: Halley as diegetic teacher, one capability per beat. The teaching *is* the
  early game.

### 9. Save / accessibility / architecture — principles + one flag
- Commit to: seed + state serialization from day one; an assist philosophy (Halley
  can auto-suggest/auto-solve for lighter play); simulation-layer separation as
  architecture law (also what makes automated testing possible).
- **Critical flag:** colorblind accessibility is load-bearing *for this game* — the
  aesthetic is false-color sensor views. Never distinguish life by color alone; use
  shape, motion, or pattern cues too, from the start. Painful to retrofit.

---

### 10. Real-world constraints — *not a design question, but it gates scope*
- Hours per week available? Runway (months you can sustain this)?
- This shapes slice scope more than anything else — the difference between a 6-month
  and an 18-month slice. A PRD untethered from a real time budget is how solo
  projects quietly balloon.
