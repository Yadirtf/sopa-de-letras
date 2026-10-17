// Renderiza el arte 3D de La Batalla Más Temida: abre scene/page.html en
// Chromium (WebGL), pide cada imagen y la guarda como WebP.
//
//   cd app/tool/battle_art && npm i && node render.mjs ../../assets/battle [filtro]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(process.argv[2] ?? '../../assets/battle');
const FILTER = process.argv[3] ?? '';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('console', (m) => m.type() === 'error' && console.error('page:', m.text()));
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(`http://localhost:${port}/scene/page.html`);
await page.waitForFunction(() => window.battleArt?.ready === true, null, { timeout: 60000 });

const jobs = (await page.evaluate(() => window.battleArt.jobs())).filter((j) => j.includes(FILTER));
for (const job of jobs) {
  const dataUrl = await page.evaluate((j) => window.battleArt.render(j), job);
  const file = path.join(OUT, `${job}.webp`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log(job, Math.round(fs.statSync(file).size / 1024), 'KB');
}
await browser.close();
server.close();
