// Lab · the card designs (25 Oct 2026, refined the same day from Jose's notes). Two families: Natalia's card for Venty,
// and her own card (her brand from nataliachamon.com). Each design has colourways; a colourway sets the stock and every
// element's finish and colour, and anything can then be changed in the inspector. Layouts are in mm on a 90 × 55 card.
// Rules from Jose: no links on any card (no website, no LinkedIn); email and phone, with small icons; nothing cut off
// by the trim unless it is meant to be; no gold on her cards (her butter is a satin pigment foil, never metal); nothing
// pressed on one face shows through on the other.
import { LOGO } from "@/components/art";
import type { El, Paint, Shape, Stock, Surface, Press } from "./BusinessCard";
import { HALF_STAR, NC, NCK, STAR, SWASH, TEA } from "./brand";

export const VC = { snow: "#f0f4fe", ink: "#131523", night: "#0b0c15", card: "#1b1c26", corn: "#687ef5", peri: "#8c9cf8", deep: "#4f63e0", steel: "#6e7894", black: "#0d0d0f" };
export const PALETTE = {
  venty: [VC.snow, VC.peri, VC.corn, VC.deep, VC.steel, VC.card, VC.ink, VC.night, VC.black],
  natalia: [NC.butter, NC.butterSoft, NC.creamLight, NC.cream, NC.creamSoft, NC.lines, NC.green, NC.inkWarm, NC.ink, NC.inkDeep],
};
// the wordmark is 1.9 times as wide as it is tall, the bird 1.67
const MARK = [LOGO[4]], WORD = LOGO.slice(0, 4);
const ME = { name: "Natalia Chamon", role: "Product designer", email: "natalia.chamom@gmail.com", phone: "0420 991 942", city: "Brisbane, Australia", web: "nataliachamon.com" };

export type Family = "venty" | "natalia";
export type Way = { id: string; name: string; sw: string[] };
export type Design = { id: string; family: Family; name: string; note: string; ways: Way[]; make: (way: string) => { stock: Stock; els: El[] } };

// ─── helpers ───
const stock = (o: Partial<Stock>): Stock => ({ size: "au", paper: VC.snow, back: VC.snow, ink: VC.ink, accent: VC.corn, coating: "uncoated", texture: "smooth", thickness: 0.6, corner: 0, edge: "paper", through: 0, ...o });
const el = (id: string, name: string, face: "front" | "back", surface: Surface, press: Press, shapes: Shape[], more: { color?: string; paint?: Paint } = {}): El => ({ id, name, face, surface, press, shapes, ...more });
const alpha = (a: number): Paint => ({ a0: a, a1: a, from: [0, 0], end: [1, 0] });
const pick = <T,>(way: string, o: Record<string, T>) => o[way] ?? Object.values(o)[0];
const r = (n: number) => Math.round(n * 100) / 100;
const T = (s: string, x: number, y: number, size: number, o: Partial<Extract<Shape, { t: "text" }>> = {}): Shape => ({ t: "text", s, x, y, size, ...o });
const A = (paths: string[], x: number, y: number, w: number, o: Partial<Extract<Shape, { t: "art" }>> = {}): Shape => ({ t: "art", paths, x, y, w, ...o });

// line icons on a 24 grid
const ICON = {
  mail: "M3.5 6h17v12h-17Z M4 6.6l8 6.4 8-6.4",
  phone: "M8.3 3.6 9.9 7.4a1.2 1.2 0 0 1-.3 1.4L8 10.3a12 12 0 0 0 5.7 5.7l1.5-1.6a1.2 1.2 0 0 1 1.4-.3l3.8 1.6a1.2 1.2 0 0 1 .7 1.3l-.5 2.7a1.6 1.6 0 0 1-1.6 1.3C10.6 21 3 13.4 3 5.1a1.6 1.6 0 0 1 1.3-1.6L7 3a1.2 1.2 0 0 1 1.3.6Z",
  pin: "M12 21.5s-6.8-6.3-6.8-11.6a6.8 6.8 0 0 1 13.6 0c0 5.3-6.8 11.6-6.8 11.6Z M12 12.4a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  web: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
};
type Ic = keyof typeof ICON;
// rows of an icon and a line of type. left: the type starts at x and the icon hangs in front of it (hang) or starts at
// x; right: the type ends at x - gap and the icon sits at the right edge, so the icons line up down the edge
function rows(items: [Ic, string][], x: number, y: number, size: number, o: { gap?: number; font?: Extract<Shape, { t: "text" }>["font"]; weight?: number; align?: "left" | "right"; hang?: boolean } = {}): Shape[] {
  const gap = o.gap ?? size * 2.2, ic = size * 1.3, pad = size * 0.75, out: Shape[] = [];
  items.forEach(([k, s], i) => {
    const yy = y + i * gap, top = yy - size * 0.36 - ic / 2;
    const icx = o.align === "right" ? x - ic : o.hang ? x - ic - pad : x;
    const tx = o.align === "right" ? x - ic - pad : o.hang ? x : x + ic + pad;
    out.push(A([ICON[k]], icx, top, ic, { vb: [0, 0, 24, 24], stroke: size * 0.085 }));
    out.push(T(s, tx, yy, size, { font: o.font, weight: o.weight, align: o.align === "right" ? "right" : "left" }));
  });
  return out;
}
// the rows as two elements, so the icons (as a group) and the type can each take their own colour and finish
function contact(face: "front" | "back", shapes: Shape[], more: { color?: string; paint?: Paint } = {}, icons: { surface?: Surface; color?: string } = {}): El[] {
  return [
    el("contact", "Contact", face, "ink", "flat", shapes.filter((s) => s.t === "text"), more),
    el("icons", "Icons", face, icons.surface ?? "ink", "flat", shapes.filter((s) => s.t === "art"), { ...more, ...(icons.color ? { color: icons.color } : {}) }),
  ];
}
// a scale along an edge: the card is a 9 cm ruler on the back (top edge) and a 3½ inch one on the front (bottom edge)
function cmRuler() {
  let d = "";
  for (let i = 1; i < 90; i++) { const l = i % 10 === 0 ? 3.6 : i % 5 === 0 ? 2.4 : 1.4; d += `M${r(i - 0.07)} 0h0.14v${l}h-0.14Z`; }
  return d;
}
function inchRuler() {
  let d = "";
  const e = 25.4 / 8;
  for (let i = 1; i * e < 90; i++) { const l = i % 8 === 0 ? 3.6 : i % 4 === 0 ? 2.6 : i % 2 === 0 ? 1.9 : 1.2; d += `M${r(i * e - 0.07)} ${r(55 - l)}h0.14v${l}h-0.14Z`; }
  return d;
}

// ─── Venty ───
const wordmark: Design = {
  id: "v-word", family: "venty", name: "Wordmark",
  note: "The whole Venty wordmark, centred and large, in one finish the way a printer would do it: spot gloss on night, silver or white foil, or pressed blind. On the back the bird is embossed beside her details.",
  ways: [
    { id: "spot", name: "Night, spot gloss", sw: [VC.night, "#23253a", VC.peri] },
    { id: "silver", name: "Night, silver foil", sw: [VC.night, "#e3e7ee", VC.peri] },
    { id: "blind", name: "Ink, blind", sw: [VC.ink, "#20233a", VC.peri] },
    { id: "corn", name: "Cornflower, white foil", sw: [VC.corn, VC.snow, VC.ink] },
  ],
  make: (w) => {
    const s = pick(w, {
      spot: stock({ paper: VC.night, back: VC.night, ink: VC.snow, coating: "soft", thickness: 0.8 }),
      silver: stock({ paper: VC.night, back: VC.night, ink: VC.snow, coating: "soft", thickness: 0.8 }),
      blind: stock({ paper: VC.ink, back: VC.ink, ink: VC.snow, coating: "soft", thickness: 0.8 }),
      corn: stock({ paper: VC.corn, back: VC.ink, ink: VC.snow, coating: "silk", thickness: 0.8, edge: "accent" }),
    });
    const [surface, press] = pick<[Surface, Press]>(w, { spot: ["spot", "flat"], silver: ["foil-silver", "flat"], blind: ["blind", "deboss"], corn: ["foil-white", "flat"] });
    return {
      stock: s,
      els: [
        el("word", "Wordmark", "front", surface, press, [A(WORD, 17, 12.6, 56)]),
        el("name", "Name", "back", "ink", "flat", [T(ME.name, 8, 14, 5.2, { track: -0.03 })]),
        el("role", "Role", "back", "ink", "flat", [T(`${ME.role}\nVenty, AI pattern studio`, 8, 19.8, 2.4, { lead: 1.45 })], { color: VC.peri }),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone]], 8, 41.5, 2.3, { gap: 5.2 })),
        el("mark", "Bird", "back", w === "silver" ? "foil-silver" : "blind", w === "silver" ? "flat" : "emboss", [A(MARK, 62, 31, 21)]),
      ],
    };
  },
};

const crown: Design = {
  id: "v-crown", family: "venty", name: "Crown glow",
  note: "Crown, the app's own gradient, printed as soft light rising from the bottom edge, with a long smooth fall-off. On the back her name is big at the top, the details sit along the bottom with the wordmark as a signature, and the edges are painted.",
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
    const [g1, g2] = pick(w, { night: [VC.corn, VC.peri], snow: [VC.corn, VC.peri], ink: [VC.peri, "#c3cbff"], holo: [VC.deep, VC.corn] });
    const sig = pick<Surface>(w, { night: "foil-white", snow: "ink", ink: "foil-silver", holo: "foil-holo" });
    return {
      stock: s,
      els: [
        el("glow", "Glow, big", "front", "ink", "flat", [{ t: "glow", x: 66, y: 66, rx: 86, ry: 42 }], { color: g1, paint: alpha(0.9) }),
        el("glow2", "Glow, small", "front", "ink", "flat", [{ t: "glow", x: 8, y: 68, rx: 48, ry: 28 }], { color: g2, paint: alpha(w === "snow" ? 0.6 : 0.7) }),
        el("word", "Wordmark", "front", sig, w === "holo" ? "emboss" : "flat", [A(WORD, 30, 19.6, 30)]),
        el("bglow", "Glow", "back", "ink", "flat", [{ t: "glow", x: 94, y: 66, rx: 58, ry: 32 }], { color: g1, paint: alpha(0.55) }),
        el("name", "Name", "back", "ink", "flat", [T("Natalia\nChamon", 7, 13.5, 6.4, { lead: 1.02, track: -0.035 })]),
        el("role", "Role", "back", "ink", "flat", [T(ME.role, 7, 26.6, 2.6)], { color: dark ? VC.peri : VC.corn }),
        el("rule", "Hairline", "back", "ink", "flat", [{ t: "rect", x: 7, y: 31.5, w: 76, h: 0.16 }], { color: dark ? VC.peri : VC.corn, paint: alpha(0.6) }),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone]], 7, 40, 2.3, { gap: 5.4 })),
        el("sig", "Wordmark", "back", sig, "flat", [A(WORD, 66, 36.6, 17)]),
      ],
    };
  },
};

const ruler: Design = {
  id: "v-ruler", family: "venty", name: "Ruler",
  note: "The card is a ruler, both ways: the back's top edge is a true 9 cm scale and the front's bottom edge a 3½ inch one, the two systems a sewist works in. The front is otherwise just the wordmark.",
  ways: [
    { id: "paper", name: "Pattern paper", sw: [VC.snow, VC.ink, VC.corn] },
    { id: "night", name: "Night, silver", sw: [VC.night, "#e3e7ee", VC.peri] },
    { id: "blue", name: "Cornflower", sw: [VC.corn, VC.snow, VC.ink] },
    { id: "cotton", name: "Cotton, letterpress", sw: ["#f5f2ea", VC.ink, VC.corn] },
  ],
  make: (w) => {
    const s = pick(w, {
      paper: stock({ paper: "#f7f8fd", back: "#f7f8fd", ink: VC.ink }),
      night: stock({ paper: VC.night, back: VC.night, ink: VC.snow, coating: "soft", thickness: 0.8 }),
      blue: stock({ paper: VC.corn, back: VC.corn, ink: VC.snow, coating: "silk" }),
      cotton: stock({ paper: "#f5f2ea", back: "#f5f2ea", ink: VC.ink, texture: "cotton", thickness: 1.2, edge: "accent" }),
    });
    const accent = pick(w, { paper: VC.corn, night: VC.peri, blue: VC.ink, cotton: VC.corn });
    const press: Press = w === "cotton" ? "letterpress" : "flat";
    const scale: Surface = w === "night" ? "foil-silver" : "ink";
    return {
      stock: s,
      els: [
        el("word", "Wordmark", "front", w === "night" ? "foil-silver" : "ink", press, [A(WORD, 27, 14, 36)]),
        el("inches", "Inches", "front", scale, press, [{ t: "path", d: inchRuler() }, ...[1, 2, 3].map((n) => T(String(n), n * 25.4, 49.6, 1.9, { font: "num", align: "center" })), T("in", 2.6, 53.4, 1.6)]),
        el("ruler", "Centimetres", "back", scale, press, [{ t: "path", d: cmRuler() }, ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => T(String(n), n * 10, 6.4, 1.9, { font: "num", align: "center" })), T("cm", 2.4, 3.2, 1.6)]),
        el("name", "Name", "back", "ink", press, [T(ME.name, 7, 23, 5, { track: -0.03 })]),
        el("role", "Role", "back", "ink", "flat", [T(`${ME.role}, Venty`, 7, 28.4, 2.4)], { color: accent }),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone]], 7, 42, 2.25, { gap: 5.2 })),
        el("mark", "Bird", "back", w === "night" ? "foil-silver" : "ink", press, [A(MARK, 71, 38, 12)], { color: accent }),
      ],
    };
  },
};

const bird: Design = {
  id: "v-bird", family: "venty", name: "Foil bird",
  note: "One face all foil, smooth as foil is, with the whole bird pressed softly into the middle of it. Or no foil: black, with the bird pressed blind. Her details on the back as before.",
  ways: [
    { id: "silver", name: "Silver", sw: ["#e3e7ee", VC.black, VC.snow] },
    { id: "corn", name: "Cornflower foil", sw: ["#9aa8fb", VC.night, VC.snow] },
    { id: "holo", name: "Holographic", sw: ["#e1e5ec", "#f4d4ff", VC.night] },
    { id: "black", name: "Black, blind", sw: [VC.black, "#1c1c22", VC.peri] },
  ],
  make: (w) => {
    const plain = w === "black";
    const s = stock({ paper: plain ? VC.black : VC.night, back: w === "corn" || w === "holo" ? VC.night : VC.black, ink: VC.snow, coating: plain ? "soft" : "silk", thickness: 0.8 });
    return {
      stock: s,
      els: [
        el("field", "Foil", "front", plain ? "blind" : pick<Surface>(w, { silver: "foil-silver", corn: "foil-cornflower", holo: "foil-holo" }), "flat", [{ t: "rect", x: -1, y: -1, w: 92, h: 57 }]),
        el("bird", "Bird", "front", "blind", "deboss", [A(MARK, 25, 15, 40)]),
        el("word", "Wordmark", "back", "ink", "flat", [A(WORD, 7, 7, 16)]),
        el("name", "Name", "back", "ink", "flat", [T(`${ME.name}\n${ME.role}`, 31, 22, 2.6, { lead: 1.3 })], { color: plain ? VC.peri : undefined }),
        ...contact("back", [...rows([["mail", ME.email], ["phone", ME.phone], ["pin", ME.city]], 31, 34, 2.3, { gap: 5, hang: true })], { color: "#c3cbff" }),
      ],
    };
  },
};

// ─── Natalia ───
const swash: Design = {
  id: "n-swash", family: "natalia", name: "Big nck",
  note: "Her nck wordmark filling the card, cut off by the trim so only its curves read, in satin butter or cream foil (never gold) or ink. The back is calm: her name with the site's habit of setting proper nouns in serif italic, and her details down the right edge with icons.",
  ways: [
    { id: "green", name: "Green, butter foil", sw: [NC.green, NC.butter, NC.cream] },
    { id: "cream", name: "Cream, letterpress", sw: [NC.cream, NC.green, NC.butter] },
    { id: "butter", name: "Butter", sw: [NC.butterSoft, NC.green, NC.cream] },
    { id: "ink", name: "Ink, cream foil", sw: [NC.inkDeep, NC.creamLight, NC.cream] },
  ],
  make: (w) => {
    const s = pick(w, {
      green: stock({ paper: NC.green, back: NC.cream, ink: NC.green, coating: "soft", thickness: 0.8 }),
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, thickness: 1.2, edge: "accent", accent: NC.green }),
      butter: stock({ paper: NC.butterSoft, back: NC.green, ink: NC.cream, thickness: 0.8 }),
      ink: stock({ paper: NC.inkDeep, back: NC.inkDeep, ink: NC.cream, coating: "soft", thickness: 0.8 }),
    });
    return {
      stock: s,
      els: [
        el("nck", "nck", "front", pick<Surface>(w, { green: "foil-butter", cream: "ink", butter: "ink", ink: "foil-cream" }), pick<Press>(w, { green: "flat", cream: "letterpress", butter: "deboss", ink: "flat" }), [A(NCK, -12, -9, 128, { evenodd: true })], { color: NC.green }),
        el("swash", "Swash", "back", w === "butter" ? "foil-butter" : w === "ink" ? "foil-cream" : "ink", "flat", [A(SWASH, 7, 7, 8.5)]),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 7, 29, 6.4, { font: "serif" }), T("Chamon", 7, 35.6, 6.4, { font: "satoshi", weight: 500, track: -0.02 })]),
        el("role", "Role", "back", "ink", "flat", [T(ME.role, 7, 42, 2.5, { font: "satoshi", weight: 500 })], { color: w === "butter" ? NC.butter : undefined }),
        el("place", "Brisbane", "back", "ink", "flat", [T("Brisbane", 83, 11.5, 3, { font: "serif", align: "right" })]),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone]], 83, 37.6, 2, { font: "mono", align: "right", gap: 4.6 })),
      ],
    };
  },
};

// the site's hero grid. Front, as on a computer: one hairline down at 33% of the width and one across at 26% of the
// height, the star where they cross, 4.2% of the width (here 4.4 mm). Back, as on a phone: one line across, a line
// down to it from the top at 73% and one down from it at 16%, each meeting it at a half star.
const gridCard: Design = {
  id: "n-grid", family: "natalia", name: "Hero grid",
  note: "The grid from the top of her site, to its measurements: the computer version on the front (lines at 33% and 26%, the star where they cross), the phone version on the back with its two half stars. Her icon in the first cell, her details with icons, and the line from her site.",
  ways: [
    { id: "green", name: "Green", sw: [NC.green, NC.creamLight, NC.butter] },
    { id: "cream", name: "Cream", sw: [NC.cream, NC.green, NC.lines] },
    { id: "ink", name: "Ink, grey lines", sw: [NC.inkDeep, NC.lines, NC.butter] },
  ],
  make: (w) => {
    const s = pick(w, {
      green: stock({ paper: NC.green, back: NC.green, ink: NC.creamLight, coating: "soft" }),
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green }),
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
        el("swash", "Icon", "front", star, sp, [A(SWASH, 9.5, 4.4, 8.4)]),
        el("where", "Where", "front", "ink", "flat", [T(`${ME.city}\n27.47° S, 153.03° E`, 86, 6, 1.75, { font: "mono", align: "right", lead: 1.45 })], { paint: alpha(0.7) }),
        el("nck", "nck", "front", w === "cream" ? "ink" : "foil-butter", w === "cream" ? "deboss" : "flat", [A(NCK, 36, 21, 49, { evenodd: true })]),
        el("tag", "Product designer", "front", "ink", "flat", [T("Product\ndesigner", 4, 44, 3.4, { font: "serif", lead: 1.12 })]),
        el("blines", "Lines", "back", "ink", "flat", [{ t: "path", d: `M${r(up)} 0V${bh}M0 ${bh}H90M${r(dn)} ${bh}V55`, stroke: 0.12 }], { color: lineColor, paint: alpha(la) }),
        el("bstars", "Half stars", "back", star, sp, [A(HALF_STAR, up - st / 2, bh - st / 2, st), A(HALF_STAR, dn + st / 2, bh + st / 2, st, { rot: 180 })]),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 4, 8.2, 4.4, { font: "serif" }), T("Chamon", 4, 13.4, 4.4, { font: "satoshi", weight: 500, track: -0.02 })]),
        el("role", "Role", "back", "ink", "flat", [T("Product, UI/UX\nand front-end", 69.5, 7.2, 2, { font: "satoshi", weight: 500, lead: 1.35 })]),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone], ["pin", ME.city]], 20, 27, 1.95, { font: "mono", gap: 4.8 })),
        el("tea", "Made with tea", "back", "ink", "flat", [T("Made with tea and care.", 86, 50.5, 2.5, { font: "serif", align: "right" }), A(TEA, 79.5, 36, 6.2)]),
      ],
    };
  },
};

// the centred cross from the site's hero, to its proportions: on a 942-wide hero the lines are 4.06 thick and the star
// 215 wide, so on the card 0.39 mm and 20.5 mm; the hero is tall and the card wide, so the centre goes by proportion
const crossing: Design = {
  id: "n-cross", family: "natalia", name: "Crossing",
  note: "Her hero cross at its true proportions, as on the site: the two lines pressed into the card and the star stamped flat in satin foil where they meet, her nck in the top-left quarter and \"Product designer\" in serif italic in the bottom-right, like the hero's headline and tag.",
  ways: [
    { id: "green", name: "Green, butter star", sw: [NC.green, NC.creamLight, NC.butter] },
    { id: "ink", name: "Ink, cream star", sw: [NC.inkDeep, NC.lines, NC.creamLight] },
    { id: "cream", name: "Cream, letterpress", sw: [NC.cream, NC.green, NC.creamSoft] },
  ],
  make: (w) => {
    const s = pick(w, {
      green: stock({ paper: NC.green, back: NC.cream, ink: NC.creamLight, coating: "soft", thickness: 0.8 }),
      ink: stock({ paper: NC.inkDeep, back: NC.inkDeep, ink: NC.cream, coating: "soft", thickness: 0.8 }),
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, thickness: 1.2 }),
    });
    const k = 90 / 942, cx = (473.03 / 942) * 90, cy = (570.48 / 1141) * 55, st = 215.2 * k;
    const backInk = w === "green" ? NC.green : undefined;
    const starS = pick<Surface>(w, { green: "foil-butter", ink: "foil-cream", cream: "ink" });
    return {
      stock: s,
      els: [
        el("lines", "Lines", "front", "ink", "letterpress", [{ t: "path", d: `M${r(cx)} 0V55M0 ${r(cy)}H90`, stroke: r(4.06 * k) }], { color: w === "ink" ? NC.lines : undefined, paint: alpha(w === "cream" ? 1 : 0.8) }),
        el("star", "Star", "front", starS, w === "cream" ? "letterpress" : "flat", [A(STAR, cx - st / 2, cy - st / 2, st)]),
        el("nck", "nck", "front", starS, w === "cream" ? "letterpress" : "flat", [A(NCK, 7, 6.5, 19, { evenodd: true })]),
        el("tag", "Product designer", "front", "ink", "flat", [T("Product designer", 83, 49, 3.2, { font: "serif", align: "right" })]),
        el("bnck", "nck", "back", w === "ink" ? "foil-cream" : "ink", "flat", [A(NCK, 6, 6, 22, { evenodd: true })], { color: backInk }),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 6, 31, 5, { font: "serif" }), T("Chamon", 6, 37, 5, { font: "satoshi", weight: 500, track: -0.02 })], { color: backInk }),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone]], 6, 44.5, 1.9, { font: "mono", gap: 4.4 }), { color: backInk }),
        el("tea", "Tea", "back", w === "ink" ? "foil-cream" : w === "green" ? "foil-butter" : "ink", "flat", [A(TEA, 74, 33, 10)], { color: backInk }),
      ],
    };
  },
};

const blind: Design = {
  id: "n-blind", family: "natalia", name: "Blind nck",
  note: "No ink on the front at all: her nck pressed up out of a smooth, thick card. The back is set like a letterhead: her name large in serif and sans, her icon, a hairline, then her details with icons in two columns.",
  ways: [
    { id: "cream", name: "Cream", sw: [NC.cream, NC.green, NC.creamSoft] },
    { id: "stone", name: "Stone", sw: [NC.creamSoft, NC.ink, NC.cream] },
    { id: "green", name: "Green", sw: [NC.green, NC.cream, NC.butter] },
    { id: "butter", name: "Butter", sw: [NC.butterSoft, NC.inkWarm, NC.cream] },
  ],
  make: (w) => {
    const s = pick(w, {
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, thickness: 1.2 }),
      stone: stock({ paper: NC.creamSoft, back: NC.creamSoft, ink: NC.ink, thickness: 1.2 }),
      green: stock({ paper: NC.green, back: NC.green, ink: NC.cream, coating: "soft", thickness: 1.2 }),
      butter: stock({ paper: NC.butterSoft, back: NC.butterSoft, ink: NC.inkWarm, thickness: 1.2 }),
    });
    return {
      stock: s,
      els: [
        el("nck", "nck", "front", "blind", "deep-emboss", [A(NCK, 13, 11.5, 64, { evenodd: true })]),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 7, 14, 5.6, { font: "serif" }), T("Chamon", 7, 20.4, 5.6, { font: "satoshi", weight: 500, track: -0.02 })]),
        el("role", "Role", "back", "ink", "flat", [T(ME.role, 7, 26.6, 2.3, { font: "satoshi", weight: 500 })], { paint: alpha(0.75) }),
        el("swash", "Icon", "back", w === "green" ? "foil-butter" : "ink", w === "green" ? "flat" : "letterpress", [A(SWASH, 74, 7.5, 9)]),
        el("rule", "Hairline", "back", "ink", "flat", [{ t: "rect", x: 7, y: 33, w: 76, h: 0.14 }], { paint: alpha(0.4) }),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone]], 7, 41, 2.1, { font: "satoshi", weight: 500, gap: 5 })),
        el("what", "What", "back", "ink", "flat", [T("Product, UI/UX\nand front-end", 83, 41, 2.1, { font: "satoshi", weight: 500, lead: 1.42, align: "right" })], { paint: alpha(0.75) }),
      ],
    };
  },
};

const tea: Design = {
  id: "n-tea", family: "natalia", name: "Tea and care",
  note: "The line from her site, made with tea and care, as the front: her tea asset in satin foil beside it in serif italic. Her name, details and nck on the back.",
  ways: [
    { id: "cream", name: "Cream and green", sw: [NC.cream, NC.green, NC.butter] },
    { id: "butter", name: "Butter and ink", sw: [NC.butterSoft, NC.inkWarm, NC.inkDeep] },
    { id: "green", name: "Green, butter foil", sw: [NC.green, NC.butter, NC.cream] },
  ],
  make: (w) => {
    const s = pick(w, {
      cream: stock({ paper: NC.cream, back: NC.green, ink: NC.green, thickness: 0.8 }),
      butter: stock({ paper: NC.butterSoft, back: NC.inkDeep, ink: NC.inkWarm, thickness: 0.8 }),
      green: stock({ paper: NC.green, back: NC.cream, ink: NC.creamLight, coating: "soft", thickness: 0.8 }),
    });
    const backInk = w === "green" ? NC.green : NC.cream;
    return {
      stock: s,
      els: [
        el("cup", "Tea", "front", w === "green" ? "foil-butter" : "ink", w === "cream" ? "letterpress" : "flat", [A(TEA, 13, 12.5, 24)]),
        el("line", "Made with tea", "front", "ink", "flat", [T("Made with tea\nand care.", 43, 26, 5.4, { font: "serif", lead: 1.08 })]),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", 6, 13, 5, { font: "serif" }), T("Chamon", 6, 18.8, 5, { font: "satoshi", weight: 500, track: -0.02 }), T(ME.role, 6, 24.4, 2.2, { font: "satoshi", weight: 500 })], { color: backInk }),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone], ["pin", ME.city]], 6, 38.6, 1.9, { font: "mono", gap: 4.6 }), { color: backInk }),
        el("nck", "nck", "back", w === "green" ? "ink" : "foil-butter", "flat", [A(NCK, 63, 39, 21, { evenodd: true })], { color: backInk }),
      ],
    };
  },
};

// ─── the two favourites (25 Oct 2026, from Jose) ───
// Venty: Crown glow's front (the wordmark at its size, the glow from the bottom) with the wordmark in black foil and the
// Ruler card's centimetres along the top, on a darker night; the back with tighter margins, no hairline or glow, her
// role at the top right and the bird in cornflower foil
const crownRuler: Design = {
  id: "v-crown-ruler", family: "venty", name: "Crown ruler",
  note: "Crown glow's front with the wordmark in black foil and the centimetre ruler along the top, on a darker night. The back is closer to the edges: name top left, role top right, details bottom left, the bird in cornflower foil bottom right.",
  ways: [
    { id: "deep", name: "Deep night", sw: ["#05060b", VC.corn, "#000000"] },
    { id: "night", name: "Night", sw: [VC.night, VC.corn, "#000000"] },
    { id: "ink", name: "Ink", sw: [VC.ink, VC.peri, "#000000"] },
  ],
  make: (w) => {
    const paper = pick(w, { deep: "#05060b", night: VC.night, ink: VC.ink });
    const s = stock({ paper, back: paper, ink: VC.snow, coating: "soft", thickness: 1.2, edge: "accent" });
    const [g1, g2] = w === "ink" ? [VC.peri, "#c3cbff"] : [VC.corn, VC.peri];
    const m = 5; // the back's margin
    return {
      stock: s,
      els: [
        el("glow", "Glow, big", "front", "ink", "flat", [{ t: "glow", x: 66, y: 66, rx: 86, ry: 42 }], { color: g1, paint: alpha(0.9) }),
        el("glow2", "Glow, small", "front", "ink", "flat", [{ t: "glow", x: 8, y: 68, rx: 48, ry: 28 }], { color: g2, paint: alpha(0.7) }),
        el("word", "Wordmark", "front", "foil-black", "flat", [A(WORD, 30, 19.6, 30)]),
        el("ruler", "Centimetres", "front", "ink", "flat", [{ t: "path", d: cmRuler() }, ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => T(String(n), n * 10, 6.4, 1.9, { font: "num", align: "center" })), T("cm", 2.4, 3.2, 1.6)], { color: VC.steel }),
        el("name", "Name", "back", "ink", "flat", [T("Natalia\nChamon", m, 10.6, 6.4, { lead: 1.02, track: -0.035 })]),
        el("role", "Role", "back", "ink", "flat", [T("Founder, Venty", 90 - m, 8.4, 2.6, { align: "right" })]),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone], ["web", "app.venty.au"]], m, 50 - 2 * 5.4, 2.3, { gap: 5.4 })),
        el("bird", "Bird", "back", "foil-cornflower", "flat", [A(MARK, 90 - m - 12, 50 - 7.2, 12)]),
      ],
    };
  },
};

// Natalia: Big nck brought inside the card and centred, in spot gloss (no colour, only shine); the back is the Hero grid
// back, with Chamon in the same serif italic as Natalia
const nckGrid: Design = {
  id: "n-nck-grid", family: "natalia", name: "nck and grid",
  note: "Big nck contained and centred, in spot gloss so it shows only as shine on the paper. The back is the Hero grid's: the phone grid with its half stars, her name now all in serif italic, details with icons and the line from her site.",
  ways: [
    { id: "green", name: "Green", sw: [NC.green, NC.creamLight, NC.butter] },
    { id: "ink", name: "Ink, grey lines", sw: [NC.inkDeep, NC.lines, NC.butter] },
    { id: "cream", name: "Cream", sw: [NC.cream, NC.green, NC.lines] },
  ],
  make: (w) => {
    const s = pick(w, {
      green: stock({ paper: NC.green, back: NC.green, ink: NC.creamLight, coating: "soft", thickness: 0.8 }),
      ink: stock({ paper: NC.inkDeep, back: NC.inkDeep, ink: NC.cream, coating: "soft", thickness: 0.8 }),
      cream: stock({ paper: NC.cream, back: NC.cream, ink: NC.green, thickness: 0.8 }),
    });
    // one spacing everywhere, the card's margin (M = 4 mm): from the edges, from the lines and between the blocks. Type
    // sits by its measured ascent (0.7 of the size in all three of her fonts). The name fills the top band from the top
    // margin down; the line sits one margin below it; the role's last line shares Chamon's baseline, one margin above
    // the line and one margin right of the upper rule; the details start one margin below the line and one margin
    // right of the lower rule; the tea sits one margin in from the bottom right corner.
    const M = 4, S = 4.4, b1 = M + 0.7 * S, b2 = b1 + 1.18 * S, bh = r(b2 + M), up = 0.73 * 90, dn = 0.16 * 90, st = 4.4;
    const rs = 2.2, rg = 1.36 * rs, cs = 1.95, ic = cs * 1.3, row1 = bh + M + cs * 0.36 + ic / 2, tw = 6.2, th = (tw * 212) / 172;
    const nw = 66, nh = nw / 1.915;
    return {
      stock: s,
      els: [
        el("nck", "nck", "front", "spot", "flat", [A(NCK, (90 - nw) / 2, (55 - nh) / 2, nw, { evenodd: true })]),
        el("blines", "Lines", "back", "spot", "flat", [{ t: "path", d: `M${r(up)} 0V${bh}M0 ${bh}H90M${r(dn)} ${bh}V55`, stroke: 0.16 }]),
        el("bstars", "Half stars", "back", "spot", "flat", [A(HALF_STAR, up - st / 2, bh - st / 2, st), A(HALF_STAR, dn + st / 2, bh + st / 2, st, { rot: 180 })]),
        el("name", "Name", "back", "ink", "flat", [T("Natalia", M, b1, S, { font: "serif" }), T("Chamon", M, b2, S, { font: "serif" })]),
        el("role", "Role", "back", "ink", "flat", [T("Product, UI/UX\nand front-end", up + M, b2 - rg, rs, { font: "satoshi", weight: 500, lead: 1.36 })]),
        ...contact("back", rows([["mail", ME.email], ["phone", ME.phone], ["web", ME.web], ["pin", ME.city]], dn + M, row1, cs, { font: "mono", gap: 4.8 })),
        el("tea", "Tea", "back", "ink", "flat", [A(TEA, 90 - M - tw, 55 - M - th, tw)]),
      ],
    };
  },
};

export const DESIGNS: Design[] = [crownRuler, wordmark, crown, ruler, bird, nckGrid, swash, gridCard, crossing, blind, tea];
