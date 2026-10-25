"use client";
// Lab (MC 3): the icon carousel for "Add Venty to your home screen". An endless loop of the icons; the one in the centre is
// big, sits in a well pressed into the page, and is the choice. Drag or flick it (it settles on the nearest icon), tap an
// icon beside the centre to bring it in, or use the arrow keys. A ruler of ticks under it moves with it, like the measuring
// dial. The loop never jumps: each icon is placed by its running position (…, -1, 0, 1, …) and only the nine nearest the
// centre are drawn, each named by its position, so nothing is cloned, swapped or reset as it wraps round.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { ICONS, type IconKey } from "./icons";
import { AppIcon } from "./parts";

export const N = ICONS.length;
export const mod = (a: number, n: number) => ((a % n) + n) % n;

// the loop's motion, shared by every icon selector: where it is (p, in icons; …, -1, 0, 1, …), and the finger, flick, tap
// and arrow-key handlers that move it and settle it on an icon, which becomes the choice. `touched`: moved by hand at least
// once (until then nothing is chosen).
export function useIconLoop(k: IconKey | null, setK: (k: IconKey) => void, step: number) {
  const start = Math.max(0, ICONS.findIndex((x) => x.k === k));
  const pos = useMotionValue(start); // where the wheel is, in icons
  const [p, setP] = useState(start);
  useMotionValueEvent(pos, "change", setP);
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const [touched, setTouched] = useState(k !== null);
  const drag = useRef<{ x0: number; p0: number; moved: boolean; trail: { x: number; t: number }[] } | null>(null);
  useEffect(() => () => run.current?.stop(), []);

  // come to rest on an icon (by its running position); that icon is the choice
  const settle = (to: number) => {
    run.current?.stop();
    const done = () => setK(ICONS[mod(to, N)].k);
    if (still) { pos.set(to); done(); return; }
    run.current = animate(pos, to, { type: "spring", stiffness: 240, damping: 30, restDelta: 0.001, onComplete: done });
  };
  // the lab shrinks its phones on a narrow screen (CSS zoom), so finger distances are measured in the wheel's own pixels
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
      const off = (e.clientX - (r.left + r.width / 2)) / zoom() / step;
      settle(Math.round(pos.get() + off));
      return;
    }
    // a flick carries on a little, as far as it was thrown, then settles. Only the last 100ms count, so a finger that
    // stops before lifting lands where it stopped
    const recent = [...d.trail, { x: e.clientX, t: e.timeStamp }].filter((s) => e.timeStamp - s.t <= 100);
    const a = recent[0], b = recent[recent.length - 1];
    const v = recent.length > 1 && b.t > a.t ? (b.x - a.x) / zoom() / (b.t - a.t) : 0; // px per ms
    const thrown = Math.max(-3, Math.min(3, (-v * 180) / step));
    settle(Math.round(pos.get() + thrown));
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

export function IconWheel({ k, setK, size = 88, step = 88, side = 0.64, className }: {
  k: IconKey | null; setK: (k: IconKey) => void;
  size?: number;  // the centre icon
  step?: number;  // from one icon's centre to the next
  side?: number;  // how big the icons beside the centre are, against the centre one
  className?: string;
}) {
  const { p, near, here, ref, handlers } = useIconLoop(k, setK, step);
  const r = size * 0.2237; // the icon's corner (iOS's)
  const slots = Array.from({ length: 9 }, (_, i) => near - 4 + i);
  return (
    <div className={className}>
      <div ref={ref} role="slider" tabIndex={0} aria-label="Icon" aria-valuemin={0} aria-valuemax={N - 1} aria-valuenow={mod(near, N)} aria-valuetext={here.name}
        data-need={k ? undefined : "1"}
        {...handlers}
        className="relative cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,#000_16%,#000_84%,transparent)]"
        style={{ height: size + 24 }}>
        {/* the well the chosen icon sits in: the icon plus the app's 5px channel all round, its corner the icon's plus 5 */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20"
          style={{ width: size + 10, height: size + 10, borderRadius: r + 5, boxShadow: "inset 0 3px 7px rgb(0 0 0 / .45), inset 0 1px 1.5px rgb(0 0 0 / .4), inset 0 -1px 0 rgb(255 255 255 / .16), 0 1px 0 rgb(255 255 255 / .1)" }} aria-hidden />
        {slots.map((j) => {
          const d = j - p, f = Math.max(0, 1 - Math.abs(d));
          const s = side + (1 - side) * f;
          const st: CSSProperties = { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, transform: `translateX(${d * step}px) scale(${s})`, opacity: 0.6 + 0.4 * f, zIndex: 20 - Math.round(Math.abs(d) * 2) };
          return (
            <span key={j} className="pointer-events-none absolute left-1/2 top-1/2" style={st} aria-hidden>
              <AppIcon k={ICONS[mod(j, N)].k} size={size} className={f > 0.5 ? "shadow-[0_10px_22px_-8px_rgb(10_12_30/.6)]" : "shadow-[0_6px_14px_-8px_rgb(10_12_30/.5)]"} />
            </span>
          );
        })}
      </div>
      {/* the ruler: a long tick for every icon and three short ones between, moving with the wheel; the centre marked */}
      <div className="relative mx-auto mt-1 h-[18px] [mask-image:linear-gradient(90deg,transparent,#000_22%,#000_78%,transparent)]" aria-hidden
        style={{ backgroundImage: "linear-gradient(90deg, rgb(255 255 255 / .7) 1.5px, transparent 1.5px), linear-gradient(90deg, rgb(255 255 255 / .35) 1px, transparent 1px)",
          backgroundSize: `${step}px 18px, ${step / 4}px 9px`, backgroundRepeat: "repeat-x",
          backgroundPosition: `calc(50% - ${p * step + 0.75}px) 100%, calc(50% - ${p * step + 0.5}px) 100%` }}>
        <span className="absolute -top-1 left-1/2 h-[26px] w-[2px] -translate-x-1/2 rounded-full bg-peri shadow-[0_0_10px_rgb(140_156_248/.8)]" />
      </div>
      <p className="mt-2.5 text-center text-[15px] leading-none text-white/85" aria-live="polite">{here.name}</p>
    </div>
  );
}
