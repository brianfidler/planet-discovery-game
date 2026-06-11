# System: Planet Generation

## Principle: causal, not combinatorial

Do not roll dice on traits. Simulate the *causes* and let properties emerge. A world
is the way it is because of how it formed. This is the single biggest thing
separating a memorable proc-gen game from a forgettable one — and it makes the
chemistry/biology downstream feel earned rather than arbitrary.

## The causal chain (target model)

```
star type ──► protoplanetary disk composition ──► accretion order & distance
   ──► planet bulk composition ──► differentiation (core/mantle/crust)
   ──► outgassing & atmosphere ──► temperature/pressure regime
   ──► available chemistry ──► possibility space for life
```

Each stage constrains the next. The same model extends to **moons, stars, and
asteroids** — they're nodes in the same formation history, which is also what makes
cross-body resource relationships feel natural.

## The realism vs. interestingness tension (decide early)

Pure causal simulation generates a lot of boring rocks. Two philosophies:
- **Realism:** most worlds are dull; life is rare and meaningful when found.
- **Density of experience:** every system has something worth investigating.

These are *different games*. Likely answer: bias the *sample* the player encounters
(mission targeting, weighting toward eventful systems) without breaking the
simulation's internal integrity. Decide the dial position deliberately.

## Expanded periodic table

Novel elements beyond the real table. The trap: elements as flavorless stat blocks
("+15% terraforming"). The fix: give them **real simulated properties** (bonding
behavior, phase transitions, conductivity, reactivity, stability/half-life) so that
*learning the chemistry literally unlocks the tech tree* via fabrication. The heaviest
synthetic elements being the least stable is scientifically honest and a natural
balancer (see logistics/decay doc).

## For the vertical slice

The generator need not be fully general. Hand-tune or seed 3 planets in one system
that showcase variety and support the one required cross-planet dependency. Build the
causal model properly later; fake what you must now.

## Open questions

- Where exactly to sit on the realism/density dial.
- How deep the chemistry simulation goes before it's diminishing returns.
- How much of the formation history is *visible* to the player as discoverable
  knowledge (it should feed the "understand the world" fantasy).
