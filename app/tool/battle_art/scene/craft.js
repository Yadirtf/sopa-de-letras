// Aviones y cascos de barco paramétricos (todos miran hacia -Z).
import * as THREE from 'three';
import { put, cyl, sphere, rbox, GLASS, STEEL, M } from './kit.js';

/** Ala plana con flecha: `root` es la cuerda en el fuselaje, `tip` en la punta. */
function wing(span, root, tip, sweep, thick, mat) {
  const s = new THREE.Shape();
  s.moveTo(0, -root / 2);
  s.lineTo(span, -root / 2 + sweep);
  s.lineTo(span, -root / 2 + sweep + tip);
  s.lineTo(0, root / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.4, bevelSize: thick * 0.6, bevelSegments: 2 });
  geo.rotateX(Math.PI / 2);
  return new THREE.Mesh(geo, mat);
}

/** Pareja de alas simétricas a la altura `y`, centradas en `z`. */
export function wings(g, { span, root, tip, sweep = 0, thick = 0.03, y = 0, z = 0, x0 = 0.05, mat }) {
  for (const sx of [-1, 1]) {
    const w = put(g, wing(span, root, tip, sweep, thick, mat), sx * x0, y + thick, z);
    w.scale.x = sx;
  }
}

/**
 * Avión: fuselaje, cabina, alas, cola y motores.
 * `engines` es una lista de [x, z] para motores en las alas (vacía = reactor en el fuselaje).
 */
export function plane({ len, span, r, mat, wingZ = 0, root = 0.6, tip = 0.25, sweep = 0.3,
  tailSpan = null, engines = [], engineR = 0.08, props = false, canopyZ = null }) {
  const g = new THREE.Group();
  const body = put(g, cyl(r * 0.55, r, len * 0.82, mat), 0, 0, len * 0.04, Math.PI / 2);
  body.scale.z = 0.85;
  put(g, sphere(r * 0.98, mat, 1, 0.85, 1.6), 0, 0, -len * 0.37);
  put(g, sphere(r * 0.55, GLASS, 0.9, 0.7, 1.9), 0, r * 0.62, canopyZ ?? -len * 0.27);
  wings(g, { span: span / 2 - 0.05, root, tip, sweep, z: wingZ, mat });
  const ts = tailSpan ?? span * 0.35;
  wings(g, { span: ts / 2, root: root * 0.5, tip: tip * 0.6, sweep: sweep * 0.5, z: len * 0.4, mat, thick: 0.02 });
  const fin = put(g, rbox(0.03, r * 1.4, root * 0.6, mat, 0.01), 0, r * 0.9, len * 0.4);
  fin.rotation.x = -0.35;
  for (const [x, z] of engines) {
    put(g, cyl(engineR, engineR * 0.85, engineR * 4.5, M(0x3b3f43, 0.5, 0.7)), x, 0, z, Math.PI / 2);
    if (props) put(g, cyl(engineR * 3, engineR * 3, 0.004, M(0x222222, 0.4, 0, { transparent: true, opacity: 0.35 })), x, 0, z - engineR * 2.4, Math.PI / 2);
  }
  if (props && engines.length === 0) {
    put(g, cyl(r * 2.6, r * 2.6, 0.004, M(0x222222, 0.4, 0, { transparent: true, opacity: 0.35 })), 0, 0, -len * 0.5, Math.PI / 2);
  }
  g.position.y = r + 0.05;
  return g;
}

/** Casco de barco con proa en punta: `len` a lo largo de Z, `beam` de ancho. */
export function hull({ len, beam, height, mat, deck, bow = 0.28, stern = 0.9 }) {
  const s = new THREE.Shape();
  const hl = len / 2, hb = beam / 2;
  s.moveTo(-hb * stern, hl);
  s.lineTo(-hb, hl * 0.4);
  s.quadraticCurveTo(-hb, -hl + len * bow * 0.35, 0, -hl);
  s.quadraticCurveTo(hb, -hl + len * bow * 0.35, hb, hl * 0.4);
  s.lineTo(hb * stern, hl);
  s.closePath();
  const g = new THREE.Group();
  const geo = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, height, 0);
  put(g, new THREE.Mesh(geo, mat));
  const top = new THREE.ShapeGeometry(s);
  top.rotateX(Math.PI / 2);
  const d = put(g, new THREE.Mesh(top, deck), 0, height + 0.018, 0);
  d.scale.set(0.97, 1, 0.98);
  return g;
}

/** Torreta naval con cañón doble. */
export function navalGun(mat, size = 0.14) {
  const g = new THREE.Group();
  put(g, rbox(size, size * 0.5, size * 1.2, mat, size * 0.2), 0, size * 0.25, 0);
  for (const x of [-0.25, 0.25]) put(g, cyl(0.01, 0.012, size * 1.6, STEEL, 8), x * size, size * 0.3, -size * 1.2, Math.PI / 2);
  return g;
}
