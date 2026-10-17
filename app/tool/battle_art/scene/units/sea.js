// Mar (Midway, 1942): buzos, lancha torpedera, submarino, destructor y portaaviones.
import * as THREE from 'three';
import { put, rbox, cyl, sphere, person, grime, TEX, M, GLASS, STEEL, BLACK } from '../kit.js';
import { hull, navalGun, plane } from '../craft.js';

const NAVY = () => TEX(grime('#5e6872', 0.18), 0.6, 0.35);
const DECK = () => TEX(grime('#4b4a46', 0.22, 2), 0.85, 0.1);

export function diver() {
  const g = new THREE.Group();
  const suit = M(0x15191d, 0.45, 0.1);
  for (const [x, z, r] of [[-0.08, -0.45, 0.1], [0.1, 0.45, -0.15]]) {
    const d = put(g, person({ uniform: suit, helmet: M(0x222a30, 0.3, 0.2), pack: M(0xd9b13a, 0.35, 0.6), gun: false, prone: true, scale: 1.5 }), x, 0, z - 0.3, 0, r, 0);
    for (const s of [-1, 1]) put(d, rbox(0.07, 0.01, 0.12, M(0xe3c22c, 0.5, 0)), s * 0.06, 0.03, 0.47, 0, s * 0.2, 0);
  }
  return g;
}

export function torpedoBoat() {
  const g = new THREE.Group();
  put(g, hull({ len: 2.7, beam: 0.62, height: 0.18, mat: NAVY(), deck: DECK(), bow: 0.4 }));
  put(g, rbox(0.34, 0.22, 0.5, NAVY(), 0.05), 0, 0.35, -0.15);
  put(g, rbox(0.3, 0.1, 0.03, GLASS, 0.01), 0, 0.42, -0.41, -0.4);
  for (const x of [-0.22, 0.22]) put(g, cyl(0.06, 0.06, 0.9, M(0x40464c, 0.5, 0.6), 16), x, 0.28, 0.65, Math.PI / 2);
  put(g, cyl(0.08, 0.08, 0.06, M(0x40464c, 0.5, 0.5)), 0, 0.3, -0.75);
  put(g, rbox(0.03, 0.04, 0.3, BLACK, 0.01), 0, 0.35, -0.9);
  return g;
}

export function submarine() {
  const g = new THREE.Group();
  const skin = TEX(grime('#2b3036', 0.15), 0.55, 0.4);
  put(g, sphere(0.3, skin, 1, 0.55, 6.2), 0, 0.12, 0);
  put(g, rbox(0.2, 0.28, 0.6, skin, 0.08), 0, 0.33, -0.35);
  put(g, rbox(0.42, 0.03, 0.12, skin, 0.01), 0, 0.38, -0.3);
  for (const [y, h] of [[0.55, 0.22], [0.6, 0.16]]) put(g, cyl(0.015, 0.015, h, STEEL, 8), 0.03, y, -0.45);
  put(g, rbox(0.7, 0.03, 0.12, skin, 0.01), 0, 0.12, 1.6);
  put(g, rbox(0.03, 0.25, 0.16, skin, 0.01), 0, 0.2, 1.65);
  return g;
}

export function destroyer() {
  const g = new THREE.Group();
  put(g, hull({ len: 4.6, beam: 0.7, height: 0.24, mat: NAVY(), deck: DECK(), bow: 0.35 }));
  put(g, navalGun(NAVY(), 0.16), 0, 0.26, -1.45);
  put(g, navalGun(NAVY(), 0.16), 0, 0.26, -1.0);
  put(g, rbox(0.42, 0.34, 0.7, NAVY(), 0.04), 0, 0.42, -0.35);
  put(g, rbox(0.36, 0.08, 0.04, GLASS, 0.01), 0, 0.56, -0.71);
  put(g, cyl(0.02, 0.02, 0.6, STEEL, 8), 0, 0.85, -0.2);
  put(g, rbox(0.4, 0.02, 0.04, STEEL, 0.005), 0, 1.0, -0.2);
  for (const z of [0.3, 0.75]) put(g, cyl(0.1, 0.12, 0.4, M(0x3b3f44, 0.6, 0.4)), 0, 0.45, z);
  put(g, cyl(0.06, 0.06, 0.6, M(0x4a5056, 0.5, 0.6), 12), 0.15, 0.32, 1.25, Math.PI / 2);
  put(g, navalGun(NAVY(), 0.16), 0, 0.26, 1.8, 0, Math.PI, 0);
  return g;
}

export function carrier() {
  const g = new THREE.Group();
  put(g, hull({ len: 4.7, beam: 1.4, height: 0.22, mat: NAVY(), deck: M(0x2f2f2e, 0.9, 0.05), bow: 0.25, stern: 0.98 }));
  put(g, rbox(1.62, 0.04, 4.4, TEX(grime('#383836', 0.2, 3), 0.9, 0.05), 0.02), -0.08, 0.27, 0.05);
  const paint = M(0xe8e3d2, 0.6, 0);
  put(g, rbox(0.03, 0.005, 3.8, paint), -0.08, 0.295, 0.1);
  for (let z = -1.8; z < 2.1; z += 0.35) put(g, rbox(0.12, 0.005, 0.03, paint), -0.08, 0.296, z);
  put(g, rbox(0.03, 0.005, 2.0, M(0xe0b53a, 0.6, 0)), -0.4, 0.295, -0.6, 0, 0.12, 0);
  put(g, rbox(0.28, 0.5, 0.7, NAVY(), 0.04), 0.62, 0.5, 0.35);
  put(g, rbox(0.24, 0.08, 0.03, GLASS, 0.01), 0.62, 0.65, -0.01);
  put(g, cyl(0.02, 0.02, 0.5, STEEL, 8), 0.62, 0.95, 0.4);
  const jet = TEX(grime('#7b8590', 0.15), 0.5, 0.4);
  for (const [x, z, r] of [[-0.45, 1.2, 0.3], [0.05, 1.55, 0.25], [-0.5, 1.75, 0.35]]) {
    const p = put(g, plane({ len: 0.55, span: 0.42, r: 0.04, mat: jet, root: 0.2, tip: 0.06, sweep: 0.12 }), x, 0.24, z, 0, r, 0);
    p.scale.setScalar(1);
  }
  return g;
}

export const SEA = {
  diver: { w: 1, h: 2, build: diver },
  'torpedo-boat': { w: 1, h: 3, build: torpedoBoat },
  submarine: { w: 1, h: 4, build: submarine },
  destroyer: { w: 1, h: 5, build: destroyer },
  carrier: { w: 2, h: 5, build: carrier },
};
