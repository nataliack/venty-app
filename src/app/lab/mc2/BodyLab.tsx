"use client";
/* eslint-disable @next/next/no-img-element */
// Lab (MC 2): the Body library, redrawn around the 3D bodies (25 Oct 2026). Brief from Jose: as rich as the pattern
// library but nothing like it in structure (no trays, carousels or photo tiles); the app's own materials; one body live
// in 3D at a time, every other one a still taken from its own 3D body; at a glance, how complete it is and the key
// numbers; personal by default, with a compact view once there are many. Three directions beside Today, each in three
// states: no bodies yet, three, and twelve. Nothing here is used by the app.
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { cx, Pill } from "@/components/ui";
import { Icon } from "@/components/icons";
import { BodyFigure } from "@/components/art";
import { BodyLoader } from "@/components/BodyLoader";
import { TabBar } from "@/screens/home";

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
const KEYS: [keyof M, string][] = [["height", "Height"], ["bust", "Bust"], ["waist", "Waist"], ["hips", "Hips"]];
type Props = { list: B[] };

// ─── stills: a picture taken once from each body's own 3D body (its own measurements), front on and transparent.
//     One hidden 3D view takes them one after another (phones allow only a few 3D views), and they are kept for the
//     page; until one is ready, the drawn mannequin holds its place ───
type Shot = "whole" | "portrait";
type Job = { key: string; b: B; shot: Shot };
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
        w.__ventyFace?.[id]?.(0);
        await new Promise((r) => setTimeout(r, 120));
        const url = snap(2);
        if (await hasBody(url)) { stills.set(job.key, url); queue.shift(); notify(); return; }
      }
      if (++tries < 40) setTimeout(take, 350); else { queue.shift(); notify(); }
    };
    const t = setTimeout(take, 900);
    return () => { gone = true; clearTimeout(t); };
  }, [job, id]);
  if (!job) return null;
  return (
    // the whole body in a tall frame, the waist-up portrait in a square one (so it fills a small tile)
    <div aria-hidden className={cx("pointer-events-none fixed left-0 top-0 -z-10 w-[300px] opacity-0", job.shot === "portrait" ? "h-[300px]" : "h-[600px]")}>
      <Body3D key={id} sex={job.b.sex} measures={job.b.m} focus={job.shot === "portrait" ? "portrait" : "height"} whole={job.shot === "whole"} autoRotate={false} stage="none" snapshot={id} className="absolute inset-0" />
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
function Live({ b, chart, stage = "grid", focus = "height", room, className }: { b?: B; chart?: boolean; stage?: "grid" | "shadow" | "none"; focus?: string; room?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className ?? "relative"}>
      {seen && <Body3D key={b?.id ?? "base"} sex={b?.sex ?? "female"} measures={b?.m ?? {}} focus={focus} whole turn stage={stage} chart={chart} room={room} lines="white" className="absolute inset-0" />}
    </div>
  );
}

// ─── shared bits ───
const N = ({ v, className }: { v: number; className?: string }) => <span className={cx("serif", className)}>{v}</span>;
const Unit = () => <span className="unit ml-0.5 text-[12px] text-white/45" translate="no">cm</span>;
// how complete: 24 ticks like the marks on a tape, the measured ones lit
function Ticks({ n, className, tall = 10 }: { n: number; className?: string; tall?: number }) {
  return (
    <span className={cx("flex items-end gap-[3px]", className)} aria-label={`${n} of 24 measurements`}>
      {Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("w-[2px] rounded-full", i < n ? "bg-peri" : "bg-white/15")} style={{ height: i % 4 === 3 ? tall : tall * 0.6 }} />)}
    </span>
  );
}
const doneLine = (b: B) => (b.done >= 24 ? "Fully measured" : `${b.done} of 24 measured`);
function Head({ right }: { right?: ReactNode }) {
  return (
    <div className="flex h-11 items-center justify-between gap-3 px-6">
      <h1 className="h1 !text-[34px]">Body library</h1>
      {right}
    </div>
  );
}
const NewBody = () => <Pill className="!h-10 !w-auto shrink-0 gap-1.5 px-4 !text-[15px]" icon={<Icon name="plus" size={18} strokeWidth={2.2} />}>New body</Pill>;
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
// with many: how many, and personal or compact, on a row of their own under the title (beside it, the title wrapped)
const Many = ({ n, compact, set }: { n: number; compact: boolean; set: (c: boolean) => void }) => (
  <div className="mt-4 flex h-10 items-center justify-between px-6">
    <span className="text-[14px] text-white/55"><span className="tabular-nums">{n}</span> bodies</span>
    <ViewSwitch compact={compact} set={set} />
  </div>
);
// the phone's screen: a scroll area and the real tab bar, on Bodies
function Screen({ children, overlay, onScroll }: { children: ReactNode; overlay?: ReactNode; onScroll?: (el: HTMLDivElement) => void }) {
  return (
    <LayoutGroup id={useId()}>
      <div data-screen className="absolute inset-0 flex flex-col text-white">
        <div className="dotgrid" />
        <div onScroll={onScroll && ((e) => onScroll(e.currentTarget))} className="noscroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-[124px] pt-[62px]">{children}</div>
        {overlay}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-2"><TabBar tab="bodies" /></div>
      </div>
    </LayoutGroup>
  );
}
// a compact row, for the many: the body's face (a portrait still) pressed into a tile, the name, how complete, height
function CompactRow({ b, on, onClick }: { b: B; on?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx("tap flex w-full items-center gap-3 rounded-[20px] px-2 py-2 text-left transition-colors", on && "bg-white/[.05]")}>
      <span className="iconbadge relative h-[52px] w-[44px] shrink-0 overflow-hidden rounded-[13px]"><Still b={b} shot="portrait" className="object-cover object-top" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] leading-tight">{b.name}</span>
        <span className="mt-1.5 flex items-center gap-2"><Ticks n={b.done} tall={8} /></span>
      </span>
      <span className="shrink-0 text-right text-[13px] text-white/55"><N v={b.m.height} className="text-[17px] text-white" /><Unit /></span>
    </button>
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

// ═══ A · Line-up: the chosen body large and live before a height wall; everyone else stands on one floor beneath,
//     at their real heights, to tap ═══
function Readout({ b }: { b: B }) {
  return (
    <div className="ruler-track mx-6 mt-3 grid grid-cols-4 rounded-[20px] py-3">
      {KEYS.map(([k, l], i) => (
        <div key={k} className={cx("text-center", i > 0 && "border-l border-white/8")}>
          <div className="text-[12px] text-white/50">{l}</div>
          <div className="mt-0.5"><N v={b.m[k]} className="text-[22px]" /><Unit /></div>
        </div>
      ))}
    </div>
  );
}
function LineUp({ list }: Props) {
  const [sel, setSel] = useState(0);
  const [compact, setCompact] = useState(false);
  const b = list[Math.min(sel, list.length - 1)];
  const many = list.length > 6;
  const tallest = Math.max(...list.map((x) => x.m.height), 180);
  if (!b) return (
    <Screen>
      <Head />
      <div className="stage-ink relative mx-6 mt-5 h-[420px] overflow-hidden rounded-[32px] border border-white/[.08]">
        <Live chart room={0.4} className="absolute inset-0 opacity-60" />
        <div className="absolute inset-x-5 bottom-5 text-center">
          <p className="text-[24px] leading-[1.12] tracking-[-.025em]">Your body,<br />to your measurements</p>
          <Pill className="mt-4">Set up a body</Pill>
        </div>
      </div>
      <p className="mt-5 px-6 text-center text-[15px] text-white/50">Everyone you measure stands here, side by side.</p>
    </Screen>
  );
  return (
    <Screen>
      <Head right={<NewBody />} />
      {many && <Many n={list.length} compact={compact} set={setCompact} />}
      {compact ? (
        <div className="mt-4 px-4">{list.map((x, i) => <CompactRow key={x.id} b={x} on={i === sel} onClick={() => { setSel(i); setCompact(false); }} />)}</div>
      ) : (
        <>
          {/* the chosen one, live: turning on the pattern floor, height lines on the wall behind */}
          <div className="stage-ink relative mx-6 mt-5 h-[340px] overflow-hidden rounded-[32px] border border-white/[.08]">
            <Live b={b} chart className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-5 top-4 flex items-start justify-between">
              <div>
                <p className="text-[26px] leading-none tracking-[-.025em]">{b.name}</p>
                <p className="mt-1.5 text-[13px] text-white/55">{b.how}</p>
              </div>
            </div>
            <div className="absolute inset-x-5 bottom-4 flex items-center justify-between gap-3">
              <Ticks n={b.done} />
              <span className="text-[13px] text-white/60">{b.done >= 24 ? "Fully measured" : <button className="pointer-events-auto font-medium text-peri">Finish measuring</button>}</span>
            </div>
          </div>
          <Readout b={b} />
          {/* everyone, standing on one floor at their real heights; the chosen one under a snow name */}
          <div className="noscroll mt-6 flex items-end gap-1 overflow-x-auto px-6 pb-1">
            {list.map((x, i) => (
              <button key={x.id} onClick={() => setSel(i)} className="flex w-[64px] shrink-0 flex-col items-center">
                <span className={cx("block w-full transition-opacity", i === sel ? "opacity-100" : "opacity-55")} style={{ height: 120 * (x.m.height / tallest) }}><Still b={x} /></span>
                <span className={cx("mt-2 max-w-full truncate rounded-full px-2 py-0.5 text-[12px]", i === sel ? "bg-snow font-medium text-ink" : "text-white/55")}>{x.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <div className="mx-6 -mt-[26px] h-px bg-white/15" />
          <div className="h-[26px]" />
        </>
      )}
    </Screen>
  );
}

// ═══ B · Pages: one body to a page, scrolled up and down; the body tall in the middle, live on the page you are on,
//     tapes at bust, waist and hips carrying their numbers out to the side, and a tape of 24 ticks up the left edge ═══
const PAGE_H = 560;
function Page({ b, live }: { b: B; live: boolean }) {
  // where the tapes cross the body, as a share of its height from the top (the body framed head to toe)
  const at: [keyof M, string, number][] = [["bust", "Bust", 0.29], ["waist", "Waist", 0.39], ["hips", "Hips", 0.5]];
  return (
    <section className="relative shrink-0 snap-start" style={{ height: PAGE_H }}>
      <div className="absolute inset-x-6 top-0">
        <p className="text-[30px] leading-none tracking-[-.03em]">{b.name}</p>
        <p className="mt-2 text-[14px] text-white/55"><N v={b.m.height} className="text-[16px] text-white" /><Unit /> tall · {b.how}</p>
      </div>
      {/* a tape up the left edge: 24 marks, the measured ones lit, the count at its foot */}
      <div className="absolute bottom-[36px] left-6 top-[88px] flex flex-col items-start justify-between" aria-label={doneLine(b)}>
        {Array.from({ length: 24 }, (_, i) => 23 - i).map((i) => <span key={i} className={cx("h-[2px] rounded-full", i < b.done ? "bg-peri" : "bg-white/15")} style={{ width: i % 4 === 3 ? 14 : 8 }} />)}
      </div>
      <p className="absolute bottom-2 left-6 text-[12px] text-white/55"><N v={b.done} className="text-[15px] text-white" /> of 24</p>
      <div className="absolute bottom-[36px] left-[70px] right-[110px] top-[88px]">
        {live ? <Live b={b} stage="shadow" className="absolute inset-0" /> : <Still b={b} />}
        {at.map(([k, l, y]) => (
          <div key={k} className="pointer-events-none absolute left-[38%] right-[-104px] flex items-center" style={{ top: `${y * 100}%` }}>
            <span className="h-px flex-1 border-t border-dashed border-peri/70" />
            <span className="ml-2 w-[72px] text-[12px] leading-tight text-white/55">{l}<br /><N v={b.m[k]} className="text-[18px] text-white" /><Unit /></span>
          </div>
        ))}
      </div>
    </section>
  );
}
function Pages({ list }: Props) {
  const [at, setAt] = useState(0);
  const [compact, setCompact] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);
  const many = list.length > 6;
  const go = (i: number) => { setCompact(false); setAt(i); requestAnimationFrame(() => scroller.current?.scrollTo({ top: i * PAGE_H, behavior: "smooth" })); };
  if (!list.length) return (
    <Screen>
      <Head />
      <div className="relative mx-6 mt-6 h-[560px]">
        <Live className="absolute inset-x-10 bottom-[150px] top-0 opacity-60" stage="shadow" />
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="text-[24px] leading-[1.12] tracking-[-.025em]">Measure your first body</p>
          <p className="mt-2 text-[15px] text-white/55">Four measurements to start, the other<br />twenty when you have time.</p>
          <Pill className="mt-4">Set up a body</Pill>
        </div>
      </div>
    </Screen>
  );
  return (
    <Screen>
      <Head right={<NewBody />} />
      {many && <Many n={list.length} compact={compact} set={setCompact} />}
      {compact ? (
        // the many: a grid of the bodies standing, three to a row, their names and marks under them
        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 px-6">
          {list.map((b, i) => (
            <button key={b.id} onClick={() => go(i)} className="tap flex flex-col items-center">
              <span className="stage-ink block h-[150px] w-full overflow-hidden rounded-[20px] border border-white/[.08] px-3 pt-3"><Still b={b} /></span>
              <span className="mt-2 block max-w-full truncate text-[14px]">{b.name}</span>
              <Ticks n={b.done} tall={7} className="mt-1 !gap-[2px]" />
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* who is here: their names in a row, the one you are on in snow; tap one to go to their page */}
          <div className="noscroll mt-4 flex gap-2 overflow-x-auto px-6">
            {list.map((b, i) => <button key={b.id} onClick={() => go(i)} className={cx("h-9 shrink-0 rounded-full px-4 text-[14px] transition-colors", i === at ? "bg-snow font-medium text-ink" : "pill-dark text-white/75")}>{b.name}</button>)}
          </div>
          <div ref={scroller} onScroll={(e) => setAt(Math.round(e.currentTarget.scrollTop / PAGE_H))} className="noscroll mt-5 flex snap-y snap-mandatory flex-col overflow-y-auto" style={{ height: PAGE_H }}>
            {list.map((b, i) => <Page key={b.id} b={b} live={i === at} />)}
          </div>
        </>
      )}
    </Screen>
  );
}

// ═══ C · Ledger: a measurement chart, like a tailor's book: the bodies in rows, their numbers in columns that line
//     up; the open row shows its body live, with what to do next ═══
function Ledger({ list }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  const [compact, setCompact] = useState(list.length > 6);
  const many = list.length > 6;
  if (!list.length) return (
    <Screen>
      <Head />
      <div className="mx-6 mt-5 grid grid-cols-[1fr_repeat(4,44px)] gap-x-1 border-b border-white/10 pb-2 text-[12px] text-white/45">
        <span>Body</span>{KEYS.map(([, l]) => <span key={l} className="text-right">{l}</span>)}
      </div>
      <div className="stage-ink relative mx-6 mt-4 h-[430px] overflow-hidden rounded-[28px] border border-white/[.08]">
        <Live chart room={0.4} className="absolute inset-0 opacity-60" />
        <div className="absolute inset-x-5 bottom-5 text-center">
          <p className="text-[22px] leading-tight tracking-[-.02em]">No bodies yet</p>
          <p className="mt-1.5 text-[15px] text-white/55">Every body you measure gets a line here.</p>
          <Pill className="mt-4">Set up a body</Pill>
        </div>
      </div>
    </Screen>
  );
  return (
    <Screen>
      <Head right={<NewBody />} />
      {many && <Many n={list.length} compact={compact} set={(c) => { setCompact(c); setOpen(c ? null : 0); }} />}
      <div className="mx-6 mt-5 grid grid-cols-[1fr_repeat(4,44px)] items-end gap-x-1 border-b border-white/10 pb-2 text-[12px] text-white/45">
        <span>Body</span>{KEYS.map(([, l]) => <span key={l} className="text-right">{l}</span>)}
      </div>
      <div className="mx-6">
        {list.map((b, i) => {
          const isOpen = open === i;
          return (
            <div key={b.id} className="border-b border-white/8">
              <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="grid w-full grid-cols-[1fr_repeat(4,44px)] items-center gap-x-1 py-2.5 text-left">
                <span className="flex min-w-0 items-center gap-2.5">
                  {!compact && <span className="iconbadge relative h-[48px] w-[40px] shrink-0 overflow-hidden rounded-[12px]"><Still b={b} shot="portrait" className="object-cover object-top" /></span>}
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] leading-tight">{b.name}</span>
                    <Ticks n={b.done} tall={7} className="mt-1.5 !gap-[2px]" />
                  </span>
                </span>
                {KEYS.map(([k]) => <span key={k} className={cx("text-right", b.done < 4 && k !== "height" ? "text-white/30" : "")}><N v={b.m[k]} className="text-[16px]" /></span>)}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} className="overflow-hidden">
                    <div className="stage-ink relative mb-3 h-[330px] overflow-hidden rounded-[24px] border border-white/[.08]">
                      <Live b={b} chart className="absolute inset-0" />
                      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                        <span className="text-[13px] text-white/60">{b.how}<br />{doneLine(b)}</span>
                        <span className="flex flex-col items-end gap-2">
                          {b.done < 24 && <button className="text-[14px] font-medium text-peri">Finish measuring</button>}
                          <Pill variant="white" className="!h-10 !w-auto px-4 !text-[14px]">Make a pattern</Pill>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <p className="mt-4 px-6 text-[13px] text-white/40">All in cm. Faded numbers are the starting body, not yet measured.</p>
    </Screen>
  );
}

const DIRS: { k: string; name: string; note: string; C: (p: Props) => ReactNode }[] = [
  { k: "lineup", name: "A · Line-up", note: "The chosen body large and live before a wall of height lines, its key numbers in a pressed readout under it; everyone else standing on one floor beneath, at their real heights, to tap. With many: a compact list (face, name, the 24 marks, height).", C: LineUp },
  { k: "pages", name: "B · Pages", note: "One body to a page, scrolled up and down: the body tall in the middle (live on the page you are on), dashed tapes at bust, waist and hips carrying their numbers out to the side, and a tape of 24 marks up the left edge for how complete it is. Names in a row above to jump. With many: a grid of them standing.", C: Pages },
  { k: "ledger", name: "C · Ledger", note: "A tailor’s measurement chart: a row per body, the key numbers in columns that line up, the 24 marks under each name; the open row shows the body live with what to do next. With many it starts compact (no faces), one tap from the personal view.", C: Ledger },
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
  const [d, setD] = useState("lineup");
  const [n, setN] = useState<"none" | "few" | "many">("few");
  const c = DIRS.find((x) => x.k === d)!;
  const list = n === "none" ? [] : n === "few" ? FEW : MANY;
  return (
    <section className="mx-auto max-w-[1000px]">
      <h1 className="h1 !text-[34px]">Body library</h1>
      <p className="mt-2 max-w-[640px] text-[16px] leading-snug text-white/60">Around the 3D bodies: one live at a time, the others stills taken from their own 3D body (they appear as they are made; the drawn mannequin holds their place until then). Three directions beside Today.</p>
      <div className="noscroll mt-6 flex gap-2 overflow-x-auto">
        {DIRS.map((x) => <button key={x.k} onClick={() => setD(x.k)} className={cx("h-11 shrink-0 rounded-full px-5 text-[15px] font-medium transition-colors", x.k === d ? "bg-snow text-ink" : "bg-card text-white/75 hover:text-white")}>{x.name}</button>)}
      </div>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/70">{c.note}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="w-[150px] text-[15px] text-white/55">Bodies</span>
        {([["none", "None yet"], ["few", "Three"], ["many", "Twelve"]] as const).map(([k, l]) => <button key={k} onClick={() => setN(k)} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", n === k ? "bg-snow text-ink" : "bg-card text-white/75 hover:text-white")}>{l}</button>)}
      </div>
      <div key={d + n} className="mt-8 flex flex-wrap justify-center gap-x-14 gap-y-10">
        <Phone label="Today"><Today list={list} /></Phone>
        <Phone label={c.name}><c.C list={list} /></Phone>
      </div>
      <StillMaker />
    </section>
  );
}
