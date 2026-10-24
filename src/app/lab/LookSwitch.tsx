"use client";
// Lab · the look switch on On your body (24 Oct 2026): the garment true to life (its own fabric, rendered) or as its
// pattern. Vertical, on the left edge, icons only. Three icon pairs × five skeuomorphic switches, each with its own
// animation; pick a pair and a switch and try them on the 3D body.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { motion, useAnimate, useReducedMotion, type Variants } from "motion/react";
import { cx } from "@/components/ui";
import type { GarmentLook } from "@/components/Body3D";

// ─── the icons: one for the garment true to life, one for its pattern (24 × 24, in the switch's colour) ───
export type IconSet = "cube" | "ball" | "drape";
export const ICON_SETS: { k: IconSet; name: string; note: string }[] = [
  { k: "cube", name: "Cube and its net", note: "A solid, shaded cube, and the same cube unfolded flat (a staggered net, so it never reads as a cross) with its folds dashed: a pattern is the 3D thing laid flat." },
  { k: "ball", name: "Render ball and pattern piece", note: "The shaded ball 3D apps use for the rendered view, and a bodice pattern piece with its seam allowance and grainline." },
  { k: "drape", name: "Draped cloth and flat piece", note: "A swatch of cloth falling in folds, lit, and the same swatch flat as a pattern piece, its seam allowance dashed." },
];

function TrueIcon({ set }: { set: IconSet }) {
  const id = useId();
  if (set === "cube") return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M12 2.8 20.2 7.4 12 12 3.8 7.4z" fill="currentColor" />
      <path d="M3.8 7.4 12 12v9.2l-8.2-4.6z" fill="currentColor" opacity=".5" />
      <path d="M20.2 7.4 12 12v9.2l8.2-4.6z" fill="currentColor" opacity=".75" />
    </svg>
  );
  if (set === "ball") return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <defs><radialGradient id={id} cx="36%" cy="32%" r="70%"><stop offset="0" stopColor="currentColor" /><stop offset=".55" stopColor="currentColor" stopOpacity=".7" /><stop offset="1" stopColor="currentColor" stopOpacity=".28" /></radialGradient></defs>
      <circle cx="12" cy="12" r="8.6" fill={`url(#${id})`} />
      <ellipse cx="9" cy="8.4" rx="2.3" ry="1.5" fill="currentColor" transform="rotate(-30 9 8.4)" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M4 5q4-2 8 0t8 0v14q-4 2-8 0t-8 0z" fill="currentColor" opacity=".85" />
      <path d="M7.6 4.3q1.3 7.7 0 15.4 1.3.2 2.4-.2 1-7.5 0-15z" fill="currentColor" opacity=".45" />
      <path d="M15.6 5.4q1.2 7 0 14.2 1.3-.2 2.4-.6.9-6.6 0-13z" fill="currentColor" opacity=".45" />
    </svg>
  );
}

function PatternIcon({ set }: { set: IconSet }) {
  const line = { fill: "none", stroke: "currentColor", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  if (set === "cube") return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M7.4 5.1H12v4.6h9.2v4.6h-4.6v4.6H12v-4.6H2.8V9.7h4.6z" {...line} strokeWidth="1.5" />
      <path d="M7.4 9.7v4.6M12 9.7v4.6M16.6 9.7v4.6M7.4 9.7H12M12 14.3h4.6" {...line} strokeWidth="1.1" strokeDasharray="1.3 1.2" />
    </svg>
  );
  if (set === "ball") return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M5 3h5q1 3 4 3l4.5-2 1.5 5q-3 1.5-2.5 5l.5 7.5H5z" {...line} strokeWidth="1.5" />
      <path d="M7.4 5.4h1.2q1.6 3.2 5.4 3l3-1.2.5 1.6q-2.4 1.8-2 5.6l.3 5.2H7.4z" {...line} strokeWidth="1" strokeDasharray="1.3 1.2" />
      <path d="M11.2 10.5v7.4M9.8 11.9l1.4-1.4 1.4 1.4M9.8 16.5l1.4 1.4 1.4-1.4" {...line} strokeWidth="1.1" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M4 5h16v14H4z" {...line} strokeWidth="1.5" />
      <path d="M6.6 7.6h10.8v8.8H6.6z" {...line} strokeWidth="1" strokeDasharray="1.3 1.2" />
      <path d="M12 9.2v5.6M10.6 10.6 12 9.2l1.4 1.4M10.6 13.4l1.4 1.4 1.4-1.4" {...line} strokeWidth="1.1" />
    </svg>
  );
}

const LOOKS: { k: GarmentLook; label: string }[] = [{ k: "fabric", label: "True to life" }, { k: "pattern", label: "Pattern" }];
const Glyph = ({ k, set }: { k: GarmentLook; set: IconSet }) => (k === "fabric" ? <TrueIcon set={set} /> : <PatternIcon set={set} />);

// the icon that has just been chosen pops in (a small overshoot and a turn); the other settles back
function Pop({ on, children }: { on: boolean; children: ReactNode }) {
  const still = useReducedMotion();
  // named states, so it runs only when the choice changes (and not on the first paint)
  const variants: Variants = still ? { on: { scale: 1 }, off: { scale: 1 } } : {
    on: { scale: [0.72, 1.14, 1], rotate: [-14, 6, 0], transition: { duration: 0.45, ease: [0.2, 0.9, 0.3, 1] as const } },
    off: { scale: [1, 0.9, 1], rotate: 0, transition: { duration: 0.3 } },
  };
  return <motion.span className="grid place-items-center" initial={false} variants={variants} animate={on ? "on" : "off"}>{children}</motion.span>;
}

type SwitchProps = { value: GarmentLook; onChange: (v: GarmentLook) => void; set: IconSet };

// both choices as radio buttons (named for screen readers), over whatever the switch draws
function Hits({ value, onChange, set, className, on, off, h }: SwitchProps & { className?: string; on: string; off: string; h: string }) {
  return (
    <>
      {LOOKS.map(({ k, label }) => (
        <button key={k} role="radio" aria-checked={value === k} aria-label={label} title={label} onClick={() => onChange(k)}
          className={cx("relative z-10 grid w-full place-items-center transition-colors duration-300", h, value === k ? on : off, className)}>
          <Pop on={value === k}><Glyph k={k} set={set} /></Pop>
        </button>
      ))}
    </>
  );
}

// 1 · Inset slider: a knob raised out of a track pressed into the screen; it slides to the choice, stretching as it goes
function InsetSlider({ value, onChange, set, lit }: SwitchProps & { lit?: boolean }) {
  const [scope, animate] = useAnimate();
  const still = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    const y = value === "fabric" ? 0 : 54;
    if (first.current || still) { animate(scope.current, { y }, { duration: 0 }); first.current = false; return; }
    animate(scope.current, { y }, { type: "spring", stiffness: 520, damping: 34 });
    animate(scope.current, { scaleY: [1, 1.16, 0.96, 1], scaleX: [1, 0.9, 1.03, 1] }, { duration: 0.42, ease: "easeOut" });
  }, [value, animate, scope, still]);
  return (
    <div role="radiogroup" aria-label="How the garment looks" className="ruler-track relative flex w-[58px] flex-col rounded-full p-1">
      <span ref={scope} aria-hidden className={cx("absolute inset-x-1 top-1 h-[50px] rounded-full", lit ? "knob-lit" : "knob")} />
      <Hits value={value} onChange={onChange} set={set} h="h-[50px] mb-1 last:mb-0" on="text-white" off="text-white/35" />
    </div>
  );
}

// 3 · Keycaps: two keys in a tray; the chosen one is pressed down and its icon lights up
function Keycaps({ value, onChange, set }: SwitchProps) {
  const still = useReducedMotion();
  return (
    <div role="radiogroup" aria-label="How the garment looks" className="ruler-track flex flex-col gap-2 rounded-[20px] p-1.5">
      {LOOKS.map(({ k, label }) => {
        const on = value === k;
        return (
          <motion.button key={k} role="radio" aria-checked={on} aria-label={label} title={label} onClick={() => onChange(k)}
            animate={{ y: on ? 3 : 0 }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 700, damping: 24 }}
            className={cx("grid h-[46px] w-[46px] place-items-center rounded-[14px] transition-[color,box-shadow,background] duration-200", on ? "keycap-down text-peri" : "keycap-up text-white/45")}>
            <Pop on={on}><span className={cx("transition-[filter] duration-300", on && "drop-shadow-[0_0_6px_rgb(140_156_248/.75)]")}><Glyph k={k} set={set} /></span></Pop>
          </motion.button>
        );
      })}
    </div>
  );
}

// 4 · Rocker: one plate in a bezel that tips to the side chosen, like a light switch; the pressed half sinks into shadow
function Rocker({ value, onChange, set }: SwitchProps) {
  const still = useReducedMotion();
  const top = value === "fabric";
  return (
    <div role="radiogroup" aria-label="How the garment looks" className="ruler-track rounded-[22px] p-1.5" style={{ perspective: 260 }}>
      <motion.div className="rocker relative flex w-[48px] flex-col overflow-hidden rounded-[16px]"
        animate={{ rotateX: top ? 11 : -11 }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 20 }}>
        <motion.span aria-hidden className="pointer-events-none absolute inset-0"
          animate={{ background: top ? "linear-gradient(180deg, rgb(0 0 0 / .38), rgb(0 0 0 / 0) 48%, rgb(255 255 255 / .05))" : "linear-gradient(180deg, rgb(255 255 255 / .05), rgb(0 0 0 / 0) 52%, rgb(0 0 0 / .38))" }}
          transition={{ duration: 0.3 }} />
        <Hits value={value} onChange={onChange} set={set} h="h-[52px]" on="text-white" off="text-white/40" />
      </motion.div>
    </div>
  );
}

// 5 · Toggle lever: a metal lever in the middle of the bezel flips to point at the choice, which lights up
function Lever({ value, onChange, set }: SwitchProps) {
  const still = useReducedMotion();
  const top = value === "fabric";
  return (
    <div role="radiogroup" aria-label="How the garment looks" className="ruler-track relative flex w-[58px] flex-col items-center rounded-full py-1">
      <Hits value={value} onChange={onChange} set={set} h="h-[44px] first:mb-[36px]" on="text-white drop-shadow-[0_0_6px_rgb(140_156_248/.8)]" off="text-white/35" />
      {/* the nut and the lever, between the two icons */}
      <span aria-hidden className="lever-nut pointer-events-none absolute left-1/2 top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -ml-[4px] h-[22px] w-[8px] origin-bottom"
        style={{ marginTop: -22 }}
        animate={{ rotate: top ? 0 : 180 }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 17 }}>
        <span className="lever-bat absolute inset-0 rounded-full" />
        <span className="lever-tip absolute -left-[2px] -top-[3px] h-[12px] w-[12px] rounded-full" />
      </motion.span>
    </div>
  );
}

export type SwitchStyle = "inset" | "lit" | "keys" | "rocker" | "lever";
export const SWITCHES: { k: SwitchStyle; name: string; note: string }[] = [
  { k: "inset", name: "Inset slider", note: "A dark knob raised out of a track pressed into the screen. It slides to the choice and stretches a little on the way." },
  { k: "lit", name: "Cornflower slider", note: "The same track, with the knob in the primary's cornflower, so the choice is the one lit piece." },
  { k: "keys", name: "Keycaps", note: "Two keys in a tray. The chosen one is pressed down and its icon lights up; the other stands proud." },
  { k: "rocker", name: "Rocker", note: "One plate in a bezel that tips to the side chosen, like a light switch. The pressed half sinks into shadow." },
  { k: "lever", name: "Toggle lever", note: "A metal lever between the two icons flips to point at the choice, with a little overshoot, and the choice lights up." },
];

export function LookSwitch({ style, ...p }: SwitchProps & { style: SwitchStyle }) {
  if (style === "lit") return <InsetSlider {...p} lit />;
  if (style === "keys") return <Keycaps {...p} />;
  if (style === "rocker") return <Rocker {...p} />;
  if (style === "lever") return <Lever {...p} />;
  return <InsetSlider {...p} />;
}
