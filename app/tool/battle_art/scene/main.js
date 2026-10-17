// Lista de trabajos para render.mjs: figuras (sana y destruida), terrenos y armas.
import { shoot } from './stage.js';
import { reseed } from './kit.js';
import { terrain, TERRAIN_IDS } from './terrains.js';
import { WEAPONS, weaponModel } from './weapons.js';
import { DESERT } from './units/desert.js';
import { JUNGLE } from './units/jungle.js';
import { SEA } from './units/sea.js';
import { SKY } from './units/sky.js';
import { ARCTIC } from './units/arctic.js';
import { CITY } from './units/city.js';
import { filmstrip } from './reactions/studio.js';
import { boom, medal, target, trophy } from './reactions/props.js';
import { flag, missile, siren, shield } from './reactions/gear.js';

const UNITS = { ...DESERT, ...JUNGLE, ...SEA, ...SKY, ...ARCTIC, ...CITY };

const jobs = {};
for (const [id, u] of Object.entries(UNITS)) {
  for (const rotated of [false, true]) {
    const tag = rotated ? '_r' : '';
    jobs[`units/${id}${tag}`] = () => shoot(u.build(), u.w, u.h, { altitude: u.altitude ?? 0, rotated });
    jobs[`units/${id}_wreck${tag}`] = () => shoot(u.build(), u.w, u.h, { wreck: true, rotated });
  }
}
for (const id of TERRAIN_IDS) jobs[`terrains/${id.toLowerCase()}`] = () => terrain(id);
// Reacciones del duelo: tiras de cuadros en bucle (ids iguales a los del backend).
const REACTIONS = { boom, well_played: medal, bullseye: target, winning: trophy, surrender: flag, incoming: missile, alert: siren, blocked: shield };
for (const [id, build] of Object.entries(REACTIONS)) jobs[`reactions/${id}`] = () => filmstrip(build());
for (const id of Object.keys(WEAPONS)) jobs[`weapons/${id.toLowerCase()}`] = () => shoot(weaponModel(id), 1, 1, { px: 256 });

window.battleArt = {
  ready: true,
  jobs: () => Object.keys(jobs),
  render: (name) => {
    reseed(name.length * 7919 + name.charCodeAt(name.length - 1));
    return jobs[name]();
  },
};
