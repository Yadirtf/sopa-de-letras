// Genera los iconos de la app (Android y web) a partir de icon.svg.
// icon.svg trae dos capas: <g id="fondo"> y <g id="figura">. Android 8+ las
// usa por separado (icono adaptativo); el resto recibe el dibujo completo.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, '..', '..');
const svg = readFileSync(join(here, 'icon.svg'), 'utf8');
const fonts = 'https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=JetBrains+Mono:wght@700;800&display=swap';

// capa: 'todo' | 'fondo' | 'figura'. escala: tamaño de la figura (1 = original).
// radio: esquinas redondeadas en % del lado (0 = cuadrado a sangre).
const variantes = [];
const android = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [dpi, f] of Object.entries(android)) {
  const dir = join(app, 'android/app/src/main/res', `mipmap-${dpi}`);
  variantes.push({ out: join(dir, 'ic_launcher.png'), size: 48 * f, capa: 'todo', escala: 0.9, radio: 22 });
  // 108 dp de lienzo; la figura cabe en la zona segura (círculo de 66 dp).
  variantes.push({ out: join(dir, 'ic_launcher_foreground.png'), size: 108 * f, capa: 'figura', escala: 0.58 });
  variantes.push({ out: join(dir, 'ic_launcher_background.png'), size: 108 * f, capa: 'fondo', escala: 1 });
}
const web = join(app, 'web');
variantes.push(
  { out: join(web, 'icons/Icon-192.png'), size: 192, capa: 'todo', escala: 0.9, radio: 22 },
  { out: join(web, 'icons/Icon-512.png'), size: 512, capa: 'todo', escala: 0.9, radio: 22 },
  // Maskable: el navegador recorta hasta un círculo del 80 %.
  { out: join(web, 'icons/Icon-maskable-192.png'), size: 192, capa: 'todo', escala: 0.74 },
  { out: join(web, 'icons/Icon-maskable-512.png'), size: 512, capa: 'todo', escala: 0.74 },
  { out: join(web, 'favicon.png'), size: 32, capa: 'todo', escala: 1, radio: 22 },
);

function pagina({ size, capa, escala, radio = 0 }) {
  const ocultar = capa === 'fondo' ? '#figura' : capa === 'figura' ? '#fondo' : null;
  return `<html><head><link href="${fonts}" rel="stylesheet"><style>
    html,body{margin:0;background:transparent}
    svg{width:${size}px;height:${size}px;display:block;border-radius:${radio}%}
    #figura{transform-origin:256px 256px;transform:scale(${escala})}
    ${ocultar ? `${ocultar}{display:none}` : ''}
  </style></head><body>${svg}</body></html>`;
}

const browser = await chromium.launch();
for (const v of variantes) {
  const page = await browser.newPage({ viewport: { width: v.size, height: v.size } });
  await page.setContent(pagina(v));
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(v.out), { recursive: true });
  await page.screenshot({ path: v.out, omitBackground: true });
  await page.close();
  console.log(`${v.size}px  ${v.out.replace(app + '/', '')}`);
}
await browser.close();
