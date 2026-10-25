"use client";
// Lab · pattern canvas 7, the snow tray (25 Oct 2026): the snow tray's colours and a taller raised band at the bottom
// that holds the count and who it is drafted to, so the pieces have the whole surface. Grey and white grid lines, so
// they never compete with the pieces' cornflower grainlines. The pieces are paper: solid white (no grid through them),
// a soft slate outline, lying on the surface with a crisp shadow; all at one scale, as big as the tray allows; each
// label placed where it fits inside its piece, beside the grainline (only a piece with no room, a band, has it below).
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { PIECES } from "@/components/art";
import { PIECE_LABEL, type PieceKey } from "@/lib/data";

// the grid: thin squares of CELL px, a thick line every five (an odd number, so centred thick and thin lines meet)
export const CELL = 20;
export const grid = (thin: string, thick: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${thick} 1px, transparent 1px), linear-gradient(90deg, ${thick} 1px, transparent 1px), linear-gradient(${thin} 1px, transparent 1px), linear-gradient(90deg, ${thin} 1px, transparent 1px)`,
  backgroundSize: `${CELL * 5}px ${CELL * 5}px, ${CELL * 5}px ${CELL * 5}px, ${CELL}px ${CELL}px, ${CELL}px ${CELL}px`,
  backgroundPosition: "center",
});

export const SNOW_RIM: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff, #e7eaf3)",
  boxShadow: "0 18px 36px -16px rgb(0 0 0 / .7), 0 2px 4px rgb(0 0 0 / .3), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .2)",
};
export const SNOW_SURFACE: CSSProperties = { backgroundColor: "#eceef4", boxShadow: "inset 0 3px 8px rgb(28 36 84 / .26), inset 0 1px 2px rgb(28 36 84 / .26), inset 0 -1px 0 rgb(255 255 255 / .95)", ...grid("rgb(19 21 35 / .05)", "rgb(19 21 35 / .1)") };
// paper on the mat: a crisp edge shadow and a short, firm cast one (little blur)
const PAPER_SHADOW = "drop-shadow(0 1.5px 0 rgb(28 36 84 / .16)) drop-shadow(0 4px 2.5px rgb(28 36 84 / .2))";
const FLAT = (k: PieceKey) => PIECES[k].h < 100; // bands, facings and collars get a row of their own

// the pieces' layout: the tall ones in rows, the flat ones (bands, facings, collars) in a row after them, all at one
// scale (screen px per pattern unit); every number of columns is tried and the one with the biggest pieces kept
function layout(pieces: PieceKey[], W: number, H: number) {
  const tall = pieces.filter((k) => !FLAT(k)), flat = pieces.filter(FLAT);
  const gx = 10, gy = 14, below = 14; // a flat piece's label may sit under it
  let best = { s: 0, rows: [] as PieceKey[][], gx, gy };
  for (let c = 1; c <= Math.max(1, tall.length); c++) {
    const rows: PieceKey[][] = [];
    for (let i = 0; i < tall.length; i += c) rows.push(tall.slice(i, i + c));
    if (flat.length) rows.push(flat);
    let s = 1.15;
    for (const r of rows) s = Math.min(s, (W - gx * (r.length - 1)) / r.reduce((a, k) => a + PIECES[k].w, 0));
    const fixed = gy * (rows.length - 1) + rows.reduce((a, r) => a + (r.some(FLAT) ? below : 0), 0);
    s = Math.min(s, (H - fixed) / rows.reduce((a, r) => a + Math.max(...r.map((k) => PIECES[k].h)), 0));
    if (s > best.s) best = { s, rows, gx, gy };
  }
  return best;
}

// where a piece's label fits: tried inside the piece (two lines, then one, then smaller), every 2 px, clear of the edge,
// first beside the grainline, then across it (as printed patterns do: the line breaks for the words), as close to the
// middle of the grainline as possible; else under the piece (only a band or a facing has no room)
let measureCtx: CanvasRenderingContext2D | null = null;
type Fit = { x: number; y: number; fs: number; one: boolean; cross?: boolean };
function fitLabel(k: PieceKey, s: number, label: string, cut: string): Fit {
  const p = PIECES[k];
  const [x1, y1, x2, y2] = p.grain;
  const under: Fit = { x: p.w / 2, y: p.h + 12 / s, fs: 9, one: true };
  if (typeof document === "undefined") return under;
  measureCtx = measureCtx ?? document.createElement("canvas").getContext("2d");
  const ctx = measureCtx;
  if (!ctx) return under;
  const family = getComputedStyle(document.body).fontFamily;
  const path = new Path2D(p.d);
  const m = 4 / s, step = 2 / s, gm = 5 / s;
  const gxm = (x1 + x2) / 2, gym = (y1 + y2) / 2;
  const tries = [false, true].flatMap((cross) => [{ fs: 9, one: false, cross }, { fs: 9, one: true, cross }, { fs: 8, one: false, cross }, { fs: 8, one: true, cross }]);
  for (const t of tries) {
    ctx.font = `${t.fs}px ${family}`;
    const wpx = t.one ? ctx.measureText(`${label} · ${cut}`).width : Math.max(ctx.measureText(label).width, (ctx.measureText(cut).width * (t.fs - 1)) / t.fs);
    const hpx = t.one ? t.fs : t.fs * 2 + 2;
    const bw = wpx / s + 2 * m, bh = hpx / s + 2 * m;
    let best: Fit | null = null, bestD = Infinity;
    for (let cy = bh / 2; cy <= p.h - bh / 2; cy += step) for (let cx = bw / 2; cx <= p.w - bw / 2; cx += step) {
      // clear of the grainline
      if (!t.cross && (x1 === x2 ? Math.abs(cx - x1) < bw / 2 + gm && cy + bh / 2 > Math.min(y1, y2) && cy - bh / 2 < Math.max(y1, y2)
        : Math.abs(cy - y1) < bh / 2 + gm && cx + bw / 2 > Math.min(x1, x2) && cx - bw / 2 < Math.max(x1, x2))) continue;
      const d = Math.hypot(cx - gxm, cy - gym);
      if (d >= bestD) continue;
      let ok = true;
      for (let q = 0; q <= 8; q++) for (const fy of [-0.5, 0, 0.5]) { const fx = q / 8 - 0.5; if (ok && !ctx.isPointInPath(path, cx + fx * bw, cy + fy * bh, "evenodd")) ok = false; }
      if (ok) { best = { x: cx, y: cy, fs: t.fs, one: t.one, cross: t.cross }; bestD = d; }
    }
    if (best) return best;
  }
  return under;
}

function PaperPiece({ k, s, label }: { k: PieceKey; s: number; label: string }) {
  const p = PIECES[k];
  const [x1, y1, x2, y2] = p.grain;
  const u = 1 / s; // pattern units per screen px
  const cut = p.fold ? "Cut 1 on fold" : "Cut 2";
  const f = useMemo(() => fitLabel(k, s, label, cut), [k, s, label, cut]);
  const arrow = x1 === x2 ? `M${x1 - 3.5 * u} ${y1 + 6 * u}L${x1} ${y1}L${x1 + 3.5 * u} ${y1 + 6 * u}M${x2 - 3.5 * u} ${y2 - 6 * u}L${x2} ${y2}L${x2 + 3.5 * u} ${y2 - 6 * u}` : `M${x1 + 6 * u} ${y1 - 3.5 * u}L${x1} ${y1}L${x1 + 6 * u} ${y1 + 3.5 * u}M${x2 - 6 * u} ${y2 - 3.5 * u}L${x2} ${y2}L${x2 - 6 * u} ${y2 + 3.5 * u}`;
  const top = f.y - ((f.one ? f.fs : f.fs * 2 + 2) * u) / 2;
  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} width={p.w * s} aria-hidden style={{ overflow: "visible", filter: PAPER_SHADOW }}>
      <path d={p.d} fill="#fff" fillRule="evenodd" stroke="#6b7590" strokeWidth={1.3 * u} strokeLinejoin="round" />
      <path d={`M${x1} ${y1}L${x2} ${y2}${arrow}`} fill="none" stroke="#687ef5" strokeWidth={1.4 * u} strokeLinecap="round" strokeLinejoin="round" />
      {/* across the grainline, the words sit on a halo of paper, so the line stops short of them */}
      <text x={f.x} textAnchor="middle" fontSize={f.fs * u} fill="#3c4b63" {...(f.cross ? { stroke: "#fff", strokeWidth: 4 * u, paintOrder: "stroke", strokeLinejoin: "round" as const } : {})}>
        {f.one ? <tspan x={f.x} y={top + f.fs * 0.8 * u}>{label}<tspan fill="#7a849c"> · {cut}</tspan></tspan> : <>
          <tspan x={f.x} y={top + f.fs * 0.8 * u}>{label}</tspan>
          <tspan x={f.x} y={top + (f.fs * 1.8 + 2) * u} fontSize={(f.fs - 1) * u} fill="#7a849c">{cut}</tspan>
        </>}
      </text>
    </svg>
  );
}

export function SnowTray({ rim, pieces, name }: { rim: number; pieces: PieceKey[]; name: string }) {
  const R = 30, band = 40, pad = 10;
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const L = box ? layout(pieces, box.w - pad * 2, box.h - pad * 2) : null;
  const order = new Map(pieces.map((k, i) => [k, i]));
  return (
    <div className="relative h-full" style={{ ...SNOW_RIM, borderRadius: R }}>
      <div ref={ref} className="absolute overflow-hidden" style={{ ...SNOW_SURFACE, top: rim, left: rim, right: rim, bottom: band, borderRadius: R - rim * 0.6 }}>
        {L && (
          <div className="flex h-full flex-col items-center justify-center" style={{ gap: L.gy, padding: pad }}>
            {L.rows.map((r) => (
              <div key={r.join()} className="flex items-start justify-center" style={{ gap: L.gx }}>
                {r.map((k) => {
                  const n = order.get(k) ?? 0;
                  return (
                    <motion.div key={`${name}-${k}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, rotate: (n % 3 - 1) * 2 }} transition={{ delay: 0.06 * n, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
                      <PaperPiece k={k} s={L.s} label={PIECE_LABEL[k]} />
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* the bottom band: the count and who it is drafted to, centred in it */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 text-[13px] text-[#3c4b63]" style={{ height: band }}>
        <span>{pieces.length} pieces</span><span>Drafted to Me</span>
      </div>
    </div>
  );
}
