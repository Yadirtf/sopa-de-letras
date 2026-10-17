// Estudio para las reacciones: cámara en perspectiva de frente, luz de
// estudio y una tira de cuadros (sprite sheet) que la app reproduce en bucle.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { renderer } from '../stage.js';

export const FRAME = 192; // píxeles por cuadro
export const FRAMES = 24; // cuadros por vuelta (la app los pasa a ~16 por segundo)
export const COLS = 6;

let env = null;

function scene() {
  env ??= new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const s = new THREE.Scene();
  s.environment = env;
  s.environmentIntensity = 0.8;
  const key = new THREE.DirectionalLight(0xfff3e0, 2.6);
  key.position.set(-2, 3, 4);
  const rim = new THREE.DirectionalLight(0x9fc4ff, 1.6);
  rim.position.set(3, 1.5, -3);
  s.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x303040, 0.5));
  return s;
}

/** Tira de cuadros de `reaction` ({ group, animate(t) }) como WebP con fondo transparente. */
export function filmstrip(reaction) {
  const s = scene();
  s.add(reaction.group);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam.position.set(0, 0.55, 4.2);
  cam.lookAt(0, 0, 0);
  renderer.setSize(FRAME, FRAME, false);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false;

  const rows = Math.ceil(FRAMES / COLS);
  const sheet = document.createElement('canvas');
  sheet.width = FRAME * COLS;
  sheet.height = FRAME * rows;
  const g = sheet.getContext('2d');
  g.filter = 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))';
  for (let i = 0; i < FRAMES; i++) {
    reaction.animate(i / FRAMES);
    renderer.render(s, cam);
    g.drawImage(renderer.domElement, (i % COLS) * FRAME, Math.floor(i / COLS) * FRAME);
  }
  renderer.shadowMap.enabled = true;
  return sheet.toDataURL('image/webp', 0.88);
}
