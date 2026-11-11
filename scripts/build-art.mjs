// Builds the responsive hero artwork in public/art from high-resolution masters.
// Usage: node scripts/build-art.mjs <dir-with-master-pngs> [name ...]
// Masters are greyscale PNGs named <page>.png (home, platform, models, consulting, insights, resources).
import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const [src, ...only] = process.argv.slice(2);
if (!src) throw new Error('Pass the directory that holds the master PNGs.');
const out = 'public/art';
const manifestPath = 'src/data/art.json';
const WIDTHS = [1280, 1920, 2560, 3840, 5120];
sharp.cache(false);
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'));

for (const file of (await readdir(src)).filter((f) => f.endsWith('.png'))) {
  const name = path.basename(file, '.png');
  if (only.length && !only.includes(name)) continue;
  const input = path.join(src, file);
  const { width, height } = await sharp(input, { limitInputPixels: false }).metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  if (width < WIDTHS.at(-1) && !widths.includes(width)) widths.push(width);
  for (const w of widths) {
    const base = sharp(input, { limitInputPixels: false }).resize({ width: w, kernel: 'lanczos3' }).greyscale();
    await base.clone().avif({ quality: w > 2560 ? 52 : 58, effort: 5 }).toFile(`${out}/${name}-${w}.avif`);
    await base.clone().webp({ quality: w > 2560 ? 78 : 84, effort: 5 }).toFile(`${out}/${name}-${w}.webp`);
    console.log(name, w);
  }
  manifest[name] = { w: width, h: height, widths };
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
