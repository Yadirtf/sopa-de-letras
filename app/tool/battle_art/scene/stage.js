// Escenario de foto: cámara ortográfica mirando hacia abajo, sol desde arriba
// a la izquierda, sombras suaves y reflejos de ambiente. 1 casilla = 1 unidad.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const PX = 160; // píxeles por casilla en las figuras
/** Inclinación de la cámara: casi cenital, pero deja ver un poco los costados. */
export const TILT = (16 * Math.PI) / 180;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

function scorch() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(10,8,6,0.85)');
  grad.addColorStop(0.6, 'rgba(25,18,12,0.45)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Copia la foto con un borde oscuro suave: la figura se lee sobre cualquier terreno. */
function withHalo(src) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d');
  g.filter = 'drop-shadow(0 0 1.4px rgba(0,0,0,0.85)) drop-shadow(0 0 3px rgba(0,0,0,0.45))';
  g.drawImage(src, 0, 0);
  return c.toDataURL('image/webp', 0.86);
}

/** Quema los materiales: así se ve la figura destruida. */
function charred(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    const burnt = list.map((m) => {
      const b = m.clone();
      if (b.color) b.color.lerp(new THREE.Color(0x1c1714), 0.78);
      if ('roughness' in b) b.roughness = 1;
      if ('metalness' in b) b.metalness = 0.1;
      if (b.emissive) b.emissive.setHex(0x000000);
      return b;
    });
    o.material = Array.isArray(o.material) ? burnt : burnt[0];
  });
}

/**
 * Foto de una figura de `w`×`h` casillas (su frente mira hacia arriba de la imagen).
 * `altitude` levanta la figura (aviones, globos) para que su sombra caiga más lejos.
 */
export function shoot(model, w, h, { altitude = 0, wreck = false, px = PX, ground = null, rotated = false } = {}) {
  if (rotated) {
    model.rotation.y = -Math.PI / 2;
    [w, h] = [h, w];
  }
  const scene = new THREE.Scene();
  scene.environment = envMap;
  scene.environmentIntensity = 0.45;
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x4a3b28, 0.35));
  const sun = new THREE.DirectionalLight(0xfff1dc, 3.2);
  sun.position.set(-2.2, 6, -2.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -w, right: w, top: h, bottom: -h, near: 0.1, far: 20 });
  scene.add(sun);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 2, h * 2),
    ground ?? new THREE.ShadowMaterial({ opacity: 0.42 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  if (wreck) {
    charred(model);
    model.rotation.y += 0.06;
    model.rotation.z += 0.04;
    const mark = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 1.05, h * 1.05),
      new THREE.MeshBasicMaterial({ map: scorch(), transparent: true, depthWrite: false }),
    );
    mark.rotation.x = -Math.PI / 2;
    mark.position.y = 0.002;
    scene.add(mark);
  }
  model.position.y += altitude;
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  scene.add(model);

  const vh = h * Math.cos(TILT);
  const cam = new THREE.OrthographicCamera(-w / 2, w / 2, vh / 2, -vh / 2, 0.1, 50);
  cam.position.set(0, 20 * Math.cos(TILT), 20 * Math.sin(TILT));
  cam.up.set(0, 0, -1);
  cam.lookAt(0, 0, 0);
  renderer.setSize(Math.round(w * px), Math.round(vh * px), false);
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, cam);
  return withHalo(renderer.domElement);
}

export { renderer, THREE };
