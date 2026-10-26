"use client";
// The brand system's building blocks: a 1920 × 1080 slide, its folio, the logo's parts, the palette with its values
// worked out from the hex, and the app's own patterns. Every value here comes from the app (globals.css, the design
// rules in docs/VENTY_CONTEXT.md) or from Jose's files; nothing is invented.
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/ui";
import { LOGO } from "@/components/art";

export const W = 1920, H = 1080;
export const ASSET = "/lab/mc2/brand";

// ─── the logo: five shapes in a 2132 × 1786 box. Paths 0 to 3 are the wordmark, path 4 the mark ───
export const LOGO_BOX = { w: 2132, h: 1786 };
export const MARK_BOX = { x: 207, y: 0, w: 1334, h: 797 }; // measured from path 4
export const WORD_BOX = { x: 0, y: 667, w: 2132, h: 1119 }; // the wordmark, from the V's top to the y's tail
export const BASELINE = 1500, CAP_TOP = 667, X_TOP = 972, DESC = 1786; // measured from the letters' paths

export function Logo({ part = "full", color = "#fff", className, style }: { part?: "full" | "mark" | "word"; color?: string; className?: string; style?: CSSProperties }) {
  const box = part === "mark" ? MARK_BOX : part === "word" ? WORD_BOX : { x: 0, y: 0, ...LOGO_BOX };
  const paths = part === "mark" ? [LOGO[4]] : part === "word" ? LOGO.slice(0, 4) : LOGO;
  return (
    <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} className={className} style={style} role="img" aria-label={part === "mark" ? "The Venty mark" : "Venty"}>
      {paths.map((d, i) => <path key={i} d={d} fill={color} />)}
    </svg>
  );
}

// the points a path is drawn through: anchors, and the two handles of each curve (absolute commands only, as the logo is)
export type Pt = { x: number; y: number };
export function pathPoints(d: string) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const anchors: Pt[] = [], handles: [Pt, Pt][] = [];
  let c = "", args: number[] = [], x = 0, y = 0;
  const need: Record<string, number> = { M: 2, L: 2, C: 6, H: 1, V: 1, Z: 0 };
  for (const t of toks) {
    if (/[a-zA-Z]/.test(t)) { c = t; continue; }
    args.push(+t);
    if (args.length < need[c]) continue;
    if (c === "M" || c === "L") { x = args[0]; y = args[1]; }
    else if (c === "H") x = args[0];
    else if (c === "V") y = args[0];
    // a curve's two handles: one leaves the anchor before it, the other arrives at its own anchor
    else if (c === "C") { handles.push([{ x, y }, { x: args[0], y: args[1] }], [{ x: args[2], y: args[3] }, { x: args[4], y: args[5] }]); x = args[4]; y = args[5]; }
    anchors.push({ x, y });
    args = [];
    if (c === "M") c = "L";
  }
  return { anchors, handles };
}

// ─── colour: the hex, and what it is in RGB, HSL and CMYK, and its contrast with white and with night ───
export const hexRgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const rgbHsl = ([r, g, b]: number[]) => {
  const R = r / 255, G = g / 255, B = b / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, Math.round(l * 100)];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [Math.round((h * 60 + 360) % 360), Math.round(s * 100), Math.round(l * 100)];
};
export const rgbCmyk = ([r, g, b]: number[]) => {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k >= 1) return [0, 0, 0, 100];
  return [r, g, b].map((v) => Math.round(((1 - v / 255 - k) / (1 - k)) * 100)).concat(Math.round(k * 100));
};
const lum = ([r, g, b]: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
export const contrast = (a: string, b: string) => { const x = lum(hexRgb(a)), y = lum(hexRgb(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

export type Colour = { name: string; hex: string; role?: string; dark?: boolean };
// the palette agreed with Santiago (design rules), with the surfaces the app is built on. Roles only where the app
// uses the colour that way.
export const BLUES: Colour[] = [
  { name: "Cornflower", hex: "#687EF5", role: "The primary. The filled button, the measuring tape, every chosen check." },
  { name: "Indigo", hex: "#4F63E0", role: "The deep light inside Crown and Haze.", dark: true },
  { name: "Peri", hex: "#8C9CF8", role: "Highlights on night: the rim light on the 3D body, the estimate marks." },
  { name: "Lavender", hex: "#A0ABCA" },
  { name: "Mist", hex: "#C1C8D9" },
  { name: "Snow", hex: "#F0F4FE", role: "The light surface: chosen cards, the white buttons." },
];
export const SURFACES: Colour[] = [
  { name: "Night", hex: "#0B0C15", role: "The screen. Every working screen starts here.", dark: true },
  { name: "Ink", hex: "#131523", role: "The 3D body's stage, and text on light.", dark: true },
  { name: "Card", hex: "#1B1C26", role: "The one fill for every dark card, option and tile.", dark: true },
  { name: "Slate", hex: "#3C4B63", dark: true },
  { name: "Denim", hex: "#4D5E85", role: "The Denim app icon.", dark: true },
  { name: "Paper", hex: "#F3F1EC", role: "The moments: starting, a body ready, a pattern complete." },
];
export const MANNEQUIN = "#B0C3D4"; // the 3D body's default look (LOOKS.venty)

// ─── the app's own patterns, at their real proportions ───
export const NIGHT_DOTS: CSSProperties = { backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1px, transparent 1.2px)", backgroundSize: "16px 16px" };
export const PAPER_DOTS: CSSProperties = { backgroundImage: "radial-gradient(rgb(11 12 21 / .2) 1px, transparent 1.3px)", backgroundSize: "18px 18px" };
export const GRAPH: CSSProperties = {
  backgroundImage: "linear-gradient(0deg, rgb(104 126 245 / .12) 1px, transparent 1px), linear-gradient(90deg, rgb(104 126 245 / .12) 1px, transparent 1px), linear-gradient(0deg, rgb(104 126 245 / .06) 1px, transparent 1px), linear-gradient(90deg, rgb(104 126 245 / .06) 1px, transparent 1px)",
  backgroundSize: "96px 96px, 96px 96px, 24px 24px, 24px 24px",
};
export const PRIMARY_DOTS: CSSProperties = {
  backgroundImage: "radial-gradient(rgb(255 255 255 / .16) .8px, transparent 1.1px), linear-gradient(180deg, #7387f6, #687ef5 55%, #6479f2)",
  backgroundSize: "5px 5px, 100% 100%",
};

// ─── a slide: 1920 × 1080, its background, and a folio along the foot ───
export type Tone = "dark" | "light";
export function Slide({ id, name, tone = "dark", bg = "#0b0c15", image, pattern, children, folio = true, className }: {
  id: string; name: string; tone?: Tone; bg?: string; image?: string; pattern?: CSSProperties; children: ReactNode; folio?: boolean; className?: string;
}) {
  return (
    <section id={id} data-slide={id} aria-label={name} className={cx("relative isolate overflow-hidden", tone === "light" ? "text-ink" : "text-white", className)} style={{ width: W, height: H, background: bg }}>
      {/* drawn first, so everything after sits on it (a negative z-index failed to paint under zoom) */}
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
      {pattern && <div className="absolute inset-0" style={pattern} />}
      {children}
      {folio && <Folio name={name} tone={tone} />}
    </section>
  );
}
export function Folio({ name, tone }: { name: string; tone: Tone }) {
  const c = tone === "light" ? "text-ink/45" : "text-white/45";
  return (
    <div className={cx("absolute inset-x-[96px] bottom-[52px] flex items-center justify-between text-[22px]", c)}>
      <Logo part="word" color="currentColor" className="h-[30px] w-auto" />
      <span>{name}</span>
      <span>Brand system, 2026</span>
    </div>
  );
}

// a slide's title: Regular 400, tight, as the app's headings are
export const Title = ({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
  <h2 className={cx("font-normal leading-[.92] tracking-[-.045em] [text-wrap:balance]", className)} style={style}>{children}</h2>
);
// a small label over a value or a paragraph: sentence case, never uppercase and spaced out
export const Label = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx("text-[22px] leading-tight opacity-55", className)}>{children}</p>;
export const Num = ({ children, className }: { children: ReactNode; className?: string }) => <span className={cx("font-serif font-bold", className)}>{children}</span>;
