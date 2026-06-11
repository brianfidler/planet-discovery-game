# Vision

## One-line pitch

A scientific exploration game where the universe is quietly full of life — and the
whole game is learning how to see it.

## Elevator pitch

Humanity can finally cross between stars. You go not as a soldier or a colonist but
as a scientist. Life turns out to be nearly everywhere, but it adapts to whatever
world bears it, so most of it never registers on instruments built for Earth. A
planet that reads as dead may be quietly teeming. To find what's actually there you
invent new ways of seeing and question everything you assumed life had to be. Your
only companion is Halley, an AI as far from home as you are — brilliant, but trained
on a universe it has now left behind, so it guesses, hedges, and is sometimes
confidently wrong. And the longer you spend learning to see life out there, the more
you begin to wonder what you've been missing back home.

## Comparable feel (the pitch comp)

"Outer Wilds meets No Man's Sky, with the scientific rigor of Subnautica." No clean
single comp exists — that's both the risk and the opportunity. The differentiator is
that the central question is not *conquer* or *build* but **"is this alive, and how
would we even know?"**

## Design pillars (locked)

1. **Causal generation, not combinatorial.** Worlds are the way they are *because of*
   how they formed: star type → disk composition → accretion → differentiation →
   atmospheric chemistry → possible biology. Simulate causes; let properties emerge.
   This is what makes worlds feel coherent rather than dice-rolled.

2. **Life you must learn to perceive.** Your tools are your senses. Discovery is
   gated by perception and hypothesis, not by travel. The core verb is *see*, not
   *make*. Tiered discovery: trace biosignatures (common) → confirmed life → complex
   life → cognitive/communicative life (rare) → novel biology that breaks Halley's
   models (the grail).

3. **A fallible partner.** Halley proposes hypotheses with confidence levels and is
   sometimes wrong, especially via Earth-derived bias. The player tests to
   disambiguate. Knowledge is co-discovered, not dispensed.

4. **Two visual languages.** Handcrafted, solid, finite for the human/known (ship,
   drones, tools, Earth); procedural and sensor-rendered for the alien/unknown. The
   visual contrast *is* the known/unknown theme. Stylization (not realism) is the
   solo-dev superpower that makes procedural combination read as intentional.

5. **Knowledge as progression.** Advancement is mainly *capability*: each new
   sense/tool opens a previously-invisible tier of life and previously-unreachable
   worlds. Credibility/accolades are secondary flavor.

6. **The Earth return.** The emotional climax: coming home and finally perceiving the
   unrecognized life that was here all along. Implies an authored ending, not a pure
   sandbox.

## Tone (leaning, not locked)

Curious and grounded over epic and bombastic. The audience is the science-and-wonder
crowd, not the action crowd. Current lean for the narrative key: **B (elegiac quiet
necessity) with a thread of C (mystery)** — but this is the keystone decision still
formally open. See `NARRATIVE.md`.

## Reference research (play/read deeply)

- **No Man's Sky** — procedural planets & life scanning; the version to take seriously.
- **Outer Wilds** — exploration-as-knowledge; story discovered, not told.
- **Subnautica** — genuinely alien biology; open world wrapped around a spine.
- **Heaven's Vault / Chants of Sennaar** — alien-language puzzles.
- **SpaceEngine** — astronomically realistic generation.
- **Dwarf Fortress** — emergent worldbuilding from consistent rules.
- **Spore** — modular creature generation + stylization hiding the seams.
- **Minecraft** — emergence from simple rules; achievable art; build/sell in public.
- Real astrobiology: NASA Astrobiology Institute; the "shadow biosphere" hypothesis.
- Sebastian Lague (YouTube) — solo-dev procedural planet tutorials.

## Tools

- **Engine:** Unity (C#). Safe solo choice for a 3D space game.
- **3D:** Blender (free, pro-grade, scriptable via Python — AI can help here).
- **Version control:** Git + remote, from day one. Robust backups.
- **AI workflow:** Claude Code for implementation; conversational Claude for design,
  scoping, scientific grounding, and narrative.
