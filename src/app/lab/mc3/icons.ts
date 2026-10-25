// Home-screen icons for the app (lab, MC 3). Each one is a full-bleed square SVG (iOS and Android round the corners
// themselves), drawn in 1024 units with the bird mark (LOGO[4] in art.tsx) and the app's own colours. The lab shows these
// strings as images; tools/lab-mc3-icons.mjs turns the same strings into the PNGs in public/lab/mc3/icons, so what you
// see in the lab is what lands on the phone. Plain TypeScript with no imports, so Node can load it as it is.

export type IconKey = "today" | "crown" | "night" | "primary" | "snow" | "paper" | "ink" | "dial" | "closeup";

export const ICONS: { k: IconKey; name: string; note: string }[] = [
  { k: "today", name: "Today", note: "The icon on the home screen now: the bird in white on a navy gradient with a fine grid." },
  { k: "crown", name: "Crown", note: "The app's one gradient, as on Welcome and the splash, with the bird in snow. Opening the app feels continuous." },
  { k: "night", name: "Night", note: "The landing page's loading-screen night: flat night with the cornflower lights low down, the bird in snow." },
  { k: "primary", name: "Primary", note: "The primary button's periwinkle, lit from the top, the bird in snow. The brightest on a dark home screen." },
  { k: "snow", name: "Snow", note: "Snow like the tab bar and the light tops, the bird in primary. Stands out on a dark or photo wallpaper, fades on a light one." },
  { k: "paper", name: "Pattern piece", note: "The bird cut as a pattern piece on pattern paper: primary, with a dashed seam allowance and a snow grainline." },
  { k: "ink", name: "Ink", note: "The app's ink, lit from the top like the dark secondary buttons, the bird in periwinkle. Quiet, for a dark home screen." },
  { k: "dial", name: "Tape", note: "The measuring dial: the dark card, the ruler's ticks standing on the bottom edge, the bird in snow above it." },
  { k: "closeup", name: "Close-up", note: "Crown with the bird drawn very large and cropped by the edges, its head leaving at the top right." },
];

// the bird's box inside LOGO[4]'s own units (measured: x 207 to 1543, y 0 to 797)
const BX = 207, BY = 0, BW = 1336, BH = 797;

// the bird scaled to `w` icon units wide, its box centred on (cx, cy)
function place(w: number, cx: number, cy: number) {
  const s = w / BW;
  return { s, t: `translate(${cx - (BX + BW / 2) * s} ${cy - (BY + BH / 2) * s}) scale(${s})` };
}

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${body}</svg>`;

// a soft round light (like the blurred drift lights): a circle whose colour fades out to its edge
const light = (id: string, cx: number, cy: number, r: number, color: string, a: number) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color}" stop-opacity="${a}"/><stop offset=".55" stop-color="${color}" stop-opacity="${a * 0.55}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

// Crown's static layers (.sky.sky-light in globals.css) plus its glow from the top and its four lights at rest
const CROWN_DEFS =
  `<linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7988b8"/><stop offset=".3" stop-color="#5a6c99"/><stop offset=".55" stop-color="#353f62"/><stop offset=".78" stop-color="#1b2035"/><stop offset="1" stop-color="#131523"/></linearGradient>` +
  `<radialGradient id="ct" cx="512" cy="-102" r="717" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 -102) scale(1 .786) translate(0 102)"><stop offset="0" stop-color="#b4bdd9"/><stop offset=".35" stop-color="#8f9cc5"/><stop offset=".7" stop-color="#8f9cc5" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="cu" cx="512" cy="1178" r="922" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 1178) scale(1 .556) translate(0 -1178)"><stop offset="0" stop-color="#687ef5" stop-opacity=".75"/><stop offset=".4" stop-color="#4f63e0" stop-opacity=".35"/><stop offset=".7" stop-color="#4f63e0" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="cg" cx="512" cy="41" r="348" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 41) scale(1 .765) translate(0 -41)"><stop offset="0" stop-color="#f6f7ff" stop-opacity=".7"/><stop offset=".36" stop-color="#eceffc" stop-opacity=".3"/><stop offset="1" stop-color="#eceffc" stop-opacity="0"/></radialGradient>` +
  light("c1", 512, 20, 360, "#f0f2ff", 0.4) + light("c2", 930, 1000, 400, "#687ef5", 0.5) +
  light("c3", 94, 1000, 400, "#4f63e0", 0.45) + light("c4", 512, 1130, 330, "#8c9cf8", 0.4);
const CROWN =
  `<rect width="1024" height="1024" fill="url(#cb)"/><rect width="1024" height="1024" fill="url(#ct)"/><rect width="1024" height="1024" fill="url(#cu)"/>` +
  `<rect width="1024" height="1024" fill="url(#c1)"/><rect width="1024" height="1024" fill="url(#c2)"/><rect width="1024" height="1024" fill="url(#c3)"/><rect width="1024" height="1024" fill="url(#c4)"/>` +
  `<rect width="1024" height="1024" fill="url(#cg)"/>`;

// lit from the top, as the app's buttons are: a faint white wash down the face
const wash = (a: number) =>
  `<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${a}"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

export function iconSvg(k: Exclude<IconKey, "today">, bird: string): string {
  const mid = place(680, 512, 524);
  const mark = (fill: string, p = mid) => `<path d="${bird}" fill="${fill}" transform="${p.t}"/>`;
  switch (k) {
    case "crown":
      return wrap(`<defs>${CROWN_DEFS}</defs>${CROWN}${mark("#f0f4fe")}`);
    case "closeup": {
      const big = place(1300, 560, 560);
      return wrap(`<defs>${CROWN_DEFS}</defs>${CROWN}${mark("#f0f4fe", big)}`);
    }
    case "night":
      return wrap(
        `<defs>${light("n1", 512, 1000, 560, "#687ef5", 0.42)}${light("n2", 512, 1060, 440, "#4f63e0", 0.4)}${light("n3", 512, 1080, 300, "#8c9cf8", 0.22)}</defs>` +
        `<rect width="1024" height="1024" fill="#0b0c15"/><rect width="1024" height="1024" fill="url(#n1)"/><rect width="1024" height="1024" fill="url(#n2)"/><rect width="1024" height="1024" fill="url(#n3)"/>${mark("#f0f4fe")}`,
      );
    case "primary":
      return wrap(
        `<defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7387f6"/><stop offset=".55" stop-color="#687ef5"/><stop offset="1" stop-color="#6479f2"/></linearGradient>${wash(0.16)}</defs>` +
        `<rect width="1024" height="1024" fill="url(#p)"/><rect width="1024" height="1024" fill="url(#w)"/>${mark("#f0f4fe")}`,
      );
    case "snow":
      return wrap(`<defs>${wash(0.7)}</defs><rect width="1024" height="1024" fill="#f0f4fe"/><rect width="1024" height="1024" fill="url(#w)"/>${mark("#687ef5")}`);
    case "ink":
      return wrap(`<defs>${wash(0.07)}</defs><rect width="1024" height="1024" fill="#131523"/><rect width="1024" height="1024" fill="url(#w)"/>${mark("#8c9cf8")}`);
    case "dial": {
      // the ruler: a long tick every 128 units, short ones every 32, standing on the bottom edge, fading at the sides
      let ticks = "";
      for (let x = 0; x <= 1024; x += 32) {
        const long = x % 128 === 0;
        ticks += `<rect x="${x - (long ? 5 : 3)}" y="${1024 - (long ? 150 : 84)}" width="${long ? 10 : 6}" height="${long ? 150 : 84}" fill="#fff" fill-opacity="${long ? 0.75 : 0.4}"/>`;
      }
      const up = place(640, 512, 440);
      return wrap(
        `<defs>${wash(0.06)}<linearGradient id="f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff"/><stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="m"><rect width="1024" height="1024" fill="url(#f)"/></mask></defs>` +
        `<rect width="1024" height="1024" fill="#1b1c26"/><rect width="1024" height="1024" fill="url(#w)"/><g mask="url(#m)">${ticks}</g>${mark("#f0f4fe", up)}`,
      );
    }
    case "paper": {
      // pattern paper (.pattern-mat): a periwinkle grid, a strong line every 256 units and a faint one every 64
      let grid = "";
      for (let v = 0; v <= 1024; v += 64) {
        const major = v % 256 === 0;
        const a = major ? 0.2 : 0.09, sw = major ? 5 : 3;
        grid += `<line x1="${v}" y1="0" x2="${v}" y2="1024" stroke="#687ef5" stroke-opacity="${a}" stroke-width="${sw}"/><line x1="0" y1="${v}" x2="1024" y2="${v}" stroke="#687ef5" stroke-opacity="${a}" stroke-width="${sw}"/>`;
      }
      const p = place(600, 512, 526);
      // the seam allowance: a line 30 units outside the bird, dashed, cut from a wide dashed stroke minus a narrower solid one
      const off = 30 / p.s, lw = 9 / p.s, g = 12 / p.s;
      return wrap(
        `<defs><mask id="sa" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect width="1024" height="1024" fill="#000"/>` +
        `<path d="${bird}" transform="${p.t}" fill="none" stroke="#fff" stroke-width="${2 * off + lw}" stroke-linejoin="round" stroke-dasharray="${30 / p.s} ${22 / p.s}"/>` +
        `<path d="${bird}" transform="${p.t}" fill="#000" stroke="#000" stroke-width="${2 * off - lw}" stroke-linejoin="round"/></mask></defs>` +
        `<rect width="1024" height="1024" fill="#f6f7fd"/>${grid}<rect width="1024" height="1024" fill="#687ef5" mask="url(#sa)"/>${mark("#687ef5", p)}` +
        // the grainline: a snow line down the wing (in the bird's own units) with an arrowhead at each end
        `<g transform="${p.t}" stroke="#f0f4fe" stroke-width="${g}" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M525 250 V630"/><path d="M470 305 L525 250 L580 305"/><path d="M470 575 L525 630 L580 575"/></g>`,
      );
    }
  }
}
