// Genera los avatares de WordHive: DiceBear (determinista por semilla) y Fluent Emoji 3D.
import { createAvatar } from '@dicebear/core';
import * as col from '@dicebear/collection';
import sharp from 'sharp';
import fs from 'node:fs';
const OUT = process.argv[2];
const SIZE = 256, N = 24;
const dice = { aventureros: col.adventurer, comic: col.avataaars, sonrisas: col.bigSmile, robots: col.bottts,
  pixel: col.pixelArt, caritas: col.funEmoji, retratos: col.lorelei, bocetos: col.notionists };
const pastel = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'c1f0dc', 'fde68a'];
// Solo gestos alegres: nada de caras tristes, enfadadas o enfermas.
const extra = {
  aventureros: { backgroundColor: pastel },
  sonrisas: { backgroundColor: pastel },
  pixel: { backgroundColor: pastel },
  retratos: { backgroundColor: pastel },
  bocetos: { backgroundColor: pastel },
  comic: { backgroundColor: pastel, eyes: ['default', 'happy', 'hearts', 'squint', 'wink', 'surprised'],
    mouth: ['default', 'smile', 'twinkle', 'tongue'], eyebrows: ['default', 'defaultNatural', 'raisedExcited', 'raisedExcitedNatural', 'upDown'] },
  caritas: { eyes: ['cute', 'glasses', 'love', 'plain', 'shades', 'stars', 'wink', 'wink2', 'closed'],
    mouth: ['lilSmile', 'cute', 'wideSmile', 'smileTeeth', 'tongueOut', 'kissHeart', 'smileLol', 'shy'] },
};
const seeds = ['Luna','Teo','Sofi','Max','Mia','Leo','Valen','Nico','Emma','Juan','Isa','Tomás','Abril','Dani','Sara','Bruno','Lola','Mateo','Vale','Gael','Noa','Pablo','Zoe','Iker'];
const webp = (buf, file) => sharp(buf, { density: 300 }).resize(SIZE, SIZE).webp({ quality: 82 }).toFile(file);
for (const [cat, style] of Object.entries(dice)) {
  fs.mkdirSync(`${OUT}/${cat}`, { recursive: true });
  for (let i = 0; i < N; i++) {
    const svg = createAvatar(style, { seed: `wordhive-${cat}-${seeds[i]}`, size: SIZE, ...(extra[cat] ?? {}) }).toString();
    await webp(Buffer.from(svg), `${OUT}/${cat}/${String(i + 1).padStart(2, '0')}.webp`);
  }
}
const fluent = JSON.parse(fs.readFileSync('fluent.json', 'utf8'));
const tones = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];
const base = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/';
for (const [cat, items] of Object.entries(fluent)) {
  fs.mkdirSync(`${OUT}/${cat}`, { recursive: true });
  let i = 0;
  for (const [folder] of items) {
    const slug = folder.toLowerCase().replace(/ /g, '_');
    const tone = tones[i % tones.length];
    const urls = [`${base}${encodeURIComponent(folder)}/3D/${slug}_3d.png`,
      `${base}${encodeURIComponent(folder)}/${tone}/3D/${slug}_3d_${tone.toLowerCase()}.png`];
    let ok = false;
    for (const u of urls) {
      const r = await fetch(u);
      if (r.ok) { await webp(Buffer.from(await r.arrayBuffer()), `${OUT}/${cat}/${String(++i).padStart(2, '0')}.webp`); ok = true; break; }
    }
    if (!ok) console.error('FALTA', cat, folder);
  }
  console.log(cat, i);
}
