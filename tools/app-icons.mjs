// Bakes the app's home-screen icons (src/lib/appIcons.ts) into PNGs in public/app-icons/v<VERSION>: 180 for the iPhone's
// apple-touch-icon, 192 and 512 for Android. Run from the repo root after changing an icon (raise VERSION first, so phones
// fetch the new pictures):
//   node tools/app-icons.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ICONS, NIGHT, VERSION, iconSvg } from "../src/lib/appIcons.ts";

// the bird: LOGO[4] in art.tsx, read from the file so there is one copy of the path
const art = fs.readFileSync("src/components/art.tsx", "utf8");
const start = art.indexOf("const LOGO = [");
const bird = [...art.slice(start, art.indexOf("];", start)).matchAll(/"(M[^"]+)"/g)][4][1];

const out = `public/app-icons/v${VERSION}`;
fs.mkdirSync(out, { recursive: true });
// icons with a long dark fade get a touch of grain at their final size (each pixel nudged by up to that many levels), so an
// 8-bit PNG shows a smooth fade instead of bands, as the landing page's favicon does
const GRAIN = new Map([["night", NIGHT.grain]]);
const keys = ICONS.map((i) => i.k).filter((k) => k !== "today");
for (const k of keys) {
  const svg = Buffer.from(iconSvg(k, bird));
  for (const size of [180, 192, 512]) {
    const img = sharp(svg, { density: 72 * (size / 1024) * 4 }).resize(size, size);
    const file = path.join(out, `${k}-${size}.png`);
    if (!GRAIN.has(k)) { await img.png().toFile(file); continue; }
    const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const g = GRAIN.get(k) * 2;
    for (let i = 0; i < data.length; i++) data[i] = Math.max(0, Math.min(255, Math.round(data[i] + (Math.random() - 0.5) * g)));
    await sharp(data, { raw: info }).png().toFile(file);
  }
}
console.log(`${keys.length} icons in ${out}`);
