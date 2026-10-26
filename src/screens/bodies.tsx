"use client";
/* eslint-disable @next/next/no-img-element */
// The Body library and a body's own page (26 Oct 2026, from the lab /lab/mc2, round 5).
// - The library: the bodies as cards in the raised build (a rim, a still of the body's own 3D form pressed into a small
//   stage: its face and shoulders in profile), "Incomplete" in a raised corner of the card, the height centred under
//   the shoulders; the name and bust, waist, hips under it. New body beside the title; Search, Filter and sort (one
//   sheet, as on the pattern library) and Edit (choose and delete: a second raised corner with its box). With no
//   bodies, a cinematic carousel and one big Set up a body.
// - A body's page: the body turning at the top (it never changes), the measurements as tiles two to a row, one group at
//   a time under a pressed switch (Base, Around, Lengths, Widths, Seated). Measured: raised, with a pencil. Estimated
//   from the photo scan: raised, a periwinkle check. Missing: pressed in, "Not measured", the periwinkle add. A tile
//   opens a sheet with the 3D body on that measurement (its dashed tape) and the dial. Rename and Delete under More.
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt, type Body } from "@/lib/store";
import { ALL_MEASURES, GROUPS } from "@/lib/data";
import { Screen, H1, Pill, RB, Sheet, SheetHead, TopBar, cx, useDesk, useToast } from "@/components/ui";
import { Ruler } from "@/components/art";
import { Icon } from "@/components/icons";
import { BodyStage } from "@/components/BodyStage";
import { BodyLoader } from "@/components/BodyLoader";
import { BodyPic, Still, StillMaker } from "@/components/BodyStills";
import { TabBar } from "./home";
import { ToolBtn, SearchOpen, OnChips, Group, Choice } from "./library";

const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false, loading: () => <BodyLoader /> });

// ─── the builds (the pattern library's dark tray) ───
const PRESS = "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .07)";
const RIM: CSSProperties = { background: "linear-gradient(180deg, rgb(255 255 255 / .035), rgb(255 255 255 / 0) 50%) var(--color-card)", boxShadow: "0 18px 36px -16px rgb(0 0 0 / .8), 0 2px 4px rgb(0 0 0 / .35), inset 0 0 0 1px rgb(255 255 255 / .07), inset 0 1px 0 rgb(255 255 255 / .1), inset 0 -1px 0 rgb(0 0 0 / .35)" };
const N = ({ v, className }: { v: ReactNode; className?: string }) => <span className={cx("serif", className)}>{v}</span>;
// a number in the chosen unit, without a trailing .0
const shown = (v: number, units: "cm" | "in") => fmt(v, units).replace(/\.0$/, "");
// when a body was added: new ids are "b" + the time in base 36 (the starting bodies have none)
const addedAt = (b: Body) => (/^b[0-9a-z]+$/.test(b.id) ? parseInt(b.id.slice(1), 36) : NaN);
const added = (b: Body) => { const t = addedAt(b); return Number.isFinite(t) ? new Date(t).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : null; };

// ─── raised corners: the card's rim rises into a corner of the stage ("Incomplete" top left; choosing, Edit, a second
//     at the top right with its box), its inner corner rounded and curving into the stage's edges, its shadow on the
//     stage. Drawn on top of the stage in the rim's own colour, not cut with a mask: a mask left a seam and soft edges
//     on iPhone. The cover starts 2 px in from the card's edge (past the rim's light edge), its outer corner the
//     card's own curve, so only the cut edge shows. w × h: the cut in the stage; f: the curves into the stage's edges;
//     rb: the inner corner ───
type Notch = { side: "l" | "r"; w: number; h: number; f?: number; rb?: number };
const PAD = 5, CARD_R = 24, IN = 2;
// the cut in the stage's own coordinates, for its shadow (drawn for the top right, flipped for the left)
const notchPath = ({ w, h, f = 8, rb = 10 }: Notch) => {
  const W = w + f;
  return `M${f} 0H${W}V${h}H${f + rb}A${rb} ${rb} 0 0 1 ${f} ${h - rb}Z M0 0H${f}V${f}A${f} ${f} 0 0 0 0 0Z M${W - f} ${h}H${W}V${h + f}A${f} ${f} 0 0 0 ${W - f} ${h}Z`;
};
// the cover in the card's coordinates, drawn for the top left: the card's corner, along the top rim, down the curve
// into the cut's wall, round its inner corner, along its foot, the curve into the stage's left edge, back up the rim
const coverPath = ({ w, h, f = 8, rb = 10 }: Notch) => {
  const x = PAD + w, y = PAD + h, r = CARD_R - IN;
  return `M${IN} ${CARD_R}A${r} ${r} 0 0 1 ${CARD_R} ${IN}H${x + f}V${PAD}A${f} ${f} 0 0 0 ${x} ${PAD + f}V${y - rb}A${rb} ${rb} 0 0 1 ${x - rb} ${y}H${PAD + f}A${f} ${f} 0 0 0 ${PAD} ${y + f}H${IN}Z`;
};
// the shadow, inside the stage (its rounded clip keeps it on the stage)
function NotchShade({ n }: { n: Notch }) {
  const W = n.w + (n.f ?? 8), H = n.h + (n.f ?? 8);
  return (
    <svg width={W} height={H} className={cx("pointer-events-none absolute top-0 overflow-visible", n.side === "r" ? "right-0" : "left-0")} aria-hidden>
      <g transform={n.side === "r" ? undefined : `translate(${W} 0) scale(-1 1)`}><path d={notchPath(n)} transform="translate(-1 2.5)" fill="#000" opacity={0.75} style={{ filter: "blur(3.5px)" }} /></g>
    </svg>
  );
}
// the raised corner itself: the card's colour and its top light (white .035 fading to nothing halfway down a phone card)
function NotchCover({ n }: { n: Notch }) {
  const id = useId(), W = PAD + n.w + (n.f ?? 8), H = PAD + n.h + (n.f ?? 8);
  return (
    <svg width={W} height={H} className={cx("pointer-events-none absolute top-0", n.side === "r" ? "right-0" : "left-0")} aria-hidden>
      <defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="140"><stop offset="0" stopColor="#fff" stopOpacity=".035" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
      <g transform={n.side === "r" ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <path d={coverPath(n)} style={{ fill: "var(--color-card)" }} />
        <path d={coverPath(n)} fill={`url(#${id})`} />
      </g>
    </svg>
  );
}
const INC: Notch = { side: "l", w: 84, h: 24 };
const PICK: Notch = { side: "r", w: 34, h: 34, rb: 13 };
const PickBox = ({ on }: { on: boolean }) => (
  <span className={cx("grid h-[24px] w-[24px] place-items-center rounded-[7px] transition-colors", on && "icon-primary text-white")} style={on ? undefined : { boxShadow: "inset 0 0 0 1.5px rgb(255 255 255 / .5)" }}>
    {on && <Icon name="check" size={13} strokeWidth={3} />}
  </span>
);
// the picture area is a little taller than square, 4:5 (the real pictures will be 4:5)
export function BodyCard({ b, units, onClick, pick, className }: { b: Body; units: "cm" | "in"; onClick: () => void; pick?: boolean | null; className?: string }) {
  const notches = [...(b.done.length < 24 ? [INC] : []), ...(pick != null ? [PICK] : [])];
  return (
    <button onClick={onClick} aria-pressed={pick ?? undefined} aria-label={b.name} className={cx("tap relative block rounded-[24px] p-[5px] text-left", className ?? "w-full")} style={RIM}>
      <span className="stage-ink relative block aspect-[4/5] overflow-hidden rounded-[19px]">
        <span className="absolute inset-0"><BodyPic b={b} /></span>
        <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESS }} />
        {notches.map((n) => <NotchShade key={n.side} n={n} />)}
        {/* the height, white with a soft shadow (the turned-away pictures are lighter at the foot) */}
        <span className="absolute inset-x-0 bottom-2 text-center text-[11px] text-white/80" style={{ textShadow: "0 1px 6px rgb(19 21 35 / .45)" }}><N v={shown(b.measures.height, units)} className="text-[15px] text-white" /> <span translate="no">{units}</span></span>
      </span>
      {notches.map((n) => <NotchCover key={n.side} n={n} />)}
      {b.done.length < 24 && <span className="pointer-events-none absolute left-0 top-0 grid place-items-center text-[11px] text-white/70" style={{ width: INC.w + 5, height: INC.h + 5 }}>Incomplete</span>}
      {pick != null && <span className="pointer-events-none absolute right-0 top-0 grid place-items-center" style={{ width: PICK.w + 5, height: PICK.h + 5 }}><PickBox on={pick} /></span>}
      <span className="block px-2 pb-1.5 pt-2.5">
        <span className="block truncate text-center text-[16px] leading-tight">{b.name}</span>
        {/* bust, waist and hips spread evenly, each centred over its label */}
        <span className="mt-2 flex justify-evenly">
          {(["bust", "waist", "hips"] as const).map((k) => <span key={k} className="text-center"><span className="block text-[10px] capitalize leading-none text-white/45">{k}</span><N v={shown(b.measures[k], units)} className="mt-1 block text-[16px] leading-none" /></span>)}
        </span>
      </span>
    </button>
  );
}

// ─── no bodies yet: a cinematic carousel (it moves on by itself; drag it or tap its marks), then one big Set up a body.
//     Its pictures are stand-ins until the real ones are made ───
const DEMO = { sex: "female" as const, measures: { height: 166, bust: 88, waist: 69, hips: 95 } };
const Floor = () => (
  <>
    <span className="pointer-events-none absolute bottom-[10px] left-1/2 h-[26px] w-[120px] -translate-x-1/2 rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgb(240 244 254 / .16), transparent)" }} />
    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[54px] opacity-60 [mask-image:linear-gradient(to_top,#000,transparent)]"
      style={{ backgroundImage: "linear-gradient(rgb(255 255 255 / .07) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .05) 1px, transparent 1px)", backgroundSize: "18px 12px", backgroundPosition: "center bottom" }} />
  </>
);
const SLIDES: { k: string; cap: string; art: ReactNode }[] = [
  { k: "form", cap: "Your body, as a 3D form", art: <><div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div><img src="/start/mannequin-1100.webp" alt="" draggable={false} className="absolute left-1/2 top-[6%] h-[118%] max-w-none -translate-x-1/2 object-contain" /></> },
  { k: "tape", cap: "Measured where it matters", art: <div className="stage-ink absolute inset-0"><span className="absolute inset-x-6 bottom-0 top-6"><Still {...DEMO} shot="bust" className="object-cover object-center" /></span></div> },
  { k: "stage", cap: "Every pattern drafted to it", art: <div className="stage-ink absolute inset-0"><Floor /><span className="absolute inset-x-10 bottom-6 top-8"><Still {...DEMO} /></span></div> },
  { k: "look", cap: "Then make what you love", art: <img src="/auth/look-cliff-rust.webp" alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" /> },
];
function EmptyHero({ onStart }: { onStart: () => void }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(331);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth); return () => ro.disconnect(); }, []);
  useEffect(() => { if (held) return; const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 4500); return () => clearInterval(t); }, [held]);
  return (
    <div className="lg:max-w-[460px]">
      <div className="mt-5 rounded-[32px] p-[7px]" style={RIM}>
        <div ref={box} className="relative h-[min(440px,52dvh)] overflow-hidden rounded-[26px]">
          <motion.div className="absolute inset-y-0 left-0 flex" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
            onDragStart={() => setHeld(true)} onDragEnd={(_, d) => { setHeld(false); if (Math.abs(d.offset.x) > 50) setI((x) => (x + (d.offset.x < 0 ? 1 : SLIDES.length - 1)) % SLIDES.length); }}
            animate={{ x: -i * w }} transition={{ type: "spring", bounce: 0, duration: 0.7 }}>
            {SLIDES.map((s) => <div key={s.k} className="relative h-full shrink-0 overflow-hidden" style={{ width: w }}>{s.art}</div>)}
          </motion.div>
          <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESS }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg/85 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} className="pointer-events-none absolute bottom-10 left-5 right-5 text-[24px] leading-[1.1] tracking-[-.025em]">{SLIDES[i].cap}</motion.p>
          </AnimatePresence>
          <div className="absolute bottom-4 left-5 flex gap-1.5">
            {SLIDES.map((s, k) => <button key={s.k} onClick={() => setI(k)} aria-label={s.cap} className={cx("h-[5px] rounded-full transition-all duration-300", k === i ? "w-5 bg-snow" : "w-[5px] bg-white/35")} />)}
          </div>
        </div>
      </div>
      <Pill className="mt-4 !h-[60px] !text-[17px]" onClick={onStart}>Set up a body</Pill>
      <p className="mt-2.5 text-center text-[14px] text-white/50">Four measurements to start, twenty more<br />when you have time.</p>
    </div>
  );
}

// ─── the library ───
const SORTS = ["Newest first", "Oldest first", "A to Z"] as const;
const STATE = ["Fully measured", "Incomplete"] as const;
const FORM = ["Female", "Male"] as const;
const Many = ({ n }: { n: number }) => <><span className="tabular-nums">{n}</span> {n === 1 ? "body" : "bodies"}</>;
export function Bodies() {
  const { go, set, bodies, startBody, removeBodies, units } = useApp();
  const desk = useDesk();
  const { toast, node } = useToast();
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [sheet, setSheet] = useState<null | "filter" | "delete">(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest first");
  const [st, setSt] = useState<string[]>([]);
  const [fm, setFm] = useState<string[]>([]);
  const list = bodies.filter((b) => b.name.trim());
  const on = [...st.map((x) => ({ k: x, off: () => setSt(st.filter((y) => y !== x)) })), ...fm.map((x) => ({ k: x, off: () => setFm(fm.filter((y) => y !== x)) }))];
  const clear = () => { setSt([]); setFm([]); };
  // newest first: by when each was added (a body with no date sits after the dated ones); bodies already come newest first
  const order = new Map(list.map((b, i) => [b.id, i]));
  const when = (b: Body) => (Number.isFinite(addedAt(b)) ? addedAt(b) : -order.get(b.id)!);
  let shownList = list.filter((b) => (!q.trim() || b.name.toLowerCase().includes(q.trim().toLowerCase()))
    && (!st.length || st.includes(b.done.length >= 24 ? "Fully measured" : "Incomplete")) && (!fm.length || fm.includes(b.sex === "female" ? "Female" : "Male")));
  shownList = [...shownList].sort((a, b) => (sort === "A to Z" ? a.name.localeCompare(b.name) : sort === "Newest first" ? when(b) - when(a) : when(a) - when(b)));
  const all = shownList.length > 0 && shownList.every((b) => picked.includes(b.id));
  const stop = () => { setPicking(false); setPicked([]); };
  const remove = () => { const n = picked.length; removeBodies(picked); setSheet(null); stop(); toast(n === 1 ? "Body deleted" : `${n} bodies deleted`); };
  const footer = picking ? (
    <div className="flex items-center gap-3 pb-1">
      <Pill variant="dark" className="flex-1" onClick={stop}>Cancel</Pill>
      <Pill className={cx("flex-1", !picked.length && "is-off")} onClick={() => picked.length && setSheet("delete")} icon={<Icon name="trash" size={18} />}>{picked.length ? `Delete ${picked.length}` : "Delete"}</Pill>
    </div>
  ) : desk ? undefined : <TabBar tab="bodies" />;
  return (
    <Screen dock={!picking} footer={footer}>
      <div className={cx("flex min-h-11 items-center gap-3 pt-1 lg:pt-2", list.length ? "justify-between" : "justify-center lg:justify-start")}>
        <H1 className="min-w-0">Body library</H1>
        {list.length > 0 && !picking && <Pill className="!h-10 !w-auto shrink-0 gap-1.5 px-4 !text-[15px]" icon={<Icon name="plus" size={18} strokeWidth={2.2} />} onClick={startBody}>New body</Pill>}
      </div>
      {list.length === 0 ? <EmptyHero onStart={startBody} /> : (
        <>
          <div className="mt-4">
            {picking ? (
              <div className="flex h-10 items-center justify-between">
                <span className="text-[15px] text-white/70">{picked.length ? `${picked.length} selected` : "Choose bodies to delete"}</span>
                <button onClick={() => setPicked(all ? [] : shownList.map((b) => b.id))} className="h-10 px-1 text-[15px] font-medium text-peri">{all ? "Clear" : "Select all"}</button>
              </div>
            ) : searching ? <SearchOpen q={q} setQ={setQ} placeholder="Search bodies" onCancel={() => { setSearching(false); setQ(""); }} /> : (
              // finding on the left (Search, Filter and sort), the list on the right (Edit)
              <div className="flex h-10 items-center justify-between">
                <span className="flex items-center gap-2">
                  <ToolBtn icon="search" label="Search" onClick={() => setSearching(true)} />
                  <ToolBtn icon="sliders" label="Filter and sort" n={on.length} onClick={() => setSheet("filter")} />
                </span>
                <ToolBtn icon="select" label="Edit" onClick={() => { setPicking(true); setSearching(false); }} />
              </div>
            )}
          </div>
          <div className="-mx-6 lg:mx-0"><OnChips items={on} onClear={clear} /></div>
          {(on.length > 0 || !!q.trim()) && shownList.length > 0 && <p className="mt-4 text-[14px] text-white/55"><Many n={shownList.length} /></p>}
          {shownList.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-[17px]">No bodies match</p>
              <button onClick={() => { setQ(""); clear(); }} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {shownList.map((b) => <BodyCard key={b.id} b={b} units={units} pick={picking ? picked.includes(b.id) : null}
                onClick={() => (picking ? setPicked((p) => (p.includes(b.id) ? p.filter((y) => y !== b.id) : [...p, b.id])) : (set({ activeBody: b.id }), go("bodyPage")))} />)}
            </div>
          )}
        </>
      )}
      <Sheet open={sheet === "filter"} onClose={() => setSheet(null)}>
        <SheetHead title="Filter and sort" />
        <div className="mt-6">
          <div className="text-[15px] text-white/60">Sort by</div>
          <div className="mt-2.5 flex flex-wrap gap-2">{SORTS.map((x) => <Choice key={x} on={sort === x} onClick={() => setSort(x)}>{x}</Choice>)}</div>
        </div>
        <Group title="Where it stands" items={STATE} value={st} onChange={setSt} />
        <Group title="Form" items={FORM} value={fm} onChange={setFm} />
        <div className="mt-8 flex items-center gap-4">
          <button onClick={clear} disabled={!on.length} className={cx("h-14 shrink-0 px-2 text-[15px] font-medium", on.length ? "text-white/80" : "text-white/30")}>Clear all</button>
          <Pill className="flex-1" onClick={() => setSheet(null)}>{shownList.length ? <>Show <Many n={shownList.length} /></> : "Nothing matches"}</Pill>
        </div>
      </Sheet>
      <Sheet open={sheet === "delete"} onClose={() => setSheet(null)}>
        <SheetHead title={picked.length === 1 ? "Delete this body?" : `Delete ${picked.length} bodies?`}>Their measurements go too. Patterns already made for them stay. This can’t be undone.</SheetHead>
        <Pill className="mt-6" onClick={remove}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setSheet(null)}>{picked.length === 1 ? "Keep it" : "Keep them"}</Pill>
      </Sheet>
      {node}
      <StillMaker />
    </Screen>
  );
}

// ─── a body's own page ───
// the measuring flow's own names for the groups (its progress bar: Base · Around · Lengths · Widths · Seated)
const GROUP_TABS = [{ key: "base", short: "Base" }, ...GROUPS.map((g) => ({ key: g.key, short: g.short }))];
export function BodyPage() {
  const { back, go, units, updateBody, setMeasure, confirmMeasure, removeBodies, newDraft, activeBody } = useApp();
  const body = useApp((s) => s.body());
  const { toast, node } = useToast();
  const [group, setGroup] = useState("base");
  const [dial, setDial] = useState<string | null>(null);
  const [v, setV] = useState(0);
  const [sheet, setSheet] = useState<null | "more" | "rename" | "delete">(null);
  const [name, setName] = useState("");
  const done = new Set(body.done);
  const est = new Set(body.est ?? []);
  const items = ALL_MEASURES.filter((x) => x.group === group);
  const open = (k: string) => { setV(body.measures[k] ?? ALL_MEASURES.find((x) => x.key === k)!.value); setDial(k); };
  const dm = dial ? ALL_MEASURES.find((x) => x.key === dial)! : null;
  const save = () => { if (!dm) return; setMeasure(dm.key, v); confirmMeasure(dm.key); toast(`${dm.label} saved`); setDial(null); };
  const when = added(body);
  const unit = <span className="unit ml-0.5 text-[11px] text-white/45" translate="no">{units}</span>;
  return (
    <Screen footer={<Pill onClick={() => { newDraft({ bodyId: activeBody }); go("prompt", { picked: true }); }}>Make a pattern for this body</Pill>}>
      <TopBar left="back" right="more" onRight={() => setSheet("more")} />
      <div className="lg:mx-auto lg:max-w-[640px]">
        <H1 className="mt-3">{body.name}</H1>
        {/* when it was added, and how complete: one quiet line, all in the body font */}
        <div className="mt-1.5 flex items-center justify-between text-[13px] text-white/55">
          <span>{when ? `Added ${when}` : ""}</span>
          <span>{done.size >= 24 ? "Fully measured" : `${done.size} of 24 measured`}</span>
        </div>
        {/* the body, turning; it stays like this whatever you open below */}
        <BodyStage sex={body.sex} measures={body.measures} turn className="mt-4 h-[226px] rounded-[28px] lg:h-[400px]" />
        {/* which group: a pressed track, the chosen one raised */}
        <div className="ruler-track mt-4 flex h-11 rounded-full p-1">
          {GROUP_TABS.map((g) => (
            <button key={g.key} onClick={() => setGroup(g.key)} className={cx("relative flex-1 rounded-full text-[13px]", g.key === group ? "font-medium text-white" : "text-white/50")}>
              {g.key === group && <motion.span layoutId="bodygroup" className="knob absolute inset-0 rounded-full" transition={{ type: "spring", bounce: 0.18, duration: 0.4 }} />}
              <span className="relative">{g.short}</span>
            </button>
          ))}
        </div>
        {/* the measurements, two to a row, each a flat card with its button: the name over the number and a pencil to
            change it; a scan estimate with a cornflower tick (each is checked once); missing, "Not measured" and a
            cornflower plus */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {items.map((x) => {
            const has = done.has(x.key), guess = est.has(x.key);
            return (
              <button key={x.key} onClick={() => open(x.key)} aria-label={`${guess ? "Check" : has ? "Change" : "Measure"} ${x.label}`} className="card-soft tap flex h-[60px] items-center justify-between gap-2 rounded-[18px] pl-3.5 pr-2.5 text-left">
                <span className="min-w-0">
                  <span className="block truncate text-[12px] leading-none text-white/60">{x.label}{guess && <span className="text-peri"> · estimate</span>}</span>
                  {has || guess
                    ? <span className="mt-1.5 block leading-none"><N v={shown(body.measures[x.key] ?? x.value, units)} className="text-[20px]" />{unit}</span>
                    : <span className="mt-1.5 block text-[13px] leading-none text-white/35">Not measured</span>}
                </span>
                {/* the action: a button you can press. Change: the dark secondary, round, a pencil. Measure (or check a
                    scan estimate): cornflower, a plus (or a tick) */}
                {has && !guess
                  ? <span className="rb !h-9 !w-9 shrink-0" aria-hidden><Icon name="pencil" size={16} /></span>
                  : <span className="pill-primary grid h-9 w-9 shrink-0 place-items-center rounded-full text-white" aria-hidden><Icon name={guess ? "check" : "plus"} size={17} strokeWidth={2.4} /></span>}
              </button>
            );
          })}
        </div>
      </div>
      {/* change one: the 3D body on this measurement (its dashed tape) following the number, and the dial */}
      <Sheet open={!!dm} onClose={() => setDial(null)}>
        {dm && (
          <>
            <SheetHead title={dm.label}>{dm.hint}</SheetHead>
            <div className="stage-ink relative mt-4 h-[230px] overflow-hidden rounded-[24px] border border-white/[.08]">
              <Body3D sex={body.sex} measures={{ ...body.measures, [dm.key]: v }} focus={dm.key} stage="grid" lines="white" turn className="absolute inset-0" />
            </div>
            <div className="dial mt-3 overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-3">
                <RB icon="minus" size={46} onClick={() => setV((x) => Math.max(dm.min, x - 0.5))} label="Minus 0.5" className="rb-plain" />
                <span className="flex items-baseline gap-1.5"><N v={fmt(v, units)} className="text-[44px] leading-none" /><span className="unit text-[14px] text-white/55" translate="no">{units}</span></span>
                <RB icon="plus" size={46} onClick={() => setV((x) => Math.min(dm.max, x + 0.5))} label="Plus 0.5" className="rb-plain" />
              </div>
              <Ruler value={v} min={dm.min} max={dm.max} onChange={setV} className="mt-2" />
            </div>
            <Pill className="mt-5" onClick={save}>Save</Pill>
          </>
        )}
      </Sheet>
      <Sheet open={sheet === "more"} onClose={() => setSheet(null)}>
        <SheetHead title={body.name} />
        <div className="mt-3 divide-y divide-white/8">
          <button onClick={() => { setName(body.name); setSheet("rename"); }} className="flex h-14 w-full items-center gap-3 text-left text-[16px]"><Icon name="pencil" size={19} className="text-white/60" />Rename</button>
          <button onClick={() => setSheet("delete")} className="flex h-14 w-full items-center gap-3 text-left text-[16px]"><Icon name="trash" size={19} className="text-white/60" />Delete this body</button>
        </div>
      </Sheet>
      <Sheet open={sheet === "rename"} onClose={() => setSheet(null)}>
        <SheetHead title="Rename" />
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" enterKeyHint="done" className="ruler-track mt-5 block h-12 w-full rounded-full px-5 text-[16px] text-white outline-none" />
        <Pill className={cx("mt-5", !name.trim() && "is-off")} onClick={() => { if (!name.trim()) return; updateBody({ name: name.trim() }); setSheet(null); toast("Renamed"); }}>Save</Pill>
      </Sheet>
      <Sheet open={sheet === "delete"} onClose={() => setSheet(null)}>
        <SheetHead title={`Delete ${body.name}?`}>Their measurements go too. Patterns already made for them stay. This can’t be undone.</SheetHead>
        <Pill className="mt-6" onClick={() => { removeBodies([body.id]); setSheet(null); back(); }}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setSheet(null)}>Keep it</Pill>
      </Sheet>
      {node}
    </Screen>
  );
}
