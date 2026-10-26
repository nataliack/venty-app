"use client";
// Lab (MC 2): horizontal dividers for the brand website, to split the content. Very short, very wide: 2 to 32 px tall,
// full bleed. Each is drawn from something Venty already has: the measuring tape, a sewing pattern's marks, stitches,
// the fabric from Jose's films, the app's raised and pressed build, the three gradients, the mark. The switch shows
// them on Night, Snow, Paper or Crown. Nothing here is used by the app.
import { useId, useState, type ReactNode } from "react";
import { cx } from "@/components/ui";
import { LOGO } from "@/components/art";
import { Icon } from "@/components/icons";

type Tone = "night" | "snow" | "paper" | "crown";
const TONES: { k: Tone; name: string; bg: string; dark: boolean }[] = [
  { k: "night", name: "Night", bg: "#0b0c15", dark: true },
  { k: "snow", name: "Snow", bg: "#f0f4fe", dark: false },
  { k: "paper", name: "Paper", bg: "#f3f1ec", dark: false },
  { k: "crown", name: "Crown", bg: "#5a6c99", dark: true },
];
// the colours a divider draws with, for a dark or a light ground
type C = { dark: boolean; line: string; faint: string; strong: string; accent: string; deep: string; soft: string };
const ON_DARK: C = { dark: true, line: "rgb(255 255 255 / .22)", faint: "rgb(255 255 255 / .1)", strong: "#ffffff", accent: "#687ef5", deep: "#4f63e0", soft: "#8c9cf8" };
const ON_LIGHT: C = { dark: false, line: "rgb(19 21 35 / .2)", faint: "rgb(19 21 35 / .08)", strong: "#131523", accent: "#687ef5", deep: "#4f63e0", soft: "#4f63e0" };

const LONG = 3840; // drawn this long and clipped, so the divider reaches across any screen
const MARK = LOGO[4], MARK_BOX = { x: 207, y: 0, w: 1334, h: 797 };
const num = { fontFamily: "var(--font-num)", fontWeight: 700 } as const;

// ─── the measuring tape ───
function Tape({ c }: { c: C }) {
  const ticks = Array.from({ length: LONG / 8 }, (_, i) => i);
  return (
    <svg width={LONG} height={28} className="block" aria-hidden>
      <rect width={LONG} height={28} fill={c.accent} />
      <rect width={LONG} height={1} fill="rgb(255 255 255 / .35)" />
      {ticks.map((i) => <rect key={i} x={i * 8} y={0} width={1} height={i % 10 === 0 ? 12 : i % 5 === 0 ? 8 : 5} fill="rgb(255 255 255 / .85)" />)}
      {ticks.filter((i) => i % 10 === 0 && i > 0).map((i) => <text key={i} x={i * 8 + 3} y={24} fontSize={11} fill="#fff" style={num}>{i / 10}</text>)}
    </svg>
  );
}
function Ruler({ c }: { c: C }) {
  const ticks = Array.from({ length: LONG / 8 }, (_, i) => i);
  return (
    <svg width={LONG} height={22} className="block" aria-hidden>
      <rect y={21} width={LONG} height={1} fill={c.line} />
      {ticks.map((i) => <rect key={i} x={i * 8} y={i % 10 === 0 ? 7 : i % 5 === 0 ? 13 : 17} width={1} height={i % 10 === 0 ? 14 : i % 5 === 0 ? 8 : 4} fill={i % 10 === 0 ? c.strong : c.line} />)}
      {ticks.filter((i) => i % 10 === 0 && i > 0).map((i) => <text key={i} x={i * 8 + 3} y={11} fontSize={10} fill={c.strong} style={num}>{i / 10}</text>)}
    </svg>
  );
}
// the 3D body's tape: flat cornflower dashes running along
function TapeDashes({ c }: { c: C }) {
  return (
    <svg width="100%" height={4} className="block" aria-hidden>
      <line x1={0} y1={2} x2="100%" y2={2} stroke={c.accent} strokeWidth={3.5} strokeDasharray="14 9" strokeLinecap="round" className="motion-safe:animate-[dv-run_1.6s_linear_infinite]" />
    </svg>
  );
}
// a few of a body's measurements along the line
function Measures({ c }: { c: C }) {
  const m: [string, number][] = [["Height", 168], ["Bust", 88], ["Waist", 69], ["Hips", 95], ["Inside leg", 78], ["Neck", 34], ["Shoulder to wrist", 58], ["Thigh", 54]];
  return (
    <div className="relative flex h-6 items-end" aria-hidden>
      <span className="absolute inset-x-0 bottom-0 h-px" style={{ background: c.line }} />
      {m.map(([k, v]) => (
        <span key={k} className="relative flex flex-1 items-end gap-2 pb-1.5 pl-2 text-[11px] leading-none" style={{ color: c.dark ? "rgb(255 255 255 / .6)" : "rgb(19 21 35 / .6)" }}>
          <span className="absolute bottom-0 left-0 h-3 w-px" style={{ background: c.strong }} />
          {k}<span className="text-[13px]" style={{ ...num, color: c.strong }}>{v}</span>
        </span>
      ))}
    </div>
  );
}

// ─── a sewing pattern's marks ───
function Seam({ c }: { c: C }) {
  return (
    <svg width="100%" height={12} className="block" aria-hidden>
      <line x1={0} y1={1} x2="100%" y2={1} stroke={c.strong} strokeWidth={1.25} />
      <line x1={0} y1={10} x2="100%" y2={10} stroke={c.accent} strokeWidth={1} strokeDasharray="6 4" />
    </svg>
  );
}
function Notches({ c }: { c: C }) {
  const id = useId();
  return (
    <svg width="100%" height={12} className="block" aria-hidden>
      <defs><pattern id={id} width={240} height={12} patternUnits="userSpaceOnUse"><path d="M114 1 L120 11 L126 1Z" fill={c.strong} /></pattern></defs>
      <line x1={0} y1={1} x2="100%" y2={1} stroke={c.strong} strokeWidth={1.25} />
      <rect width="100%" height={12} fill={`url(#${id})`} />
    </svg>
  );
}
function Grainline({ c }: { c: C }) {
  return (
    <div className="relative flex h-4 items-center" aria-hidden>
      <svg width="12" height="16" className="shrink-0"><path d="M11 2 L2 8 L11 14" fill="none" stroke={c.strong} strokeWidth={1.25} strokeLinejoin="round" /></svg>
      <span className="h-[1.25px] flex-1" style={{ background: c.strong }} />
      <span className="px-4 text-[11px]" style={{ color: c.strong }}>Grainline</span>
      <span className="h-[1.25px] flex-1" style={{ background: c.strong }} />
      <svg width="12" height="16" className="shrink-0"><path d="M1 2 L10 8 L1 14" fill="none" stroke={c.strong} strokeWidth={1.25} strokeLinejoin="round" /></svg>
    </div>
  );
}
function CutHere({ c }: { c: C }) {
  return (
    <div className="relative flex h-6 items-center" aria-hidden>
      <span className="h-px w-[10%]" style={{ backgroundImage: `linear-gradient(90deg, ${c.strong} 60%, transparent 0)`, backgroundSize: "10px 1px" }} />
      <span className="px-3" style={{ color: c.strong }}><Icon name="scissors" size={20} /></span>
      <span className="h-px flex-1" style={{ backgroundImage: `linear-gradient(90deg, ${c.strong} 60%, transparent 0)`, backgroundSize: "10px 1px" }} />
    </div>
  );
}
// print at home: the marks where the A4 sheets meet, numbered
function Tiles({ c }: { c: C }) {
  return (
    <svg width={LONG} height={20} className="block" aria-hidden>
      <line x1={0} y1={10} x2={LONG} y2={10} stroke={c.line} strokeWidth={1} />
      {Array.from({ length: LONG / 297 }, (_, i) => (i + 1) * 297).map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={10} r={6} fill="none" stroke={c.strong} strokeWidth={1} />
          <line x1={x - 10} y1={10} x2={x + 10} y2={10} stroke={c.strong} strokeWidth={1} /><line x1={x} y1={0} x2={x} y2={20} stroke={c.strong} strokeWidth={1} />
          <text x={x - 150} y={14} fontSize={11} textAnchor="middle" fill={c.strong} style={num}>{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}
function Pins({ c }: { c: C }) {
  const id = useId();
  return (
    <svg width="100%" height={16} className="block" aria-hidden>
      <defs><pattern id={id} width={220} height={16} patternUnits="userSpaceOnUse"><line x1={104} y1={12} x2={122} y2={3} stroke={c.dark ? "rgb(255 255 255 / .7)" : "rgb(19 21 35 / .55)"} strokeWidth={1.2} strokeLinecap="round" /><circle cx={102} cy={13} r={2.8} fill={c.accent} /></pattern></defs>
      <line x1={0} y1={8} x2="100%" y2={8} stroke={c.line} />
      <rect width="100%" height={16} fill={`url(#${id})`} />
    </svg>
  );
}

// ─── stitches ───
function Running({ c }: { c: C }) {
  return <svg width="100%" height={6} className="block" aria-hidden><line x1={3} y1={3} x2="100%" y2={3} stroke={c.soft} strokeWidth={2.2} strokeDasharray="12 8" strokeLinecap="round" /></svg>;
}
function Zigzag({ c }: { c: C }) {
  const id = useId();
  return (
    <svg width="100%" height={10} className="block" aria-hidden>
      <defs><pattern id={id} width={12} height={10} patternUnits="userSpaceOnUse"><path d="M0 9 L6 1 L12 9" fill="none" stroke={c.soft} strokeWidth={1.3} strokeLinejoin="round" /></pattern></defs>
      <rect width="100%" height={10} fill={`url(#${id})`} />
    </svg>
  );
}
function Blanket({ c }: { c: C }) {
  const id = useId();
  return (
    <svg width="100%" height={12} className="block" aria-hidden>
      <defs><pattern id={id} width={14} height={12} patternUnits="userSpaceOnUse"><line x1={7} y1={1} x2={7} y2={11} stroke={c.soft} strokeWidth={1.3} strokeLinecap="round" /></pattern></defs>
      <line x1={0} y1={11} x2="100%" y2={11} stroke={c.soft} strokeWidth={1.3} />
      <rect width="100%" height={12} fill={`url(#${id})`} />
    </svg>
  );
}
// the edge of a bolt of fabric: pinholes and its printed name
function Selvedge({ c }: { c: C }) {
  const words = "Venty  ·  Cornflower 687EF5  ·  Drafted to your measurements  ·  ";
  return (
    <div className="relative h-[18px] overflow-hidden" aria-hidden style={{ background: c.dark ? "rgb(104 126 245 / .16)" : "rgb(104 126 245 / .12)" }}>
      <span className="absolute inset-x-0 top-[3px] h-[3px]" style={{ backgroundImage: `radial-gradient(${c.dark ? "rgb(255 255 255 / .55)" : "rgb(19 21 35 / .4)"} 1px, transparent 1.3px)`, backgroundSize: "9px 3px" }} />
      <p className="absolute left-0 top-[7px] whitespace-nowrap text-[9px] leading-none" style={{ color: c.dark ? "rgb(255 255 255 / .7)" : c.deep }}>{words.repeat(40)}</p>
    </div>
  );
}

// ─── fabric, from the films ───
function Ribbon({ c }: { c: C }) {
  const id = useId();
  const P = 360, wave = (o: number, a: number) => Array.from({ length: 9 }, (_, i) => `${(i * P) / 8} ${14 + o + a * Math.sin((i / 8) * Math.PI * 2)}`);
  const top = wave(-5, 6), bot = wave(5, 4).reverse();
  return (
    <svg width="100%" height={28} className="block" aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="24"><stop offset="0" stopColor="#b4bdf9" /><stop offset=".45" stopColor={c.accent} /><stop offset="1" stopColor={c.deep} /></linearGradient>
        <pattern id={id} width={P} height={28} patternUnits="userSpaceOnUse"><path d={`M${top.join(" L")} L${bot.join(" L")}Z`} fill={`url(#${id}g)`} opacity={0.85} /></pattern>
      </defs>
      <rect width="100%" height={28} fill={`url(#${id})`} />
    </svg>
  );
}
// a strip of fabric turning over on itself: each half-turn shows the other face, the front cornflower, the back paler
function Twist({ c }: { c: C }) {
  const id = useId(), P = 420, n = 12;
  const lobe = (x0: number) => {
    const pts = (s: number) => Array.from({ length: n + 1 }, (_, i) => `${x0 + (i * P) / 2 / n} ${16 + s * 11 * Math.sin((i / n) * Math.PI)}`);
    return `M${pts(1).join(" L")} L${pts(-1).reverse().join(" L")}Z`;
  };
  return (
    <svg width="100%" height={32} className="block" aria-hidden>
      <defs><pattern id={id} width={P} height={32} patternUnits="userSpaceOnUse">
        <path d={lobe(0)} fill={c.accent} opacity={0.85} />
        <path d={lobe(P / 2)} fill={c.dark ? "#b4bdf9" : "#c3cbfa"} opacity={0.55} />
        <path d={lobe(0)} fill="none" stroke={c.dark ? "rgb(255 255 255 / .55)" : c.deep} strokeOpacity={0.6} strokeWidth={1} />
        <path d={lobe(P / 2)} fill="none" stroke={c.soft} strokeWidth={1} />
      </pattern></defs>
      <rect width="100%" height={32} fill={`url(#${id})`} />
    </svg>
  );
}
// a hem: the fold catching the light
function Hem({ c }: { c: C }) {
  return (
    <div className="h-3" aria-hidden style={{ background: c.dark ? "linear-gradient(180deg, rgb(255 255 255 / .16), rgb(104 126 245 / .22) 45%, rgb(0 0 0 / .35))" : "linear-gradient(180deg, #fff, rgb(104 126 245 / .25) 50%, rgb(19 21 35 / .16))", boxShadow: c.dark ? "inset 0 1px 0 rgb(255 255 255 / .35)" : "inset 0 1px 0 #fff, 0 1px 0 rgb(19 21 35 / .06)" }} />
  );
}
// a thread, loose, with its knot
function Thread({ c }: { c: C }) {
  return (
    <svg width="100%" height={20} viewBox="0 0 1600 20" preserveAspectRatio="none" className="block" aria-hidden>
      <path d="M0 12 C 260 2, 420 18, 700 10 S 1180 4, 1560 11" fill="none" stroke={c.soft} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
      <circle cx={1566} cy={11} r={3.2} fill={c.soft} />
    </svg>
  );
}

// ─── the app's build: pressed in, raised out ───
const PRESS = "inset 0 2px 4px rgb(0 0 0 / .6), inset 0 1px 1px rgb(0 0 0 / .5), 0 1px 0 rgb(255 255 255 / .07)";
const PRESS_LIGHT = "inset 0 2px 4px rgb(19 21 35 / .16), inset 0 1px 1px rgb(19 21 35 / .12), 0 1px 0 #fff";
function Groove({ c }: { c: C }) { return <div className="h-2 rounded-full" aria-hidden style={{ background: c.dark ? "linear-gradient(180deg, #121320, #171823)" : "#e6eaf6", boxShadow: c.dark ? PRESS : PRESS_LIGHT }} />; }
function Ridge({ c }: { c: C }) { return <div className="h-[6px] rounded-full" aria-hidden style={c.dark ? { background: "linear-gradient(180deg, #2e3040, #1e2030)", boxShadow: "0 3px 6px rgb(0 0 0 / .55), inset 0 1px 0 rgb(255 255 255 / .22), inset 0 -1px 0 rgb(0 0 0 / .45)" } : { background: "#f0f4fe", boxShadow: "inset 0 1px 0 #fff, inset 0 -1px 0 rgb(19 21 35 / .1), 0 2px 5px -1px rgb(19 21 35 / .22)" }} />; }
// the look switch's track, the knob resting in it
function Track({ c }: { c: C }) {
  return (
    <div className="relative h-[14px] rounded-full" aria-hidden style={{ background: c.dark ? "linear-gradient(180deg, #121320, #171823)" : "#e6eaf6", boxShadow: c.dark ? PRESS : PRESS_LIGHT }}>
      <span className="absolute inset-y-[3px] left-[38%] w-[120px] rounded-full motion-safe:animate-[dv-slide_9s_ease-in-out_infinite_alternate]" style={{ background: "linear-gradient(180deg, #7387f6, #687ef5 55%, #6479f2)", boxShadow: "inset 0 1px 0 rgb(255 255 255 / .5), 0 2px 5px rgb(0 0 0 / .35)" }} />
    </div>
  );
}
// a row of the dark page's dots, every sixth lit
function Dots({ c }: { c: C }) {
  return <div className="h-[6px]" aria-hidden style={{ backgroundImage: `radial-gradient(${c.accent} 1.6px, transparent 2px), radial-gradient(${c.dark ? "rgb(255 255 255 / .28)" : "rgb(19 21 35 / .25)"} 1.2px, transparent 1.6px)`, backgroundSize: "96px 6px, 16px 6px", backgroundPosition: "40px 0, 0 0" }} />;
}
function GraphStrip({ c }: { c: C }) {
  return <div className="h-6" aria-hidden style={{ backgroundImage: `linear-gradient(90deg, rgb(104 126 245 / ${c.dark ? ".45" : ".3"}) 1px, transparent 1px), linear-gradient(90deg, rgb(104 126 245 / ${c.dark ? ".2" : ".14"}) 1px, transparent 1px), linear-gradient(0deg, rgb(104 126 245 / .3) 1px, transparent 1px), linear-gradient(180deg, rgb(104 126 245 / .3) 1px, transparent 1px)`, backgroundSize: "96px 24px, 24px 24px, 100% 24px, 100% 24px" }} />;
}

// ─── light: the three gradients, pressed thin ───
function CrownSliver() {
  return (
    <div className="relative h-[3px]" aria-hidden>
      <span className="absolute inset-x-0 -top-3 h-7 blur-[10px]" style={{ background: "radial-gradient(40% 50% at 50% 50%, rgb(180 189 217 / .55), transparent 70%)" }} />
      <span className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(90deg, transparent, #7988b8 18%, #b4bdd9 50%, #687ef5 76%, transparent)" }} />
    </div>
  );
}
function HazeLine() {
  return <div className="h-[2px]" aria-hidden style={{ background: "linear-gradient(90deg, #c0c8db, #8c9cf8 30%, #687ef5 70%, #6073e6)" }} />;
}
// Edge: a soft cornflower glow roaming a line on night
function EdgeGlow({ c }: { c: C }) {
  return (
    <div className="relative h-6 overflow-hidden" aria-hidden>
      <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: c.faint }} />
      <span className="absolute top-1/2 h-6 w-[38%] -translate-y-1/2 motion-safe:animate-[dv-roam_11s_ease-in-out_infinite_alternate]" style={{ background: "radial-gradient(50% 50% at 50% 50%, rgb(104 126 245 / .65), rgb(79 99 224 / .2) 45%, transparent 72%)" }} />
      <span className="absolute top-1/2 h-px w-[38%] -translate-y-1/2 motion-safe:animate-[dv-roam_11s_ease-in-out_infinite_alternate]" style={{ background: "linear-gradient(90deg, transparent, #8c9cf8, transparent)" }} />
    </div>
  );
}

// ─── the mark ───
function MarkRule({ c }: { c: C }) {
  return (
    <div className="flex h-8 items-center gap-6" aria-hidden>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${c.line})` }} />
      <svg viewBox={`${MARK_BOX.x} ${MARK_BOX.y} ${MARK_BOX.w} ${MARK_BOX.h}`} className="h-[22px] w-auto shrink-0"><path d={MARK} fill={c.accent} /></svg>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${c.line}, transparent)` }} />
    </div>
  );
}
// the mark in flight: small, repeating, rising and falling
function Flight({ c }: { c: C }) {
  const id = useId(), w = 22, h = (w * MARK_BOX.h) / MARK_BOX.w, s = w / MARK_BOX.w;
  return (
    <svg width="100%" height={18} className="block" aria-hidden>
      <defs><pattern id={id} width={176} height={18} patternUnits="userSpaceOnUse">
        {[0, 1, 2, 3].map((i) => <path key={i} d={MARK} fill={i === 1 ? c.accent : c.dark ? "rgb(255 255 255 / .35)" : "rgb(19 21 35 / .25)"} transform={`translate(${i * 44 + 11 - MARK_BOX.x * s} ${(i % 2 ? 1 : 18 - h - 1) - MARK_BOX.y * s}) scale(${s})`} />)}
      </pattern></defs>
      <rect width="100%" height={18} fill={`url(#${id})`} />
    </svg>
  );
}
// the mark drawn as its outline, stretched into a hairline either side
function MarkStitched({ c }: { c: C }) {
  return (
    <div className="flex h-8 items-center" aria-hidden>
      <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: c.soft }} />
      <svg viewBox={`${MARK_BOX.x - 20} ${MARK_BOX.y - 20} ${MARK_BOX.w + 40} ${MARK_BOX.h + 40}`} className="mx-5 h-[26px] w-auto shrink-0"><path d={MARK} fill="none" stroke={c.soft} strokeWidth={34} strokeDasharray="60 44" strokeLinecap="round" /></svg>
      <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: c.soft }} />
    </div>
  );
}

// ─── the page ───
type Def = { k: string; name: string; h: number; note: string; D: (p: { c: C }) => ReactNode };
const GROUPS: { title: string; items: Def[] }[] = [
  { title: "Measuring", items: [
    { k: "tape", name: "Tape", h: 28, note: "The tape measure itself: cornflower, white ticks every 8 px, its numbers in Bigilla.", D: Tape },
    { k: "ruler", name: "Ruler", h: 22, note: "Just the scale: ticks and Bigilla numbers on the page.", D: Ruler },
    { k: "tape-run", name: "Tape round the body", h: 4, note: "The 3D body’s tape, flat cornflower dashes running along. Still with reduced motion.", D: TapeDashes },
    { k: "measures", name: "Measurements", h: 24, note: "A body’s measurements set out along the line, each on its tick.", D: Measures },
  ] },
  { title: "Pattern marks", items: [
    { k: "seam", name: "Cut line and seam", h: 12, note: "A pattern piece’s edge: the cut line, and the seam allowance dashed inside it.", D: Seam },
    { k: "notches", name: "Notches", h: 12, note: "The cut line with the little triangles that line two pieces up.", D: Notches },
    { k: "grain", name: "Grainline", h: 16, note: "The grainline, named in the middle.", D: Grainline },
    { k: "cut", name: "Cut here", h: 24, note: "A dashed line and the app’s scissors.", D: CutHere },
    { k: "tiles", name: "A4 tiles", h: 20, note: "Print at home: where the sheets meet, each numbered.", D: Tiles },
    { k: "pins", name: "Pins", h: 16, note: "Pinned along the line, cornflower heads.", D: Pins },
  ] },
  { title: "Stitches", items: [
    { k: "running", name: "Running stitch", h: 6, note: "Long stitches in thread periwinkle.", D: Running },
    { k: "zigzag", name: "Zigzag", h: 10, note: "The stitch that finishes a raw edge.", D: Zigzag },
    { k: "blanket", name: "Blanket stitch", h: 12, note: "A row of upright stitches along the edge.", D: Blanket },
    { k: "selvedge", name: "Selvedge", h: 18, note: "The edge of a bolt of fabric: pinholes and its printed name.", D: Selvedge },
  ] },
  { title: "Fabric", items: [
    { k: "ribbon", name: "Ribbon", h: 28, note: "The fabric from the films, a long cornflower wave.", D: Ribbon },
    { k: "twist", name: "Twist", h: 32, note: "A strip of fabric turning over on itself.", D: Twist },
    { k: "hem", name: "Hem", h: 12, note: "A folded hem catching the light.", D: Hem },
    { k: "thread", name: "Loose thread", h: 20, note: "One thread drifting across, its knot at the end.", D: Thread },
  ] },
  { title: "Raised and pressed", items: [
    { k: "groove", name: "Groove", h: 8, note: "Pressed into the page, like the ruler’s track.", D: Groove },
    { k: "ridge", name: "Ridge", h: 6, note: "Raised out of it, like the switch’s knob.", D: Ridge },
    { k: "track", name: "Track and knob", h: 14, note: "The look switch’s track with its cornflower knob drifting along it.", D: Track },
    { k: "dots", name: "Dots", h: 6, note: "One row of the dark page’s dots, every sixth one lit.", D: Dots },
    { k: "graph", name: "Graph paper", h: 24, note: "One row of the light top’s graph paper.", D: GraphStrip },
  ] },
  { title: "Light", items: [
    { k: "crown", name: "Crown", h: 3, note: "Crown pressed to a sliver, its light blooming at the middle.", D: () => <CrownSliver /> },
    { k: "haze", name: "Haze", h: 2, note: "Haze as a hairline.", D: () => <HazeLine /> },
    { k: "edge", name: "Edge", h: 24, note: "Edge’s cornflower glow roaming a faint line.", D: EdgeGlow },
  ] },
  { title: "The mark", items: [
    { k: "mark", name: "Mark", h: 32, note: "The mark, with a hairline fading out either side.", D: MarkRule },
    { k: "flight", name: "Flight", h: 18, note: "The mark small and repeating, rising and falling.", D: Flight },
    { k: "stitched", name: "Stitched mark", h: 32, note: "The mark’s outline sewn in running stitch, the stitching carrying on either side.", D: MarkStitched },
  ] },
];

export default function Dividers() {
  const [tone, setTone] = useState<Tone>("night");
  const t = TONES.find((x) => x.k === tone)!, c = t.dark ? ON_DARK : ON_LIGHT;
  const count = GROUPS.reduce((n, g) => n + g.items.length, 0);
  return (
    // the app pins html and body, so the page scrolls in its own layer
    <main className={cx("fixed inset-0 overflow-y-auto pb-32 transition-colors duration-300", t.dark ? "text-white" : "text-ink")} style={{ background: t.bg }}>
      <style>{`@keyframes dv-run { to { stroke-dashoffset: -23; } } @keyframes dv-slide { from { left: 6%; } to { left: 82%; } } @keyframes dv-roam { from { left: -10%; } to { left: 72%; } }`}</style>
      {tone === "crown" && <img src="/lab/mc2/brand/crown.webp" alt="" className="pointer-events-none fixed inset-0 h-full w-full object-cover" />}
      <div className="relative">
        <header className="flex flex-wrap items-end justify-between gap-6 px-5 pt-10 md:px-12">
          <div>
            <h1 className="text-[40px] leading-none tracking-[-.04em] md:text-[56px]">Dividers</h1>
            <p className={cx("mt-3 max-w-[560px] text-[16px] leading-snug", t.dark ? "text-white/65" : "text-ink/60")}>{count} horizontal dividers for the brand website, 2 to 32 px tall and as wide as the screen. Each one is made from something Venty already has.</p>
          </div>
          <div role="radiogroup" aria-label="Background" className={cx("flex rounded-full p-1", t.dark ? "bg-white/10" : "bg-ink/[.06]")}>
            {TONES.map((x) => (
              <button key={x.k} role="radio" aria-checked={tone === x.k} onClick={() => setTone(x.k)} className={cx("h-10 rounded-full px-4 text-[14px] transition-colors", tone === x.k ? (t.dark ? "bg-white text-ink" : "bg-ink text-white") : t.dark ? "text-white/70" : "text-ink/60")}>{x.name}</button>
            ))}
          </div>
        </header>
        {GROUPS.map((g) => (
          <section key={g.title} className="mt-16">
            <h2 className="px-5 text-[26px] tracking-[-.03em] md:px-12">{g.title}</h2>
            {g.items.map(({ k, name, h, note, D }) => (
              <figure key={k} className="mt-10">
                <figcaption className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 md:px-12">
                  <span className="text-[17px]">{name}</span>
                  <span className={cx("text-[13px] tabular-nums", t.dark ? "text-white/45" : "text-ink/45")}>{h} px tall</span>
                  <span className={cx("text-[14px]", t.dark ? "text-white/55" : "text-ink/55")}>{note}</span>
                </figcaption>
                {/* full bleed: the divider runs edge to edge, as it will on the site */}
                <div className="mt-4 overflow-hidden" style={{ height: h }}><D c={c} /></div>
              </figure>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
