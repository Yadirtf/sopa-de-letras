// Reacciones de equipo militar: bandera blanca, misil, sirena y escudo.
// Cada una es { group, animate(t) } con t de 0 a 1 en bucle.
import * as THREE from 'three';
import { M, cyl, sphere, put, STEEL } from '../kit.js';
import { star } from './props.js';

const TAU = Math.PI * 2;
const glow = (color, k = 3, extra = {}) => M(color, 0.4, 0, { emissive: color, emissiveIntensity: k, ...extra });

/** "¡Me rindo!": bandera blanca ondeando en su asta. */
export function flag() {
  const group = new THREE.Group();
  put(group, cyl(0.03, 0.03, 1.7, M(0x7a5232, 0.7, 0)), -0.5, -0.15, 0);
  put(group, sphere(0.06, M(0xd4a72c, 0.3, 1)), -0.5, 0.72, 0);
  const geo = new THREE.PlaneGeometry(1.05, 0.68, 30, 14);
  const base = geo.attributes.position.array.slice();
  const cloth = put(group, new THREE.Mesh(geo, M(0xf4f2ec, 0.85, 0, { side: THREE.DoubleSide })), 0.03, 0.34, 0);
  group.rotation.y = 0.35;
  return {
    group,
    animate(t) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3] + 0.525, y = base[i * 3 + 1];
        const k = x / 1.05;
        pos.setZ(i, Math.sin(x * 5.5 - t * TAU * 2 + y * 1.2) * 0.13 * k);
        pos.setY(i, y - k * k * 0.06 + Math.sin(x * 4 - t * TAU * 2) * 0.02 * k);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      cloth.position.y = 0.34 + Math.sin(t * TAU) * 0.01;
    },
  };
}

/** "¡Ahí va!": misil en vuelo, girando sobre sí mismo con la llama viva. */
export function missile() {
  const group = new THREE.Group(), body = new THREE.Group();
  put(body, cyl(0.13, 0.13, 1.2, M(0xdfe2dc, 0.35, 0.4)), 0, 0, 0);
  put(body, new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 32), M(0xc22a1d, 0.4, 0.3)), 0, 0.78, 0);
  put(body, cyl(0.135, 0.135, 0.08, M(0x2f3a28, 0.5, 0.3)), 0, 0.3, 0);
  for (let i = 0; i < 4; i++) put(body, new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.42), M(0x4b5a3a, 0.5, 0.3)), 0, -0.48, 0, 0, (i * Math.PI) / 2);
  put(body, cyl(0.09, 0.11, 0.07, M(0x1b1b1b, 0.5, 0.6)), 0, -0.63, 0);
  const flame = put(body, new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 20), glow(0xff7a1a, 4, { transparent: true, opacity: 0.95 })), 0, -0.92, 0, Math.PI);
  const core = put(body, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 16), glow(0xfff2b0, 6)), 0, -0.82, 0, Math.PI);
  group.add(body);
  group.rotation.set(0.25, 0, -0.95);
  return {
    group,
    animate(t) {
      body.rotation.y = t * TAU;
      const f = 0.85 + Math.abs(Math.sin(t * TAU * 9)) * 0.4;
      flame.scale.set(1, f, 1);
      core.scale.set(1, 0.8 + f * 0.3, 1);
      group.position.set(Math.sin(t * TAU) * 0.06, Math.cos(t * TAU * 2) * 0.05, 0);
    },
  };
}

function haloTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** "¡Alerta!": sirena con su luz roja girando. */
export function siren() {
  const group = new THREE.Group();
  put(group, cyl(0.42, 0.48, 0.18, M(0x2a2d33, 0.45, 0.7)), 0, -0.45, 0);
  put(group, cyl(0.36, 0.36, 0.06, STEEL), 0, -0.33, 0);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 16, 0, TAU, 0, Math.PI / 2), M(0xe11d1d, 0.1, 0, { transparent: true, opacity: 0.55, emissive: 0x7f0d0d, emissiveIntensity: 0.6 }));
  put(group, cyl(0.36, 0.36, 0.3, dome.material), 0, -0.15, 0);
  put(group, dome, 0, 0, 0);
  const lamp = new THREE.Group();
  put(lamp, sphere(0.1, glow(0xffe1e1, 6)), 0, -0.05, 0);
  put(lamp, new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 12, -Math.PI / 2, Math.PI), M(0xd9dde2, 0.15, 1, { side: THREE.DoubleSide })), -0.04, -0.05, 0);
  group.add(lamp);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color: 0xff4040, transparent: true, depthWrite: false }));
  halo.position.set(0, -0.05, -0.2);
  group.add(halo);
  group.rotation.x = 0.25;
  return {
    group,
    animate(t) {
      lamp.rotation.y = t * TAU * 2;
      const flash = Math.max(0, Math.cos(t * TAU * 2));
      dome.material.emissiveIntensity = 0.5 + flash * 1.6;
      halo.material.opacity = 0.15 + flash * 0.75;
      halo.scale.setScalar(1.1 + flash * 0.9);
      group.position.y = Math.abs(Math.sin(t * TAU * 4)) * 0.03;
    },
  };
}

/** "¡No me das!": escudo que rechaza una bala con una chispa. */
export function shield() {
  const group = new THREE.Group(), plate = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0.55);
  s.lineTo(0.5, 0.55);
  s.lineTo(0.5, 0.05);
  s.quadraticCurveTo(0.45, -0.45, 0, -0.68);
  s.quadraticCurveTo(-0.45, -0.45, -0.5, 0.05);
  s.closePath();
  const extrude = (shape, depth, mat) => new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 }), mat);
  put(plate, extrude(s, 0.08, M(0x8a96a3, 0.3, 0.9)), 0, 0, -0.04);
  const inner = new THREE.Shape(s.getPoints(40).map((p) => p.clone().multiplyScalar(0.78)));
  put(plate, extrude(inner, 0.04, M(0x1e40af, 0.45, 0.4)), 0, 0.02, 0.06);
  put(plate, star(0.3, 0.13, 0.03, M(0xf2b632, 0.25, 1)), 0, 0.02, 0.1);
  group.add(plate);
  const bullet = put(group, cyl(0.035, 0.035, 0.14, M(0xc8a24a, 0.3, 1)), 0, 0, 0, Math.PI / 2);
  const spark = put(group, sphere(0.12, glow(0xfff0a0, 6, { transparent: true })), 0.08, 0.1, 0.3);
  return {
    group,
    animate(t) {
      const hit = 0.35;
      if (t < hit) bullet.position.set(0.9 - (t / hit) * 0.82, 0.1, 1.8 - (t / hit) * 1.5);
      else bullet.position.set(0.08 + (t - hit) * 2.4, 0.1 + (t - hit) * 1.6, 0.3 + (t - hit) * 1.2);
      bullet.visible = t < 0.8;
      const k = Math.max(0, 1 - Math.abs(t - hit) / 0.08);
      spark.scale.setScalar(0.2 + k * 1.4);
      spark.material.opacity = k;
      plate.rotation.y = -0.3 - k * 0.25 + Math.sin(t * TAU) * 0.08;
      plate.position.x = -k * 0.06;
    },
  };
}
