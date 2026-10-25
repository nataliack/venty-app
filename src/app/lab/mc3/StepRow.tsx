"use client";
// Lab (MC 3): Safari's four taps as cards to swipe. Each card is a picture of what you will see and its step, led by its
// number in an inset tile (the app's icon style). The pager is centred under the row: a knob in a track pressed into the
// page that follows the swipe, stretching ahead to the next step and catching up behind it, like a caterpillar. On the
// card in view, the thing to tap sends out a soft pulse. `auto` moves on by itself every few seconds (nothing counts down on
// screen); a finger on the row pauses it, and a few seconds after the finger stops it carries on from wherever it was left.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cx } from "@/components/ui";
import type { IconKey } from "./icons";
import { Pic, type PicKey } from "./InstallArt";
import { pressed, type Tone } from "./IconTrack";

export type Step3 = { t: string; d: string; pic: PicKey; g: "more" | "share" | "addhome" | "add" };
const CARD = 300, GAP = 12, BEZEL = 6, AUTO = 4500, RESUME = 4000;
// the pager: segments 34 wide; the knob is a segment less the 5px channel each side, the track its height plus 5 each side
const SEG = 34, CH = 5, KH = 12;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export function StepRow({ steps, icon, tone, auto = false }: { steps: Step3[]; icon: IconKey; tone: Tone; auto?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0); // where the row is, in cards
  const still = useReducedMotion();
  const at = Math.round(f);
  // a finger on the row (or the row moving under it) pauses it until RESUME after the finger stops; moving on by itself
  // is marked, so its own scrolling never counts as a finger
  const until = useRef(0), holding = useRef(false), self = useRef(false);
  const [nudge, setNudge] = useState(0);
  const pause = () => { until.current = Date.now() + RESUME; setNudge((x) => x + 1); };
  const go = (i: number) => {
    self.current = true; setTimeout(() => { self.current = false; }, 900);
    ref.current?.scrollTo({ left: i * (CARD + GAP), behavior: still ? "auto" : "smooth" });
  };
  useEffect(() => {
    if (!auto || still) return;
    const wait = Math.max(until.current - Date.now(), AUTO);
    const t = setTimeout(() => {
      if (holding.current || Date.now() < until.current) { setNudge((x) => x + 1); return; }
      go((at + 1) % steps.length);
    }, wait);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, still, at, nudge]);
  // the caterpillar: between two steps the front of the knob gets there first, then the back follows
  const i = Math.floor(f), t = f - i;
  const front = i + ease(clamp(t * 2)), back = i + ease(clamp(t * 2 - 1));
  const paper = tone === "paper";
  return (
    <div>
      <div ref={ref} onScroll={(e) => { setF(e.currentTarget.scrollLeft / (CARD + GAP)); if (!self.current) pause(); }}
        onPointerDown={() => { holding.current = true; pause(); }} onPointerUp={() => { holding.current = false; pause(); }} onPointerCancel={() => { holding.current = false; pause(); }} onWheel={pause}
        className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pl-6 noscroll" style={{ paddingRight: 393 - 24 - CARD, scrollPaddingLeft: 24 }}>
        {steps.map((s, n) => (
          <figure key={s.t} className="shrink-0 snap-start" style={{ width: CARD }}>
            {/* the picture in a bezel, like a screenshot laid on the page */}
            <div className={cx("rounded-[22px]", paper ? "bg-[#12131c] shadow-[0_16px_30px_-18px_rgb(28_34_82/.7),0_2px_4px_rgb(18_19_28/.12)]" : "card-soft")} style={{ padding: BEZEL }}>
              <Pic k={s.pic} w={CARD - 2 * BEZEL - (paper ? 0 : 2)} icon={icon} live={n === at && !still} className="!rounded-[16px] !border-white/[.06]" />
            </div>
            <figcaption className="mt-3 flex items-start gap-3 pr-2">
              <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-[15px] font-medium leading-none tabular-nums", paper ? "bg-[#12131c]/[.06] text-[#12131c]/75 shadow-[inset_0_1px_2px_rgb(18_19_28/.12)]" : "iconbadge")} aria-hidden>{n + 1}</span>
              <span className="pt-0.5 text-[16px] leading-tight">{s.t}<span className={cx("mt-1 block text-[14px] leading-snug", paper ? "text-[#12131c]/55" : "text-white/55")}>{s.d}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className={cx("relative mx-auto mt-4 rounded-full", pressed[tone])} style={{ width: SEG * steps.length, height: KH + 2 * CH }} role="tablist" aria-label="Steps">
        <span className={cx("absolute rounded-full", paper ? "pill-white" : "knob")} aria-hidden
          style={{ left: CH + back * SEG, top: CH, width: SEG - 2 * CH + (front - back) * SEG, height: KH }} />
        {steps.map((s, n) => (
          <button key={s.t} role="tab" aria-selected={at === n} aria-label={s.t} onClick={() => { pause(); go(n); }}
            className="absolute top-0 h-full" style={{ left: n * SEG, width: SEG }} />
        ))}
      </div>
      {/* the pulse round the thing to tap, on the card in view */}
      <style>{".pic-live .tap-ring { animation: tap-pulse 1.8s ease-out infinite; } @keyframes tap-pulse { 0% { box-shadow: 0 0 0 0 rgb(140 156 248 / .65), 0 0 18px rgb(140 156 248 / .55); } 70%, 100% { box-shadow: 0 0 0 12px rgb(140 156 248 / 0), 0 0 18px rgb(140 156 248 / .55); } }"}</style>
    </div>
  );
}
