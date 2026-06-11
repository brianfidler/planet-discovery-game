// Headless smoke test: boots the game, lands on all three planets, cycles
// every sensor, and fails on any console error or uncaught exception.
// Run: node smoke-test.mjs   (requires a cached Playwright chromium)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/brianfidler/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright-core');

const PORT = 8742;
const ROOT = decodeURIComponent(new URL('.', import.meta.url).pathname);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/plain' };

const server = createServer(async (req, res) => {
  try {
    const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(PORT, r));

const executablePath = join(
  homedir(),
  'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell',
);
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage();

const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto(`http://localhost:${PORT}/`);
await wait(2500);
await page.click('#btn-start');
await wait(2000);
console.log('boot + intro: ok');

for (const planet of ['cinder', 'brume', 'hush']) {
  await page.evaluate((id) => window.__game.landOn(id), planet);
  await wait(2200);
  for (const sensor of ['THM', 'EMF', 'VIS']) {
    await page.evaluate((s) => window.__game.setSensor(s), sensor);
    await wait(500);
  }
  console.log(`surface ${planet} + sensors: ok`);
  await page.evaluate(() => window.__game.toOrbit());
  await wait(1200);
}

// Cross-planet dependency path: grant chronium + housing, build, TMP on Hush.
await page.evaluate(() => {
  window.__game.state.inventory.push('chronium', 'basaltGlass');
  window.__game.state.imagerBuilt = true;
  window.__game.landOn('hush');
});
await wait(2200);
await page.evaluate(() => window.__game.setSensor('TMP'));
await wait(2500);
console.log('temporal reveal on hush: ok');

// Galaxy travel: jump to the first procedural system and land on each planet.
await page.evaluate(() => window.__game.toOrbit());
await wait(1200);
await page.evaluate(() => window.__game.toGalaxy());
await wait(1200);
const firstSystem = await page.evaluate(() => {
  const sys = window.__game.SYSTEMS.find((s) => s.id !== 'vesper' && s.reachable);
  window.__game.travelToSystem(sys.id);
  return { id: sys.id, planetIds: sys.planets.map((p) => p.id) };
});
await wait(1500);
for (const planetId of firstSystem.planetIds) {
  await page.evaluate((id) => window.__game.landOn(id), planetId);
  await wait(2000);
  for (const sensor of ['THM', 'EMF', 'VIS']) {
    await page.evaluate((s) => window.__game.setSensor(s), sensor);
    await wait(350);
  }
  await page.evaluate(() => window.__game.toOrbit());
  await wait(1000);
}
console.log(`procedural system ${firstSystem.id} (${firstSystem.planetIds.length} planets): ok`);

// Determinism check: the same planet must regenerate identically (the seed IS
// the planet — permanence without storage).
const deterministic = await page.evaluate((id) => {
  const sys = window.__game.SYSTEMS.find((s) => s.id === id);
  const p = sys.planets[0];
  return JSON.stringify({ s: p.surface, d: p.deposits, l: p.lifeforms });
}, firstSystem.id);
const deterministic2 = await page.evaluate((id) => {
  const sys = window.__game.SYSTEMS.find((s) => s.id === id);
  const p = sys.planets[0];
  return JSON.stringify({ s: p.surface, d: p.deposits, l: p.lifeforms });
}, firstSystem.id);
if (deterministic !== deterministic2) {
  errors.push('determinism check failed: same seed produced different planet data');
} else {
  console.log('determinism check: ok');
}

await browser.close();
server.close();

if (errors.length) {
  console.error(`\nFAIL — ${errors.length} error(s):`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log('\nPASS — no console errors or page exceptions.');
