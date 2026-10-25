"use client";
// The pattern's pieces laid out on a tray (the result screen's Pattern view; from the lab, 25 Oct 2026): a snow rim,
// raised, round a surface pressed down into it, and a taller raised band along the bottom that holds the count and who
// it is drafted to, so the pieces have the whole surface. Grey and white grid lines (a thick one every five thin
// squares, both centred, so they meet), so they never compete with the pieces' cornflower grainlines. The pieces are
// paper: solid white, a soft slate outline, lying on the surface with a crisp shadow; all at one scale, as big as the
// tray allows; each label placed where it fits inside its piece (only a facing, with no room, has it below).
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { PIECES } from "@/components/art";
import { cx } from "@/components/ui";
import { PIECE_LABEL, type PieceKey } from "@/lib/data";

const CELL = 20;
const grid = (thin: string, thick: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${thick} 1px, transparent 1px), linear-gradient(90deg, ${thick} 1px, transparent 1px), linear-gradient(${thin} 1px, transparent 1px), linear-gradient(90deg, ${thin} 1px, transparent 1px)`,
  backgroundSize: `${CELL * 5}px ${CELL * 5}px, ${CELL * 5}px ${CELL * 5}px, ${CELL}px ${CELL}px, ${CELL}px ${CELL}px`,
  backgroundPosition: "center",
});
// the rim lit from above (a light top edge, a shadow under); the surface darker along its top inside edge, a lip below
const RIM: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff, #e7eaf3)",
  boxShadow: "0 18px 36px -16px rgb(0 0 0 / .7), 0 2px 4px rgb(0 0 0 / .3), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .2)",
};
const SURFACE: CSSProperties = { backgroundColor: "#eceef4", boxShadow: "inset 0 3px 8px rgb(28 36 84 / .26), inset 0 1px 2px rgb(28 36 84 / .26), inset 0 -1px 0 rgb(255 255 255 / .95)", ...grid("rgb(19 21 35 / .05)", "rgb(19 21 35 / .1)") };
// paper on the tray: a crisp edge shadow and a short, firm cast one
const PAPER_SHADOW = "drop-shadow(0 1.5px 0 rgb(28 36 84 / .16)) drop-shadow(0 4px 2.5px rgb(28 36 84 / .2))";
const FLAT = (k: PieceKey) => PIECES[k].h < 100; // bands, facings and collars get a row of their own

// the layout: the tall pieces in rows, the flat ones in a row after them, all at one scale (screen px per pattern
// unit); every number of columns is tried and the one with the biggest pieces kept
function layout(pieces: PieceKey[], W: number, H: number) {
  const tall = pieces.filter((k) => !FLAT(k)), flat = pieces.filter(FLAT);
  const gx = 10, gy = 14, below = 24; // room for a flat piece's label under it
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

// where a label fits: tried inside the piece (two lines, then one, then smaller, down to the name alone), every 2 px,
// clear of the edge and of any dart, first beside the grainline, then across it (as printed patterns do: the line
// breaks for the words), as close to the middle of the grainline as possible. Only a flat piece (a band, a facing, a
// collar: the layout leaves room under it) puts its label under itself; a tall one always keeps it inside
let measureCtx: CanvasRenderingContext2D | null = null;
type Fit = { x: number; y: number; fs: number; one: boolean; cross?: boolean; short?: boolean };
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
  const step = 2 / s, gm = 5 / s;
  const gxm = (x1 + x2) / 2, gym = (y1 + y2) / 2;
  // the nearest place to the middle of the grainline where the label's box fits, checked every 1.5 px across and down
  // it (so even a dart's narrow tip is found); beside the grainline, or across it
  const search = (t: { fs: number; one: boolean; short?: boolean }, cross: boolean): (Fit & { d: number }) | null => {
    ctx.font = `${t.fs}px ${family}`;
    const m = (t.fs >= 8 ? 4 : 3) / s;
    const wpx = t.short ? ctx.measureText(label).width : t.one ? ctx.measureText(`${label} · ${cut}`).width : Math.max(ctx.measureText(label).width, (ctx.measureText(cut).width * (t.fs - 1)) / t.fs);
    const hpx = t.one ? t.fs : t.fs * 2 + 2;
    const bw = wpx / s + 2 * m, bh = hpx / s + 2 * m;
    const cands: [number, number, number][] = [];
    for (let cy = bh / 2; cy <= p.h - bh / 2; cy += step) for (let cx = bw / 2; cx <= p.w - bw / 2; cx += step) {
      if (!cross && (x1 === x2 ? Math.abs(cx - x1) < bw / 2 + gm && cy + bh / 2 > Math.min(y1, y2) && cy - bh / 2 < Math.max(y1, y2)
        : Math.abs(cy - y1) < bh / 2 + gm && cx + bw / 2 > Math.min(x1, x2) && cx - bw / 2 < Math.max(x1, x2))) continue;
      cands.push([Math.hypot(cx - gxm, cy - gym), cx, cy]);
    }
    cands.sort((a, b) => a[0] - b[0]);
    const nx = Math.max(4, Math.ceil((bw * s) / 1.5)), ny = Math.max(3, Math.ceil((bh * s) / 1.5));
    for (const [d, cx, cy] of cands) {
      let ok = true;
      for (let a = 0; a <= nx && ok; a++) for (let c = 0; c <= ny && ok; c++) if (!ctx.isPointInPath(path, cx - bw / 2 + (bw * a) / nx, cy - bh / 2 + (bh * c) / ny, "evenodd")) ok = false;
      if (ok) return { x: cx, y: cy, fs: t.fs, one: t.one, cross, short: t.short, d };
    }
    return null;
  };
  // biggest first: two lines, then one, then smaller, down to the name alone. Beside the grainline when that is near its
  // middle; across it (centred) when beside would push the label off to a corner
  const sizes = [{ fs: 9, one: false }, { fs: 9, one: true }, { fs: 8, one: false }, { fs: 8, one: true }, { fs: 7, one: false }, { fs: 7, one: true }, { fs: 7, one: true, short: true }];
  for (const t of sizes) {
    const beside = t.fs >= 8 ? search(t, false) : null;
    if (beside && beside.d <= Math.hypot(x2 - x1, y2 - y1) * 0.3) return beside;
    const across = search(t, true);
    if (across) return across;
    if (beside) return beside;
  }
  return FLAT(k) ? under : { x: gxm, y: gym, fs: 7, one: true, cross: true, short: true };
}

function PaperPiece({ k, s, fonts }: { k: PieceKey; s: number; fonts: number }) {
  const p = PIECES[k];
  const [x1, y1, x2, y2] = p.grain;
  const u = 1 / s; // pattern units per screen px
  const label = PIECE_LABEL[k];
  const cut = p.fold ? "Cut 1 on fold" : "Cut 2";
  // measured again once the font has loaded (fonts)
  const f = useMemo(() => fitLabel(k, s, label, cut), [k, s, label, cut, fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  const arrow = x1 === x2 ? `M${x1 - 3.5 * u} ${y1 + 6 * u}L${x1} ${y1}L${x1 + 3.5 * u} ${y1 + 6 * u}M${x2 - 3.5 * u} ${y2 - 6 * u}L${x2} ${y2}L${x2 + 3.5 * u} ${y2 - 6 * u}` : `M${x1 + 6 * u} ${y1 - 3.5 * u}L${x1} ${y1}L${x1 + 6 * u} ${y1 + 3.5 * u}M${x2 - 6 * u} ${y2 - 3.5 * u}L${x2} ${y2}L${x2 - 6 * u} ${y2 + 3.5 * u}`;
  const top = f.y - ((f.one ? f.fs : f.fs * 2 + 2) * u) / 2;
  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} width={p.w * s} aria-hidden style={{ overflow: "visible", filter: PAPER_SHADOW }}>
      <path d={p.d} fill="#fff" fillRule="evenodd" stroke="#6b7590" strokeWidth={1.3 * u} strokeLinejoin="round" />
      <path d={`M${x1} ${y1}L${x2} ${y2}${arrow}`} fill="none" stroke="#687ef5" strokeWidth={1.4 * u} strokeLinecap="round" strokeLinejoin="round" />
      {/* across the grainline, the words sit on a halo of paper, so the line stops short of them */}
      <text x={f.x} textAnchor="middle" fontSize={f.fs * u} fill="#3c4b63" {...(f.cross ? { stroke: "#fff", strokeWidth: 4 * u, paintOrder: "stroke", strokeLinejoin: "round" as const } : {})}>
        {f.one ? <tspan x={f.x} y={top + f.fs * 0.8 * u}>{label}{!f.short && <tspan fill="#7a849c"> · {cut}</tspan>}</tspan> : <>
          <tspan x={f.x} y={top + f.fs * 0.8 * u}>{label}</tspan>
          <tspan x={f.x} y={top + (f.fs * 1.8 + 2) * u} fontSize={(f.fs - 1) * u} fill="#7a849c">{cut}</tspan>
        </>}
      </text>
    </svg>
  );
}

export function PatternTray({ pieces, who, className, rim = 8, radius = 30 }: { pieces: PieceKey[]; who: string; className?: string; rim?: number; radius?: number }) {
  const band = 40, pad = 10;
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [fonts, setFonts] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    document.fonts?.ready.then(() => setFonts((n) => n + 1));
    return () => ro.disconnect();
  }, []);
  const L = box ? layout(pieces, box.w - pad * 2, box.h - pad * 2) : null;
  const order = new Map(pieces.map((k, i) => [k, i]));
  return (
    <div className={cx("relative", className)} style={{ ...RIM, borderRadius: radius }}>
      <div ref={ref} className="absolute overflow-hidden" style={{ ...SURFACE, top: rim, left: rim, right: rim, bottom: band, borderRadius: radius - rim * 0.6 }}>
        {L && (
          <div className="flex h-full flex-col items-center justify-center" style={{ gap: L.gy, padding: pad }}>
            {L.rows.map((r) => (
              <div key={r.join()} className="flex items-start justify-center" style={{ gap: L.gx }}>
                {r.map((k) => {
                  const n = order.get(k) ?? 0;
                  return (
                    <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, rotate: (n % 3 - 1) * 2 }} transition={{ delay: 0.06 * n, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
                      <PaperPiece k={k} s={L.s} fonts={fonts} />
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* the band: the count and who it is drafted to, centred in it */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 text-[13px] text-[#3c4b63]" style={{ height: band }}>
        <span className="shrink-0">{pieces.length} {pieces.length === 1 ? "piece" : "pieces"}</span><span className="min-w-0 truncate">Drafted to {who}</span>
      </div>
    </div>
  );
}
