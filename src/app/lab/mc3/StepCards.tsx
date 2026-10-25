"use client";
// Lab (MC 3): Safari's four taps as cards you swipe, each a picture of what you will see and its step, for the paper half of
// "Add Venty to your home screen". The next card shows at the edge, so it reads as a row to swipe. Under it, a track
// pressed into the paper with a raised knob that follows the swipe (the look switch's build); tap the track to jump.
// `auto` moves on by itself every few seconds, the knob filling as it waits, and stops for good at the first touch.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { IconKey } from "./icons";
import { Pic, type PicKey } from "./InstallArt";

export type Step = { t: string; d: string; pic: PicKey };
const CARD = 300, GAP = 12, BEZEL = 6, AUTO = 4500;
// the pager: segments 34 wide; the knob is a segment less the 5px channel each side, the track its height plus 5 each side
const SEG = 34, CH = 5, KH = 12;

export function StepCards({ steps, icon, auto = false }: { steps: Step[]; icon: IconKey; auto?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0); // where the row is, in cards
  const [playing, setPlaying] = useState(auto);
  const still = useReducedMotion();
  const at = Math.round(f);
  const go = (i: number) => ref.current?.scrollTo({ left: i * (CARD + GAP), behavior: still ? "auto" : "smooth" });
  const stop = () => setPlaying(false);
  useEffect(() => {
    if (!playing || still) return;
    const t = setTimeout(() => go((at + 1) % steps.length), AUTO);
    return () => clearTimeout(t);
  });
  return (
    <div>
      <div ref={ref} onScroll={(e) => setF(e.currentTarget.scrollLeft / (CARD + GAP))} onPointerDown={stop} onWheel={stop}
        className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pl-6 noscroll" style={{ paddingRight: 393 - 24 - CARD, scrollPaddingLeft: 24 }}>
        {steps.map((s, i) => (
          <figure key={s.t} className="shrink-0 snap-start" style={{ width: CARD }}>
            {/* the picture in a dark bezel, like a screenshot laid on the paper */}
            <div className="rounded-[22px] bg-[#12131c] shadow-[0_16px_30px_-18px_rgb(28_34_82/.7),0_2px_4px_rgb(18_19_28/.12)]" style={{ padding: BEZEL }}>
              <Pic k={s.pic} w={CARD - 2 * BEZEL} icon={icon} className="!rounded-[16px] !border-white/[.06]" />
            </div>
            <figcaption className="mt-3 flex gap-2.5 pr-2">
              <span className="serif w-3 shrink-0 text-[17px] leading-tight text-primary">{i + 1}</span>
              <span className="text-[16px] leading-tight">{s.t}<span className="mt-1 block text-[14px] leading-snug text-[#12131c]/55">{s.d}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="relative mt-4 rounded-full bg-[#12131c]/[.07] shadow-[inset_0_2px_4px_rgb(18_19_28/.18),inset_0_-1px_0_rgb(255_255_255/.7)]"
        style={{ width: SEG * steps.length, height: KH + 2 * CH }} role="tablist" aria-label="Steps">
        <span className="pill-white absolute overflow-hidden rounded-full" style={{ left: CH + f * SEG, top: CH, width: SEG - 2 * CH, height: KH }} aria-hidden>
          {/* waiting to move on: the knob fills with periwinkle */}
          {playing && !still && <span key={at} className="absolute inset-y-0 left-0 bg-peri [animation:step-fill_4.5s_linear_forwards]" />}
        </span>
        {steps.map((s, i) => (
          <button key={s.t} role="tab" aria-selected={at === i} aria-label={`Step ${i + 1}: ${s.t}`} onClick={() => { stop(); go(i); }}
            className="absolute top-0 h-full" style={{ left: i * SEG, width: SEG }} />
        ))}
      </div>
      <style>{"@keyframes step-fill { from { width: 0 } to { width: 100% } }"}</style>
    </div>
  );
}
