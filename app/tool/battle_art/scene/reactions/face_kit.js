// Piezas de las caras 3D: cabeza con casco, ojos, cejas, bocas y lágrimas.
// Todo se apoya sobre la esfera de la cabeza mirando hacia afuera.
import * as THREE from 'three';
import { M, cyl, sphere, put } from '../kit.js';

export const R = 0.62;
export const TAU = Math.PI * 2;
export const SKIN = () => M(0xffc531, 0.32, 0.05, { envMapIntensity: 1.1 });
export const INK = M(0x3b220f, 0.45, 0);
const MOUTH = M(0x5b1a12, 0.5, 0);
const WHITE = M(0xfdfcf7, 0.25, 0);
export const glow = (color, k = 3, extra = {}) => M(color, 0.4, 0, { emissive: color, emissiveIntensity: k, ...extra });
export const WATER = M(0x5ec8ff, 0.05, 0, { transparent: true, opacity: 0.85, envMapIntensity: 1.6 });

/** Punto de la superficie de la cabeza (más `lift` hacia afuera). */
export const surface = (x, y, lift = 0) => new THREE.Vector3(x, y, Math.sqrt(Math.max(R * R - x * x - y * y, 0)) + lift);

/** Pone `mesh` sobre la cara en (x, y), con su +Z mirando hacia afuera. */
export function onFace(parent, mesh, x, y, lift = 0.005) {
  const p = surface(x, y, lift);
  mesh.position.copy(p);
  mesh.lookAt(p.clone().multiplyScalar(2));
  parent.add(mesh);
  return mesh;
}

/** Cabeza amarilla con casco militar. Devuelve { head, skin } para animar el color. */
export function head({ helmet = true } = {}) {
  const head = new THREE.Group(), skin = SKIN();
  put(head, sphere(R, skin, 1, 0.97, 0.94));
  if (helmet) {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(R + 0.06, 40, 20, 0, TAU, 0, Math.PI / 2.1), M(0x56663a, 0.75, 0.1));
    put(head, shell, 0, 0.24, -0.04, -0.32);
    put(head, new THREE.Mesh(new THREE.TorusGeometry(R + 0.07, 0.035, 10, 48), M(0x48552f, 0.8, 0.1)), 0, 0.26, -0.03, Math.PI / 2 - 0.32);
    put(head, cyl(0.11, 0.11, 0.02, M(0x2f3a20, 0.7, 0.2), 6), 0, 0.82, 0.12, -0.32 + Math.PI / 2 - 0.9);
  }
  return { head, skin };
}

/** Ojo abierto: blanco, pupila y brillo. `look` mueve la pupila. */
export function eye(size = 1) {
  const g = new THREE.Group(), pupil = new THREE.Group();
  put(g, sphere(0.11 * size, WHITE, 1, 1.25, 0.45));
  put(pupil, sphere(0.062 * size, M(0x1a1410, 0.2, 0), 1, 1.15, 0.5), 0, 0, 0.05 * size);
  put(pupil, sphere(0.02 * size, glow(0xffffff, 2)), 0.022 * size, 0.03 * size, 0.06);
  g.add(pupil);
  return { group: g, pupil };
}

/** Ojo cerrado de risa (^) o hacia abajo (∪) con `down`. */
export function closedEye(down = false) {
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.022, 8, 20, Math.PI), INK);
  if (down) arc.rotation.z = Math.PI;
  const g = new THREE.Group();
  g.add(arc);
  return g;
}

/** Ceja: cápsula oscura inclinada `angle` radianes. */
export function brow(parent, x, y, angle, len = 0.17) {
  const g = new THREE.Group();
  put(g, new THREE.Mesh(new THREE.CapsuleGeometry(0.028, len, 4, 10), INK), 0, 0, 0, 0, 0, Math.PI / 2 + angle);
  return onFace(parent, g, x, y, 0.02);
}

/** Boca en línea siguiendo la superficie: puntos [x, y] de izquierda a derecha. */
export function lineMouth(points, r = 0.026) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => surface(x, y, 0.012)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 32, r, 8), MOUTH);
}

/** Boca abierta en forma de D (sonrisa) con dientes y lengua opcionales. */
export function openMouth(w, open, { teeth = true, tongue = true, frown = false } = {}) {
  const g = new THREE.Group(), k = frown ? -1 : 1;
  const shape = (inset) => {
    const s = new THREE.Shape();
    s.moveTo(-w, 0);
    s.quadraticCurveTo(0, -0.06 * w * k - inset, w, 0);
    s.quadraticCurveTo(0, -open * 2 * k, -w, 0);
    return s;
  };
  const ext = (s, depth, mat) => new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 20 }), mat);
  put(g, ext(shape(0), 0.03, MOUTH));
  if (teeth) {
    const s = new THREE.Shape();
    s.moveTo(-w * 0.8, -0.01 * k);
    s.quadraticCurveTo(0, -0.05 * w * k, w * 0.8, -0.01 * k);
    s.lineTo(w * 0.75, -0.06 * k);
    s.quadraticCurveTo(0, -0.1 * k, -w * 0.75, -0.06 * k);
    put(g, ext(s, 0.01, WHITE), 0, 0, 0.03);
  }
  if (tongue) put(g, sphere(w * 0.45, M(0xe8586b, 0.5, 0), 1, 0.45, 0.3), 0, -open * 0.9 * k, 0.025);
  return g;
}

/** Boca en O. */
export function oMouth(rx, ry) {
  const s = new THREE.Shape();
  s.absellipse(0, 0, rx, ry, 0, TAU);
  const g = new THREE.Group();
  put(g, new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.012, curveSegments: 24 }), MOUTH));
  return g;
}

/** Lágrima: gota de agua con la punta hacia arriba. */
export function tear(size = 1) {
  const g = new THREE.Group();
  put(g, sphere(0.05 * size, WATER));
  put(g, new THREE.Mesh(new THREE.ConeGeometry(0.048 * size, 0.09 * size, 16), WATER), 0, 0.06 * size, 0);
  return g;
}

/** Rubor de las mejillas. */
export function blush(parent, x, y, color = 0xff7a8a, opacity = 0.45) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.085, 24), M(color, 0.9, 0, { transparent: true, opacity }));
  m.scale.y = 0.6;
  return onFace(parent, m, x, y, 0.004);
}
