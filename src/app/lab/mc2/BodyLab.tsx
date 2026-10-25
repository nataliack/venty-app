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
import { SKINS, ToolBtn, SearchOpen, PhoneSheet, SheetTitle } from "./concepts";

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

// ═══ Round 2 (25 Oct 2026): "more cinematic". Full-bleed and dark, no cards: the body is the picture, the words are
//     titles and credits laid over it, and moving between bodies is a cut or a camera move ═══

// the full-bleed screen: the stage behind everything, the title and New body over its top, the tab bar over its foot
function Cine({ children, top, overlay, scroll, onScroll }: { children: ReactNode; top?: ReactNode; overlay?: ReactNode; scroll?: boolean; onScroll?: (el: HTMLDivElement) => void }) {
  return (
    <LayoutGroup id={useId()}>
      <div data-screen className="absolute inset-0 overflow-hidden bg-bg text-white">
        {scroll ? <div onScroll={onScroll && ((e) => onScroll(e.currentTarget))} className="noscroll absolute inset-0 overflow-y-auto overflow-x-hidden">{children}</div> : children}
        {/* a soft shade under the status bar and the title, and over the tab bar, so the words read on any frame */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[150px] bg-gradient-to-b from-bg via-bg/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[150px] bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute inset-x-6 top-[58px] z-20 flex h-10 items-center justify-between gap-3">
          <span className="text-[20px] tracking-[-.02em]">Body library</span>
          {top}
        </div>
        {overlay}
        <div className="absolute inset-x-0 bottom-0 z-30 px-6 pb-2"><TabBar tab="bodies" /></div>
      </div>
    </LayoutGroup>
  );
}
const NewBodyRound = () => <button aria-label="New body" className="tap grid h-10 w-10 place-items-center rounded-full pill-primary"><Icon name="plus" size={20} strokeWidth={2.2} /></button>;
// the many: personal or compact, beside New body
const TopTools = ({ many, compact, set }: { many: boolean; compact: boolean; set: (c: boolean) => void }) => (
  <span className="flex items-center gap-2">{many && <ViewSwitch compact={compact} set={set} />}<NewBodyRound /></span>
);
// the numbers as credits: four short columns, the label small over the number
function Credits({ b, className }: { b: B; className?: string }) {
  return (
    <div className={cx("flex justify-center gap-6", className)}>
      {KEYS.map(([k, l]) => (
        <div key={k} className="text-center">
          <div className="text-[11px] text-white/45">{l}</div>
          <div className="mt-0.5 leading-none"><N v={b.m[k]} className="text-[20px]" /></div>
        </div>
      ))}
    </div>
  );
}
// compact, for the many: end credits. Names centred one under the other, each with its height and how complete it is,
// and a small still beside; tap one to see them on the stage
function CastList({ list, onPick }: { list: B[]; onPick: (i: number) => void }) {
  return (
    <div className="noscroll absolute inset-0 overflow-y-auto px-6 pb-[140px] pt-[124px]">
      <p className="text-center text-[13px] text-white/40">The cast</p>
      <div className="mt-4 flex flex-col">
        {list.map((b, i) => (
          <button key={b.id} onClick={() => onPick(i)} className="tap grid grid-cols-[36px_1fr_36px] items-center gap-3 border-b border-white/[.06] py-3 text-left">
            <span className="h-[52px]"><Still b={b} className="object-contain opacity-80" /></span>
            <span className="text-center">
              <span className="block text-[19px] leading-tight tracking-[-.02em]">{b.name}</span>
              <span className="mt-1 block text-[12px] text-white/45"><N v={b.m.height} className="text-[13px] text-white/70" /> cm · {doneLine(b)}</span>
            </span>
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ A · Spotlight: a dark stage and one light from above; the body stands in it, live, its name huge behind it; the
//     numbers as credits; the others wait at the foot as silhouettes. Choosing another dims the light, cuts, and
//     brings it up on them ═══
function Spotlight({ list }: Props) {
  const [i, setI] = useState(0);
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const many = list.length > 6;
  const b = list[Math.min(i, list.length - 1)];
  const cut = (n: number) => { setCompact(false); if (n === i) return; setDark(true); setTimeout(() => { setI(n); setDark(false); }, 280); };
  const light = (
    <>
      {/* the light: a cone from the top, brightest where it lands */}
      <div className={cx("pointer-events-none absolute left-1/2 top-0 h-[640px] w-[420px] -translate-x-1/2 transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")}
        style={{ background: "radial-gradient(ellipse 34% 100% at 50% 0%, rgb(240 244 254 / .13), rgb(240 244 254 / .04) 55%, transparent 75%)" }} />
      <div className={cx("pointer-events-none absolute left-1/2 top-[548px] h-[70px] w-[260px] -translate-x-1/2 rounded-[50%] transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")}
        style={{ background: "radial-gradient(closest-side, rgb(240 244 254 / .2), rgb(104 126 245 / .08) 60%, transparent)" }} />
    </>
  );
  if (!b) return (
    <Cine top={<NewBodyRound />}>
      {light}
      <div className="absolute inset-x-6 top-[300px] text-center">
        <p className="text-[30px] leading-[1.08] tracking-[-.03em]">The stage is set</p>
        <p className="mt-2 text-[15px] text-white/55">Measure someone and they stand here,<br />in their own shape.</p>
      </div>
      <div className="absolute inset-x-6 bottom-[120px] z-20"><Pill>Set up a body</Pill></div>
    </Cine>
  );
  const size = Math.min(150, 620 / Math.max(3, b.name.split(" ")[0].length));
  return (
    <Cine top={<TopTools many={many} compact={compact} set={setCompact} />}>
      {compact ? <CastList list={list} onPick={cut} /> : (
        <>
          {light}
          {/* the name behind the body, huge and faint */}
          <AnimatePresence mode="wait">
            <motion.p key={b.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}
              className="pointer-events-none absolute inset-x-0 top-[150px] text-center leading-none tracking-[-.06em] text-snow/[.09]" style={{ fontSize: size }}>
              {b.name.split(" ")[0]}
            </motion.p>
          </AnimatePresence>
          <Live b={b} stage="none" className={cx("absolute inset-x-0 bottom-[240px] top-[110px] transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")} />
          {/* the credits */}
          <div className={cx("absolute inset-x-6 bottom-[176px] z-20 text-center transition-opacity duration-300", dark ? "opacity-0" : "opacity-100")}>
            <p className="text-[24px] leading-none tracking-[-.02em]">{b.name}</p>
            <p className="mt-1.5 text-[12px] text-white/45">{b.how} · {doneLine(b)}{b.done < 24 && <> · <span className="text-peri">Finish</span></>}</p>
            <Credits b={b} className="mt-3" />
          </div>
          {/* the others, waiting at the foot as silhouettes; the one on stage lit */}
          {/* centred while they fit; a row that runs past the edges scrolls from its start (a centred overflow would hide it) */}
          <div className="noscroll absolute inset-x-0 bottom-[100px] z-20 overflow-x-auto px-6">
            <div className="mx-auto flex w-max gap-3">
            {list.map((x, n) => (
              <button key={x.id} onClick={() => cut(n)} aria-label={x.name} className="flex w-[30px] shrink-0 flex-col items-center gap-1">
                <span className={cx("block h-[58px] w-full transition-[filter,opacity] duration-300", n === i ? "" : "opacity-70 [filter:brightness(.18)]")}><Still b={x} /></span>
                <span className={cx("h-[2px] w-4 rounded-full", n === i ? "bg-peri" : "bg-transparent")} />
              </button>
            ))}
            </div>
          </div>
        </>
      )}
    </Cine>
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
const SpotCards = (p: Props) => <Spot {...p} sel="cards" />;

const DIRS: { k: string; name: string; note: string; C: (p: Props) => ReactNode }[] = [
  { k: "rows", name: "Spotlight · Rows", note: "The body in a smaller stage built like the measuring screens (ink, a faint light from above, the pattern floor), its name faint behind it, its numbers as credits; Finish measuring and Make a pattern under it; then every body as a raised row with its face, name, marks and height, the chosen one in snow. Search, Edit and personal or compact are always there.", C: SpotRows },
  { k: "cards", name: "Spotlight · Wide cards", note: "The same, with the bodies as wide raised cards you swipe sideways under the stage (compact still lists them as rows).", C: SpotCards },
  { k: "spotlight", name: "Spotlight (round 2)", note: "Round 2 as it was: the full-bleed dark stage and the silhouettes at the foot, for comparison.", C: Spotlight },
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
  const [d, setD] = useState("rows");
  const [n, setN] = useState<"none" | "few" | "many">("few");
  const c = DIRS.find((x) => x.k === d)!;
  const list = n === "none" ? [] : n === "few" ? FEW : MANY;
  return (
    <section className="mx-auto max-w-[1000px]">
      <h1 className="h1 !text-[34px]">Body library</h1>
      <p className="mt-2 max-w-[640px] text-[16px] leading-snug text-white/60">Round 3, Spotlight refined: the body in a smaller stage built like the measuring screens, actions for it, and the bodies as raised rows (or wide cards) with faces and names; Search, Edit and personal or compact always there. One body live at a time; the others are stills taken from their own 3D body (they appear as they are made).</p>
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
