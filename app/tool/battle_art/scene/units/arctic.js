// Ártico (Guerra de Invierno, 1939): esquiadores, trineo de perros, iglú, oruga y rompehielos.
import * as THREE from 'three';
import { put, rbox, cyl, sphere, person, track, grime, TEX, M, GLASS, STEEL, BLACK } from '../kit.js';
import { hull } from '../craft.js';

const WHITE = M(0xe4e8ea, 0.85, 0);

export function skier() {
  const g = new THREE.Group();
  for (const [x, z] of [[-0.06, -0.45], [0.08, 0.5]]) {
    const p = put(g, person({ uniform: WHITE, helmet: M(0xd8dde0, 0.7, 0), pack: M(0xc9cfd2, 0.8, 0), scale: 1.7 }), x, 0, z);
    for (const s of [-1, 1]) put(p, rbox(0.03, 0.01, 0.62, M(0x6b4e2e, 0.6, 0)), s * 0.05, 0.005, -0.05);
    for (const s of [-1, 1]) put(p, cyl(0.005, 0.005, 0.32, BLACK, 4), s * 0.13, 0.12, 0.05, 0.6, 0, 0);
  }
  return g;
}

export function dogSled() {
  const g = new THREE.Group();
  const fur = [M(0x6d6a66, 0.95, 0), M(0xd9d4cc, 0.95, 0), M(0x3c3734, 0.95, 0)];
  for (let i = 0; i < 3; i++) {
    for (const s of [-1, 1]) {
      const dog = put(g, new THREE.Group(), s * 0.14, 0, -1.15 + i * 0.42);
      put(dog, sphere(0.085, fur[(i + s + 2) % 3], 1, 0.9, 2.1), 0, 0.11, 0);
      put(dog, sphere(0.06, fur[(i + s + 2) % 3], 1, 0.9, 1.4), 0, 0.15, -0.2);
      for (const e of [-1, 1]) put(dog, sphere(0.02, fur[2], 1, 1.4, 1), e * 0.035, 0.2, -0.18);
    }
  }
  put(g, cyl(0.004, 0.004, 1.3, BLACK, 4), 0, 0.08, -0.55, Math.PI / 2);
  const wood = M(0x7a5532, 0.7, 0);
  put(g, rbox(0.42, 0.06, 0.8, TEX(grime('#8a6a44', 0.2), 0.8, 0), 0.02), 0, 0.12, 0.85);
  for (const s of [-1, 1]) put(g, rbox(0.03, 0.03, 1.0, wood, 0.01), s * 0.21, 0.03, 0.85);
  put(g, rbox(0.34, 0.14, 0.4, M(0x4d5b3f, 0.9, 0), 0.03), 0, 0.22, 0.75);
  put(g, person({ uniform: WHITE, helmet: M(0x5a4636, 0.9, 0), gun: false, scale: 1.5 }), 0, 0, 1.2);
  return g;
}

export function igloo() {
  const g = new THREE.Group();
  const ice = TEX(grime('#e9f1f5', 0.12), 0.35, 0.05);
  const dome = new THREE.SphereGeometry(0.72, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  put(g, new THREE.Mesh(dome, ice), 0, 0, 0.1);
  for (let row = 1; row < 5; row++) {
    const r = 0.72 * Math.cos((row * Math.PI) / 10) + 0.004;
    put(g, new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 48), M(0xb7c8d2, 0.5, 0)), 0, 0.72 * Math.sin((row * Math.PI) / 10), 0.1, Math.PI / 2);
  }
  const door = put(g, cyl(0.2, 0.2, 0.45, ice, 16, 1), 0, 0.12, -0.6, Math.PI / 2);
  door.scale.y = 1;
  put(g, sphere(0.14, M(0x1c2a33, 0.9, 0), 1, 1, 0.3), 0, 0.14, -0.83);
  put(g, rbox(0.04, 0.05, 0.4, BLACK, 0.01), 0.2, 0.62, -0.1, 0, 0.3, 0);
  return g;
}

export function snowCrawler() {
  const g = new THREE.Group();
  const paint = TEX(grime('#c0392b', 0.18), 0.55, 0.3);
  for (const x of [-0.62, 0.62]) put(g, track(2.5, 0.42, 0.3), x, 0, 0);
  put(g, rbox(1.0, 0.25, 2.3, M(0x2e3236, 0.7, 0.4), 0.06), 0, 0.35, 0);
  put(g, rbox(1.05, 0.45, 0.9, paint, 0.1), 0, 0.68, -0.55);
  put(g, rbox(0.95, 0.22, 0.03, GLASS, 0.01), 0, 0.78, -1.0, -0.35);
  for (const s of [-1, 1]) put(g, rbox(0.03, 0.2, 0.6, GLASS, 0.01), s * 0.53, 0.75, -0.5);
  put(g, rbox(1.0, 0.36, 1.1, paint, 0.08), 0, 0.62, 0.55);
  put(g, rbox(0.8, 0.06, 0.25, M(0xe8eef0, 0.8, 0)), 0, 0.82, 0.55);
  put(g, cyl(0.05, 0.05, 0.3, BLACK, 10), 0.35, 0.95, -0.25);
  put(g, rbox(1.4, 0.18, 0.14, STEEL, 0.03), 0, 0.3, -1.35);
  return g;
}

export function icebreaker() {
  const g = new THREE.Group();
  put(g, hull({ len: 3.7, beam: 1.45, height: 0.32, mat: TEX(grime('#a2281e', 0.15), 0.6, 0.3), deck: TEX(grime('#d7d4cc', 0.15, 2), 0.8, 0.05), bow: 0.3, stern: 0.95 }));
  const white = TEX(grime('#ecebe6', 0.12), 0.6, 0.1);
  put(g, rbox(1.0, 0.45, 0.9, white, 0.05), 0, 0.55, -0.1);
  put(g, rbox(0.9, 0.12, 0.04, GLASS, 0.01), 0, 0.7, -0.57, -0.3);
  put(g, rbox(0.7, 0.25, 0.5, white, 0.05), 0, 0.88, 0.0);
  put(g, cyl(0.16, 0.2, 0.4, M(0xd6a12a, 0.5, 0.2)), 0, 0.6, 0.75);
  put(g, rbox(0.06, 0.3, 0.06, STEEL), 0.45, 0.55, 1.1);
  for (let i = 0; i < 4; i++) put(g, rbox(0.25, 0.18, 0.18, M(0x3c4a3a, 0.9, 0)), -0.35 + (i % 2) * 0.3, 0.42, 1.2 + Math.floor(i / 2) * 0.25);
  return g;
}

export const ARCTIC = {
  skier: { w: 1, h: 2, build: skier },
  'dog-sled': { w: 1, h: 3, build: dogSled },
  igloo: { w: 2, h: 2, build: igloo },
  'snow-crawler': { w: 2, h: 3, build: snowCrawler },
  icebreaker: { w: 2, h: 4, build: icebreaker },
};
