// Piezas para modelar: materiales con textura, cajas redondeadas, ruedas,
// orugas y personas. Todo determinista (misma semilla, mismo dibujo).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

let seed = 7;
export const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
export const reseed = (s) => (seed = s);

function canvasTex(size, paint, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  paint(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  return t;
}

/** Camuflaje de manchas con los colores dados (el primero es la base). */
export function camo(colors, repeat = 1, blots = 70) {
  return canvasTex(256, (g, s) => {
    g.fillStyle = colors[0];
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < blots; i++) {
      g.fillStyle = colors[1 + (i % (colors.length - 1))];
      g.beginPath();
      const x = rand() * s, y = rand() * s, r = 8 + rand() * 26;
      for (let a = 0; a < Math.PI * 2; a += 0.6) {
        const rr = r * (0.6 + rand() * 0.6);
        g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7);
      }
      g.fill();
    }
  }, repeat);
}

/** Ruido fino de suciedad/desgaste para que nada se vea de plástico. */
export function grime(base, amount = 0.12, repeat = 1) {
  return canvasTex(256, (g, s) => {
    g.fillStyle = base;
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const v = rand() < 0.5 ? 0 : 255;
      g.fillStyle = `rgba(${v},${v},${v},${amount * rand()})`;
      g.fillRect(rand() * s, rand() * s, 1 + rand() * 3, 1 + rand() * 3);
    }
  }, repeat);
}

/** Banda de oruga con sus eslabones. */
export const treadTex = (repeat) => canvasTex(64, (g, s) => {
  g.fillStyle = '#1d1c1a';
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 8) {
    g.fillStyle = '#3d3b37';
    g.fillRect(4, y, s - 8, 4);
  }
}, repeat);

export const M = (color, rough = 0.7, metal = 0.15, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
export const TEX = (map, rough = 0.75, metal = 0.2, extra = {}) =>
  new THREE.MeshStandardMaterial({ map, roughness: rough, metalness: metal, ...extra });

export const RUBBER = M(0x1b1b1b, 0.95, 0);
export const STEEL = M(0x5d6166, 0.45, 0.8);
export const GLASS = M(0x1d2a38, 0.08, 0.6, { envMapIntensity: 1.6 });
export const SKIN = M(0xc68e63, 0.7, 0);
export const BLACK = M(0x161616, 0.6, 0.3);

export function rbox(w, h, d, mat, r = 0.03) {
  const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.max(rr, 0.001)), mat);
}
export const cyl = (rt, rb, len, mat, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, len, seg), mat);
export const sphere = (r, mat, sx = 1, sy = 1, sz = 1) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), mat);
  m.scale.set(sx, sy, sz);
  return m;
};

/** Agrega `mesh` a `parent` en posición/rotación dadas y lo devuelve. */
export function put(parent, mesh, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  parent.add(mesh);
  return mesh;
}

/** Rueda con llanta; su eje es X. */
export function wheel(r, width, rim = STEEL) {
  const g = new THREE.Group();
  put(g, cyl(r, r, width, RUBBER), 0, 0, 0, 0, 0, Math.PI / 2);
  put(g, cyl(r * 0.55, r * 0.55, width * 1.04, rim, 16), 0, 0, 0, 0, 0, Math.PI / 2);
  return g;
}

/** Oruga de tanque a lo largo de Z. */
export function track(len, width, height) {
  const g = new THREE.Group();
  put(g, rbox(width, height, len, TEX(treadTex(Math.round(len * 3)), 0.9, 0.3), height * 0.45), 0, height / 2, 0);
  for (let z = -len / 2 + 0.12; z < len / 2 - 0.05; z += 0.2) {
    put(g, wheel(height * 0.36, width * 1.06, M(0x3a3d33, 0.6, 0.5)), 0, height * 0.4, z);
  }
  return g;
}

/** Arma larga (fusil): mira hacia -Z. */
export function rifle(len = 0.22, mat = BLACK) {
  const g = new THREE.Group();
  put(g, rbox(0.022, 0.025, len, mat, 0.008), 0, 0, 0);
  put(g, cyl(0.006, 0.006, len * 0.5, STEEL, 8), 0, 0.004, -len * 0.7, Math.PI / 2);
  return g;
}

/**
 * Persona vista desde arriba (casco, hombros, mochila, brazos con fusil).
 * `prone` la acuesta a lo largo de Z (francotirador, buzo).
 */
export function person({ uniform, helmet, pack = null, gun = true, prone = false, scale = 1 }) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  put(body, rbox(0.2, 0.16, 0.12, uniform, 0.05), 0, 0.2, 0);
  put(body, sphere(0.055, SKIN), 0, 0.3, -0.01);
  put(body, sphere(0.065, helmet, 1, 0.62, 1.05), 0, 0.33, -0.008);
  for (const s of [-1, 1]) put(body, rbox(0.05, 0.05, 0.13, uniform, 0.02), s * 0.085, 0.23, -0.07, 0, s * 0.25, 0);
  if (pack) put(body, rbox(0.15, 0.1, 0.08, pack, 0.03), 0, 0.24, 0.085);
  if (gun) put(body, rifle(), 0.03, 0.27, -0.16, 0, -0.1, 0);
  if (prone) {
    body.rotation.x = -Math.PI / 2 + 0.05;
    body.position.set(0, 0.06, 0.12);
    for (const s of [-1, 1]) put(g, rbox(0.06, 0.05, 0.22, uniform, 0.02), s * 0.05, 0.04, 0.33, 0, s * 0.08, 0);
  }
  g.add(body);
  g.scale.setScalar(scale);
  return g;
}
