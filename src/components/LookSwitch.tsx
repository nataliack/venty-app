"use client";
// The look switch on On your body (25 Oct 2026, from the lab): the garment in its own fabric, or as its pattern. A knob
// raised out of a track pressed into the screen (the ruler's .ruler-track, .knob), one above the other; it slides to the
// choice and stretches a little on the way, and the icon chosen pops in. Icons only (named for screen readers): knit for
// the fabric, the dashed pattern piece with its grainline for the pattern. Flat, in the switch's one colour.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { motion, useAnimate, useReducedMotion, type Variants } from "motion/react";
import { cx } from "@/components/ui";
import type { GarmentLook } from "@/components/Body3D";

const line = { fill: "none", stroke: "currentColor", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// knit: a square of cloth with rows of knit stitches cut out of it
function Knit() {
  const id = useId();
  const square = <rect x="3.5" y="3.5" width="17" height="17" rx="3" />;
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden>
      <defs><mask id={id}><g fill="#fff">{square}</g><path d="M5.5 7l3.2 3 3.3-3 3.3 3 3.2-3M5.5 11.5l3.2 3 3.3-3 3.3 3 3.2-3M5.5 16l3.2 3 3.3-3 3.3 3 3.2-3" stroke="#000" strokeWidth="1.2" fill="none" strokeLinejoin="round" /></mask></defs>
      <g fill="currentColor" mask={`url(#${id})`}>{square}</g>
    </svg>
  );
}

// the pattern: a bodice piece, its cutting line dashed, and its grainline
function Piece() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden>
      <path d="M5 3h5q1 3 4 3l4.5-2 1.5 5q-3 1.5-2.5 5l.5 7.5H5z" {...line} strokeWidth="1.8" strokeDasharray="2.6 1.9" />
      <path d="M11.5 10v7.5M9.8 11.7l1.7-1.7 1.7 1.7M9.8 15.8l1.7 1.7 1.7-1.7" {...line} strokeWidth="1.6" />
    </svg>
  );
}

const LOOKS: { k: GarmentLook; label: string }[] = [{ k: "fabric", label: "Fabric" }, { k: "pattern", label: "Pattern" }];

// the icon just chosen pops in (a small overshoot and a turn); runs only when the choice changes
function Pop({ on, children }: { on: boolean; children: ReactNode }) {
  const still = useReducedMotion();
  const variants: Variants = still ? { on: { scale: 1 }, off: { scale: 1 } } : {
    on: { scale: [0.72, 1.14, 1], rotate: [-14, 6, 0], transition: { duration: 0.45, ease: [0.2, 0.9, 0.3, 1] as const } },
    off: { scale: [1, 0.9, 1], rotate: 0, transition: { duration: 0.3 } },
  };
  return <motion.span className="grid place-items-center" initial={false} variants={variants} animate={on ? "on" : "off"}>{children}</motion.span>;
}

const KNOB = 38, GAP = 3;
export function LookSwitch({ value, onChange, className }: { value: GarmentLook; onChange: (v: GarmentLook) => void; className?: string }) {
  const [scope, animate] = useAnimate();
  const still = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    const y = value === "fabric" ? 0 : KNOB + GAP;
    if (first.current || still) { animate(scope.current, { y }, { duration: 0 }); first.current = false; return; }
    animate(scope.current, { y }, { type: "spring", stiffness: 520, damping: 34 });
    animate(scope.current, { scaleY: [1, 1.16, 0.96, 1], scaleX: [1, 0.9, 1.03, 1] }, { duration: 0.42, ease: "easeOut" });
  }, [value, animate, scope, still]);
  return (
    <div role="radiogroup" aria-label="How the garment looks" className={cx("ruler-track relative flex flex-col rounded-full", className)} style={{ padding: GAP, gap: GAP }}>
      <span ref={scope} aria-hidden className="knob absolute rounded-full" style={{ left: GAP, top: GAP, width: KNOB, height: KNOB }} />
      {LOOKS.map(({ k, label }) => (
        <button key={k} role="radio" aria-checked={value === k} aria-label={label} title={label} onClick={() => onChange(k)}
          className={cx("relative z-10 grid place-items-center rounded-full transition-colors duration-300", value === k ? "text-white" : "text-white/35")} style={{ width: KNOB, height: KNOB }}>
          <Pop on={value === k}>{k === "fabric" ? <Knit /> : <Piece />}</Pop>
        </button>
      ))}
    </div>
  );
}
