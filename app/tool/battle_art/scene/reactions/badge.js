// Icono del botón de reacciones: globo de diálogo 3D con una carita que guiña
// y un rayo, para que se entienda de un vistazo "mándale una reacción".
import * as THREE from 'three';
import { M, sphere, put } from '../kit.js';
import { TAU, INK, glow } from './face_kit.js';

function bubbleShape() {
  const s = new THREE.Shape(), w = 0.78, h = 0.58, r = 0.3;
  s.moveTo(-w + r, h);
  s.lineTo(w - r, h);
  s.quadraticCurveTo(w, h, w, h - r);
  s.lineTo(w, -h + r);
  s.quadraticCurveTo(w, -h, w - r, -h);
  s.lineTo(-0.1, -h);
  s.lineTo(-0.5, -h - 0.32); // la colita del globo
  s.lineTo(-0.42, -h);
  s.lineTo(-w + r, -h);
  s.quadraticCurveTo(-w, -h, -w, -h + r);
  s.lineTo(-w, h - r);
  s.quadraticCurveTo(-w, h, -w + r, h);
  return s;
}

function bolt() {
  const s = new THREE.Shape();
  [[0.05, 0.3], [-0.12, -0.02], [0.0, -0.02], [-0.06, -0.3], [0.13, 0.06], [0.01, 0.06]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015 }), glow(0xffb800, 0.5, { roughness: 0.3, metalness: 0.4 }));
}

export function badge() {
  const group = new THREE.Group(), bubble = new THREE.Group();
  const geo = new THREE.ExtrudeGeometry(bubbleShape(), { depth: 0.22, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 5, curveSegments: 24 });
  geo.center();
  put(bubble, new THREE.Mesh(geo, M(0xff8a1f, 0.28, 0.05, { envMapIntensity: 1.2 })));
  const face = new THREE.Group();
  put(face, sphere(0.085, INK, 1, 1.3, 0.4), -0.24, 0.12, 0);
  const open = put(face, sphere(0.085, INK, 1, 1.3, 0.4), 0.24, 0.12, 0);
  const wink = put(face, new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.03, 8, 20, Math.PI), INK), 0.24, 0.1, 0);
  const smile = new THREE.CatmullRomCurve3([[-0.32, -0.08], [0, -0.3], [0.32, -0.08]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  put(face, new THREE.Mesh(new THREE.TubeGeometry(smile, 24, 0.045, 10), INK));
  face.position.set(0, 0.06, 0.2);
  bubble.add(face);
  const zap = put(group, bolt(), 0.62, 0.5, 0.55, 0, 0, -0.3);
  zap.scale.setScalar(1.3);
  bubble.rotation.y = -0.25;
  group.add(bubble);
  group.scale.setScalar(0.85);
  return {
    group,
    animate(t) {
      bubble.rotation.z = Math.sin(t * TAU) * 0.08;
      bubble.position.y = Math.abs(Math.sin(t * TAU * 2)) * 0.05 - 0.05;
      const blink = t > 0.55 && t < 0.75;
      wink.visible = blink;
      open.visible = !blink;
      zap.scale.setScalar(1.1 + Math.max(0, Math.sin(t * TAU * 2)) * 0.3);
      zap.rotation.z = -0.3 + Math.sin(t * TAU * 2) * 0.1;
    },
  };
}
