"use client";
// Welcome, Ana (the screen after signing up, 25 Oct 2026): the check in its glass circle and the plain progress bar
// redone, in the spirit of the landing page's loading screen (FilamentLoader: a fine line whose growing head glows, a
// sweep of light along the lit part, the word for what it is doing rising from its mask, the number in the same type,
// the logo's letters rippling as the mark lands). Here in white and light, on Crown, not the landing's cornflower night.
// Round 2: on Haze (the landing's locked purple sky; Crown to compare), and no ball at the growing end of any line.
// Each version plays the screen's 1.9 s; the tabs hold it halfway or done, to compare.
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { Crown, cx } from "@/components/ui";
import { LOGO, VentyLogo } from "@/components/art";
import { Icon } from "@/components/icons";

const MS = 1900;
type Hold = "play" | "start" | "half" | "done";
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

// the screen's progress, 0..1: played over 1.9 s (again every few seconds), or held
function useProgress(hold: Hold, run: number) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (hold !== "play") return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / MS); setP(ease(k)); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hold, run]);
  return hold === "start" ? 0.06 : hold === "half" ? 0.58 : hold === "done" ? 1 : p;
}

// ─── the filament, in white: a fine track; the lit part runs from faint to full white at its head, a soft glow along
// it (strongest at the head), a sweep of light running inside the lit part, the head breathing ───
const CSS = `
.wl-bar { position: relative; height: 2px; border-radius: 999px; background: rgb(255 255 255 / .2); }
/* nothing of the lit line (its glow, its head) ever shows left of where the track starts: clipped there, free above,
   below and past its head */
.wl-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 999px 0 0 999px; clip-path: inset(-40px -40px -40px 0);
  background: linear-gradient(90deg, rgb(255 255 255 / .3), rgb(255 255 255 / .75) 60%, #fff); }
.wl-fill::before, .wl-fill::after { content: ""; position: absolute; top: 50%; translate: 0 -50%; box-sizing: content-box; border-radius: 999px; pointer-events: none; background-clip: content-box; }
.wl-fill::before { inset-inline: -28px; padding: 24px 28px; height: 12px; filter: blur(8px);
  background-image: linear-gradient(90deg, rgb(255 255 255 / .04), rgb(255 255 255 / .2) 55%, rgb(255 255 255 / .42));
  -webkit-mask-image: linear-gradient(90deg, transparent 28px, #000 74px, #000 calc(100% - 40px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 28px, #000 74px, #000 calc(100% - 40px), transparent 100%); }
.wl-fill::after { inset-inline: -10px; padding: 8px 10px; height: 4px; filter: blur(2px);
  background-image: linear-gradient(90deg, rgb(255 255 255 / .1), rgb(255 255 255 / .45) 55%, rgb(255 255 255 / .85));
  -webkit-mask-image: linear-gradient(90deg, transparent 10px, #000 26px, #000 calc(100% - 14px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 10px, #000 26px, #000 calc(100% - 14px), transparent 100%); }
.wl-sweep { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
.wl-pulse { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 60%, rgb(255 255 255 / .95) 88%, transparent); animation: wl-pulse 1.6s cubic-bezier(.55,0,1,.45) infinite; }
/* the head: no ball. A short streak of light at the growing end, brightest just before it and tapering off at the very
   end (as on the landing page), a touch brighter than the line; it breathes */
.wl-head { position: absolute; right: 0; top: 0; width: min(30px, 100%); height: 100%; translate: 10% 0;
  background: linear-gradient(90deg, transparent, #fff 72%, rgb(255 255 255 / .55));
  box-shadow: 0 0 4px rgb(255 255 255 / .7); animation: wl-breathe 1.8s ease-in-out infinite; }
@keyframes wl-pulse { from { translate: -100% 0; opacity: 0; } to { translate: 0 0; opacity: 1; } }
@keyframes wl-breathe { 50% { opacity: .55; } }
.wl-roll { display: grid; overflow: clip; padding-block: 2px; font-size: 14px; line-height: 1.5; letter-spacing: -.01em; white-space: nowrap; font-variant-numeric: tabular-nums; color: rgb(255 255 255 / .78); }
.wl-roll > [aria-hidden] { grid-area: 1 / 1; translate: 0 110%; opacity: 0; transition: translate .8s cubic-bezier(.16,1,.3,1), opacity .5s ease; }
.wl-roll > [data-state="in"] { translate: 0 0; opacity: 1; }
.wl-roll > [data-state="out"] { translate: 0 -110%; opacity: 0; }
/* Haze, the landing page's locked purple sky: periwinkle washing in from the top left over cornflower, four drifting lights */
.sky.wl-haze { background:
  radial-gradient(60% 50% at 10% 5%, rgb(192 200 219 / .7) 0%, rgb(157 172 205 / .4) 30%, transparent 65%),
  radial-gradient(40% 34% at 75% 65%, rgb(192 200 219 / .35) 0%, transparent 70%),
  linear-gradient(160deg, #8c9cf8 0%, #7a8ef7 30%, #687ef5 70%, #6073e6 100%); }
.sky.wl-haze::before { animation-duration: 14s; background: radial-gradient(40% 30% at 0% 0%, rgb(239 244 255 / .4) 0%, transparent 100%); }
.sky.wl-haze .drift { filter: blur(70px); }
.sky.wl-haze .d1 { width: 70%; aspect-ratio: 1; left: -25%; top: -25%; right: auto; bottom: auto; background: rgb(192 200 219 / .5); animation: v-s1 11s ease-in-out infinite alternate; }
.sky.wl-haze .d2 { width: 50%; aspect-ratio: 1; right: -5%; top: 40%; left: auto; bottom: auto; background: rgb(192 200 219 / .3); animation: v-s3 13s ease-in-out infinite alternate; }
.sky.wl-haze .d3 { width: 60%; aspect-ratio: 1; right: -20%; bottom: -25%; left: auto; top: auto; background: rgb(79 99 224 / .35); animation: v-s2 14s ease-in-out infinite alternate; }
.sky.wl-haze .d4 { display: block; width: 45%; aspect-ratio: 1; left: 15%; bottom: -15%; top: auto; right: auto; background: rgb(96 115 230 / .3); animation: v-s4 12s ease-in-out infinite alternate; }
.wl-glow { filter: drop-shadow(0 0 5px rgb(255 255 255 / .75)) drop-shadow(0 0 14px rgb(255 255 255 / .35)); }
@media (prefers-reduced-motion: reduce) { .wl-pulse, .wl-head { animation: none; } .wl-roll > [aria-hidden] { transition: none; } }
`;

function Filament({ p, w = 180, className }: { p: number; w?: number; className?: string }) {
  return (
    <div className={cx("wl-bar", className)} style={{ width: w }} aria-hidden>
      <div className="wl-fill" style={{ width: `${p * 100}%`, opacity: p > 0.005 ? 1 : 0 }}>
        <span className="wl-sweep"><span className="wl-pulse" /></span>
        <span className="wl-head" />
      </div>
    </div>
  );
}

// the word for what it is doing, rising from its mask as it changes (the last one leaves upward)
const WORDS = ["Setting up", "Saving", "Ready"];
function Roll({ i }: { i: number }) {
  const [prev, setPrev] = useState(-1);
  const [cur, setCur] = useState(i);
  if (i !== cur) { setPrev(cur); setCur(i); }
  return (
    <p className="wl-roll">
      <span className="sr-only">{WORDS[i]}</span>
      {WORDS.map((t, k) => <span key={t} aria-hidden data-state={k === i ? "in" : k === prev ? "out" : "wait"}>{t}</span>)}
    </p>
  );
}
const wordAt = (p: number) => (p >= 1 ? 2 : p < 0.5 ? 0 : 1);

// the logo in its pieces: the letters (LOGO 0 to 3) and the mark (LOGO 4), so the mark can take a lap and the letters
// ripple under it as it lands, as on the landing page
function LogoLap({ width, run, still }: { width: number; run: number; still: boolean }) {
  const lap = { x: [0, 60, 130, 70, -40, 0], y: [0, -120, -40, 40, -10, 0], rotate: [0, -8, 6, 10, -4, 0] };
  return (
    <svg viewBox="0 0 2132 1786" width={width} height={(width * 1786) / 2132} role="img" aria-label="Venty" overflow="visible">
      {LOGO.slice(0, 4).map((d, i) => (
        <motion.path key={`${run}-${i}`} d={d} fill="#fff" initial={false}
          animate={still ? { y: 0 } : { y: [0, 0, 46, 0] }}
          transition={{ duration: 0.5, times: [0, 0.01, 0.45, 1], delay: 1.25 + [0.15, 0.1, 0.05, 0.2][i], ease: "easeOut" }} />
      ))}
      <motion.path key={`m${run}`} d={LOGO[4]} fill="#fff" style={{ transformBox: "fill-box", transformOrigin: "50% 60%" }} initial={false}
        animate={still ? { x: 0, y: 0, rotate: 0 } : lap}
        transition={{ duration: 1.3, ease: "easeInOut", times: [0, 0.22, 0.45, 0.68, 0.88, 1] }} />
    </svg>
  );
}

// a tick drawn as a fine line of light (no circle, no glass): it draws itself from its foot to its tip
function DrawnTick({ p, size = 56, delay = 0 }: { p: number; size?: number; delay?: number }) {
  const k = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} className="wl-glow" aria-hidden>
      <path d="M14 29.5 L24 39 L43 18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
    </svg>
  );
}

// the filament as a ring: a fine circle drawn round by the lit line, its head glowing; done, the tick draws in it
function RingFilament({ p, size = 76 }: { p: number; size?: number }) {
  const r = 34, c = 38;
  return (
    <svg viewBox="0 0 76 76" width={size} height={size} aria-hidden overflow="visible">
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgb(255 255 255 / .2)" strokeWidth="1.5" />
      <g className="wl-glow">
        {/* the lit arc, faint at its start and full at its head (three lengths laid over each other), no ball at its end */}
        {[[1, 0.35], [0.45, 0.4], [0.12, 1]].map(([f, o], i) => {
          const len = i === 0 ? p : Math.min(p, f * Math.max(p, 0.25));
          return <circle key={i} cx={c} cy={c} r={r} fill="none" stroke="#fff" strokeWidth="2" pathLength={1} strokeDasharray={`${len} 1`} strokeDashoffset={-(p - len)} transform={`rotate(-90 ${c} ${c})`} opacity={p > 0.005 ? o : 0} />;
        })}
        <path d="M27 39 L34.5 46 L50 30" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={p >= 1 ? 0 : 1} style={{ transition: "stroke-dashoffset .5s cubic-bezier(.3,.7,.2,1)" }} />
      </g>
    </svg>
  );
}

// ─── the screen: Crown, the logo near the top, the words in the middle, the loader's slot at the foot ───
function WelcomeText({ run, mark }: { run: number; mark?: ReactNode }) {
  return (
    <div key={run} className="flex flex-col items-center">
      {mark}
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className={cx("h1 !text-[36px]", mark ? "mt-6" : "")}>Welcome, Ana.</motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lead mt-2 !text-white/80">Your account is ready.<br />Let’s show you around.</motion.p>
    </div>
  );
}

type V = { k: string; name: string; note: string };
const VERSIONS: V[] = [
  { k: "now", name: "Today", note: "The check in a glass circle and a plain white bar that fills." },
  { k: "a", name: "A · The filament", note: "No check at all: the words say it. At the foot, the landing page's filament in white: a fine line whose head glows and breathes, a sweep of light running along the lit part." },
  { k: "b", name: "B · Filament, word and number", note: "A, with the landing's word and number under the line, in the same type: the word for what it is doing rising from its mask (Setting up, Saving, Ready) on the left, the percentage on the right." },
  { k: "f", name: "F · Filament, word, number and a tick", note: "B, with D's tick of light over the heading: one fine line of light that draws itself, foot to tip, with a soft glow, while the filament fills below with the word and the percentage." },
  { k: "c", name: "C · The mark takes a lap", note: "No check: the moment is the logo's own. The bird lifts off the wordmark, takes a small lap and lands, and the letters ripple under it as it touches down (as on the landing). The filament sits right under the logo, as in the landing's lockup." },
  { k: "d", name: "D · A tick of light", note: "The tick without its circle or glass: one fine line of light that draws itself, foot to tip, with a soft glow. The filament at the foot." },
  { k: "e", name: "E · The ring", note: "The tick and the progress in one: a fine ring the lit line draws round, its head glowing; once round, the tick draws in it. Nothing at the foot." },
];

type Bg = "haze" | "crown";
function Screen({ v, p, run, hold, bg }: { v: string; p: number; run: number; hold: Hold; bg: Bg }) {
  const still = hold !== "play";
  let mark: ReactNode = null, foot: ReactNode = null, underLogo: ReactNode = null;
  if (v === "now") {
    mark = (
      <motion.span key={run} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.35, duration: 0.7 }} className="grid h-16 w-16 place-items-center rounded-full border border-white/50 bg-white/15 backdrop-blur-md">
        <Icon name="check" size={30} strokeWidth={2.4} />
      </motion.span>
    );
    foot = <div className="h-[3px] w-[132px] overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{ width: `${p * 100}%` }} /></div>;
  }
  if (v === "a") foot = <Filament p={p} w={180} />;
  if (v === "b" || v === "f") foot = (
    <div className="flex w-[200px] flex-col gap-2.5">
      <Filament p={p} w={200} />
      <div className="flex items-center justify-between"><Roll i={wordAt(p)} /><p className="wl-roll tabular-nums">{Math.round(p * 100)}%</p></div>
    </div>
  );
  if (v === "f") mark = <DrawnTick p={still ? 1 : Math.min(1, p * 2.6)} size={60} />;
  if (v === "c") underLogo = <Filament p={p} w={150} className="mt-9" />;
  if (v === "d") { mark = <DrawnTick p={still ? 1 : Math.min(1, p * 2.6)} size={60} />; foot = <Filament p={p} w={180} />; }
  if (v === "e") mark = <RingFilament p={p} />;
  return (
    <div className="absolute inset-0 overflow-hidden text-center text-white">
      {bg === "haze" ? <div className="sky wl-haze" aria-hidden><span className="drift d1" /><span className="drift d2" /><span className="drift d3" /><span className="drift d4" /></div> : <Crown live />}
      <div className="relative flex h-full flex-col items-center px-6" style={{ paddingTop: 54, paddingBottom: 34 }}>
        {/* 13dvh of the phone, as on the app */}
        <div className="mt-[111px] flex flex-col items-center">
          {v === "c" ? <LogoLap width={190} run={run} still={still} /> : <VentyLogo width={190} />}
          {underLogo}
        </div>
        <div className="my-auto flex max-w-[620px] flex-col items-center pt-8"><WelcomeText run={run} mark={mark} /></div>
        {/* the loader's slot (the same height as Welcome's buttons) */}
        <div className="flex w-full max-w-[380px] flex-col items-center gap-2"><div className="grid h-14 w-full place-items-center">{foot}</div><div className="h-11" /></div>
      </div>
    </div>
  );
}

function Phone({ v, hold, run, bg }: { v: V; hold: Hold; run: number; bg: Bg }) {
  const p = useProgress(hold, run);
  return (
    <figure className="flex w-[393px] flex-col gap-3">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[46px] shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]" style={{ "--top": "54px", "--bottom": "34px" } as CSSProperties}>
        <Screen v={v.k} p={p} run={run} hold={hold} bg={bg} />
      </div>
      <figcaption className="text-center text-[14px] text-white/55">{v.name}</figcaption>
      <p className="text-[14px] leading-snug text-white/55">{v.note}</p>
    </figure>
  );
}

export function WelcomeLab() {
  const [hold, setHold] = useState<Hold>("play");
  const [run, setRun] = useState(0);
  const [bg, setBg] = useState<Bg>("haze");
  // playing: the screen again every 3.4 s
  useEffect(() => {
    if (hold !== "play") return;
    const t = setInterval(() => setRun((r) => r + 1), 3400);
    return () => clearInterval(t);
  }, [hold]);
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="text-[30px] font-normal tracking-[-.03em]">Welcome, Ana: the check and the progress</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">The screen after signing up. The check in its glass circle and the plain bar redone in the spirit of the landing page&apos;s loading screen: a fine filament whose head glows, a sweep of light along it, the word rising from its mask, the logo&apos;s letters rippling as the mark lands. In white. Round 2: on Haze, the landing&apos;s locked purple sky (Crown to compare), and the growing end of every line is a short streak of light that tapers off, as on the landing, never a ball. Round 3: F (B with D&apos;s tick), the line under the heading always on two rows (no widow), and the glow never starting left of the line. Splash uses the same bar, so whichever is chosen goes there too.</p>
      <div className="sticky top-0 z-10 -mx-6 mt-6 flex gap-1 bg-[#05060b]/85 px-6 py-3 backdrop-blur" role="tablist">
        {([["play", "Playing"], ["start", "Starting"], ["half", "Halfway"], ["done", "Done"]] as const).map(([k, t]) => (
          <button key={k} role="tab" aria-selected={hold === k} onClick={() => { setHold(k); setRun((r) => r + 1); }} className={cx("h-10 rounded-full px-4 text-[14px] font-medium", hold === k ? "bg-white text-[#12131c]" : "text-white/70 hover:bg-white/10")}>{t}</button>
        ))}
        {hold === "play" && <button onClick={() => setRun((r) => r + 1)} className="ml-2 h-10 rounded-full px-4 text-[14px] font-medium text-white/70 hover:bg-white/10">Replay</button>}
        <span className="mx-3 w-px self-stretch bg-white/15" />
        {([["haze", "Haze"], ["crown", "Crown"]] as const).map(([k, t]) => (
          <button key={k} role="tab" aria-selected={bg === k} onClick={() => setBg(k)} className={cx("h-10 rounded-full px-4 text-[14px] font-medium", bg === k ? "bg-white text-[#12131c]" : "text-white/70 hover:bg-white/10")}>{t}</button>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-14">
        {VERSIONS.map((v) => <Phone key={v.k} v={v} hold={hold} run={run} bg={bg} />)}
      </div>
    </section>
  );
}
