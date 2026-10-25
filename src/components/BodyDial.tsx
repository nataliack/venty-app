"use client";
// Body ready's dial (from the lab, 25 Oct 2026): how many of the 24 measurements a body has, as a dial. A channel pressed
// into the paper with a raised cornflower fill, a fine scale round it (a mark for each of the 24, a longer one every
// six), "18 of 24 / measurements added" in its middle. While measurements are still to add it opens at the bottom like
// a gauge and Complete measurements sits in the opening; with all 24 it closes into a full circle.
// BodyDialArea sizes the dial to the room it is given (the space between the text and the buttons on a phone) and
// centres it there, so a tall phone gets a bigger dial in the middle, not a gap under it, and a short one a smaller one.
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { cx } from "@/components/ui";

// raised off the paper: a light top edge, a soft shadow under
const RAISED: CSSProperties = { background: "linear-gradient(180deg, #ffffff, #f7f6f2)", boxShadow: "inset 0 1px 0 #fff, 0 0 0 1px rgb(18 19 28 / .05), 0 1px 2px rgb(18 19 28 / .12), 0 8px 18px -10px rgb(18 19 28 / .32)" };

export function BodyDial({ count, size = 188 }: { count: number; size?: number }) {
  const id = useId().replace(/:/g, "");
  const all = count >= 24;
  const c0 = size / 2;
  const W = 16; // the channel's width
  const r = size / 2 - W / 2 - 12; // room outside it for the scale
  // degrees, 0 = right, clockwise (screen): open at the bottom while measurements are still to add, a full circle with all 24
  const sweep = all ? 360 : 360 * 0.72, start = all ? -90 : 90 + (360 - sweep) / 2;
  // points to two decimals, so every drawing of the same dial is the same
  const q = (v: number) => Math.round(v * 100) / 100;
  const pt = (deg: number, rr = r) => [q(c0 + rr * Math.cos((deg * Math.PI) / 180)), q(c0 + rr * Math.sin((deg * Math.PI) / 180))];
  // an arc from a0 to a1 (a whole circle as two halves, since one arc cannot end where it starts)
  const path = (a0: number, a1: number, rr = r) => {
    const [x0, y0] = pt(a0, rr), [x1, y1] = pt(a1, rr);
    if (a1 - a0 >= 359.9) { const [xm, ym] = pt(a0 + 180, rr); return `M${x0} ${y0}A${rr} ${rr} 0 1 1 ${xm} ${ym}A${rr} ${rr} 0 1 1 ${x0} ${y0}`; }
    return `M${x0} ${y0}A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const end = start + sweep * Math.min(1, count / 24);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 overflow-visible" aria-hidden>
        <defs>
          {/* the channel pressed into the paper: a shadow along its upper inside edge */}
          <filter id={`in${id}`} filterUnits="userSpaceOnUse" x={-20} y={-20} width={size + 40} height={size + 40}>
            <feOffset in="SourceAlpha" dy="2" result="o" /><feGaussianBlur in="o" stdDeviation="1.6" result="b" />
            <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="edge" />
            <feFlood floodColor="#12131c" floodOpacity="0.32" /><feComposite in2="edge" operator="in" result="sh" />
            <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="sh" /></feMerge>
          </filter>
          {/* the fill raised out of it: lighter at the top, a short shadow under */}
          <linearGradient id={`fg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8496f8" /><stop offset="1" stopColor="#5f74ef" /></linearGradient>
          <filter id={`up${id}`} filterUnits="userSpaceOnUse" x={-20} y={-20} width={size + 40} height={size + 40}><feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#1c2454" floodOpacity=".35" /></filter>
        </defs>
        {/* the scale: a mark for each of the 24, a longer one every six (a ruler round the dial, not the progress) */}
        {Array.from({ length: all ? 24 : 25 }, (_, i) => {
          const a = start + (sweep * i) / 24, long = i % 6 === 0;
          const [x0, y0] = pt(a, r + W / 2 + 3), [x1, y1] = pt(a, r + W / 2 + (long ? 10 : 6));
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#12131c" strokeOpacity={long ? 0.4 : 0.22} strokeWidth="1.2" strokeLinecap="round" />;
        })}
        <path d={path(start, start + sweep)} fill="none" stroke="#e6e4de" strokeWidth={W} strokeLinecap="round" filter={`url(#in${id})`} />
        {count > 0 && <path d={path(start, Math.max(start + 0.01, end))} fill="none" stroke={`url(#fg${id})`} strokeWidth={W - 6} strokeLinecap="round" filter={`url(#up${id})`} />}
      </svg>
      {/* the words in the middle (a little above it while the button sits in the opening below) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ paddingBottom: all ? 0 : size * 0.15 }}>
        <span className="font-medium leading-none tabular-nums tracking-[-.01em] text-[#12131c]" style={{ fontSize: Math.round(Math.min(24, Math.max(19, size * 0.125))) }}>{all ? "All 24" : `${count} of 24`}</span>
        <span className="mt-1.5 leading-[1.15] text-[#12131c]/60" style={{ fontSize: size < 175 ? 12.5 : 14 }}>measurements<br />added</span>
      </div>
    </div>
  );
}

// the dial with Complete measurements in its opening (while measurements are still to add)
function DialWithButton({ count, size, onComplete }: { count: number; size: number; onComplete: () => void }) {
  const open = count < 24;
  return (
    <div className="relative" style={{ width: size, height: open ? size * 0.9 : size }}>
      <BodyDial count={count} size={size} />
      {open && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <button onClick={onComplete} className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[15px] font-medium text-[#12131c] transition-transform active:scale-[.97]" style={RAISED}>
            <Icon name="ruler" size={17} />Complete measurements
          </button>
        </div>
      )}
    </div>
  );
}

// Sized to the room it is given (fill: it takes the rest of a flex column) and centred in it. The dial sits over the room
// (absolute), so it never counts in the room it is sized from; the room clips the invisible margin its shadow is drawn in.
// Its middle sits 6 px below the room's, to balance the buttons' own 12 px top padding: the gaps above and below match.
// size: a fixed size instead (a computer, where the text and the dial sit in a column of their own)
export function BodyDialArea({ count, onComplete, size: fixed, className }: { count: number; onComplete: () => void; size?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el || fixed) return;
    const ro = new ResizeObserver(([e]) => setRoom(e.contentRect.height));
    ro.observe(el); return () => ro.disconnect();
  }, [fixed]);
  const open = count < 24;
  if (fixed) return <div className={className}><DialWithButton count={count} size={fixed} onComplete={onComplete} /></div>;
  // at least this much space above and below the dial: 28 px with room to spare, easing down to 8 px as the room shrinks
  const air = Math.max(8, Math.min(28, (room - 150) / 3));
  const size = Math.round(Math.max(150, Math.min(210, (room - air * 2 - 2) / (open ? 0.9 : 1))));
  return (
    <div ref={ref} className={cx("relative min-h-[150px] flex-1 overflow-hidden", className)}>
      {room > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: "calc(50% + 6px)" }}>
          <DialWithButton count={count} size={size} onComplete={onComplete} />
        </div>
      )}
    </div>
  );
}
