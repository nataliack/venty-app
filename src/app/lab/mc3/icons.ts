// Home-screen icons for the app (lab, MC 3). Each one is a full-bleed square SVG (iOS and Android round the corners
// themselves), drawn in 1024 units with the bird mark (LOGO[4] in art.tsx) and the app's own colours. The lab shows them
// as images; tools/lab-mc3-icons.mjs turns these same strings into the PNGs in public/lab/mc3/icons, so what you see in
// the lab is what lands on the phone. Plain TypeScript with no imports, so Node can load it as it is.
// One rule: the bird is the same size and in the same place on every icon, today's (measured from public/icon-512.png).

export type IconKey = "today" | "night" | "primary" | "snow" | "pattern" | "pressed" | "raised" | "denim";

export const ICONS: { k: IconKey; name: string; note: string }[] = [
  { k: "today", name: "Today", note: "The icon on the home screen now: the bird in white on Crown's navy." },
  { k: "night", name: "Night", note: "The landing page's loading-screen night, lifted very faintly with cornflower from below, the bird in snow." },
  { k: "primary", name: "Primary", note: "The landing page's favicon gradient (Haze): periwinkle washing in from the top left over cornflower." },
  { k: "snow", name: "Snow", note: "Snow like the tab bar and the light tops, the bird in primary." },
  { k: "pattern", name: "Pattern", note: "Pattern paper with its periwinkle grid, the bird in steel, lit from the top." },
  { k: "pressed", name: "Pressed", note: "The bird pressed into snow, like the app's inset tiles: a shade inside its top edge, a lip of light at its foot." },
  { k: "raised", name: "Raised", note: "The bird raised off the night like the app's knobs: lit along its top, a soft shadow under it." },
  { k: "denim", name: "Denim", note: "The app's denim, lit from the top, the bird in snow." },
];

// the bird's box inside LOGO[4]'s own units (measured: x 207 to 1543, y 0 to 797)
const BX = 207, BY = 0, BW = 1336, BH = 797;
// where today's icon has it, in 1024 units: 738 wide, its box centred on (510, 503)
const SIZE = 738, CX = 510, CY = 503;
const S = SIZE / BW;
const T = `translate(${CX - (BX + BW / 2) * S} ${CY - (BY + BH / 2) * S}) scale(${S})`;

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${body}</svg>`;
const rect = (fill: string) => `<rect width="1024" height="1024" fill="${fill}"/>`;

// a soft round light: a circle whose colour eases out to nothing at its edge (stops eased, so there is no hard rim)
const light = (id: string, cx: number, cy: number, r: number, color: string, a: number, sy = 1) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"${sy !== 1 ? ` gradientTransform="translate(0 ${cy}) scale(1 ${sy}) translate(0 ${-cy})"` : ""}>` +
  `<stop offset="0" stop-color="${color}" stop-opacity="${a}"/><stop offset=".25" stop-color="${color}" stop-opacity="${a * 0.82}"/>` +
  `<stop offset=".5" stop-color="${color}" stop-opacity="${a * 0.45}"/><stop offset=".75" stop-color="${color}" stop-opacity="${a * 0.14}"/>` +
  `<stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

// a light that fades on a bell curve (no edge anywhere), as wide as r and sy times as tall; `soft`: how fast it fades
// (lower is softer and reaches further)
const bell = (id: string, cx: number, cy: number, r: number, sy: number, color: string, a: number, soft = 2.2) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 ${cy}) scale(1 ${sy}) translate(0 ${-cy})">` +
  Array.from({ length: 11 }, (_, i) => `<stop offset="${i / 10}" stop-color="${color}" stop-opacity="${+(a * Math.exp(-(((i / 10) * soft) ** 2))).toFixed(4)}"/>`).join("") +
  `</radialGradient>`;

// ─── Night, from its settings, so it can be tuned in the lab (NightTuner) and baked from the very same numbers ───
// the background runs from `top` to `bottom`; each light has a colour, a centre (x, y in 1024 units: y past 1024 is below
// the icon), a width, a height (against its width), a strength and a softness; `grain` nudges each pixel of the PNGs by up
// to that many levels so the fade never bands
export type NightLight = { color: string; x: number; y: number; w: number; h: number; a: number; soft: number };
export type Night = { top: string; bottom: string; lights: NightLight[]; grain: number };
export const NIGHT: Night = {
  top: "#0b0c15", bottom: "#0b0c15", grain: 1.5,
  lights: [
    { color: "#687ef5", x: 512, y: 1500, w: 1200, h: 0.75, a: 0.3, soft: 2.2 },
    { color: "#4f63e0", x: 512, y: 1400, w: 800, h: 0.75, a: 0, soft: 2.2 },
  ],
};
// `preview`: draws the grain too (a fine noise), for the lab; the PNGs get real grain from tools/lab-mc3-icons.mjs
export function nightSvg(n: Night, bird: string, preview = false): string {
  const lights = n.lights.filter((l) => l.a > 0);
  const grain = preview && n.grain > 0
    ? `<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`
    : "";
  return wrap(
    `<defs><linearGradient id="nb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${n.top}"/><stop offset="1" stop-color="${n.bottom}"/></linearGradient>` +
    lights.map((l, i) => bell(`n${i}`, l.x, l.y, l.w, l.h, l.color, l.a, l.soft)).join("") + grain + `</defs>` +
    rect("url(#nb)") + lights.map((_, i) => rect(`url(#n${i})`)).join("") +
    (grain ? `<rect width="1024" height="1024" filter="url(#gr)" opacity="${Math.min(0.12, n.grain * 0.025)}" style="mix-blend-mode:overlay"/>` : "") +
    `<path d="${bird}" fill="#f0f4fe" transform="${T}"/>`,
  );
}

// lit from the top, as the app's buttons are: a white wash fading down the face
const wash = (a: number, to = 0.6) =>
  `<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${a}"/><stop offset="${to}" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

// a shadow inside the bird (an inner shadow: the bird's outside, blurred and shifted, kept inside its shape)
const inner = (id: string, dy: number, blur: number, color: string, a: number) =>
  `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feComponentTransfer in="SourceAlpha"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>` +
  `<feGaussianBlur stdDeviation="${blur}"/><feOffset dy="${dy}" result="o"/><feFlood flood-color="${color}" flood-opacity="${a}"/><feComposite in2="o" operator="in"/>` +
  `<feComposite in2="SourceAlpha" operator="in"/></filter>`;

export function iconSvg(k: Exclude<IconKey, "today">, bird: string): string {
  const mark = (fill: string, extra = "") => `<path d="${bird}" fill="${fill}" transform="${T}"${extra}/>`;
  switch (k) {
    case "night":
      // the night, from its settings (NIGHT, tuned in the lab)
      return nightSvg(NIGHT, bird);
    case "primary":
      // Haze, the landing page's favicon (its purple sky, rendered with its lights spread wide): matched to the favicon's
      // colours, sampled at nine points. A diagonal from light periwinkle to cornflower, the pale light in the top left, and a
      // broad soft light down the left side and one on the right
      return wrap(
        `<defs><linearGradient id="hb" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#b3c0f8"/><stop offset=".45" stop-color="#8c9ff8"/><stop offset="1" stop-color="#687ce9"/></linearGradient>` +
        light("h1", 60, 60, 520, "rgb(239,244,255)", 0.55) + light("h2", 120, 640, 560, "rgb(176,192,250)", 0.62) + light("h3", 420, 1000, 460, "rgb(150,168,250)", 0.32) +
        light("h4", 900, 560, 420, "rgb(176,192,250)", 0.55) +
        `</defs>` + rect("url(#hb)") + rect("url(#h2)") + rect("url(#h3)") + rect("url(#h4)") + rect("url(#h1)") + mark("#f0f4fe"),
      );
    case "snow":
      return wrap(`<defs>${wash(0.7)}</defs>${rect("#f0f4fe")}${rect("url(#w)")}${mark("#687ef5")}`);
    case "pattern": {
      // pattern paper (.pattern-mat): a periwinkle grid, a strong line every 256 units and a faint one every 64; the bird in
      // steel, lit from the top like brushed metal
      let grid = "";
      for (let v = 0; v <= 1024; v += 64) {
        const major = v % 256 === 0, a = major ? 0.2 : 0.09, sw = major ? 5 : 3;
        grid += `<line x1="${v}" y1="0" x2="${v}" y2="1024" stroke="#687ef5" stroke-opacity="${a}" stroke-width="${sw}"/><line x1="0" y1="${v}" x2="1024" y2="${v}" stroke="#687ef5" stroke-opacity="${a}" stroke-width="${sw}"/>`;
      }
      return wrap(
        `<defs><linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d7299"/><stop offset=".55" stop-color="#485f88"/><stop offset="1" stop-color="#3c4b63"/></linearGradient></defs>` +
        rect("#f6f7fd") + grid + mark("url(#st)"),
      );
    }
    case "pressed":
      // the bird pressed into snow: its floor a touch deeper, a shade inside its top edge, a lip of light along its foot
      return wrap(
        // (its floor: snow with 9% of the ink)
        `<defs>${wash(0.7)}${inner("ps", 16, 9, "#131523", 0.42)}${inner("pl", -6, 3, "#ffffff", 0.95)}</defs>` +
        rect("#f0f4fe") + rect("url(#w)") + mark("#dce0ea") + mark("#dce0ea", ` filter="url(#ps)"`) + mark("#dce0ea", ` filter="url(#pl)"`),
      );
    case "raised":
      // the bird raised off the night like the app's knobs: a soft shadow under it, lit along its top, deeper at its foot
      return wrap(
        `<defs><filter id="ds" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="14"/><feOffset dy="18"/><feComponentTransfer><feFuncA type="linear" slope=".6"/></feComponentTransfer></filter>` +
        `${inner("rt", 8, 4, "#ffffff", 0.9)}${inner("rb", -10, 8, "#4f63e0", 0.35)}` +
        `<linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f4fe"/><stop offset="1" stop-color="#c1c8d9"/></linearGradient>${light("rg", 512, 1060, 700, "#687ef5", 0.22, 0.8)}</defs>` +
        rect("#0b0c15") + rect("url(#rg)") + mark("#000", ` filter="url(#ds)"`) + mark("url(#rf)") + mark("#fff", ` filter="url(#rt)"`) + mark("#fff", ` filter="url(#rb)"`),
      );
    case "denim":
      return wrap(
        `<defs>${wash(0.16)}<linearGradient id="dn" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#131523" stop-opacity="0"/><stop offset="1" stop-color="#131523" stop-opacity=".22"/></linearGradient></defs>` +
        rect("#4d5e85") + rect("url(#w)") + rect("url(#dn)") + mark("#f0f4fe"),
      );
  }
}
