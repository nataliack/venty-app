"use client";
/* eslint-disable @next/next/no-img-element */
// Lab (MC 2): the Body library, redrawn around the 3D bodies (25 Oct 2026). Brief from Jose: as rich as the pattern
// library but nothing like it in structure (no trays, carousels or photo tiles); the app's own materials; one body live
// in 3D at a time, every other one a still taken from its own 3D body; at a glance, how complete it is and the key
// numbers; personal by default, with a compact view once there are many. Three directions beside Today, each in three
// states: no bodies yet, three, and twelve. Nothing here is used by the app.
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { cx, Pill, RB } from "@/components/ui";
import { Icon } from "@/components/icons";
import { BodyFigure, Ruler } from "@/components/art";
import { ALL_MEASURES, GROUPS } from "@/lib/data";
import { BodyLoader } from "@/components/BodyLoader";
import { TabBar } from "@/screens/home";
import { SKINS, ToolBtn, SearchOpen, PhoneSheet, SheetTitle, Group, One, OnChips } from "./concepts";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false, loading: () => <BodyLoader /> });

type Sex = "female" | "male";
type M = { height: number; bust: number; waist: number; hips: number };
type B = { id: string; name: string; sex: Sex; m: M; done: number; how: "By hand" | "Photo scan" };
const FEW: B[] = [
  { id: "ana", name: "Ana", sex: "female", m: { height: 166, bust: 88, waist: 69, hips: 95 }, done: 24, how: "By hand" },
  { id: "mum", name: "Mum", sex: "female", m: { height: 158, bust: 104, waist: 90, hips: 110 }, done: 4, how: "Photo scan" },
  { id: "tom", name: "Tom", sex: "male", m: { height: 181, bust: 99, waist: 84, hips: 97 }, done: 12, how: "By hand" },
];
const MANY: B[] = [...FEW,
  { id: "c1", name: "Grace Liu", sex: "female", m: { height: 162, bust: 84, waist: 66, hips: 92 }, done: 24, how: "By hand" },
  { id: "c2", name: "Sam Okafor", sex: "male", m: { height: 175, bust: 104, waist: 92, hips: 101 }, done: 8, how: "Photo scan" },
  { id: "c3", name: "Priya Shah", sex: "female", m: { height: 154, bust: 92, waist: 76, hips: 100 }, done: 24, how: "By hand" },
  { id: "c4", name: "Lucía Romero", sex: "female", m: { height: 170, bust: 90, waist: 72, hips: 98 }, done: 16, how: "By hand" },
  { id: "c5", name: "Ben Walker", sex: "male", m: { height: 186, bust: 102, waist: 88, hips: 99 }, done: 4, how: "By hand" },
  { id: "c6", name: "Mia Tanaka", sex: "female", m: { height: 160, bust: 86, waist: 64, hips: 90 }, done: 24, how: "Photo scan" },
  { id: "c7", name: "Ruth Ellis", sex: "female", m: { height: 163, bust: 110, waist: 96, hips: 114 }, done: 20, how: "By hand" },
  { id: "c8", name: "Jonah Reid", sex: "male", m: { height: 172, bust: 96, waist: 82, hips: 95 }, done: 24, how: "By hand" },
  { id: "c9", name: "Zara Ahmed", sex: "female", m: { height: 168, bust: 94, waist: 74, hips: 102 }, done: 4, how: "Photo scan" },
];
// when each body was added (sample dates for the lab), said as "12 Oct 2026"
const ADDED: Record<string, string> = { ana: "2026-10-12", mum: "2026-10-18", tom: "2026-09-30", c1: "2026-08-14", c2: "2026-10-02", c3: "2026-07-21", c4: "2026-09-09", c5: "2026-10-20", c6: "2026-06-30", c7: "2026-09-17", c8: "2026-08-03", c9: "2026-10-23" };
const addedOf = (b: B) => ADDED[b.id] ?? "2026-10-25";
const dateText = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
const KEYS: [keyof M, string][] = [["height", "Height"], ["bust", "Bust"], ["waist", "Waist"], ["hips", "Hips"]];
type Props = { list: B[] };

// ─── stills: a picture taken once from each body's own 3D body (its own measurements), front on and transparent.
//     One hidden 3D view takes them one after another (phones allow only a few 3D views), and they are kept for the
//     page; until one is ready, the drawn mannequin holds its place ───
type Shot = "whole" | "portrait" | "bust" | "profile";
type Job = { key: string; b: B; shot: Shot; again?: number };
const stills = new Map<string, string>();
const queue: Job[] = [];
const subs = new Set<() => void>();
let version = 0;
const notify = () => { version++; subs.forEach((f) => f()); };
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const keyOf = (b: B, shot: Shot) => `${b.sex}-${b.m.height}-${b.m.bust}-${b.m.waist}-${b.m.hips}-${shot}`;
function useStill(b: B, shot: Shot) {
  useSyncExternalStore(subscribe, () => version, () => 0);
  const key = keyOf(b, shot);
  useEffect(() => { if (!stills.has(key) && !queue.some((j) => j.key === key)) { queue.push({ key, b, shot }); notify(); } }, [key, b, shot]);
  return stills.get(key);
}
// is there a body in the picture (some pixels not see-through in its middle column)?
function hasBody(url: string) {
  return new Promise<boolean>((done) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
      const x = c.getContext("2d"); if (!x) return done(false);
      x.drawImage(im, 0, 0);
      const col = x.getImageData(Math.floor(im.width / 2), 0, 1, im.height).data;
      let n = 0; for (let i = 3; i < col.length; i += 4) if (col[i] > 40) n++;
      done(n > im.height * 0.2);
    };
    im.onerror = () => done(false);
    im.src = url;
  });
}
// a profile: the body turned this far (radians) from facing the camera. Its 3D view runs continuously while it is
// taken (turning), so the turn is drawn before the picture is (on demand, it would not be)
const PROFILE_YAW = 1.3;
export function StillMaker() {
  useSyncExternalStore(subscribe, () => version, () => 0);
  const job = queue[0];
  const id = job ? "still-" + job.key : "";
  useEffect(() => {
    if (!job) return;
    let gone = false, tries = 0;
    const w = window as unknown as { __ventySnap?: Record<string, (k: number) => string>; __ventyFace?: Record<string, (y: number) => void> };
    const take = async () => {
      if (gone) return;
      const snap = w.__ventySnap?.[id];
      if (snap) {
        w.__ventyFace?.[id]?.(job.shot === "profile" ? PROFILE_YAW : 0);
        await new Promise((r) => setTimeout(r, 120));
        const url = snap(2);
        if (await hasBody(url)) { stills.set(job.key, url); queue.shift(); notify(); return; }
      }
      // not drawn in time (a page in the background draws nothing): to the back of the queue, tried twice more
      if (++tries < 40) setTimeout(take, 350); else { queue.shift(); if ((job.again ?? 0) < 2) queue.push({ ...job, again: (job.again ?? 0) + 1 }); notify(); }
    };
    const t = setTimeout(take, 900);
    return () => { gone = true; clearTimeout(t); };
  }, [job, id]);
  if (!job) return null;
  return (
    // the whole body in a tall frame, the waist-up portrait in a square one (so it fills a small tile)
    <div aria-hidden className={cx("pointer-events-none fixed left-0 top-0 -z-10 w-[300px] opacity-0", job.shot === "whole" ? "h-[600px]" : "h-[300px]")}>
      <Body3D key={id} sex={job.b.sex} measures={job.b.m} focus={job.shot === "whole" ? "height" : job.shot === "profile" ? "portrait" : job.shot} whole={job.shot === "whole"} autoRotate={job.shot === "profile"} turn={job.shot === "profile"} stage="none" snapshot={id} className="absolute inset-0" />
    </div>
  );
}
function Still({ b, shot = "whole", className }: { b: B; shot?: Shot; className?: string }) {
  const url = useStill(b, shot);
  return url
    ? <img src={url} alt="" draggable={false} className={cx("h-full w-full", className ?? "object-contain")} />
    : <span className={cx("grid h-full w-full place-items-center opacity-40", className)}><BodyFigure sex={b.sex} width={60} variant="solid" glow={false} className="h-full w-full" /></span>;
}
// the one body live in 3D: only while its phone is on screen, so the page never holds more 3D views than it shows
// room: a share of the view kept clear at the bottom (for words laid over it), the body framed above it
function Live({ b, chart, stage = "grid", focus = "height", room, className }: { b?: B; chart?: boolean; stage?: "grid" | "shadow" | "glow" | "none"; focus?: string; room?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className ?? "relative"}>
      {seen && <Body3D key={b?.id ?? "base"} sex={b?.sex ?? "female"} measures={b?.m ?? {}} focus={focus} whole={focus === "height"} turn stage={stage} chart={chart} room={room} lines="white" className="absolute inset-0" />}
    </div>
  );
}

// ─── shared bits ───
const N = ({ v, className }: { v: number; className?: string }) => <span className={cx("serif", className)}>{v}</span>;
const doneLine = (b: B) => (b.done >= 24 ? "Fully measured" : `${b.done} of 24 measured`);
function Head({ right }: { right?: ReactNode }) {
  return (
    <div className="flex h-11 items-center justify-between gap-3 px-6">
      <h1 className="h1 !text-[34px]">Body library</h1>
      {right}
    </div>
  );
}
// personal or compact, once there are many: a pressed track with the raised knob
function ViewSwitch({ compact, set }: { compact: boolean; set: (c: boolean) => void }) {
  return (
    <span className="ruler-track flex h-10 items-center rounded-full p-1" role="radiogroup" aria-label="Show">
      {[false, true].map((c) => (
        <button key={String(c)} role="radio" aria-checked={compact === c} aria-label={c ? "Compact" : "Personal"} onClick={() => set(c)} className={cx("relative grid h-8 w-11 place-items-center rounded-full transition-colors", compact === c ? "text-white" : "text-white/45")}>
          {compact === c && <motion.span layoutId="bodyview" className="knob absolute inset-0 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
          <Icon name={c ? "grid" : "body"} size={16} className="relative" />
        </button>
      ))}
    </span>
  );
}
// the phone's screen: a scroll area and the real tab bar, on Bodies
function Screen({ children, overlay, onScroll, footer }: { children: ReactNode; overlay?: ReactNode; onScroll?: (el: HTMLDivElement) => void; footer?: ReactNode }) {
  return (
    <LayoutGroup id={useId()}>
      <div data-screen className="absolute inset-0 flex flex-col text-white">
        <div className="dotgrid" />
        <div onScroll={onScroll && ((e) => onScroll(e.currentTarget))} className="noscroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-[124px] pt-[62px]">{children}</div>
        {overlay}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-2">{footer ?? <TabBar tab="bodies" />}</div>
      </div>
    </LayoutGroup>
  );
}
// ═══ Today ═══
function Today({ list }: Props) {
  return (
    <Screen>
      <Head right={list.length ? <button className="h-9 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/85">Edit</button> : undefined} />
      <div className="px-6">
        <label className="field mt-4 flex h-12 items-center gap-2.5 px-4"><Icon name="search" size={18} className="text-white/50" /><span className="text-[15px] text-white/40">Search bodies</span></label>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {list.map((b) => (
            <div key={b.id} className="relative h-[230px] overflow-hidden rounded-[26px] border border-white/10 bg-[#4d5e85]/25 p-4">
              {b.done < 24 && <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2 py-1 text-[11px] font-medium">Incomplete</span>}
              <div className="flex h-[150px] justify-center"><BodyFigure sex={b.sex} width={62} variant="solid" glow={false} /></div>
              <div className="absolute bottom-4 left-4 right-4"><div className="text-[15px] font-medium">{b.name}</div><div className="text-[13px] text-white/65"><span className="serif text-[15px] text-white">{b.done}</span>/24 measures</div></div>
            </div>
          ))}
          <div className="flex h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/25">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Icon name="plus" size={24} /></span>
            <span className="mt-3 text-[15px] font-medium">New body</span><span className="text-[13px] text-white/50">4 measures to start</span>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ═══ Round 3 (25 Oct 2026): Spotlight, refined from Jose's notes. The body in a smaller stage built like the measuring
//     screens' (ink with a faint light from above, the pattern floor), its name faint behind it and its numbers as
//     credits; under it, what to do with this body; then the bodies themselves as raised rows (or wide cards, to
//     compare), each with a face, a name, its marks and its height, the chosen one in snow. Options are always there:
//     Search, Edit (choose and delete) and personal or compact, however few bodies there are ═══
type Sel = "rows" | "cards";
const RIM_D = SKINS.dark.rim, TILE_D = SKINS.dark.tile;
const NewBody = () => <Pill className="!h-10 !w-auto shrink-0 gap-1.5 px-4 !text-[15px]" icon={<Icon name="plus" size={18} strokeWidth={2.2} />}>New body</Pill>;
// the box for choosing, pressed into the row's right end
const PickBox = ({ on }: { on: boolean }) => (
  <span className={cx("grid h-[24px] w-[24px] shrink-0 place-items-center rounded-[7px] transition-colors", on ? "icon-primary text-white" : "")} style={on ? undefined : { boxShadow: "inset 0 0 0 1.5px rgb(255 255 255 / .5)" }}>
    {on && <Icon name="check" size={13} strokeWidth={3} />}
  </span>
);
// one body as a raised row: its face pressed into a tile, the name, its 24 marks and how many, its height. Chosen: snow
function BodyRow({ b, on, compact, pick, onClick, wide }: { b: B; on: boolean; compact: boolean; pick?: boolean | null; onClick: () => void; wide?: boolean }) {
  const snow = on && pick == null;
  return (
    <button onClick={onClick} aria-pressed={pick != null ? pick : on}
      className={cx("tap flex shrink-0 items-center gap-3 p-[5px] pr-4 text-left transition-colors duration-300", compact ? "h-[52px] rounded-[18px] pl-4" : "h-[76px] rounded-[22px]", wide ? "w-[262px] snap-start" : "w-full", snow && "bg-snow text-ink")}
      style={snow ? { boxShadow: "0 10px 24px -14px rgb(0 0 0 / .7)" } : RIM_D}>
      {!compact && (
        <span className="relative h-[66px] w-[54px] shrink-0 overflow-hidden rounded-[17px]" style={snow ? { background: "rgb(52 62 110 / .07)" } : TILE_D}>
          <Still b={b} shot="portrait" className="object-cover object-top" />
          <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: snow ? "inset 0 3px 7px rgb(28 36 84 / .3), inset 0 -1px 0 rgb(255 255 255 / .9)" : "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 -1px 0 rgb(255 255 255 / .06)" }} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] leading-tight">{b.name}</span>
        {!compact && (
          <span className="mt-1.5 flex items-center gap-2">
            <span className={cx("flex items-end gap-[2px]", snow && "[&>span]:!bg-ink/15 [&>span.lit]:!bg-primary")}>
              {Array.from({ length: 24 }, (_, k) => <span key={k} className={cx("w-[2px] rounded-full", k < b.done ? "lit bg-peri" : "bg-white/15")} style={{ height: k % 4 === 3 ? 8 : 5 }} />)}
            </span>
            <span className={cx("text-[12px]", snow ? "text-ink/55" : "text-white/50")}>{b.done >= 24 ? "Fully measured" : `${b.done} of 24`}</span>
          </span>
        )}
      </span>
      {pick != null ? <PickBox on={pick} /> : (
        <span className={cx("shrink-0 text-right text-[12px]", snow ? "text-ink/55" : "text-white/50")}><N v={b.m.height} className={cx("text-[20px]", snow ? "text-ink" : "text-white")} /> cm</span>
      )}
    </button>
  );
}
function Spot({ list: start, sel }: Props & { sel: Sel }) {
  const [gone, setGone] = useState<string[]>([]);
  const list = start.filter((x) => !gone.includes(x.id));
  const [id, setId] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [ask, setAsk] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const b = list.find((x) => x.id === id) ?? list[0];
  const shown = list.filter((x) => !q.trim() || x.name.toLowerCase().includes(q.trim().toLowerCase()));
  // another body: the light dims, a cut, and it comes up on them
  const cut = (x: B) => { if (x.id === b?.id) return; setDark(true); setTimeout(() => { setId(x.id); setDark(false); }, 260); };
  const stop = () => { setPicking(false); setPicked([]); };
  const toggle = (x: B) => setPicked((p) => (p.includes(x.id) ? p.filter((y) => y !== x.id) : [...p, x.id]));
  const all = shown.length > 0 && shown.every((x) => picked.includes(x.id));
  const remove = () => {
    const n = picked.length;
    setGone([...gone, ...picked]); setAsk(false); stop();
    setToast(n === 1 ? "Body deleted" : `${n} bodies deleted`); setTimeout(() => setToast(null), 2200);
  };
  const footer = picking ? (
    <div className="flex items-center gap-3 pb-1">
      <Pill variant="dark" className="flex-1" onClick={stop}>Cancel</Pill>
      <Pill className={cx("flex-1", !picked.length && "is-off")} onClick={() => picked.length && setAsk(true)} icon={<Icon name="trash" size={18} />}>{picked.length ? `Delete ${picked.length}` : "Delete"}</Pill>
    </div>
  ) : undefined;
  const overlay = (
    <>
      <PhoneSheet open={ask} onClose={() => setAsk(false)}>
        <SheetTitle>{picked.length === 1 ? "Delete this body?" : `Delete ${picked.length} bodies?`}</SheetTitle>
        <p className="mt-2 text-[15px] text-white/60">Their measurements go too. Patterns already made for them stay. This can’t be undone.</p>
        <Pill className="mt-6" onClick={remove}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setAsk(false)}>{picked.length === 1 ? "Keep it" : "Keep them"}</Pill>
      </PhoneSheet>
      <AnimatePresence>{toast && <motion.div key="t" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-x-0 bottom-[112px] z-30 flex justify-center"><span className="flex h-10 items-center gap-2 rounded-full bg-snow px-4 text-[14px] font-medium text-ink shadow-[0_10px_30px_-10px_rgb(0_0_0/.6)]"><Icon name="check" size={15} strokeWidth={2.6} />{toast}</span></motion.div>}</AnimatePresence>
    </>
  );
  // the stage: the measuring screens' build (ink, a faint light from above, the pattern floor)
  const stage = (inner: ReactNode, h = 250) => <div className="stage-ink relative mx-6 overflow-hidden rounded-[30px] border border-white/[.08]" style={{ height: h }}>{inner}</div>;
  if (!b) return (
    <Screen footer={footer} overlay={overlay}>
      <div className="flex h-11 items-center justify-between gap-3 px-6"><h1 className="h1 !text-[34px]">Body library</h1></div>
      <div className="mt-5">{stage(<>
        <Live stage="grid" room={0.36} className="absolute inset-0 opacity-50" />
        <div className="absolute inset-x-5 bottom-5 text-center">
          <p className="text-[22px] leading-tight tracking-[-.02em]">Your body, to your measurements</p>
          <p className="mt-1 text-[14px] text-white/55">Four to start, twenty more when you have time.</p>
        </div>
      </>, 420)}</div>
      <div className="mt-4 px-6"><Pill>Set up a body</Pill></div>
    </Screen>
  );
  const first = b.name.split(" ")[0];
  return (
    <Screen footer={footer} overlay={overlay}>
      <div className="flex h-11 items-center justify-between gap-3 px-6"><h1 className="h1 !text-[34px]">Body library</h1>{!picking && <NewBody />}</div>
      {/* the tools, always: finding on the left (Search), the list on the right (Edit, personal or compact) */}
      <div className="mt-4 px-6">
        {picking ? (
          <div className="flex h-10 items-center justify-between">
            <span className="text-[15px] text-white/70">{picked.length ? `${picked.length} selected` : "Choose bodies to delete"}</span>
            <button onClick={() => setPicked(all ? [] : shown.map((x) => x.id))} className="h-10 px-1 text-[15px] font-medium text-peri">{all ? "Clear" : "Select all"}</button>
          </div>
        ) : searching ? <SearchOpen q={q} setQ={setQ} placeholder="Search bodies" onCancel={() => { setSearching(false); setQ(""); }} /> : (
          <div className="flex h-10 items-center justify-between">
            <ToolBtn icon="search" label="Search" onClick={() => setSearching(true)} />
            <span className="flex items-center gap-2">
              <ToolBtn icon="select" label="Edit" onClick={() => { setPicking(true); setSearching(false); }} />
              <ViewSwitch compact={compact} set={setCompact} />
            </span>
          </div>
        )}
      </div>
      {/* the chosen body, live in its stage; its name faint behind it, its numbers as credits */}
      <div className="mt-4">{stage(<>
        <div className={cx("pointer-events-none absolute left-1/2 top-0 h-full w-[300px] -translate-x-1/2 transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")} style={{ background: "radial-gradient(ellipse 40% 90% at 50% 0%, rgb(240 244 254 / .1), transparent 75%)" }} />
        <AnimatePresence mode="wait">
          <motion.p key={b.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-x-0 top-[34px] text-center leading-none tracking-[-.06em] text-snow/[.08]" style={{ fontSize: Math.min(120, 520 / Math.max(3, first.length)) }}>{first}</motion.p>
        </AnimatePresence>
        <Live b={b} stage="grid" room={0.12} className={cx("absolute inset-0 transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")} />
        <div className={cx("pointer-events-none absolute inset-x-4 bottom-3 flex items-end justify-between transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")}>
          <span><span className="block text-[20px] leading-none tracking-[-.02em]">{b.name}</span><span className="mt-1 block text-[12px] text-white/50">{b.how}</span></span>
          <span className="flex gap-3">{KEYS.slice(1).map(([k, l]) => <span key={k} className="text-center"><span className="block text-[10px] text-white/45">{l}</span><N v={b.m[k]} className="text-[17px]" /></span>)}</span>
        </div>
      </>)}</div>
      {/* what to do with this body */}
      {!picking && (
        <div className="mt-3 flex gap-2.5 px-6">
          <Pill variant="dark" className="!h-11 flex-1 !text-[15px]" icon={<Icon name="ruler" size={17} />}>{b.done >= 24 ? "Measurements" : `Finish measuring`}</Pill>
          <Pill variant="white" className="!h-11 flex-1 !text-[15px]" icon={<Icon name="scissors" size={17} />}>Make a pattern</Pill>
        </div>
      )}
      {/* the bodies */}
      {shown.length === 0 ? <p className="mt-8 px-6 text-center text-[15px] text-white/55">No bodies called “{q.trim()}”.</p> : sel === "cards" && !compact ? (
        <div className="noscroll -mb-5 mt-5 flex snap-x snap-mandatory scroll-px-6 gap-2.5 overflow-x-auto px-6 pb-8 pt-1">
          {shown.map((x) => <BodyRow key={x.id} b={x} on={x.id === b.id} compact={false} wide pick={picking ? picked.includes(x.id) : null} onClick={() => (picking ? toggle(x) : cut(x))} />)}
        </div>
      ) : (
        <div className={cx("mt-5 flex flex-col px-6", compact ? "gap-1.5" : "gap-2.5")}>
          {shown.map((x) => <BodyRow key={x.id} b={x} on={x.id === b.id} compact={compact} pick={picking ? picked.includes(x.id) : null} onClick={() => (picking ? toggle(x) : cut(x))} />)}
        </div>
      )}
    </Screen>
  );
}
const SpotRows = (p: Props) => <Spot {...p} sel="rows" />;
// ═══ Round 4 (25 Oct 2026), from Jose's notes on Spotlight · Rows: no big name behind the body; the actions belong to
//     the body (built into its card, on the rim under the stage, like the pattern tray's band); the stage never
//     scrolls away (only the rows scroll, and as they do the stage folds to a waist-up portrait, the camera gliding in);
//     and the body opens into its own page: the measurements in groups, tap one and the camera goes to it on the body
//     with its tape, a sheet with the dial to change it ═══
const PRESS_D = SKINS.dark.press;
type Edits = { m: Record<string, Record<string, number>>; done: Record<string, string[]>; names: Record<string, string>; gone: string[] };
const KEYS_ALL = ALL_MEASURES.map((x) => x.key);
// a body's measurement: what was typed here, else its own base four, else the starting body's
const valueOf = (b: B, k: string, e: Edits) => e.m[b.id]?.[k] ?? (k in b.m ? b.m[k as keyof M] : ALL_MEASURES.find((x) => x.key === k)!.value);
const doneOf = (b: B, e: Edits) => new Set([...KEYS_ALL.slice(0, b.done), ...(e.done[b.id] ?? [])]);
const nameOf = (b: B, e: Edits) => e.names[b.id] ?? b.name;
const toastNode = (t: string | null) => (
  <AnimatePresence>{t && <motion.div key="t" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="pointer-events-none absolute inset-x-0 bottom-[112px] z-50 flex justify-center"><span className="flex h-10 items-center gap-2 rounded-full bg-snow px-4 text-[14px] font-medium text-ink shadow-[0_10px_30px_-10px_rgb(0_0_0/.6)]"><Icon name="check" size={15} strokeWidth={2.6} />{t}</span></motion.div>}</AnimatePresence>
);
function useToastLab() {
  const [t, setT] = useState<string | null>(null);
  const show = (s: string) => { setT(s); setTimeout(() => setT(null), 2200); };
  return { t, show };
}

function Library4({ list: start }: Props) {
  const [e, setE] = useState<Edits>({ m: {}, done: {}, names: {}, gone: [] });
  const [page, setPage] = useState<"list" | "body">("list");
  const [id, setId] = useState<string | null>(null);
  const list = start.filter((x) => !e.gone.includes(x.id)).map((x) => ({ ...x, name: nameOf(x, e), done: doneOf(x, e).size, m: { height: valueOf(x, "height", e), bust: valueOf(x, "bust", e), waist: valueOf(x, "waist", e), hips: valueOf(x, "hips", e) } }));
  const b = list.find((x) => x.id === id) ?? list[0];
  return (
    <LayoutGroup id={useId()}>
      <AnimatePresence initial={false} mode="popLayout">
        {page === "body" && b ? (
          <motion.div key="body" className="absolute inset-0" initial={{ x: 393 }} animate={{ x: 0 }} exit={{ x: 393 }} transition={{ type: "spring", bounce: 0, duration: 0.45 }}>
            <BodyPage b={start.find((x) => x.id === b.id)!} e={e} setE={setE} onBack={() => setPage("list")} />
          </motion.div>
        ) : (
          <motion.div key="list" className="absolute inset-0" initial={{ x: -120, opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -120, opacity: 0.6 }} transition={{ type: "spring", bounce: 0, duration: 0.45 }}>
            <List4 list={list} b={b} setId={setId} onOpen={() => setPage("body")} onDelete={(ids) => setE({ ...e, gone: [...e.gone, ...ids] })} />
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

// the library: a fixed top (title, tools, the chosen body's card) and the rows scrolling under it
function List4({ list, b, setId, onOpen, onDelete }: { list: B[]; b?: B; setId: (id: string) => void; onOpen: () => void; onDelete: (ids: string[]) => void }) {
  const [dark, setDark] = useState(false);
  const [small, setSmall] = useState(false);
  const [compact, setCompact] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [ask, setAsk] = useState(false);
  const { t, show } = useToastLab();
  const shown = list.filter((x) => !q.trim() || x.name.toLowerCase().includes(q.trim().toLowerCase()));
  const cut = (x: B) => { if (x.id === b?.id) return; setDark(true); setTimeout(() => { setId(x.id); setDark(false); }, 260); };
  const stop = () => { setPicking(false); setPicked([]); };
  const all = shown.length > 0 && shown.every((x) => picked.includes(x.id));
  const remove = () => { const n = picked.length; onDelete(picked); setAsk(false); stop(); show(n === 1 ? "Body deleted" : `${n} bodies deleted`); };
  // the rows scroll; past a little, the stage folds to a portrait (and opens again at the top)
  const onScroll = (el: HTMLDivElement) => { if (!small && el.scrollTop > 24) setSmall(true); else if (small && el.scrollTop < 4) setSmall(false); };
  const footer = picking ? (
    <div className="flex items-center gap-3 pb-1">
      <Pill variant="dark" className="flex-1" onClick={stop}>Cancel</Pill>
      <Pill className={cx("flex-1", !picked.length && "is-off")} onClick={() => picked.length && setAsk(true)} icon={<Icon name="trash" size={18} />}>{picked.length ? `Delete ${picked.length}` : "Delete"}</Pill>
    </div>
  ) : <TabBar tab="bodies" />;
  return (
    <div data-screen className="absolute inset-0 flex flex-col text-white">
      <div className="dotgrid" />
      <div className="relative shrink-0 pt-[62px]">
        <div className="flex h-11 items-center justify-between gap-3 px-6"><h1 className="h1 !text-[34px]">Body library</h1>{!picking && b && <NewBody />}</div>
        {b && (
          <div className="mt-4 px-6">
            {picking ? (
              <div className="flex h-10 items-center justify-between">
                <span className="text-[15px] text-white/70">{picked.length ? `${picked.length} selected` : "Choose bodies to delete"}</span>
                <button onClick={() => setPicked(all ? [] : shown.map((x) => x.id))} className="h-10 px-1 text-[15px] font-medium text-peri">{all ? "Clear" : "Select all"}</button>
              </div>
            ) : searching ? <SearchOpen q={q} setQ={setQ} placeholder="Search bodies" onCancel={() => { setSearching(false); setQ(""); }} /> : (
              <div className="flex h-10 items-center justify-between">
                <ToolBtn icon="search" label="Search" onClick={() => setSearching(true)} />
                <span className="flex items-center gap-2">
                  <ToolBtn icon="select" label="Edit" onClick={() => { setPicking(true); setSearching(false); }} />
                  <ViewSwitch compact={compact} set={setCompact} />
                </span>
              </div>
            )}
          </div>
        )}
        {/* the chosen body's card, the pattern tray's build: a raised rim, the stage pressed into it (the measuring
            screens' ink and pattern floor), and on the rim below, what to do with this body */}
        {b ? (
          <div className="mx-6 mt-4 rounded-[30px] p-[7px]" style={RIM_D}>
            <div className="stage-ink relative overflow-hidden rounded-[24px] transition-[height] duration-300 ease-out" style={{ height: small ? 120 : 236 }}>
              <Live b={b} stage="grid" focus={small ? "portrait" : "height"} room={small ? 0 : 0.08} className={cx("absolute inset-0 transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")} />
              <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESS_D }} />
              <div className={cx("pointer-events-none absolute left-4 top-3.5 transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")}>
                <p className="text-[21px] leading-none tracking-[-.02em]">{b.name}</p>
                <p className="mt-1.5 text-[12px] text-white/50">{b.how} · {doneLine(b)}</p>
              </div>
              <div className={cx("pointer-events-none absolute bottom-3 right-4 flex gap-3 transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")}>
                {KEYS.map(([k, l]) => <span key={k} className="text-center"><span className="block text-[10px] text-white/45">{l}</span><N v={b.m[k]} className="text-[17px]" /></span>)}
              </div>
            </div>
            {!picking && (
              <div className="flex gap-[7px] pt-[7px]">
                <Pill variant="dark" className="!h-11 flex-1 !text-[15px]" icon={<Icon name="ruler" size={17} />} onClick={onOpen}>{b.done >= 24 ? "Measurements" : "Finish measuring"}</Pill>
                <Pill variant="white" className="!h-11 flex-1 !text-[15px]" icon={<Icon name="scissors" size={17} />}>Make a pattern</Pill>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-6 mt-5 rounded-[30px] p-[7px]" style={RIM_D}>
            <div className="stage-ink relative h-[380px] overflow-hidden rounded-[24px]">
              <Live stage="grid" room={0.3} className="absolute inset-0 opacity-50" />
              <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESS_D }} />
              <div className="absolute inset-x-5 bottom-5 text-center">
                <p className="text-[22px] leading-tight tracking-[-.02em]">Your body, to your measurements</p>
                <p className="mt-1 text-[14px] text-white/55">Four to start, twenty more when you have time.</p>
              </div>
            </div>
            <div className="pt-[7px]"><Pill className="!h-12">Set up a body</Pill></div>
          </div>
        )}
      </div>
      {/* the rows: the only part that scrolls, fading in under the card */}
      {b && (
        <div onScroll={(ev) => onScroll(ev.currentTarget)} className="noscroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-[124px] pt-4 [mask-image:linear-gradient(to_bottom,transparent,#000_16px)]">
          {shown.length === 0 ? <p className="mt-6 px-6 text-center text-[15px] text-white/55">No bodies called “{q.trim()}”.</p> : (
            <div className={cx("flex flex-col px-6", compact ? "gap-1.5" : "gap-2.5")}>
              {shown.map((x) => <BodyRow key={x.id} b={x} on={x.id === b.id} compact={compact} pick={picking ? picked.includes(x.id) : null} onClick={() => (picking ? setPicked((p) => (p.includes(x.id) ? p.filter((y) => y !== x.id) : [...p, x.id])) : x.id === b.id ? onOpen() : cut(x))} />)}
            </div>
          )}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-2">{footer}</div>
      <PhoneSheet open={ask} onClose={() => setAsk(false)}>
        <SheetTitle>{picked.length === 1 ? "Delete this body?" : `Delete ${picked.length} bodies?`}</SheetTitle>
        <p className="mt-2 text-[15px] text-white/60">Their measurements go too. Patterns already made for them stay. This can’t be undone.</p>
        <Pill className="mt-6" onClick={remove}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setAsk(false)}>{picked.length === 1 ? "Keep it" : "Keep them"}</Pill>
      </PhoneSheet>
      {toastNode(t)}
    </div>
  );
}

// ─── a body's own page: the body live at the top (the camera on the measurement you are looking at, with its tape),
//     the measurements under it in their groups; tap one to change it in a sheet with the dial; rename; delete ───
const GROUP_LIST = [{ key: "base", title: "The first four" }, ...GROUPS.map((g) => ({ key: g.key, title: g.title }))];
// sheetStage: the measure sheet carries the 3D body, the camera on that measurement with its tape (round 5)
function BodyPage({ b, e, setE, onBack, sheetStage, startDial }: { b: B; e: Edits; setE: (e: Edits) => void; onBack: () => void; sheetStage?: boolean; startDial?: string }) {
  const [sel, setSel] = useState(startDial ?? "height");
  const [dial, setDial] = useState<string | null>(startDial ?? null);
  const [v, setV] = useState(() => (startDial ? valueOf(b, startDial, e) : 0));
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const [del, setDel] = useState(false);
  const { t, show } = useToastLab();
  const done = doneOf(b, e);
  const cur = ALL_MEASURES.find((x) => x.key === sel)!;
  const nm = nameOf(b, e);
  const open = (k: string) => { setSel(k); setV(valueOf(b, k, e)); setDial(k); };
  const save = () => {
    if (!dial) return;
    setE({ ...e, m: { ...e.m, [b.id]: { ...(e.m[b.id] ?? {}), [dial]: v } }, done: { ...e.done, [b.id]: [...new Set([...(e.done[b.id] ?? []), dial])] } });
    show(`${ALL_MEASURES.find((x) => x.key === dial)!.label} saved`); setDial(null);
  };
  const dm = dial ? ALL_MEASURES.find((x) => x.key === dial)! : null;
  return (
    <div data-screen className="absolute inset-0 flex flex-col bg-bg text-white">
      <div className="dotgrid" />
      <div className="relative shrink-0 px-6 pt-[62px]">
        <div className="flex h-11 items-center justify-between">
          <button onClick={onBack} aria-label="Back" className="rb"><Icon name="back" size={20} /></button>
          <button onClick={() => { setName(nm); setNaming(true); }} className="h-11 px-1 text-[15px] font-medium text-white/80">Rename</button>
        </div>
        <h1 className="h1 mt-3 !text-[34px]">{nm}</h1>
        <p className="mt-1 text-[14px] text-white/55">{b.how} · {done.size >= 24 ? "Fully measured" : `${done.size} of 24 measured`}</p>
        {/* the body, live; the camera on the measurement you are looking at, its tape round the body */}
        <div className="stage-ink relative mt-4 h-[250px] overflow-hidden rounded-[28px] border border-white/[.08]">
          <Live b={{ ...b, m: { height: valueOf(b, "height", e), bust: valueOf(b, "bust", e), waist: valueOf(b, "waist", e), hips: valueOf(b, "hips", e) } }} stage="grid" focus={sel} className="absolute inset-0" />
          <div className="pointer-events-none absolute bottom-3 left-4">
            <p className="text-[12px] text-white/55">{cur.label}</p>
            <p className="leading-none">{done.has(sel) ? <><N v={valueOf(b, sel, e)} className="text-[34px]" /><span className="unit ml-1 text-[13px] text-white/55" translate="no">cm</span></> : <span className="text-[17px] text-white/60">Not measured yet</span>}</p>
          </div>
        </div>
      </div>
      {/* the measurements, in their groups: raised cards, a row each; tap one to change it */}
      <div className="noscroll relative mt-3 min-h-0 flex-1 overflow-y-auto px-6 pb-[110px] pt-2 [mask-image:linear-gradient(to_bottom,transparent,#000_12px)]">
        {GROUP_LIST.map((g) => {
          const items = ALL_MEASURES.filter((x) => (g.key === "base" ? x.group === "base" : x.group === g.key));
          const n = items.filter((x) => done.has(x.key)).length;
          return (
            <section key={g.key} className="mb-4">
              <div className="mb-2 flex items-baseline justify-between px-1"><h2 className="text-[16px]">{g.title}</h2><span className="text-[12px] text-white/45"><span className="tabular-nums">{n}</span> of {items.length}</span></div>
              <div className="overflow-hidden rounded-[22px]" style={RIM_D}>
                {items.map((x, k) => (
                  <button key={x.key} onClick={() => open(x.key)} className={cx("flex h-12 w-full items-center justify-between px-4 text-left transition-colors", k > 0 && "border-t border-white/[.06]", sel === x.key && "bg-white/[.05]")}>
                    <span className="text-[15px] text-white/80">{x.label}</span>
                    {done.has(x.key) ? <span><N v={valueOf(b, x.key, e)} className="text-[18px]" /><span className="unit ml-1 text-[12px] text-white/45" translate="no">cm</span></span> : <span className="text-[14px] font-medium text-peri">Measure</span>}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        <button onClick={() => setDel(true)} className="mx-auto mt-2 block h-11 text-[15px] font-medium text-white/50">Delete this body</button>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-[34px]"><Pill>Make a pattern for {nm.split(" ")[0]}</Pill></div>
      {/* change one: the dial, as on the measuring steps */}
      <PhoneSheet open={!!dm} onClose={() => setDial(null)}>
        {dm && (
          <>
            <SheetTitle>{dm.label}</SheetTitle>
            <p className="mt-1.5 text-[15px] leading-snug text-white/60">{dm.hint}</p>
            {/* the body itself, so you see what you change: the camera on this measurement, its dashed tape round the
                body, following the number as you move it */}
            {sheetStage && (
              <div className="stage-ink relative mt-4 h-[230px] overflow-hidden rounded-[24px] border border-white/[.08]">
                <Live b={{ ...b, m: { height: valueOf(b, "height", e), bust: valueOf(b, "bust", e), waist: valueOf(b, "waist", e), hips: valueOf(b, "hips", e), [dm.key]: v } as M }} stage="grid" focus={dm.key} className="absolute inset-0" />
              </div>
            )}
            <div className={cx("dial overflow-hidden", sheetStage ? "mt-3" : "mt-5")}>
              <div className="flex items-center justify-between px-3 pt-3">
                <RB icon="minus" size={46} onClick={() => setV((x) => Math.max(dm.min, x - 0.5))} label="Minus 0.5" className="rb-plain" />
                <span className="flex items-baseline gap-1.5"><N v={v} className="text-[44px] leading-none" /><span className="unit text-[14px] text-white/55" translate="no">cm</span></span>
                <RB icon="plus" size={46} onClick={() => setV((x) => Math.min(dm.max, x + 0.5))} label="Plus 0.5" className="rb-plain" />
              </div>
              <Ruler value={v} min={dm.min} max={dm.max} onChange={setV} className="mt-2" />
            </div>
            <Pill className="mt-5" onClick={save}>Save</Pill>
          </>
        )}
      </PhoneSheet>
      <PhoneSheet open={naming} onClose={() => setNaming(false)}>
        <SheetTitle>Rename</SheetTitle>
        <input value={name} onChange={(ev) => setName(ev.target.value)} aria-label="Name" className="ruler-track mt-5 block h-12 w-full rounded-full px-5 text-[16px] text-white outline-none" />
        <Pill className={cx("mt-5", !name.trim() && "is-off")} onClick={() => { if (!name.trim()) return; setE({ ...e, names: { ...e.names, [b.id]: name.trim() } }); setNaming(false); show("Renamed"); }}>Save</Pill>
      </PhoneSheet>
      <PhoneSheet open={del} onClose={() => setDel(false)}>
        <SheetTitle>Delete {nm}?</SheetTitle>
        <p className="mt-2 text-[15px] text-white/60">Their measurements go too. Patterns already made for them stay. This can’t be undone.</p>
        <Pill className="mt-6" onClick={() => { setE({ ...e, gone: [...e.gone, b.id] }); setDel(false); onBack(); }}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setDel(false)}>Keep it</Pill>
      </PhoneSheet>
      {toastNode(t)}
    </div>
  );
}

// ═══ Round 5 (25 Oct 2026), from Jose's notes: the bodies as cards again, the size of today's, in the raised build
//     (a rim, the body's own still pressed into a small stage), the name and its numbers under it, "Incomplete" on the
//     ones not finished; a card opens the body's page. With no bodies, one big Set up a body under a cinematic carousel.
//     Changing a measurement: the sheet carries the 3D body itself, the camera on that measurement with its dashed
//     tape, so you see what you are changing ═══
// the floor of a small stage: a soft light where the body stands and a few pattern lines going back
const MiniFloor = () => (
  <>
    <span className="pointer-events-none absolute bottom-[10px] left-1/2 h-[26px] w-[120px] -translate-x-1/2 rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgb(240 244 254 / .16), transparent)" }} />
    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[54px] opacity-60 [mask-image:linear-gradient(to_top,#000,transparent)]"
      style={{ backgroundImage: "linear-gradient(rgb(255 255 255 / .07) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .05) 1px, transparent 1px)", backgroundSize: "18px 12px", backgroundPosition: "center bottom" }} />
  </>
);
// ─── raised corners: a corner of the card's stage cut away (a CSS mask), so the rim rises into it, its inner corner
//     rounded and curving into the stage's edges, its shadow falling on the stage. "Incomplete" sits in the top-left one;
//     choosing (Edit) raises a second at the top right with its box. w × h: the cut; f: the curve into the edges; rb:
//     its inner corner. The pattern library's lifted corner, on either side ───
type Notch = { side: "l" | "r"; w: number; h: number; f?: number; rb?: number };
const notchPath = ({ w, h, f = 8, rb = 10 }: Notch) => {
  const W = w + f;
  return `M${f} 0H${W}V${h}H${f + rb}A${rb} ${rb} 0 0 1 ${f} ${h - rb}Z M0 0H${f}V${f}A${f} ${f} 0 0 0 0 0Z M${W - f} ${h}H${W}V${h + f}A${f} ${f} 0 0 0 ${W - f} ${h}Z`;
};
// drawn as for the top right; the top left is the same mirrored
const notchSvg = (n: Notch, body: string) => {
  const W = n.w + (n.f ?? 8), H = n.h + (n.f ?? 8);
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'>${n.side === "r" ? body : `<g transform='translate(${W} 0) scale(-1 1)'>${body}</g>`}</svg>`;
};
function notchMask(ns: Notch[]): CSSProperties {
  if (!ns.length) return {};
  const urls = ns.map((n) => `url("data:image/svg+xml,${encodeURIComponent(notchSvg(n, `<path d='${notchPath(n)}'/>`))}")`);
  const img = [...urls, "linear-gradient(#000, #000)"].join(", ");
  const pos = [...ns.map((n) => (n.side === "r" ? "top right" : "top left")), "0 0"].join(", ");
  const size = [...ns.map((n) => `${n.w + (n.f ?? 8)}px ${n.h + (n.f ?? 8)}px`), "100% 100%"].join(", ");
  return { WebkitMaskImage: img, maskImage: img, WebkitMaskPosition: pos, maskPosition: pos, WebkitMaskSize: size, maskSize: size, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskComposite: "xor", maskComposite: "exclude" };
}
// the raised corner's shadow on the stage (drawn inside it, so the cut takes the rest away)
function NotchShade({ n }: { n: Notch }) {
  const W = n.w + (n.f ?? 8), H = n.h + (n.f ?? 8);
  return (
    <svg width={W} height={H} className={cx("pointer-events-none absolute top-0 overflow-visible", n.side === "r" ? "right-0" : "left-0")} aria-hidden>
      <g transform={n.side === "r" ? undefined : `translate(${W} 0) scale(-1 1)`}><path d={notchPath(n)} transform="translate(-1 2.5)" fill="#000" opacity={0.75} style={{ filter: "blur(3.5px)" }} /></g>
    </svg>
  );
}
const INC: Notch = { side: "l", w: 84, h: 24 };
const PICK: Notch = { side: "r", w: 34, h: 34, rb: 13 };
function BodyCard({ b, onClick, pick }: { b: B; onClick: () => void; pick?: boolean | null }) {
  const notches = [...(b.done < 24 ? [INC] : []), ...(pick != null ? [PICK] : [])];
  return (
    <button onClick={onClick} aria-pressed={pick ?? undefined} className="tap relative block w-full rounded-[24px] p-[5px] text-left" style={RIM_D}>
      <span className="stage-ink relative block h-[150px] overflow-hidden rounded-[19px]" style={notchMask(notches)}>
        {/* face and shoulders, in profile, a soft light behind (a picture taken from the body's own 3D form) */}
        <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 70% at 70% 30%, rgb(104 126 245 / .16), transparent 70%)" }} />
        <span className="absolute inset-0 overflow-hidden"><Still b={b} shot="profile" className="origin-top scale-[2] object-cover object-top" /></span>
        <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESS_D }} />
        {notches.map((n) => <NotchShade key={n.side} n={n} />)}
        <span className="absolute inset-x-0 bottom-2 text-center text-[11px] text-ink/60"><N v={b.m.height} className="text-[15px] text-ink" /> cm</span>
      </span>
      {/* in the raised corners: the word, and the box when choosing */}
      {b.done < 24 && <span className="pointer-events-none absolute left-0 top-0 grid place-items-center text-[11px] text-white/70" style={{ width: INC.w + 5, height: INC.h + 5 }}>Incomplete</span>}
      {pick != null && <span className="pointer-events-none absolute right-0 top-0 grid place-items-center" style={{ width: PICK.w + 5, height: PICK.h + 5 }}><PickBox on={pick} /></span>}
      <span className="block px-2 pb-1.5 pt-2.5">
        <span className="block truncate text-center text-[16px] leading-tight">{b.name}</span>
        {/* the three numbers spread evenly, each centred over its own label */}
        <span className="mt-2 flex justify-evenly">
          {KEYS.slice(1).map(([k, l]) => <span key={k} className="text-center"><span className="block text-[10px] leading-none text-white/45">{l}</span><N v={b.m[k]} className="mt-1 block text-[16px] leading-none" /></span>)}
        </span>
      </span>
    </button>
  );
}

// ─── no bodies yet: a cinematic carousel (it moves on by itself; drag it too), then one big Set up a body ───
const DEMO: B = { id: "demo", name: "", sex: "female", m: { height: 166, bust: 88, waist: 69, hips: 95 }, done: 24, how: "By hand" };
const SLIDES: { k: string; cap: string; art: ReactNode }[] = [
  { k: "form", cap: "Your body, as a 3D form", art: <><div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div><img src="/start/mannequin-1100.webp" alt="" draggable={false} className="absolute left-1/2 top-[6%] h-[118%] max-w-none -translate-x-1/2 object-contain" /></> },
  { k: "tape", cap: "Measured where it matters", art: <div className="stage-ink absolute inset-0"><span className="absolute inset-x-6 bottom-0 top-6"><Still b={DEMO} shot="bust" className="object-cover object-center" /></span></div> },
  { k: "stage", cap: "Every pattern drafted to it", art: <div className="stage-ink absolute inset-0"><MiniFloor /><span className="absolute inset-x-10 bottom-6 top-8"><Still b={DEMO} /></span></div> },
  { k: "look", cap: "Then make what you love", art: <img src="/auth/look-cliff-rust.webp" alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" /> },
];
function EmptyHero() {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => { if (held) return; const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 4500); return () => clearInterval(t); }, [held]);
  const W = 331;
  return (
    <>
      <div className="mx-6 mt-5 rounded-[32px] p-[7px]" style={RIM_D}>
        <div className="relative h-[440px] overflow-hidden rounded-[26px]">
          <motion.div className="absolute inset-y-0 left-0 flex" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
            onDragStart={() => setHeld(true)} onDragEnd={(_, d) => { setHeld(false); if (Math.abs(d.offset.x) > 50) setI((x) => (x + (d.offset.x < 0 ? 1 : SLIDES.length - 1)) % SLIDES.length); }}
            animate={{ x: -i * W }} transition={{ type: "spring", bounce: 0, duration: 0.7 }}>
            {SLIDES.map((s) => <div key={s.k} className="relative h-[440px] shrink-0 overflow-hidden" style={{ width: W }}>{s.art}</div>)}
          </motion.div>
          <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: PRESS_D }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg/85 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} className="pointer-events-none absolute bottom-10 left-5 right-5 text-[24px] leading-[1.1] tracking-[-.025em]">{SLIDES[i].cap}</motion.p>
          </AnimatePresence>
          <div className="absolute bottom-4 left-5 flex gap-1.5">
            {SLIDES.map((s, k) => <button key={s.k} onClick={() => setI(k)} aria-label={s.cap} className={cx("h-[5px] rounded-full transition-all duration-300", k === i ? "w-5 bg-snow" : "w-[5px] bg-white/35")} />)}
          </div>
        </div>
      </div>
      <div className="mt-4 px-6">
        <Pill className="!h-[60px] !text-[17px]">Set up a body</Pill>
        <p className="mt-2.5 text-center text-[14px] text-white/50">Four measurements to start, twenty more<br />when you have time.</p>
      </div>
    </>
  );
}

function Library5({ list: start, initial = "list", dial, body, group }: Props & { initial?: "list" | "body"; dial?: string; body?: string; group?: string }) {
  const [e, setE] = useState<Edits>({ m: {}, done: {}, names: {}, gone: [] });
  const [page, setPage] = useState<"list" | "body">(initial);
  const [id, setId] = useState<string | null>(body ?? null);
  const list = start.filter((x) => !e.gone.includes(x.id)).map((x) => ({ ...x, name: nameOf(x, e), done: doneOf(x, e).size, m: { height: valueOf(x, "height", e), bust: valueOf(x, "bust", e), waist: valueOf(x, "waist", e), hips: valueOf(x, "hips", e) } }));
  const b = list.find((x) => x.id === id) ?? list[0];
  return (
    <LayoutGroup id={useId()}>
      <AnimatePresence initial={false} mode="popLayout">
        {page === "body" && b ? (
          <motion.div key="body" className="absolute inset-0" initial={{ x: 393 }} animate={{ x: 0 }} exit={{ x: 393 }} transition={{ type: "spring", bounce: 0, duration: 0.45 }}>
            <BodyPage5 b={start.find((x) => x.id === b.id)!} e={e} setE={setE} onBack={() => setPage("list")} startDial={dial} startGroup={group} />
          </motion.div>
        ) : (
          <motion.div key="list" className="absolute inset-0" initial={{ x: -120, opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -120, opacity: 0.6 }} transition={{ type: "spring", bounce: 0, duration: 0.45 }}>
            <List5 list={list} onOpen={(x) => { setId(x.id); setPage("body"); }} onDelete={(ids) => setE({ ...e, gone: [...e.gone, ...ids] })} />
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
// filter and sort the bodies, as on the pattern library: one sheet, a count on its button, removable chips for what is on
const BSORTS = ["Newest first", "Oldest first", "A to Z"] as const;
const BSTATE = ["Fully measured", "Incomplete"] as const;
const BFORM = ["Female", "Male"] as const;
const Bodies = ({ n }: { n: number }) => <><span className="tabular-nums">{n}</span> {n === 1 ? "body" : "bodies"}</>;
function List5({ list, onOpen, onDelete }: { list: B[]; onOpen: (b: B) => void; onDelete: (ids: string[]) => void }) {
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [ask, setAsk] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [sort, setSort] = useState<(typeof BSORTS)[number]>("Newest first");
  const [st, setSt] = useState<string[]>([]);
  const [fm, setFm] = useState<string[]>([]);
  const { t, show } = useToastLab();
  const on = [...st.map((x) => ({ k: x, off: () => setSt(st.filter((y) => y !== x)) })), ...fm.map((x) => ({ k: x, off: () => setFm(fm.filter((y) => y !== x)) }))];
  const clear = () => { setSt([]); setFm([]); };
  let shown = list.filter((x) => (!q.trim() || x.name.toLowerCase().includes(q.trim().toLowerCase()))
    && (!st.length || st.includes(x.done >= 24 ? "Fully measured" : "Incomplete")) && (!fm.length || fm.includes(x.sex === "female" ? "Female" : "Male")));
  shown = [...shown].sort((a, b) => (sort === "A to Z" ? a.name.localeCompare(b.name) : sort === "Newest first" ? addedOf(b).localeCompare(addedOf(a)) : addedOf(a).localeCompare(addedOf(b))));
  const stop = () => { setPicking(false); setPicked([]); };
  const all = shown.length > 0 && shown.every((x) => picked.includes(x.id));
  const remove = () => { const n = picked.length; onDelete(picked); setAsk(false); stop(); show(n === 1 ? "Body deleted" : `${n} bodies deleted`); };
  const footer = picking ? (
    <div className="flex items-center gap-3 pb-1">
      <Pill variant="dark" className="flex-1" onClick={stop}>Cancel</Pill>
      <Pill className={cx("flex-1", !picked.length && "is-off")} onClick={() => picked.length && setAsk(true)} icon={<Icon name="trash" size={18} />}>{picked.length ? `Delete ${picked.length}` : "Delete"}</Pill>
    </div>
  ) : undefined;
  return (
    <Screen footer={footer} overlay={<>
      <PhoneSheet open={ask} onClose={() => setAsk(false)}>
        <SheetTitle>{picked.length === 1 ? "Delete this body?" : `Delete ${picked.length} bodies?`}</SheetTitle>
        <p className="mt-2 text-[15px] text-white/60">Their measurements go too. Patterns already made for them stay. This can’t be undone.</p>
        <Pill className="mt-6" onClick={remove}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setAsk(false)}>{picked.length === 1 ? "Keep it" : "Keep them"}</Pill>
      </PhoneSheet>
      <PhoneSheet open={sheet} onClose={() => setSheet(false)}>
        <SheetTitle>Filter and sort</SheetTitle>
        <One title="Sort by" items={BSORTS} value={sort} onChange={setSort} />
        <Group title="Where it stands" items={BSTATE} value={st as (typeof BSTATE)[number][]} onChange={setSt} />
        <Group title="Form" items={BFORM} value={fm as (typeof BFORM)[number][]} onChange={setFm} />
        <div className="mt-8 flex items-center gap-4">
          <button onClick={clear} disabled={!on.length} className={cx("h-14 shrink-0 px-2 text-[15px] font-medium", on.length ? "text-white/80" : "text-white/30")}>Clear all</button>
          <Pill className="flex-1" onClick={() => setSheet(false)}>{shown.length ? <>Show <Bodies n={shown.length} /></> : "Nothing matches"}</Pill>
        </div>
      </PhoneSheet>
      {toastNode(t)}
    </>}>
      <div className={cx("flex h-11 items-center gap-3 px-6", list.length ? "justify-between" : "justify-center")}><h1 className="h1 !text-[34px]">Body library</h1>{list.length > 0 && !picking && <NewBody />}</div>
      {list.length === 0 ? <EmptyHero /> : (
        <>
          <div className="mt-4 px-6">
            {picking ? (
              <div className="flex h-10 items-center justify-between">
                <span className="text-[15px] text-white/70">{picked.length ? `${picked.length} selected` : "Choose bodies to delete"}</span>
                <button onClick={() => setPicked(all ? [] : shown.map((x) => x.id))} className="h-10 px-1 text-[15px] font-medium text-peri">{all ? "Clear" : "Select all"}</button>
              </div>
            ) : searching ? <SearchOpen q={q} setQ={setQ} placeholder="Search bodies" onCancel={() => { setSearching(false); setQ(""); }} /> : (
              // finding on the left (Search, Filter and sort), the list on the right (Edit)
              <div className="flex h-10 items-center justify-between">
                <span className="flex items-center gap-2">
                  <ToolBtn icon="search" label="Search" onClick={() => setSearching(true)} />
                  <ToolBtn icon="sliders" label="Filter and sort" n={on.length} onClick={() => setSheet(true)} />
                </span>
                <ToolBtn icon="select" label="Edit" onClick={() => { setPicking(true); setSearching(false); }} />
              </div>
            )}
          </div>
          <OnChips items={on} onClear={clear} />
          {(on.length > 0 || !!q.trim()) && shown.length > 0 && <p className="mt-4 px-6 text-[14px] text-white/55"><Bodies n={shown.length} /></p>}
          {shown.length === 0 ? (
            <div className="mt-10 px-6 text-center">
              <p className="text-[17px]">No bodies match</p>
              <button onClick={() => { setQ(""); clear(); }} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 px-6">
              {shown.map((x) => <BodyCard key={x.id} b={x} pick={picking ? picked.includes(x.id) : null} onClick={() => (picking ? setPicked((p) => (p.includes(x.id) ? p.filter((y) => y !== x.id) : [...p, x.id])) : onOpen(x))} />)}
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
// ─── round 5's body page: the body turning at the top, always the same (opening a measurement never moves it); the
//     measurements as raised tiles you can tap, one group at a time (a pressed switch picks the group), so nothing
//     needs scrolling; a measurement opens the sheet with the 3D body on that measurement and its tape; Rename and
//     Delete under the "more" button ───
// the measuring flow's own names for the groups (its progress bar: Base · Around · Lengths · Widths · Seated)
const GROUP_TABS = [{ key: "base", short: "Base" }, ...GROUPS.map((g) => ({ key: g.key, short: g.short }))];
function BodyPage5({ b, e, setE, onBack, startDial, startGroup }: { b: B; e: Edits; setE: (e: Edits) => void; onBack: () => void; startDial?: string; startGroup?: string }) {
  const [group, setGroup] = useState(startGroup ?? "base");
  const [dial, setDial] = useState<string | null>(startDial ?? null);
  const [v, setV] = useState(() => (startDial ? valueOf(b, startDial, e) : 0));
  const [more, setMore] = useState(false);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const [del, setDel] = useState(false);
  const { t, show } = useToastLab();
  const done = doneOf(b, e);
  const nm = nameOf(b, e);
  const m4 = { height: valueOf(b, "height", e), bust: valueOf(b, "bust", e), waist: valueOf(b, "waist", e), hips: valueOf(b, "hips", e) };
  const items = ALL_MEASURES.filter((x) => x.group === group);
  const open = (k: string) => { setV(valueOf(b, k, e)); setDial(k); };
  const save = () => {
    if (!dial) return;
    setE({ ...e, m: { ...e.m, [b.id]: { ...(e.m[b.id] ?? {}), [dial]: v } }, done: { ...e.done, [b.id]: [...new Set([...(e.done[b.id] ?? []), dial])] } });
    show(`${ALL_MEASURES.find((x) => x.key === dial)!.label} saved`); setDial(null);
  };
  const dm = dial ? ALL_MEASURES.find((x) => x.key === dial)! : null;
  return (
    <div data-screen className="absolute inset-0 flex flex-col bg-bg text-white">
      <div className="dotgrid" />
      <div className="relative px-6 pt-[62px]">
        <div className="flex h-11 items-center justify-between">
          <button onClick={onBack} aria-label="Back" className="rb"><Icon name="back" size={20} /></button>
          <button onClick={() => setMore(true)} aria-label="More" className="rb"><Icon name="more" size={20} /></button>
        </div>
        <h1 className="h1 mt-3 !text-[34px]">{nm}</h1>
        {/* when it was added, and how complete: one quiet line, all in the body font */}
        <div className="mt-1.5 flex items-center justify-between text-[13px] text-white/55">
          <span>Added {dateText(addedOf(b))}</span>
          <span>{done.size >= 24 ? "Fully measured" : `${done.size} of 24 measured`}</span>
        </div>
        {/* the body, turning; it stays like this whatever you open below */}
        <div className="stage-ink relative mt-4 h-[226px] overflow-hidden rounded-[28px] border border-white/[.08]">
          <Live b={{ ...b, m: m4 }} stage="grid" className="absolute inset-0" />
        </div>
        {/* which group: a pressed track, the chosen one raised */}
        <div className="ruler-track mt-4 flex h-11 rounded-full p-1">
          {GROUP_TABS.map((g) => (
            <button key={g.key} onClick={() => setGroup(g.key)} className={cx("relative flex-1 rounded-full text-[13px]", g.key === group ? "font-medium text-white" : "text-white/50")}>
              {g.key === group && <motion.span layoutId="bodygroup" className="knob absolute inset-0 rounded-full" transition={{ type: "spring", bounce: 0.18, duration: 0.4 }} />}
              <span className="relative">{g.short}</span>
            </button>
          ))}
        </div>
        {/* the measurements, two to a row. Measured: a raised tile, the name over the number, a pencil to change it.
            Missing: the tile pressed in and empty, "Not measured", the periwinkle add. Tap either for the sheet */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {items.map((x) => done.has(x.key) ? (
            <button key={x.key} onClick={() => open(x.key)} aria-label={`Change ${x.label}`} className="pill-dark tap flex h-[60px] items-center justify-between gap-2 rounded-[18px] pl-3.5 pr-2.5 text-left">
              <span className="min-w-0">
                <span className="block truncate text-[12px] leading-none text-white/60">{x.label}</span>
                <span className="mt-1.5 block leading-none"><N v={valueOf(b, x.key, e)} className="text-[20px]" /><span className="unit ml-0.5 text-[11px] text-white/45" translate="no">cm</span></span>
              </span>
              <span className="iconbadge grid h-8 w-8 shrink-0 place-items-center rounded-[10px]"><Icon name="pencil" size={15} /></span>
            </button>
          ) : (
            <button key={x.key} onClick={() => open(x.key)} aria-label={`Measure ${x.label}`} className="ruler-track tap flex h-[60px] items-center justify-between gap-2 rounded-[18px] pl-3.5 pr-2.5 text-left">
              <span className="min-w-0">
                <span className="block truncate text-[12px] leading-none text-white/60">{x.label}</span>
                <span className="mt-1.5 block text-[13px] leading-none text-white/35">Not measured</span>
              </span>
              <span className="icon-primary grid h-8 w-8 shrink-0 place-items-center rounded-full text-white"><Icon name="plus" size={16} strokeWidth={2.4} /></span>
            </button>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-[34px]"><Pill>Make a pattern for {nm.split(" ")[0]}</Pill></div>
      <PhoneSheet open={!!dm} onClose={() => setDial(null)}>
        {dm && (
          <>
            <SheetTitle>{dm.label}</SheetTitle>
            <p className="mt-1.5 text-[15px] leading-snug text-white/60">{dm.hint}</p>
            {/* the body itself, the camera on this measurement, its dashed tape round it, following the number */}
            <div className="stage-ink relative mt-4 h-[230px] overflow-hidden rounded-[24px] border border-white/[.08]">
              <Live b={{ ...b, m: { ...m4, [dm.key]: v } as M }} stage="grid" focus={dm.key} className="absolute inset-0" />
            </div>
            <div className="dial mt-3 overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-3">
                <RB icon="minus" size={46} onClick={() => setV((x) => Math.max(dm.min, x - 0.5))} label="Minus 0.5" className="rb-plain" />
                <span className="flex items-baseline gap-1.5"><N v={v} className="text-[44px] leading-none" /><span className="unit text-[14px] text-white/55" translate="no">cm</span></span>
                <RB icon="plus" size={46} onClick={() => setV((x) => Math.min(dm.max, x + 0.5))} label="Plus 0.5" className="rb-plain" />
              </div>
              <Ruler value={v} min={dm.min} max={dm.max} onChange={setV} className="mt-2" />
            </div>
            <Pill className="mt-5" onClick={save}>Save</Pill>
          </>
        )}
      </PhoneSheet>
      <PhoneSheet open={more} onClose={() => setMore(false)}>
        <SheetTitle>{nm}</SheetTitle>
        <div className="mt-4 divide-y divide-white/8">
          <button onClick={() => { setMore(false); setName(nm); setNaming(true); }} className="flex h-14 w-full items-center gap-3 text-left text-[16px]"><Icon name="pencil" size={19} className="text-white/60" />Rename</button>
          <button onClick={() => { setMore(false); setDel(true); }} className="flex h-14 w-full items-center gap-3 text-left text-[16px]"><Icon name="trash" size={19} className="text-white/60" />Delete this body</button>
        </div>
      </PhoneSheet>
      <PhoneSheet open={naming} onClose={() => setNaming(false)}>
        <SheetTitle>Rename</SheetTitle>
        <input value={name} onChange={(ev) => setName(ev.target.value)} aria-label="Name" className="ruler-track mt-5 block h-12 w-full rounded-full px-5 text-[16px] text-white outline-none" />
        <Pill className={cx("mt-5", !name.trim() && "is-off")} onClick={() => { if (!name.trim()) return; setE({ ...e, names: { ...e.names, [b.id]: name.trim() } }); setNaming(false); show("Renamed"); }}>Save</Pill>
      </PhoneSheet>
      <PhoneSheet open={del} onClose={() => setDel(false)}>
        <SheetTitle>Delete {nm}?</SheetTitle>
        <p className="mt-2 text-[15px] text-white/60">Their measurements go too. Patterns already made for them stay. This can’t be undone.</p>
        <Pill className="mt-6" onClick={() => { setE({ ...e, gone: [...e.gone, b.id] }); setDel(false); onBack(); }}>Delete</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setDel(false)}>Keep it</Pill>
      </PhoneSheet>
      {toastNode(t)}
    </div>
  );
}
const IMAGE_IDEAS = [
  "A soft tape measure round a waist, low light, a cornflower rim light from one side, the rest falling into the dark.",
  "Close on the 3D form at the bust, the dashed tape running round it, on the night stage (we can render this from the app).",
  "Someone standing against a wall of height marks, lit from the side, their shadow on the marks.",
  "A flat lay on a cutting mat: tape measure, chalk, pins and paper pattern pieces, shot from above, deep shadows.",
  "A figure behind frosted glass, only the outline sharp, with a tape across it: measured, never exposed.",
  "Over the shoulder: a phone showing the 3D body beside the real person in a mirror, same pose.",
];

const DIRS: { k: string; name: string; note: string; C: (p: Props) => ReactNode }[] = [
  { k: "r5", name: "Round 5 · Cards", note: "The bodies as cards the size of today’s, in the raised build: a rim, each body’s own still pressed into a small stage with a floor, “Incomplete” pressed in on the ones not finished, the height in the corner; under it the name, bust, waist and hips. A card opens the body’s page. No bodies: one big Set up a body under a cinematic carousel (it moves on by itself, or drag it). Changing a measurement: the sheet carries the 3D body, the camera on that measurement with its dashed tape, following the number.", C: Library5 },
  { k: "r4", name: "Spotlight · Round 4", note: "No big name behind the body. The chosen body’s card is the pattern tray’s build: the stage (the measuring screens’ ink and pattern floor) pressed into a raised rim, and on the rim below it, what to do with this body. Only the rows scroll; as they do, the stage folds to a waist-up portrait (the camera glides in) and opens again at the top. Tap the chosen row, or Measurements, to open the body’s own page: tap a measurement and the camera goes to it with its tape, and a sheet with the dial changes it; Rename; Delete.", C: Library4 },
  { k: "rows", name: "Round 3 · Rows", note: "Round 3 as it was, for comparison.", C: SpotRows },
];

function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3 max-[424px]:[zoom:.86]">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[55px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">{children}</div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

export function BodyLab() {
  const [d, setD] = useState("r5");
  const [n, setN] = useState<"none" | "few" | "many">("few");
  const c = DIRS.find((x) => x.k === d)!;
  const list = n === "none" ? [] : n === "few" ? FEW : MANY;
  return (
    <section>
      <div className="max-w-[1000px]">
        <h1 className="h1 !text-[34px]">Body library</h1>
        <p className="mt-2 max-w-[640px] text-[16px] leading-snug text-white/60">Every screen side by side, Today on the right. One body is live in 3D at a time; the others are stills taken from their own 3D body (they appear as they are made).</p>
        <div className="noscroll mt-6 flex gap-2 overflow-x-auto">
          {DIRS.map((x) => <button key={x.k} onClick={() => setD(x.k)} className={cx("h-11 shrink-0 rounded-full px-5 text-[15px] font-medium transition-colors", x.k === d ? "bg-snow text-ink" : "bg-card text-white/75 hover:text-white")}>{x.name}</button>)}
        </div>
        <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/70">{c.note}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="w-[150px] text-[15px] text-white/55">Bodies</span>
          {([["none", "None yet"], ["few", "Three"], ["many", "Twelve"]] as const).map(([k, l]) => <button key={k} onClick={() => setN(k)} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", n === k ? "bg-snow text-ink" : "bg-card text-white/75 hover:text-white")}>{l}</button>)}
        </div>
      </div>
      <div key={d + n} className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-10">
        {d === "r5" ? (
          <>
            <Phone label="The library"><Library5 list={list} /></Phone>
            <Phone label="No bodies yet"><Library5 list={[]} /></Phone>
            <Phone label="A body’s page (Tom, Lengths: some missing)"><Library5 list={FEW} initial="body" body="tom" group="down" /></Phone>
            <Phone label="Changing a measurement"><Library5 list={FEW} initial="body" dial="bust" /></Phone>
          </>
        ) : <Phone label={c.name}><c.C list={list} /></Phone>}
        <Phone label="Today"><Today list={list} /></Phone>
      </div>
      {d === "r5" && (
        <div className="mt-10 max-w-[680px]">
          <h2 className="text-[22px] tracking-[-.02em]">Pictures for the empty carousel</h2>
          <p className="mt-2 text-[15px] text-white/60">Today it uses stand-ins: the start screen’s mannequin, two pictures taken from the 3D body, and a sign-up look. Ideas for the real set, cinematic and dark with a cornflower light:</p>
          <ul className="mt-3 flex flex-col gap-2">{IMAGE_IDEAS.map((x) => <li key={x} className="text-[15px] leading-snug text-white/70">{x}</li>)}</ul>
        </div>
      )}
      <StillMaker />
    </section>
  );
}
