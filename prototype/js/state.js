// Central game state + a tiny event bus. Simulation state lives here,
// presentation reads it — keeping the two layers separable per the docs.

export const state = {
  mode: 'title', // 'title' | 'system' | 'surface'
  planet: null, // planet id while on surface
  sensor: 'VIS',
  discoveries: [], // { id, name, tier, planet }
  inventory: [], // material ids
  visited: new Set(), // planet ids
  flags: new Set(), // narrative beats already fired
  imagerBuilt: false,
  ended: false,
};

const listeners = new Map();

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(fn);
}

export function emit(event, payload) {
  const fns = listeners.get(event);
  if (!fns) return;
  for (const fn of fns) fn(payload);
}

// Returns true the FIRST time a flag is set — narrative beats fire once.
export function flagOnce(name) {
  if (state.flags.has(name)) return false;
  state.flags.add(name);
  return true;
}

export function hasFlag(name) {
  return state.flags.has(name);
}

export function addDiscovery(d) {
  if (state.discoveries.some((x) => x.id === d.id)) return false;
  state.discoveries.push(d);
  emit('discovery', d);
  return true;
}

export function addMaterial(id) {
  if (state.inventory.includes(id)) return false;
  state.inventory.push(id);
  emit('material', id);
  return true;
}
