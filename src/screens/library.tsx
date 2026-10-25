"use client";
/* eslint-disable @next/next/no-img-element */
// The pattern library (25 Oct 2026, the "Lookbook", chosen in the lab /lab/mc2). Two tabs:
// - Your patterns: tall photo cards you swipe (or a grid by month), Create beside the title, then a row of tools under
//   the tabs (Search and Filter and sort on the left; Edit and carousel or grid on the right). With none yet, one snow
//   card with three looks spilling over it: "If you can imagine it, you can wear it."
// - Patterns to make: Search and Filter beside the title, the kinds as pressed photo tiles, then a row per kind (or a
//   grid once narrowed). Scrolled past the kinds, a slim bar with the two tabs and the kinds is pinned to the top; in the
//   grid of your own, the tabs alone.
// Cards are trays in the dark secondary's build: a card-colour rim softly lit from the top, the photo pressed into it,
// the words on the rim below; one fixed frame per size so names and lines never shift a card. The photos are stand-ins
// (the sign-up looks and details, the tour's meadow) until the real ones are made: LOOK below is the one place to swap.
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, type Pattern } from "@/lib/store";
import { TEMPLATES, CATEGORIES, fitName, type Category, type GarmentKey } from "@/lib/data";
import { Screen, H1, Pill, Sheet, SheetHead, Segmented, cx, useDesk, useToast } from "@/components/ui";
import { Flat } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";
import { TabBar, useCreateActions, specOf, statusLine } from "./home";

type Tpl = (typeof TEMPLATES)[number];
const TABS = ["Your patterns", "Patterns to make"];

// ─── stand-in pictures ───
const P = {
  green: "/auth/look-street-green.webp", mauve: "/auth/look-limo-mauve.webp", rust: "/auth/look-cliff-rust.webp", burgundy: "/auth/look-street-burgundy.webp",
  zip: "/auth/detail-zip.webp", corset: "/auth/detail-corset.webp", hems: "/auth/detail-hems.webp", bows: "/auth/detail-bows.webp", meadow: "/tour/meadow-640.webp",
};
export const LOOK: Record<GarmentKey, string> = {
  slip: P.mauve, wrap: P.green, aline: P.rust, flutter: P.green, cami: P.corset, tee: P.burgundy, shirt: P.bows,
  wideleg: P.hems, straight: P.zip, biasskirt: P.rust, mini: P.burgundy,
};
export const KIND_PIC: Record<string, string> = { All: P.meadow, Dresses: P.green, Tops: P.corset, Trousers: P.hems, Skirts: P.rust };
const FAN = [P.rust, P.green, P.mauve];
export const CAT: Record<Category, string> = { Dresses: "Dresses", Tops: "Tops", Pants: "Trousers", Skirts: "Skirts" };
export const KINDS = ["All", ...CATEGORIES.map((c) => CAT[c])];
const kindOfG = (g: GarmentKey) => CAT[TEMPLATES.find((t) => t.key === g)?.category ?? "Dresses"];
export const byKind = (k: string) => TEMPLATES.filter((t) => k === "All" || CAT[t.category] === k);
const LEVEL_N: Record<string, number> = { Easy: 1, Intermediate: 2, Hard: 3 };
const STATUS_DOT: Record<Pattern["status"], string> = { Printed: "bg-primary", Fitting: "bg-peri", Draft: "bg-white/40" };
const STATUSES = ["Draft", "Ready to print", "Printed"] as const;
const STATUS_OF: Record<Pattern["status"], (typeof STATUSES)[number]> = { Draft: "Draft", Fitting: "Ready to print", Printed: "Printed" };
const FITS = ["Tight", "Relaxed", "Loose", "Oversized"] as const;
const KIND_LIST = ["Dresses", "Tops", "Trousers", "Skirts"] as const;
export const LEVELS_ = ["Easy", "Intermediate", "Hard"] as const;
export const PIECES_ = ["Up to 3", "4 to 6", "7 or more"] as const;
export const piecesIn = (n: number, p: string) => (p === "Up to 3" ? n <= 3 : p === "4 to 6" ? n >= 4 && n <= 6 : n >= 7);
const SORTS = ["Newest first", "Oldest first", "A to Z"] as const;
// when a pattern was made: new ids are "n" + the time in base 36; older ones (seeds) have none
const madeAt = (p: Pattern) => (p.id.startsWith("n") ? parseInt(p.id.slice(1), 36) : NaN);
const monthOf = (p: Pattern) => {
  const t = madeAt(p);
  if (!Number.isFinite(t)) return "Earlier";
  const d = new Date(t), now = new Date();
  return d.toLocaleString("en-AU", d.getFullYear() === now.getFullYear() ? { month: "long" } : { month: "long", year: "numeric" });
};

// ─── the builds ───
// the dark tray: the dark secondary's build (.rb, .pill-dark) for the rim, the inset tiles' (.iconbadge) for what is in it
const PRESS = "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .07)";
const RIM: CSSProperties = { background: "linear-gradient(180deg, rgb(255 255 255 / .035), rgb(255 255 255 / 0) 50%) var(--color-card)", boxShadow: "0 18px 36px -16px rgb(0 0 0 / .8), 0 2px 4px rgb(0 0 0 / .35), inset 0 0 0 1px rgb(255 255 255 / .07), inset 0 1px 0 rgb(255 255 255 / .1), inset 0 -1px 0 rgb(0 0 0 / .35)" };
const TILE: CSSProperties = { background: "rgb(0 0 0 / .26)", boxShadow: "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .06), 0 1px 0 rgb(255 255 255 / .07)" };
// the snow tray (PatternTray's), for the first-pattern card only
const PRESS_LIGHT = "inset 0 3px 8px rgb(28 36 84 / .34), inset 0 1px 2px rgb(28 36 84 / .3), inset 0 -1px 0 rgb(255 255 255 / .7)";
const RIM_LIGHT: CSSProperties = { background: "linear-gradient(180deg, #ffffff, #e7eaf3)", boxShadow: "0 18px 36px -16px rgb(0 0 0 / .7), 0 2px 4px rgb(0 0 0 / .3), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .2)" };

export const Img = ({ src, className }: { src: string; className?: string }) => <img src={src} alt="" draggable={false} className={cx("absolute inset-0 h-full w-full object-cover", className)} />;
const Sunk = () => <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESS }} />;
const Dot = ({ s }: { s: Pattern["status"] }) => <span className={cx("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[s])} />;
// difficulty as three small bars (as on a pattern envelope), then the word; one line that never wraps
export const Lvl = ({ t }: { t: Tpl }) => (
  <span className="flex items-center gap-2 text-[13px] text-white/55">
    <span className="flex items-end gap-[2px]" aria-hidden>{[1, 2, 3].map((k) => <span key={k} className={cx("w-[3px] rounded-full", k <= LEVEL_N[t.level] ? "bg-peri" : "bg-white/20")} style={{ height: 4 + k * 3 }} />)}</span>
    {t.level}
  </span>
);
// where it stands: the full line on a tall card, two or three words on a small one
const StatusLine = ({ p, short }: { p: Pattern; short?: boolean }) => (
  <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-white/55"><Dot s={p.status} /><span className="truncate">{short ? STATUS_OF[p.status] : statusLine(p)}</span></span>
);
export const Count = ({ n }: { n: number }) => <><span className="tabular-nums">{n}</span> {n === 1 ? "pattern" : "patterns"}</>;
// a section title with how many, which shows them all
const SectionHead = ({ title, n, onAll }: { title: string; n: number; onAll: () => void }) => (
  <div className="flex items-baseline justify-between px-6 lg:px-0">
    <h2 className="text-[20px] tracking-[-.02em]">{title}</h2>
    <button onClick={onAll} aria-label={`See all ${n}`} className="flex items-center gap-0.5 text-[15px] text-white/45"><span className="tabular-nums">{n}</span><Icon name="chevR" size={16} /></button>
  </div>
);

// ─── choosing patterns (Edit): the photo's top-right corner is cut away, so the card's rim rises there as a lifted
//     corner (its inner corner rounded, curving into the photo's edges on both sides, its shadow falling on the photo),
//     and a box sits in it: an outline to tap, periwinkle with a tick once chosen. box: the cut's side; f: the curve
//     where it meets the photo's edges; rb: its inner corner; sq: the box ───
type Pick = { on: boolean; toggle: () => void };
const CORNER = { s: { box: 36, f: 8, rb: 15, sq: 22, sqr: 7, pad: 5 }, l: { box: 48, f: 10, rb: 19, sq: 26, sqr: 8, pad: 7 } };
const cornerPath = (k: keyof typeof CORNER) => {
  const { box, f, rb } = CORNER[k], S = box + f, B = box;
  return `M${f} 0H${S}V${B}H${f + rb}A${rb} ${rb} 0 0 1 ${f} ${B - rb}Z M0 0H${f}V${f}A${f} ${f} 0 0 0 0 0Z M${S - f} ${B}H${S}V${S}A${f} ${f} 0 0 0 ${S - f} ${B}Z`;
};
function cornerMask(k: keyof typeof CORNER, open: boolean): CSSProperties {
  const S = CORNER[k].box + CORNER[k].f;
  const svg = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${S}' height='${S}'><path d='${cornerPath(k)}'/></svg>`)}")`;
  const size = open ? `${S}px ${S}px, 100% 100%` : "0px 0px, 100% 100%";
  return {
    WebkitMaskImage: `${svg}, linear-gradient(#000, #000)`, maskImage: `${svg}, linear-gradient(#000, #000)`,
    WebkitMaskComposite: "xor", maskComposite: "exclude", WebkitMaskPosition: "top right, 0 0", maskPosition: "top right, 0 0",
    WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskSize: size, maskSize: size,
    transition: "mask-size .32s cubic-bezier(.2,.8,.2,1), -webkit-mask-size .32s cubic-bezier(.2,.8,.2,1)",
  };
}
// drawn inside the photo, so the cut takes it away and only what falls on the photo shows
const CornerShade = ({ k, open }: { k: keyof typeof CORNER; open: boolean }) => {
  const S = CORNER[k].box + CORNER[k].f;
  return (
    <svg width={S} height={S} className={cx("pointer-events-none absolute right-0 top-0 overflow-visible transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} aria-hidden>
      <path d={cornerPath(k)} transform="translate(-1 2.5)" fill="#000" opacity={0.75} style={{ filter: "blur(3.5px)" }} />
    </svg>
  );
};
function PickBox({ k, pick }: { k: keyof typeof CORNER; pick?: Pick }) {
  const { box, sq, sqr, pad } = CORNER[k];
  const at = (box + pad - sq) / 2;
  return (
    <AnimatePresence>
      {pick && (
        <motion.span key="box" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.25, delay: 0.08 }}
          className={cx("pointer-events-none absolute grid place-items-center transition-colors duration-200", pick.on && "icon-primary text-white")}
          style={{ top: at, right: at, width: sq, height: sq, borderRadius: sqr, ...(pick.on ? {} : { boxShadow: "inset 0 0 0 1.5px rgb(255 255 255 / .5)" }) }}>
          {pick.on && <Icon name="check" size={sq * 0.55} strokeWidth={3} />}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ─── cards: one frame for every small card (a photo of a fixed height, then exactly two lines of a fixed height) ───
const ROW_W = 150, ROW_H = 188, GRID_H = 206, TALL_H = 400, BAND = 72;
export function Frame({ w, imgH, pic, name, line, onClick, pick }: { w?: number; imgH: number; pic: ReactNode; name: string; line: ReactNode; onClick?: () => void; pick?: Pick }) {
  return (
    <button onClick={pick ? pick.toggle : onClick} aria-pressed={pick ? pick.on : undefined} className="tap relative block shrink-0 snap-start rounded-[22px] p-[5px] text-left" style={{ width: w, ...RIM }}>
      <span className="relative block overflow-hidden rounded-[18px]" style={{ height: imgH, ...cornerMask("s", !!pick) }}>{pic}<Sunk /><CornerShade k="s" open={!!pick} /></span>
      <PickBox k="s" pick={pick} />
      <span className="block px-[7px] pb-[7px] pt-[9px]">
        <span className="block truncate text-[15px] leading-[18px]">{name}</span>
        <span className="mt-[5px] flex h-4 items-center overflow-hidden whitespace-nowrap">{line}</span>
      </span>
    </button>
  );
}
export const MadeMark = ({ made }: { made?: Pattern }) => made ? (
  <><span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg/80 to-transparent" /><span className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[12px] text-white/90"><Dot s={made.status} />You made this</span></>
) : null;
function TallCard({ p, onClick, pick }: { p: Pattern; onClick: () => void; pick?: Pick }) {
  return (
    <button onClick={pick ? pick.toggle : onClick} aria-pressed={pick ? pick.on : undefined} className="tap relative flex shrink-0 snap-start flex-col rounded-[30px] p-[7px] text-left" style={{ width: 284, height: TALL_H, ...RIM }}>
      <span className="relative block min-h-0 flex-1 overflow-hidden rounded-[25px]" style={cornerMask("l", !!pick)}><Img src={LOOK[p.garment]} /><Sunk /><CornerShade k="l" open={!!pick} /></span>
      <PickBox k="l" pick={pick} />
      <span className="flex shrink-0 items-center gap-3 px-2" style={{ height: BAND - 7 }}>
        {/* the pattern itself, small, pressed into the rim: the photo is the look, this is what was drafted */}
        <span className="grid h-[50px] w-[42px] shrink-0 place-items-center rounded-[12px]" style={TILE}><Flat g={p.garment} size={30} stroke="rgb(193 200 230 / .75)" fill="transparent" /></span>
        <span className="min-w-0">
          <span className="block truncate text-[18px] leading-tight tracking-[-.01em]">{p.name}</span>
          <span className="mt-1 block"><StatusLine p={p} /></span>
        </span>
      </span>
    </button>
  );
}

// ─── with no patterns yet: the snow card alone, three looks rising over its top and sides. The middle one (176 × 232)
//     is big enough to hide the inner bottom corners of the two beside it (150 × 200, turned 10°: those corners sit 13px
//     either side of the middle and 208px down). The words are centred in the room under the looks, broken by hand ───
function FirstCard({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative mx-6 mt-[58px] h-[420px] rounded-[30px] lg:mx-0 lg:max-w-[440px]" style={RIM_LIGHT}>
      <div className="absolute inset-x-0 top-[-34px]">
        {FAN.map((src, i) => (
          <span key={src} className="absolute left-1/2 top-0 overflow-hidden rounded-[16px] shadow-[0_16px_30px_-12px_rgb(0_0_0/.7)]"
            style={{ width: i === 1 ? 176 : 150, height: i === 1 ? 232 : 200, transform: `translateX(calc(-50% + ${(i - 1) * 104}px)) translateY(${i === 1 ? 0 : 22}px) rotate(${(i - 1) * 10}deg)`, zIndex: i === 1 ? 2 : 1 }}>
            <Img src={src} />
          </span>
        ))}
      </div>
      <div className="absolute inset-x-5 bottom-5 top-[214px] flex flex-col items-center justify-center text-center">
        <p className="text-[24px] leading-[1.12] tracking-[-.025em] text-ink">If you can imagine it,<br />you can wear it.</p>
        <p className="mt-2 text-[15px] leading-snug text-slate">A photo, a sketch or a few words,<br />drafted to your measurements.</p>
        <Pill className="mt-4" onClick={onCreate}>Create a pattern</Pill>
      </div>
    </div>
  );
}

// ─── the kinds: square photos pressed into the page (the app's icon tiles), the chosen one on a snow card ───
export const PressedPhoto = ({ k, size, r, light }: { k: string; size: number; r: number; light?: boolean }) => (
  <span className="relative block shrink-0 overflow-hidden" style={{ width: size, height: size, borderRadius: r }}>
    <Img src={KIND_PIC[k]} /><span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: light ? PRESS_LIGHT : PRESS }} />
  </span>
);
export function KindTiles({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  return (
    <div className="noscroll flex gap-1.5 overflow-x-auto px-5 lg:px-0">
      {KINDS.map((k) => {
        const on = k === value;
        return (
          <button key={k} onClick={() => onChange(k)} aria-pressed={on} className={cx("flex w-[67px] shrink-0 flex-col items-center gap-2 rounded-[20px] pb-2.5 pt-[5px] transition-colors duration-300", on && "bg-snow")}>
            <PressedPhoto k={k} size={57} r={15} light={on} />
            <span className={cx("text-[13px] leading-none", on ? "font-medium text-ink" : "text-white/60")}>{k}</span>
          </button>
        );
      })}
    </div>
  );
}
// the bars pinned once you scroll (phones): the two tabs, slim, and on Patterns to make the kinds as pills. They start
// under the status bar
function MiniTabs({ active, onTab }: { active: string; onTab: (v: string) => void }) {
  return (
    <div className="glass relative mx-6 flex h-9 rounded-full p-[3px]">
      {TABS.map((t) => (
        <button key={t} onClick={() => onTab(t)} className="relative z-10 flex-1 rounded-full text-[13px] font-medium">
          {t === active && <span className="absolute inset-0 -z-10 rounded-full bg-white" />}
          <span className={t === active ? "font-semibold text-bg" : "text-white/70"}>{t}</span>
        </button>
      ))}
    </div>
  );
}
export const PINNED = "absolute inset-x-0 top-0 z-30 border-b border-white/8 bg-bg pb-3";
export const pinIn = { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.25 } };

// ─── the tools ───
export function ToolBtn({ icon, label, n, onClick }: { icon: IconName; label: string; n?: number; onClick: () => void }) {
  return (
    <span className="relative shrink-0">
      <button onClick={onClick} aria-label={n ? `${label}, ${n} on` : label} className="rb !h-10 !w-10"><Icon name={icon} size={18} /></button>
      {!!n && <span className="pointer-events-none absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold tabular-nums text-white shadow-[0_0_0_2px_var(--color-bg)]">{n}</span>}
    </span>
  );
}
// search, once its button is tapped: the field takes the row, with Cancel to put it away
export function SearchOpen({ q, setQ, placeholder, onCancel }: { q: string; setQ: (q: string) => void; placeholder: string; onCancel: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex h-11 items-center gap-3">
      <label className="ruler-track flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-4 text-white/45">
        <Icon name="search" size={17} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/40" />
        {q && <button onClick={() => setQ("")} aria-label="Clear the search" className="grid h-6 w-6 place-items-center rounded-full text-white/55"><Icon name="close" size={15} /></button>}
      </label>
      <button onClick={onCancel} className="h-11 shrink-0 text-[15px] font-medium text-white/80">Cancel</button>
    </motion.div>
  );
}
// carousel or grid: two icons in a pressed track, the chosen one raised out of it (the look switch's knob)
function ViewSlider({ grid, setGrid }: { grid: boolean; setGrid: (g: boolean) => void }) {
  const id = useId();
  return (
    <span className="ruler-track flex h-10 items-center rounded-full p-1" role="radiogroup" aria-label="Show as">
      {[false, true].map((g) => (
        <button key={String(g)} role="radio" aria-checked={grid === g} aria-label={g ? "Grid" : "Carousel"} onClick={() => setGrid(g)} className={cx("relative grid h-8 w-11 place-items-center rounded-full transition-colors", grid === g ? "text-white" : "text-white/45")}>
          {grid === g && <motion.span layoutId={`libview${id}`} className="knob absolute inset-0 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
          <Icon name={g ? "grid" : "columns"} size={16} className="relative" />
        </button>
      ))}
    </span>
  );
}
// what is on, each removable (only shown when something is on)
export const OnChips = ({ items, onClear }: { items: { k: string; off: () => void }[]; onClear: () => void }) => items.length ? (
  <div className="noscroll mt-3 flex items-center gap-2 overflow-x-auto px-6 lg:px-0">
    {items.map((x) => <button key={x.k} onClick={x.off} className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-snow pl-3 pr-2 text-[13px] font-medium text-ink">{x.k}<Icon name="close" size={13} /></button>)}
    <button onClick={onClear} className="h-8 shrink-0 px-2 text-[13px] font-medium text-white/60">Clear all</button>
  </div>
) : null;
// a choice in a sheet: snow when on, like a chosen card
const Choice = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} aria-pressed={on} className={cx("h-10 shrink-0 rounded-full px-4 text-[15px] transition-colors", on ? "bg-snow font-medium text-ink" : "pill-dark text-white/80")}>{children}</button>
);
export function Group({ title, items, value, onChange }: { title: string; items: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mt-6">
      <div className="text-[15px] text-white/60">{title}</div>
      <div className="mt-2.5 flex flex-wrap gap-2">{items.map((it) => <Choice key={it} on={value.includes(it)} onClick={() => onChange(value.includes(it) ? value.filter((x) => x !== it) : [...value, it])}>{it}</Choice>)}</div>
    </div>
  );
}
export const SheetFooter = ({ n, onClear, onShow, canClear }: { n: number; onClear: () => void; onShow: () => void; canClear: boolean }) => (
  <div className="mt-8 flex items-center gap-4">
    <button onClick={onClear} disabled={!canClear} className={cx("h-14 shrink-0 px-2 text-[15px] font-medium transition-opacity", canClear ? "text-white/80" : "text-white/30")}>Clear all</button>
    <Pill className="flex-1" onClick={onShow}>{n === 0 ? "Nothing matches" : <>Show <Count n={n} /></>}</Pill>
  </div>
);
const Row = ({ children }: { children: ReactNode }) => (
  // a horizontal scroller clips whatever spills out of it, so it has room below for the cards' shadows (taken back after)
  <div className="noscroll -mb-5 mt-1 flex snap-x snap-mandatory scroll-px-6 items-start gap-3 overflow-x-auto px-6 pb-8 pt-2 lg:px-0">{children}</div>
);
const Nothing = ({ onClear }: { onClear: () => void }) => (
  <div className="mt-10 px-6 text-center">
    <p className="text-[17px]">No patterns match</p>
    <button onClick={onClear} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
  </div>
);

export function Patterns({ p }: { p?: Record<string, unknown> }) {
  const { go, patterns, removePatterns } = useApp();
  const desk = useDesk();
  const create = useCreateActions()[0];
  const { toast, node: toastNode } = useToast();
  const [view, setView] = useState(p?.view === "ready" ? TABS[1] : TABS[0]);
  const make = view === TABS[1];
  // Patterns to make: kind, search, level and pieces
  const [cat, setCat] = useState("All");
  const [mq, setMq] = useState("");
  const [lv, setLv] = useState<string[]>([]);
  const [pc, setPc] = useState<string[]>([]);
  // Your patterns: search, status (the profile's Printed tile opens it on Printed), kind, fit, the order, carousel or grid
  const [q, setQ] = useState("");
  const [st, setSt] = useState<string[]>(p?.filter === "Printed" ? ["Printed"] : []);
  const [kd, setKd] = useState<string[]>([]);
  const [ft, setFt] = useState<string[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest first");
  const [grid, setGrid] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sheet, setSheet] = useState<null | "filter" | "mfilter" | "delete">(null);
  // Edit: choosing patterns to delete
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const stopPicking = () => { setPicking(false); setPicked([]); };
  const pickOf = (id: string): Pick | undefined => (picking ? { on: picked.includes(id), toggle: () => setPicked((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id])) } : undefined);

  let mine = patterns.filter((x) => (!st.length || st.includes(STATUS_OF[x.status])) && (!kd.length || kd.includes(kindOfG(x.garment))) && (!ft.length || ft.includes(fitName(specOf(x).ease)))
    && (!q.trim() || x.name.toLowerCase().includes(q.trim().toLowerCase())));
  if (sort === "Oldest first") mine = [...mine].reverse();
  if (sort === "A to Z") mine = [...mine].sort((a, b) => a.name.localeCompare(b.name));
  const months = sort === "A to Z" ? [""] : [...new Set(mine.map(monthOf))];
  const on = [...st.map((x) => ({ k: x, off: () => setSt(st.filter((y) => y !== x)) })), ...kd.map((x) => ({ k: x, off: () => setKd(kd.filter((y) => y !== x)) })), ...ft.map((x) => ({ k: `${x} fit`, off: () => setFt(ft.filter((y) => y !== x)) }))];
  const clearMine = () => { setSt([]); setKd([]); setFt([]); };
  const looking = on.length > 0 || !!q.trim();
  const madeOf = (g: GarmentKey) => patterns.find((x) => x.garment === g);
  const tpls = TEMPLATES.filter((t) => (cat === "All" || CAT[t.category] === cat) && (!lv.length || lv.includes(t.level)) && (!pc.length || pc.some((x) => piecesIn(t.pieces, x))) && (!mq.trim() || t.name.toLowerCase().includes(mq.trim().toLowerCase())));
  const mOn = [...lv.map((x) => ({ k: x, off: () => setLv(lv.filter((y) => y !== x)) })), ...pc.map((x) => ({ k: `${x} pieces`, off: () => setPc(pc.filter((y) => y !== x)) }))];
  const narrowed = cat !== "All" || mOn.length > 0 || !!mq.trim();
  const has = patterns.length > 0;
  const allPicked = mine.length > 0 && mine.every((x) => picked.includes(x.id));

  // the bars pinned on scroll (phones only): found from the screen's own scroller
  const anchor = useRef<HTMLDivElement>(null);
  const kinds = useRef<HTMLDivElement>(null);
  const toolRow = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<null | "kinds" | "tabs">(null);
  useEffect(() => {
    const sc = anchor.current?.closest(".scroller");
    if (!sc || desk) { setBar(null); return; }
    const check = () => {
      const top = sc.getBoundingClientRect().top;
      const k = kinds.current?.getBoundingClientRect(), t = toolRow.current?.getBoundingClientRect();
      if (make && k) setBar(k.bottom - top < 100 ? "kinds" : null);
      else if (!make && grid && !picking && t) setBar(t.bottom - top < 100 ? "tabs" : null);
      else setBar(null);
    };
    check();
    sc.addEventListener("scroll", check, { passive: true });
    return () => sc.removeEventListener("scroll", check);
  }, [make, grid, picking, desk, has]);
  const goTab = (v: string) => {
    setView(v); setBar(null); setSearching(false); stopPicking();
    anchor.current?.closest(".scroller")?.scrollTo({ top: 0 });
  };
  const remove = () => {
    const n = picked.length;
    removePatterns(picked); setSheet(null); stopPicking();
    toast(n === 1 ? "Pattern deleted" : `${n} patterns deleted`);
  };
  const cancelSearch = () => { setSearching(false); if (make) setMq(""); else setQ(""); };
  const search = <SearchOpen q={make ? mq : q} setQ={make ? setMq : setQ} placeholder={make ? "Search patterns to make" : "Search your patterns"} onCancel={cancelSearch} />;
  const btns = <>
    <ToolBtn icon="search" label="Search" onClick={() => setSearching(true)} />
    <ToolBtn icon="sliders" label={make ? "Filter" : "Filter and sort"} n={make ? mOn.length : on.length} onClick={() => setSheet(make ? "mfilter" : "filter")} />
  </>;

  // while choosing, Cancel and Delete take the tab bar's place
  const footer = picking ? (
    <div className="flex items-center gap-3 pb-1">
      <Pill variant="dark" className="flex-1" onClick={stopPicking}>Cancel</Pill>
      <Pill className={cx("flex-1", !picked.length && "is-off")} onClick={() => picked.length && setSheet("delete")} icon={<Icon name="trash" size={18} />}>{picked.length ? `Delete ${picked.length}` : "Delete"}</Pill>
    </div>
  ) : desk ? undefined : <TabBar tab="patterns" />;

  const pinned = (
    <AnimatePresence>
      {bar === "kinds" && (
        <motion.div key="kinds" {...pinIn} className={PINNED} style={{ paddingTop: "var(--top)" }}>
          <MiniTabs active={TABS[1]} onTab={goTab} />
          <div className="noscroll mt-2.5 flex gap-2 overflow-x-auto px-6">
            {KINDS.map((k) => (
              <button key={k} onClick={() => setCat(k)} className={cx("flex h-10 shrink-0 items-center gap-2 rounded-full pl-[5px] pr-4 text-[14px] transition-colors", k === cat ? "bg-snow font-medium text-ink" : "bg-card text-white/75")}>
                <PressedPhoto k={k} size={30} r={15} light={k === cat} />{k}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      {bar === "tabs" && <motion.div key="tabs" {...pinIn} className={PINNED} style={{ paddingTop: "var(--top)" }}><MiniTabs active={TABS[0]} onTab={goTab} /></motion.div>}
    </AnimatePresence>
  );

  return (
    <Screen dock={!picking} noPad bg={pinned} footer={footer}>
      <div ref={anchor} className="px-6 pt-1 lg:px-0 lg:pt-2">
        {make && searching ? search : (
          <div className="flex min-h-11 items-center justify-between gap-3">
            <H1 className="min-w-0">Pattern library</H1>
            <span className="flex shrink-0 items-center gap-2">
              {!make && has && !picking && <Pill className="!h-10 !w-auto gap-1.5 px-4 !text-[15px]" icon={<Icon name="plus" size={18} strokeWidth={2.2} />} onClick={create}>Create</Pill>}
              {make && btns}
            </span>
          </div>
        )}
        <Segmented className="mt-4 lg:max-w-[420px]" items={TABS} value={view} onChange={goTab} />
        {/* Your patterns: finding on the left (Search, Filter and sort); the list itself on the right (Edit, carousel or grid) */}
        {!make && has && (
          <div ref={toolRow} className="mt-4">
            {picking ? (
              <div className="flex h-10 items-center justify-between">
                <span className="text-[15px] text-white/70">{picked.length ? `${picked.length} selected` : "Choose patterns to delete"}</span>
                <button onClick={() => setPicked(allPicked ? [] : mine.map((x) => x.id))} className="h-10 px-1 text-[15px] font-medium text-peri">{allPicked ? "Clear" : "Select all"}</button>
              </div>
            ) : searching ? search : (
              <div className="flex h-10 items-center justify-between">
                <span className="flex items-center gap-2">{btns}</span>
                <span className="flex items-center gap-2">
                  <ToolBtn icon="select" label="Edit" onClick={() => { setPicking(true); setSearching(false); }} />
                  <ViewSlider grid={grid} setGrid={setGrid} />
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {make ? (
        <>
          <div ref={kinds} className="mt-5"><KindTiles value={cat} onChange={setCat} /></div>
          <OnChips items={mOn} onClear={() => { setLv([]); setPc([]); }} />
          {!narrowed ? (
            CATEGORIES.map((c) => (
              <section key={c} className="mt-6">
                <SectionHead title={CAT[c]} n={byKind(CAT[c]).length} onAll={() => setCat(CAT[c])} />
                <Row>{byKind(CAT[c]).map((t) => <Frame key={t.key} w={ROW_W} imgH={ROW_H} pic={<><Img src={LOOK[t.key]} /><MadeMark made={madeOf(t.key)} /></>} name={t.name} line={<Lvl t={t} />} onClick={() => go("template", { key: t.key })} />)}</Row>
              </section>
            ))
          ) : tpls.length ? (
            <>
              <p className="mt-5 px-6 text-[14px] text-white/55 lg:px-0"><Count n={tpls.length} /></p>
              <div className="mt-3 grid grid-cols-2 items-start gap-x-3 gap-y-4 px-6 sm:grid-cols-3 lg:grid-cols-5 lg:px-0">
                {tpls.map((t) => <Frame key={t.key} imgH={GRID_H} pic={<><Img src={LOOK[t.key]} /><MadeMark made={madeOf(t.key)} /></>} name={t.name} line={<Lvl t={t} />} onClick={() => go("template", { key: t.key })} />)}
              </div>
            </>
          ) : <Nothing onClear={() => { setMq(""); setLv([]); setPc([]); setCat("All"); }} />}
        </>
      ) : has ? (
        <>
          <OnChips items={on} onClear={clearMine} />
          {looking && <p className="mt-4 px-6 text-[14px] text-white/55 lg:px-0"><Count n={mine.length} /></p>}
          {mine.length === 0 ? <Nothing onClear={() => { setQ(""); clearMine(); }} /> : grid ? (
            months.map((mo) => (
              <section key={mo} className="mt-3 px-6 lg:px-0">
                {mo && <h3 className="mb-3 text-[15px] text-white/55">{mo}</h3>}
                <div className="grid grid-cols-2 items-start gap-x-3 gap-y-4 pb-3 sm:grid-cols-3 lg:grid-cols-5">
                  {mine.filter((x) => !mo || monthOf(x) === mo).map((x) => (
                    <Frame key={x.id} imgH={GRID_H} pic={<Img src={LOOK[x.garment]} />} name={x.name} line={<StatusLine p={x} short />} onClick={() => go("pattern", { id: x.id })} pick={pickOf(x.id)} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <>
              <div className="noscroll -mb-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-9 pt-2 lg:px-0">
                {mine.map((x) => <TallCard key={x.id} p={x} onClick={() => go("pattern", { id: x.id })} pick={pickOf(x.id)} />)}
              </div>
              <section className="mt-5">
                <SectionHead title="Make next" n={TEMPLATES.length} onAll={() => goTab(TABS[1])} />
                <Row>{TEMPLATES.filter((t) => !madeOf(t.key)).slice(0, 5).map((t) => <Frame key={t.key} w={ROW_W} imgH={ROW_H} pic={<Img src={LOOK[t.key]} />} name={t.name} line={<Lvl t={t} />} onClick={() => go("template", { key: t.key })} />)}</Row>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          <FirstCard onCreate={create} />
          <section className="mt-7">
            <SectionHead title="Or start from a pattern" n={TEMPLATES.length} onAll={() => goTab(TABS[1])} />
            <Row>{TEMPLATES.slice(0, 5).map((t) => <Frame key={t.key} w={ROW_W} imgH={ROW_H} pic={<Img src={LOOK[t.key]} />} name={t.name} line={<Lvl t={t} />} onClick={() => go("template", { key: t.key })} />)}</Row>
          </section>
        </>
      )}

      <Sheet open={sheet === "filter"} onClose={() => setSheet(null)}>
        <SheetHead title="Filter and sort" />
        <div className="mt-6">
          <div className="text-[15px] text-white/60">Sort by</div>
          <div className="mt-2.5 flex flex-wrap gap-2">{SORTS.map((x) => <Choice key={x} on={sort === x} onClick={() => setSort(x)}>{x}</Choice>)}</div>
        </div>
        <Group title="Where it stands" items={STATUSES} value={st} onChange={setSt} />
        <Group title="Kind" items={KIND_LIST} value={kd} onChange={setKd} />
        <Group title="Fit" items={FITS} value={ft} onChange={setFt} />
        <SheetFooter n={mine.length} canClear={on.length > 0} onClear={clearMine} onShow={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === "mfilter"} onClose={() => setSheet(null)}>
        <SheetHead title="Filter" />
        <Group title="Level" items={LEVELS_} value={lv} onChange={setLv} />
        <Group title="Pieces" items={PIECES_} value={pc} onChange={setPc} />
        <SheetFooter n={tpls.length} canClear={mOn.length > 0} onClear={() => { setLv([]); setPc([]); }} onShow={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === "delete"} onClose={() => setSheet(null)}>
        <SheetHead title={picked.length === 1 ? "Delete this pattern?" : `Delete ${picked.length} patterns?`}>This can’t be undone.</SheetHead>
        <Pill className="mt-6" onClick={remove}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setSheet(null)}>{picked.length === 1 ? "Keep it" : "Keep them"}</Pill>
      </Sheet>
      {toastNode}
    </Screen>
  );
}
