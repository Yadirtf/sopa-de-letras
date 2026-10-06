# Avatares

`assets/avatars/<categoria>/NN.webp` sale de este script. Es determinista:
la misma semilla da siempre el mismo dibujo, así que el id guardado de cada
jugador (`animales_01`, `robots_07`…) nunca cambia de imagen.

```bash
cd app/tool/avatars
npm i @dicebear/core@9 @dicebear/collection@9 sharp
node gen.mjs ../../assets/avatars
```

- DiceBear: 8 estilos, 24 avatares por estilo (`seeds` en `gen.mjs`).
- Fluent Emoji 3D (Microsoft, MIT): `fluent.json` lista carpeta y nombre en
  español. Los nombres también están en `lib/core/avatars/avatar_catalog.dart`.

Para añadir avatares a una categoría, agrégalos **al final** y sube `count`
en el catálogo: cambiar el orden reasignaría los avatares ya elegidos.
Licencias en `assets/avatars/LICENSES.txt` (la app también las registra en `LicenseRegistry`).
