// Reacciones con objetos: bomba a punto de estallar, medalla, diana con
// dardo y trofeo. Cada una es { group, animate(t) } con t de 0 a 1 en bucle.
import * as THREE from 'three';
import { M, cyl, sphere, put } from '../kit.js';

const TAU = Math.PI * 2;
export const GOLD = M(0xf2b632, 0.25, 1, { envMapIntensity: 1.3 });
const glow = (color, k = 3) => M(color, 0.4, 0, { emissive: color, emissiveIntensity: k });

export function star(outer, inner, depth, mat) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer, a = Math.PI / 2 + (i * Math.PI) / 5;
    i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
  return new THREE.Mesh(geo, mat);
}

/** "¡Boom!": bomba que tiembla cada vez más con la mecha chispeando. */
export function boom() {
  const group = new THREE.Group(), body = new THREE.Group();
  put(body, sphere(0.55, M(0x1c1f24, 0.25, 0.6)));
  put(body, cyl(0.17, 0.2, 0.16, M(0x3a3f46, 0.35, 0.8)), 0.24, 0.48, 0, 0, 0, -0.45);
  const fuse = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.3, 0.55], [0.42, 0.75], [0.6, 0.82], [0.72, 0.74]].map(([x, y]) => new THREE.Vector3(x, y, 0))), 20, 0.03, 8),
    M(0x9b7b4a, 0.9, 0),
  );
  body.add(fuse);
  const spark = put(body, sphere(0.09, glow(0xffb02e, 5)), 0.74, 0.74, 0);
  const sparks = [...Array(6)].map(() => put(body, sphere(0.025, glow(0xffe08a, 6)), 0.74, 0.74, 0));
  group.add(body);
  return {
    group,
    animate(t) {
      const shake = 0.04 + t * 0.1;
      body.rotation.z = Math.sin(t * TAU * 6) * shake;
      body.rotation.y = 0.3 + Math.sin(t * TAU * 2) * 0.2;
      const s = 1 + Math.sin(t * TAU * 4) * 0.04 + t * 0.08;
      body.scale.set(s, 2 - s, s);
      spark.scale.setScalar(0.8 + Math.abs(Math.sin(t * TAU * 7)) * 0.9);
      sparks.forEach((p, i) => {
        const a = (i / sparks.length) * TAU + t * TAU * 3, d = 0.08 + ((t * 5 + i * 0.37) % 1) * 0.28;
        p.position.set(0.74 + Math.cos(a) * d, 0.74 + Math.sin(a) * d, Math.sin(a * 2) * 0.1);
      });
    },
  };
}

/** "¡Bien jugado!": medalla de oro que gira colgada de su cinta. */
export function medal() {
  const group = new THREE.Group(), disc = new THREE.Group();
  put(disc, cyl(0.5, 0.5, 0.08, GOLD, 48), 0, 0, 0, Math.PI / 2);
  put(disc, new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.045, 12, 48), M(0xd99a1c, 0.3, 1)));
  for (const side of [1, -1]) put(disc, star(0.3, 0.13, 0.03, M(0xffd65a, 0.2, 1)), 0, -0.02, side * 0.04, 0, side < 0 ? Math.PI : 0);
  for (const [x, c] of [[-0.14, 0x1d4ed8], [0.14, 0xdc2626]]) {
    put(group, new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.02), M(c, 0.8, 0)), x, 0.78, -0.02, 0, 0, x * -1.6);
  }
  disc.position.y = -0.1;
  group.add(disc);
  return {
    group,
    animate(t) {
      disc.rotation.y = t * TAU;
      group.position.y = Math.sin(t * TAU) * 0.05;
      group.rotation.z = Math.sin(t * TAU) * 0.06;
    },
  };
}

/** "¡En el blanco!": un dardo llega a la diana y se queda vibrando. */
export function target() {
  const group = new THREE.Group(), board = new THREE.Group();
  [0.7, 0.56, 0.42, 0.28, 0.14].forEach((r, i) =>
    put(board, cyl(r, r, 0.1 + i * 0.012, M(i % 2 ? 0xf5f5f0 : 0xd62828, 0.55, 0), 48), 0, 0, 0, Math.PI / 2));
  put(board, cyl(0.72, 0.72, 0.08, M(0x5b3a22, 0.8, 0), 48), 0, 0, -0.04, Math.PI / 2);
  const dart = new THREE.Group();
  put(dart, cyl(0.02, 0.02, 0.6, M(0x2b2f36, 0.3, 0.8)), 0, 0, 0.3, Math.PI / 2);
  put(dart, new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 12), M(0xc0c4c8, 0.2, 1)), 0, 0, -0.04, -Math.PI / 2);
  for (let i = 0; i < 3; i++) put(dart, new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.14, 0.16), M(0xf59e0b, 0.6, 0)), 0, 0, 0.56, 0, 0, (i * TAU) / 3);
  board.add(dart);
  group.add(board);
  board.rotation.y = -0.45;
  return {
    group,
    animate(t) {
      const fly = Math.min(t / 0.25, 1);
      dart.position.z = 2.4 * (1 - fly) * (1 - fly);
      const after = Math.max(t - 0.25, 0);
      dart.rotation.x = Math.sin(after * TAU * 6) * 0.25 * Math.exp(-after * 6);
      board.position.x = fly < 1 ? 0 : Math.sin(after * TAU * 8) * 0.03 * Math.exp(-after * 10);
    },
  };
}

/** "¡Voy ganando!": trofeo que gira y salta entre destellos. */
export function trophy() {
  const group = new THREE.Group(), cup = new THREE.Group();
  const profile = [[0, -0.05], [0.3, 0], [0.38, 0.12], [0.43, 0.5]].map(([x, y]) => new THREE.Vector2(x, y));
  const lathe = new THREE.LatheGeometry(profile, 40);
  put(cup, new THREE.Mesh(lathe, M(0xf2b632, 0.22, 1, { side: THREE.DoubleSide })), 0, 0.05, 0);
  for (const s of [1, -1]) put(cup, new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 10, 24, Math.PI * 1.2), GOLD), s * 0.42, 0.33, 0, 0, 0, s > 0 ? -0.6 : Math.PI + 0.6);
  put(cup, cyl(0.06, 0.1, 0.3, GOLD), 0, -0.12, 0);
  put(cup, new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.4), M(0x3b2416, 0.6, 0)), 0, -0.33, 0);
  put(cup, new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.01), GOLD), 0, -0.33, 0.205);
  cup.position.y = -0.05;
  group.add(cup);
  const twinkles = [...Array(5)].map((_, i) => put(group, star(0.07, 0.03, 0.01, glow(0xfff1b8, 4)), Math.cos(i * 1.3) * 0.75, 0.15 + (i % 3) * 0.25, 0.2));
  return {
    group,
    animate(t) {
      cup.rotation.y = Math.sin(t * TAU) * 0.9;
      const hop = Math.abs(Math.sin(t * TAU * 2));
      cup.position.y = -0.1 + hop * 0.18;
      cup.scale.set(1 + (1 - hop) * 0.05, 1 - (1 - hop) * 0.06, 1);
      twinkles.forEach((s, i) => s.scale.setScalar(Math.max(0, Math.sin((t + i / 5) * TAU * 2))));
    },
  };
}
