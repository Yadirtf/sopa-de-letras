// Suelos de los 6 terrenos: ruido periódico (se repite sin costuras) con
// relieve iluminado por el mismo sol que las figuras.
import * as THREE from 'three';
import { renderer } from './stage.js';

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p, float per) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(mod(i, per)), b = hash(mod(i + vec2(1, 0), per));
    float c = hash(mod(i + vec2(0, 1), per)), d = hash(mod(i + vec2(1, 1), per));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p, float per, int oct) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 8; i++) {
      if (i >= oct) break;
      v += a * vnoise(p, per);
      p *= 2.0; per *= 2.0; a *= 0.5;
    }
    return v;
  }
`;

/** Cada terreno: altura(uv) y color(altura, uv). `uv` va de 0 a 1 y se repite. */
const KINDS = {
  DESERT: `
    float height(vec2 uv) {
      float warp = fbm(uv * 3.0, 3.0, 4);
      float dunes = sin((uv.x * 2.0 + uv.y * 4.0 + warp * 1.6) * 6.2831) * 0.5 + 0.5;
      return dunes * 0.6 + fbm(uv * 6.0, 6.0, 4) * 0.3 + vnoise(uv * 160.0, 160.0) * 0.02;
    }
    vec3 base(float h, vec2 uv) {
      vec3 c = mix(vec3(0.70, 0.55, 0.33), vec3(0.88, 0.74, 0.50), h);
      return c * (0.96 + 0.06 * vnoise(uv * 300.0, 300.0));
    }`,
  JUNGLE: `
    float height(vec2 uv) {
      float leaves = fbm(uv * 12.0, 12.0, 6);
      return pow(leaves, 1.3) + vnoise(uv * 90.0, 90.0) * 0.12;
    }
    vec3 base(float h, vec2 uv) {
      vec3 dark = vec3(0.07, 0.16, 0.06), mid = vec3(0.17, 0.33, 0.11), light = vec3(0.38, 0.52, 0.18);
      vec3 c = h < 0.45 ? mix(dark, mid, h / 0.45) : mix(mid, light, (h - 0.45) / 0.55);
      float mud = smoothstep(0.62, 0.7, fbm(uv * 3.0 + 7.0, 3.0, 4));
      return mix(c, vec3(0.33, 0.25, 0.14), mud * 0.85);
    }`,
  SEA: `
    float height(vec2 uv) {
      return fbm(uv * 6.0 + fbm(uv * 4.0, 4.0, 3), 6.0, 6) * 0.6 + fbm(uv * 24.0, 24.0, 3) * 0.25;
    }
    vec3 base(float h, vec2 uv) {
      return mix(vec3(0.04, 0.17, 0.30), vec3(0.09, 0.36, 0.50), h);
    }`,
  SKY: `
    float height(vec2 uv) {
      float c = fbm(uv * 6.0, 6.0, 7);
      return smoothstep(0.5, 0.78, c) * (0.6 + 0.4 * fbm(uv * 16.0, 16.0, 4));
    }
    vec3 base(float h, vec2 uv) {
      vec3 far = mix(vec3(0.33, 0.48, 0.66), vec3(0.42, 0.56, 0.48), fbm(uv * 5.0 + 3.0, 5.0, 4));
      return mix(far, vec3(0.97, 0.98, 1.0), smoothstep(0.02, 0.35, h));
    }`,
  ARCTIC: `
    float height(vec2 uv) {
      float drift = sin((uv.x * 3.0 - uv.y * 2.0 + fbm(uv * 4.0, 4.0, 4) * 1.2) * 6.2831 * 2.0) * 0.5 + 0.5;
      return drift * 0.25 + fbm(uv * 5.0, 5.0, 5) * 0.55 + vnoise(uv * 200.0, 200.0) * 0.02;
    }
    vec3 base(float h, vec2 uv) {
      float ice = smoothstep(0.66, 0.72, fbm(uv * 3.0 + 11.0, 3.0, 5));
      vec3 snow = mix(vec3(0.80, 0.86, 0.92), vec3(0.98, 0.99, 1.0), h);
      return mix(snow, vec3(0.55, 0.75, 0.86), ice * 0.8);
    }`,
  CITY: `
    float height(vec2 uv) {
      vec2 tile = fract(uv * 8.0);
      float joint = smoothstep(0.0, 0.05, tile.x) * smoothstep(1.0, 0.95, tile.x) * smoothstep(0.0, 0.05, tile.y) * smoothstep(1.0, 0.95, tile.y);
      float crack = smoothstep(0.012, 0.0, abs(fbm(uv * 6.0, 6.0, 4) - 0.5));
      return joint * 0.7 + fbm(uv * 30.0, 30.0, 4) * 0.25 - crack * 0.35;
    }
    vec3 base(float h, vec2 uv) {
      float slab = hash(floor(mod(uv * 8.0, 8.0)));
      vec3 c = mix(vec3(0.38, 0.38, 0.37), vec3(0.55, 0.54, 0.51), slab * 0.6 + h * 0.4);
      float dirt = smoothstep(0.55, 0.8, fbm(uv * 4.0 + 5.0, 4.0, 5));
      return mix(c, vec3(0.26, 0.24, 0.21), dirt * 0.6);
    }`,
};

const FRAG = (kind) => /* glsl */ `
  varying vec2 vUv;
  ${NOISE}
  ${KINDS[kind]}
  void main() {
    float e = 1.0 / 512.0;
    float h = height(vUv);
    vec3 n = normalize(vec3(height(vUv - vec2(e, 0)) - height(vUv + vec2(e, 0)),
                            height(vUv - vec2(0, e)) - height(vUv + vec2(0, e)), ${{ SEA: '0.016', DESERT: '0.07', ARCTIC: '0.07', SKY: '0.05', CITY: '0.04', JUNGLE: '0.03' }[kind]}));
    vec3 sun = normalize(vec3(-0.45, 0.55, 0.7));
    float lit = clamp(dot(n, sun), 0.0, 1.0);
    vec3 col = base(h, vUv) * (0.68 + 0.42 * lit);
    ${kind === 'SEA' ? 'col += vec3(0.9, 0.95, 1.0) * pow(clamp(dot(reflect(-sun, n), vec3(0, 0, 1)), 0.0, 1.0), 40.0) * 0.6;' : ''}
    gl_FragColor = vec4(pow(col, vec3(1.0 / 1.1)), 1.0);
  }`;

/** Textura cuadrada que se repite; cubre 8×8 casillas en el tablero. */
export function terrain(kind, size = 512) {
  const scene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: FRAG(kind),
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const tone = renderer.toneMapping;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setSize(size, size, false);
  renderer.render(scene, new THREE.Camera());
  renderer.toneMapping = tone;
  return renderer.domElement.toDataURL('image/webp', 0.88);
}

export const TERRAIN_IDS = Object.keys(KINDS);
