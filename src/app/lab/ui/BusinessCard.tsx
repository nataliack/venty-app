"use client";
// Lab · Natalia's business card (25 Oct 2026). A real card you can turn in your hand: paper stock, thickness, corners and
// painted edges, and on each face a set of elements, each with a finish (ink, blind, spot gloss, seven foils) and a press
// (flat, emboss, chisel emboss, deep emboss, deboss, chisel deboss, letterpress). Nothing is a picture of a finish: every
// element is drawn as a mask at 20 px per mm (508 dpi), and the masks become the maps a physical material reads:
//   height  → normal map (the relief catches the light as the card turns), and an occlusion map (pressed hollows go dark)
//   finish  → colour, roughness and metal (foil), clear coat (spot gloss, black foil), iridescence (holographic foil)
// Chisel is a distance field (a straight bevel from the edge in, so thin strokes become ridges and big shapes keep a
// flat top); emboss and deboss are soft shoulders; letterpress is a crisp bite with a little squeezed-up lip. What is
// pressed into one face shows through, mirrored and softened, on the other, as on real paper.
// Approach from two open projects (ideas only, no code taken): KonradJam/business-card-viewer (AGPL-3.0: masks driving a
// clear coat map for spot UV, and a height map for emboss) and 1to1-Digital-Solutions/contact-card (MIT: an R3F card
// drawn on canvas at runtime, damped springs, flip on double tap).
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

export const PX = 20; // texture pixels per mm

export type Surface = "ink" | "blind" | "spot" | "foil-gold" | "foil-silver" | "foil-copper" | "foil-white" | "foil-black" | "foil-cornflower" | "foil-holo";
export type Press = "flat" | "emboss" | "chisel-emboss" | "deep-emboss" | "deboss" | "chisel-deboss" | "letterpress";
export const SURFACES: { k: Surface; name: string }[] = [
  { k: "ink", name: "Print" }, { k: "blind", name: "Blind (no ink)" }, { k: "spot", name: "Spot gloss" },
  { k: "foil-white", name: "White foil" }, { k: "foil-black", name: "Black foil" }, { k: "foil-silver", name: "Silver foil" },
  { k: "foil-gold", name: "Gold foil" }, { k: "foil-copper", name: "Copper foil" }, { k: "foil-cornflower", name: "Cornflower foil" },
  { k: "foil-holo", name: "Holographic foil" },
];
export const PRESSES: { k: Press; name: string }[] = [
  { k: "flat", name: "Flat" }, { k: "emboss", name: "Emboss" }, { k: "chisel-emboss", name: "Chisel emboss" }, { k: "deep-emboss", name: "Deep emboss" },
  { k: "deboss", name: "Deboss" }, { k: "chisel-deboss", name: "Chisel deboss" }, { k: "letterpress", name: "Letterpress" },
];

type Base = { id: string; name: string; face: "front" | "back"; surface: Surface; press: Press };
export type El = Base & (
  | { kind: "text"; text: string; x: number; y: number; size: number; weight?: number; align?: CanvasTextAlign; tracking?: number }
  | { kind: "art"; paths: string[]; x: number; y: number; w: number; flip?: boolean }
);
// x, y, size and w in mm from the card's top left; text y is the baseline

export type Edge = "paper" | "ink" | "cornflower" | "foil-gold" | "foil-silver";
export type Stock = {
  size: "au" | "eu" | "us";
  paper: string; // hex
  ink: string; // hex, the colour "Print" uses
  coating: "uncoated" | "silk" | "soft";
  texture: "smooth" | "cotton" | "felt";
  thickness: number; // mm
  corner: number; // mm
  edge: Edge;
  through: number; // how much of one face's press shows on the other, 0–1
};
export const SIZES = { au: { w: 90, h: 55, name: "90 × 55 (Australia)" }, eu: { w: 85, h: 55, name: "85 × 55 (Europe)" }, us: { w: 88.9, h: 50.8, name: "3.5 × 2 in (US)" } };

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

// ─── masks ───
type BB = { x: number; y: number; w: number; h: number };
const bbCache = new Map<string, BB>();
function bboxOf(paths: string[]) {
  const key = paths.join("|").slice(0, 400) + paths.length;
  const hit = bbCache.get(key); if (hit) return hit;
  const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg"), g = document.createElementNS(ns, "g");
  svg.setAttribute("style", "position:absolute;width:0;height:0;visibility:hidden");
  for (const d of paths) { const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); g.appendChild(p); }
  svg.appendChild(g); document.body.appendChild(svg);
  const b = g.getBBox(); svg.remove();
  const bb = { x: b.x, y: b.y, w: b.width, h: b.height }; bbCache.set(key, bb); return bb;
}
type Mask = { a: Float32Array; d: Float32Array; blurs: Map<number, Float32Array> };
const maskCache = new Map<string, Mask>();
function maskOf(el: El, w: number, h: number, font: string): Mask {
  const key = JSON.stringify({ ...el, surface: 0, press: 0, name: 0 }) + w + "x" + h + font; // the finish doesn't change the shape
  const hit = maskCache.get(key); if (hit) return hit;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  if (el.kind === "text") {
    ctx.font = `${el.weight ?? 400} ${el.size * PX}px ${font}`;
    ctx.textAlign = el.align ?? "left"; ctx.textBaseline = "alphabetic";
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${(el.tracking ?? 0) * el.size * PX}px`;
    ctx.fillText(el.text, el.x * PX, el.y * PX);
  } else {
    const bb = bboxOf(el.paths), s = (el.w * PX) / bb.w;
    ctx.translate(el.x * PX, el.y * PX);
    if (el.flip) { ctx.translate(el.w * PX, 0); ctx.scale(-1, 1); }
    ctx.scale(s, s); ctx.translate(-bb.x, -bb.y);
    for (const d of el.paths) ctx.fill(new Path2D(d));
  }
  const img = ctx.getImageData(0, 0, w, h).data, a = new Float32Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = img[i * 4 + 3] / 255;
  const m = { a, d: insideDist(a, w, h), blurs: new Map() };
  maskCache.set(key, m); return m;
}
const blurOf = (m: Mask, w: number, h: number, r: number) => { let b = m.blurs.get(r); if (!b) { b = blur(m.a, w, h, r); m.blurs.set(r, b); } return b; };

// the height (in 0.1 mm) a press gives one pixel
function pressHeight(p: Press, surface: Surface, m: Mask, i: number, w: number, h: number) {
  const d = m.d[i];
  switch (p) {
    case "emboss": return 2 * sm(d / 7);
    case "chisel-emboss": return 3 * Math.min(d, 14) / 14;
    case "deep-emboss": return 3.6 * (0.7 * sm(d / 16) + 0.3 * blurOf(m, w, h, 16)[i]);
    case "deboss": return -1.7 * sm(d / 6);
    case "chisel-deboss": return -3 * Math.min(d, 14) / 14;
    case "letterpress": return -1.3 * sm(d / 2) + 0.3 * Math.max(0, blurOf(m, w, h, 5)[i] - m.a[i]);
    case "flat":
      if (surface.startsWith("foil")) return -0.25 * sm(d / 1.5); // foil is stamped, so it sits a hair below the paper
      if (surface === "spot") return 0.15 * sm(d / 2); // a raised varnish
      return 0;
  }
}

const hex = (c: string) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const FOIL: Record<string, { c: string; rough: number; metal: number; coat: number }> = {
  "foil-gold": { c: "#f1cd84", rough: 0.24, metal: 1, coat: 0 },
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
  else if (t === "cotton") { n = noise(w, h, 2, 0.07, 1.2); const b = noise(w, h, 3, 0.1, 6); for (let i = 0; i < n.length; i++) n[i] += b[i]; }
  else { n = noise(w, h, 4, 0.12, 14, 1.2); const b = noise(w, h, 5, 0.07, 1); for (let i = 0; i < n.length; i++) n[i] += b[i]; }
  noiseCache.set(key, n); return n;
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
function faceMaps(els: El[], masks: Mask[], H: Float32Array, stock: Stock, w: number, h: number): FaceMaps {
  const N = w * h;
  const albedo = new Uint8Array(N * 4), nrm = new Uint8Array(N * 4), orm = new Uint8Array(N * 4), coat = new Uint8Array(N), irid = new Uint8Array(N);
  const paper = hex(stock.paper), ink = hex(stock.ink), pr = PAPER_ROUGH[stock.coating];
  const grain = paperNoise(w, h, stock.texture);
  const foils = els.map((e) => (FOIL[e.surface] ? { ...FOIL[e.surface], rgb: hex(FOIL[e.surface].c) } : null));
  // hollows go a little dark (light can't reach the bottom of a pressed letter)
  const Hb = blur(H, w, h, 6);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, o = ((h - 1 - y) * w + x) * 4, j = (h - 1 - y) * w + x; // textures start at the bottom row
    const g = 1 + grain[i] * (stock.texture === "smooth" ? 0.08 : 0.1);
    let r = paper[0] * g, gg = paper[1] * g, b = paper[2] * g, rough = pr, metal = 0, cc = 0, ir = 0;
    for (let k = 0; k < els.length; k++) {
      const a = masks[k].a[i]; if (a <= 0.002) continue;
      const e = els[k], f = foils[k];
      let c: number[] | null = null, er = rough, em = 0, ec = 0, ei = 0;
      if (e.surface === "ink") { c = ink; er = stock.coating === "silk" ? 0.45 : pr; }
      else if (e.surface === "spot") { c = [r * 0.9, gg * 0.9, b * 0.9]; er = 0.12; ec = 1; }
      else if (f) {
        c = f.rgb; er = f.rough; em = f.metal; ec = f.coat;
        if (e.surface === "foil-holo") { // a faint rainbow in the foil itself; the iridescence does the rest as it turns
          const hue = ((x + y * 0.6) / w) * 2.2 % 1, rb = new THREE.Color().setHSL(hue, 0.55, 0.78);
          c = [c[0] * 0.55 + rb.r * 255 * 0.45, c[1] * 0.55 + rb.g * 255 * 0.45, c[2] * 0.55 + rb.b * 255 * 0.45]; ei = 1;
        }
      }
      if (c) { r += (c[0] - r) * a; gg += (c[1] - gg) * a; b += (c[2] - b) * a; }
      rough += (er - rough) * a; metal += (em - metal) * a; cc += (ec - cc) * a; ir += (ei - ir) * a;
    }
    albedo[o] = Math.min(255, r); albedo[o + 1] = Math.min(255, gg); albedo[o + 2] = Math.min(255, b); albedo[o + 3] = 255;
    // normal (tangent space: x right, y up the card)
    const hl = H[y * w + Math.max(0, x - 1)], hr = H[y * w + Math.min(w - 1, x + 1)];
    const hu = H[Math.max(0, y - 1) * w + x], hd = H[Math.min(h - 1, y + 1) * w + x];
    const nx = -(hr - hl), ny = hd - hu, inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
    nrm[o] = (nx * inv * 0.5 + 0.5) * 255; nrm[o + 1] = (ny * inv * 0.5 + 0.5) * 255; nrm[o + 2] = (inv * 0.5 + 0.5) * 255; nrm[o + 3] = 255;
    const ao = 1 - Math.min(0.55, Math.max(0, Hb[i] - H[i]) * 0.45);
    orm[o] = ao * 255; orm[o + 1] = Math.min(1, Math.max(0.04, rough)) * 255; orm[o + 2] = metal * 255; orm[o + 3] = 255;
    coat[j] = cc * 255; irid[j] = ir * 255;
  }
  return { map: tex(albedo, w, h, false, true), normal: tex(nrm, w, h), orm: tex(orm, w, h), coat: tex(coat, w, h, true), irid: tex(irid, w, h, true) };
}

export type CardMaps = { front: FaceMaps; back: FaceMaps; w: number; h: number };
function buildCard(els: El[], stock: Stock, font: string): CardMaps {
  const S = SIZES[stock.size], w = Math.round(S.w * PX), h = Math.round(S.h * PX);
  const faces = (["front", "back"] as const).map((face) => {
    const list = els.filter((e) => e.face === face);
    const masks = list.map((e) => maskOf(e, w, h, font));
    const rel = new Float32Array(w * h);
    list.forEach((e, k) => { const m = masks[k]; for (let i = 0; i < rel.length; i++) if (m.a[i] > 0.002 || e.press === "deep-emboss" || e.press === "letterpress") rel[i] += pressHeight(e.press, e.surface, m, i, w, h); });
    return { list, masks, rel: blur(rel, w, h, 1.5) }; // a hair of softening, so the pixel steps of the masks never show as ridges
  });
  const grain = paperNoise(w, h, stock.texture);
  const out = faces.map((f, k) => {
    const other = blur(mirror(faces[1 - k].rel, w, h), w, h, 4);
    const H = new Float32Array(w * h);
    // foil and varnish lie smooth over the paper's grain
    const glaze = new Float32Array(w * h);
    f.list.forEach((e, j) => { if (e.surface === "spot" || e.surface.startsWith("foil")) { const a = f.masks[j].a; for (let i = 0; i < a.length; i++) glaze[i] = Math.max(glaze[i], a[i]); } });
    for (let i = 0; i < H.length; i++) H[i] = f.rel[i] - other[i] * stock.through + grain[i] * (1 - 0.85 * glaze[i]);
    return faceMaps(f.list, f.masks, H, stock, w, h);
  });
  return { front: out[0], back: out[1], w, h };
}
function disposeMaps(m: CardMaps) { for (const f of [m.front, m.back]) for (const t of Object.values(f)) t.dispose(); }

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
const EDGE: Record<Edge, { c?: string; metal: number; rough: number }> = {
  paper: { metal: 0, rough: 0.9 }, ink: { metal: 0, rough: 0.6 }, cornflower: { c: "#687ef5", metal: 0, rough: 0.7 },
  "foil-gold": { c: "#f1cd84", metal: 1, rough: 0.25 }, "foil-silver": { c: "#e3e7ee", metal: 1, rough: 0.2 },
};

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
    const e = EDGE[stock.edge];
    const edge = new THREE.MeshPhysicalMaterial({ color: e.c ?? (stock.edge === "ink" ? stock.ink : stock.paper), metalness: e.metal, roughness: e.rough });
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

// waits for the app's font (the canvas draws the type) and the card's SVG paths to measure
function useFont() {
  const [font, setFont] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const fam = getComputedStyle(document.body).fontFamily;
    Promise.all([400, 500].map((wt) => document.fonts.load(`${wt} 40px ${fam}`))).finally(() => { if (live) setFont(fam); });
    return () => { live = false; };
  }, []);
  return font;
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

export function BusinessCard({ els, stock, relief = 1.6, flip = 0, near = false, className }: { els: El[]; stock: Stock; relief?: number; flip?: number; near?: boolean; className?: string }) {
  const font = useFont();
  const key = JSON.stringify([els, { ...stock, edge: 0, corner: 0, thickness: 0 }]); // the parts of the stock the maps use
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maps = useMemo(() => (font ? buildCard(els, stock, font) : null), [font, key]);
  useEffect(() => () => { if (maps) disposeMaps(maps); }, [maps]);
  return (
    <div className={className} style={{ touchAction: "pan-y" }}>
      <Canvas camera={{ position: [0, 0, 5.2], fov: 30 }} dpr={[1, 2]} onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping; }}>
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
    </div>
  );
}
