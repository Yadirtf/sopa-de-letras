# Arte 3D de La Batalla Más Temida

`assets/battle/{units,terrains,weapons}/*.webp` sale de este script: modelos
3D hechos con three.js, renderizados desde arriba (ortográfica con 16° de
inclinación, sombras suaves) en Chromium sin pantalla. Es determinista: la
misma semilla da siempre el mismo dibujo.

```bash
cd app/tool/battle_art
npm i
node render.mjs ../../assets/battle          # todo
node render.mjs ../../assets/battle tank     # solo lo que contenga "tank"
```

- `scene/units/<terreno>.js`: un modelo por figura. El id es el del catálogo
  del backend (`battle-terrains.catalog.ts`). Cada figura sale en cuatro
  versiones: `<id>`, `<id>_wreck` (quemada), `<id>_r` (girada, para cuando
  se coloca acostada) y `<id>_wreck_r`.
- `scene/terrains.js`: texturas de suelo de 512 px que se repiten sin costura.
- `scene/weapons.js`: iconos del armamento.
- `scene/kit.js` y `scene/craft.js`: piezas comunes (ruedas, orugas,
  soldados, aviones, cascos de barco).

`fx/` (fuego, destellos, humo y polvo) son cuadros de "Smoke Particles" de
Kenney (CC0), reducidos a 160 px en WebP. Licencias en
`assets/battle/LICENSES.txt`; la app las registra en `LicenseRegistry` y la
landing las cita en Créditos.
