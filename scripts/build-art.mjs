// Builds the responsive hero artwork in public/art from high-resolution masters.
// Usage: node scripts/build-art.mjs <dir-with-master-pngs> [name ...] [--mobile-only]
// Masters are greyscale PNGs named <page>.png (home, platform, models, consulting, insights, resources).
//
// Two sets are written for each master:
// - full-width tiers (<name>-<w>.avif|webp) for screens wider than 540px
// - phone tiers (<name>-m<w>.avif|webp): a centre crop of MOBILE_FRACTION of the width, which
//   is all a phone ever shows, since the art is drawn 90rem wide and centred (see .art in
//   global.css). Phones then download roughly a third of the pixels for the same picture.
import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const mobileOnly = args.includes('--mobile-only');
const [src, ...only] = args.filter((a) => !a.startsWith('--'));
if (!src) throw new Error('Pass the directory that holds the master PNGs.');
const out = 'public/art';
const manifestPath = 'src/data/art.json';
const WIDTHS = [1280, 1920, 2560, 3840, 5120];
const MOBILE_FRACTION = 0.4; // 36rem of 90rem: keep in step with the 540px rule in global.css
const MOBILE_WIDTHS = [960, 1280, 1600];
sharp.cache(false);
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'));
const existing = await readdir(out);

const encode = async (pipeline, file, big) => {
  await pipeline.clone().avif({ quality: big ? 52 : 58, effort: 5 }).toFile(`${out}/${file}.avif`);
  await pipeline.clone().webp({ quality: big ? 78 : 84, effort: 5 }).toFile(`${out}/${file}.webp`);
};

for (const file of (await readdir(src)).filter((f) => f.endsWith('.png'))) {
  const name = path.basename(file, '.png');
  if (only.length && !only.includes(name)) continue;
  const input = path.join(src, file);
  const open = () => sharp(input, { limitInputPixels: false });
  const { width, height } = await open().metadata();
  const entry = { ...(manifest[name] ?? {}), w: width, h: height };

  // remove this master's previous variants so no stale size is left behind
  const stale = new RegExp(`^${name}-${mobileOnly ? 'm' : 'm?'}\\d+\\.(avif|webp)$`);
  for (const f of existing.filter((f) => stale.test(f))) await unlink(`${out}/${f}`);

  if (!mobileOnly) {
    const widths = WIDTHS.filter((w) => w <= width);
    if (width < WIDTHS.at(-1) && !widths.includes(width)) widths.push(width);
    for (const w of widths) {
      await encode(open().resize({ width: w, kernel: 'lanczos3' }).greyscale(), `${name}-${w}`, w > 2560);
      console.log(name, w);
    }
    entry.widths = widths;
  }

  const cw = Math.round(width * MOBILE_FRACTION);
  const crop = { left: Math.round((width - cw) / 2), top: 0, width: cw, height };
  const mobile = MOBILE_WIDTHS.filter((w) => w <= cw);
  if (cw < MOBILE_WIDTHS.at(-1) && !mobile.includes(cw)) mobile.push(cw); // the crop's own size is the sharpest it gets
  for (const w of mobile) {
    await encode(open().extract(crop).resize({ width: w, kernel: 'lanczos3' }).greyscale(), `${name}-m${w}`, false);
    console.log(name, 'm' + w);
  }
  entry.mw = cw;
  entry.mobile = mobile;
  manifest[name] = entry;
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
