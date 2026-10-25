// Lab · the card designs (25 Oct 2026). Two families: Natalia's card for Venty, and her own card (her brand from
// nataliachamon.com). Each design has colourways; a colourway sets the stock and every element's finish and colour, and
// anything can then be changed in the inspector. Layouts are in mm on a 90 × 55 card.
// Her details as on her site: Natalia Chamon, Product Designer, Brisbane; natalia.chamom@gmail.com;
// linkedin.com/in/natalia-c. No phone number yet.
import { LOGO } from "@/components/art";
import type { El, Paint, Shape, Stock, Surface, Press } from "./BusinessCard";
import { HALF_STAR, NC, NCK, STAR, SWASH, TEA } from "./brand";

export const VC = { snow: "#f0f4fe", ink: "#131523", night: "#0b0c15", card: "#1b1c26", corn: "#687ef5", peri: "#8c9cf8", deep: "#4f63e0", steel: "#6e7894", black: "#0d0d0f" };
export const PALETTE = {
  venty: [VC.snow, VC.peri, VC.corn, VC.deep, VC.steel, VC.card, VC.ink, VC.night, VC.black],
  natalia: [NC.butter, NC.butterSoft, NC.cream, NC.creamSoft, NC.lines, NC.green, NC.inkWarm, NC.ink, NC.inkDeep],
};
const MARK = [LOGO[4]], WORD = LOGO.slice(0, 4);
const ME = { name: "Natalia Chamon", role: "Product designer", email: "natalia.chamom@gmail.com", web: "nataliachamon.com", li: "linkedin.com/in/natalia-c", city: "Brisbane, Australia" };

export type Family = "venty" | "natalia";
export type Way = { id: string; name: string; sw: string[] };
export type Design = { id: string; family: Family; name: string; note: string; ways: Way[]; make: (way: string) => { stock: Stock; els: El[] } };

// ─── helpers ───
const stock = (o: Partial<Stock>): Stock => ({ size: "au", paper: VC.snow, back: VC.snow, ink: VC.ink, accent: VC.corn, coating: "uncoated", texture: "smooth", thickness: 0.6, corner: 0, edge: "paper", through: 0.45, ...o });
const el = (id: string, name: string, face: "front" | "back", surface: Surface, press: Press, shapes: Shape[], more: { color?: string; paint?: Paint } = {}): El => ({ id, name, face, surface, press, shapes, ...more });
const fade = (a0: number, a1: number, from: [number, number], end: [number, number], to?: string): Paint => ({ a0, a1, from, end, to });
const alpha = (a: number): Paint => ({ a0: a, a1: a, from: [0, 0], end: [1, 0] });
const pick = <T,>(way: string, o: Record<string, T>) => o[way] ?? Object.values(o)[0];
const r = (n: number) => Math.round(n * 100) / 100;

function grid(step: number, w = 90, h = 55) {
  let d = "";
  for (let x = step; x < w; x += step) d += `M${x} 0V${h}`;
  for (let y = step; y < h; y += step) d += `M0 ${y}H${w}`;
  return d;
}
// a millimetre scale along the top edge: the card itself is a 9 cm ruler
function ruler() {
  let d = "";
  for (let i = 1; i < 90; i++) { const l = i % 10 === 0 ? 3.6 : i % 5 === 0 ? 2.4 : 1.4; d += `M${r(i - 0.07)} 0h0.14v${l}h-0.14Z`; }
  return d;
}
function speckles(seed: number, n: number) {
  let s = seed, d = "";
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < n; i++) {
    const x = rnd() * 90, y = rnd() * 55, rr = 0.12 + rnd() ** 3 * 0.5;
    if (x > 22 && x < 70 && y > 8 && y < 48) continue; // keep clear of the mark
    d += `M${r(x - rr)} ${r(y)}a${r(rr)} ${r(rr)} 0 1 0 ${r(2 * rr)} 0a${r(rr)} ${r(rr)} 0 1 0 ${r(-2 * rr)} 0Z`;
  }
  return d;
}
// a bodice front, the centre front on the fold at the left; sampled so the sewing line can sit 2 mm inside the cut line
type Pt = [number, number];
const q = (a: Pt, c: Pt, b: Pt, n = 14): Pt[] => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
const L = (a: Pt, b: Pt, n = 8): Pt[] => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; });
const BODICE: Pt[] = [...q([32, 20], [42, 19], [44, 6]), ...L([44, 6], [66, 10]), ...q([66, 10], [64, 26], [74, 30]), ...L([74, 30], [80, 62]), ...L([80, 62], [32, 64]), ...L([32, 64], [32, 20])];
function inset(pts: Pt[], d: number) {
  const n = pts.length;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
    return [p[0] + (-ty / l) * -d, p[1] + (tx / l) * -d] as Pt; // the outline runs clockwise on screen, so inside is to the right
  });
}
const poly = (pts: Pt[]) => "M" + pts.map((p) => `${r(p[0])} ${r(p[1])}`).join("L") + "Z";
const PIECE = poly(BODICE), SEW = poly(inset(BODICE, 2));
const GRAIN = "M52 42V58M50.6 44.2L52 42L53.4 44.2M50.6 55.8L52 58L53.4 55.8";
const DART = "M77.2 44L58 40.5L78 49.5";
const NOTCH = "M76.7 37.2l-2 0.8l2 0.8Z M32 30l1.6 0.9l-1.6 0.9Z";

const T = (s: string, x: number, y: number, size: number, o: Partial<Extract<Shape, { t: "text" }>> = {}): Shape => ({ t: "text", s, x, y, size, ...o });
const A = (paths: string[], x: number, y: number, w: number, o: Partial<Extract<Shape, { t: "art" }>> = {}): Shape => ({ t: "art", paths, x, y, w, ...o });

// ─── Venty ───
const wordmark: Design = {
  id: "v-word", family: "venty", name: "Wordmark",
  note: "The Venty wordmark as big as the card will hold, cropped by the trim, the way the boldest identity cards are. Details sit quietly on the back.",
  ways: [
    { id: "night", name: "Night, silver fade", sw: [VC.night, "#dfe3f0", VC.peri] },
    { id: "corn", name: "Cornflower", sw: [VC.corn, VC.ink, VC.snow] },
    { id: "blind", name: "Snow, blind", sw: [VC.snow, "#dfe4f2", VC.ink] },
    { id: "spot", name: "Black, spot gloss", sw: [VC.black, "#2a2b33", VC.peri] },
  ],
  make: (w) => {
    const s = pick(w, {
      night: stock({ paper: VC.night, back: VC.night, ink: VC.snow, coating: "soft", thickness: 0.8 }),
      corn: stock({ paper: VC.corn, back: VC.ink, ink: VC.snow, coating: "silk", edge: "accent" }),
      blind: stock({ paper: VC.snow, back: VC.snow, ink: VC.ink, texture: "cotton", thickness: 0.8, through: 0.6 }),
      spot: stock({ paper: VC.black, back: VC.black, ink: VC.snow, coating: "soft", thickness: 0.8 }),
    });
    const word = pick(w, {
      night: el("word", "Wordmark", "front", "ink", "chisel-deboss", [A(WORD, -4, -1, 118)], { color: "#dfe3f0", paint: fade(1, 0.05, [0, 0], [96, 0]) }),
      corn: el("word", "Wordmark", "front", "ink", "deboss", [A(WORD, -4, -1, 118)], { color: VC.ink }),
      blind: el("word", "Wordmark", "front", "blind", "deep-emboss", [A(WORD, -4, -1, 118)]),
      spot: el("word", "Wordmark", "front", "spot", "flat", [A(WORD, -4, -1, 118)], { paint: fade(1, 0.15, [0, 0], [96, 0]) }),
    });
    const quiet = w === "blind" ? VC.steel : w === "corn" ? VC.ink : VC.peri;
    return {
      stock: s,
      els: [
        word,
        el("line", "Line", "front", "ink", "flat", [T("AI pattern studio", 85, 6.5, 2.3, { align: "right" })], { color: quiet }),
        el("name", "Name", "back", w === "blind" ? "ink" : "ink", w === "blind" ? "letterpress" : "flat", [T(ME.name, 7, 13, 5.4, { track: -0.03 })]),
        el("role", "Role", "back", "ink", "flat", [T(`${ME.role}, Venty`, 7, 18.4, 2.5)], { color: w === "corn" ? VC.peri : quiet }),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.email}\n${ME.web}\n${ME.li}`, 7, 40.5, 2.3, { lead: 1.5 })]),
        el("mark", "Mark", "back", w === "blind" ? "blind" : w === "corn" ? "foil-cornflower" : "foil-silver", w === "blind" ? "deboss" : "flat", [A(MARK, 71, 38, 12)]),
      ],
    };
  },
};

const crown: Design = {
  id: "v-crown", family: "venty", name: "Crown glow",
  note: "Crown, the app's own gradient, printed as soft light over the paper and running off the edge. Big name on the back, split by one hairline, and painted edges.",
  ways: [
    { id: "night", name: "Night", sw: [VC.night, VC.corn, VC.peri] },
    { id: "snow", name: "Snow", sw: [VC.snow, VC.corn, VC.peri] },
    { id: "ink", name: "Ink, periwinkle", sw: [VC.ink, VC.peri, "#c3cbff"] },
    { id: "holo", name: "Night, holographic", sw: [VC.night, VC.deep, "#e1e5ec"] },
  ],
  make: (w) => {
    const dark = w !== "snow";
    const s = pick(w, {
      night: stock({ paper: VC.night, back: VC.night, ink: VC.snow, coating: "soft", thickness: 1.2, edge: "accent" }),
      snow: stock({ paper: VC.snow, back: VC.snow, ink: VC.ink, thickness: 1.2, edge: "accent" }),
      ink: stock({ paper: VC.ink, back: VC.ink, ink: VC.snow, accent: VC.peri, coating: "soft", thickness: 1.2, edge: "accent" }),
      holo: stock({ paper: VC.night, back: VC.night, ink: VC.snow, coating: "soft", thickness: 0.8, edge: "foil-silver" }),
    });
    const [g1, g2, g3] = pick(w, { night: [VC.corn, VC.peri, VC.deep], snow: [VC.corn, VC.peri, "#b9c3ff"], ink: [VC.peri, "#c3cbff", VC.corn], holo: [VC.deep, VC.corn, VC.deep] });
    return {
      stock: s,
      els: [
        el("glow", "Glow, big", "front", "ink", "flat", [{ t: "glow", x: 74, y: 60, rx: 72, ry: 34 }], { color: g1 }),
        el("glow2", "Glow, small", "front", "ink", "flat", [{ t: "glow", x: 16, y: 64, rx: 40, ry: 22 }, { t: "glow", x: 96, y: 4, rx: 26, ry: 18 }], { color: g2, paint: alpha(w === "snow" ? 0.8 : 0.9) }),
        el("word", "Wordmark", "front", pick(w, { night: "foil-white", snow: "ink", ink: "foil-silver", holo: "foil-holo" }), w === "holo" ? "chisel-emboss" : "flat", [A(WORD, 30, 20, 30)]),
        el("bglow", "Glow", "back", "ink", "flat", [{ t: "glow", x: 96, y: 60, rx: 44, ry: 24 }], { color: g3, paint: alpha(0.85) }),
        el("name", "Name", "back", "ink", "flat", [T("Natalia\nChamon", 7, 14, 6.4, { lead: 1.02, track: -0.035 })]),
        el("rule", "Hairline", "back", "ink", "flat", [{ t: "rect", x: 7, y: 30, w: 76, h: 0.16 }], { color: dark ? VC.peri : VC.corn }),
        el("role", "Role", "back", "ink", "flat", [T(`${ME.role}\nVenty, AI pattern studio`, 7, 36, 2.3, { lead: 1.45 })], { color: dark ? "#c3cbff" : VC.steel }),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.email}\n${ME.web}`, 83, 36, 2.3, { lead: 1.45, align: "right" })]),
      ],
    };
  },
};

const pattern: Design = {
  id: "v-pattern", family: "venty", name: "Pattern piece",
  note: "The card is a sewing pattern: a bodice front on graph paper, with its cut line, a dashed sewing line, grainline, dart and notches, and her name on the label. On the back, the top edge is a true millimetre ruler, 9 cm long.",
  ways: [
    { id: "paper", name: "Pattern paper", sw: [VC.snow, VC.corn, VC.ink] },
    { id: "night", name: "Night draft", sw: [VC.night, VC.peri, "#e3e7ee"] },
    { id: "blue", name: "Blueprint", sw: [VC.corn, VC.snow, VC.ink] },
    { id: "cotton", name: "Cotton, letterpress", sw: ["#f5f2ea", VC.ink, VC.corn] },
  ],
  make: (w) => {
    const s = pick(w, {
      paper: stock({ paper: "#f7f8fd", back: "#f7f8fd", ink: VC.ink }),
      night: stock({ paper: VC.night, back: VC.night, ink: VC.snow, coating: "soft", thickness: 0.8 }),
      blue: stock({ paper: VC.corn, back: VC.corn, ink: VC.snow, coating: "silk" }),
      cotton: stock({ paper: "#f5f2ea", back: "#f5f2ea", ink: VC.ink, texture: "cotton", thickness: 1.2, edge: "accent" }),
    });
    const line = pick(w, { paper: VC.corn, night: VC.peri, blue: VC.snow, cotton: VC.corn });
    const press: Press = w === "cotton" ? "letterpress" : "flat";
    return {
      stock: s,
      els: [
        el("grid", "Graph paper", "front", "ink", "flat", [{ t: "path", d: grid(5), stroke: 0.08 }], { color: line, paint: alpha(w === "night" ? 0.22 : 0.3) }),
        el("piece", "Cut line", "front", "ink", press, [{ t: "path", d: PIECE, stroke: 0.32 }]),
        el("sew", "Sewing line", "front", "ink", "flat", [{ t: "path", d: SEW, stroke: 0.18, dash: [1.1, 0.8] }, { t: "path", d: DART, stroke: 0.2 }, { t: "path", d: GRAIN, stroke: 0.2 }, { t: "path", d: NOTCH }], { color: line }),
        el("label", "Label", "front", "ink", press, [T(ME.name, 36, 30, 3.4, { track: -0.02 }), T(`${ME.role}\nBodice front, cut 1`, 36, 34.6, 2, { lead: 1.4 }), T("Place on fold", 34.6, 58, 1.7, { rot: -90 })]),
        el("word", "Wordmark", "front", w === "night" ? "foil-silver" : "ink", "flat", [A(WORD, 6, 6, 17)]),
        el("ruler", "Ruler", "back", w === "night" ? "foil-silver" : "ink", press, [{ t: "path", d: ruler() }, ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => T(String(n), n * 10, 6.4, 1.9, { font: "num", align: "center" }))]),
        el("name", "Name", "back", "ink", press, [T(ME.name, 7, 24, 5, { track: -0.03 })]),
        el("role", "Role", "back", "ink", "flat", [T(`${ME.role}, Venty`, 7, 29.4, 2.4)], { color: line }),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.email}\n${ME.web}\n${ME.li}`, 7, 41, 2.2, { lead: 1.5 })]),
        el("mark", "Mark", "back", w === "night" ? "foil-silver" : "ink", press, [A(MARK, 73, 39, 11)], { color: line }),
      ],
    };
  },
};

const bird: Design = {
  id: "v-bird", family: "venty", name: "Foil bird",
  note: "One face all foil, the bird pressed deep into it with a chisel bevel so its edges flash as the card turns. Or, on black, a blind bird and a scatter of cornflower.",
  ways: [
    { id: "silver", name: "Silver", sw: ["#e3e7ee", VC.black, VC.snow] },
    { id: "corn", name: "Cornflower foil", sw: ["#9aa8fb", VC.night, VC.snow] },
    { id: "holo", name: "Holographic", sw: ["#e1e5ec", "#f4d4ff", VC.night] },
    { id: "speck", name: "Black, speckled", sw: [VC.black, VC.peri, VC.snow] },
  ],
  make: (w) => {
    const speck = w === "speck";
    const s = stock({ paper: speck ? VC.black : VC.night, back: speck ? VC.black : w === "silver" ? VC.black : VC.night, ink: VC.snow, coating: "soft", thickness: 0.8 });
    return {
      stock: s,
      els: [
        el("field", "Foil", "front", speck ? "blind" : pick<Surface>(w, { silver: "foil-silver", corn: "foil-cornflower", holo: "foil-holo" }), "flat", [{ t: "rect", x: -1, y: -1, w: 92, h: 57 }]),
        el("bird", "Bird", "front", "blind", speck ? "deboss" : "chisel-deboss", [A(MARK, 22, 7, 76)]),
        el("speck", "Speckles", "front", speck ? "ink" : "blind", "flat", [{ t: "path", d: speckles(7, 70) }], { color: VC.peri }),
        el("word", "Wordmark", "back", "ink", "flat", [A(WORD, 7, 7, 16)]),
        el("name", "Name", "back", "ink", "flat", [T(`${ME.name}\n${ME.role}`, 31, 24, 2.6, { lead: 1.3 })], { color: speck ? VC.peri : undefined }),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.email}\n${ME.web}\n${ME.li}`, 31, 34, 2.3, { lead: 1.4 }), T(ME.city, 31, 48, 2.3)], { color: "#c3cbff" }),
      ],
    };
  },
};

// ─── Natalia ───
const swash: Design = {
  id: "n-swash", family: "natalia", name: "Big nck",
  note: "Her nck logo filling the card and cut off by the trim, so only its curves read. The back is calm: her name with the site's habit of setting proper nouns in serif italic.",
  ways: [
    { id: "green", name: "Green, butter foil", sw: [NC.green, NC.butter, NC.cream] },
    { id: "cream", name: "Cream, letterpress", sw: [NC.cream, NC.green, NC.butter] },
    { id: "butter", name: "Butter", sw: [NC.butterSoft, NC.green, NC.cream] },
    { id: "ink", name: "Ink, copper", sw: [NC.inkDeep, "#eaa37e", NC.cream] },
  ],
  make: (w) => {
    const s = pick(w, {
      green: stock({ paper: NC.green, back: NC.cream, ink: NC.green, thickness: 0.8 }),
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, texture: "cotton", thickness: 1.2, edge: "accent", accent: NC.green }),
      butter: stock({ paper: NC.butterSoft, back: NC.green, ink: NC.cream, texture: "cotton", thickness: 0.8 }),
      ink: stock({ paper: NC.inkDeep, back: NC.inkDeep, ink: NC.cream, coating: "soft", thickness: 0.8, edge: "foil-gold" }),
    });
    return {
      stock: s,
      els: [
        el("nck", "nck", "front", pick<Surface>(w, { green: "foil-butter", cream: "ink", butter: "ink", ink: "foil-copper" }), pick<Press>(w, { green: "flat", cream: "letterpress", butter: "deboss", ink: "flat" }), [A(NCK, -12, -9, 128, { evenodd: true })], { color: NC.green }),
        el("swash", "Swash", "back", w === "butter" ? "foil-butter" : w === "ink" ? "foil-copper" : "ink", "flat", [A(SWASH, 7, 7, 8.5)]),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 7, 29, 6.4, { font: "serif" }), T("Chamon", 7, 35.6, 6.4, { font: "satoshi", weight: 500, track: -0.02 })]),
        el("role", "Role", "back", "ink", "flat", [T(ME.role, 7, 42, 2.5, { font: "satoshi", weight: 500 })], { color: w === "butter" ? NC.butter : undefined }),
        el("place", "Brisbane", "back", "ink", "flat", [T("Brisbane", 83, 11, 2.8, { font: "serif", align: "right" }), T("UTC+10 (AEST)", 83, 15, 1.8, { font: "mono", align: "right" })]),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.email}\n${ME.web}\n${ME.li}`, 83, 41, 1.95, { font: "mono", align: "right", lead: 1.5 })]),
      ],
    };
  },
};

// the site's hero grid. Front, as on a computer: one hairline down at 33% of the width and one across at 26% of the
// height, the star where they cross, 4.2% of the width (here 4.4 mm). Back, as on a phone: one line across, a line
// down to it from the top at 73% and one down from it at 16%, each meeting it at a half star.
const gridCard: Design = {
  id: "n-grid", family: "natalia", name: "Hero grid",
  note: "The grid from the top of her site, to its measurements: on the front the computer version (lines at 33% and 26%, the star where they cross), on the back the phone version with its two half stars. Coordinates and time zone in mono.",
  ways: [
    { id: "green", name: "Green", sw: [NC.green, NC.creamLight, NC.butter] },
    { id: "cream", name: "Cream", sw: [NC.cream, NC.green, NC.lines] },
    { id: "ink", name: "Ink, grey lines", sw: [NC.inkDeep, NC.lines, NC.butter] },
  ],
  make: (w) => {
    const s = pick(w, {
      green: stock({ paper: NC.green, back: NC.green, ink: NC.creamLight, coating: "soft" }),
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, texture: "cotton" }),
      ink: stock({ paper: NC.inkDeep, back: NC.inkDeep, ink: NC.cream, coating: "soft" }),
    });
    const vx = 0.33 * 90, hy = 0.26 * 55, st = 4.4, bh = 16.5, up = 0.73 * 90, dn = 0.16 * 90;
    const lineColor = w === "ink" ? NC.lines : undefined, la = w === "ink" ? 1 : w === "green" ? 0.5 : 0.35;
    const star: Surface = w === "cream" ? "ink" : "foil-butter", sp: Press = w === "cream" ? "letterpress" : "flat";
    return {
      stock: s,
      els: [
        el("lines", "Lines", "front", "ink", "flat", [{ t: "path", d: `M${r(vx)} 0V55M0 ${r(hy)}H90`, stroke: 0.12 }], { color: lineColor, paint: alpha(la) }),
        el("star", "Star", "front", star, sp, [A(STAR, vx - st / 2, hy - st / 2, st)]),
        el("time", "Time", "front", "ink", "flat", [T("UTC+10\n(AEST)", 4, 6, 1.75, { font: "mono", lead: 1.45 })], { paint: alpha(0.7) }),
        el("where", "Where", "front", "ink", "flat", [T(`${ME.city}\n27.47° S, 153.03° E`, 86, 6, 1.75, { font: "mono", align: "right", lead: 1.45 })], { paint: alpha(0.7) }),
        el("nck", "nck", "front", w === "cream" ? "ink" : "foil-butter", w === "cream" ? "deboss" : "flat", [A(NCK, 36, 21, 49, { evenodd: true })]),
        el("tag", "Product designer", "front", "ink", "flat", [T("Product\ndesigner", 4, 44, 3.4, { font: "serif", lead: 1.12 })]),
        el("blines", "Lines", "back", "ink", "flat", [{ t: "path", d: `M${r(up)} 0V${bh}M0 ${bh}H90M${r(dn)} ${bh}V55`, stroke: 0.12 }], { color: lineColor, paint: alpha(la) }),
        el("bstars", "Half stars", "back", star, sp, [A(HALF_STAR, up - st / 2, bh - st / 2, st), A(HALF_STAR, dn + st / 2, bh + st / 2, st, { rot: 180 })]),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 4, 8.2, 4.4, { font: "serif" }), T("Chamon", 4, 13.4, 4.4, { font: "satoshi", weight: 500, track: -0.02 })]),
        el("role", "Role", "back", "ink", "flat", [T("Product, UI/UX\nand front-end", 69.5, 7.2, 2, { font: "satoshi", weight: 500, lead: 1.35 })]),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.email}\n${ME.web}\n${ME.li}`, 18.6, 26, 1.85, { font: "mono", lead: 1.6 })]),
        el("tea", "Made with tea", "back", "ink", "flat", [T("Made with tea and care.", 86, 50.5, 2.5, { font: "serif", align: "right" }), A(TEA, 79.5, 37, 6.2)]),
      ],
    };
  },
};

// the centred cross from the site's hero, to its proportions: on a 942-wide hero the lines are 4.06 thick and the star
// 215 wide, so on the card 0.39 mm and 20.5 mm
const crossing: Design = {
  id: "n-cross", family: "natalia", name: "Crossing",
  note: "Her hero cross at its true proportions, centred and full bleed: two lines and the big star where they meet, pressed up as a chisel emboss in foil. Nothing else on the front.",
  ways: [
    { id: "green", name: "Green, butter star", sw: [NC.green, NC.creamLight, NC.butter] },
    { id: "ink", name: "Ink, gold", sw: [NC.inkDeep, NC.creamLight, "#f1cd84"] },
    { id: "cream", name: "Cream, blind", sw: [NC.cream, NC.green, NC.creamSoft] },
  ],
  make: (w) => {
    const s = pick(w, {
      green: stock({ paper: NC.green, back: NC.cream, ink: NC.creamLight, coating: "soft", thickness: 0.8 }),
      ink: stock({ paper: NC.inkDeep, back: NC.inkDeep, ink: NC.creamLight, coating: "soft", thickness: 0.8, edge: "foil-gold" }),
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, texture: "cotton", thickness: 1.2, through: 0.6 }),
    });
    const k = 90 / 942, cx = (473.03 / 942) * 90, cy = (570.48 / 1141) * 55, st = 215.2 * k; // the hero is tall, the card wide: the centre goes by proportion
    const backInk = w === "green" ? NC.green : undefined;
    return {
      stock: s,
      els: [
        el("lines", "Lines", "front", w === "cream" ? "blind" : "ink", w === "cream" ? "deboss" : "flat", [{ t: "path", d: `M${r(cx)} 0V55M0 ${r(cy)}H90`, stroke: r(4.06 * k) }]),
        el("star", "Star", "front", pick<Surface>(w, { green: "foil-butter", ink: "foil-gold", cream: "blind" }), "chisel-emboss", [A(STAR, cx - st / 2, cy - st / 2, st)]),
        el("nck", "nck", "back", w === "ink" ? "foil-gold" : "ink", "flat", [A(NCK, 6, 6, 22, { evenodd: true })], { color: backInk }),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 6, 33, 5, { font: "serif" }), T("Chamon", 6, 39, 5, { font: "satoshi", weight: 500, track: -0.02 })], { color: backInk }),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.role}, ${ME.city}\n${ME.email}\n${ME.web}`, 6, 45.5, 1.9, { font: "mono", lead: 1.55 })], { color: backInk }),
        el("tea", "Tea", "back", w === "ink" ? "foil-gold" : "foil-butter", "flat", [A(TEA, 74, 33, 10)]),
      ],
    };
  },
};

const blind: Design = {
  id: "n-blind", family: "natalia", name: "Blind nck",
  note: "No ink on the front at all: the nck logo pressed up out of a soft cotton card, and its shadow showing through on the back, mirrored, under her details.",
  ways: [
    { id: "cream", name: "Cream", sw: [NC.cream, NC.green, NC.creamSoft] },
    { id: "stone", name: "Stone", sw: [NC.creamSoft, NC.ink, NC.cream] },
    { id: "green", name: "Green", sw: [NC.green, NC.cream, NC.butter] },
    { id: "butter", name: "Butter", sw: [NC.butterSoft, NC.inkWarm, NC.cream] },
  ],
  make: (w) => {
    const s = pick(w, {
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, texture: "cotton", thickness: 1.2, through: 0.7 }),
      stone: stock({ paper: NC.creamSoft, back: NC.creamSoft, ink: NC.ink, texture: "felt", thickness: 1.2, through: 0.7 }),
      green: stock({ paper: NC.green, back: NC.green, ink: NC.cream, texture: "cotton", thickness: 1.2, through: 0.7 }),
      butter: stock({ paper: NC.butterSoft, back: NC.butterSoft, ink: NC.inkWarm, texture: "cotton", thickness: 1.2, through: 0.7 }),
    });
    return {
      stock: s,
      els: [
        el("nck", "nck", "front", "blind", "deep-emboss", [A(NCK, 9, 21, 74, { evenodd: true })]),
        el("who", "Who", "back", "ink", "flat", [T(`${ME.name}\n${ME.role}\n${ME.city}`, 7, 10, 2.6, { font: "satoshi", weight: 500, lead: 1.3 })]),
        el("what", "What", "back", "ink", "flat", [T("Product, UI/UX\nand front-end", 83, 10, 2.6, { font: "satoshi", weight: 500, lead: 1.3, align: "right" })]),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.email}\n${ME.web}\n${ME.li}`, 7, 24, 2.6, { font: "satoshi", weight: 500, lead: 1.3 })]),
      ],
    };
  },
};

const tea: Design = {
  id: "n-tea", family: "natalia", name: "Tea and care",
  note: "Editorial: her first name in serif italic at full card height, running off the edge, small mono notes at the top. The back carries the line from her site, made with tea and care.",
  ways: [
    { id: "cream", name: "Cream and green", sw: [NC.cream, NC.green, NC.butter] },
    { id: "butter", name: "Butter and ink", sw: [NC.butterSoft, NC.inkWarm, NC.inkDeep] },
    { id: "green", name: "Green, butter foil", sw: [NC.green, NC.butter, NC.cream] },
  ],
  make: (w) => {
    const s = pick(w, {
      cream: stock({ paper: NC.cream, back: NC.green, ink: NC.green, texture: "cotton", thickness: 0.8 }),
      butter: stock({ paper: NC.butterSoft, back: NC.inkDeep, ink: NC.inkWarm, texture: "cotton", thickness: 0.8 }),
      green: stock({ paper: NC.green, back: NC.cream, ink: NC.cream, coating: "soft", thickness: 0.8 }),
    });
    const backInk = w === "green" ? NC.green : NC.cream;
    return {
      stock: s,
      els: [
        el("big", "Natalia", "front", w === "green" ? "foil-butter" : "ink", w === "cream" ? "letterpress" : "flat", [T("Natalia", 3, 47, 31, { font: "serif", track: -0.02 })]),
        el("notes", "Notes", "front", "ink", "flat", [T(`Product, UI/UX and front-end\n${ME.city}`, 5, 7.5, 1.85, { font: "mono", lead: 1.45 })]),
        el("swash", "Swash", "front", "ink", "flat", [A(SWASH, 77, 4.5, 8)]),
        el("tea", "Made with tea", "back", "ink", "flat", [T("Made with tea\nand care.", 6, 13, 4.6, { font: "serif", lead: 1.1 })], { color: backInk }),
        el("teacup", "Tea", "back", w === "green" ? "ink" : "foil-butter", "flat", [A(TEA, 72, 30, 12)], { color: backInk }),
        el("contact", "Contact", "back", "ink", "flat", [T(`${ME.name}\n${ME.email}\n${ME.web}`, 6, 41, 1.9, { font: "mono", lead: 1.55 })], { color: backInk }),
      ],
    };
  },
};

export const DESIGNS: Design[] = [wordmark, crown, pattern, bird, swash, gridCard, crossing, blind, tea];
