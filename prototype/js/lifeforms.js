// Hand-authored lifeforms in the sensor-rendered style. Each builder returns
// { group, setSensor(mode), update(dt, elapsed, ctx), scannables[] }.
// ctx: { playerPos, sensor, camera, heightAt }

import * as THREE from 'three';
import { mulberry32 } from './util.js';
import { state, flagOnce, addDiscovery, emit } from './state.js';
import { play } from './halley.js';
import { PATIENT_MOUNDS, WATCHER_CLIFF } from './data/planets.js';

const EARTH_AZIMUTH = Math.PI * 0.37; // the direction every Patient One faces

let eyeTexture = null;
function getEyeTexture() {
  if (eyeTexture) return eyeTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, '#fff6c8');
  grad.addColorStop(0.35, '#d8b04a');
  grad.addColorStop(0.6, '#5a3a14');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#0a0805';
  g.beginPath();
  g.ellipse(128, 128, 14, 64, 0, 0, Math.PI * 2);
  g.fill();
  eyeTexture = new THREE.CanvasTexture(c);
  return eyeTexture;
}

// ── Cinder ──────────────────────────────────────────────────────────────────

export function buildSlowChoir(heightAt) {
  const group = new THREE.Group();
  const rng = mulberry32(77);
  const columns = [];
  const CENTER = { x: 0, z: -70 };
  const COUNT = 11;
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2 + rng() * 0.5;
    const dist = 6 + rng() * 16;
    const x = CENTER.x + Math.cos(angle) * dist;
    const z = CENTER.z + Math.sin(angle) * dist;
    const height = 7 + rng() * 8;
    const geo = new THREE.CylinderGeometry(0.9 + rng() * 0.6, 1.6 + rng() * 0.7, height, 6);
    const mat = new THREE.MeshStandardMaterial({ color: 0x241d18, roughness: 0.95, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, heightAt(x, z) + height / 2 - 0.5, z);
    mesh.rotation.y = rng() * Math.PI;
    group.add(mesh);
    columns.push({ mesh, mat, phase: i * 0.62 });
  }
  const glow = new THREE.PointLight(0xff7733, 0, 90, 1.8);
  glow.position.set(CENTER.x, heightAt(CENTER.x, CENTER.z) + 10, CENTER.z);
  group.add(glow);

  function setSensor(mode) {
    const thermal = mode === 'THM';
    glow.intensity = thermal ? 60 : 0;
    for (const c of columns) {
      c.mat.color.setHex(thermal ? 0x140a05 : 0x241d18);
      c.mat.emissive.setHex(thermal ? 0xff7733 : 0x000000);
      c.mat.emissiveIntensity = thermal ? 0.6 : 0;
    }
  }

  function update(dt, elapsed, ctx) {
    if (ctx.sensor !== 'THM') return;
    for (const c of columns) {
      // The cascading wave — heat taking turns. The 61-minute song, compressed.
      c.mat.emissiveIntensity = 0.35 + 0.65 * Math.max(0, Math.sin(elapsed * 0.9 - c.phase));
    }
    glow.intensity = 40 + 30 * Math.sin(elapsed * 0.9);
  }

  return {
    group, setSensor, update,
    scannables: [{
      id: 'slowChoir', name: 'Slow Choir', tier: 3, beat: 'choirScan',
      requires: ['THM'], range: 42, pos: new THREE.Vector3(CENTER.x, 6, CENTER.z),
    }],
  };
}

export function buildVentMats(heightAt) {
  const group = new THREE.Group();
  const rng = mulberry32(91);
  const mats = [];
  for (let i = 0; i < 6; i++) {
    const x = -10 + rng() * 30;
    const z = -50 - rng() * 35;
    const geo = new THREE.CircleGeometry(1.6 + rng() * 2.2, 14);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, heightAt(x, z) + 0.06, z);
    group.add(mesh);
    mats.push({ mat, phase: rng() * 6 });
  }
  function setSensor(mode) {
    const thermal = mode === 'THM';
    for (const m of mats) {
      m.mat.color.setHex(thermal ? 0x120a04 : 0x2a2218);
      m.mat.emissive.setHex(thermal ? 0xcc4422 : 0x000000);
      m.mat.emissiveIntensity = thermal ? 0.5 : 0;
    }
  }
  function update(dt, elapsed, ctx) {
    if (ctx.sensor !== 'THM') return;
    for (const m of mats) m.mat.emissiveIntensity = 0.3 + 0.3 * Math.sin(elapsed * 0.5 + m.phase);
  }
  return {
    group, setSensor, update,
    scannables: [{
      id: 'ventMats', name: 'Thermophile mats', tier: 1, beat: 'ventMatScan',
      requires: ['THM'], range: 20, pos: new THREE.Vector3(5, 1, -60),
    }],
  };
}

// ── Brume ───────────────────────────────────────────────────────────────────

function makeGreeter(rng) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xc9d8f0, roughness: 0.4, transparent: true, opacity: 0.92, flatShading: true,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.3 + rng() * 0.5, 10, 8), bodyMat);
  g.add(body);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x223344, emissive: 0x44ddff, emissiveIntensity: 0,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), coreMat);
  g.add(core);
  const tentMat = new THREE.MeshStandardMaterial({ color: 0x9fb4d8, roughness: 0.6 });
  for (let i = 0; i < 4; i++) {
    const tent = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.6 + rng(), 5), tentMat);
    const a = (i / 4) * Math.PI * 2;
    tent.position.set(Math.cos(a) * 0.6, -1.3, Math.sin(a) * 0.6);
    g.add(tent);
  }
  return { group: g, bodyMat, coreMat };
}

export function buildGreeterScout(heightAt) {
  const rng = mulberry32(303);
  const { group, bodyMat, coreMat } = makeGreeter(rng);
  const HOME = { x: 12, z: -26 };
  const baseY = heightAt(HOME.x, HOME.z) + 6;
  group.position.set(HOME.x, baseY, HOME.z);

  function setSensor(mode) {
    bodyMat.opacity = mode === 'VIS' ? 0.92 : 0.25;
    coreMat.emissiveIntensity = mode === 'EMF' ? 1.4 : 0;
  }
  function update(dt, elapsed, ctx) {
    group.position.y = baseY + Math.sin(elapsed * 0.6) * 1.1;
    group.position.x = HOME.x + Math.sin(elapsed * 0.18) * 5;
    group.position.z = HOME.z + Math.cos(elapsed * 0.15) * 5;
    if (ctx.sensor === 'EMF') {
      coreMat.emissiveIntensity = Math.sin(elapsed * 5) > 0.2 ? 1.6 : 0.2; // signaling, not glowing
    }
  }
  return {
    group, setSensor, update,
    scannables: [{
      id: 'greeters', name: 'Greeters', tier: 4, beat: 'greeterScan',
      requires: ['VIS', 'EMF'], range: 22, pos: group.position,
    }],
  };
}

export function buildGreeterFlock(heightAt) {
  const rng = mulberry32(404);
  const flock = new THREE.Group();
  const members = [];
  const CENTER = { x: -38, z: -62 };
  for (let i = 0; i < 6; i++) {
    const m = makeGreeter(rng);
    const ox = (rng() - 0.5) * 26;
    const oz = (rng() - 0.5) * 26;
    const baseY = heightAt(CENTER.x + ox, CENTER.z + oz) + 7 + rng() * 6;
    m.group.position.set(CENTER.x + ox, baseY, CENTER.z + oz);
    flock.add(m.group);
    members.push({ ...m, baseY, phase: rng() * 6, idx: i });
  }
  function setSensor(mode) {
    for (const m of members) {
      m.bodyMat.opacity = mode === 'VIS' ? 0.92 : 0.25;
      m.coreMat.emissiveIntensity = mode === 'EMF' ? 1.2 : 0;
    }
  }
  function update(dt, elapsed, ctx) {
    const synchronized = state.flags.has('laughTrack');
    for (const m of members) {
      m.group.position.y = m.baseY + Math.sin(elapsed * 0.5 + m.phase) * 1.4;
      if (ctx.sensor === 'EMF') {
        // Before the beat: idle chatter. After: the whole flock pulses the
        // same 60-year-old broadcast, in unison.
        const signal = synchronized
          ? (Math.sin(elapsed * 3.2) > 0 ? 1.8 : 0.1)
          : (Math.sin(elapsed * 4 + m.idx * 1.7) > 0.3 ? 1.4 : 0.15);
        m.coreMat.emissiveIntensity = signal;
      }
    }
  }
  return { group: flock, setSensor, update, scannables: [] };
}

export function buildSirReginald(heightAt) {
  const group = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x59554c, roughness: 1, flatShading: true });
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8), rockMat);
  rock.scale.y = 0.7;
  const HOME = { x: 24, z: 14 };
  group.position.set(HOME.x, heightAt(HOME.x, HOME.z) + 0.5, HOME.z);
  group.add(rock);
  const legs = new THREE.Group();
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3a372f });
  for (let i = 0; i < 6; i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.8), legMat);
    const a = (i / 6) * Math.PI * 2;
    leg.position.set(Math.cos(a) * 0.6, -0.5, Math.sin(a) * 0.6);
    legs.add(leg);
  }
  legs.visible = false;
  group.add(legs);

  let walking = false;
  let walkT = 0;
  const dir = new THREE.Vector3(0.7, 0, 0.7).normalize();

  function setSensor() { /* Sir Reginald looks like a rock on every band. That is the joke. */ }
  function update(dt, elapsed, ctx) {
    if (!walking && state.flags.has('reginald')) {
      walking = true;
      legs.visible = true;
    }
    if (walking && walkT < 1) {
      walkT = Math.min(1, walkT + dt / 7);
      const distance = walkT * 30;
      const x = HOME.x + dir.x * distance;
      const z = HOME.z + dir.z * distance;
      group.position.set(x, ctx.heightAt(x, z) + 0.6 + Math.abs(Math.sin(elapsed * 7)) * 0.15, z);
      group.rotation.y += dt * 0.4;
    }
  }
  return {
    group, setSensor, update,
    scannables: [{
      id: 'sirReginald', name: 'Sir Reginald', tier: 2, beat: 'reginald',
      requires: ['VIS', 'THM', 'EMF', 'TMP'], range: 14, pos: group.position,
    }],
  };
}

// ── Hush ────────────────────────────────────────────────────────────────────

export function buildEmfGhost(heightAt) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: 0x88ffee, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
  });
  const wisp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), mat);
  group.add(wisp);
  const rng = mulberry32(666);
  let evasions = 0;
  let gone = false;
  let pos = new THREE.Vector3(40, 0, -40);

  function relocate(playerPos) {
    const a = rng() * Math.PI * 2;
    const d = 60 + rng() * 30;
    pos = new THREE.Vector3(playerPos.x + Math.cos(a) * d, 0, playerPos.z + Math.sin(a) * d);
  }

  function setSensor() { /* handled per-frame */ }
  function update(dt, elapsed, ctx) {
    if (gone) { mat.opacity = 0; return; }
    pos.y = ctx.heightAt(pos.x, pos.z) + 1.6;
    group.position.copy(pos);
    group.lookAt(ctx.playerPos.x, pos.y, ctx.playerPos.z);
    if (ctx.sensor !== 'EMF') { mat.opacity = 0; return; }
    mat.opacity = 0.35 + 0.3 * Math.sin(elapsed * 9); // flickering, barely-there
    const dist = pos.distanceTo(ctx.playerPos);
    if (dist < 70 && flagOnce('ghostSeen')) play('ghostSeen');
    if (dist < 24) {
      evasions++;
      if (evasions >= 3) {
        gone = true;
        if (flagOnce('ghostGone')) {
          play('ghostGone');
          addDiscovery({ id: 'emfGhost', name: '[UNRESOLVED CONTACT]', tier: 0, planet: 'hush' });
        }
      } else {
        relocate(ctx.playerPos);
      }
    }
  }
  return { group, setSensor, update, scannables: [] };
}

export function buildPatientOnes(heightAt) {
  const group = new THREE.Group();
  const azimuth = new THREE.Vector3(Math.cos(EARTH_AZIMUTH), 0, Math.sin(EARTH_AZIMUTH));
  const eyes = [];
  const shells = [];
  const scannables = [];

  for (const m of PATIENT_MOUNDS) {
    // Breathing shell — glowing veins hugging the mound, TMP only.
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xff4433, wireframe: true, transparent: true, opacity: 0,
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(m.sigma * 1.15, 10, 7), shellMat);
    shell.scale.y = 0.55;
    shell.position.set(m.x, heightAt(m.x, m.z) - m.amp * 0.15, m.z);
    group.add(shell);
    shells.push({ mesh: shell, mat: shellMat, baseScale: shell.scale.clone(), phase: m.x * 0.01 });

    // The eye — on the flank, facing Earth. All of them. The same direction.
    const eyeMat = new THREE.MeshBasicMaterial({
      map: getEyeTexture(), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
    });
    const eye = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), eyeMat);
    const ex = m.x + azimuth.x * m.sigma * 0.9;
    const ez = m.z + azimuth.z * m.sigma * 0.9;
    eye.position.set(ex, heightAt(ex, ez) + 4, ez);
    eye.lookAt(ex + azimuth.x * 100, eye.position.y + 8, ez + azimuth.z * 100);
    group.add(eye);
    eyes.push({ mesh: eye, mat: eyeMat });

    scannables.push({
      id: 'patientOnes', name: 'Patient One', tier: 5, beat: 'patientScan',
      requires: ['TMP'], range: 130, pos: shell.position,
    });
  }

  let revealT = 0; // 0 → 1 over the reveal sequence

  function setSensor(mode) {
    if (mode !== 'TMP') {
      for (const e of eyes) e.mat.opacity = 0;
      for (const s of shells) s.mat.opacity = 0;
    }
  }
  function update(dt, elapsed, ctx) {
    if (ctx.sensor !== 'TMP' || !state.flags.has('tmpReveal')) return;
    revealT = Math.min(1, revealT + dt / 6);
    for (const e of eyes) e.mat.opacity = revealT * 0.95;
    for (const s of shells) {
      s.mat.opacity = revealT * 0.35;
      const breath = 1 + Math.sin(elapsed * 0.7 + s.phase) * 0.03; // one beat per nine days, compressed
      s.mesh.scale.set(s.baseScale.x * breath, s.baseScale.y * breath, s.baseScale.z * breath);
    }
  }
  return { group, setSensor, update, scannables };
}

export function buildWatcherCliff(heightAt) {
  const group = new THREE.Group();
  const eyeMat = new THREE.MeshBasicMaterial({
    map: getEyeTexture(), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
  });
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), eyeMat);
  const ex = WATCHER_CLIFF.x;
  const ez = WATCHER_CLIFF.z;
  eye.position.set(ex, heightAt(ex, ez) + 3, ez);
  group.add(eye);

  function setSensor(mode) {
    if (mode !== 'TMP') eyeMat.opacity = 0;
  }
  function update(dt, elapsed, ctx) {
    if (ctx.sensor !== 'TMP' || !state.flags.has('tmpReveal')) return;
    eyeMat.opacity = Math.min(0.95, eyeMat.opacity + dt * 0.5);
    eye.lookAt(ctx.playerPos.x, ctx.playerPos.y, ctx.playerPos.z); // this one watches YOU
    const toEye = eye.position.clone().sub(ctx.playerPos);
    const dist = toEye.length();
    toEye.normalize();
    const facing = ctx.camera.getWorldDirection(new THREE.Vector3()).dot(toEye);
    if (dist < 60 && facing > 0.88 && flagOnce('watcher')) {
      play('watcher');
      emit('dread');
    }
  }
  return { group, setSensor, update, scannables: [] };
}

export const LIFEFORM_BUILDERS = {
  slowChoir: buildSlowChoir,
  ventMats: buildVentMats,
  greeterScout: buildGreeterScout,
  greeterFlock: buildGreeterFlock,
  sirReginald: buildSirReginald,
  emfGhost: buildEmfGhost,
  patientOnes: buildPatientOnes,
  watcherCliff: buildWatcherCliff,
};
