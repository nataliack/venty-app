"use client";
// Lab · the look switch on On your body (25 Oct 2026): the garment in its own fabric, or as its pattern. The inset
// slider (picked 25 Oct from five), made smaller, with flat icons: one for the fabric (three to try) and the pattern
// piece, dashed.
import { useEffect, useRef, type ReactNode } from "react";
import { motion, useAnimate, useReducedMotion, type Variants } from "motion/react";
import { cx } from "@/components/ui";
import type { GarmentLook } from "@/components/Body3D";

// ─── the icons: flat, bold, one colour (the switch's), drawn on 24 × 24 and shown at 20 px ───
export type FabricIcon = "piece" | "swatch" | "roll";
export const FABRIC_ICONS: { k: FabricIcon; name: string; note: string }[] = [
  { k: "piece", name: "Solid piece", note: "The same bodice piece twice: solid (cut from cloth) and dashed (its pattern, with the grainline). Solid is the fabric, dashed is the pattern." },
  { k: "swatch", name: "Pinked swatch", note: "A square of cloth with pinked edges (the zigzag pinking shears leave), beside the dashed pattern piece." },
  { k: "roll", name: "Fabric roll", note: "A roll of cloth with its end unrolled, beside the dashed pattern piece." },
];

// the bodice piece both icons share
const PIECE = "M5 3h5q1 3 4 3l4.5-2 1.5 5q-3 1.5-2.5 5l.5 7.5H5z";

function FabricGlyph({ k }: { k: FabricIcon }) {
  if (k === "swatch") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4 5.5 6 3.5l2 2 2-2 2 2 2-2 2 2 2-2 2 2v13l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2z" fill="currentColor" />
    </svg>
  );
  if (k === "roll") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M7 4h12v9H7z" fill="currentColor" />
      <path d="M7 13h12l2 7H9z" fill="currentColor" opacity=".55" />
      <ellipse cx="7" cy="8.5" rx="3" ry="4.5" fill="currentColor" />
      <ellipse cx="7" cy="8.5" rx="1.1" ry="1.7" fill="var(--color-card)" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path d={PIECE} fill="currentColor" /></svg>
  );
}

function PatternGlyph() {
  const line = { fill: "none", stroke: "currentColor", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d={PIECE} {...line} strokeWidth="1.8" strokeDasharray="2.6 1.9" />
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

// the inset slider: a knob raised out of a track pressed into the screen; it slides to the choice, stretching as it goes
const KNOB = 38, GAP = 3;
export function LookSwitch({ value, onChange, icon }: { value: GarmentLook; onChange: (v: GarmentLook) => void; icon: FabricIcon }) {
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
    <div role="radiogroup" aria-label="How the garment looks" className="ruler-track relative flex flex-col rounded-full" style={{ padding: GAP, gap: GAP }}>
      <span ref={scope} aria-hidden className="knob absolute rounded-full" style={{ left: GAP, top: GAP, width: KNOB, height: KNOB }} />
      {LOOKS.map(({ k, label }) => (
        <button key={k} role="radio" aria-checked={value === k} aria-label={label} title={label} onClick={() => onChange(k)}
          className={cx("relative z-10 grid place-items-center rounded-full transition-colors duration-300", value === k ? "text-white" : "text-white/35")} style={{ width: KNOB, height: KNOB }}>
          <Pop on={value === k}>{k === "fabric" ? <FabricGlyph k={icon} /> : <PatternGlyph />}</Pop>
        </button>
      ))}
    </div>
  );
}
