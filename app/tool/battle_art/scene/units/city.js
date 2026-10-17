// Ciudad (Stalingrado, 1942): francotirador, ambulancia, barricada, tanque urbano y tren blindado.
import * as THREE from 'three';
import { put, rbox, cyl, sphere, person, wheel, camo, grime, rand, TEX, M, GLASS, STEEL, BLACK } from '../kit.js';
import { tank } from './desert.js';

export function sniper() {
  const g = new THREE.Group();
  const ghillie = TEX(camo(['#5b5a4a', '#3f3e33', '#6f6c58', '#2e2d26'], 1, 60), 0.95, 0);
  const p = put(g, person({ uniform: ghillie, helmet: M(0x45443a, 0.9, 0), gun: false, prone: true, scale: 1.9 }), 0, 0, 0.1);
  put(p, rbox(0.022, 0.025, 0.55, BLACK, 0.008), 0.05, 0.08, -0.3);
  put(p, cyl(0.014, 0.014, 0.12, STEEL, 8), 0.05, 0.11, -0.15, Math.PI / 2);
  for (let i = 0; i < 6; i++) put(g, rbox(0.12 + rand() * 0.1, 0.06, 0.1, M(0x7d776d, 0.95, 0)), (rand() - 0.5) * 0.7, 0.03, -0.75 + rand() * 0.25, 0, rand() * 3, 0);
  return g;
}

export function ambulance() {
  const g = new THREE.Group();
  const paint = TEX(grime('#d9d6cc', 0.15), 0.6, 0.2);
  put(g, rbox(0.64, 0.3, 0.6, paint, 0.06), 0, 0.32, -1.0);
  put(g, rbox(0.58, 0.18, 0.03, GLASS, 0.01), 0, 0.45, -0.73, -0.4);
  put(g, rbox(0.7, 0.5, 1.75, paint, 0.06), 0, 0.42, 0.35);
  const red = M(0xb3201a, 0.5, 0);
  put(g, rbox(0.42, 0.01, 0.12, red), 0, 0.675, 0.35);
  put(g, rbox(0.12, 0.01, 0.42, red), 0, 0.676, 0.35);
  put(g, rbox(0.2, 0.05, 0.08, M(0x2a5fbf, 0.3, 0.2, { emissive: 0x1f4fd0, emissiveIntensity: 0.6 })), 0, 0.5, -0.78);
  for (const z of [-0.95, 0.85]) for (const x of [-0.34, 0.34]) put(g, wheel(0.15, 0.1), x, 0.15, z);
  return g;
}

export function barricade() {
  const g = new THREE.Group();
  const bag = TEX(grime('#8b7a55', 0.25), 0.95, 0);
  for (let i = 0; i < 12; i++) {
    const z = -1.6 + (i % 6) * 0.42, x = i < 6 ? -0.12 : 0.12;
    put(g, sphere(0.16, bag, 0.9, 0.5, 1.3), x, i < 6 ? 0.08 : 0.2, z + (i < 6 ? 0 : 0.2), 0, rand() * 0.4, 0);
  }
  const concrete = TEX(grime('#8c8c88', 0.25), 0.9, 0.05);
  put(g, rbox(0.5, 0.35, 0.5, concrete, 0.03), 0, 0.18, 1.5, 0, 0.2, 0);
  const tri = M(0x3a3632, 0.6, 0.6);
  for (const [x, z] of [[0.3, -1.75], [-0.3, 0.95]]) {
    for (let k = 0; k < 3; k++) put(g, rbox(0.04, 0.04, 0.45, tri, 0.01), x, 0.15, z, 0.5, (k * Math.PI) / 3, 0);
  }
  return g;
}

export function cityTank() {
  return tank(camo(['#6e7068', '#4d4f49', '#8c8c82', '#3a3b37'], 1, 60));
}

export function armoredTrain() {
  const g = new THREE.Group();
  const wood = M(0x4a3726, 0.9, 0);
  for (let z = -2.4; z <= 2.4; z += 0.25) put(g, rbox(0.8, 0.04, 0.1, wood, 0.01), 0, 0.02, z);
  for (const x of [-0.25, 0.25]) put(g, rbox(0.04, 0.04, 5, STEEL, 0.01), x, 0.06, 0);
  const armor = TEX(camo(['#4e5640', '#3a4030', '#62694f'], 1, 50), 0.7, 0.4);
  put(g, cyl(0.25, 0.25, 1.4, M(0x2b2b2b, 0.5, 0.6), 20), 0, 0.42, -1.65, Math.PI / 2);
  put(g, rbox(0.62, 0.5, 0.7, armor, 0.04), 0, 0.42, -0.65);
  put(g, cyl(0.07, 0.09, 0.2, BLACK, 12), 0, 0.72, -2.1);
  put(g, rbox(0.66, 0.42, 2.0, armor, 0.04), 0, 0.38, 1.1);
  put(g, sphere(0.22, armor, 1, 0.5, 1), 0, 0.6, 0.6);
  put(g, cyl(0.03, 0.035, 0.55, armor, 10), 0, 0.64, 0.25, Math.PI / 2);
  put(g, sphere(0.22, armor, 1, 0.5, 1), 0, 0.6, 1.6);
  put(g, cyl(0.03, 0.035, 0.55, armor, 10), 0, 0.64, 2.0, -Math.PI / 2);
  return g;
}

export const CITY = {
  sniper: { w: 1, h: 2, build: sniper },
  ambulance: { w: 1, h: 3, build: ambulance },
  barricade: { w: 1, h: 4, build: barricade },
  'city-tank': { w: 2, h: 3, build: cityTank },
  'armored-train': { w: 1, h: 5, build: armoredTrain },
};
