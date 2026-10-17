// Selva (Vietnam / Pacífico): guerrilleros, lancha fluvial, cocodrilo, helicóptero y campamento.
import * as THREE from 'three';
import { put, rbox, cyl, sphere, person, camo, grime, rand, TEX, M, GLASS, STEEL, BLACK } from '../kit.js';
import { hull } from '../craft.js';

const LEAF = ['#3f5a2a', '#2b3f1c', '#5b7535', '#1f2b14'];

/** Mata de hojas: varios elipsoides verdes (camuflaje vegetal). */
function bush(r, n = 7) {
  const g = new THREE.Group();
  const mats = [M(0x3c5a26, 0.85, 0), M(0x2d4a1e, 0.85, 0), M(0x58773a, 0.85, 0)];
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2, d = rand() * r * 0.6;
    put(g, sphere(r * (0.35 + rand() * 0.25), mats[i % 3], 1, 0.5, 1.3), Math.cos(a) * d, r * 0.25, Math.sin(a) * d, 0, rand() * 3, 0);
  }
  return g;
}

export function guerrilla() {
  const g = new THREE.Group();
  const uniform = TEX(camo(LEAF, 1, 40), 0.85, 0);
  const hat = M(0x4d5a2c, 0.9, 0);
  put(g, person({ uniform, helmet: hat, pack: M(0x3e3a24), scale: 1.85 }), -0.05, 0, -0.45);
  put(g, person({ uniform, helmet: hat, pack: M(0x3e3a24), scale: 1.85 }), 0.05, 0, 0.5, 0, -0.2, 0);
  put(g, bush(0.22, 5), 0.3, 0, 0.05);
  put(g, bush(0.18, 4), -0.32, 0, 0.75);
  return g;
}

export function riverBoat() {
  const g = new THREE.Group();
  put(g, hull({ len: 2.6, beam: 0.62, height: 0.2, mat: TEX(grime('#3d4a33', 0.2), 0.7, 0.2), deck: M(0x5d5a48, 0.9, 0) }));
  put(g, rbox(0.42, 0.22, 0.6, TEX(grime('#4a5a3d', 0.15), 0.7, 0.2), 0.04), 0, 0.33, 0.15);
  put(g, rbox(0.38, 0.12, 0.03, GLASS, 0.01), 0, 0.4, -0.17, -0.4);
  put(g, cyl(0.12, 0.12, 0.08, M(0x3a4630, 0.7, 0.3)), 0, 0.27, -0.6);
  put(g, rbox(0.04, 0.05, 0.4, BLACK, 0.01), 0, 0.34, -0.85);
  put(g, rbox(0.04, 0.05, 0.3, BLACK, 0.01), 0, 0.5, 0.55);
  for (const x of [-0.2, 0.2]) put(g, rbox(0.14, 0.1, 0.18, M(0x4f4733, 0.9, 0)), x, 0.27, 0.85);
  return g;
}

export function crocodile() {
  const g = new THREE.Group();
  const skin = TEX(camo(['#4a5332', '#353c23', '#5d6640', '#2a2f1b'], 2, 90), 0.75, 0.05);
  const belly = M(0x6b6b44, 0.8, 0);
  put(g, sphere(0.2, skin, 1, 0.45, 3.4), 0, 0.09, 0.05);
  put(g, sphere(0.14, skin, 0.95, 0.42, 2.6), 0, 0.08, -1.0);
  put(g, sphere(0.1, skin, 0.9, 0.35, 2.2), 0, 0.06, -1.42);
  for (const x of [-0.05, 0.05]) put(g, sphere(0.035, M(0xb8a24a, 0.3, 0.1)), x, 0.13, -0.86);
  for (let i = 0; i < 12; i++) put(g, sphere(0.05 - i * 0.003, M(0x2f3520, 0.8, 0)), 0, 0.15 - i * 0.004, -0.55 + i * 0.16);
  const tail = put(g, cyl(0.12, 0.02, 1.25, skin, 12), 0, 0.06, 1.25, Math.PI / 2);
  tail.scale.z = 0.45;
  for (const [x, z, r] of [[-1, -0.45, 0.6], [1, -0.45, -0.6], [-1, 0.45, -0.5], [1, 0.45, 0.5]]) {
    put(g, rbox(0.3, 0.05, 0.08, belly, 0.02), x * 0.22, 0.04, z, 0, r, 0);
  }
  return g;
}

export function helicopter(paint = TEX(camo(LEAF, 1, 50), 0.6, 0.3)) {
  const g = new THREE.Group();
  put(g, sphere(0.36, paint, 1, 0.8, 1.6), 0, 0.42, -0.3);
  put(g, sphere(0.25, GLASS, 1.1, 0.75, 1), 0, 0.5, -0.72);
  const boom = put(g, cyl(0.07, 0.12, 1.4, paint, 16), 0, 0.5, 0.75, Math.PI / 2);
  boom.scale.z = 0.8;
  put(g, rbox(0.5, 0.03, 0.12, paint, 0.01), 0, 0.5, 1.35);
  put(g, rbox(0.03, 0.25, 0.18, paint, 0.01), 0.04, 0.6, 1.42);
  for (const x of [-0.3, 0.3]) put(g, cyl(0.02, 0.02, 1.1, STEEL, 8), x, 0.08, -0.3, Math.PI / 2);
  put(g, cyl(0.06, 0.06, 0.12, STEEL), 0, 0.72, -0.3);
  const disc = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.28, roughness: 0.4 });
  put(g, cyl(0.95, 0.95, 0.005, disc, 48), 0, 0.78, -0.3);
  for (let i = 0; i < 2; i++) put(g, rbox(1.9, 0.012, 0.07, BLACK, 0.005), 0, 0.79, -0.3, 0, 0.5 + i * Math.PI / 2, 0);
  return g;
}

export function camp() {
  const g = new THREE.Group();
  const canvas = TEX(grime('#4f5a33', 0.25), 0.95, 0);
  for (const [x, z, r] of [[-0.75, -0.7, 0.2], [0.7, -0.55, -0.3], [-0.6, 0.75, 1.5]]) {
    const tent = put(g, new THREE.Group(), x, 0, z, 0, r, 0);
    const roof = put(tent, cyl(0.42, 0.42, 0.9, canvas, 3), 0, 0.2, 0, Math.PI / 2, 0, 0);
    roof.rotation.z = Math.PI;
  }
  put(g, cyl(0.16, 0.2, 0.06, M(0x3b3530, 0.9, 0)), 0.05, 0.03, 0.15);
  put(g, sphere(0.09, M(0xff8a2a, 0.5, 0, { emissive: 0xff6a00, emissiveIntensity: 1.6 }), 1, 0.6, 1), 0.05, 0.08, 0.15);
  for (const [x, z] of [[0.75, 0.55], [0.95, 0.85], [0.6, 0.9]]) put(g, rbox(0.24, 0.2, 0.18, TEX(grime('#6b5434', 0.25), 0.9, 0), 0.02), x, 0.1, z, 0, rand(), 0);
  for (let i = 0; i < 9; i++) {
    const a = -0.6 + i * 0.15;
    put(g, sphere(0.1, M(0x8a7a52, 0.95, 0), 1.4, 0.6, 0.8), Math.sin(a) * 1.25, 0.06, -Math.cos(a) * 1.25 + 0.2, 0, -a, 0);
  }
  put(g, bush(0.3, 8), -1.1, 0, 0.0);
  put(g, bush(0.28, 7), 1.15, 0, 0.1);
  return g;
}

export const JUNGLE = {
  guerrilla: { w: 1, h: 2, build: guerrilla },
  'river-boat': { w: 1, h: 3, build: riverBoat },
  crocodile: { w: 1, h: 4, build: crocodile },
  helicopter: { w: 2, h: 3, build: () => helicopter(), altitude: 0.5 },
  camp: { w: 3, h: 3, build: camp },
};
