// Cielo (Batalla de Inglaterra / Normandía): paracaidistas, globo, planeador, caza y bombardero.
import * as THREE from 'three';
import { put, rbox, cyl, sphere, person, camo, grime, TEX, M, STEEL, BLACK } from '../kit.js';
import { plane } from '../craft.js';

/** Paracaídas visto desde arriba: gajos alternando dos colores. */
function canopy(r, colors) {
  const g = new THREE.Group();
  const n = 12;
  for (let i = 0; i < n; i++) {
    const geo = new THREE.SphereGeometry(r, 8, 10, (i / n) * Math.PI * 2, (Math.PI * 2) / n, 0, Math.PI / 2.4);
    put(g, new THREE.Mesh(geo, M(colors[i % 2], 0.8, 0, { side: THREE.DoubleSide })));
  }
  g.scale.y = 0.55;
  return g;
}

export function paratrooper() {
  const g = new THREE.Group();
  put(g, canopy(0.42, [0x6b7350, 0x55603d]), 0, 0.55, -0.42);
  put(g, person({ uniform: M(0x5f6747, 0.85, 0), helmet: M(0x4e563a, 0.7, 0.1), pack: M(0x3e3f2c), scale: 1.6 }), 0.12, 0, 0.45);
  put(g, canopy(0.3, [0xd8d3c0, 0xb9b39d]), -0.12, 0.35, 0.62);
  return g;
}

export function balloon() {
  const g = new THREE.Group();
  const skin = TEX(grime('#9fa39a', 0.18), 0.55, 0.05);
  put(g, sphere(0.62, skin, 1, 0.9, 1.25), 0, 0.7, 0.05);
  for (const [x, z, ry] of [[0, 0.75, 0], [-0.32, 0.6, 0.5], [0.32, 0.6, -0.5]]) {
    put(g, rbox(0.03, 0.32, 0.3, skin, 0.01), x, 0.75, z, 0, ry, 0);
  }
  for (let i = 0; i < 8; i++) put(g, rbox(0.015, 0.005, 1.4, M(0x7a7d74, 0.6, 0)), 0, 1.22, 0.05, 0, (i * Math.PI) / 8, 0);
  put(g, cyl(0.004, 0.004, 0.7, BLACK, 4), 0, 0.3, 0.05);
  return g;
}

export function glider() {
  const g = plane({ len: 0.9, span: 3.8, r: 0.07, mat: TEX(grime('#c9c5b4', 0.15), 0.6, 0.1), root: 0.3, tip: 0.12, sweep: 0.06, tailSpan: 0.6 });
  g.rotation.y = Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(g);
  return holder;
}

export function fighter(paint = TEX(camo(['#5c6648', '#3f4831', '#7d7b5a'], 1, 45), 0.55, 0.35)) {
  return plane({ len: 2.4, span: 1.9, r: 0.14, mat: paint, wingZ: -0.1, root: 0.7, tip: 0.22, sweep: 0.15,
    tailSpan: 0.75, props: true, canopyZ: -0.2 });
}

export function bomber() {
  const paint = TEX(grime('#5a6052', 0.2), 0.6, 0.3);
  const g = plane({ len: 2.6, span: 2.95, r: 0.19, mat: paint, wingZ: -0.15, root: 0.62, tip: 0.24, sweep: 0.05,
    tailSpan: 1.1, engines: [[-0.55, -0.45], [-1.0, -0.4], [0.55, -0.45], [1.0, -0.4]], engineR: 0.07, props: true });
  put(g, sphere(0.1, M(0x1d2a38, 0.1, 0.5), 1, 1, 1.3), 0, 0, -1.25);
  put(g, rbox(0.04, 0.04, 0.1, STEEL), 0, 0.2, 0.35);
  return g;
}

export const SKY = {
  paratrooper: { w: 1, h: 2, build: paratrooper, altitude: 0.4 },
  balloon: { w: 2, h: 2, build: balloon, altitude: 0.3 },
  glider: { w: 1, h: 4, build: glider, altitude: 0.6 },
  fighter: { w: 2, h: 3, build: () => fighter(), altitude: 0.7 },
  bomber: { w: 3, h: 3, build: bomber, altitude: 0.8 },
};
