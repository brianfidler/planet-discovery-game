// All DOM UI: HUD, the expanded periodic table, journal, fabricator,
// planet panel, toasts, end screen. The HUD is the "handcrafted/known"
// visual language — clean and human against the sensor-rendered world.

import { state } from './state.js';
import {
  TABLE_ROWS, F_BLOCK_ROWS, NOVEL_ELEMENTS, MATERIALS, IMAGER_RECIPE,
} from './data/elements.js';
import { LIFE_TIERS } from './data/narrative.js';
import { getSystem, resolvePlanet } from './data/systems.js';
import { play } from './halley.js';
import { toggleMute } from './audio.js';
import * as voice from './voice.js';

const NOVEL_ORIGIN_PLANET = {
  Vs: 'cinder', Hc: 'brume', Ch: 'cinder', Ub: 'hush',
  Le: 'brume', Mi: 'brume', Td: 'cinder', Ps: 'hush',
};

let onImagerBuilt = null;
const fabSlots = { lens: null, housing: null };

const $ = (id) => document.getElementById(id);

export function initUI(handlers) {
  onImagerBuilt = handlers.onImagerBuilt;
  $('btn-elements').addEventListener('click', () => openModal('modal-elements'));
  $('btn-journal').addEventListener('click', () => openModal('modal-journal'));
  $('btn-fab').addEventListener('click', () => openModal('modal-fab'));
  $('btn-mute').addEventListener('click', () => {
    const muted = toggleMute();
    $('btn-mute').textContent = muted ? '🔇 Sound' : '🔊 Sound';
  });
  $('btn-voice').addEventListener('click', toggleVoiceUI);
  document.querySelectorAll('[data-close]').forEach((b) => {
    b.addEventListener('click', closeModals);
  });
  document.querySelectorAll('.modal').forEach((m) => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModals(); });
  });
}

export function toggleVoiceUI() {
  const enabled = voice.toggle();
  $('btn-voice').textContent = enabled ? '🗣 Voice [V]' : '🤐 Voice [V]';
  toast(enabled ? 'Halley voice: on' : 'Halley voice: off (text only)');
}

export function anyModalOpen() {
  return [...document.querySelectorAll('.modal')].some((m) => m.classList.contains('open'));
}

export function openModal(id) {
  closeModals();
  if (id === 'modal-elements') renderElementsModal();
  if (id === 'modal-journal') renderJournal();
  if (id === 'modal-fab') renderFabricator();
  $(id).classList.add('open');
  document.exitPointerLock?.();
}

export function closeModals() {
  document.querySelectorAll('.modal').forEach((m) => m.classList.remove('open'));
}

export function setObjective(text) {
  $('objective').textContent = text;
}

export function setLocation(text) {
  $('location').textContent = text;
}

export function setSensorUI(mode) {
  document.querySelectorAll('#sensor-bar button').forEach((b) => {
    b.classList.toggle('active', b.dataset.sensor === mode);
    if (b.dataset.sensor === 'TMP') {
      b.classList.toggle('locked', !state.imagerBuilt);
      b.title = state.imagerBuilt ? 'Temporal Imager' : 'Requires the Temporal Imager (fabricate it — F)';
    }
  });
}

export function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('toast-root').appendChild(el);
  setTimeout(() => el.classList.add('show'), 30);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 4200);
}

export function setScanPrompt(label, progress) {
  const prompt = $('scan-prompt');
  const ring = $('scan-ring');
  if (!label) {
    prompt.classList.remove('visible');
    ring.style.setProperty('--p', '0');
    return;
  }
  prompt.classList.add('visible');
  $('scan-label').textContent = label;
  ring.style.setProperty('--p', String(Math.round(progress * 100)));
}

// ── Planet panel (system view) ──────────────────────────────────────────────

export function showPlanetPanel(planetId, onLand) {
  const p = resolvePlanet(planetId);
  $('pp-name').textContent = p.name;
  $('pp-visited').textContent = state.visited.has(p.id) ? 'SURVEYED' : 'UNSURVEYED';
  const stats = $('pp-stats');
  stats.innerHTML = '';
  for (const [k, v] of Object.entries(p.stats)) {
    const row = document.createElement('div');
    row.className = 'pp-stat';
    row.innerHTML = `<span>${k}</span><strong>${v}</strong>`;
    stats.appendChild(row);
  }
  const chain = $('pp-formation');
  chain.innerHTML = '';
  for (const step of p.formation) {
    const li = document.createElement('li');
    li.textContent = step;
    chain.appendChild(li);
  }
  $('pp-hum').style.display = p.id === 'hush' ? 'block' : 'none';
  const btn = $('pp-land');
  btn.onclick = () => onLand(p.id);
  $('planet-panel').classList.add('open');
}

export function hidePlanetPanel() {
  $('planet-panel').classList.remove('open');
}

// ── Star panel (galaxy view) ────────────────────────────────────────────────

export function showStarPanel(systemId, onTravel) {
  const sys = getSystem(systemId);
  $('sp-name').textContent = sys.name;
  $('sp-class').textContent = sys.starClass;
  $('sp-blurb').textContent = sys.blurb;
  const surveyed = sys.planets.filter((p) => state.visited.has(p.id)).length;
  $('sp-stats').innerHTML = `
    <div class="pp-stat"><span>Planets</span><strong>${sys.planets.length}</strong></div>
    <div class="pp-stat"><span>Surveyed</span><strong>${surveyed} / ${sys.planets.length}</strong></div>
    <div class="pp-stat"><span>Drive range</span><strong>${sys.reachable ? 'REACHABLE' : 'OUT OF RANGE'}</strong></div>
  `;
  const btn = $('sp-travel');
  const here = state.system === sys.id;
  btn.disabled = !sys.reachable || here;
  btn.textContent = here ? 'You are here' : sys.reachable ? 'Travel' : 'Beyond drive range';
  btn.onclick = () => onTravel(sys.id);
  $('star-panel').classList.add('open');
}

export function hideStarPanel() {
  $('star-panel').classList.remove('open');
}

// ── Expanded periodic table ─────────────────────────────────────────────────

function elementStatus(symbol) {
  const sampled = state.inventory.some((id) => MATERIALS[id]?.element === symbol);
  if (sampled) return 'SAMPLED';
  if (state.visited.has(NOVEL_ORIGIN_PLANET[symbol])) return 'DETECTED';
  return 'THEORIZED';
}

function renderElementsModal() {
  const grid = $('ptable');
  grid.innerHTML = '';
  const addRow = (rowStr) => {
    for (const token of rowStr.split(/\s+/)) {
      const cell = document.createElement('div');
      if (token === '.') {
        cell.className = 'pt-cell empty';
      } else {
        cell.className = 'pt-cell real';
        cell.textContent = token;
      }
      grid.appendChild(cell);
    }
  };
  TABLE_ROWS.forEach(addRow);
  // spacer row
  for (let i = 0; i < 18; i++) {
    const sp = document.createElement('div');
    sp.className = 'pt-cell empty';
    grid.appendChild(sp);
  }
  F_BLOCK_ROWS.forEach(addRow);

  const novelRow = $('ptable-novel');
  novelRow.innerHTML = '';
  for (const el of NOVEL_ELEMENTS) {
    const status = elementStatus(el.symbol);
    const cell = document.createElement('button');
    cell.className = `pt-cell novel ${status.toLowerCase()}`;
    cell.innerHTML = `<small>${el.z}</small><b>${el.symbol}</b><i>${status}</i>`;
    cell.addEventListener('click', () => renderElementDetail(el));
    novelRow.appendChild(cell);
  }
  renderElementDetail(NOVEL_ELEMENTS[0]);
}

function renderElementDetail(el) {
  const d = $('pt-detail');
  const status = elementStatus(el.symbol);
  d.innerHTML = `
    <div class="ptd-head">
      <span class="ptd-z">${el.z}</span>
      <span class="ptd-symbol">${el.symbol}</span>
      <div>
        <h3>${el.name}</h3>
        <p class="ptd-group">${el.group}</p>
      </div>
      <span class="ptd-status ${status.toLowerCase()}">${status}</span>
    </div>
    <div class="ptd-grid">
      <div><span>Half-life</span><strong>${el.halfLife}</strong></div>
      <div><span>Phase</span><strong>${el.phase}</strong></div>
      <div><span>Density</span><strong>${el.density}</strong></div>
      <div><span>Origin</span><strong>${el.origin}</strong></div>
    </div>
    <p class="ptd-key">${el.keyProperty}</p>
    <p class="ptd-earth">⚠ NOT FOUND ON EARTH — ${el.earthNote}</p>
    <p class="ptd-note">${el.note}</p>
  `;
}

// ── Journal ─────────────────────────────────────────────────────────────────

function renderJournal() {
  const root = $('journal-list');
  root.innerHTML = '';
  if (state.discoveries.length === 0) {
    root.innerHTML = '<p class="muted">The catalogue is empty. Go look. That is the whole job, Doctor. — H.</p>';
    return;
  }
  for (const d of [...state.discoveries].reverse()) {
    let planetName = 'Unknown location';
    try { planetName = resolvePlanet(d.planet).name; } catch { /* keep fallback */ }
    const tierLabel = LIFE_TIERS[d.tier] || 'Unclassified — declined to be catalogued';
    const card = document.createElement('div');
    card.className = `journal-card tier-${d.tier}`;
    card.innerHTML = `
      <h4>${d.name}</h4>
      <p>${tierLabel}</p>
      <small>${planetName}</small>
    `;
    root.appendChild(card);
  }
}

// ── Fabricator ──────────────────────────────────────────────────────────────

function renderFabricator() {
  const root = $('fab-body');
  if (state.imagerBuilt) {
    root.innerHTML = `
      <div class="fab-done">
        <h3>✓ Temporal Imager — ONLINE</h3>
        <p>Chronium phase lens, thermal-shock-stable housing. Sensor key 4.</p>
        <p class="muted">“I have run no simulations of what we are about to see.” — H.</p>
      </div>`;
    return;
  }
  root.innerHTML = `
    <p class="fab-intro">Fabrication is a properties puzzle, not a recipe. Each slot demands a
    <em>property</em>; match it from sampled materials. Wrong guesses teach — materials are never lost.</p>
    <h3 class="fab-title">${IMAGER_RECIPE.name}</h3>
    <div class="fab-slots" id="fab-slots"></div>
    <h4 class="fab-inv-title">Sampled materials</h4>
    <div class="fab-inv" id="fab-inv"></div>
    <button class="btn primary" id="fab-build">Assemble</button>
    <p class="fab-result" id="fab-result"></p>
  `;
  drawFabSlots();
  drawFabInventory();
  $('fab-build').addEventListener('click', attemptBuild);
}

function drawFabSlots() {
  const root = $('fab-slots');
  root.innerHTML = '';
  for (const slot of IMAGER_RECIPE.slots) {
    const el = document.createElement('div');
    const assigned = fabSlots[slot.id];
    el.className = `fab-slot ${assigned ? 'filled' : ''}`;
    el.innerHTML = `
      <span class="fab-slot-label">${slot.label}</span>
      <span class="fab-slot-req">needs: ${slot.requires}</span>
      <strong>${assigned ? MATERIALS[assigned].name : '— empty —'}</strong>
      <small>${assigned ? 'click to clear' : slot.hint}</small>
    `;
    el.addEventListener('click', () => {
      fabSlots[slot.id] = null;
      drawFabSlots();
      drawFabInventory();
    });
    root.appendChild(el);
  }
}

function drawFabInventory() {
  const root = $('fab-inv');
  root.innerHTML = '';
  if (state.inventory.length === 0) {
    root.innerHTML = '<p class="muted">Nothing sampled yet. Scan glowing deposits on the surface (hold E).</p>';
    return;
  }
  for (const id of state.inventory) {
    if (Object.values(fabSlots).includes(id)) continue;
    const m = MATERIALS[id];
    const chip = document.createElement('button');
    chip.className = 'fab-chip';
    chip.innerHTML = `<b>${m.name}</b><span>${m.props.join(' · ')}</span>`;
    chip.title = m.desc;
    chip.addEventListener('click', () => {
      if (!fabSlots.lens) fabSlots.lens = id;
      else if (!fabSlots.housing) fabSlots.housing = id;
      drawFabSlots();
      drawFabInventory();
    });
    root.appendChild(chip);
  }
}

function attemptBuild() {
  const result = $('fab-result');
  if (!fabSlots.lens || !fabSlots.housing) {
    result.textContent = 'Both slots need a material, Doctor.';
    return;
  }
  const lensOk = MATERIALS[fabSlots.lens].props.includes('temporal-refraction');
  const housingOk = MATERIALS[fabSlots.housing].props.includes('thermal-shock-stable');
  if (lensOk && housingOk) {
    state.imagerBuilt = true;
    closeModals();
    play('imagerBuilt');
    onImagerBuilt?.();
  } else {
    const housing = fabSlots.housing;
    fabSlots.lens = null;
    fabSlots.housing = null;
    closeModals();
    if (housing === 'greeterChitin') play('fabFailChitin');
    else if (housing === 'levitine') play('fabFailLevitine');
    else play('fabFailGeneric');
  }
}

// ── End screen ──────────────────────────────────────────────────────────────

export function showEndScreen() {
  const lifeCount = state.discoveries.length;
  const sampledNovel = NOVEL_ELEMENTS.filter((el) =>
    state.inventory.some((id) => MATERIALS[id]?.element === el.symbol)).length;
  $('end-stats').innerHTML = `
    <div><strong>${lifeCount}</strong><span>lifeform entries catalogued</span></div>
    <div><strong>${sampledNovel} / ${NOVEL_ELEMENTS.length}</strong><span>novel elements sampled</span></div>
    <div><strong>${state.visited.size} / 3</strong><span>worlds surveyed</span></div>
  `;
  $('end-screen').classList.add('open');
  document.exitPointerLock?.();
}
