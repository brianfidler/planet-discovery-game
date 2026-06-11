# System: Halley (the AI partner)

## Name

**Halley** — a nod to both HAL 9000 and astronomer Edmond Halley. The HAL reference
carries baggage (players half-expect betrayal); you can either defuse it or lean into
it as a self-aware theme ("we named it Halley knowing the joke, and it knows too").
Edmond Halley is apt: known for predicting *recurrence* and pattern recognition — a
fit for an AI whose job is informed guesses about returning signals.

## The core design move: fallibility

Most games treat AI helpers as oracles. Halley is a **character with real epistemic
limits** — it can be confidently wrong, and it learns alongside the player. This is
the more honest projection of what an AI in this setting would actually struggle with,
and it's a signature feature.

### Failure modes (specifically human-derived)
- Pattern-matches new life to Earth analogues; misses things outside its priors.
- Occasionally anthropomorphizes.
- Its training was the universe it has now *left behind* — new elements and worlds are
  as new to it as to the player.

## How it should behave

- **Hypotheses with confidence, not answers:** "Biological communication at 40%;
  geological resonance at 35%." The player designs experiments to disambiguate;
  results refine Halley's model.
- **Narrows the space, proposes, but you decide.** Calibration is the whole game:
  hand over the answer and there's no puzzle; make it useless and why have a partner?
  Sweet spot = it scopes the problem and offers ranked, confidence-tagged candidates;
  you make the call and live with it.
- **Learns over time:** characterized materials/worlds become confident; genuinely new
  things reintroduce uncertainty. This naturally concentrates challenge at the frontier
  of knowledge — exactly where a science game's difficulty should live.

## Trust as a mechanic (optional depth)

If Halley can be wrong, acting on its judgment carries weight. Calling a world lifeless
because its signature library doesn't recognize the local life — then terraforming —
gives moral stakes. Tone-dependent (see narrative); the option is there.

## Halley and Earth

Having learned alongside the player, Halley begins recognizing patterns in *Earth*
life that contradict its original training — the confidently human-trained AI becomes
productively destabilized. A strong character beat that reinforces the theme: even our
"objective" tools are shaped by what they've seen before.

## Halley as teacher

Halley is the natural diegetic onboarding voice — introduce one capability per beat,
so the teaching *is* the early game rather than a bolted-on tutorial.

## For the vertical slice

Basic form: confidence-tagged hypotheses, the teaching voice, and one or two genuine
"confidently wrong" moments the player can catch. No need for the full learning model
yet — but write Halley's voice deliberately; it's the emotional spine.
