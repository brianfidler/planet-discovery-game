// Talk to Halley: a chat overlay (T key). Tries the Claude-powered
// /api/halley endpoint first; falls back to the offline response bank when
// the endpoint is unavailable. Replies are spoken via the dialogue system.

import { state } from './state.js';
import { say } from './halley.js';
import { offlineReply } from './halleyBrain.js';
import { getPlanet } from './data/planets.js';
import { MATERIALS } from './data/elements.js';

const HISTORY_LIMIT = 16;
const REQUEST_TIMEOUT_MS = 15000;

const history = []; // { role: 'user' | 'assistant', content }
let busy = false;
let els = null;

export function initChat() {
  els = {
    overlay: document.getElementById('chat-overlay'),
    log: document.getElementById('chat-log'),
    input: document.getElementById('chat-input'),
    send: document.getElementById('chat-send'),
    close: document.getElementById('chat-close'),
  };
  els.send.addEventListener('click', sendMessage);
  els.close.addEventListener('click', closeChat);
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape') closeChat();
    e.stopPropagation();
  });
}

export function isChatOpen() {
  return els?.overlay.classList.contains('open') || false;
}

export function toggleChat() {
  if (isChatOpen()) closeChat();
  else openChat();
}

export function openChat() {
  els.overlay.classList.add('open');
  document.exitPointerLock?.();
  setTimeout(() => els.input.focus(), 50);
}

export function closeChat() {
  els.overlay.classList.remove('open');
  els.input.blur();
}

function appendLine(speaker, text, cls) {
  const line = document.createElement('div');
  line.className = `chat-line ${cls}`;
  const who = document.createElement('span');
  who.textContent = speaker;
  const body = document.createElement('p');
  body.textContent = text;
  line.appendChild(who);
  line.appendChild(body);
  els.log.appendChild(line);
  els.log.scrollTop = els.log.scrollHeight;
  return line;
}

function buildContext() {
  return {
    planet: state.planet ? getPlanet(state.planet).name : null,
    sensor: state.sensor,
    objective: document.getElementById('objective')?.textContent || '',
    discoveries: state.discoveries.map((d) => d.name),
    inventory: state.inventory.map((id) => MATERIALS[id]?.name || id),
    imagerBuilt: state.imagerBuilt,
  };
}

async function askClaude(message) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch('/api/halley', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context: buildContext() }),
      signal: controller.signal,
    });
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      return { reply: data.error || 'Channel congestion, Doctor. A moment.', online: true };
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.reply) return null;
    return { reply: data.reply, online: true };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function sendMessage() {
  if (busy) return;
  const message = els.input.value.trim();
  if (!message) return;
  els.input.value = '';
  busy = true;
  els.send.disabled = true;
  appendLine('DOCTOR', message, 'you');
  const thinking = appendLine('HALLEY', '· · ·', 'halley thinking');

  const result = (await askClaude(message)) || { reply: offlineReply(message), online: false };

  thinking.remove();
  appendLine(result.online ? 'HALLEY' : 'HALLEY · local cache', result.reply, 'halley');
  say(result.reply); // also spoken + shown in the main dialogue box

  history.push({ role: 'user', content: message });
  history.push({ role: 'assistant', content: result.reply });
  while (history.length > HISTORY_LIMIT) history.shift();

  busy = false;
  els.send.disabled = false;
  els.input.focus();
}
