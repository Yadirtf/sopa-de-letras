# Icono de la app

`icon.svg` es el logo de WordHive (la Abejita). Tiene dos capas:
`<g id="fondo">` (cielo nocturno) y `<g id="figura">` (la abeja y sus fichas).
`gen.mjs` genera con ellas todos los iconos:

- Android: `mipmap-*/ic_launcher.png` (dibujo completo) y, para Android 8+,
  `ic_launcher_background.png` + `ic_launcher_foreground.png`, que
  `mipmap-anydpi-v26/ic_launcher.xml` une en un icono adaptativo.
- Web: `icons/Icon-*.png`, los `maskable` y `favicon.png`.

```bash
cd app/tool/launcher_icon
npm i playwright && npx playwright install chromium
node gen.mjs
```

Para cambiar el logo basta con editar `icon.svg` (lienzo 512×512) y volver a
correr el script. La figura se reduce sola para caber en la zona segura del
icono adaptativo, así que no hace falta dejarle margen.
