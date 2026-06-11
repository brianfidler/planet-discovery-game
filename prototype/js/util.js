// Seeded randomness + value noise. Shared by terrain generation and movement
// so the walkable height always matches the rendered mesh.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(seed, xi, yi) {
  let h = seed ^ Math.imul(xi, 374761393) ^ Math.imul(yi, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

export function makeNoise2D(seed) {
  return function noise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const v00 = hash2(seed, xi, yi);
    const v10 = hash2(seed, xi + 1, yi);
    const v01 = hash2(seed, xi, yi + 1);
    const v11 = hash2(seed, xi + 1, yi + 1);
    const u = smooth(xf);
    const v = smooth(yf);
    const a = v00 + (v10 - v00) * u;
    const b = v01 + (v11 - v01) * u;
    return a + (b - a) * v; // 0..1
  };
}

export function fbm(noise, x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm; // 0..1
}

export function gaussianBump(x, z, cx, cz, amplitude, sigma) {
  const dx = x - cx;
  const dz = z - cz;
  return amplitude * Math.exp(-(dx * dx + dz * dz) / (2 * sigma * sigma));
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
