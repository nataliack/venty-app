"use client";
// Lab (MC 3): the icon selector. The icons slide in a track pressed into the page, like the measuring ruler's
// (.ruler-track) and the look switch's; drag or flick it, tap an icon, or use the arrow keys (the same loop as IconWheel:
// endless, nothing cloned, settling on the nearest icon). Until it is touched every icon sits pressed in at one size and
// nothing is chosen; then the centre one rises out of the track, casting a short shadow, and is the choice.
// The gaps between icons stay equal while one grows: each icon is placed from its neighbour's edge, not on a fixed grid.
// Under the icons, inside the track, a ruler moves with them: the measuring ruler's own geometry (Ruler in art.tsx: a tick
// every 9px, a mid tick every 2nd and a major every 10th, at 15%, 26% and 42% of its height), the centre marked, its ticks
// stopping 1px above the track's floor as on the measuring dial. The icons fade out towards the track's ends (a mask).
import { useEffect, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { cx } from "@/components/ui";
import { ICONS, type IconKey } from "./icons";
import { AppIcon } from "./parts";
import { mod, useIconLoop } from "./IconWheel";

export type Tone = "paper" | "night";
// pressed into the page: a floor a touch darker, a shadow inside from the top edge, a lip of light along the bottom
export const pressed: Record<Tone, string> = {
  paper: "bg-[#12131c]/[.07] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)]",
  night: "ruler-track",
};

// the raised icon, the pressed ones, the gap between any two (edge to edge), the room above the raised icon, the ruler
const BIG = 64, SMALL = 46, GAP = 16, TOP = 13, RULER = 24, FLOOR = 1, H = TOP + BIG + 8 + RULER + FLOOR;
// the measuring ruler's geometry (Ruler in art.tsx, light): ticks 9px apart, a mid one every 2nd, a major every 10th
const PX = 9, TICK = { major: [0.42, 0.42, 1.5], mid: [0.26, 0.24, 1], minor: [0.15, 0.14, 1] } as const; // height, opacity, width
const STEP = (BIG + SMALL) / 2 + GAP; // a finger's travel for one icon
const R = TOP + BIG * 0.2237; // the track's corner: the raised icon's corner plus the room above it, so they run parallel

export function IconTrack({ k, setK, tone }: { k: IconKey | null; setK: (k: IconKey) => void; tone: Tone }) {
  const { p, near, here, touched, ref, handlers } = useIconLoop(k, setK, STEP);
  // the centre icon rises once the track is first touched, over a moment, never with a jump
  const still = useReducedMotion();
  const lift = useMotionValue(touched ? 1 : 0);
  const [up, setUp] = useState(touched ? 1 : 0);
  useMotionValueEvent(lift, "change", setUp);
  useEffect(() => { if (touched) { if (still) lift.set(1); else animate(lift, 1, { duration: 0.35, ease: [0.2, 0.9, 0.3, 1.2] }); } }, [touched, still, lift]);
  const paper = tone === "paper";
  const ink = paper ? "18 19 28" : "0 0 0";

  // each icon's size from how near the centre it is; then each placed from its neighbour's edge (centres apart by half of
  // each plus the gap), and the row shifted so the point the wheel is at (p, between two icons) sits on the centre
  const n = Math.floor(p), t = p - n;
  const slots = Array.from({ length: 9 }, (_, i) => n - 4 + i);
  const size = (j: number) => SMALL + (BIG - SMALL) * Math.max(0, 1 - Math.abs(j - p)) * up;
  const xs: number[] = [0];
  for (let i = 1; i < slots.length; i++) xs.push(xs[i - 1] + (size(slots[i - 1]) + size(slots[i])) / 2 + GAP);
  const shift = xs[4] + t * (xs[5] - xs[4]);
  // the ruler: only the ticks in view are drawn, moving as far as the icons do
  const [w, setW] = useState(345);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.offsetWidth)); ro.observe(el); return () => ro.disconnect(); }, [ref]);
  const off = p * STEP, first = Math.floor((off - w / 2) / PX), last = Math.ceil((off + w / 2) / PX);
  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label="Icon" aria-valuemin={0} aria-valuemax={ICONS.length - 1} aria-valuenow={mod(near, ICONS.length)} aria-valuetext={touched ? here.name : "None chosen"}
      data-need={k ? undefined : "1"} {...handlers}
      className={cx("relative cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing", pressed[tone])}
      style={{ height: H, borderRadius: R, overflow: "hidden", clipPath: `inset(0 round ${R}px)` /* Safari leaks moving layers past a rounded overflow */ }}>
      {/* the icons, fading out towards the track's ends */}
      <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_24%,#000_76%,transparent)]">
        {slots.map((j, i) => {
          const s = size(j) / BIG, f = Math.max(0, 1 - Math.abs(j - p)) * up;
          const x = xs[i] - shift;
          return (
            <span key={j} className="pointer-events-none absolute left-1/2" aria-hidden
              style={{ width: BIG, height: BIG, top: TOP, marginLeft: -BIG / 2, transform: `translateX(${x}px) scale(${s})`,
                filter: `brightness(${0.9 + 0.1 * f}) saturate(${0.82 + 0.18 * f})`, zIndex: f > 0.5 ? 30 : 10 - Math.abs(j - near) }}>
              <AppIcon k={ICONS[mod(j, ICONS.length)].k} size={BIG} />
              {/* raised: a short shadow on the floor and a lit top edge; pressed: a faint shade inside its top */}
              <span className="absolute inset-0 rounded-[22.37%]" style={{ boxShadow: f > 0.5 ? `0 5px 9px -3px rgb(${ink} / .42), 0 1px 2px rgb(${ink} / .22), inset 0 1px 0 rgb(255 255 255 / .35)` : `inset 0 1px 2px rgb(${ink} / .22)` }} />
            </span>
          );
        })}
      </div>
      {/* the ruler, 1px above the track's floor, fading at its ends as the measuring ruler does */}
      <svg width={w} height={RULER} className="pointer-events-none absolute left-0 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" style={{ bottom: FLOOR }} aria-hidden>
        {Array.from({ length: last - first + 1 }, (_, n) => {
          const i = first + n, kind = mod(i, 10) === 0 ? TICK.major : mod(i, 2) === 0 ? TICK.mid : TICK.minor;
          const x = w / 2 + i * PX - off;
          return <line key={i} x1={x} x2={x} y1={RULER - RULER * kind[0]} y2={RULER} stroke={paper ? "#0b0c15" : "#fff"} strokeOpacity={kind[1]} strokeWidth={kind[2]} />;
        })}
      </svg>
      <span className={cx("pointer-events-none absolute left-1/2 z-40 w-[2px] -translate-x-1/2 rounded-t-full", paper ? "bg-primary-2" : "bg-white")} style={{ bottom: FLOOR, height: RULER * 0.62 }} aria-hidden />
      {/* the walls' shade, over the icons at the track's ends so they sit down in it */}
      <span className="pointer-events-none absolute inset-0 z-20" style={{ borderRadius: R, boxShadow: `inset 0 3px 6px rgb(${ink} / ${paper ? 0.16 : 0.5}), inset 14px 0 12px -12px rgb(${ink} / ${paper ? 0.3 : 0.7}), inset -14px 0 12px -12px rgb(${ink} / ${paper ? 0.3 : 0.7})` }} aria-hidden />
    </div>
  );
}
