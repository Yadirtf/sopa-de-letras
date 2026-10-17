// Caras 3D del soldado, cada una con su gesto animado en bucle (t de 0 a 1).
import * as THREE from 'three';
import { put, sphere } from '../kit.js';
import { TAU, head, eye, closedEye, brow, lineMouth, openMouth, oMouth, tear, blush, onFace, glow, surface } from './face_kit.js';

const wrap = (h) => { const group = new THREE.Group(); group.add(h); return group; };

/** "Je, je, je": ojos entrecerrados mirando de reojo, ceja alzada y risita. */
export function sly() {
  const { head: h } = head();
  const eyes = [-0.2, 0.2].map((x) => onFace(h, eye().group, x, 0.06));
  eyes.forEach((e) => { e.scale.y = 0.55; e.children[1].position.x = 0.04; });
  brow(h, -0.21, 0.24, 0.32);
  brow(h, 0.2, 0.2, -0.05);
  onFace(h, openMouth(0.17, 0.05, { tongue: false }), 0.05, -0.2, 0.01).rotation.z += -0.16;
  blush(h, -0.33, -0.1); blush(h, 0.33, -0.1);
  return {
    group: wrap(h),
    animate(t) {
      const snicker = Math.abs(Math.sin(t * TAU * 4));
      h.position.y = snicker * 0.05 - 0.03;
      h.rotation.z = Math.sin(t * TAU) * 0.14;
      h.rotation.y = 0.2 + Math.sin(t * TAU) * 0.12;
      eyes.forEach((e) => (e.scale.y = 0.5 + snicker * 0.08));
    },
  };
}

/** "¡Grrr!": cejas en V, dientes apretados, se pone roja y le sale vapor. */
export function angry() {
  const { head: h, skin } = head();
  [-0.19, 0.19].forEach((x) => onFace(h, eye(0.9).group, x, 0.05).scale.set(1, 0.7, 1));
  brow(h, -0.18, 0.2, -0.45, 0.2);
  brow(h, 0.18, 0.2, 0.45, 0.2);
  onFace(h, openMouth(0.18, 0.045, { tongue: false, frown: true }), 0, -0.25, 0.01);
  const puffs = [...Array(6)].map(() => sphere(0.09, glow(0xffffff, 0.4, { transparent: true })));
  const group = wrap(h);
  puffs.forEach((p) => group.add(p));
  const calm = new THREE.Color(0xffc531), red = new THREE.Color(0xff4a2a);
  return {
    group,
    animate(t) {
      const boil = 0.5 + Math.sin(t * TAU * 2) * 0.5;
      skin.color.copy(calm).lerp(red, 0.45 + boil * 0.45);
      h.position.x = Math.sin(t * TAU * 12) * 0.02;
      h.scale.setScalar(1 + boil * 0.04);
      puffs.forEach((p, i) => {
        const side = i % 2 ? 1 : -1, k = (t * 2 + i / puffs.length) % 1;
        p.position.set(side * (0.7 + k * 0.25), 0.25 + k * 0.6, 0);
        p.scale.setScalar(0.5 + k * 1.3);
        p.material.opacity = 0.9 * (1 - k);
      });
    },
  };
}

/** "Ay, no…": cejas caídas, ojos brillosos, boca triste y una lágrima que rueda. */
export function sad() {
  const { head: h } = head();
  const eyes = [-0.2, 0.2].map((x) => { const e = eye(1.15); onFace(h, e.group, x, 0.04); return e; });
  eyes.forEach((e) => (e.pupil.position.y = -0.02));
  brow(h, -0.2, 0.25, 0.35);
  brow(h, 0.2, 0.25, -0.35);
  const mouth = put(h, lineMouth([[-0.13, -0.28], [0, -0.22], [0.13, -0.28]]));
  const drop = put(h, tear(1.2));
  return {
    group: wrap(h),
    animate(t) {
      h.rotation.x = 0.18 + Math.sin(t * TAU) * 0.05;
      h.position.y = -0.04 - Math.sin(t * TAU) * 0.03;
      mouth.position.y = Math.sin(t * TAU * 6) * 0.004;
      const k = t;
      const p = surface(-0.24, 0.0 - k * 0.42, 0.04);
      drop.position.copy(p);
      drop.scale.setScalar(Math.min(k * 5, 1) * (1 - Math.max(k - 0.85, 0) * 6));
    },
  };
}

/** "¡Jajaja!": ojos cerrados, boca enorme y lágrimas de risa saltando. */
export function laugh() {
  const { head: h } = head();
  [-0.2, 0.2].forEach((x) => onFace(h, closedEye(), x, 0.07, 0.02));
  brow(h, -0.2, 0.25, 0.15); brow(h, 0.2, 0.25, -0.15);
  const mouth = onFace(h, openMouth(0.24, 0.1), 0, -0.17, 0.01);
  blush(h, -0.36, -0.06); blush(h, 0.36, -0.06);
  const drops = [-1, 1].map(() => tear(1.5));
  const group = wrap(h);
  drops.forEach((d) => group.add(d));
  return {
    group,
    animate(t) {
      const ha = Math.abs(Math.sin(t * TAU * 3));
      h.position.y = ha * 0.08 - 0.04;
      h.rotation.x = -0.2 - ha * 0.1;
      h.rotation.z = Math.sin(t * TAU) * 0.08;
      mouth.scale.set(1, 0.8 + ha * 0.35, 1);
      drops.forEach((d, i) => {
        const side = i ? 1 : -1, k = (t * 3 + i * 0.5) % 1;
        d.position.set(side * (0.42 + k * 0.4), 0.12 + k * 0.35 - k * k * 0.7, 0.35);
        d.rotation.z = -side * (0.6 + k);
        d.scale.setScalar(k < 0.9 ? 1 : 0);
      });
    },
  };
}

/** "¡¿Qué?!": ojos enormes, boca en O y un brinco del susto. */
export function shocked() {
  const { head: h } = head();
  const eyes = [-0.2, 0.2].map((x) => { const e = eye(1.3); onFace(h, e.group, x, 0.08); return e; });
  eyes.forEach((e) => e.pupil.scale.set(0.6, 0.6, 1));
  brow(h, -0.2, 0.3, 0.12); brow(h, 0.2, 0.3, -0.12);
  const mouth = onFace(h, oMouth(0.09, 0.12), 0, -0.25, 0.01);
  const sweat = onFace(h, tear(1), 0.4, 0.22, 0.03);
  return {
    group: wrap(h),
    animate(t) {
      const jump = Math.max(0, Math.sin(Math.min(t / 0.35, 1) * Math.PI));
      h.position.y = jump * 0.18 - 0.05;
      h.scale.set(1 - jump * 0.06, 1 + jump * 0.08, 1);
      eyes.forEach((e) => e.group.scale.setScalar(1 + jump * 0.25 + Math.sin(t * TAU * 8) * 0.02));
      mouth.scale.set(1 + jump * 0.2, 1 + jump * 0.4 + Math.sin(t * TAU * 4) * 0.05, 1);
      sweat.position.y = 0.32 + Math.sin(t * TAU) * 0.01 - t * 0.04;
    },
  };
}

/** "Pan comido": gafas oscuras con su brillo, media sonrisa y cabeceo al ritmo. */
export function cool() {
  const { head: h } = head();
  const shades = new THREE.Group(), lens = glow(0x0d0f14, 0.2, { roughness: 0.05, metalness: 0.8 });
  for (const x of [-0.2, 0.2]) put(shades, new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.08, 6, 16), lens), x, 0, 0, 0, 0, Math.PI / 2).scale.z = 0.35;
  put(shades, new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.03), lens), 0, 0.06, 0);
  const glint = put(shades, new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.2), glow(0xffffff, 3, { transparent: true })), 0, 0, 0.05, 0, 0, 0.6);
  onFace(h, shades, 0, 0.07, 0.06);
  put(h, lineMouth([[-0.12, -0.24], [0.02, -0.25], [0.15, -0.18]]));
  const spark = put(h, sphere(0.04, glow(0xfff1b8, 6)), 0.36, 0.2, 0.62);
  return {
    group: wrap(h),
    animate(t) {
      h.rotation.x = Math.abs(Math.sin(t * TAU * 2)) * 0.18 - 0.05;
      h.rotation.y = -0.18;
      const k = (t * 1.5) % 1;
      glint.position.x = -0.35 + k * 0.7;
      glint.material.opacity = Math.sin(k * Math.PI);
      spark.scale.setScalar(Math.max(0, Math.sin(t * TAU * 3)) * 1.6);
    },
  };
}
