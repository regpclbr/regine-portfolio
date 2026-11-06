/**
 * Makes lightweight WebP copies of every portfolio image for the carousel.
 *
 *   src/assets/portfolio/<folder>/<file>.png   (your originals — used in the detail view)
 *   → src/assets/portfolio-thumbs/<folder>/<file>.webp   (≈900px wide — used on the cards)
 *
 * Run after adding new work:  pnpm optimize:images
 * Only new or changed images are processed. If a thumbnail is missing, the site
 * simply falls back to the original file.
 */
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "src/assets/portfolio";
const OUT = "src/assets/portfolio-thumbs";
const WIDTH = 900;
const QUALITY = 78;

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("[optimize-portfolio] sharp not installed — skipping (originals will be used).");
  process.exit(0);
}

const exts = /\.(png|jpe?g|webp)$/i;
let made = 0;
let skipped = 0;

for (const folder of await readdir(SRC)) {
  const dir = path.join(SRC, folder);
  if (!(await stat(dir)).isDirectory()) continue;
  const outDir = path.join(OUT, folder);
  await mkdir(outDir, { recursive: true });

  for (const file of await readdir(dir)) {
    if (!exts.test(file)) continue;
    const input = path.join(dir, file);
    const output = path.join(outDir, file.replace(exts, ".webp"));
    const [inStat, outStat] = await Promise.all([stat(input), stat(output).catch(() => null)]);
    if (outStat && outStat.mtimeMs >= inStat.mtimeMs) {
      skipped++;
      continue;
    }
    await sharp(input).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(output);
    made++;
    console.log(`  ✓ ${folder}/${path.basename(output)}`);
  }
}

console.log(`[optimize-portfolio] ${made} created, ${skipped} up to date.`);
