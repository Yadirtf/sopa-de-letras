// Íconos 3D de la armería: bala, misil, bomba y radar, en diagonal.
import * as THREE from 'three';
import { put, cyl, sphere, rbox, M, STEEL, BLACK } from './kit.js';

const BRASS = M(0xc9a13b, 0.3, 0.9);
const OLIVE = M(0x56603e, 0.6, 0.3);

function bullet() {
  const g = new THREE.Group();
  put(g, cyl(0.1, 0.1, 0.42, BRASS), 0, -0.12, 0);
  put(g, cyl(0.105, 0.105, 0.04, BRASS), 0, -0.34, 0);
  put(g, cyl(0.02, 0.098, 0.3, M(0xb06a3a, 0.35, 0.85)), 0, 0.24, 0);
  return g;
}

function missile() {
  const g = new THREE.Group();
  put(g, cyl(0.07, 0.07, 0.75, M(0xd9dcd6, 0.4, 0.3)), 0, -0.05, 0);
  put(g, cyl(0.005, 0.07, 0.22, M(0xb3201a, 0.45, 0.2)), 0, 0.43, 0);
  for (let i = 0; i < 2; i++) put(g, rbox(0.32, 0.14, 0.012, OLIVE, 0.004), 0, -0.36, 0, 0, (i * Math.PI) / 2, 0);
  put(g, cyl(0.05, 0.06, 0.05, BLACK), 0, -0.45, 0);
  return g;
}

function bomb() {
  const g = new THREE.Group();
  put(g, sphere(0.2, OLIVE, 1, 2.0, 1), 0, 0, 0);
  for (let i = 0; i < 4; i++) {
    const fin = put(g, rbox(0.28, 0.16, 0.012, M(0x4a5236, 0.6, 0.3), 0.004), 0, 0.45, 0);
    fin.rotation.y = (i * Math.PI) / 4;
  }
  put(g, cyl(0.21, 0.21, 0.03, M(0xd6b13a, 0.5, 0.3)), 0, -0.12, 0);
  g.rotation.z = Math.PI;
  const holder = new THREE.Group();
  holder.add(g);
  return holder;
}

function radar() {
  const g = new THREE.Group();
  put(g, cyl(0.16, 0.2, 0.1, OLIVE), 0, 0.05, 0.2);
  put(g, cyl(0.03, 0.03, 0.3, STEEL), 0, 0.25, 0.2);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 12, 0, Math.PI * 2, 0, Math.PI / 3.2), M(0xe6e8e2, 0.35, 0.5, { side: THREE.DoubleSide }));
  put(g, dish, 0, 0.45, 0.02, -2.2, 0, 0);
  put(g, cyl(0.012, 0.012, 0.3, STEEL, 8), 0, 0.42, -0.08, -0.9, 0, 0);
  put(g, sphere(0.03, M(0x32d06a, 0.3, 0, { emissive: 0x22c55e, emissiveIntensity: 2 })), 0, 0.33, -0.2);
  return g;
}

export const WEAPONS = { BULLET: bullet, MISSILE: missile, BOMBING: bomb, RADAR: radar };

/** Pone el arma inclinada 45° y elevada para que proyecte sombra. */
export function weaponModel(id) {
  const g = new THREE.Group();
  if (id === 'RADAR') {
    put(g, WEAPONS[id](), 0, 0, -0.05, 0, 0.5, 0).scale.setScalar(0.85);
    return g;
  }
  const lying = put(g, new THREE.Group(), 0, 0.3, 0, 0, Math.PI / 4, 0);
  put(lying, WEAPONS[id](), 0, 0, 0, -Math.PI / 2, 0, 0).scale.setScalar(id === 'BOMBING' ? 0.78 : 0.95);
  return g;
}
