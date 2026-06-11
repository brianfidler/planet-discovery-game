# System: Art Direction

## Two visual languages (locked)

- **Handcrafted / known:** ship, drones, tools, instruments, Earth. Solid, consistent,
  finite, knowable. Hand-authored once (bounded set — no procedural variety needed).
- **Sensor-rendered / unknown:** alien life and exotic phenomena. Procedural,
  abstracted, perception-rendered, never quite fully resolved.

The visual contrast **is** the epistemological contrast (human vs. alien, known vs.
unknown). Stepping from the handcrafted ship into the sensor-rendered world *is* the
feeling of crossing from what you understand to what you don't.

### Why the split is more than convenience
- The two registers need each other: abstraction only reads as *strange* against
  something familiar. The cozy, readable ship anchors the unknown and gives it weight.
- **The Earth-reveal payoff:** since home/ship live in the handcrafted "known"
  language all game, the climax is literally the *alien* perception aesthetic bleeding
  into the *familiar* handcrafted world — "I've been blind my whole life," rendered in
  the art. The two languages collide in the one place that was supposed to be safe.

## Stylization is the solo-dev superpower

Combining *realistic* parts procedurally looks broken — every seam screams, because
realism promises "this is real" and the eye instantly catches the violation (uncanny
valley). Combining *stylized* parts reads as *intentional* — there's no fine detail to
misalign, and an obviously deliberate style makes oddness read as a design choice, not
a bug. (Spore is the proof: absurd combinations work *entirely* because of the soft
claymation style. A photoreal version would look like a morgue.)

So: a bold, consistent art direction **hides the seams and turns the solo-dev
constraint into an identity** (cf. Minecraft blocks, Monument Valley, Journey — each
cheap relative to realism AND the thing people remember).

## The perception aesthetic = thematically perfect AND technically ideal

Render life the way it appears *through instruments*: thermal false-color, spectral
signatures, EM glow, schematic outlines in the dark. This is:
- **on-theme** — puts the central mechanic on screen every frame;
- **the most seam-forgiving style imaginable** — a glowing thermal silhouette has no
  surface textures to mismatch; the abstraction swallows procedural jank.
The thematically perfect choice and the practically smartest choice are the same
choice. Build around it.

## Modular creature generation (later phase)

Break life forms into atomic components recombined procedurally (how NMS does
creatures). **Catch:** parts must be *designed to combine* — shared skeletons,
consistent attachment points, matching scale/style. You cannot bolt together unrelated
existing models (that's the uncanny mismatch). A *coherent* modular system is itself
the hard art-tech problem, not a shortcut. The stylized sensor aesthetic is what makes
it tractable.

## Consistency caveat

Design the two styles as deliberate counterparts, not two games fused — share some
logic of lighting/color so the contrast reads as intentional rather than inconsistent.

## Tools

- **Blender** for 3D (free, pro-grade, Python-scriptable — AI can help with scripting,
  procedural generators, batch ops). Not 3ds Max/Maya (studio prices, no solo benefit).
- AI 3D generation (Meshy/Tripo/Rodin/etc.) is useful for *concepting/base meshes*, not
  game-ready assets (messy topology, redo UVs, no style coherence). Re-check the tool
  landscape when you reach this stage — it moves monthly.
- Don't try to out-fidelity No Man's Sky. Win on a look only your game could have.

## For the vertical slice

Both languages present even if rough: a handcrafted ship/hub interior vs. the
sensor-rendered alien exterior. Hand-author the 3–4 life forms in the perception style;
no procedural creature generator yet.
