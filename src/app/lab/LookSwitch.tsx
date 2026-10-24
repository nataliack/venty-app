"use client";
// Lab · the look switch on On your body (25 Oct 2026): the garment in its own fabric, or as its pattern. The inset
// slider (picked 25 Oct from five), made smaller, with flat icons: many for the fabric and many for the pattern, to be
// picked as a pair. Every icon is drawn on 24 × 24, flat and bold (no shading, no 3D), in the switch's one colour.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { motion, useAnimate, useReducedMotion, type Variants } from "motion/react";
import { cx } from "@/components/ui";
import type { GarmentLook } from "@/components/Body3D";

type G = { size?: number };
const Svg = ({ size = 20, children }: G & { children: ReactNode }) => <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>{children}</svg>;
const line = { fill: "none", stroke: "currentColor", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const dash = { ...line, strokeWidth: 1.8, strokeDasharray: "2.6 1.9" };
// a solid shape with lines cut out of it (the cut shows whatever is behind the switch)
function Cut({ size, shape, cut }: G & { shape: ReactNode; cut: ReactNode }) {
  const id = useId();
  return (
    <Svg size={size}>
      <defs><mask id={id}><g fill="#fff">{shape}</g><g fill="#000" stroke="#000">{cut}</g></mask></defs>
      <g fill="currentColor" mask={`url(#${id})`}>{shape}</g>
    </Svg>
  );
}

// ─── the fabric (the garment true to life) ───
const PINKED = "M4 5.5 6 3.5l2 2 2-2 2 2 2-2 2 2 2-2 2 2v13l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2z";
export const FABRIC_ICONS = [
  { k: "swatch", name: "Pinked swatch", draw: (p: G) => <Svg {...p}><path d={PINKED} fill="currentColor" /></Svg> },
  { k: "stack", name: "Folded stack", draw: (p: G) => <Svg {...p}><g fill="currentColor"><path d="M4 4h12.5a2.6 2.6 0 0 1 0 5.2H4z" /><path d="M4 10.4h12.5a2.6 2.6 0 0 1 0 5.2H4z" /><path d="M4 16.8h12.5a2.6 2.6 0 0 1 0 5.2H4z" /></g></Svg> },
  { k: "drape", name: "Hanging drape", draw: (p: G) => <Cut {...p} shape={<><path d="M3 3.6h18v1.8H3z" /><path d="M5 6.4h14v11q-1.75 2.6-3.5 0t-3.5 0-3.5 0-3.5 0z" /></>} cut={<path d="M8.5 8v8.6M12 8v9.4M15.5 8v8.6" strokeWidth="1.2" fill="none" />} /> },
  { k: "flag", name: "Waving cloth", draw: (p: G) => <Svg {...p}><path d="M3.5 7q4.25-3.6 8.5 0t8.5 0v10.5q-4.25 3.6-8.5 0t-8.5 0z" fill="currentColor" /></Svg> },
  { k: "roll", name: "Fabric roll", draw: (p: G) => <Cut {...p} shape={<><path d="M8 4h12v9H8z" /><path d="M8 13h12l2 7.5H10z" opacity=".55" /><ellipse cx="8" cy="8.5" rx="3.3" ry="4.6" /></>} cut={<ellipse cx="8" cy="8.5" rx="1.2" ry="1.8" />} /> },
  { k: "weave", name: "Basket weave", draw: (p: G) => <Cut {...p} shape={<rect x="3.5" y="3.5" width="17" height="17" rx="3" />} cut={<path d="M12 3v18M3 12h18M6.3 3.5V12M9.2 3.5V12M12 6.3h8.5M12 9.2h8.5M3.5 14.8H12M3.5 17.7H12M14.8 12v8.5M17.7 12v8.5" strokeWidth="1.1" fill="none" />} /> },
  { k: "print", name: "Polka print", draw: (p: G) => <Cut {...p} shape={<rect x="3.5" y="3.5" width="17" height="17" rx="3" />} cut={<>{[[7, 7], [12, 7], [17, 7], [9.5, 10.7], [14.5, 10.7], [7, 14.4], [12, 14.4], [17, 14.4], [9.5, 18], [14.5, 18]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.05" />)}</>} /> },
  { k: "knit", name: "Knit", draw: (p: G) => <Cut {...p} shape={<rect x="3.5" y="3.5" width="17" height="17" rx="3" />} cut={<path d="M5.5 7l3.2 3 3.3-3 3.3 3 3.2-3M5.5 11.5l3.2 3 3.3-3 3.3 3 3.2-3M5.5 16l3.2 3 3.3-3 3.3 3 3.2-3" strokeWidth="1.2" fill="none" strokeLinejoin="round" />} /> },
  { k: "pleats", name: "Pleats", draw: (p: G) => { const s = "M3 5l3 1.6L9 5l3 1.6L15 5l3 1.6L21 5v13l-3 1.6-3-1.6-3 1.6-3-1.6-3 1.6-3-1.6z"; return <Cut {...p} shape={<path d={s} />} cut={<path d="M6 6.6v13M12 6.6v13M18 6.6v13" strokeWidth="1.3" fill="none" />} />; } },
  { k: "swatches", name: "Swatch book", draw: (p: G) => <Svg {...p}><g fill="currentColor"><rect x="8.5" y="3.5" width="7" height="15.5" rx="1.8" transform="rotate(-26 12 20)" opacity=".38" /><rect x="8.5" y="3.5" width="7" height="15.5" rx="1.8" transform="rotate(-11 12 20)" opacity=".66" /><rect x="8.5" y="3.5" width="7" height="15.5" rx="1.8" transform="rotate(5 12 20)" /></g></Svg> },
  { k: "spool", name: "Thread spool", draw: (p: G) => <Cut {...p} shape={<><rect x="4" y="3" width="16" height="2.8" rx="1.4" /><rect x="4" y="18.2" width="16" height="2.8" rx="1.4" /><rect x="6.5" y="5.8" width="11" height="12.4" /></>} cut={<path d="M6.5 9h11M6.5 12h11M6.5 15h11" strokeWidth="1.1" fill="none" />} /> },
  { k: "hanger", name: "On a hanger", draw: (p: G) => <Svg {...p}><path d="M12 7.6V6.3a1.9 1.9 0 1 1 1.9-1.9M12 7.6 3.5 12.6h17z" {...line} strokeWidth="1.8" /><path d="M4.6 12.6h14.8l-1.4 8.4-3-1.4-3 1.4-3-1.4-3 1.4z" fill="currentColor" /></Svg> },
  { k: "form", name: "Dress form", draw: (p: G) => <Svg {...p}><path d="M8.5 3.5h7q1.2 3.2-.8 6.2 2.3 2.2 2.3 5.3l-1 2.5h-8l-1-2.5q0-3.1 2.3-5.3-2-3-.8-6.2z" fill="currentColor" /><path d="M12 17.5V21M8.5 21h7" {...line} strokeWidth="1.8" /></Svg> },
  { k: "eye", name: "Eye", draw: (p: G) => <Svg {...p}><path d="M2.5 12s3.5-6.2 9.5-6.2 9.5 6.2 9.5 6.2-3.5 6.2-9.5 6.2S2.5 12 2.5 12z" {...line} strokeWidth="1.8" /><circle cx="12" cy="12" r="3.2" fill="currentColor" /></Svg> },
  { k: "photo", name: "Picture", draw: (p: G) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2.6" {...line} strokeWidth="1.8" /><path d="M5.6 17l4.4-5.4 3 3.4 2-2 3.4 4z" fill="currentColor" /><circle cx="16" cy="9.4" r="1.6" fill="currentColor" /></Svg> },
  { k: "cube", name: "Cube outline", draw: (p: G) => <Svg {...p}><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" {...line} strokeWidth="1.7" /></Svg> },
  { k: "3d", name: "3D", draw: (p: G) => <Svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="3.2" {...line} strokeWidth="1.8" /><text x="12" y="15.2" textAnchor="middle" fontSize="8.4" fontWeight="600" fill="currentColor" style={{ fontFamily: "inherit" }}>3D</text></Svg> },
] as const;

// ─── the pattern ───
const PIECE = "M5 3h5q1 3 4 3l4.5-2 1.5 5q-3 1.5-2.5 5l.5 7.5H5z";
const INNER = "M7.6 5.6h1q1.7 3.3 5.4 3.1l2.8-1.1.6 1.7q-2.4 1.8-2 5.6l.3 4.9H7.6z";
const GRAIN = (x: number, y0: number, y1: number) => `M${x} ${y0}v${y1 - y0}M${x - 1.7} ${y0 + 1.7}l1.7-1.7 1.7 1.7M${x - 1.7} ${y1 - 1.7}l1.7 1.7 1.7-1.7`;
export const PATTERN_ICONS = [
  { k: "dashed", name: "Dashed piece and grainline", draw: (p: G) => <Svg {...p}><path d={PIECE} {...dash} /><path d={GRAIN(11.5, 10, 17.5)} {...line} strokeWidth="1.6" /></Svg> },
  { k: "dashedPlain", name: "Dashed piece", draw: (p: G) => <Svg {...p}><path d={PIECE} {...dash} /></Svg> },
  { k: "outline", name: "Outline and grainline", draw: (p: G) => <Svg {...p}><path d={PIECE} {...line} strokeWidth="1.8" /><path d={GRAIN(11.5, 10, 17.5)} {...line} strokeWidth="1.6" /></Svg> },
  { k: "notched", name: "Notches", draw: (p: G) => <Svg {...p}><path d={PIECE} {...line} strokeWidth="1.8" /><path d="M5 11.6 7 13 5 14.4zM11 20.5l1.2-2 1.2 2z" fill="currentColor" /><path d={GRAIN(12.5, 9.5, 16)} {...line} strokeWidth="1.5" /></Svg> },
  { k: "cutline", name: "Cutting line outside", draw: (p: G) => <Svg {...p}><path d={PIECE} {...dash} strokeWidth="1.5" /><path d={INNER} {...line} strokeWidth="1.6" /></Svg> },
  { k: "allowance", name: "Seam allowance inside", draw: (p: G) => <Svg {...p}><path d={PIECE} {...line} strokeWidth="1.8" /><path d={INNER} {...dash} strokeWidth="1.3" strokeDasharray="1.8 1.5" /></Svg> },
  { k: "skirt", name: "Skirt piece", draw: (p: G) => <Svg {...p}><path d="M8.5 3h7l4.5 18H4z" {...dash} /><path d={GRAIN(12, 8, 17)} {...line} strokeWidth="1.6" /></Svg> },
  { k: "rect", name: "Dashed panel", draw: (p: G) => <Svg {...p}><rect x="4" y="3.5" width="16" height="17" rx="2.5" {...dash} /><path d={GRAIN(12, 7.5, 16.5)} {...line} strokeWidth="1.6" /></Svg> },
  { k: "two", name: "Front and back", draw: (p: G) => <Svg {...p}><path d="M2.5 5h3.4q.7 2 2.7 2l2.6-1.3 1 3.3q-2 1-1.7 3.3l.3 5.2H2.5z" {...dash} strokeWidth="1.5" strokeDasharray="2 1.5" /><path d="M15.5 5h3.5l3 12.5H12.5z" {...dash} strokeWidth="1.5" strokeDasharray="2 1.5" /></Svg> },
  { k: "fold", name: "Place on fold", draw: (p: G) => <Svg {...p}><path d={PIECE} {...dash} strokeWidth="1.6" /><path d="M2.4 7v10M2.4 7h2M2.4 17h2" {...line} strokeWidth="1.5" /></Svg> },
  { k: "sheet", name: "Pattern sheet", draw: (p: G) => <Svg {...p}><path d="M5 3h10l4 4v14H5z" {...line} strokeWidth="1.7" /><path d="M15 3v4h4" {...line} strokeWidth="1.5" /><path d="M8.2 9.5h3.6q.6 1.4 2 1.4l1.6-.8.6 2q-1.3.7-1 2.4l.2 3.2H8.2z" {...dash} strokeWidth="1.3" strokeDasharray="1.7 1.4" /></Svg> },
  { k: "scissors", name: "Scissors on the line", draw: (p: G) => <Svg {...p}><circle cx="5" cy="8" r="2.4" {...line} strokeWidth="1.6" /><circle cx="5" cy="16" r="2.4" {...line} strokeWidth="1.6" /><path d="M7 9.3 13 12M7 14.7 13 12" {...line} strokeWidth="1.6" /><path d="M15 12h7" {...dash} strokeWidth="1.6" /></Svg> },
  { k: "pin", name: "Pinned piece", draw: (p: G) => <Svg {...p}><path d={PIECE} {...dash} /><path d="M3 13.5h12" {...line} strokeWidth="1.5" /><circle cx="17" cy="13.5" r="2.3" fill="currentColor" /></Svg> },
  { k: "curve", name: "French curve", draw: (p: G) => <Svg {...p}><path d="M4 20.5C4 10 9.5 3.5 20.5 3.5v4.4C12.5 7.9 8.4 12.6 8.4 20.5z" {...line} strokeWidth="1.7" /><circle cx="9.6" cy="11" r="1.3" fill="currentColor" /></Svg> },
  { k: "wheel", name: "Tracing wheel", draw: (p: G) => <Svg {...p}><path d="M3.5 13.5l6-6" {...line} strokeWidth="2.2" /><circle cx="14" cy="11" r="4.2" {...line} strokeWidth="1.6" /><circle cx="14" cy="11" r="1.1" fill="currentColor" /><path d="M8 20.5h14" {...line} strokeWidth="1.8" strokeDasharray=".1 2.6" /></Svg> },
  { k: "graph", name: "Drafted on grid", draw: (p: G) => <Svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" {...line} strokeWidth="1.5" /><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" {...line} strokeWidth=".8" opacity=".45" /><path d="M6 6.5q7.5 0 7.5 6.5T19 18" {...line} strokeWidth="1.8" /></Svg> },
] as const;
export type FabricIcon = (typeof FABRIC_ICONS)[number]["k"];
export type PatternIcon = (typeof PATTERN_ICONS)[number]["k"];
export const FabricGlyph = ({ k, size }: { k: FabricIcon; size?: number }) => FABRIC_ICONS.find((x) => x.k === k)!.draw({ size });
export const PatternGlyph = ({ k, size }: { k: PatternIcon; size?: number }) => PATTERN_ICONS.find((x) => x.k === k)!.draw({ size });

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
export const KNOB = 38, GAP = 3;
export function LookSwitch({ value, onChange, fabric, pattern }: { value: GarmentLook; onChange: (v: GarmentLook) => void; fabric: FabricIcon; pattern: PatternIcon }) {
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
          <Pop on={value === k}>{k === "fabric" ? <FabricGlyph k={fabric} /> : <PatternGlyph k={pattern} />}</Pop>
        </button>
      ))}
    </div>
  );
}

// one icon to pick in the lab: big, then at its real size on the knob
export function IconTile({ name, on, onPick, children, small }: { name: string; on: boolean; onPick: () => void; children: ReactNode; small: ReactNode }) {
  return (
    <button onClick={onPick} aria-pressed={on} className={cx("flex w-[124px] flex-col items-center gap-3 rounded-[22px] p-4 text-left transition-colors", on ? "bg-white/[.12] ring-2 ring-white" : "bg-white/[.04] hover:bg-white/[.07]")}>
      <span className="grid h-14 w-14 place-items-center text-white">{children}</span>
      <span className="knob grid place-items-center rounded-full text-white" style={{ width: KNOB, height: KNOB }}>{small}</span>
      <span className="text-center text-[13px] leading-tight text-white/70">{name}</span>
    </button>
  );
}
