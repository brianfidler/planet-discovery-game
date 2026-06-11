// The Vesper system view: star, three orbiting planets, orbit rings,
// a starfield, and click-to-select. Travel happens from here.

import * as THREE from 'three';
import { PLANETS, STAR } from './data/planets.js';

export function buildSystemScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030308);

  const star = new THREE.Mesh(
    new THREE.SphereGeometry(6, 32, 24),
    new THREE.MeshBasicMaterial({ color: STAR.color }),
  );
  scene.add(star);
  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(7.4, 32, 24),
    new THREE.MeshBasicMaterial({ color: STAR.color, transparent: true, opacity: 0.18, side: THREE.BackSide }),
  );
  scene.add(corona);
  const starLight = new THREE.PointLight(0xffd9a8, 2200, 0, 1.8);
  scene.add(starLight);
  scene.add(new THREE.AmbientLight(0x334455, 0.5));

  const planetMeshes = [];
  for (const p of PLANETS) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(p.orbitRadius - 0.06, p.orbitRadius + 0.06, 128),
      new THREE.MeshBasicMaterial({ color: 0x2a3344, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.bodyRadius, 28, 20),
      new THREE.MeshStandardMaterial({ color: p.bodyColor, roughness: 0.85 }),
    );
    mesh.userData.planetId = p.id;
    scene.add(mesh);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(p.bodyRadius * 1.25, 28, 20),
      new THREE.MeshBasicMaterial({ color: 0x66ddff, transparent: true, opacity: 0, side: THREE.BackSide }),
    );
    scene.add(halo);

    planetMeshes.push({ cfg: p, mesh, halo });
  }

  // Hush pulses faintly in the map view — the Hum, visible from orbit.
  const hushEntry = planetMeshes.find((p) => p.cfg.id === 'hush');

  // Background starfield
  const COUNT = 2400;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 500 + Math.random() * 700;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9aa6cc, size: 1.1, sizeAttenuation: false })));

  let selectedId = null;

  function update(dt, elapsed) {
    for (const { cfg, mesh, halo } of planetMeshes) {
      const a = elapsed * cfg.orbitSpeed + cfg.orbitPhase;
      mesh.position.set(Math.cos(a) * cfg.orbitRadius, 0, Math.sin(a) * cfg.orbitRadius);
      mesh.rotation.y += dt * 0.2;
      halo.position.copy(mesh.position);
      halo.material.opacity = cfg.id === selectedId ? 0.25 + 0.1 * Math.sin(elapsed * 3) : 0;
    }
    if (hushEntry) {
      const pulse = 0.85 + 0.15 * Math.sin(elapsed * 2.2);
      hushEntry.mesh.material.emissive = hushEntry.mesh.material.emissive || new THREE.Color();
      hushEntry.mesh.material.emissive.setHex(0x221133);
      hushEntry.mesh.material.emissiveIntensity = pulse;
    }
    corona.scale.setScalar(1 + 0.02 * Math.sin(elapsed * 1.3));
  }

  function setSelected(id) {
    selectedId = id;
  }

  function getPlanetMeshes() {
    return planetMeshes.map((p) => p.mesh);
  }

  return { scene, update, setSelected, getPlanetMeshes };
}
