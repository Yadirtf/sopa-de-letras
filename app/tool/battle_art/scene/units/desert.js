// Desierto (El Alamein, 1942): soldados, jeep, camión, tanque y avión de ataque.
import * as THREE from 'three';
import { put, rbox, cyl, sphere, wheel, track, person, camo, grime, TEX, M, GLASS, STEEL, BLACK, RUBBER } from '../kit.js';
import { plane } from '../craft.js';

const SAND = ['#8a7346', '#5e4c2c', '#a99064', '#463a24'];
const KHAKI = M(0x9c8150, 0.85, 0);

export function soldier() {
  const g = new THREE.Group();
  const helmet = TEX(camo(['#8b7a4f', '#6e6038', '#a8945f'], 1, 20), 0.8, 0.1);
  put(g, person({ uniform: KHAKI, helmet, pack: M(0x6d5f3d), scale: 1.9 }), 0, 0, -0.45);
  put(g, person({ uniform: KHAKI, helmet, pack: M(0x6d5f3d), scale: 1.9 }), 0.04, 0, 0.5, 0, 0.12, 0);
  return g;
}

export function jeep() {
  const g = new THREE.Group();
  const paint = TEX(camo(SAND, 1, 40), 0.75, 0.25);
  put(g, rbox(0.62, 0.22, 2.3, paint, 0.06), 0, 0.3, 0);
  put(g, rbox(0.58, 0.12, 0.7, paint, 0.05), 0, 0.46, -0.75);
  put(g, rbox(0.56, 0.2, 0.03, GLASS, 0.01), 0, 0.55, -0.38, -0.5);
  for (const x of [-0.17, 0.17]) put(g, rbox(0.2, 0.08, 0.22, M(0x3d3529, 0.9, 0)), x, 0.45, -0.15);
  put(g, rbox(0.52, 0.16, 0.7, M(0x6f6040, 0.9, 0)), 0, 0.46, 0.55);
  put(g, rbox(0.1, 0.1, 0.18, M(0x5a6a3a, 0.8, 0)), -0.15, 0.58, 0.45);
  put(g, rbox(0.12, 0.08, 0.14, M(0x5a6a3a, 0.8, 0)), 0.14, 0.57, 0.68);
  put(g, cyl(0.025, 0.025, 0.25, STEEL, 8), 0, 0.62, 0.2);
  put(g, rbox(0.04, 0.05, 0.36, BLACK, 0.01), 0, 0.76, 0.1);
  put(g, wheel(0.14, 0.1), 0, 0.42, 1.18, Math.PI / 2);
  for (const z of [-0.75, 0.75]) for (const x of [-0.33, 0.33]) put(g, wheel(0.16, 0.12), x, 0.16, z);
  return g;
}

export function truck() {
  const g = new THREE.Group();
  const paint = TEX(grime('#75653f', 0.2), 0.8, 0.2);
  put(g, rbox(0.66, 0.1, 3.5, M(0x2f2c27, 0.8, 0.4), 0.02), 0, 0.22, 0);
  put(g, rbox(0.62, 0.32, 0.55, paint, 0.06), 0, 0.42, -1.45);
  put(g, rbox(0.66, 0.34, 0.55, paint, 0.06), 0, 0.5, -0.95);
  put(g, rbox(0.58, 0.2, 0.03, GLASS, 0.01), 0, 0.6, -1.23, -0.35);
  const canvas = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 2.3, 24, 1, false, -Math.PI / 2, Math.PI),
    TEX(grime('#6f6040', 0.25, 2), 0.95, 0, { side: THREE.DoubleSide }),
  );
  put(g, rbox(0.68, 0.22, 2.3, paint, 0.03), 0, 0.42, 0.45);
  put(g, canvas, 0, 0.53, 0.45, -Math.PI / 2);
  for (let i = -3; i <= 3; i++) put(g, cyl(0.012, 0.012, 0.7, M(0x5b5038), 6), 0, 0.84, 0.45 + i * 0.33, 0, 0, Math.PI / 2);
  for (const z of [-1.3, 0.4, 1.0]) for (const x of [-0.33, 0.33]) put(g, wheel(0.18, 0.13), x, 0.18, z);
  return g;
}

export function tank(paintTex = camo(SAND, 1, 60)) {
  const g = new THREE.Group();
  const paint = TEX(paintTex, 0.7, 0.35);
  for (const x of [-0.68, 0.68]) put(g, track(2.6, 0.36, 0.34), x, 0, 0);
  put(g, rbox(1.12, 0.3, 2.5, paint, 0.08), 0, 0.42, 0.02);
  put(g, rbox(1.66, 0.05, 2.62, paint, 0.02), 0, 0.37, 0);
  put(g, rbox(1.08, 0.12, 0.5, paint, 0.06), 0, 0.42, -1.18, 0.35);
  const turret = put(g, new THREE.Group(), 0, 0.57, 0.12);
  put(turret, sphere(0.48, paint, 1, 0.42, 1.25), 0, 0.05, 0);
  put(turret, cyl(0.12, 0.12, 0.12, paint), 0.18, 0.22, 0.12);
  put(turret, cyl(0.07, 0.07, 0.1, M(0x2c2a24, 0.6, 0.5)), -0.2, 0.23, 0.15);
  put(turret, rbox(0.3, 0.12, 0.2, paint, 0.04), 0, 0.06, 0.6);
  put(turret, cyl(0.045, 0.06, 1.35, paint, 16), 0, 0.08, -1.1, Math.PI / 2);
  put(turret, cyl(0.07, 0.07, 0.16, M(0x3a3628, 0.6, 0.5), 16), 0, 0.08, -1.76, Math.PI / 2);
  for (const x of [-0.55, 0.55]) put(g, rbox(0.14, 0.12, 0.3, M(0x6a5a3a, 0.9, 0)), x, 0.6, 0.95);
  return g;
}

export function attackPlane() {
  const paint = TEX(camo(['#a08458', '#74603c', '#c2a873', '#5c4a30'], 1, 50), 0.6, 0.35);
  return plane({ len: 2.6, span: 2.8, r: 0.17, mat: paint, wingZ: 0.05, root: 0.62, tip: 0.36, sweep: 0.05,
    tailSpan: 1.0, engines: [[-0.3, 0.75], [0.3, 0.75]], engineR: 0.1 });
}

export const DESERT = {
  soldier: { w: 1, h: 2, build: soldier },
  jeep: { w: 1, h: 3, build: jeep },
  truck: { w: 1, h: 4, build: truck },
  tank: { w: 2, h: 3, build: () => tank() },
  'attack-plane': { w: 3, h: 3, build: attackPlane, altitude: 0.7 },
};
