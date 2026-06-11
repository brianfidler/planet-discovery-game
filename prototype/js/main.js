// Game loop + state machine: title → system map → planet surfaces.
// Navigation, sensors, scanning, zone triggers, and narrative routing.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { state, on, flagOnce, hasFlag, addDiscovery, addMaterial } from './state.js';
import { buildSystemScene } from './system.js';
import { buildSurface } from './surface.js';
import { initHalley, play, advance, isSpeaking } from './halley.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import { getPlanet } from './data/planets.js';
import { LIFE_TIERS } from './data/narrative.js';
import { initChat, toggleChat, closeChat, isChatOpen } from './chat.js';

const EYE_HEIGHT = 1.7;
const WALK_SPEED = 8;
const RUN_SPEED = 14;
const SCAN_SECONDS = 1.2;
const SCAN_AIM_DOT = 0.94;
const PERIMETER_RADIUS = 190;
const SENSORS = ['VIS', 'THM', 'EMF', 'TMP'];

// ── Renderer & cameras ──────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-root').appendChild(renderer.domElement);

const systemCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
systemCamera.position.set(0, 58, 92);
const surfaceCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);

const system = buildSystemScene();
const sysControls = new OrbitControls(systemCamera, renderer.domElement);
sysControls.enableDamping = true;
sysControls.maxDistance = 220;
sysControls.minDistance = 20;

const walkControls = new PointerLockControls(surfaceCamera, renderer.domElement);

let surface = null;
let endingPhase = 0; // 1: await home button, 2: shown, 3: ending playing

window.addEventListener('resize', () => {
  for (const cam of [systemCamera, surfaceCamera]) {
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Beats with side effects ─────────────────────────────────────────────────

function fireBeat(id) {
  if (!flagOnce(id)) return false;
  play(id);
  applyBeatEffects(id);
  refreshObjective();
  return true;
}

function applyBeatEffects(id) {
  if (id === 'laughTrack') {
    audio.laughTrackCrackle();
    surface?.spawnChitin();
    addDiscovery({ id: 'greeters', name: 'Greeters', tier: 4, planet: 'brume' });
  }
  if (id === 'tmpReveal') audio.dreadSwell();
  if (id === 'patientScan') endingPhase = 1;
}

on('dread', () => audio.dreadSwell());
on('beatPlayed', refreshObjective);
on('material', refreshObjective);
on('discovery', refreshObjective);

// ── Objective line ──────────────────────────────────────────────────────────

function refreshObjective() {
  const hasChronium = state.inventory.includes('chronium');
  let text;
  if (state.ended) text = 'The catalogue has begun.';
  else if (endingPhase >= 1) text = 'Set course for home.';
  else if (hasFlag('tmpReveal')) text = 'Scan a Patient One — hold E in Temporal view (4).';
  else if (state.imagerBuilt) text = 'Return to Vesper III — Hush. Switch to Temporal (4) and look again.';
  else if (hasChronium && hasFlag('hushArrive')) text = 'Fabricate the Temporal Imager (F): phase lens + thermal-shock-stable housing.';
  else if (hasChronium && state.visited.size >= 3) text = 'Fabricate the Temporal Imager (F), then return to Hush.';
  else if (hasChronium) text = 'Chronium secured. Press onward — survey the remaining worlds (G → star map).';
  else if (hasFlag('choirScan')) text = 'Sample the amber crystal deposits near the Choir.';
  else if (hasFlag('choirReveal')) text = 'Scan the Slow Choir — hold E.';
  else if (hasFlag('choirNudge')) text = 'Switch to Thermal (2) near the columns.';
  else if (state.planet === 'cinder') text = 'Survey the basalt columns north of the pod.';
  else if (state.planet === 'brume') text = 'Survey Brume. Try every sense on everything.';
  else if (state.planet === 'hush') text = 'The Hum is loudest here. Walk toward it.';
  else if (hasFlag('intro')) text = 'Select a planet and land. Cinder is closest to the star.';
  else text = '';
  ui.setObjective(text);
}

// ── Mode transitions ────────────────────────────────────────────────────────

function fadeThen(fn) {
  const veil = document.getElementById('fade');
  veil.classList.add('on');
  setTimeout(() => {
    fn();
    setTimeout(() => veil.classList.remove('on'), 80);
  }, 650);
}

function landOn(planetId) {
  ui.hidePlanetPanel();
  fadeThen(() => {
    if (surface) surface.dispose();
    const planet = getPlanet(planetId);
    surface = buildSurface(planet);
    state.mode = 'surface';
    state.planet = planetId;
    state.visited.add(planetId);
    setSensor('VIS');
    surfaceCamera.position.set(0, surface.heightAt(0, 0) + EYE_HEIGHT, 0);
    surfaceCamera.lookAt(0, surface.heightAt(0, -10) + EYE_HEIGHT, -10);
    sysControls.enabled = false;
    audio.setAmbience(planetId);
    ui.setLocation(planet.name);
    fireBeat(planet.arriveBeat);
    refreshObjective();
  });
}

function toOrbit() {
  fadeThen(() => {
    walkControls.unlock();
    if (surface) { surface.dispose(); surface = null; }
    state.mode = 'system';
    state.planet = null;
    sysControls.enabled = true;
    audio.setAmbience('space');
    ui.setLocation('Vesper system — orbit');
    refreshObjective();
  });
}

// ── Sensors ─────────────────────────────────────────────────────────────────

function setSensor(mode) {
  if (mode === 'TMP' && !state.imagerBuilt) {
    if (flagOnce('noImagerHint')) play('noImager');
    else ui.toast('Temporal sensing requires the Temporal Imager (F).');
    return;
  }
  state.sensor = mode;
  ui.setSensorUI(mode);
  surface?.applySensor(mode);
  if (mode === 'TMP' && state.planet === 'hush') {
    fireBeat('tmpReveal');
  } else if (mode === 'TMP' && state.planet) {
    if (flagOnce('tmpElsewhere')) play('tmpElsewhere');
  }
}

// ── Scanning ────────────────────────────────────────────────────────────────

let scanHeld = false;
let scanProgress = 0;
let scanTargetId = null;

function currentScanTarget() {
  if (!surface || !walkControls.isLocked) return null;
  const camDir = surfaceCamera.getWorldDirection(new THREE.Vector3());
  let best = null;
  let bestDot = SCAN_AIM_DOT;
  for (const s of surface.scannables) {
    if (s.scanned) continue;
    if (!s.requires.includes(state.sensor)) continue;
    const to = s.pos.clone().sub(surfaceCamera.position);
    const dist = to.length();
    if (dist > s.range) continue;
    to.normalize();
    const dot = camDir.dot(to);
    if (dot > bestDot) { bestDot = dot; best = s; }
  }
  return best;
}

function updateScan(dt) {
  const target = currentScanTarget();
  if (!target) {
    scanProgress = 0;
    scanTargetId = null;
    ui.setScanPrompt(null, 0);
    return;
  }
  if (target.id !== scanTargetId) {
    scanTargetId = target.id;
    scanProgress = 0;
  }
  const label = target.kind === 'deposit'
    ? `${target.name} — hold E to sample`
    : 'Unknown signature — hold E to scan';
  if (scanHeld) {
    scanProgress = Math.min(1, scanProgress + dt / SCAN_SECONDS);
    if (scanProgress >= 1) completeScan(target);
  } else {
    scanProgress = Math.max(0, scanProgress - dt * 2);
  }
  ui.setScanPrompt(label, scanProgress);
}

function completeScan(target) {
  target.scanned = true;
  scanProgress = 0;
  audio.chime();
  if (target.kind === 'deposit') {
    addMaterial(target.material);
    ui.toast(`Sampled: ${target.name}`);
  } else {
    addDiscovery({ id: target.id, name: target.name, tier: target.tier, planet: state.planet });
    ui.toast(`Catalogued: ${target.name} — ${LIFE_TIERS[target.tier] || 'Unclassified'}`);
  }
  if (target.beat) fireBeat(target.beat);
}

// ── Zones ───────────────────────────────────────────────────────────────────

function updateZones() {
  if (!surface) return;
  const p = surfaceCamera.position;
  for (const z of surface.zones) {
    if (z.done) continue;
    const dist = Math.hypot(p.x - z.x, p.z - z.z);
    if (dist > z.r) continue;
    if (z.sensor && z.sensor !== state.sensor) continue;
    if (z.beat === 'humSpotRouter') {
      if (state.imagerBuilt) { z.done = true; continue; }
      if (state.inventory.includes('chronium')) {
        fireBeat('humSpot');
        z.done = true;
      } else {
        fireBeat('humSpotNoChronium'); // zone stays live: returns with chronium re-trigger humSpot
      }
      continue;
    }
    fireBeat(z.beat);
    z.done = true;
  }
}

// ── Input ───────────────────────────────────────────────────────────────────

const move = { f: false, b: false, l: false, r: false, run: false };

function typingInField(e) {
  const tag = e.target?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA';
}

window.addEventListener('keydown', (e) => {
  if (typingInField(e)) return; // chat input owns the keyboard while focused
  if (e.repeat) return;
  switch (e.code) {
    case 'KeyW': move.f = true; break;
    case 'KeyS': move.b = true; break;
    case 'KeyA': move.l = true; break;
    case 'KeyD': move.r = true; break;
    case 'ShiftLeft': case 'ShiftRight': move.run = true; break;
    case 'KeyE': scanHeld = true; break;
    case 'Enter': advance(); break;
    case 'Digit1': if (state.mode === 'surface') setSensor(SENSORS[0]); break;
    case 'Digit2': if (state.mode === 'surface') setSensor(SENSORS[1]); break;
    case 'Digit3': if (state.mode === 'surface') setSensor(SENSORS[2]); break;
    case 'Digit4': if (state.mode === 'surface') setSensor(SENSORS[3]); break;
    case 'KeyG': case 'KeyM': if (state.mode === 'surface' && !state.ended) toOrbit(); break;
    case 'KeyX': ui.anyModalOpen() ? ui.closeModals() : ui.openModal('modal-elements'); break;
    case 'KeyJ': ui.anyModalOpen() ? ui.closeModals() : ui.openModal('modal-journal'); break;
    case 'KeyF': ui.anyModalOpen() ? ui.closeModals() : ui.openModal('modal-fab'); break;
    case 'KeyV': ui.toggleVoiceUI(); break;
    case 'KeyT': e.preventDefault(); toggleChat(); break;
    case 'Escape': closeChat(); break;
    default: break;
  }
});

window.addEventListener('keyup', (e) => {
  if (typingInField(e)) return;
  switch (e.code) {
    case 'KeyW': move.f = false; break;
    case 'KeyS': move.b = false; break;
    case 'KeyA': move.l = false; break;
    case 'KeyD': move.r = false; break;
    case 'ShiftLeft': case 'ShiftRight': move.run = false; break;
    case 'KeyE': scanHeld = false; break;
    default: break;
  }
});

// Planet selection in system view.
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('click', (e) => {
  if (state.mode !== 'system' || ui.anyModalOpen()) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, systemCamera);
  const hits = raycaster.intersectObjects(system.getPlanetMeshes());
  if (hits.length > 0) {
    const id = hits[0].object.userData.planetId;
    system.setSelected(id);
    ui.showPlanetPanel(id, landOn);
  } else {
    system.setSelected(null);
    ui.hidePlanetPanel();
  }
});

document.getElementById('lock-prompt').addEventListener('click', () => {
  walkControls.lock();
});

document.getElementById('btn-home').addEventListener('click', () => {
  document.getElementById('btn-home').classList.remove('show');
  endingPhase = 3;
  play('ending');
});

document.getElementById('btn-start').addEventListener('click', () => {
  audio.initAudio();
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  state.mode = 'system';
  audio.setAmbience('space');
  ui.setLocation('Vesper system — orbit');
  fireBeat('intro');
});

// ── Boot & loop ─────────────────────────────────────────────────────────────

initHalley();
initChat();
document.getElementById('btn-talk').addEventListener('click', toggleChat);
ui.initUI({
  onImagerBuilt() {
    ui.setSensorUI(state.sensor);
    refreshObjective();
  },
});
ui.setSensorUI('VIS');

// Dev/test harness hook — lets automated agents drive the game (see
// docs/VERTICAL-SLICE.md testing approach). Not used by gameplay.
window.__game = { state, landOn, toOrbit, setSensor, fireBeat };

const clock = new THREE.Clock();
let elapsed = 0;

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  if (state.mode === 'system') {
    sysControls.update();
    system.update(dt, elapsed);
    renderer.render(system.scene, systemCamera);
  } else if (state.mode === 'surface' && surface) {
    if (walkControls.isLocked) {
      const speed = move.run ? RUN_SPEED : WALK_SPEED;
      walkControls.moveForward((Number(move.f) - Number(move.b)) * speed * dt);
      walkControls.moveRight((Number(move.r) - Number(move.l)) * speed * dt);
      const p = surfaceCamera.position;
      const radial = Math.hypot(p.x, p.z);
      if (radial > PERIMETER_RADIUS) {
        p.x *= PERIMETER_RADIUS / radial;
        p.z *= PERIMETER_RADIUS / radial;
        if (flagOnce('perimeter')) play('perimeter');
      }
      p.y = surface.heightAt(p.x, p.z) + EYE_HEIGHT;
    }
    surface.update(dt, elapsed, {
      playerPos: surfaceCamera.position,
      sensor: state.sensor,
      camera: surfaceCamera,
      heightAt: surface.heightAt,
    });
    updateZones();
    updateScan(dt);
    renderer.render(surface.scene, surfaceCamera);
  }

  // Ending choreography: wait for Halley to finish before each step.
  if (endingPhase === 1 && !isSpeaking()) {
    endingPhase = 2;
    walkControls.unlock();
    document.getElementById('btn-home').classList.add('show');
    refreshObjective();
  } else if (endingPhase === 3 && !isSpeaking()) {
    endingPhase = 4;
    state.ended = true;
    ui.showEndScreen();
  }

  // Lock prompt visibility.
  const lockPrompt = document.getElementById('lock-prompt');
  const wantPrompt = state.mode === 'surface' && !walkControls.isLocked && !ui.anyModalOpen()
    && !isChatOpen() && !state.ended && endingPhase < 2;
  lockPrompt.classList.toggle('visible', wantPrompt);
}

tick();
