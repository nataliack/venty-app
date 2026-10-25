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

// ═══ B · Orbit: everyone stands on a turntable, the one at the front live and lit, the rest round the ring, smaller,
//     darker and softer the further back; tap one and the ring swings round to it ═══
function Orbit({ list }: Props) {
  const [rot, setRot] = useState(0);
  const [moving, setMoving] = useState(false);
  const [compact, setCompact] = useState(false);
  const many = list.length > 6;
  const n = list.length;
  const front = n ? (((Math.round(rot) % n) + n) % n) : 0;
  const b = list[front];
  const raf = useRef(0);
  // swing round the short way, easing in and out
  const spin = (k: number) => {
    setCompact(false);
    let d = k - (((rot % n) + n) % n); if (d > n / 2) d -= n; if (d < -n / 2) d += n;
    if (!d) return;
    const from = rot, to = rot + d, T = 700 + Math.abs(d) * 120;
    let t0 = -1;
    setMoving(true);
    cancelAnimationFrame(raf.current);
    const step = (t: number) => { if (t0 < 0) t0 = t; const p = Math.min(1, (t - t0) / T); const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; setRot(from + (to - from) * e); if (p < 1) raf.current = requestAnimationFrame(step); else setMoving(false); };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const disc = (
    // the turntable: an ellipse of light on the floor with fine marks round its rim
    <div className="pointer-events-none absolute left-1/2 top-[470px] h-[110px] w-[350px] -translate-x-1/2">
      <div className="absolute inset-0 rounded-[50%] border border-white/10" style={{ background: "radial-gradient(closest-side, rgb(104 126 245 / .16), rgb(104 126 245 / .04) 70%, transparent)" }} />
      <svg viewBox="0 0 350 110" className="absolute inset-0" aria-hidden>
        {Array.from({ length: 72 }, (_, k) => { const a = (k / 72) * Math.PI * 2 + rot * (Math.PI * 2 / Math.max(n, 1)); const x = 175 + Math.sin(a) * 171, y = 55 + Math.cos(a) * 53; return <circle key={k} cx={x} cy={y} r={k % 6 ? 0.8 : 1.4} fill="rgb(240 244 254)" opacity={0.15 + 0.35 * ((Math.cos(a) + 1) / 2)} />; })}
      </svg>
    </div>
  );
  if (!b) return (
    <Cine top={<NewBodyRound />}>
      {disc}
      <div className="absolute inset-x-6 top-[250px] text-center">
        <p className="text-[30px] leading-[1.08] tracking-[-.03em]">Nobody on the turntable yet</p>
        <p className="mt-2 text-[15px] text-white/55">Everyone you measure takes a place here.</p>
      </div>
      <div className="absolute inset-x-6 bottom-[120px] z-20"><Pill>Set up a body</Pill></div>
    </Cine>
  );
  return (
    <Cine top={<TopTools many={many} compact={compact} set={setCompact} />}>
      {compact ? <CastList list={list} onPick={spin} /> : (
        <>
          {disc}
          {list.map((x, k) => {
            const a = ((k - rot) / n) * Math.PI * 2;
            const z = Math.cos(a), depth = (z + 1) / 2; // 1 at the front, 0 at the back
            const isFront = k === front && !moving;
            const h = 330 * (0.42 + 0.58 * depth ** 1.6) * (x.m.height / 180);
            return (
              <button key={x.id} onClick={() => spin(k)} aria-label={x.name} className="absolute left-1/2 top-[525px] -translate-x-1/2"
                style={{ transform: `translate(calc(-50% + ${Math.sin(a) * 150}px), ${-h - (1 - depth) * 40}px)`, zIndex: Math.round(depth * 100), width: h * 0.42, height: h }}>
                <span className="block h-full w-full transition-opacity" style={{ opacity: isFront ? 0 : 0.25 + 0.75 * depth, filter: `brightness(${0.35 + 0.65 * depth}) blur(${(1 - depth) * 1.5}px)` }}><Still b={x} /></span>
              </button>
            );
          })}
          {/* the one at the front, live, once the ring has stopped */}
          {!moving && <Live key={b.id} b={b} stage="none" className="pointer-events-auto absolute inset-x-0 top-[150px] z-[101] h-[385px]" />}
          <div className="absolute inset-x-6 bottom-[112px] z-20 text-center">
            <AnimatePresence mode="wait">
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <p className="text-[30px] leading-none tracking-[-.03em]">{b.name}</p>
                <p className="mt-2 text-[12px] text-white/45">{b.how} · {doneLine(b)}</p>
                <Credits b={b} className="mt-3" />
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </Cine>
  );
}

// ═══ C · Scenes: scroll and the camera moves, like a title sequence. Each body opens close on the face with its name
//     as a title card; scroll and the camera pulls back to the whole body and its height, then glides to bust, waist
//     and hips, each with its tape round the body and its number; then a cut to the next one ═══
const SCENE_H = 560;
const SCENES: { focus: string; k?: keyof M; label?: string }[] = [{ focus: "portrait" }, { focus: "height", k: "height", label: "Height" }, { focus: "bust", k: "bust", label: "Bust" }, { focus: "waist", k: "waist", label: "Waist" }, { focus: "hips", k: "hips", label: "Hips" }];
function Scenes({ list }: Props) {
  const [at, setAt] = useState(0);
  const [compact, setCompact] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  const many = list.length > 6;
  const total = list.length * SCENES.length;
  const bi = Math.min(Math.floor(at / SCENES.length), Math.max(0, list.length - 1));
  const sc = SCENES[at % SCENES.length];
  const b = list[bi];
  const onScroll = (el: HTMLDivElement) => { box.current = el; setAt(Math.max(0, Math.min(total - 1, Math.round(el.scrollTop / SCENE_H)))); };
  const pick = (i: number) => { setCompact(false); requestAnimationFrame(() => box.current?.scrollTo({ top: i * SCENES.length * SCENE_H })); };
  if (!b) return (
    <Cine top={<NewBodyRound />}>
      <Live stage="none" focus="portrait" className="absolute inset-x-0 bottom-[260px] top-[110px] opacity-50" />
      <div className="absolute inset-x-6 bottom-[150px] z-20">
        <p className="text-[30px] leading-[1.08] tracking-[-.03em]">Every body has a story</p>
        <p className="mt-2 text-[15px] text-white/55">Measure the first one and it starts here.</p>
        <Pill className="mt-5">Set up a body</Pill>
      </div>
    </Cine>
  );
  if (compact) return <Cine top={<TopTools many={many} compact={compact} set={setCompact} />}><CastList list={list} onPick={pick} /></Cine>;
  return (
    <Cine scroll onScroll={onScroll} top={<TopTools many={many} compact={compact} set={setCompact} />}
      overlay={
        // where you are: a thin line down the right edge, one notch per body, the one you are in lit
        <div className="pointer-events-none absolute bottom-[150px] right-3 top-[150px] z-20 flex flex-col justify-center gap-1.5">
          {list.map((x, k) => <span key={x.id} className={cx("w-[2px] rounded-full transition-all", k === bi ? "h-8 bg-peri" : "h-3 bg-white/20")} />)}
        </div>
      }>
      {/* the stage stays put while the scenes scroll past it; the camera follows the scene */}
      <div className="sticky top-0 z-0 h-[852px]" style={{ marginBottom: -852 }}>
        <Live key={b.id} b={b} stage="none" focus={sc.focus} className="absolute inset-x-0 bottom-[150px] top-[100px]" />
      </div>
      <div className="relative z-10 snap-y">
        {list.map((x) => SCENES.map((s, k) => (
          <section key={x.id + k} className="relative" style={{ height: SCENE_H }}>
            {k === 0 ? (
              <div className="absolute inset-x-6 bottom-[160px]">
                <p className="text-[64px] leading-[.92] tracking-[-.05em]">{x.name.split(" ")[0]}</p>
                <p className="mt-3 text-[14px] text-white/55">{x.how} · {doneLine(x)}</p>
                <Ticks n={x.done} className="mt-3" />
              </div>
            ) : (
              <div className="absolute bottom-[160px] right-6 text-right">
                <p className="text-[14px] text-white/55">{s.label}</p>
                <p className="leading-none"><N v={x.m[s.k!]} className="text-[72px]" /><span className="unit ml-1 text-[18px] text-white/55" translate="no">cm</span></p>
              </div>
            )}
          </section>
        )))}
        <div style={{ height: 852 - SCENE_H }} />
      </div>
    </Cine>
  );
}

const DIRS: { k: string; name: string; note: string; C: (p: Props) => ReactNode }[] = [
  { k: "spotlight", name: "A · Spotlight", note: "A dark stage and one light from above. The body stands in it, live, its name huge and faint behind it; the numbers as credits; the others wait at the foot as silhouettes. Choosing another dims the light, cuts, and brings it up on them.", C: Spotlight },
  { k: "orbit", name: "B · Orbit", note: "Everyone on a turntable in perspective: the one at the front live and lit, the rest round the ring, smaller, darker and softer the further back. Tap one and the ring swings round to it.", C: Orbit },
  { k: "scenes", name: "C · Scenes", note: "Scroll and the camera moves, like a title sequence: close on the face with the name as a title card, then back to the whole body and its height, then round to bust, waist and hips, each with its tape and number; then a cut to the next person.", C: Scenes },
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
  const [d, setD] = useState("spotlight");
  const [n, setN] = useState<"none" | "few" | "many">("few");
  const c = DIRS.find((x) => x.k === d)!;
  const list = n === "none" ? [] : n === "few" ? FEW : MANY;
  return (
    <section className="mx-auto max-w-[1000px]">
      <h1 className="h1 !text-[34px]">Body library</h1>
      <p className="mt-2 max-w-[640px] text-[16px] leading-snug text-white/60">Round 2, more cinematic: full-bleed and dark, the body as the picture, the words as titles and credits over it, a cut or a camera move between bodies. One body live at a time; the others are stills taken from their own 3D body (they appear as they are made). Three directions beside Today.</p>
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
