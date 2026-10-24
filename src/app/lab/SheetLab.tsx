"use client";
// Lab: the top of every pop-up (bottom sheet), from Jose's Figma: the drag handle sits in a cut in the sheet's top edge.
// The cut is the handle's own outline pushed out by one channel (G, 5px, as round the tab bar's plus), so the gap is
// the same all the way round; where the cut meets the top edge its corners are rounded (F), like the bar's notch.
// Pressing near the handle (or pointing at it) turns it periwinkle, with the glow, rim and gradient of home's card icons.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cx, Pill, TextButton, SheetHead } from "@/components/ui";

const G = 5;
type V = "notch" | "inside" | "wide" | "now";
const VARIANTS: { k: V; name: string; note: string; hw: number; hh: number; cy: number; r: number; f: number }[] = [
  { k: "notch", name: "A · Your cut, exact", note: "Your Figma, made exact: the 33 × 4 handle with its top on the sheet's top edge, in a cut that is its outline pushed out by 5px (43 × 14, round ends), so the channel is 5px all round. The cut's corners round off into the top edge, and the sheet's top corners are 45px.", hw: 33, hh: 4, cy: 2, r: 45, f: 6 },
  { k: "inside", name: "B · Handle inside the cut", note: "The handle (36 × 5) sits fully inside the sheet, 3.5px below its top edge, in a deeper cut (5px all round), so it reads as set into the sheet rather than resting on its edge.", hw: 36, hh: 5, cy: 6, r: 45, f: 6 },
  { k: "wide", name: "C · Wider handle", note: "A longer, slightly thicker handle (48 × 5) in its 5px cut: easier to see and to aim for with a thumb.", hw: 48, hh: 5, cy: 4, r: 45, f: 6 },
  { k: "now", name: "D · Today", note: "The app's sheet now: 30px corners and a plain handle inside the sheet.", hw: 36, hh: 4, cy: 0, r: 30, f: 0 },
];

// the sheet's outline: rounded top corners (r) and, in the top edge's centre, the cut round the handle (a stadium of the
// handle plus G, its centre cy below the edge) with its corners rounded by f where it meets the edge
function sheetPath(w: number, h: number, v: (typeof VARIANTS)[number]) {
  const { r } = v;
  if (v.k === "now") return `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h} H 0 V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  const c = w / 2, rh = v.hh / 2, half = v.hw / 2 - rh, rn = rh + G, cy = v.cy, f = v.f;
  const L = c - half, R = c + half; // the centres of the cut's round ends
  const dx = Math.sqrt((rn + f) ** 2 - (f - cy) ** 2); // the fillet's centre sits this far out from the end's centre
  const k = rn / (rn + f);
  const tl = [L - dx * k, cy + (f - cy) * k], tr = [R + dx * k, cy + (f - cy) * k]; // where fillet and end touch
  return [`M ${r} 0`, `H ${L - dx}`, `A ${f} ${f} 0 0 1 ${tl[0]} ${tl[1]}`, `A ${rn} ${rn} 0 0 0 ${L} ${cy + rn}`, `H ${R}`,
    `A ${rn} ${rn} 0 0 0 ${tr[0]} ${tr[1]}`, `A ${f} ${f} 0 0 1 ${R + dx} 0`, `H ${w - r}`, `A ${r} ${r} 0 0 1 ${w} ${r}`, `V ${h}`, `H 0`, `V ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, "Z"].join(" ");
}

function SheetCard({ v, forceOn }: { v: (typeof VARIANTS)[number]; forceOn: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [[w, h], setSize] = useState([360, 300]);
  const [touch, setTouch] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const fit = () => setSize([el.offsetWidth, el.offsetHeight]); const ro = new ResizeObserver(fit); ro.observe(el); fit(); return () => ro.disconnect(); }, []);
  const on = touch || forceOn;
  const handleTop = v.k === "now" ? 10 : v.cy - v.hh / 2;
  return (
    <div ref={ref} className="absolute inset-x-0 bottom-0 z-20 px-6 pb-8 text-white" style={{ paddingTop: v.k === "now" ? 34 : 30 + Math.max(0, v.cy) }}>
      <svg width={w} height={h} className="pointer-events-none absolute inset-0 -z-10 overflow-visible" style={{ filter: "drop-shadow(0 -20px 40px rgb(0 0 0 / .55))" }} aria-hidden>
        <defs><linearGradient id={`sh-${v.k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".14" /><stop offset=".12" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <path d={sheetPath(w, h, v)} fill="var(--color-card)" />
        <path d={sheetPath(w, h, v)} fill="none" stroke={`url(#sh-${v.k})`} strokeWidth="1" />
      </svg>
      {/* the touch zone: the top 44px of the sheet, across its width */}
      <div className="absolute inset-x-0 top-0 h-11 cursor-grab touch-none" onPointerDown={() => setTouch(true)} onPointerUp={() => setTouch(false)} onPointerCancel={() => setTouch(false)}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setTouch(true); }} onPointerLeave={() => setTouch(false)} />
      <span className={cx("sheet-handle pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full", on && "is-on")} style={{ top: handleTop, width: v.hw, height: v.hh }} />
      <SheetHead title="Add 20 more measurements?">Your base measurements are saved. The other 20 give the closest fit, and you can stop at any time.</SheetHead>
      <Pill className="mt-6" variant="white">Yes, add 20 more</Pill>
      <TextButton className="mt-1">Later</TextButton>
    </div>
  );
}

function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate h-[700px] w-[393px] shrink-0 overflow-hidden rounded-[48px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        <div className="dotgrid" />
        <div className="px-6 pt-16 text-white"><div className="h-serif !text-[30px]">Me, Spring 26</div><div className="mt-2 text-[15px] text-white/55">4 of 24 measurements</div>
          <div className="mt-6 grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="card-soft h-24 rounded-[22px]" />)}</div></div>
        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[2px]" />
        {children}
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

const CSS = `
@layer components {
/* the handle: quiet at rest; pressed (or pointed at), the periwinkle of home's card icons, with their rim and a glow */
.sheet-handle { background: rgb(255 255 255 / .28); transition: background-color .25s, box-shadow .25s; }
.sheet-handle.is-on { background: linear-gradient(180deg, #7387f6, #687ef5 55%, #6479f2);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .35), inset 0 0 0 .5px rgb(255 255 255 / .18), 0 0 10px 1px rgb(104 126 245 / .7), 0 2px 8px -1px rgb(104 126 245 / .8); }
}`;

export function SheetLab() {
  const [k, setK] = useState<V>("notch");
  const [forceOn, setForceOn] = useState(false);
  const v = VARIANTS.find((x) => x.k === k)!;
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="h1 !text-[34px]">Pop-up top</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">The top of every pop-up: the drag handle sits in a cut in the sheet&apos;s top edge, with the app&apos;s 5px channel all round it. Press near the handle (or point at it with a mouse) and it turns periwinkle, like home&apos;s card icons.</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">{VARIANTS.map((x) => (
        <button key={x.k} onClick={() => setK(x.k)} aria-pressed={k === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", k === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
      ))}
        <button onClick={() => setForceOn(!forceOn)} aria-pressed={forceOn} className={cx("ml-2 flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-medium", forceOn ? "bg-white text-bg" : "border border-white/15 text-white/75")}><Icon name="check" size={16} />Show it pressed</button>
      </div>
      <p className="mt-4 max-w-[760px] text-[16px] leading-snug text-white/65">{v.note}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <Phone label={v.name}><SheetCard key={k} v={v} forceOn={forceOn} /></Phone>
        <Phone label="Pressed"><SheetCard key={k + "on"} v={v} forceOn /></Phone>
      </div>
    </section>
  );
}
