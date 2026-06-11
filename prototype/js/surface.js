// Builds a planet surface: procedural terrain (the alien/unknown language),
// the landing pod (the handcrafted/known language), deposits, lifeforms,
// particles, and per-sensor environment swaps.

import * as THREE from 'three';
import { makeNoise2D, fbm, gaussianBump, clamp, lerp, mulberry32 } from './util.js';
import { LIFEFORM_BUILDERS } from './lifeforms.js';
import { MATERIALS } from './data/elements.js';
import { PATIENT_MOUNDS, WATCHER_CLIFF } from './data/planets.js';

const TERRAIN_SIZE = 520;
const TERRAIN_SEGMENTS = 130;
export const SURVEY_RADIUS = 200;

const DEPOSIT_COLORS = {
  chronium: 0xffaa33,
  basaltGlass: 0x33424a,
  vesperine: 0xaaffcc,
  threnodine: 0x9966ff,
  halcium: 0xb8c4cc,
  levitine: 0x66ffee,
  umbrium: 0x4a3366,
  greeterChitin: 0x88ddff,
  patiens: 0xddddcc,
};

export function buildSurface(planet) {
  const cfg = planet.surface;
  const noise = makeNoise2D(cfg.seed);

  function heightAt(x, z) {
    let h = (fbm(noise, x * cfg.heightFreq, z * cfg.heightFreq, cfg.octaves) - 0.5) * 2 * cfg.heightAmp;
    // Gentle landing zone around the pod.
    const d = Math.sqrt(x * x + z * z);
    const flatten = 0.2 + 0.8 * clamp((d - 10) / 36, 0, 1);
    h *= flatten;
    if (planet.id === 'hush') {
      for (const m of PATIENT_MOUNDS) h += gaussianBump(x, z, m.x, m.z, m.amp, m.sigma);
      h += gaussianBump(x, z, WATCHER_CLIFF.x, WATCHER_CLIFF.z, WATCHER_CLIFF.amp, WATCHER_CLIFF.sigma);
    }
    return h;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(cfg.env.VIS.sky);
  scene.fog = new THREE.FogExp2(cfg.env.VIS.fog[0], cfg.env.VIS.fog[1]);

  const sun = new THREE.DirectionalLight(cfg.env.VIS.sun, cfg.env.VIS.sunIntensity);
  sun.position.set(80, 120, 40);
  scene.add(sun);
  const ambient = new THREE.AmbientLight(cfg.env.VIS.ambient, cfg.env.VIS.ambientIntensity);
  scene.add(ambient);

  // ── Terrain ──
  const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const low = new THREE.Color(cfg.groundLow);
  const high = new THREE.Color(cfg.groundHigh);
  const tmpColor = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = heightAt(x, z);
    pos.setY(i, h);
    const t = clamp((h + cfg.heightAmp) / (cfg.heightAmp * 2.2), 0, 1);
    const jitter = (noise(x * 0.2, z * 0.2) - 0.5) * 0.16;
    tmpColor.copy(low).lerp(high, clamp(t + jitter, 0, 1));
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const matVIS = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  const matALT = new THREE.MeshStandardMaterial({ color: 0x10121f, roughness: 1 });
  const terrain = new THREE.Mesh(geo, matVIS);
  scene.add(terrain);

  // EMF wireframe overlay — the world as field lines.
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x7744ff, wireframe: true, transparent: true, opacity: 0.22,
  });
  const wire = new THREE.Mesh(geo.clone(), wireMat);
  wire.position.y = 0.05;
  wire.visible = false;
  scene.add(wire);

  // ── Landing pod (handcrafted / known) ──
  const pod = buildPod();
  const podPos = new THREE.Vector3(7, 0, 9);
  pod.position.set(podPos.x, heightAt(podPos.x, podPos.z), podPos.z);
  scene.add(pod);

  // ── Stars on Hush (the sky is dark enough to see them) ──
  if (planet.id === 'hush') scene.add(buildStarDome());

  // ── Deposits ──
  const scannables = [];
  const sensorables = [];
  function addDeposit(materialId, x, z, beat) {
    const def = MATERIALS[materialId];
    const color = DEPOSIT_COLORS[materialId] || 0xffffff;
    const cluster = buildCrystalCluster(color, materialId);
    cluster.group.position.set(x, heightAt(x, z), z);
    scene.add(cluster.group);
    sensorables.push(cluster);
    scannables.push({
      kind: 'deposit', id: `dep-${materialId}`, material: materialId,
      name: def.name, beat: beat || null,
      requires: ['VIS', 'THM', 'EMF', 'TMP'], range: 15,
      pos: cluster.group.position,
    });
  }
  for (const d of planet.deposits) addDeposit(d.material, d.x, d.z, d.beat);

  // ── Lifeforms ──
  const lifeforms = [];
  for (const id of planet.lifeforms) {
    const builder = LIFEFORM_BUILDERS[id];
    if (!builder) throw new Error(`No builder for lifeform: ${id}`);
    const life = builder(heightAt);
    scene.add(life.group);
    lifeforms.push(life);
    for (const s of life.scannables) scannables.push({ kind: 'lifeform', ...s });
  }

  // ── Particles ──
  const particles = buildParticles(cfg.particles);
  if (particles) scene.add(particles.points);

  function applySensor(mode) {
    const env = cfg.env[mode];
    scene.background.setHex(env.sky);
    scene.fog.color.setHex(env.fog[0]);
    scene.fog.density = env.fog[1];
    sun.color.setHex(env.sun);
    sun.intensity = env.sunIntensity;
    ambient.color.setHex(env.ambient);
    ambient.intensity = env.ambientIntensity;
    if (mode === 'VIS') {
      terrain.material = matVIS;
    } else {
      matALT.color.setHex(env.fog[0]).multiplyScalar(0.55);
      terrain.material = matALT;
    }
    wire.visible = mode === 'EMF';
    if (particles) particles.points.visible = mode === 'VIS';
    for (const lf of lifeforms) lf.setSensor(mode);
    for (const s of sensorables) s.setSensor(mode);
  }

  function update(dt, elapsed, ctx) {
    for (const lf of lifeforms) lf.update(dt, elapsed, ctx);
    for (const s of sensorables) s.update(dt, elapsed, ctx);
    if (particles) particles.update(dt);
  }

  function spawnChitin() {
    addDeposit('greeterChitin', -32, -56, null);
  }

  function dispose() {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) m.dispose();
      }
    });
  }

  return {
    scene, heightAt, applySensor, update, scannables,
    zones: planet.zones.map((z) => ({ ...z })),
    spawnChitin, dispose, podPos,
  };
}

function buildPod() {
  const g = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.5 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd96f32, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 4.4, 12), hullMat);
  body.position.y = 3.2;
  g.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.2, 12), trimMat);
  nose.position.y = 6.5;
  g.add(nose);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x55504a });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2), legMat);
    leg.position.set(Math.cos(a) * 2.4, 1.2, Math.sin(a) * 2.4);
    leg.rotation.z = Math.cos(a) * 0.5;
    leg.rotation.x = -Math.sin(a) * 0.5;
    g.add(leg);
  }
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.08, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x66ddff, emissiveIntensity: 1.2 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.4;
  g.add(ring);
  const lamp = new THREE.PointLight(0xffeedd, 30, 40, 1.8);
  lamp.position.y = 5;
  g.add(lamp);
  return g;
}

function buildCrystalCluster(colorHex, seedKey) {
  const group = new THREE.Group();
  const rng = mulberry32(seedKey.length * 1000 + seedKey.charCodeAt(0) * 31);
  const mats = [];
  const count = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x111418, emissive: colorHex, emissiveIntensity: 0.7,
      roughness: 0.3, flatShading: true,
    });
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.4 + rng() * 0.5), mat);
    shard.scale.y = 1.8 + rng() * 1.4;
    shard.position.set((rng() - 0.5) * 1.8, shard.scale.y * 0.35, (rng() - 0.5) * 1.8);
    shard.rotation.set((rng() - 0.5) * 0.4, rng() * Math.PI, (rng() - 0.5) * 0.4);
    group.add(shard);
    mats.push(mat);
  }
  const phase = rng() * 6;
  return {
    group,
    setSensor() { /* deposits glow on every band — they want to be found */ },
    update(dt, elapsed) {
      for (const m of mats) m.emissiveIntensity = 0.55 + 0.3 * Math.sin(elapsed * 1.4 + phase);
    },
  };
}

function buildParticles(kind) {
  if (kind === 'none') return null;
  const COUNT = 900;
  const BOX = 260;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * BOX;
    positions[i * 3 + 1] = Math.random() * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * BOX;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: kind === 'spores' ? 0xc8f0c0 : 0x886655,
    size: kind === 'spores' ? 0.5 : 0.3,
    transparent: true,
    opacity: kind === 'spores' ? 0.7 : 0.45,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  const fallSpeed = kind === 'spores' ? 1.1 : 0.5;
  return {
    points,
    update(dt) {
      const arr = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        arr[i * 3 + 1] -= fallSpeed * dt;
        if (arr[i * 3 + 1] < -10) arr[i * 3 + 1] = 60;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

function buildStarDome() {
  const COUNT = 1400;
  const RADIUS = 900;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.95); // upper hemisphere
    positions[i * 3] = RADIUS * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = RADIUS * Math.cos(phi);
    positions[i * 3 + 2] = RADIUS * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xccd6ff, size: 1.4, fog: false, sizeAttenuation: false });
  mat.size = 1.2;
  return new THREE.Points(geo, mat);
}
