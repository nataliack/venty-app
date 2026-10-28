"use client";
// The home-screen icon selector on "Add Venty to your home screen" (chosen in the lab, /lab/mc3, 26 Oct 2026). The icons
// slide in a track pressed into the page (like the measuring dial's, in the page's light build): drag or flick it, tap
// an icon, or use the arrow keys. It loops without end and never jumps: each icon is placed by its running position (…, -1,
// 0, 1, …) and only the nine nearest the centre are drawn, each named by its position, so nothing is cloned or reset as it
// wraps round. It settles on the nearest icon, which is the choice. On arrival the centre icon (today's, the one the phone
// gets if none is chosen) is already raised, casting a short shadow, a little bigger than the others; once the track is
// touched it rises the rest of the way. The gaps between icons
// stay equal while one grows (each is placed from its neighbour's edge). Under the icons a ruler moves with them in the
// measuring ruler's geometry (Ruler in art.tsx, light), its ticks stopping 1px above the track's floor; the icons fade out towards
// the track's ends.
import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { ICONS, iconSrc, type IconKey } from "@/lib/appIcons";

const N = ICONS.length;
const mod = (a: number, n: number) => ((a % n) + n) % n;
// the raised icon, the pressed ones, the gap between any two (edge to edge), the room above the raised icon, the ruler
const BIG = 64, SMALL = 46, GAP = 16, TOP = 13, RULER = 24, FLOOR = 1, H = TOP + BIG + 8 + RULER + FLOOR;
// the measuring ruler's geometry: ticks 9px apart, a mid one every 2nd, a major every 10th (height, opacity, width)
const PX = 9, TICK = { major: [0.42, 0.42, 1.5], mid: [0.26, 0.24, 1], minor: [0.15, 0.14, 1] } as const;
const STEP = (BIG + SMALL) / 2 + GAP; // a finger's travel for one icon
const R = TOP + BIG * 0.2237; // the track's corner: the raised icon's corner plus the room above it, so they run parallel
const REST = 0.4; // how far the centre icon has grown before the track is touched
const INK = "24 30 70"; // the cloud's shade (a deep indigo ink), for the shades

// the loop's motion: where it is (p, in icons), and the finger, flick, tap and arrow-key handlers that move it and settle
// it on an icon. `touched`: moved by hand at least once (until then nothing is chosen)
function useIconLoop(k: IconKey | null, setK: (k: IconKey) => void, step: number) {
  const start = Math.max(0, ICONS.findIndex((x) => x.k === k));
  const pos = useMotionValue(start);
  const [p, setP] = useState(start);
  useMotionValueEvent(pos, "change", setP);
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const [touched, setTouched] = useState(k !== null);
  const drag = useRef<{ x0: number; p0: number; moved: boolean; trail: { x: number; t: number }[] } | null>(null);
  useEffect(() => () => run.current?.stop(), []);

  const settle = (to: number) => {
    run.current?.stop();
    const done = () => setK(ICONS[mod(to, N)].k);
    if (still) { pos.set(to); done(); return; }
    run.current = animate(pos, to, { type: "spring", stiffness: 240, damping: 30, restDelta: 0.001, onComplete: done });
  };
  // the desktop phone frame may be scaled, so finger distances are measured in the track's own pixels
  const zoom = () => { const el = ref.current; return el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1; };

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setTouched(true);
    run.current?.stop();
    drag.current = { x0: e.clientX, p0: pos.get(), moved: false, trail: [{ x: e.clientX, t: e.timeStamp }] };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    const dx = (e.clientX - d.x0) / zoom();
    if (Math.abs(dx) > 5) d.moved = true;
    pos.set(d.p0 - dx / step);
    d.trail.push({ x: e.clientX, t: e.timeStamp }); if (d.trail.length > 6) d.trail.shift();
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current; drag.current = null; if (!d) return;
    if (!d.moved) {
      // a tap: bring the icon under the finger to the centre
      const r = e.currentTarget.getBoundingClientRect();
      settle(Math.round(pos.get() + (e.clientX - (r.left + r.width / 2)) / zoom() / step));
      return;
    }
    // a flick carries on a little, as far as it was thrown; only the last 100ms count, so a finger that stops before
    // lifting lands where it stopped
    const recent = [...d.trail, { x: e.clientX, t: e.timeStamp }].filter((s) => e.timeStamp - s.t <= 100);
    const a = recent[0], b = recent[recent.length - 1];
    const v = recent.length > 1 && b.t > a.t ? (b.x - a.x) / zoom() / (b.t - a.t) : 0; // px per ms
    settle(Math.round(pos.get() + Math.max(-3, Math.min(3, (-v * 180) / step))));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setTouched(true);
    settle(Math.round(pos.get()) + (e.key === "ArrowRight" ? 1 : -1));
  };
  const near = Math.round(p);
  return { p, near, here: ICONS[mod(near, N)], touched, ref, handlers: { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, onKeyDown: onKey } };
}

export function IconTrack({ k, setK }: { k: IconKey | null; setK: (k: IconKey) => void }) {
  const { p, near, here, touched, ref, handlers } = useIconLoop(k, setK, STEP);
  // the centre icon grows the rest of the way once the track is first touched, over a moment, never with a jump
  const still = useReducedMotion();
  const lift = useMotionValue(touched ? 1 : REST);
  const [up, setUp] = useState(touched ? 1 : REST);
  useMotionValueEvent(lift, "change", setUp);
  useEffect(() => { if (touched) { if (still) lift.set(1); else animate(lift, 1, { duration: 0.35, ease: [0.2, 0.9, 0.3, 1.2] }); } }, [touched, still, lift]);

  // each icon's size from how near the centre it is; then each placed from its neighbour's edge (centres apart by half of
  // each plus the gap), and the row shifted so the point the track is at (p, between two icons) sits on the centre
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
    <div ref={ref} role="slider" tabIndex={0} aria-label="Icon" aria-valuemin={0} aria-valuemax={N - 1} aria-valuenow={mod(near, N)} aria-valuetext={touched ? here.name : "None chosen"}
      data-need={k ? undefined : "1"} {...handlers}
      className="relative cursor-grab touch-pan-y select-none bg-[#181e46]/[.07] shadow-[inset_0_3px_7px_rgb(24_30_70/.2),inset_0_1px_1.5px_rgb(24_30_70/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)] outline-none active:cursor-grabbing"
      style={{ height: H, borderRadius: R, overflow: "hidden", clipPath: `inset(0 round ${R}px)` /* Safari leaks moving layers past a rounded overflow */ }}>
      {/* the icons, fading out towards the track's ends */}
      <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_24%,#000_76%,transparent)]">
        {slots.map((j, i) => {
          // g: how near the centre (its light, shadow and place on top, from the first moment); its size grows with `up`
          const s = size(j) / BIG, g = Math.max(0, 1 - Math.abs(j - p));
          return (
            <span key={j} className="pointer-events-none absolute left-1/2" aria-hidden
              style={{ width: BIG, height: BIG, top: TOP, marginLeft: -BIG / 2, transform: `translateX(${xs[i] - shift}px) scale(${s})`,
                filter: `brightness(${0.9 + 0.1 * g}) saturate(${0.82 + 0.18 * g})`, zIndex: g > 0.5 ? 30 : 10 - Math.abs(j - near) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconSrc(ICONS[mod(j, N)].k, 192)} alt="" width={BIG} height={BIG} draggable={false} className="block h-full w-full rounded-[22.37%]" />
              {/* raised: a short shadow on the floor and a lit top edge; pressed: a faint shade inside its top */}
              <span className="absolute inset-0 rounded-[22.37%]" style={{ boxShadow: g > 0.5 ? `0 5px 9px -3px rgb(${INK} / .42), 0 1px 2px rgb(${INK} / .22), inset 0 1px 0 rgb(255 255 255 / .35)` : `inset 0 1px 2px rgb(${INK} / .22)` }} />
            </span>
          );
        })}
      </div>
      {/* the ruler, 1px above the track's floor, fading at its ends as the measuring ruler does */}
      <svg width={w} height={RULER} className="pointer-events-none absolute left-0 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" style={{ bottom: FLOOR }} aria-hidden>
        {Array.from({ length: last - first + 1 }, (_, m) => {
          const i = first + m, kind = mod(i, 10) === 0 ? TICK.major : mod(i, 2) === 0 ? TICK.mid : TICK.minor;
          const x = w / 2 + i * PX - off;
          return <line key={i} x1={x} x2={x} y1={RULER - RULER * kind[0]} y2={RULER} stroke="#0b0c15" strokeOpacity={kind[1]} strokeWidth={kind[2]} />;
        })}
      </svg>
      <span className="pointer-events-none absolute left-1/2 z-40 w-[2px] -translate-x-1/2 rounded-t-full bg-primary-2" style={{ bottom: FLOOR, height: RULER * 0.62 }} aria-hidden />
      {/* the walls' shade, over the icons at the track's ends so they sit down in it */}
      <span className="pointer-events-none absolute inset-0 z-20" style={{ borderRadius: R, boxShadow: `inset 0 3px 6px rgb(${INK} / .16), inset 14px 0 12px -12px rgb(${INK} / .3), inset -14px 0 12px -12px rgb(${INK} / .3)` }} aria-hidden />
    </div>
  );
}
