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
// Refined 25 Oct 2026 (Jose): photo filters on Patterns to make (shrinking into a bar as you scroll), search, filters,
// sort and a grid on Your patterns, a way to create a pattern once you have some, and the looks on the empty card
// spilling over its edges. Two card styles: flat photos, or the pattern tray's build (a raised snow rim, the photo
// pressed into it, a raised band for the words).
export type LookOpts = { card: "flat" | "tray"; filters: "shrink" | "away"; cta: "row" | "title" };
const LOOK_DEFAULT: LookOpts = { card: "tray", filters: "shrink", cta: "row" };
// the tray's build (PatternTray): the rim lit from above, and what sits in it pressed down
const RIM: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff, #e7eaf3)",
  boxShadow: "0 18px 36px -16px rgb(0 0 0 / .7), 0 2px 4px rgb(0 0 0 / .3), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .2)",
};
const PRESSED = "inset 0 3px 8px rgb(28 36 84 / .34), inset 0 1px 2px rgb(28 36 84 / .3), inset 0 -1px 0 rgb(255 255 255 / .7)";
const SURFACE: CSSProperties = {
  backgroundColor: "#eceef4", boxShadow: PRESSED, backgroundPosition: "center",
  backgroundImage: "linear-gradient(rgb(19 21 35 / .1) 1px, transparent 1px), linear-gradient(90deg, rgb(19 21 35 / .1) 1px, transparent 1px), linear-gradient(rgb(19 21 35 / .05) 1px, transparent 1px), linear-gradient(90deg, rgb(19 21 35 / .05) 1px, transparent 1px)",
  backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
};
// the shadow of the rim falling into the photo
const Sunk = () => <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESSED }} />;
// a pressed tile on snow (the inset tiles on a chosen card)
const SNOW_TILE: CSSProperties = { background: "rgb(52 62 110 / .07)", boxShadow: "inset 0 3px 7px rgb(28 36 84 / .3), inset 0 1px 1.5px rgb(28 36 84 / .3), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9)" };

function TallCard({ m, tray }: { m: Mine; tray: boolean }) {
  if (tray) return (
    <button className="tap relative flex h-[400px] w-[284px] shrink-0 snap-start flex-col rounded-[30px] p-[7px] text-left" style={RIM}>
      <span className="relative block min-h-0 flex-1 overflow-hidden rounded-[26px]"><Img src={m.photo} /><Sunk /></span>
      <span className="flex h-[70px] shrink-0 items-center gap-3 px-2">
        <span className="grid h-[50px] w-[42px] shrink-0 place-items-center rounded-[12px]" style={SNOW_TILE}><Flat g={m.g} size={30} stroke="#3c4b63" fill="rgba(60,75,99,.06)" /></span>
        <span className="min-w-0">
          <span className="block truncate text-[18px] leading-tight tracking-[-.01em] text-ink">{m.name}</span>
          <span className="mt-1 flex items-center gap-1.5 text-[13px] text-slate"><Dot s={m.status} light />{m.line}</span>
        </span>
      </span>
    </button>
  );
  return (
    <button className="tap relative h-[400px] w-[284px] shrink-0 snap-start overflow-hidden rounded-[30px] text-left">
      <Img src={m.photo} />
      <span className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg/55 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-bg/90 via-bg/45 to-transparent" />
      <span className="absolute left-4 top-4 flex items-center gap-1.5 text-[13px] text-white/90"><Dot s={m.status} />{m.line}</span>
      <span className="absolute inset-x-4 bottom-4 flex items-end gap-3">
        {/* the pattern itself, small, on snow: the photo is what you wanted, this is what you drafted */}
        <span className="grid h-[66px] w-[54px] shrink-0 place-items-center rounded-[14px] bg-snow"><Flat g={m.g} size={38} stroke="#131523" fill="rgba(19,21,35,.06)" /></span>
        <span className="min-w-0 pb-0.5">
          <span className="block text-[20px] leading-tight tracking-[-.02em]">{m.name}</span>
          <span className="mt-1 block text-[14px] text-white/70">Drafted to Ana · {m.fit} fit</span>
        </span>
      </span>
    </button>
  );
}
// a photo card for the rows and grids: a pattern to make, or one of yours
function SmallCard({ photo, name, line, tray, w, made }: { photo: string; name: string; line: ReactNode; tray: boolean; w?: number; made?: Mine }) {
  const style = w ? { width: w } : undefined;
  const mark = made && <span className={cx("absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[12px]", "text-white/90")}><Dot s={made.status} />You made this</span>;
  if (tray) return (
    <button className="tap shrink-0 snap-start rounded-[22px] p-[5px] text-left" style={{ ...RIM, ...style }}>
      <span className="relative block aspect-[3/4] overflow-hidden rounded-[18px]"><Img src={photo} />{made && <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg/75 to-transparent" />}{mark}<Sunk /></span>
      <span className="block px-1.5 pb-1.5 pt-2"><span className="block truncate text-[14px] leading-tight text-ink">{name}</span><span className="mt-1 block">{line}</span></span>
    </button>
  );
  return (
    <button className="tap shrink-0 snap-start text-left" style={style}>
      <span className="relative block aspect-[3/4] overflow-hidden rounded-[22px]"><Img src={photo} />{made && <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg/80 to-transparent" />}{mark}</span>
      <span className="mt-2 block truncate text-[15px] leading-tight">{name}</span>
      <span className="mt-1 block">{line}</span>
    </button>
  );
}
const TplSmall = ({ t, has, tray, w }: { t: Tpl; has: boolean; tray: boolean; w?: number }) => (
  <SmallCard photo={PHOTO[t.key]} name={t.name} line={<Sub t={t} light={tray} />} tray={tray} w={w} made={madeOf(has, t.key)} />
);
const MineSmall = ({ m, tray }: { m: Mine; tray: boolean }) => (
  <SmallCard photo={m.photo} name={m.name} tray={tray} line={<span className={cx("flex items-center gap-1.5 text-[13px]", tray ? "text-slate" : "text-white/55")}><Dot s={m.status} light={tray} /><span className="truncate">{m.line}</span></span>} />
);
// create a pattern, as the first card of your own: an empty pattern tray (or an empty card) with the Create button in it
function NewCard({ tray, tall }: { tray: boolean; tall?: boolean }) {
  const inner = (
    <span className="flex flex-col items-center gap-3 px-4 text-center">
      <span className="icon-primary grid h-14 w-14 place-items-center rounded-full"><Icon name="plus" size={26} strokeWidth={2.2} /></span>
      <span>
        <span className={cx("block text-[17px] leading-tight", tray ? "text-ink" : "text-white")}>Create a pattern</span>
        <span className={cx("mt-1 block text-[13px] leading-snug", tray ? "text-slate" : "text-white/55")}>From a photo, sketch or words</span>
      </span>
    </span>
  );
  if (tray) return (
    <button className={cx("tap flex shrink-0 snap-start flex-col p-[7px] text-left", tall ? "h-[400px] w-[200px] rounded-[30px]" : "rounded-[22px] !p-[5px]")} style={RIM}>
      <span className={cx("grid flex-1 place-items-center", tall ? "rounded-[26px]" : "aspect-[3/4] rounded-[18px]")} style={SURFACE}>{inner}</span>
      {!tall && <span className="block h-[46px]" />}
    </button>
  );
  return <button className={cx("card-soft tap grid shrink-0 snap-start place-items-center", tall ? "h-[400px] w-[200px] rounded-[30px]" : "aspect-[3/4] rounded-[22px]")}>{inner}</button>;
}

// the kinds as round photos (the editorial's), and the same as a slim bar once you scroll past them
const KIND_PIC: Record<string, string> = { All: P.meadow, Dresses: P.green, Tops: P.corset, Trousers: P.hems, Skirts: P.rust };
function KindPhotos({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="noscroll flex gap-3 overflow-x-auto px-6 py-1">
      {KINDS.map((k) => (
        <button key={k} onClick={() => onChange(k)} className="flex shrink-0 flex-col items-center gap-1.5">
          {/* chosen: a snow ring with the app's 5px channel round the photo */}
          <span className={cx("grid h-[66px] w-[66px] place-items-center rounded-full transition-shadow", k === value && "shadow-[inset_0_0_0_2px_var(--color-snow)]")}>
            <span className="relative block h-[52px] w-[52px] overflow-hidden rounded-full"><Img src={KIND_PIC[k]} /></span>
          </span>
          <span className={cx("text-[13px]", k === value ? "font-medium text-white" : "text-white/55")}>{k}</span>
        </button>
      ))}
    </div>
  );
}
function KindBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
      className="absolute inset-x-0 top-0 z-10 border-b border-white/8 bg-bg pb-3 pt-[54px]">
      <div className="noscroll flex gap-2 overflow-x-auto px-6">
        {KINDS.map((k) => (
          <button key={k} onClick={() => onChange(k)} className={cx("flex h-9 shrink-0 items-center gap-2 rounded-full pl-1 pr-3.5 text-[14px] transition-colors", k === value ? "bg-snow font-medium text-ink" : "bg-card text-white/75")}>
            <span className="relative block h-7 w-7 overflow-hidden rounded-full"><Img src={KIND_PIC[k]} /></span>{k}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} className={cx("h-9 shrink-0 rounded-full px-3.5 text-[14px] transition-colors", on ? "bg-snow font-medium text-ink" : "bg-card text-white/70")}>{children}</button>
);
const SORTS = ["Newest", "Oldest", "A to Z"];
const Row = ({ children }: { children: ReactNode }) => <div className="noscroll mt-3 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2">{children}</div>;

export function Lookbook({ has, tab, opts = LOOK_DEFAULT }: Props) {
  const tray = opts.card === "tray";
  const [view, setView] = useState<string>(tab);
  const [cat, setCat] = useState("All");
  const [bar, setBar] = useState(false);
  const kinds = useRef<HTMLDivElement>(null);
  // Your patterns: search, status, kind, sort, and carousel or grid
  const [q, setQ] = useState("");
  const [st, setSt] = useState("All");
  const [kind, setKind] = useState<string | null>(null);
  const [sort, setSort] = useState(0);
  const [grid, setGrid] = useState(false);
  const make = view === "Patterns to make";
  const scrolled = (el: HTMLDivElement) => {
    const r = kinds.current;
    setBar(!!r && make && opts.filters === "shrink" && el.scrollTop > r.offsetTop + r.offsetHeight - 96);
  };
  let mine = (has ? MINE : []).filter((m) => (st === "All" || (st === "Printed" ? m.status === "Printed" : m.status !== "Printed")) && (!kind || kindOfMine(m) === kind) && (!q.trim() || m.name.toLowerCase().includes(q.trim().toLowerCase())));
  if (sort === 1) mine = [...mine].reverse();
  if (sort === 2) mine = [...mine].sort((a, b) => a.name.localeCompare(b.name));
  const months = sort === 2 ? [""] : [...new Set(mine.map((m) => m.month))];
  const titleCta = opts.cta === "title" && has && !make;
  return (
    <Shell onScroll={scrolled} overlay={<AnimatePresence>{bar && <KindBar value={cat} onChange={setCat} />}</AnimatePresence>}>
      <div className="px-6">
        <div className="flex h-11 items-center justify-between gap-3">
          <Title />
          {titleCta && <Pill className="!h-10 !w-auto shrink-0 gap-1.5 px-4 !text-[15px]" icon={<Icon name="plus" size={18} strokeWidth={2.2} />}>Create</Pill>}
        </div>
        <Segmented className="mt-4" items={TABS} value={view} onChange={(v) => { setView(v); setBar(false); }} />
      </div>
      {make ? (
        <>
          <div ref={kinds} className="mt-5"><KindPhotos value={cat} onChange={setCat} /></div>
          {cat === "All" ? (
            // a row per kind, like albums
            CATEGORIES.map((c) => (
              <section key={c} className="mt-6">
                <SectionHead title={CAT[c]} n={byKind(CAT[c]).length} />
                <Row>{byKind(CAT[c]).map((t) => <TplSmall key={t.key} t={t} has={has} tray={tray} w={156} />)}</Row>
              </section>
            ))
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 px-6">{byKind(cat).map((t) => <TplSmall key={t.key} t={t} has={has} tray={tray} />)}</div>
          )}
        </>
      ) : has ? (
        <>
          {/* find one fast: search, then status and kind, then the order; carousel or grid */}
          <div className="mt-4 flex gap-2.5 px-6">
            <label className="ruler-track flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-4 text-white/45">
              <Icon name="search" size={17} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your patterns" className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/40" />
            </label>
            <div className="ruler-track flex h-11 shrink-0 items-center rounded-full p-1" role="radiogroup" aria-label="View">
              {[false, true].map((g) => (
                <button key={String(g)} role="radio" aria-checked={grid === g} aria-label={g ? "Grid" : "Carousel"} onClick={() => setGrid(g)} className={cx("relative grid h-9 w-10 place-items-center rounded-full transition-colors", grid === g ? "text-white" : "text-white/45")}>
                  {grid === g && <motion.span layoutId="lbview" className="knob absolute inset-0 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
                  <Icon name={g ? "grid" : "image"} size={17} className="relative" />
                </button>
              ))}
            </div>
          </div>
          <div className="noscroll mt-3 flex items-center gap-2 overflow-x-auto px-6">
            {["All", "In progress", "Printed"].map((s) => <Chip key={s} on={st === s} onClick={() => setSt(s)}>{s}</Chip>)}
            <span className="mx-1 h-5 w-px shrink-0 bg-white/12" />
            {KINDS.slice(1).map((k) => <Chip key={k} on={kind === k} onClick={() => setKind(kind === k ? null : k)}>{k}</Chip>)}
          </div>
          <div className="mt-4 flex items-center justify-between px-6 text-[14px] text-white/55">
            <span><span className="tabular-nums">{mine.length}</span> {mine.length === 1 ? "pattern" : "patterns"}</span>
            <button onClick={() => setSort((sort + 1) % SORTS.length)} className="flex h-8 items-center gap-1 text-white/80">{SORTS[sort]}<Icon name="chevD" size={15} /></button>
          </div>
          {mine.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-[17px]">No patterns match</p>
              <button onClick={() => { setQ(""); setSt("All"); setKind(null); }} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
            </div>
          ) : grid ? (
            months.map((mo) => (
              <section key={mo} className="mt-3 px-6">
                {mo && <h3 className="mb-3 text-[15px] text-white/55">{mo}</h3>}
                <div className="grid grid-cols-2 gap-x-3 gap-y-4 pb-3">
                  {opts.cta === "row" && mo === months[0] && <NewCard tray={tray} />}
                  {mine.filter((m) => !mo || m.month === mo).map((m) => <MineSmall key={m.id} m={m} tray={tray} />)}
                </div>
              </section>
            ))
          ) : (
            <>
              <div className="noscroll mt-1 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2">
                {opts.cta === "row" && <NewCard tray={tray} tall />}
                {mine.map((m) => <TallCard key={m.id} m={m} tray={tray} />)}
              </div>
              <section className="mt-6">
                <SectionHead title="Make next" n={TEMPLATES.length} />
                <Row>{TEMPLATES.filter((t) => !madeOf(has, t.key)).slice(0, 5).map((t) => <TplSmall key={t.key} t={t} has={has} tray={tray} w={132} />)}</Row>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          {/* one tall card where your first pattern will be: three looks fanned out like photos in your hand, spilling
              over its top and sides (the tabs keep clear: the card starts low enough) */}
          <div className={cx("relative mx-6 mt-[58px] h-[420px] rounded-[30px]", !tray && "card-soft")} style={tray ? RIM : undefined}>
            {tray && <div className="absolute inset-[7px] bottom-[196px] rounded-[26px]" style={SURFACE} />}
            <div className="absolute inset-x-0 top-[-34px] h-[230px]">
              {[P.rust, P.green, P.mauve].map((src, i) => (
                <span key={src} className="absolute left-1/2 top-0 h-[200px] w-[150px] overflow-hidden rounded-[18px] shadow-[0_18px_34px_-12px_rgb(0_0_0/.75)]"
                  style={{ transform: `translateX(calc(-50% + ${(i - 1) * 104}px)) translateY(${i === 1 ? 0 : 22}px) rotate(${(i - 1) * 10}deg)`, zIndex: i === 1 ? 2 : 1 }}>
                  <Img src={src} />
                </span>
              ))}
            </div>
            <div className="absolute inset-x-5 bottom-5 text-center">
              <p className={cx("text-[22px] leading-tight tracking-[-.02em]", tray && "text-ink")}>Your first pattern starts with a picture</p>
              <p className={cx("mx-auto mt-1.5 max-w-[270px] text-[15px] leading-snug", tray ? "text-slate" : "text-white/60")}>A photo, a sketch or a few words, drafted to your measurements.</p>
              <Pill className="mt-4">Create a pattern</Pill>
            </div>
          </div>
          <section className="mt-7">
            <SectionHead title="Or start from a pattern" n={TEMPLATES.length} />
            <Row>{TEMPLATES.slice(0, 5).map((t) => <TplSmall key={t.key} t={t} has={false} tray={tray} w={132} />)}</Row>
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
