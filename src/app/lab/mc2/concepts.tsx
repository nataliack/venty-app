"use client";
/* eslint-disable @next/next/no-img-element */
// The pattern library, redrawn four ways from Jose's references (25 Oct 2026). Each concept draws both tabs, Your patterns
// and Patterns to make, for a new visitor (no patterns yet) and for someone who has made eight. The photos are stand-ins
// (the sign-up looks and details, the tour's meadow) until Jose's own are made; see BRIEFS for what each one needs.
import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, LayoutGroup, AnimatePresence } from "motion/react";
import { TEMPLATES, CATEGORIES, type Category, type GarmentKey } from "@/lib/data";
import { BodyFigure, Flat } from "@/components/art";
import { Icon } from "@/components/icons";
import { cx, Segmented, Pill } from "@/components/ui";
import { TabBar } from "@/screens/home";
import { TplCard } from "@/screens/templates";
import { ArcCarousel } from "@/screens/auth";

export type View = "Your patterns" | "Patterns to make";
export type Props = { has: boolean; tab: View; opts?: LookOpts };
type Tpl = (typeof TEMPLATES)[number];

// ─── stand-in pictures ───
const P = {
  green: "/auth/look-street-green.webp", mauve: "/auth/look-limo-mauve.webp", rust: "/auth/look-cliff-rust.webp", burgundy: "/auth/look-street-burgundy.webp",
  zip: "/auth/detail-zip.webp", corset: "/auth/detail-corset.webp", hems: "/auth/detail-hems.webp", bows: "/auth/detail-bows.webp", meadow: "/tour/meadow-640.webp",
};
const PHOTO: Record<GarmentKey, string> = {
  slip: P.mauve, wrap: P.green, aline: P.rust, flutter: P.green, cami: P.corset, tee: P.burgundy, shirt: P.bows,
  wideleg: P.hems, straight: P.zip, biasskirt: P.rust, mini: P.burgundy,
};
const KIND: Record<Category, string> = { Dresses: "Dress", Tops: "Top", Pants: "Trousers", Skirts: "Skirt" };
const CAT: Record<Category, string> = { Dresses: "Dresses", Tops: "Tops", Pants: "Trousers", Skirts: "Skirts" };
const LEVEL_N = { Easy: 1, Intermediate: 2, Hard: 3 } as Record<string, number>;

// ─── eight patterns Ana has made, newest first ───
type Mine = { id: string; name: string; g: GarmentKey; status: "Printed" | "Fitting" | "Draft"; line: string; photo: string; fit: string; metres: number; month: string };
const MINE: Mine[] = [
  { id: "a", name: "Wrap midi dress", g: "wrap", status: "Printed", line: "Printed on 12 A4 sheets", photo: P.green, fit: "Relaxed", metres: 2.6, month: "October" },
  { id: "b", name: "Bias slip dress", g: "slip", status: "Fitting", line: "Ready to print", photo: P.mauve, fit: "Tight", metres: 2.1, month: "October" },
  { id: "c", name: "Wide-leg trousers", g: "wideleg", status: "Draft", line: "Draft, not finished yet", photo: P.hems, fit: "Loose", metres: 2.4, month: "October" },
  { id: "d", name: "Cropped boxy tee", g: "tee", status: "Printed", line: "Printed at a print shop", photo: P.burgundy, fit: "Relaxed", metres: 1.4, month: "October" },
  { id: "e", name: "A-line midi dress", g: "aline", status: "Printed", line: "Printed on 10 A4 sheets", photo: P.rust, fit: "Relaxed", metres: 2.8, month: "September" },
  { id: "f", name: "Bias cami", g: "cami", status: "Fitting", line: "Ready to print", photo: P.corset, fit: "Tight", metres: 1.1, month: "September" },
  { id: "g", name: "Straight trousers", g: "straight", status: "Printed", line: "Printed on 9 A4 sheets", photo: P.zip, fit: "Relaxed", metres: 2.3, month: "September" },
  { id: "h", name: "Bow-cuff shirt", g: "shirt", status: "Draft", line: "Draft, not finished yet", photo: P.bows, fit: "Loose", metres: 2.2, month: "August" },
];
const madeOf = (has: boolean, g: GarmentKey) => (has ? MINE.find((m) => m.g === g) : undefined);
const kindOfMine = (m: Mine) => CAT[TEMPLATES.find((t) => t.key === m.g)?.category ?? "Dresses"];
const DOT = { Printed: "bg-primary", Fitting: "bg-peri", Draft: "bg-white/40" };

const Img = ({ src, className }: { src: string; className?: string }) => <img src={src} alt="" draggable={false} className={cx("absolute inset-0 h-full w-full object-cover", className)} />;
const Dot = ({ s, light }: { s: Mine["status"]; light?: boolean }) => <span className={cx("h-2 w-2 shrink-0 rounded-full", light && s === "Draft" ? "bg-ink/25" : DOT[s])} />;
// difficulty as three small bars, as on a pattern envelope (the app's own Level)
const Level = ({ n, light }: { n: number; light?: boolean }) => (
  <span className="flex items-end gap-[2px]" aria-hidden>
    {[1, 2, 3].map((k) => <span key={k} className={cx("w-[3px] rounded-full", k <= n ? (light ? "bg-primary" : "bg-peri") : light ? "bg-ink/15" : "bg-white/20")} style={{ height: 4 + k * 3 }} />)}
  </span>
);
const Sub = ({ t, light, className }: { t: Tpl; light?: boolean; className?: string }) => (
  <span className={cx("flex items-center gap-2 text-[13px]", light ? "text-ink/55" : "text-white/55", className)}><Level n={LEVEL_N[t.level]} light={light} />{t.level} · {t.pieces} pieces</span>
);

// ─── the phone's screen: a scroll area and the real tab bar (its own layout group, so the phones never share a glide) ───
function Shell({ light, children, bare, onScroll, overlay }: { light?: boolean; children: ReactNode; bare?: boolean; onScroll?: (el: HTMLDivElement) => void; overlay?: ReactNode }) {
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <div data-screen className={cx("absolute inset-0 flex flex-col", light ? "bg-snow text-ink" : "text-white")}>
        {!light && <div className="dotgrid" />}
        <div onScroll={onScroll && ((e) => onScroll(e.currentTarget))} className={cx("noscroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-[124px]", !bare && "pt-[62px]")}>{children}</div>
        {overlay}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-2"><TabBar tab="patterns" /></div>
      </div>
    </LayoutGroup>
  );
}
const Title = ({ light, className }: { light?: boolean; className?: string }) => <h1 className={cx("h1 !text-[34px]", light ? "text-ink" : "text-white", className)}>Pattern library</h1>;
const TABS: View[] = ["Your patterns", "Patterns to make"];
// on a light page: solid, white thumb on a pressed snow track (nothing in the app is see-through)
function LightSeg({ value, onChange, className }: { value: View; onChange: (v: View) => void; className?: string }) {
  return (
    <div className={cx("relative flex h-12 rounded-full bg-[#e3e8f6] p-1 shadow-[inset_0_1px_2px_rgb(19_21_35/.12)]", className)}>
      {TABS.map((it) => (
        <button key={it} onClick={() => onChange(it)} className="relative z-10 flex-1 rounded-full text-[14px] font-medium">
          {value === it && <motion.span layoutId="lightseg" className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_3px_rgb(19_21_35/.16)]" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />}
          <span className={value === it ? "font-semibold text-ink" : "text-ink/55"}>{it}</span>
        </button>
      ))}
    </div>
  );
}
const Tabs = ({ items, value, onChange, light, className }: { items: string[]; value: string; onChange: (v: string) => void; light?: boolean; className?: string }) => (
  <div className={cx("noscroll flex gap-5 overflow-x-auto border-b px-6", light ? "border-ink/10" : "border-white/10", className)}>
    {items.map((c) => (
      <button key={c} onClick={() => onChange(c)} className={cx("relative shrink-0 pb-2.5 text-[15px] transition-colors", c === value ? (light ? "text-ink" : "text-white") : light ? "text-ink/45" : "text-white/50")}>
        {c}{c === value && <span className={cx("absolute inset-x-0 -bottom-px h-[2px] rounded-full", light ? "bg-ink" : "bg-white")} />}
      </button>
    ))}
  </div>
);
const KINDS = ["All", ...CATEGORIES.map((c) => CAT[c])];
const byKind = (k: string) => TEMPLATES.filter((t) => k === "All" || CAT[t.category] === k);
const SectionHead = ({ title, n, light }: { title: string; n?: number; light?: boolean }) => (
  <div className="flex items-baseline justify-between px-6">
    <h2 className="text-[20px] tracking-[-.02em]">{title}</h2>
    {n != null && <span className={cx("flex items-center gap-0.5 text-[15px]", light ? "text-ink/45" : "text-white/45")}><span className="tabular-nums">{n}</span><Icon name="chevR" size={16} /></span>}
  </div>
);

// ═══ Today: the screen as it is on main ═══
export function Today({ has, tab }: Props) {
  const [view, setView] = useState<string>(tab);
  const [f, setF] = useState("All");
  const [cat, setCat] = useState("All");
  const list = has ? MINE.filter((p) => f === "All" || (f === "Printed" ? p.status === "Printed" : p.status !== "Printed")) : [];
  return (
    <Shell>
      <div className="px-6"><Title /><Segmented className="mt-4" items={TABS} value={view} onChange={setView} /></div>
      {view === "Patterns to make" ? (
        <>
          <Tabs className="mt-3" items={KINDS} value={cat} onChange={setCat} />
          <div className="mt-4 grid grid-cols-2 gap-3 px-6">{byKind(cat).map((t) => <TplCard key={t.key} t={t} desk={false} onClick={() => {}} />)}</div>
        </>
      ) : has ? (
        <>
          <Tabs className="mt-3" items={["All", "In progress", "Printed"]} value={f} onChange={setF} />
          <div className="mt-4 flex flex-col gap-3 px-6">
            {list.map((p) => (
              <button key={p.id} className="card-soft tap flex w-full items-stretch gap-4 rounded-[26px] p-2.5 pr-4 text-left">
                <span className="violet-panel relative grid h-[116px] w-[96px] shrink-0 place-items-center overflow-hidden rounded-[20px]"><Flat g={p.g} size={66} stroke="#fff" fill="rgba(255,255,255,.16)" /></span>
                <span className="flex min-w-0 flex-1 flex-col py-1.5">
                  <span className="flex items-center gap-1.5 text-[13px] text-white/70"><Dot s={p.status} />{p.line}</span>
                  <span className="mt-1.5 block truncate text-[18px] leading-tight">{p.name}</span>
                  <span className="mt-0.5 block truncate text-[14px] text-white/55">Drafted to Ana</span>
                  <span className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[12px] text-white/75">{p.fit} fit</span>
                    <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[12px] text-white/75"><span className="serif">{p.metres}</span> m of fabric</span>
                  </span>
                </span>
                <span className="grid place-items-center"><Icon name="chevR" size={18} className="text-white/40" /></span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8 text-center">
          <ArcCarousel />
          <p className="mt-6 text-[20px] tracking-[-.02em]">No patterns yet</p>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[15px] leading-snug text-white/60">Design your own, or start from one of the patterns to make.</p>
          <button onClick={() => setView("Patterns to make")} className="tap mt-3 h-11 rounded-full border border-white/20 px-5 text-[15px] font-medium">See the patterns to make</button>
        </div>
      )}
    </Shell>
  );
}

// ═══ 1. Lookbook: tall photo cards you swipe through, like a photo app's albums ═══
// Refined 25 Oct 2026 (Jose), round 2: cards in three builds (the pattern tray's snow, the same in the dark secondary's
// build, or flat photos), every card a fixed size so a name or line never shifts it; the first-pattern card's looks
// spilling over or held in its pressed surface; three kinds of kind filter, each with its own slim form once you
// scroll; search on both tabs, and filters and the order in bottom sheets (like a shop), so the top stays calm.
export type LookOpts = { card: "light" | "dark" | "flat"; empty: "spill" | "contain"; kinds: "tiles" | "track" | "cards"; filters: "shrink" | "away"; cta: "row" | "title" };
const LOOK_DEFAULT: LookOpts = { card: "light", empty: "contain", kinds: "tiles", filters: "shrink", cta: "row" };

// ─── the builds ───
const gridLines = (thin: string, thick: string) => ({
  backgroundImage: `linear-gradient(${thick} 1px, transparent 1px), linear-gradient(90deg, ${thick} 1px, transparent 1px), linear-gradient(${thin} 1px, transparent 1px), linear-gradient(90deg, ${thin} 1px, transparent 1px)`,
  backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px", backgroundPosition: "center",
});
type Skin = { tray: boolean; rim: CSSProperties; press: string; surface: CSSProperties; tile: CSSProperties; name: string; sub: string; stroke: string; light: boolean };
// light: the pattern tray (PatternTray): a snow rim lit from above, what sits in it pressed down
const PRESS_LIGHT = "inset 0 3px 8px rgb(28 36 84 / .34), inset 0 1px 2px rgb(28 36 84 / .3), inset 0 -1px 0 rgb(255 255 255 / .7)";
// dark: the dark secondary's build (.rb, .pill-dark) for the rim, the inset tiles' (.iconbadge) for what is pressed in
const PRESS_DARK = "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .07)";
const SKINS: Record<LookOpts["card"], Skin> = {
  light: {
    tray: true, light: true, press: PRESS_LIGHT, name: "text-ink", sub: "text-slate", stroke: "#3c4b63",
    rim: { background: "linear-gradient(180deg, #ffffff, #e7eaf3)", boxShadow: "0 18px 36px -16px rgb(0 0 0 / .7), 0 2px 4px rgb(0 0 0 / .3), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .2)" },
    surface: { backgroundColor: "#eceef4", boxShadow: PRESS_LIGHT, ...gridLines("rgb(19 21 35 / .05)", "rgb(19 21 35 / .1)") },
    tile: { background: "rgb(52 62 110 / .07)", boxShadow: "inset 0 3px 7px rgb(28 36 84 / .3), inset 0 1px 1.5px rgb(28 36 84 / .3), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9)" },
  },
  dark: {
    tray: true, light: false, press: PRESS_DARK, name: "text-white", sub: "text-white/55", stroke: "rgb(193 200 230 / .75)",
    rim: { background: "linear-gradient(180deg, rgb(255 255 255 / .06), rgb(255 255 255 / 0) 60%) var(--color-card)", boxShadow: "0 18px 36px -16px rgb(0 0 0 / .8), 0 2px 4px rgb(0 0 0 / .35), inset 0 0 0 1px rgb(255 255 255 / .1), inset 0 1px 0 rgb(255 255 255 / .2), inset 0 -1px 0 rgb(0 0 0 / .35)" },
    surface: { backgroundColor: "#141520", boxShadow: PRESS_DARK, ...gridLines("rgb(255 255 255 / .035)", "rgb(255 255 255 / .07)") },
    tile: { background: "rgb(0 0 0 / .26)", boxShadow: "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .06), 0 1px 0 rgb(255 255 255 / .07)" },
  },
  flat: { tray: false, light: false, press: "", name: "text-white", sub: "text-white/55", stroke: "#fff", rim: {}, tile: {}, surface: { backgroundColor: "#141520", boxShadow: PRESS_DARK } },
};
// the rim's shadow falling into what sits in it
const Sunk = ({ s }: { s: Skin }) => (s.tray ? <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: s.press }} /> : null);
// difficulty: the bars and the word, one line that never wraps
const Lvl = ({ t, s }: { t: Tpl; s: Skin }) => <span className={cx("flex items-center gap-2 text-[13px]", s.sub)}><Level n={LEVEL_N[t.level]} light={s.light} />{t.level}</span>;
const StatusLine = ({ m, s }: { m: Mine; s: Skin }) => <span className={cx("flex min-w-0 items-center gap-1.5 text-[13px]", s.sub)}><Dot s={m.status} light={s.light} /><span className="truncate">{m.line}</span></span>;

// ─── cards: one frame for every small card (a photo or a surface of a fixed height, then exactly two lines of a fixed
//     height), so cards in a row or a grid always match, however long a name is ───
function Frame({ s, w, imgH, r = 22, pic, name, line, onClick }: { s: Skin; w?: number; imgH: number; r?: number; pic: ReactNode; name: string; line: ReactNode; onClick?: () => void }) {
  const words = (
    <span className={cx("block", s.tray ? "px-[7px] pb-[7px] pt-[9px]" : "pt-2.5")}>
      <span className={cx("block truncate text-[15px] leading-[18px]", s.name)}>{name}</span>
      <span className="mt-[5px] flex h-4 items-center overflow-hidden whitespace-nowrap">{line}</span>
    </span>
  );
  return (
    <button onClick={onClick} className={cx("tap block shrink-0 snap-start text-left", s.tray && "p-[5px]")} style={{ width: w, borderRadius: r, ...(s.tray ? s.rim : {}) }}>
      <span className="relative block overflow-hidden" style={{ height: imgH, borderRadius: s.tray ? r - 4 : r }}>{pic}<Sunk s={s} /></span>
      {words}
    </button>
  );
}
const Photo = ({ src, made }: { src: string; made?: Mine }) => (
  <>
    <Img src={src} />
    {made && <><span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg/80 to-transparent" /><span className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[12px] text-white/90"><Dot s={made.status} />You made this</span></>}
  </>
);
const TplSmall = ({ t, has, s, w, imgH }: { t: Tpl; has: boolean; s: Skin; w?: number; imgH: number }) => (
  <Frame s={s} w={w} imgH={imgH} pic={<Photo src={PHOTO[t.key]} made={madeOf(has, t.key)} />} name={t.name} line={<Lvl t={t} s={s} />} />
);
const MineSmall = ({ m, s, imgH }: { m: Mine; s: Skin; imgH: number }) => <Frame s={s} imgH={imgH} pic={<Img src={m.photo} />} name={m.name} line={<StatusLine m={m} s={s} />} />;
// Create a pattern as a card among your own: the same frame, an empty pattern surface where the photo would be
const PlusOnSurface = ({ s }: { s: Skin }) => (
  <span className="absolute inset-0 grid place-items-center" style={s.surface}>
    <span className="icon-primary grid h-14 w-14 place-items-center rounded-full text-white"><Icon name="plus" size={26} strokeWidth={2.2} /></span>
  </span>
);
const NewSmall = ({ s, imgH }: { s: Skin; imgH: number }) => <Frame s={s} imgH={imgH} pic={<PlusOnSurface s={s} />} name="Create a pattern" line={<span className={cx("text-[13px]", s.sub)}>Photo, sketch or words</span>} />;

const TALL_H = 400, BAND = 72;
function TallCard({ m, s }: { m: Mine; s: Skin }) {
  if (s.tray) return (
    <button className="tap flex shrink-0 snap-start flex-col rounded-[30px] p-[7px] text-left" style={{ width: 284, height: TALL_H, ...s.rim }}>
      <span className="relative block min-h-0 flex-1 overflow-hidden rounded-[25px]"><Img src={m.photo} /><Sunk s={s} /></span>
      <span className="flex shrink-0 items-center gap-3 px-2" style={{ height: BAND - 7 }}>
        <span className="grid h-[50px] w-[42px] shrink-0 place-items-center rounded-[12px]" style={s.tile}><Flat g={m.g} size={30} stroke={s.stroke} fill="transparent" /></span>
        <span className="min-w-0">
          <span className={cx("block truncate text-[18px] leading-tight tracking-[-.01em]", s.name)}>{m.name}</span>
          <span className="mt-1 block"><StatusLine m={m} s={s} /></span>
        </span>
      </span>
    </button>
  );
  return (
    <button className="tap relative shrink-0 snap-start overflow-hidden rounded-[30px] text-left" style={{ width: 284, height: TALL_H }}>
      <Img src={m.photo} />
      <span className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg/55 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-bg/90 via-bg/45 to-transparent" />
      <span className="absolute left-4 top-4 flex items-center gap-1.5 text-[13px] text-white/90"><Dot s={m.status} />{m.line}</span>
      <span className="absolute inset-x-4 bottom-4 flex items-end gap-3">
        <span className="grid h-[66px] w-[54px] shrink-0 place-items-center rounded-[14px] bg-snow"><Flat g={m.g} size={38} stroke="#131523" fill="rgba(19,21,35,.06)" /></span>
        <span className="min-w-0 pb-0.5">
          <span className="block text-[20px] leading-tight tracking-[-.02em]">{m.name}</span>
          <span className="mt-1 block text-[14px] text-white/70">Drafted to Ana · {m.fit} fit</span>
        </span>
      </span>
    </button>
  );
}
function NewTall({ s }: { s: Skin }) {
  const words = (
    <span className="min-w-0">
      <span className={cx("block text-[18px] leading-tight tracking-[-.01em]", s.name)}>Create a pattern</span>
      <span className={cx("mt-1 block text-[13px]", s.sub)}>From a photo, sketch or words</span>
    </span>
  );
  if (s.tray) return (
    <button className="tap flex shrink-0 snap-start flex-col rounded-[30px] p-[7px] text-left" style={{ width: 210, height: TALL_H, ...s.rim }}>
      <span className="relative block min-h-0 flex-1 overflow-hidden rounded-[25px]"><PlusOnSurface s={s} /></span>
      <span className="flex shrink-0 items-center px-2" style={{ height: BAND - 7 }}>{words}</span>
    </button>
  );
  return (
    <button className="card-soft tap flex shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-[30px] px-5 text-center" style={{ width: 210, height: TALL_H }}>
      <span className="icon-primary grid h-14 w-14 place-items-center rounded-full"><Icon name="plus" size={26} strokeWidth={2.2} /></span>{words}
    </button>
  );
}

// ─── the first-pattern card: three looks fanned out, spilling over the card or held in its pressed surface ───
const FAN = [P.rust, P.green, P.mauve];
function FirstCard({ s, contain }: { s: Skin; contain: boolean }) {
  const text = (
    <div className="absolute inset-x-5 bottom-5 text-center">
      <p className={cx("text-[22px] leading-tight tracking-[-.02em]", s.name)}>Your first pattern starts with a picture</p>
      <p className={cx("mx-auto mt-1.5 max-w-[270px] text-[15px] leading-snug", s.light ? "text-slate" : "text-white/60")}>A photo, a sketch or a few words, drafted to your measurements.</p>
      <Pill className="mt-4">Create a pattern</Pill>
    </div>
  );
  const fan = (w: number, h: number, dx: number, rot: number, drop: number) => FAN.map((src, i) => (
    <span key={src} className="absolute left-1/2 top-0 overflow-hidden rounded-[16px] shadow-[0_16px_30px_-12px_rgb(0_0_0/.7)]"
      style={{ width: w, height: h, transform: `translateX(calc(-50% + ${(i - 1) * dx}px)) translateY(${i === 1 ? 0 : drop}px) rotate(${(i - 1) * rot}deg)`, zIndex: i === 1 ? 2 : 1 }}>
      <Img src={src} />
    </span>
  ));
  const frame = cx("relative mx-6 h-[420px] rounded-[30px]", !s.tray && "card-soft", contain ? "mt-5" : "mt-[58px]");
  if (contain) return (
    // held in: the looks lie in the pressed surface (the tray's, or an inset well on a flat card), clipped by its edge
    <div className={frame} style={s.tray ? s.rim : undefined}>
      <div className="absolute inset-[7px] bottom-[196px] overflow-hidden rounded-[25px]" style={s.surface}>
        <div className="absolute inset-x-0 top-[22px]">{fan(118, 158, 84, 8, 14)}</div>
        <Sunk s={s.tray ? s : SKINS.dark} />
      </div>
      {text}
    </div>
  );
  return (
    // spilling over: the looks rise 34px above the card and past its sides (it starts low enough to keep clear of the tabs)
    <div className={frame} style={s.tray ? s.rim : undefined}>
      {s.tray && <div className="absolute inset-[7px] bottom-[196px] rounded-[25px]" style={s.surface} />}
      <div className="absolute inset-x-0 top-[-34px]">{fan(150, 200, 104, 10, 22)}</div>
      {text}
    </div>
  );
}

// ─── kind filters: three builds, each with a slim form pinned to the top once you scroll past it ───
const KIND_PIC: Record<string, string> = { All: P.meadow, Dresses: P.green, Tops: P.corset, Trousers: P.hems, Skirts: P.rust };
// a photo pressed in like the inset tiles
const PressedPhoto = ({ k, size, r, light }: { k: string; size: number; r: number; light?: boolean }) => (
  <span className="relative block shrink-0 overflow-hidden" style={{ width: size, height: size, borderRadius: r }}>
    <Img src={KIND_PIC[k]} /><span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: light ? PRESS_LIGHT : PRESS_DARK }} />
  </span>
);
function KindFilter({ v, value, onChange }: { v: LookOpts["kinds"]; value: string; onChange: (k: string) => void }) {
  if (v === "tiles") return (
    // A · Tiles: square photos pressed into the page (the app's icon tiles, never circles); the chosen one on a snow card
    <div className="noscroll flex gap-1.5 overflow-x-auto px-5">
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
  if (v === "track") return (
    // B · Track: the kinds in one pressed track, the chosen one raised out of it like the look switch's knob, gliding
    <div className="px-6">
      <div className="ruler-track flex rounded-[24px] p-[5px]">
        {KINDS.map((k) => {
          const on = k === value;
          return (
            <button key={k} onClick={() => onChange(k)} aria-pressed={on} className="relative flex flex-1 flex-col items-center gap-1.5 rounded-[19px] pb-2 pt-[7px]">
              {on && <motion.span layoutId="kindknob" className="knob absolute inset-0 rounded-[19px]" transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
              <span className={cx("relative transition-opacity", !on && "opacity-55")}><PressedPhoto k={k} size={44} r={12} /></span>
              <span className={cx("relative text-[12px] leading-none", on ? "font-medium text-white" : "text-white/50")}>{k}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    // C · Cards: photo cards with the word on the photo; the chosen one bright with the selected tick, the rest dimmed
    <div className="noscroll flex gap-2.5 overflow-x-auto px-6">
      {KINDS.map((k) => {
        const on = k === value;
        return (
          <button key={k} onClick={() => onChange(k)} aria-pressed={on} className={cx("relative h-[112px] w-[88px] shrink-0 overflow-hidden rounded-[20px] transition-opacity duration-300", !on && "opacity-45")}>
            <Img src={KIND_PIC[k]} />
            <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg/85 to-transparent" />
            <span className="absolute inset-x-0 bottom-2.5 text-center text-[13px] font-medium">{k}</span>
            {on && <span className="icon-primary absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full"><Icon name="check" size={11} strokeWidth={3} /></span>}
          </button>
        );
      })}
    </div>
  );
}
function KindBar({ v, value, onChange }: { v: LookOpts["kinds"]; value: string; onChange: (k: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
      className="absolute inset-x-0 top-0 z-10 border-b border-white/8 bg-bg pb-3 pt-[54px]">
      {v === "tiles" ? (
        <div className="noscroll flex gap-2 overflow-x-auto px-6">
          {KINDS.map((k) => (
            <button key={k} onClick={() => onChange(k)} className={cx("flex h-10 shrink-0 items-center gap-2 rounded-full pl-[5px] pr-4 text-[14px] transition-colors", k === value ? "bg-snow font-medium text-ink" : "bg-card text-white/75")}>
              <PressedPhoto k={k} size={30} r={15} light={k === value} />{k}
            </button>
          ))}
        </div>
      ) : v === "track" ? (
        <div className="px-6">
          <div className="ruler-track flex h-11 rounded-full p-1">
            {KINDS.map((k) => (
              <button key={k} onClick={() => onChange(k)} className={cx("relative flex-1 rounded-full text-[13px]", k === value ? "font-medium text-white" : "text-white/50")}>
                {k === value && <motion.span layoutId="kindknob-bar" className="knob absolute inset-0 rounded-full" transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
                <span className="relative">{k}</span>
              </button>
            ))}
          </div>
        </div>
      ) : <Tabs items={KINDS} value={value} onChange={onChange} />}
    </motion.div>
  );
}

// ─── a bottom sheet inside the phone: the app's sheet (the cut round the handle, 45px corners), drawn here so the lab
//     can show it in each phone ───
const SH_W = 48, SH_H = 5, SH_G = 5, SH_R = 45;
function sheetTopPath(w: number, h: number) {
  const c = w / 2, rh = SH_H / 2, cy = rh, half = SH_W / 2 - rh, rn = rh + SH_G, f = rh, r = SH_R;
  const L = c - half, R = c + half;
  const dx = Math.sqrt((rn + f) ** 2 - (f - cy) ** 2), k = rn / (rn + f);
  const tl = [L - dx * k, cy + (f - cy) * k], tr = [R + dx * k, cy + (f - cy) * k];
  return [`M ${r} 0`, `H ${L - dx}`, `A ${f} ${f} 0 0 1 ${tl[0]} ${tl[1]}`, `A ${rn} ${rn} 0 0 0 ${L} ${cy + rn}`, `H ${R}`,
    `A ${rn} ${rn} 0 0 0 ${tr[0]} ${tr[1]}`, `A ${f} ${f} 0 0 1 ${R + dx} 0`, `H ${w - r}`, `A ${r} ${r} 0 0 1 ${w} ${r}`, `V ${h}`, `H 0`, `V ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, "Z"].join(" ");
}
function PhoneSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const id = useId().replace(/:/g, "");
  const W = 393;
  const measure = (el: HTMLDivElement | null) => { ref.current = el; if (el) setH(el.offsetHeight); };
  const d = h ? sheetTopPath(W, h) : "";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="dim" className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div key="sheet" ref={measure} className="absolute inset-x-0 bottom-0 z-50 px-6 pb-[34px] pt-[34px] text-white"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }} onDragEnd={(_, i) => { if (i.offset.y > 90) onClose(); }}>
            {h > 0 && (
              <svg width={W} height={h} className="pointer-events-none absolute inset-0 -z-10 overflow-visible" style={{ filter: "drop-shadow(0 -20px 40px rgb(0 0 0 / .55))" }} aria-hidden>
                <defs><linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".14" /><stop offset=".12" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
                <path d={d} fill="var(--color-card)" />
                <path d={d} fill="none" stroke={`url(#${id}rim)`} strokeWidth="1" />
                <rect x={W / 2 - SH_W / 2} y={0} width={SH_W} height={SH_H} rx={SH_H / 2} fill="var(--color-card)" />
                <rect x={W / 2 - SH_W / 2 + 0.25} y={0.25} width={SH_W - 0.5} height={SH_H - 0.5} rx={SH_H / 2 - 0.25} fill="none" stroke="rgb(255 255 255 / .16)" strokeWidth="0.5" />
              </svg>
            )}
            <div className="relative">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
const SheetTitle = ({ children }: { children: ReactNode }) => <h3 className="text-[24px] leading-tight tracking-[-.03em]">{children}</h3>;
// a choice that can be on with others (filters): snow when on, like a chosen card
const Choice = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} aria-pressed={on} className={cx("h-10 shrink-0 rounded-full px-4 text-[15px] transition-colors", on ? "bg-snow font-medium text-ink" : "pill-dark text-white/80")}>{children}</button>
);
function Group<T extends string>({ title, items, value, onChange, label }: { title: string; items: readonly T[]; value: T[]; onChange: (v: T[]) => void; label?: (t: T) => string }) {
  return (
    <div className="mt-6">
      <div className="text-[15px] text-white/60">{title}</div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((it) => <Choice key={it} on={value.includes(it)} onClick={() => onChange(value.includes(it) ? value.filter((x) => x !== it) : [...value, it])}>{label ? label(it) : it}</Choice>)}
      </div>
    </div>
  );
}
const SheetFooter = ({ n, onClear, onShow, canClear }: { n: number; onClear: () => void; onShow: () => void; canClear: boolean }) => (
  <div className="mt-8 flex items-center gap-4">
    <button onClick={onClear} disabled={!canClear} className={cx("h-14 shrink-0 px-2 text-[15px] font-medium transition-opacity", canClear ? "text-white/80" : "text-white/30")}>Clear all</button>
    <Pill className="flex-1" onClick={onShow}>{n === 0 ? "Nothing matches" : `Show ${n} ${n === 1 ? "pattern" : "patterns"}`}</Pill>
  </div>
);

// ─── the top: search, and one round Filter button that shows how many filters are on ───
function SearchRow({ q, setQ, placeholder, n, onFilter }: { q: string; setQ: (q: string) => void; placeholder: string; n: number; onFilter: () => void }) {
  return (
    <div className="mt-4 flex gap-2.5 px-6">
      <label className="ruler-track flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-4 text-white/45">
        <Icon name="search" size={17} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/40" />
        {q && <button onClick={() => setQ("")} aria-label="Clear the search" className="grid h-6 w-6 place-items-center rounded-full text-white/55"><Icon name="close" size={15} /></button>}
      </label>
      <span className="relative shrink-0">
        <button onClick={onFilter} aria-label={n ? `Filter, ${n} on` : "Filter"} className="rb !h-11 !w-11"><Icon name="sliders" size={18} /></button>
        {n > 0 && <span className="pointer-events-none absolute -right-1 -top-1 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold tabular-nums text-white shadow-[0_0_0_2px_var(--color-bg)]">{n}</span>}
      </span>
    </div>
  );
}
// what is on, each removable (only shown when something is on)
const OnChips = ({ items, onClear }: { items: { k: string; off: () => void }[]; onClear: () => void }) =>
  items.length ? (
    <div className="noscroll mt-3 flex items-center gap-2 overflow-x-auto px-6">
      {items.map((x) => (
        <button key={x.k} onClick={x.off} className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-snow pl-3 pr-2 text-[13px] font-medium text-ink">{x.k}<Icon name="close" size={13} /></button>
      ))}
      <button onClick={onClear} className="h-8 shrink-0 px-2 text-[13px] font-medium text-white/60">Clear all</button>
    </div>
  ) : null;

const STATUSES = ["Draft", "Ready to print", "Printed"] as const;
const STATUS_OF: Record<Mine["status"], (typeof STATUSES)[number]> = { Draft: "Draft", Fitting: "Ready to print", Printed: "Printed" };
const FITS = ["Tight", "Relaxed", "Loose"] as const;
const KIND_LIST = ["Dresses", "Tops", "Trousers", "Skirts"] as const;
const LEVELS_ = ["Easy", "Intermediate", "Hard"] as const;
const PIECES_ = ["Up to 3", "4 to 6", "7 or more"] as const;
const piecesIn = (n: number, p: string) => (p === "Up to 3" ? n <= 3 : p === "4 to 6" ? n >= 4 && n <= 6 : n >= 7);
const SORTS = ["Newest first", "Oldest first", "A to Z"] as const;
const Row = ({ children }: { children: ReactNode }) => <div className="noscroll mt-3 flex snap-x snap-mandatory scroll-px-6 items-start gap-3 overflow-x-auto px-6 pb-2">{children}</div>;
const ROW_W = 150, ROW_H = 188, GRID_H = 206;

export function Lookbook({ has, tab, opts = LOOK_DEFAULT }: Props) {
  const s = SKINS[opts.card];
  const [view, setView] = useState<string>(tab);
  const make = view === "Patterns to make";
  // Patterns to make: kind, search, level and pieces
  const [cat, setCat] = useState("All");
  const [bar, setBar] = useState(false);
  const kinds = useRef<HTMLDivElement>(null);
  const [mq, setMq] = useState("");
  const [lv, setLv] = useState<string[]>([]);
  const [pc, setPc] = useState<string[]>([]);
  // Your patterns: search, status, kind, fit, the order, carousel or grid
  const [q, setQ] = useState("");
  const [st, setSt] = useState<string[]>([]);
  const [kd, setKd] = useState<string[]>([]);
  const [ft, setFt] = useState<string[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest first");
  const [grid, setGrid] = useState(false);
  const [sheet, setSheet] = useState<null | "filter" | "sort" | "mfilter">(null);
  const scrolled = (el: HTMLDivElement) => {
    const r = kinds.current;
    setBar(!!r && make && opts.filters === "shrink" && el.scrollTop > r.offsetTop + r.offsetHeight - 96);
  };
  // Your patterns, filtered and in order
  const mineOf = (stx: string[], kdx: string[], ftx: string[]) => (has ? MINE : []).filter((m) =>
    (!stx.length || stx.includes(STATUS_OF[m.status])) && (!kdx.length || kdx.includes(kindOfMine(m))) && (!ftx.length || ftx.includes(m.fit)) && (!q.trim() || m.name.toLowerCase().includes(q.trim().toLowerCase())));
  let mine = mineOf(st, kd, ft);
  if (sort === "Oldest first") mine = [...mine].reverse();
  if (sort === "A to Z") mine = [...mine].sort((a, b) => a.name.localeCompare(b.name));
  const months = sort === "A to Z" ? [""] : [...new Set(mine.map((m) => m.month))];
  const on = [...st.map((x) => ({ k: x, off: () => setSt(st.filter((y) => y !== x)) })), ...kd.map((x) => ({ k: x, off: () => setKd(kd.filter((y) => y !== x)) })), ...ft.map((x) => ({ k: `${x} fit`, off: () => setFt(ft.filter((y) => y !== x)) }))];
  const clearMine = () => { setSt([]); setKd([]); setFt([]); };
  // Patterns to make, filtered
  const tpls = TEMPLATES.filter((t) => (cat === "All" || CAT[t.category] === cat) && (!lv.length || lv.includes(t.level)) && (!pc.length || pc.some((p) => piecesIn(t.pieces, p))) && (!mq.trim() || t.name.toLowerCase().includes(mq.trim().toLowerCase())));
  const mOn = [...lv.map((x) => ({ k: x, off: () => setLv(lv.filter((y) => y !== x)) })), ...pc.map((x) => ({ k: `${x} pieces`, off: () => setPc(pc.filter((y) => y !== x)) }))];
  const narrowed = cat !== "All" || mOn.length > 0 || !!mq.trim();
  const titleCta = opts.cta === "title" && has && !make;
  return (
    <Shell onScroll={scrolled} overlay={<>
      <AnimatePresence>{bar && <KindBar v={opts.kinds} value={cat} onChange={setCat} />}</AnimatePresence>
      <PhoneSheet open={sheet === "filter"} onClose={() => setSheet(null)}>
        <SheetTitle>Filter your patterns</SheetTitle>
        <Group title="Where it stands" items={STATUSES} value={st as (typeof STATUSES)[number][]} onChange={setSt} />
        <Group title="Kind" items={KIND_LIST} value={kd as (typeof KIND_LIST)[number][]} onChange={setKd} />
        <Group title="Fit" items={FITS} value={ft as (typeof FITS)[number][]} onChange={setFt} />
        <SheetFooter n={mine.length} canClear={on.length > 0} onClear={clearMine} onShow={() => setSheet(null)} />
      </PhoneSheet>
      <PhoneSheet open={sheet === "sort"} onClose={() => setSheet(null)}>
        <SheetTitle>Sort by</SheetTitle>
        <div className="mt-4 divide-y divide-white/8">
          {SORTS.map((x) => (
            <button key={x} onClick={() => { setSort(x); setSheet(null); }} className="flex h-14 w-full items-center justify-between text-left text-[16px]">
              {x}
              <span className={cx("radio grid !h-6 !w-6 place-items-center", x === sort && "icon-primary")}>{x === sort && <Icon name="check" size={12} strokeWidth={3} />}</span>
            </button>
          ))}
        </div>
      </PhoneSheet>
      <PhoneSheet open={sheet === "mfilter"} onClose={() => setSheet(null)}>
        <SheetTitle>Filter patterns to make</SheetTitle>
        <Group title="Level" items={LEVELS_} value={lv as (typeof LEVELS_)[number][]} onChange={setLv} />
        <Group title="Pieces" items={PIECES_} value={pc as (typeof PIECES_)[number][]} onChange={setPc} />
        <SheetFooter n={tpls.length} canClear={mOn.length > 0} onClear={() => { setLv([]); setPc([]); }} onShow={() => setSheet(null)} />
      </PhoneSheet>
    </>}>
      <div className="px-6">
        <div className="flex h-11 items-center justify-between gap-3">
          <Title />
          {titleCta && <Pill className="!h-10 !w-auto shrink-0 gap-1.5 px-4 !text-[15px]" icon={<Icon name="plus" size={18} strokeWidth={2.2} />}>Create</Pill>}
        </div>
        <Segmented className="mt-4" items={TABS} value={view} onChange={(v) => { setView(v); setBar(false); }} />
      </div>
      {make ? (
        <>
          <SearchRow q={mq} setQ={setMq} placeholder="Search patterns to make" n={mOn.length} onFilter={() => setSheet("mfilter")} />
          <div ref={kinds} className="mt-4"><KindFilter v={opts.kinds} value={cat} onChange={setCat} /></div>
          <OnChips items={mOn} onClear={() => { setLv([]); setPc([]); }} />
          {!narrowed ? (
            // a row per kind, like albums
            CATEGORIES.map((c) => (
              <section key={c} className="mt-6">
                <SectionHead title={CAT[c]} n={byKind(CAT[c]).length} />
                <Row>{byKind(CAT[c]).map((t) => <TplSmall key={t.key} t={t} has={has} s={s} w={ROW_W} imgH={ROW_H} />)}</Row>
              </section>
            ))
          ) : tpls.length ? (
            <>
              <p className="mt-5 px-6 text-[14px] text-white/55"><span className="tabular-nums">{tpls.length}</span> {tpls.length === 1 ? "pattern" : "patterns"}</p>
              <div className="mt-3 grid grid-cols-2 items-start gap-x-3 gap-y-4 px-6">{tpls.map((t) => <TplSmall key={t.key} t={t} has={has} s={s} imgH={GRID_H} />)}</div>
            </>
          ) : (
            <div className="mt-10 px-6 text-center">
              <p className="text-[17px]">No patterns match</p>
              <button onClick={() => { setMq(""); setLv([]); setPc([]); setCat("All"); }} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
            </div>
          )}
        </>
      ) : has ? (
        <>
          <SearchRow q={q} setQ={setQ} placeholder="Search your patterns" n={on.length} onFilter={() => setSheet("filter")} />
          <OnChips items={on} onClear={clearMine} />
          {/* the count, then the order (a sheet) and carousel or grid */}
          <div className="mt-4 flex items-center justify-between px-6">
            <span className="text-[14px] text-white/55"><span className="tabular-nums">{mine.length}</span> {mine.length === 1 ? "pattern" : "patterns"}</span>
            <span className="flex items-center gap-2">
              <button onClick={() => setSheet("sort")} className="flex h-9 items-center gap-1 px-1 text-[14px] text-white/80">{sort}<Icon name="chevD" size={15} /></button>
              <span className="ruler-track flex h-9 items-center rounded-full p-[3px]" role="radiogroup" aria-label="View">
                {[false, true].map((g) => (
                  <button key={String(g)} role="radio" aria-checked={grid === g} aria-label={g ? "Grid" : "Carousel"} onClick={() => setGrid(g)} className={cx("relative grid h-[30px] w-[34px] place-items-center rounded-full transition-colors", grid === g ? "text-white" : "text-white/45")}>
                    {grid === g && <motion.span layoutId="lbview" className="knob absolute inset-0 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
                    <Icon name={g ? "grid" : "image"} size={15} className="relative" />
                  </button>
                ))}
              </span>
            </span>
          </div>
          {mine.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-[17px]">No patterns match</p>
              <button onClick={() => { setQ(""); clearMine(); }} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
            </div>
          ) : grid ? (
            months.map((mo) => (
              <section key={mo} className="mt-3 px-6">
                {mo && <h3 className="mb-3 text-[15px] text-white/55">{mo}</h3>}
                <div className="grid grid-cols-2 items-start gap-x-3 gap-y-4 pb-3">
                  {opts.cta === "row" && mo === months[0] && <NewSmall s={s} imgH={GRID_H} />}
                  {mine.filter((m) => !mo || m.month === mo).map((m) => <MineSmall key={m.id} m={m} s={s} imgH={GRID_H} />)}
                </div>
              </section>
            ))
          ) : (
            <>
              <div className="noscroll mt-2 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-3">
                {opts.cta === "row" && <NewTall s={s} />}
                {mine.map((m) => <TallCard key={m.id} m={m} s={s} />)}
              </div>
              <section className="mt-5">
                <SectionHead title="Make next" n={TEMPLATES.length} />
                <Row>{TEMPLATES.filter((t) => !madeOf(has, t.key)).slice(0, 5).map((t) => <TplSmall key={t.key} t={t} has={has} s={s} w={ROW_W} imgH={ROW_H} />)}</Row>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          <FirstCard s={s} contain={opts.empty === "contain"} />
          <section className="mt-7">
            <SectionHead title="Or start from a pattern" n={TEMPLATES.length} />
            <Row>{TEMPLATES.slice(0, 5).map((t) => <TplSmall key={t.key} t={t} has={false} s={s} w={ROW_W} imgH={ROW_H} />)}</Row>
          </section>
        </>
      )}
    </Shell>
  );
}

// ═══ 2. Runway: the garments standing in a row on a dark stage, the one in the middle large ═══
type Fig = { key: string; g: GarmentKey | null; top: ReactNode; name: string; sub: ReactNode };
const SLOT = 132, FIG = 132;
function Stage({ figs, i, setI, h = 430 }: { figs: Fig[]; i: number; setI: (n: number) => void; h?: number }) {
  return (
    <div className="relative mt-2 overflow-hidden" style={{ height: h }}>
      {/* a floor: one soft cornflower pool under the middle figure */}
      <div className="absolute bottom-[86px] left-1/2 h-[90px] w-[300px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(104_126_245/.28),transparent)]" />
      <motion.div className="absolute bottom-0 left-0 flex cursor-grab items-end active:cursor-grabbing" drag="x" dragElastic={0.2} dragMomentum={false} dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, d) => setI(Math.max(0, Math.min(figs.length - 1, i - Math.round(d.offset.x / SLOT))))}
        animate={{ x: 393 / 2 - (i * SLOT + SLOT / 2) }} transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}>
        {figs.map((f, k) => {
          const on = k === i;
          return (
            <button key={f.key} onClick={() => setI(k)} className="relative flex shrink-0 flex-col items-center" style={{ width: SLOT }}>
              <motion.span className="flex flex-col items-center" style={{ transformOrigin: "50% 100%" }} animate={{ scale: on ? 1 : 0.68, opacity: on ? 1 : 0.42 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}>
                <span className="mb-1 flex h-5 items-center gap-1.5 whitespace-nowrap text-[13px] text-white/70">{f.top}</span>
                <BodyFigure sex="female" width={FIG} garment={f.g} glow={false} dim={f.g ? 1 : 0.6} />
              </motion.span>
              <span className={cx("mt-2 h-[58px] w-[170px] text-center transition-opacity duration-300", on ? "opacity-100" : "opacity-0")}>
                <span className="block text-[17px] leading-tight">{f.name}</span>
                <span className="mt-1 flex justify-center">{f.sub}</span>
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
export function Runway({ has, tab }: Props) {
  const [view, setView] = useState<string>(tab);
  const [cat, setCat] = useState("All");
  const [i, setI] = useState(1);
  const tpls = byKind(cat);
  const make: Fig[] = tpls.map((t) => {
    const made = madeOf(has, t.key);
    return { key: t.key, g: t.key, top: made ? <><Dot s={made.status} />You made this</> : KIND[t.category], name: t.name, sub: <Sub t={t} /> };
  });
  const mine: Fig[] = MINE.map((m) => ({ key: m.id, g: m.g, top: <><Dot s={m.status} />{m.line}</>, name: m.name, sub: <span className="text-[13px] text-white/55">Drafted to Ana · {m.fit} fit</span> }));
  const figs = view === "Patterns to make" ? make : mine;
  const at = Math.min(i, figs.length - 1);
  return (
    <Shell>
      <div className="px-6"><Title /><Segmented className="mt-4" items={TABS} value={view} onChange={(v) => { setView(v); setI(1); }} /></div>
      {view === "Patterns to make" ? (
        <>
          <Tabs className="mt-3" items={KINDS} value={cat} onChange={(c) => { setCat(c); setI(Math.min(1, byKind(c).length - 1)); }} />
          <Stage figs={figs} i={at} setI={setI} />
          <div className="px-6">
            <p className="text-center text-[15px] leading-snug text-white/60">{tpls[at]?.blurb}</p>
            <Pill variant="white" className="mt-4">See the pattern</Pill>
          </div>
        </>
      ) : has ? (
        <>
          <Stage figs={figs} i={at} setI={setI} h={470} />
          <div className="px-6">
            <p className="text-center text-[15px] text-white/60"><span className="serif">{MINE[at].metres}</span> m of fabric, 140 cm wide</p>
            <Pill variant="white" className="mt-4">Open the pattern</Pill>
          </div>
        </>
      ) : (
        <>
          {/* an empty stage: your body, waiting for something to wear */}
          <Stage figs={[{ key: "you", g: null, top: "Ana", name: "", sub: null }]} i={0} setI={() => {}} h={430} />
          <div className="-mt-12 px-6 text-center">
            <p className="text-[22px] leading-tight tracking-[-.02em]">Nothing on the rail yet</p>
            <p className="mx-auto mt-1.5 max-w-[290px] text-[15px] leading-snug text-white/60">Every pattern you make stands here, on Ana’s body.</p>
            <Pill className="mt-5">Create a pattern</Pill>
            <button onClick={() => setView("Patterns to make")} className="tap mt-3 h-11 text-[15px] font-medium text-white/80">See the patterns to make</button>
          </div>
        </>
      )}
    </Shell>
  );
}

// ═══ 3. Editorial: a light page under a full-bleed photo, like a fashion shop ═══
function Hero({ src, h, children, view, setView }: { src: string; h: number; children: ReactNode; view: View; setView: (v: View) => void }) {
  return (
    <div className="relative overflow-hidden rounded-b-[36px] text-white" style={{ height: h }}>
      <Img src={src} />
      <span className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-bg/60 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-bg/90 via-bg/50 to-transparent" />
      <div className="absolute inset-x-6 top-[62px]"><Title /><LightSeg className="mt-4" value={view} onChange={setView} /></div>
      <div className="absolute inset-x-6 bottom-6">{children}</div>
    </div>
  );
}
function KindDots({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pic: Record<string, string> = { All: P.meadow, Dresses: P.green, Tops: P.corset, Trousers: P.hems, Skirts: P.rust };
  return (
    <div className="noscroll mt-5 flex gap-3.5 overflow-x-auto px-6">
      {KINDS.map((k) => (
        <button key={k} onClick={() => onChange(k)} className="flex shrink-0 flex-col items-center gap-1.5">
          {/* chosen: a primary ring with the app's 5px channel between it and the photo */}
          <span className={cx("grid h-[66px] w-[66px] place-items-center rounded-full transition-shadow", k === value ? "shadow-[inset_0_0_0_2px_var(--color-primary)]" : "")}>
            <span className="relative block h-[52px] w-[52px] overflow-hidden rounded-full"><Img src={pic[k]} /></span>
          </span>
          <span className={cx("text-[13px]", k === value ? "font-medium text-ink" : "text-ink/55")}>{k}</span>
        </button>
      ))}
    </div>
  );
}
export function Editorial({ has, tab }: Props) {
  const [view, setView] = useState<View>(tab);
  const [cat, setCat] = useState("All");
  const [f, setF] = useState("All");
  const feat = TEMPLATES.find((t) => t.key === "wrap")!;
  return (
    <Shell light bare>
      {view === "Patterns to make" ? (
        <>
          <Hero src={PHOTO.wrap} h={500} view={view} setView={setView}>
            <p className="text-[14px] text-white/80">{KIND[feat.category]} · {feat.level}</p>
            <p className="mt-1 text-[42px] leading-[.98] tracking-[-.035em]">The {feat.name.toLowerCase()}</p>
            <p className="mt-2 max-w-[290px] text-[15px] leading-snug text-white/75">A crossover bodice and a tie at the waist, drafted to your measurements.</p>
            <Pill variant="white" className="mt-4 !w-auto px-6">See the pattern</Pill>
          </Hero>
          <KindDots value={cat} onChange={setCat} />
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 px-6">
            {byKind(cat).map((t) => {
              const made = madeOf(has, t.key);
              return (
                <button key={t.key} className="tap text-left">
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-[22px] bg-white"><Img src={PHOTO[t.key]} /></span>
                  <span className="mt-2 block text-[15px] leading-tight">{t.name}</span>
                  {made ? <span className="mt-1 flex items-center gap-1.5 text-[13px] text-primary-2"><Dot s={made.status} />You made this</span> : <Sub t={t} light className="mt-1" />}
                </button>
              );
            })}
          </div>
        </>
      ) : has ? (
        <>
          <Hero src={MINE[0].photo} h={470} view={view} setView={setView}>
            <p className="flex items-center gap-1.5 text-[14px] text-white/85"><Dot s={MINE[0].status} />{MINE[0].line}</p>
            <p className="mt-1 text-[42px] leading-[.98] tracking-[-.035em]">{MINE[0].name}</p>
            <p className="mt-2 text-[15px] text-white/75">Drafted to Ana · {MINE[0].fit} fit</p>
            <div className="mt-4 flex gap-2.5"><Pill variant="white" className="!w-auto px-6">Print again</Pill></div>
          </Hero>
          <Tabs light className="mt-5" items={["All", "In progress", "Printed"]} value={f} onChange={setF} />
          <div className="mt-4 flex flex-col gap-2.5 px-6">
            {MINE.filter((m) => f === "All" || (f === "Printed" ? m.status === "Printed" : m.status !== "Printed")).map((m) => (
              <button key={m.id} className="tap flex items-center gap-4 rounded-[24px] bg-white p-2.5 pr-4 text-left shadow-[0_1px_2px_rgb(19_21_35/.06),0_10px_24px_-14px_rgb(19_21_35/.25)]">
                <span className="relative h-[96px] w-[76px] shrink-0 overflow-hidden rounded-[16px]"><Img src={m.photo} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px] text-ink/60"><Dot s={m.status} />{m.line}</span>
                  <span className="mt-1 block truncate text-[17px] leading-tight">{m.name}</span>
                  <span className="mt-0.5 block text-[14px] text-ink/55">Drafted to Ana · <span className="serif">{m.metres}</span> m</span>
                </span>
                <Icon name="chevR" size={18} className="shrink-0 text-ink/35" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <Hero src={P.meadow} h={560} view={view} setView={setView}>
            <p className="text-[38px] leading-[1] tracking-[-.035em]">Your patterns will live here</p>
            <p className="mt-2 max-w-[300px] text-[15px] leading-snug text-white/75">Start from a photo, a sketch or a few words, or pick a pattern to make.</p>
            <Pill className="mt-4">Create a pattern</Pill>
          </Hero>
          <div className="mt-6"><SectionHead light title="Patterns to make" n={TEMPLATES.length} /></div>
          <div className="noscroll mt-3 flex gap-3 overflow-x-auto px-6">
            {TEMPLATES.slice(0, 5).map((t) => (
              <button key={t.key} onClick={() => setView("Patterns to make")} className="tap w-[132px] shrink-0 text-left">
                <span className="relative block h-[172px] overflow-hidden rounded-[20px]"><Img src={PHOTO[t.key]} /></span>
                <span className="mt-2 block text-[15px] leading-tight">{t.name}</span>
                <Sub t={t} light className="mt-1" />
              </button>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

// ═══ 4. Fitting room: your body in the middle wearing one pattern at a time, the rest in a row of swatches below ═══
type Look = { key: string; g: GarmentKey; photo: string; name: string; notes: [ReactNode, ReactNode, ReactNode] };
function Room({ looks, i, setI, empty }: { looks: Look[]; i: number; setI: (n: number) => void; empty?: ReactNode }) {
  const l = looks[i];
  return (
    <>
      <div className="relative mt-3 h-[430px]">
        <div className="absolute left-1/2 top-[30px] h-[360px] w-[300px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(104_126_245/.2),transparent)]" />
        <div className="absolute bottom-[14px] left-1/2 h-[26px] w-[150px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/.55),transparent)]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={l?.key ?? "none"} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }}>
              <BodyFigure sex="female" width={158} garment={l?.g ?? null} glow={false} dim={l ? 1 : 0.6} />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* notes in the margin, like on a pattern: a fine line from the words to the garment. Information, not buttons */}
        {l ? (
          <>
            <Note side="l" y={86} x={128}>{l.notes[0]}</Note>
            <Note side="r" y={196} x={250}>{l.notes[1]}</Note>
            <Note side="l" y={292} x={150}>{l.notes[2]}</Note>
          </>
        ) : empty}
      </div>
      {looks.length > 0 && (
        <div className="noscroll mt-1 flex items-center gap-2.5 overflow-x-auto px-6 py-1">
          {looks.map((x, k) => (
            <button key={x.key} onClick={() => setI(k)} aria-label={x.name} className={cx("grid shrink-0 place-items-center rounded-full transition-all duration-300", k === i ? "h-[78px] w-[78px] shadow-[inset_0_0_0_2px_var(--color-snow)]" : "h-[58px] w-[58px] opacity-60")}>
              {/* chosen: a snow ring with the app's 5px channel round the photo */}
              <span className={cx("relative block overflow-hidden rounded-full transition-all duration-300", k === i ? "h-[64px] w-[64px]" : "h-[58px] w-[58px]")}><Img src={x.photo} /></span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
function Note({ side, x, y, children }: { side: "l" | "r"; x: number; y: number; children: ReactNode }) {
  const l = side === "l";
  return (
    <div className="absolute flex items-center" style={l ? { left: 24, top: y, width: x - 24 } : { left: x, top: y, width: 393 - 24 - x }}>
      {!l && <span className="mr-2 h-px flex-1 bg-white/25" />}
      <span className={cx("max-w-[118px] text-[13px] leading-snug text-white/75", !l && "text-right")}>{children}</span>
      {l && <span className="ml-2 h-px flex-1 bg-white/25" />}
    </div>
  );
}
export function FittingRoom({ has, tab }: Props) {
  const [view, setView] = useState<string>(tab);
  const [i, setI] = useState(0);
  const make: Look[] = TEMPLATES.map((t) => {
    const made = madeOf(has, t.key);
    return { key: t.key, g: t.key, photo: PHOTO[t.key], name: t.name, notes: [<span key="a" className="block text-[17px] text-white">{t.name}</span>, <span key="b" className="flex items-center justify-end gap-2"><Level n={LEVEL_N[t.level]} />{t.level}</span>, made ? <span key="c" className="flex items-center gap-1.5"><Dot s={made.status} />You made this</span> : `${t.pieces} pieces · ${t.tag}`] };
  });
  const mine: Look[] = MINE.map((m) => ({ key: m.id, g: m.g, photo: m.photo, name: m.name, notes: [<span key="a" className="block text-[17px] text-white">{m.name}</span>, <span key="b" className="flex items-center justify-end gap-1.5"><Dot s={m.status} />{m.line}</span>, `${m.fit} fit · ${m.metres} m`] }));
  const looks = view === "Patterns to make" ? make : has ? mine : [];
  const at = Math.min(i, Math.max(0, looks.length - 1));
  return (
    <Shell>
      <div className="px-6"><Title /><Segmented className="mt-4" items={TABS} value={view} onChange={(v) => { setView(v); setI(0); }} /></div>
      <Room looks={looks} i={at} setI={setI} empty={<Note side="r" y={150} x={246}><span className="block text-[17px] text-white">Nothing to try on yet</span>Make a pattern and Ana wears it here.</Note>} />
      <div className="mt-4 px-6">
        {looks.length > 0 ? (
          <>
            <p className="text-center text-[15px] font-medium">{looks[at].name}</p>
            <Pill variant="white" className="mt-3">{view === "Patterns to make" ? "See the pattern" : "Open the pattern"}</Pill>
          </>
        ) : (
          <>
            <Pill className="mt-2">Create a pattern</Pill>
            <button onClick={() => setView("Patterns to make")} className="tap mt-2 h-11 w-full text-[15px] font-medium text-white/80">Try on the patterns to make</button>
          </>
        )}
      </div>
    </Shell>
  );
}

// what each concept needs from Jose: the pictures that do the heavy lifting
export const BRIEFS: Record<string, string[]> = {
  today: ["No photos. The garments are drawn on Crown swatches, and the empty state borrows the sign-up page's arc of looks."],
  lookbook: [
    "Your patterns: the picture each pattern started from (the person's own photo, screenshot or sketch from the studio), so nothing to make. A pattern made from words alone falls back to the drawn garment on Crown.",
    "Patterns to make: one portrait photo per pattern (10), 3:4, about 900 × 1200, the garment worn, all shot the same way (same light, same distance) so the rows read as one set.",
    "Filters: five round photos (all, dresses, tops, trousers, skirts), square, about 300 × 300, the garment or a detail filling the circle.",
    "Empty state: three looks to fan out (any three of the ten).",
  ],
  runway: [
    "Patterns to make: one cut-out per pattern (10), the garment on a model, full length, front on, transparent WebP, about 800 × 2000. Same height and the feet on the same line in every file, so they stand in a row.",
    "Your patterns: no photos. Each one stands on your own body (here the drawn mannequin; the 3D body later).",
  ],
  editorial: [
    "Hero photos, full bleed, 3:4 or taller, about 1200 × 1700, with calm space at the top for the title and at the bottom for the words: one for the featured pattern, one mood picture for the empty state (like the meadow).",
    "Kinds: five round crops (all, dresses, tops, trousers, skirts), square, about 300 × 300.",
    "Grid: the same portrait photo per pattern as the lookbook (10). Your patterns use the picture each started from.",
  ],
  fitting: [
    "Swatches: one square photo per pattern (10), about 400 × 400: a close crop of the fabric or a detail (a collar, a tie, a hem), so a row of circles reads as a rail of clothes.",
    "The body in the middle is the app's own (here the drawn mannequin; the 3D body later), so no model photos.",
  ],
};
