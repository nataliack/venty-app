"use client";
// Lab · Natalia's business card (25 Oct 2026). A real card you can turn in your hand: paper stock (a colour per face),
// thickness, corners and painted edges, and on each face a set of elements, each with a finish (print, blind, spot gloss,
// foils) and a press (flat, emboss, chisel emboss, deep emboss, deboss, chisel deboss, letterpress). An element is a
// list of shapes (type, artwork, paths and strokes, rectangles, soft glows) drawn as one mask, and can be printed in a
// colour or a gradient. Nothing is a picture of a finish: each mask becomes the maps a physical material reads:
//   height  → normal map (the relief catches the light as the card turns), and an occlusion map (hollows go dark)
//   finish  → colour, roughness and metal (foil), clear coat (spot gloss, black foil), iridescence (holographic foil)
// Chisel is a distance field (a straight bevel from the edge in, so thin strokes become ridges and big shapes keep a
// flat top); emboss and deboss are soft shoulders; letterpress is a crisp bite with a little squeezed-up lip. What is
// pressed into one face shows through, mirrored and softened, on the other, as on real paper.
// drawFlat draws the same card flat and fast (no relief maps), for the wall of every design.
// Approach from two open projects (ideas only, no code taken): KonradJam/business-card-viewer (AGPL-3.0: masks driving a
// clear coat map for spot UV, and a height map for emboss) and 1to1-Digital-Solutions/contact-card (MIT: an R3F card
// drawn on canvas at runtime, damped springs, flip on double tap).
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

export const PX = 16; // texture pixels per mm (406 dpi)

export type Surface = "ink" | "blind" | "spot" | "foil-gold" | "foil-butter" | "foil-cream" | "foil-silver" | "foil-copper" | "foil-white" | "foil-black" | "foil-cornflower" | "foil-holo";
export type Press = "flat" | "emboss" | "chisel-emboss" | "deep-emboss" | "deboss" | "chisel-deboss" | "letterpress";
export const SURFACES: { k: Surface; name: string }[] = [
  { k: "ink", name: "Print" }, { k: "blind", name: "Blind" }, { k: "spot", name: "Spot gloss" },
  { k: "foil-white", name: "White foil" }, { k: "foil-black", name: "Black foil" }, { k: "foil-silver", name: "Silver foil" },
  { k: "foil-gold", name: "Gold foil" }, { k: "foil-butter", name: "Butter foil" }, { k: "foil-cream", name: "Cream foil" }, { k: "foil-copper", name: "Copper foil" },
  { k: "foil-cornflower", name: "Cornflower foil" }, { k: "foil-holo", name: "Holographic foil" },
];
export const PRESSES: { k: Press; name: string }[] = [
  { k: "flat", name: "Flat" }, { k: "emboss", name: "Emboss" }, { k: "chisel-emboss", name: "Chisel emboss" }, { k: "deep-emboss", name: "Deep emboss" },
  { k: "deboss", name: "Deboss" }, { k: "chisel-deboss", name: "Chisel deboss" }, { k: "letterpress", name: "Letterpress" },
];

export type FontKey = "grotesk" | "num" | "satoshi" | "serif" | "mono";
// all sizes and positions in mm from the card's top left; text y is the first baseline; rot in degrees about (x, y)
export type Shape =
  | { t: "text"; s: string; x: number; y: number; size: number; font?: FontKey; weight?: number; align?: CanvasTextAlign; track?: number; lead?: number; rot?: number }
  | { t: "art"; paths: string[]; x: number; y: number; w: number; flip?: boolean; evenodd?: boolean; rot?: number; vb?: [number, number, number, number]; stroke?: number } // vb: a fixed box (icons); stroke in mm: outlines
  | { t: "path"; d: string; stroke?: number; dash?: number[]; evenodd?: boolean }
  | { t: "rect"; x: number; y: number; w: number; h: number; r?: number }
  | { t: "glow"; x: number; y: number; rx: number; ry: number };
// a gradient print: the element's colour at `from` turns into `to` (and its opacity from a0 to a1) by `end`
export type Paint = { to?: string; a0?: number; a1?: number; from: [number, number]; end: [number, number] };
export type El = { id: string; name: string; face: "front" | "back"; surface: Surface; press: Press; color?: string; paint?: Paint; shapes: Shape[] };

export type Edge = "paper" | "ink" | "accent" | "foil-gold" | "foil-silver";
export type Stock = {
  size: "au" | "eu" | "us";
  paper: string; // the front's paper (hex)
  back: string; // the back's paper; duplexed card can differ
  ink: string; // the colour "Print" uses unless an element has its own
  accent: string; // the painted-edge colour
  coating: "uncoated" | "silk" | "soft";
  texture: "smooth" | "cotton" | "felt";
  thickness: number; // mm
  corner: number; // mm
  edge: Edge;
  through: number; // how much of one face's press shows on the other, 0–1
};
export const SIZES = { au: { w: 90, h: 55, name: "90 × 55" }, eu: { w: 85, h: 55, name: "85 × 55" }, us: { w: 88.9, h: 50.8, name: "3.5 × 2 in" } };

// ─── fonts: the app's (Familjen Grotesk, Bigilla) and Natalia's (Satoshi, Playfair Display italic, IBM Plex Mono) ───
export type Fonts = Record<FontKey, string>;
let fontsP: Promise<Fonts> | null = null;
export function loadFonts(): Promise<Fonts> {
  if (fontsP) return fontsP;
  const body = getComputedStyle(document.body);
  const v = (n: string, f: string) => body.getPropertyValue(n).trim() || f;
  const faces: [string, string, string, string][] = [
    ["LabSatoshi", "/lab/ui/fonts/satoshi-400.woff2", "400", "normal"], ["LabSatoshi", "/lab/ui/fonts/satoshi-500.woff2", "500", "normal"],
    ["LabSatoshi", "/lab/ui/fonts/satoshi-700.woff2", "700", "normal"], ["LabPlayfair", "/lab/ui/fonts/playfair-italic.woff2", "400", "italic"],
    ["LabPlexMono", "/lab/ui/fonts/plex-mono-400.woff2", "400", "normal"],
  ];
  const fonts: Fonts = { grotesk: v("--font-grotesk", "sans-serif"), num: v("--font-num", "serif"), satoshi: "LabSatoshi", serif: "LabPlayfair", mono: "LabPlexMono" };
  fontsP = Promise.all([
    ...faces.map(([fam, url, weight, style]) => new FontFace(fam, `url(${url})`, { weight, style }).load().then((f) => { document.fonts.add(f); }).catch(() => {})),
    ...[400, 500].map((w) => document.fonts.load(`${w} 40px ${fonts.grotesk}`)), document.fonts.load(`700 40px ${fonts.num}`),
  ]).then(() => fonts);
  return fontsP;
}
export function useFonts() {
  const [f, setF] = useState<Fonts | null>(null);
  useEffect(() => { let live = true; loadFonts().then((x) => { if (live) setF(x); }); return () => { live = false; }; }, []);
  return f;
}

// ─── drawing shapes (white, into a mask) at px pixels per mm ───
type BB = { x: number; y: number; w: number; h: number };
const bbCache = new Map<string, BB>();
function bboxOf(paths: string[]) {
  const key = paths.map((p) => p.slice(0, 60) + p.length).join("|");
  const hit = bbCache.get(key); if (hit) return hit;
  const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg"), g = document.createElementNS(ns, "g");
  svg.setAttribute("style", "position:absolute;width:0;height:0;visibility:hidden");
  for (const d of paths) { const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); g.appendChild(p); }
  svg.appendChild(g); document.body.appendChild(svg);
  const b = g.getBBox(); svg.remove();
  const bb = { x: b.x, y: b.y, w: b.width, h: b.height }; bbCache.set(key, bb); return bb;
}
const path2d = new Map<string, Path2D>();
const P2 = (d: string) => { let p = path2d.get(d); if (!p) { p = new Path2D(d); path2d.set(d, p); } return p; };
function drawShapes(ctx: CanvasRenderingContext2D, shapes: Shape[], px: number, fonts: Fonts) {
  for (const s of shapes) {
    ctx.save(); ctx.fillStyle = "#fff"; ctx.strokeStyle = "#fff";
    if (s.t === "text") {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(s.x * px, s.y * px); if (s.rot) ctx.rotate((s.rot * Math.PI) / 180);
      ctx.font = `${s.font === "serif" ? "italic " : ""}${s.weight ?? (s.font === "num" ? 700 : 400)} ${s.size * px}px ${fonts[s.font ?? "grotesk"]}`;
      ctx.textAlign = s.align ?? "left"; ctx.textBaseline = "alphabetic";
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${(s.track ?? 0) * s.size * px}px`;
      s.s.split("\n").forEach((line, i) => ctx.fillText(line, 0, i * (s.lead ?? 1.22) * s.size * px));
    } else {
      ctx.setTransform(px, 0, 0, px, 0, 0);
      if (s.t === "art") {
        const bb = s.vb ? { x: s.vb[0], y: s.vb[1], w: s.vb[2], h: s.vb[3] } : bboxOf(s.paths), k = s.w / bb.w;
        ctx.translate(s.x, s.y); if (s.rot) ctx.rotate((s.rot * Math.PI) / 180);
        if (s.flip) { ctx.translate(s.w, 0); ctx.scale(-1, 1); }
        ctx.scale(k, k); ctx.translate(-bb.x, -bb.y);
        if (s.stroke) { ctx.lineWidth = s.stroke / k; ctx.lineCap = "round"; ctx.lineJoin = "round"; for (const d of s.paths) ctx.stroke(P2(d)); }
        else for (const d of s.paths) ctx.fill(P2(d), s.evenodd ? "evenodd" : "nonzero");
      } else if (s.t === "path") {
        if (s.stroke) { ctx.lineWidth = s.stroke; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash(s.dash ?? []); ctx.stroke(P2(s.d)); }
        else ctx.fill(P2(s.d), s.evenodd ? "evenodd" : "nonzero");
      } else if (s.t === "rect") {
        ctx.beginPath(); ctx.roundRect(s.x, s.y, s.w, s.h, s.r ?? 0); ctx.fill();
      } else {
        // a soft ellipse of ink, as printed gradients are: a long, smooth fall-off with no edge
        ctx.translate(s.x, s.y); ctx.scale(s.rx, s.ry);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        for (let i = 0; i <= 12; i++) { const t = i / 12; g.addColorStop(t, `rgba(255,255,255,${((1 - t * t) ** 3).toFixed(3)})`); }
        ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2);
      }
    }
    ctx.restore();
  }
}

// ─── maths on whole images (Float32Array, w × h, rows top to bottom) ───
const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
function boxPass(src: Float32Array, dst: Float32Array, w: number, h: number, r: number, horiz: boolean) {
  const n = 2 * r + 1, len = horiz ? w : h, lines = horiz ? h : w, step = horiz ? 1 : w;
  for (let l = 0; l < lines; l++) {
    const o = horiz ? l * w : l;
    let s = 0;
    for (let k = -r; k <= r; k++) s += src[o + Math.min(len - 1, Math.max(0, k)) * step];
    for (let i = 0; i < len; i++) {
      dst[o + i * step] = s / n;
      s += src[o + Math.min(len - 1, i + r + 1) * step] - src[o + Math.max(0, i - r) * step];
    }
  }
}
// three box passes ≈ a gaussian of about r px; rx/ry apart for streaky (felt) paper
function blur(src: Float32Array, w: number, h: number, rx: number, ry = rx) {
  let a = src;
  const t = new Float32Array(w * h);
  const bx = Math.max(0, Math.round(rx / Math.sqrt(3))), by = Math.max(0, Math.round(ry / Math.sqrt(3)));
  for (let k = 0; k < 3; k++) {
    const out = new Float32Array(w * h);
    if (bx > 0) boxPass(a, t, w, h, bx, true); else t.set(a);
    if (by > 0) boxPass(t, out, w, h, by, false); else out.set(t);
    a = out;
  }
  return a;
}
// distance (px) from each inside pixel to the nearest outside one; the image border counts as inside (art that bleeds
// off the card has no bevel at the trim). Partly covered edge pixels get a fraction, so bevels stay smooth.
function insideDist(a: Float32Array, w: number, h: number) {
  const d = new Float32Array(w * h), D = Math.SQRT2;
  for (let i = 0; i < w * h; i++) d[i] = a[i] > 0.5 ? 1e6 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (d[i] === 0) continue;
    let v = d[i];
    if (x > 0) v = Math.min(v, d[i - 1] + 1);
    if (y > 0) { v = Math.min(v, d[i - w] + 1); if (x > 0) v = Math.min(v, d[i - w - 1] + D); if (x < w - 1) v = Math.min(v, d[i - w + 1] + D); }
    d[i] = v;
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; if (d[i] === 0) continue;
    let v = d[i];
    if (x < w - 1) v = Math.min(v, d[i + 1] + 1);
    if (y < h - 1) { v = Math.min(v, d[i + w] + 1); if (x < w - 1) v = Math.min(v, d[i + w + 1] + D); if (x > 0) v = Math.min(v, d[i + w - 1] + D); }
    d[i] = v;
  }
  for (let i = 0; i < w * h; i++) d[i] = a[i] > 0.5 ? d[i] - 1 + a[i] : a[i];
  return d;
}
function mirror(src: Float32Array, w: number, h: number) {
  const o = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o[y * w + x] = src[y * w + (w - 1 - x)];
  return o;
}
function rand(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// noise with a standard deviation of amp, blurred to grain size r (rx, ry)
function noise(w: number, h: number, seed: number, amp: number, rx: number, ry = rx) {
  const r = rand(seed), n = new Float32Array(w * h);
  for (let i = 0; i < n.length; i++) n[i] = r() - 0.5;
  const b = rx > 0 || ry > 0 ? blur(n, w, h, rx, ry) : n;
  let s = 0; for (let i = 0; i < b.length; i += 7) s += b[i] * b[i];
  const k = amp / Math.sqrt(s / Math.ceil(b.length / 7) || 1);
  for (let i = 0; i < b.length; i++) b[i] *= k;
  return b;
}

// ─── masks (kept for the last few cards only: each is a few MB) ───
type Mask = { a: Float32Array; d?: Float32Array; blurs: Map<number, Float32Array> };
const maskCache = new Map<string, Mask>();
function maskOf(el: El, w: number, h: number, fonts: Fonts): Mask {
  const key = JSON.stringify(el.shapes) + w + "x" + h; // the finish doesn't change the shape
  const hit = maskCache.get(key); if (hit) { maskCache.delete(key); maskCache.set(key, hit); return hit; }
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  drawShapes(ctx, el.shapes, PX, fonts);
  const img = ctx.getImageData(0, 0, w, h).data, a = new Float32Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = img[i * 4 + 3] / 255;
  const m: Mask = { a, blurs: new Map() };
  maskCache.set(key, m);
  while (maskCache.size > 40) maskCache.delete(maskCache.keys().next().value!);
  return m;
}
const distOf = (m: Mask, w: number, h: number) => (m.d ??= insideDist(m.a, w, h));
const blurOf = (m: Mask, w: number, h: number, r: number) => { let b = m.blurs.get(r); if (!b) { b = blur(m.a, w, h, r); m.blurs.set(r, b); } return b; };

// the height (in 0.1 mm) a press gives one pixel (distances in px at PX per mm)
const MM = PX / 20; // the presses were tuned at 20 px per mm
function pressHeight(p: Press, surface: Surface, m: Mask, i: number, w: number, h: number) {
  if (p === "flat" && surface === "ink") return 0;
  const d = distOf(m, w, h)[i] / MM;
  switch (p) {
    case "emboss": return 2 * sm(d / 7);
    case "chisel-emboss": return 3 * Math.min(d, 14) / 14;
    case "deep-emboss": return 3.6 * (0.7 * sm(d / 16) + 0.3 * blurOf(m, w, h, Math.round(16 * MM))[i]);
    case "deboss": return -1.7 * sm(d / 6);
    case "chisel-deboss": return -3 * Math.min(d, 14) / 14;
    case "letterpress": return -1.3 * sm(d / 2) + 0.3 * Math.max(0, blurOf(m, w, h, Math.round(5 * MM))[i] - m.a[i]);
    case "flat":
      if (surface.startsWith("foil")) return -0.25 * sm(d / 1.5); // foil is stamped, so it sits a hair below the paper
      if (surface === "spot") return 0.15 * sm(d / 2); // a raised varnish
      return 0;
  }
}

export const hex = (c: string) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const FOIL: Record<string, { c: string; rough: number; metal: number; coat: number }> = {
  "foil-gold": { c: "#f1cd84", rough: 0.24, metal: 1, coat: 0 },
  "foil-butter": { c: "#fff0b2", rough: 0.32, metal: 0, coat: 0.35 }, // a satin pigment foil, so it never reads as gold
  "foil-cream": { c: "#fff7e2", rough: 0.32, metal: 0, coat: 0.35 },
  "foil-silver": { c: "#e3e7ee", rough: 0.2, metal: 1, coat: 0 },
  "foil-copper": { c: "#eaa37e", rough: 0.24, metal: 1, coat: 0 },
  "foil-cornflower": { c: "#9aa8fb", rough: 0.24, metal: 1, coat: 0 },
  "foil-holo": { c: "#e1e5ec", rough: 0.16, metal: 1, coat: 0 },
  "foil-white": { c: "#fbfcff", rough: 0.4, metal: 0, coat: 0.3 },
  "foil-black": { c: "#0c0d12", rough: 0.16, metal: 0, coat: 1 },
};
const PAPER_ROUGH = { uncoated: 0.93, silk: 0.55, soft: 0.8 };

const noiseCache = new Map<string, Float32Array>();
function paperNoise(w: number, h: number, t: Stock["texture"]) {
  const key = `${w}x${h}${t}`; const hit = noiseCache.get(key); if (hit) return hit;
  let n: Float32Array;
  if (t === "smooth") n = noise(w, h, 1, 0.012, 1.5);
  else if (t === "cotton") { n = noise(w, h, 2, 0.03, 1.2); const b = noise(w, h, 3, 0.045, 6); for (let i = 0; i < n.length; i++) n[i] += b[i]; }
  else { n = noise(w, h, 4, 0.06, 14, 1.2); const b = noise(w, h, 5, 0.03, 1); for (let i = 0; i < n.length; i++) n[i] += b[i]; }
  noiseCache.set(key, n); return n;
}

// where along a gradient print a point is (0 at from, 1 at end)
function paintT(p: Paint, xmm: number, ymm: number) {
  const dx = p.end[0] - p.from[0], dy = p.end[1] - p.from[1];
  return Math.min(1, Math.max(0, ((xmm - p.from[0]) * dx + (ymm - p.from[1]) * dy) / (dx * dx + dy * dy || 1)));
}

// ─── one face's maps ───
type FaceMaps = { map: THREE.DataTexture; normal: THREE.DataTexture; orm: THREE.DataTexture; coat: THREE.DataTexture; irid: THREE.DataTexture };
function tex(data: Uint8Array, w: number, h: number, red = false, srgb = false) {
  const t = new THREE.DataTexture(data, w, h, red ? THREE.RedFormat : THREE.RGBAFormat, THREE.UnsignedByteType);
  t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true;
  t.anisotropy = 8; t.unpackAlignment = 1;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true; return t;
}
function faceMaps(els: El[], masks: Mask[], H: Float32Array, stock: Stock, paperHex: string, w: number, h: number): FaceMaps {
  const N = w * h;
  const albedo = new Uint8Array(N * 4), nrm = new Uint8Array(N * 4), orm = new Uint8Array(N * 4), coat = new Uint8Array(N), irid = new Uint8Array(N);
  const paper = hex(paperHex), pr = PAPER_ROUGH[stock.coating];
  const grain = paperNoise(w, h, stock.texture);
  const inks = els.map((e) => hex(e.color ?? stock.ink)), tos = els.map((e) => (e.paint?.to ? hex(e.paint.to) : null));
  const foils = els.map((e) => (FOIL[e.surface] ? { ...FOIL[e.surface], rgb: hex(FOIL[e.surface].c) } : null));
  const Hb = blur(H, w, h, 6 * MM); // hollows go a little dark (light can't reach the bottom of a pressed letter)
  const rb = new THREE.Color();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, o = ((h - 1 - y) * w + x) * 4, j = (h - 1 - y) * w + x; // textures start at the bottom row
    const g = 1 + grain[i] * 0.08;
    let r = paper[0] * g, gg = paper[1] * g, b = paper[2] * g, rough = pr, metal = 0, cc = 0, ir = 0;
    for (let k = 0; k < els.length; k++) {
      let a = masks[k].a[i]; if (a <= 0.002) continue;
      const e = els[k], f = foils[k];
      let c: number[] | null = null, er = rough, em = 0, ec = 0, ei = 0;
      let t = 0;
      if (e.paint) { t = paintT(e.paint, x / PX, y / PX); a *= (e.paint.a0 ?? 1) + ((e.paint.a1 ?? 1) - (e.paint.a0 ?? 1)) * t; }
      if (e.surface === "ink") {
        c = inks[k]; const to = tos[k];
        if (to) c = [c[0] + (to[0] - c[0]) * t, c[1] + (to[1] - c[1]) * t, c[2] + (to[2] - c[2]) * t];
        er = stock.coating === "silk" ? 0.45 : pr;
      } else if (e.surface === "spot") { c = [r * 0.88, gg * 0.88, b * 0.88]; er = 0.12; ec = 1; }
      else if (f) {
        c = f.rgb; er = f.rough; em = f.metal; ec = f.coat;
        if (e.surface === "foil-holo") { // a faint rainbow in the foil itself; the iridescence does the rest as it turns
          rb.setHSL((((x + y * 0.6) / w) * 2.2) % 1, 0.55, 0.78);
          c = [c[0] * 0.55 + rb.r * 115, c[1] * 0.55 + rb.g * 115, c[2] * 0.55 + rb.b * 115]; ei = 1;
        }
      }
      if (c) { r += (c[0] - r) * a; gg += (c[1] - gg) * a; b += (c[2] - b) * a; }
      rough += (er - rough) * a; metal += (em - metal) * a; cc += (ec - cc) * a; ir += (ei - ir) * a;
    }
    albedo[o] = Math.min(255, r); albedo[o + 1] = Math.min(255, gg); albedo[o + 2] = Math.min(255, b); albedo[o + 3] = 255;
    // normal (tangent space: x right, y up the card); slopes are per 0.05 mm, so scale by the pixel size
    const hl = H[y * w + Math.max(0, x - 1)], hr = H[y * w + Math.min(w - 1, x + 1)];
    const hu = H[Math.max(0, y - 1) * w + x], hd = H[Math.min(h - 1, y + 1) * w + x];
    const nx = -(hr - hl) / MM, ny = (hd - hu) / MM, inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
    nrm[o] = (nx * inv * 0.5 + 0.5) * 255; nrm[o + 1] = (ny * inv * 0.5 + 0.5) * 255; nrm[o + 2] = (inv * 0.5 + 0.5) * 255; nrm[o + 3] = 255;
    const ao = 1 - Math.min(0.55, Math.max(0, Hb[i] - H[i]) * 0.45);
    orm[o] = ao * 255; orm[o + 1] = Math.min(1, Math.max(0.04, rough)) * 255; orm[o + 2] = metal * 255; orm[o + 3] = 255;
    coat[j] = cc * 255; irid[j] = ir * 255;
  }
  return { map: tex(albedo, w, h, false, true), normal: tex(nrm, w, h), orm: tex(orm, w, h), coat: tex(coat, w, h, true), irid: tex(irid, w, h, true) };
}

export type CardMaps = { front: FaceMaps; back: FaceMaps; w: number; h: number };
function buildCard(els: El[], stock: Stock, fonts: Fonts): CardMaps {
  const S = SIZES[stock.size], w = Math.round(S.w * PX), h = Math.round(S.h * PX);
  const faces = (["front", "back"] as const).map((face) => {
    const list = els.filter((e) => e.face === face);
    const masks = list.map((e) => maskOf(e, w, h, fonts));
    const rel = new Float32Array(w * h);
    list.forEach((e, k) => {
      if (e.press === "flat" && e.surface === "ink") return;
      const m = masks[k], halo = e.press === "deep-emboss" || e.press === "letterpress";
      for (let i = 0; i < rel.length; i++) if (halo || m.a[i] > 0.002) rel[i] += pressHeight(e.press, e.surface, m, i, w, h);
    });
    return { list, masks, rel: blur(rel, w, h, 1.5 * MM) }; // a hair of softening, so the pixel steps of the masks never show as ridges
  });
  const grain = paperNoise(w, h, stock.texture);
  const out = faces.map((f, k) => {
    const other = blur(mirror(faces[1 - k].rel, w, h), w, h, 4 * MM);
    const H = new Float32Array(w * h);
    // foil and varnish lie smooth over the paper's grain
    const glaze = new Float32Array(w * h);
    f.list.forEach((e, j) => { if (e.surface === "spot" || e.surface.startsWith("foil")) { const a = f.masks[j].a; for (let i = 0; i < a.length; i++) glaze[i] = Math.max(glaze[i], a[i]); } });
    for (let i = 0; i < H.length; i++) H[i] = f.rel[i] - other[i] * stock.through + grain[i] * (1 - glaze[i]);
    return faceMaps(f.list, f.masks, H, stock, k === 0 ? stock.paper : stock.back, w, h);
  });
  return { front: out[0], back: out[1], w, h };
}
function disposeMaps(m: CardMaps) { for (const f of [m.front, m.back]) for (const t of Object.values(f)) t.dispose(); }

// ─── the same card, flat and quick (for the wall and the face previews) ───
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
function foilStyle(ctx: CanvasRenderingContext2D, s: Surface, W: number, H: number) {
  const f = FOIL[s]; const c = hex(f.c); const g = ctx.createLinearGradient(0, 0, W, H);
  if (s === "foil-holo") { ["#f4d4ff", "#c9f1ff", "#fff3c4", "#d6dcff", "#ffd3e8"].forEach((x, i) => g.addColorStop(i / 4, x)); return g; }
  if (f.metal) { g.addColorStop(0, mix(c, [255, 255, 255], 0.5)); g.addColorStop(0.35, mix(c, [0, 0, 0], 0.28)); g.addColorStop(0.6, mix(c, [255, 255, 255], 0.35)); g.addColorStop(1, mix(c, [0, 0, 0], 0.2)); return g; }
  g.addColorStop(0, mix(c, [255, 255, 255], 0.35)); g.addColorStop(0.5, f.c); g.addColorStop(1, mix(c, [0, 0, 0], 0.08)); return g; // satin
}
const scratch: HTMLCanvasElement[] = [];
const scr = (i: number, w: number, h: number) => { const c = (scratch[i] ??= document.createElement("canvas")); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } const x = c.getContext("2d")!; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.clearRect(0, 0, w, h); return x; };
export function drawFlat(canvas: HTMLCanvasElement, els: El[], stock: Stock, face: "front" | "back", px: number, fonts: Fonts) {
  const S = SIZES[stock.size], W = Math.round(S.w * px), H = Math.round(S.h * px);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const paper = face === "front" ? stock.paper : stock.back;
  ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
  const o = Math.max(0.7, px * 0.12);
  for (const e of els.filter((x) => x.face === face)) {
    // the element's mask, then its colour inside it
    const m = scr(0, W, H); drawShapes(m, e.shapes, px, fonts);
    if (e.paint) { // the opacity ramp
      m.globalCompositeOperation = "destination-in";
      const g = m.createLinearGradient(e.paint.from[0] * px, e.paint.from[1] * px, e.paint.end[0] * px, e.paint.end[1] * px);
      g.addColorStop(0, `rgba(0,0,0,${e.paint.a0 ?? 1})`); g.addColorStop(1, `rgba(0,0,0,${e.paint.a1 ?? 1})`);
      m.fillStyle = g; m.fillRect(0, 0, W, H);
    }
    const tint = (i: number, style: string | CanvasGradient) => { const t = scr(i, W, H); t.drawImage(m.canvas, 0, 0); t.globalCompositeOperation = "source-in"; t.fillStyle = style; t.fillRect(0, 0, W, H); return t.canvas; };
    // a press shows as light and shade along the inside of the shape's edges: the shape less itself moved a little
    const edge = (i: number, style: string, dx: number, dy: number) => { const t = scr(i, W, H); t.drawImage(m.canvas, 0, 0); t.globalCompositeOperation = "destination-out"; t.drawImage(m.canvas, dx, dy); t.globalCompositeOperation = "source-in"; t.fillStyle = style; t.fillRect(0, 0, W, H); return t.canvas; };
    const raised = e.press.includes("emboss") || (e.press === "flat" && e.surface === "spot");
    const sunk = e.press.includes("deboss") || e.press === "letterpress" || (e.press === "flat" && e.surface.startsWith("foil"));
    const k = e.press === "deep-emboss" ? 2.2 : e.press.startsWith("chisel") ? 1.5 : 1;
    const dark = hex(paper).reduce((s, v) => s + v, 0) < 200;
    let style: string | CanvasGradient = paper;
    if (e.surface === "ink") {
      style = e.color ?? stock.ink;
      if (e.paint?.to) { const g = ctx.createLinearGradient(e.paint.from[0] * px, e.paint.from[1] * px, e.paint.end[0] * px, e.paint.end[1] * px); g.addColorStop(0, style); g.addColorStop(1, e.paint.to); style = g; }
    } else if (e.surface === "spot") style = mix(hex(paper), dark ? [255, 255, 255] : [0, 0, 0], dark ? 0.07 : 0.1);
    else if (FOIL[e.surface]) style = foilStyle(ctx, e.surface, W, H);
    if (e.surface !== "blind") ctx.drawImage(tint(3, style), 0, 0); // blind: no ink, only the press shows
    if (raised || sunk) {
      const d = o * k * (raised ? 1 : -1), lo = `rgba(0,0,0,${dark ? 0.75 : 0.32})`, hi = `rgba(255,255,255,${dark ? 0.22 : 0.8})`;
      ctx.drawImage(edge(1, hi, d, d), 0, 0); ctx.drawImage(edge(2, lo, -d, -d), 0, 0);
    }
  }
}

// ─── the card in 3D (units: mm, the group scaled down) ───
function cardShape(W: number, H: number, r: number) {
  const s = new THREE.Shape(), x0 = -W / 2, y0 = -H / 2, x1 = W / 2, y1 = H / 2;
  if (r <= 0) { s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.closePath(); return s; }
  s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - r); s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y1); s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r); s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}
function faceMaterial(m: FaceMaps, stock: Stock, relief: number) {
  return new THREE.MeshPhysicalMaterial({
    map: m.map, normalMap: m.normal, normalScale: new THREE.Vector2(relief, relief),
    aoMap: m.orm, aoMapIntensity: 1, roughnessMap: m.orm, metalnessMap: m.orm, roughness: 1, metalness: 1,
    clearcoat: 1, clearcoatMap: m.coat, clearcoatRoughness: 0.06,
    iridescence: 1, iridescenceMap: m.irid, iridescenceIOR: 1.6, iridescenceThicknessRange: [220, 880],
    sheen: stock.coating === "soft" ? 0.55 : 0, sheenRoughness: 0.75, sheenColor: new THREE.Color("#ffffff"),
  });
}

function Card({ maps, stock, relief, flip }: { maps: CardMaps; stock: Stock; relief: number; flip: number }) {
  const S = SIZES[stock.size], t = stock.thickness;
  const geo = useMemo(() => {
    const shape = cardShape(S.w, S.h, stock.corner);
    const face = new THREE.ShapeGeometry(shape, 16);
    const pos = face.attributes.position, uv = face.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + S.w / 2) / S.w, (pos.getY(i) + S.h / 2) / S.h);
    const side = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 16 });
    side.translate(0, 0, -t / 2);
    return { face, side };
  }, [S.w, S.h, stock.corner, t]);
  useEffect(() => () => { geo.face.dispose(); geo.side.dispose(); }, [geo]);
  const mats = useMemo(() => {
    const e = stock.edge, foil = e.startsWith("foil") ? FOIL[e] : null;
    const edge = new THREE.MeshPhysicalMaterial({ color: foil ? foil.c : e === "ink" ? stock.ink : e === "accent" ? stock.accent : stock.paper, metalness: foil ? 1 : 0, roughness: foil ? 0.25 : 0.85 });
    return { front: faceMaterial(maps.front, stock, relief), back: faceMaterial(maps.back, stock, relief), caps: new THREE.MeshBasicMaterial({ visible: false }), edge };
  }, [maps, stock, relief]);
  useEffect(() => () => { for (const m of Object.values(mats)) m.dispose(); }, [mats]);

  // turning it: drag sideways to spin, it settles face up or face down; double click (or tap) flips it; at rest it
  // leans toward the pointer, or sways a little
  const g = useRef<THREE.Group>(null);
  const st = useRef({ yaw: 0, vy: 0, ty: 0, pitch: 0, vp: 0, drag: false, lx: 0, ly: 0, lt: 0, hx: 0, hy: 0, hover: false, flip });
  const { gl } = useThree();
  useEffect(() => {
    const el = gl.domElement, s = st.current;
    const down = (e: PointerEvent) => { s.drag = true; s.lx = e.clientX; s.ly = e.clientY; s.lt = e.timeStamp; s.vy = 0; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.hx = ((e.clientX - r.left) / r.width) * 2 - 1; s.hy = ((e.clientY - r.top) / r.height) * 2 - 1; s.hover = e.pointerType === "mouse";
      if (!s.drag) return;
      const dx = e.clientX - s.lx, dy = e.clientY - s.ly, dt = Math.max(1, e.timeStamp - s.lt) / 1000;
      s.lx = e.clientX; s.ly = e.clientY; s.lt = e.timeStamp;
      s.yaw += dx * 0.011; s.vy = s.vy * 0.5 + ((dx * 0.011) / dt) * 0.5;
      s.pitch = Math.max(-0.6, Math.min(0.6, s.pitch + dy * 0.006)); s.vp = 0;
    };
    const up = () => { if (!s.drag) return; s.drag = false; s.ty = Math.round((s.yaw + s.vy * 0.2) / Math.PI) * Math.PI; };
    const leave = () => { s.hover = false; };
    const dbl = () => { s.ty = Math.round(s.ty / Math.PI) * Math.PI + Math.PI; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up); el.addEventListener("pointerleave", leave); el.addEventListener("dblclick", dbl);
    return () => {
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up); el.removeEventListener("pointerleave", leave); el.removeEventListener("dblclick", dbl);
    };
  }, [gl]);
  // flip: a counter (each change turns it over); an even/odd face request can be passed as a target instead
  useEffect(() => { const s = st.current; if (flip !== s.flip) { s.flip = flip; s.ty = Math.round(s.ty / Math.PI) * Math.PI + Math.PI; } }, [flip]);
  useFrame(({ clock }, delta) => {
    const s = st.current, T = clock.elapsedTime;
    let dt = Math.min(delta, 1 / 20);
    if (!s.drag) {
      const ty = s.ty + (s.hover ? s.hx * 0.3 : Math.sin(T * 0.6) * 0.09), tp = s.hover ? s.hy * 0.22 : Math.sin(T * 0.45) * 0.05;
      while (dt > 0) { // damped springs, in small steps so a slow frame can't overshoot
        const h = Math.min(dt, 1 / 120); dt -= h;
        s.vy += (90 * (ty - s.yaw) - 13 * s.vy) * h; s.yaw += s.vy * h;
        s.vp += (90 * (tp - s.pitch) - 13 * s.vp) * h; s.pitch += s.vp * h;
      }
    }
    g.current?.rotation.set(s.pitch, s.yaw, 0);
  });

  return (
    <group ref={g} scale={1 / 30}>
      <mesh geometry={geo.side} material={[mats.caps, mats.edge]} />
      <mesh geometry={geo.face} material={mats.front} position={[0, 0, t / 2]} />
      <mesh geometry={geo.face} material={mats.back} position={[0, 0, -t / 2]} rotation={[0, Math.PI, 0]} />
    </group>
  );
}

// the camera stands back far enough for the whole card (and a margin) to fit, on a narrow phone too; close up, it
// eases in so the presses and foils can be looked at properly
function Lens({ near }: { near: boolean }) {
  useFrame(({ camera, size }, dt) => {
    const fit = Math.max(5.2, 3.9 / (2 * Math.tan((15 * Math.PI) / 180) * (size.width / size.height)));
    camera.position.z += ((near ? fit * 0.52 : fit) - camera.position.z) * Math.min(1, dt * 6);
  });
  return null;
}

// the maps take a moment to make, so they are made after the page has painted, and the last card stays up meanwhile
function useCardMaps(els: El[], stock: Stock, fonts: Fonts | null) {
  const [maps, setMaps] = useState<CardMaps | null>(null);
  const [busy, setBusy] = useState(true);
  const key = JSON.stringify([els, { ...stock, edge: 0, corner: 0, thickness: 0, accent: 0 }]); // the parts the maps use
  useEffect(() => {
    if (!fonts) return;
    let gone = false;
    const a = setTimeout(() => { if (!gone) setBusy(true); }, 0);
    const t = setTimeout(() => {
      if (gone) return;
      const m = buildCard(els, stock, fonts);
      setMaps((old) => { if (old) setTimeout(() => disposeMaps(old), 500); return m; }); setBusy(false);
    }, 40);
    return () => { gone = true; clearTimeout(t); clearTimeout(a); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fonts, key]);
  return { maps, busy };
}

export function BusinessCard({ els, stock, relief = 1.6, flip = 0, near = false, className }: { els: El[]; stock: Stock; relief?: number; flip?: number; near?: boolean; className?: string }) {
  const fonts = useFonts();
  const { maps, busy } = useCardMaps(els, stock, fonts);
  return (
    <div className={className} style={{ touchAction: "pan-y", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 5.2], fov: 30 }} dpr={[1, 2]} onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping; gl.toneMappingExposure = 1.18; }}>
        <directionalLight position={[-3, 4, 4]} intensity={1.6} />
        <directionalLight position={[3, -1, 3]} intensity={0.35} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={4} position={[0, 4, 3]} scale={[8, 2, 1]} rotation-x={Math.PI / 3} />
          <Lightformer form="rect" intensity={2.5} color="#e6e9ff" position={[-5, 1, 2]} scale={[1.2, 6, 1]} rotation-y={Math.PI / 2.5} />
          <Lightformer form="rect" intensity={2} color="#c9d0ff" position={[5, 0, 2]} scale={[1.2, 6, 1]} rotation-y={-Math.PI / 2.5} />
          <Lightformer form="ring" intensity={1.5} position={[0, 0, 6]} scale={3} />
          <Lightformer form="rect" intensity={1.2} color="#687ef5" position={[0, -4, 1]} scale={[8, 1.5, 1]} rotation-x={-Math.PI / 3} />
        </Environment>
        <Lens near={near} />
        {maps && <Card maps={maps} stock={stock} relief={relief} flip={flip} />}
      </Canvas>
      <div aria-live="polite" className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1.5 text-[13px] text-white/80 backdrop-blur transition-opacity duration-300" style={{ opacity: busy ? 1 : 0 }}>Pressing the card</div>
    </div>
  );
}

// a flat face, drawn on a canvas (cheap enough for a wall of them)
export function FlatFace({ els, stock, face, px = 5, className }: { els: El[]; stock: Stock; face: "front" | "back"; px?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fonts = useFonts();
  const key = JSON.stringify([els, stock, face, px]);
  useEffect(() => { if (fonts && ref.current) drawFlat(ref.current, els, stock, face, px, fonts); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fonts, key]);
  return <canvas ref={ref} className={className} style={{ aspectRatio: `${SIZES[stock.size].w} / ${SIZES[stock.size].h}` }} />;
}
