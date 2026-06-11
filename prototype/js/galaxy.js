// The galaxy map: every known star system as a clickable star. Vesper pulses
// (it is the source of the Hum); out-of-range systems sit dim at the edges.

import * as THREE from 'three';

export function buildGalaxyScene(systems) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020208);
  scene.add(new THREE.AmbientLight(0x445566, 1.2));

  const starEntries = [];
  for (const sys of systems) {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 20, 14),
      new THREE.MeshBasicMaterial({
        color: sys.starColor,
        transparent: true,
        opacity: sys.reachable ? 1 : 0.35,
      }),
    );
    core.position.set(sys.position.x, 0, sys.position.z);
    core.userData.systemId = sys.id;
    scene.add(core);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 20, 14),
      new THREE.MeshBasicMaterial({
        color: sys.starColor,
        transparent: true,
        opacity: sys.reachable ? 0.15 : 0.05,
        side: THREE.BackSide,
      }),
    );
    halo.position.copy(core.position);
    scene.add(halo);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6.5, 6.8, 48),
      new THREE.MeshBasicMaterial({ color: 0x7fd8e8, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(core.position);
    scene.add(ring);

    starEntries.push({ sys, core, halo, ring });
  }

  // Distant background field
  const COUNT = 3000;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 600 + Math.random() * 900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8a96bc, size: 1.0, sizeAttenuation: false })));

  let selectedId = null;

  function update(dt, elapsed) {
    for (const entry of starEntries) {
      if (entry.sys.id === 'vesper') {
        // The Hum, visible from interstellar space.
        entry.halo.material.opacity = 0.12 + 0.1 * Math.sin(elapsed * 2.2);
        entry.halo.scale.setScalar(1 + 0.06 * Math.sin(elapsed * 2.2));
      }
      entry.ring.material.opacity = entry.sys.id === selectedId
        ? 0.5 + 0.2 * Math.sin(elapsed * 3)
        : 0;
    }
  }

  function setSelected(id) {
    selectedId = id;
  }

  function getStarMeshes() {
    return starEntries.map((e) => e.core);
  }

  return { scene, update, setSelected, getStarMeshes };
}
