// Lab (MC 3): turns the home-screen icons in src/app/lab/mc3/icons.ts into PNGs in public/lab/mc3/icons
// (180 for the iPhone's apple-touch-icon, 192 and 512 for the manifest). Run from the repo root:
//   node tools/lab-mc3-icons.mjs [--sheet out.png]
// --sheet also writes every icon side by side, rounded like a home screen, to check them in one look.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ICONS, iconSvg } from "../src/app/lab/mc3/icons.ts";

// the bird: LOGO[4] in art.tsx, read from the file so there is one copy of the path
const art = fs.readFileSync("src/components/art.tsx", "utf8");
const start = art.indexOf("const LOGO = [");
const bird = [...art.slice(start, art.indexOf("];", start)).matchAll(/"(M[^"]+)"/g)][4][1];

const out = "public/lab/mc3/icons";
fs.mkdirSync(out, { recursive: true });
const keys = ICONS.map((i) => i.k).filter((k) => k !== "today");
for (const k of keys) {
  const svg = Buffer.from(iconSvg(k, bird));
  for (const size of [180, 192, 512]) await sharp(svg, { density: 72 * (size / 1024) * 4 }).resize(size, size).png().toFile(path.join(out, `${k}-${size}.png`));
}
console.log(`${keys.length} icons in ${out}`);

const at = process.argv.indexOf("--sheet");
if (at > 0) {
  const s = 180, gap = 24, all = ["today", ...keys];
  const round = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${s * 0.2237}" fill="#fff"/></svg>`);
  const tiles = await Promise.all(all.map(async (k, i) => ({
    input: await sharp(k === "today" ? "public/apple-touch-icon.png" : path.join(out, `${k}-180.png`)).resize(s, s).composite([{ input: round, blend: "dest-in" }]).png().toBuffer(),
    left: gap + i * (s + gap), top: gap,
  })));
  await sharp({ create: { width: gap + all.length * (s + gap), height: s + 2 * gap, channels: 4, background: "#2a2c3a" } }).composite(tiles).png().toFile(process.argv[at + 1]);
  console.log(`sheet: ${process.argv[at + 1]}`);
}
