"use client";
// The end: the pattern is printed, now the sewing starts. A moment, so it is on paper (from the lab, /lab/mc3 round 3).
// At the top, what has happened, pressed into the paper with its tick on a raised knob (Body ready's build). Then three
// slides to drag, each on a surface pressed into the paper: the sheets flying into place and taped together (A4), or the
// one A0 sheet; a moment after, the fabric to buy, said plainly; and help while you sew (the only raised things, as they
// are the only buttons). Under them the pager from Add to home screen; then the title, View pattern map and Back to home.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useApp } from "@/lib/store";
import { FLUTTER, fabricAdvice, metresAt, notionsFor, templateBy, type PieceKey } from "@/lib/data";
import { NextButton, TextButton, cx, useToast } from "@/components/ui";
import { PIECES } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";
import { piecesFor } from "./pattern";
import { COLS, ROWS, SHEET_H, SHEET_W, W_MM, H_MM, pack, pieceW, type At } from "./print";

const SLIDE_H = 392, GAP = 12, AFTER = 2600, RATIO = SHEET_H / SHEET_W;
// the pager: segments 34 wide; the knob is a segment less the 5px channel each side, the track its height plus 5 each side
const SEG = 34, CH = 5, KH = 12;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const INK = "18 19 28";
// pressed into the paper (a slide's floor), and raised off it (white, lit from the top: buttons only)
const PRESSED = "bg-[#12131c]/[.045] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85)]";
const raised = "bg-white shadow-[0_6px_14px_-8px_rgb(18_19_28/.32),0_1px_2px_rgb(18_19_28/.08),inset_0_-1px_0_rgb(18_19_28/.06)]";
const SURFACE = cx("relative flex h-full flex-col overflow-hidden rounded-[26px] px-[18px] pb-[18px] pt-5 text-[#12131c]", PRESSED);
const STRETCH = { "A lot": "stretchy", "A bit": "with a little stretch", No: "with no stretch" } as const;

// ─── the pattern, the sheets it prints on, and what to buy, from the store's draft ───
function useMade() {
  const { draft } = useApp();
  const pieces = piecesFor(draft.garment, draft.details);
  const pos: At = (draft.layout?.garment === draft.garment ? draft.layout.at : undefined) ?? pack(pieces);
  // the sheets a piece lands on, from each piece's box (turned pieces swap their sides), as the layout counts them: a
  // piece has to reach a few mm into a sheet to need it
  const sheets = useMemo(() => {
    const on = new Set<string>(), t = 3;
    pieces.forEach((k) => {
      const p = PIECES[k], at = pos[k] ?? { x: 50, y: 50, r: 0 };
      let w = (pieceW(k) / 100) * W_MM, h = w * (p.h / p.w);
      if (Math.round(at.r / 90) % 2) [w, h] = [h, w];
      const x = (at.x / 100) * W_MM, y = (at.y / 100) * H_MM;
      for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++)
        if (x + w / 2 > c * SHEET_W + t && x - w / 2 < (c + 1) * SHEET_W - t && y + h / 2 > r * SHEET_H + t && y - h / 2 < (r + 1) * SHEET_H - t) on.add(`${r}-${c}`);
    });
    return [...on].map((s) => s.split("-").map(Number) as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }, [pieces, pos]);
  return {
    pieces, pos, sheets,
    a4: draft.printer !== "A0",
    kind: draft.garment === "flutter" ? "dress" : ({ Dresses: "dress", Tops: "top", Pants: "trousers", Skirts: "skirt" } as const)[templateBy(draft.garment).category],
    metres: (w: number) => metresAt(draft.garment, draft.ease, w),
    stretch: STRETCH[draft.chosen?.stretch ? draft.stretch : fabricAdvice(draft.ease).stretch],
    extras: notionsFor(draft.details ?? FLUTTER.read, pieces),
  };
}
type Made = ReturnType<typeof useMade>;

// the whole layout as printed (ink lines on white, the grainline in indigo), one A4 sheet `cell` wide
function LayoutInk({ pieces, pos, cell }: { pieces: PieceKey[]; pos: At; cell: number }) {
  return (
    <div className="absolute left-0 top-0" style={{ width: cell * COLS, height: cell * RATIO * ROWS }}>
      {pieces.map((k) => {
        const p = PIECES[k], [x1, y1, x2, y2] = p.grain, at = pos[k] ?? { x: 50, y: 50, r: 0 };
        return (
          <div key={k} className="absolute" style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${pieceW(k)}%`, translate: "-50% -50%", rotate: `${at.r}deg` }}>
            <svg viewBox={`0 0 ${p.w} ${p.h}`} className="block h-auto w-full overflow-visible" aria-hidden>
              <path d={p.d} fill="none" stroke="#3c4b63" strokeWidth={Math.max(1.2, 1.6 * (60 / cell))} strokeLinejoin="round" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4f63e0" strokeWidth={Math.max(1, 1.3 * (60 / cell))} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
// one printed sheet: white paper, the part of the pattern printed on it (from row r, column c; the A0 sheet is the whole
// layout), the corner marks used to line sheets up
function Sheet({ rc, cell, w, h, m, style }: { rc: [number, number]; cell: number; w: number; h: number; m: Made; style?: CSSProperties }) {
  const [r, c] = rc;
  return (
    <div className="relative overflow-hidden bg-white shadow-[0_6px_14px_-8px_rgb(18_19_28/.35),0_0_0_1px_rgb(18_19_28/.06)]" style={{ width: w, height: h, ...style }}>
      <div className="absolute" style={{ left: -c * cell, top: -r * cell * RATIO }}><LayoutInk pieces={m.pieces} pos={m.pos} cell={cell} /></div>
      {[[3, 3], [w - 9, 3], [3, h - 9], [w - 9, h - 9]].map(([x, y], i) => <span key={i} className="absolute h-1.5 w-1.5 border-[#12131c]/25" style={{ left: x, top: y, borderLeftWidth: i % 2 ? 0 : 1, borderRightWidth: i % 2 ? 1 : 0, borderTopWidth: i < 2 ? 1 : 0, borderBottomWidth: i < 2 ? 0 : 1 }} />)}
    </div>
  );
}

// what has happened, pressed into the paper, its tick on a raised knob
function Done({ children }: { children: string }) {
  return (
    <span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75"
      style={{ background: `rgb(${INK} / .045)`, boxShadow: `inset 0 2px 5px rgb(${INK} / .16), inset 0 1px 1.5px rgb(${INK} / .18), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9)` }}>
      <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-white" style={{ background: "linear-gradient(180deg, #2e3040, #1a1c28)", boxShadow: "0 2px 4px rgb(0 0 0 / .28), 0 1px 1px rgb(0 0 0 / .3), inset 0 1px 0 rgb(255 255 255 / .22)" }}><Icon name="check" size={12} strokeWidth={3} /></span>
      {children}
    </span>
  );
}

// ─── slide 1 (A4): the sheets fly into place on a table pressed into the paper, one after another in the order to tape
// them, each on a solid numbered badge; then the tape goes on along the joins and the numbers go. Show me again replays it ───
function TapeTable({ m, run, taped, onAgain }: { m: Made; run: number; taped: boolean; onAgain: () => void }) {
  const still = useReducedMotion();
  const rows = m.sheets.map(([r]) => r), cols = m.sheets.map(([, c]) => c);
  const r0 = Math.min(...rows), c0 = Math.min(...cols), nr = Math.max(...rows) - r0 + 1, nc = Math.max(...cols) - c0 + 1;
  const W = 305, H = SLIDE_H - 84;
  const cell = Math.floor(Math.min(W / nc, H / (nr * RATIO)));
  const gw = cell * nc, gh = cell * RATIO * nr;
  const at = (r: number, c: number) => ({ x: (c - c0) * cell - gw / 2, y: (r - r0) * cell * RATIO - gh / 2 });
  const on = new Set(m.sheets.map((s) => s.join("-")));
  // the joins between two printed sheets side by side or one above the other: one strip of tape on each
  const joins: { x: number; y: number; v: boolean }[] = [];
  m.sheets.forEach(([r, c]) => {
    const p = at(r, c);
    if (on.has(`${r}-${c + 1}`)) joins.push({ x: p.x + cell, y: p.y + (cell * RATIO) / 2, v: true });
    if (on.has(`${r + 1}-${c}`)) joins.push({ x: p.x + cell / 2, y: p.y + cell * RATIO, v: false });
  });
  return (
    <div className={cx("relative h-full overflow-hidden rounded-[26px]", PRESSED)}>
      <div key={run} className="absolute left-1/2" style={{ top: 18 + H / 2 }}>
        {m.sheets.map(([r, c], i) => {
          const p = at(r, c);
          return (
            <motion.div key={`${r}-${c}`} className="absolute" style={{ left: p.x, top: p.y, zIndex: 10 + i }}
              initial={still ? false : { x: -p.x - cell / 2 + (i % 2 ? 8 : -8), y: gh / 2 + 60 - p.y, rotate: i % 2 ? 6 : -5, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.28, type: "spring", stiffness: 150, damping: 20 }}>
              <Sheet rc={[r, c]} cell={cell} w={cell} h={cell * RATIO} m={m} />
              {/* the order to tape them, on a solid badge (nothing shows through it) */}
              <motion.span className="absolute left-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-[6px] bg-[#e9e7e2] px-1 text-[11px] font-medium tabular-nums text-[#12131c]/75 shadow-[inset_0_1px_2px_rgb(18_19_28/.18),0_1px_0_rgb(255_255_255/.9)]"
                animate={{ opacity: taped ? 0 : 1 }} transition={{ duration: 0.4 }} aria-hidden>{i + 1}</motion.span>
            </motion.div>
          );
        })}
        {joins.map((j, i) => (
          <motion.span key={i} className="absolute z-50 rounded-[2px] bg-white/70 shadow-[0_1px_2px_rgb(18_19_28/.18)] backdrop-blur-[1px]"
            style={{ left: j.x, top: j.y, width: j.v ? 10 : 30, height: j.v ? 30 : 10, translate: "-50% -50%", rotate: `${(i % 3) - 1}deg` }}
            initial={false} animate={{ opacity: taped ? 1 : 0, scale: taped ? 1 : 0.6 }} transition={{ delay: taped ? i * 0.05 : 0, duration: 0.3 }} />
        ))}
      </div>
      {/* Show me again, inside the slide, under the sheets */}
      <button onClick={onAgain} className={cx("absolute bottom-3.5 left-1/2 z-[60] flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-[#12131c]/70", raised)}>
        <Icon name="refresh" size={14} />Show me again
      </button>
    </div>
  );
}

// ─── slide 1 (A0): the one sheet, the whole pattern on it, laid down on the table. Nothing to tape ───
function OneSheet({ m }: { m: Made }) {
  const still = useReducedMotion();
  const h = SLIDE_H - 56, w = Math.round(h * (W_MM / H_MM));
  return (
    <div className={cx("relative grid h-full place-items-center overflow-hidden rounded-[26px]", PRESSED)}>
      <motion.div initial={still ? false : { y: 70, rotate: -4, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}>
        <Sheet rc={[0, 0]} cell={w / COLS} w={w} h={h} m={m} />
      </motion.div>
    </div>
  );
}

// ─── slide 2: what to buy, said plainly for anyone, centred. "Fabric to buy", the metres large, and a sentence saying
// what fabric to ask for; the switch says which question it answers (the shop's fabric may be another width), and the
// metres follow it; then "Also buy" and the extras as a plain list. Nothing here is raised but the switch's knob ───
function Fabric({ m }: { m: Made }) {
  const widths = [115, 140, 150];
  const [w, setW] = useState(140); // the usual width, which the metres are worked out on
  const still = useReducedMotion();
  const at = widths.indexOf(w), seg = 72, n = m.metres(w);
  return (
    <div className={SURFACE}>
      <h3 className="text-center text-[17px] font-medium">Fabric to buy</h3>
      <div className="mt-2 flex items-baseline justify-center gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={w} className="serif text-[52px] leading-[.9]" initial={still ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }}>{n}</motion.span>
        </AnimatePresence>
        <span className="text-[18px]">{n === 1 ? "metre" : "metres"}</span>
      </div>
      <p className="mt-1.5 text-center text-[15px] leading-snug text-[#12131c]/70">of fabric {w} cm wide, {m.stretch}.</p>
      <p className="mt-4 text-center text-[14px] text-[#12131c]/55">Is the fabric at the shop another width?</p>
      {/* the fabric's width: a track pressed in, the knob raised, sliding to the width chosen */}
      <div className="relative mt-2 flex h-11 self-center rounded-full bg-[#12131c]/[.07] p-[5px] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85)]" role="radiogroup" aria-label="The fabric's width">
        <motion.span className={cx("absolute top-[5px] h-[34px] rounded-full", raised)} style={{ width: seg }} initial={false} animate={{ left: 5 + at * seg }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }} aria-hidden />
        {widths.map((x) => (
          <button key={x} role="radio" aria-checked={w === x} onClick={() => setW(x)} className={cx("relative z-10 h-[34px] text-[15px] transition-colors", w === x ? "font-medium text-[#12131c]" : "text-[#12131c]/50")} style={{ width: seg }}>{x} cm</button>
        ))}
      </div>
      <div className="mt-4 border-t border-[#12131c]/10 pt-3">
        <h3 className="text-center text-[16px] font-medium">Also buy</h3>
        <ul className="mx-auto mt-1.5 w-fit space-y-1.5">{m.extras.map((t) => (
          <li key={t} className="flex gap-2.5 text-[15px] leading-snug"><span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#12131c]/45" />{t}</li>
        ))}</ul>
      </div>
    </div>
  );
}

// ─── slide 3: help while you sew. The only raised things on the slides, as they are the only buttons: each a full row
// saying where it takes you ───
function Help({ m, taping, open }: { m: Made; taping: boolean; open: (t: string) => void }) {
  const rows: [IconName, string, string][] = [
    taping ? ["video", "Video: taping the sheets", "Watch how, before you start"] : ["video", "Video: cutting out the pieces", "Watch how, before you start"],
    ["book", `Sewing guide for this ${m.kind}`, "Every step, from cutting to the hem"],
    ["layers", "Sewing words, explained", "Grainline, notches, darts and more"],
  ];
  return (
    <div className={SURFACE}>
      <h3 className="text-center text-[17px] font-medium">Help while you sew</h3>
      <p className="mt-1 text-center text-[15px] leading-snug text-[#12131c]/60">Open any of these when you need it.</p>
      <div className="mt-4 flex flex-col gap-2.5">{rows.map(([ic, t, d]) => (
        <button key={t} onClick={() => open(t)} className={cx("tap flex items-center gap-3 rounded-[18px] p-3 text-left", raised)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#12131c]/[.06] text-[#3c4b63] shadow-[inset_0_1px_2px_rgb(18_19_28/.14)]" aria-hidden><Icon name={ic} size={19} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[16px] leading-tight">{t}</span><span className="mt-0.5 block text-[14px] leading-snug text-[#12131c]/55">{d}</span></span>
          <Icon name="chevR" size={18} className="shrink-0 text-[#12131c]/35" />
        </button>
      ))}</div>
    </div>
  );
}

export function Printed({ p }: { p?: Record<string, unknown> }) {
  const { home, go } = useApp();
  const { toast, node } = useToast();
  const m = useMade();
  const still = useReducedMotion();
  // what was printed (the review's count), or the sheets the layout prints on; A0 is one sheet from the print shop
  const n = m.a4 ? Number(p?.n) || m.sheets.length : 1;
  const taping = m.a4 && m.sheets.length > 1;
  const slides = [m.a4 ? "Tape it together" : "Your sheet", "Fabric to buy", "Help while you sew"];
  const ref = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0); // where the carousel is, in slides
  const [run, setRun] = useState(0);
  const [taped, setTaped] = useState(false); // every sheet down (and taped)
  const touched = useRef(false), self = useRef(false);
  const step = () => (ref.current ? ref.current.clientWidth - 48 + GAP : 1); // a slide and the gap after it
  const slideTo = (i: number) => { self.current = true; setTimeout(() => { self.current = false; }, 900); ref.current?.scrollTo({ left: i * step(), behavior: still ? "auto" : "smooth" }); };
  // the tape goes on once every sheet is down; a moment later the carousel moves on to the fabric, unless it was touched
  // (and never by itself with reduced motion)
  const total = m.a4 ? 0.2 + m.sheets.length * 0.28 + 0.4 : 0.8;
  useEffect(() => {
    const t = setTimeout(() => setTaped(true), still ? 0 : total * 1000);
    return () => clearTimeout(t);
  }, [run, still, total]);
  useEffect(() => {
    if (!taped || touched.current || still) return;
    const t = setTimeout(() => { if (!touched.current) slideTo(1); }, AFTER);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taped]);
  const again = () => { touched.current = true; setTaped(false); setRun((x) => x + 1); };
  const fc = Math.min(slides.length - 1, Math.max(0, f)), i = Math.floor(fc), t = fc - i;
  const front = i + ease(clamp(t * 2)), back = i + ease(clamp(t * 2 - 1));
  return (
    <div className="paper absolute inset-0 flex flex-col items-center lg:justify-center">
      {/* one column: the phone's width, centred on a wider screen (and no taller than a tall phone there) */}
      <div className="flex h-full w-full max-w-[480px] flex-col lg:max-h-[900px]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-6 noscroll" style={{ paddingTop: "var(--top)" }}>
          <div className="mt-2 text-center"><Done>{!m.a4 ? "Sent to the print shop" : n === 1 ? "Your sheet is printed" : `All ${n} sheets are printed`}</Done></div>
          <div className="min-h-3 flex-1" />
          {/* three slides, dragged or moved on by themselves; each the column's width (the row's width less its 24px start
              padding, which the width is measured within, less the end's 24px), the last ending on the page's padding. On
              a computer the column ends inside the page, so the slides fade out at its edges instead of being cut */}
          <div ref={ref} onScroll={(e) => { setF(e.currentTarget.scrollLeft / step()); if (!self.current) touched.current = true; }}
            onPointerDown={() => { touched.current = true; }} onWheel={() => { touched.current = true; }}
            className="-mx-6 flex shrink-0 snap-x snap-mandatory gap-3 overflow-x-auto pl-6 noscroll lg:[mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)]" style={{ scrollPaddingLeft: 24 }}>
            <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}>{m.a4 ? <TapeTable m={m} run={run} taped={taped} onAgain={again} /> : <OneSheet m={m} />}</div>
            <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}><Fabric m={m} /></div>
            <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}><Help m={m} taping={taping} open={(x) => toast("Opening " + x.toLowerCase())} /></div>
            <span className="w-3 shrink-0" aria-hidden />
          </div>
          {/* the pager: a knob in a track pressed into the paper, following the drag */}
          <div className="relative mx-auto mt-3 shrink-0 rounded-full bg-[#12131c]/[.07] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)]"
            style={{ width: SEG * slides.length, height: KH + 2 * CH }} role="tablist" aria-label="Slides">
            <span className="pill-white absolute rounded-full" aria-hidden style={{ background: "#f3f1ec", left: CH + back * SEG, top: CH, width: SEG - 2 * CH + (front - back) * SEG, height: KH }} />
            {slides.map((s, k) => (
              <button key={s} role="tab" aria-selected={Math.round(fc) === k} aria-label={s} onClick={() => { touched.current = true; slideTo(k); }} className="absolute top-0 h-full" style={{ left: k * SEG, width: SEG }} />
            ))}
          </div>
          <div className="min-h-3 flex-1" />
          <div className="text-center">
            <h1 className="h1 !text-[30px] text-[#12131c] [text-wrap:balance] lg:!text-[36px]">Your pattern is complete</h1>
            <p className="lead mx-auto mt-2 max-w-[330px] [text-wrap:pretty]">{m.a4 ? `Now you can start making your ${m.kind}.` : `Collect your sheet, then start making your ${m.kind}.`}</p>
          </div>
          <div className="min-h-2 flex-1" />
        </div>
        <div className="shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}>
          <NextButton ready onClick={() => go("minimap")} label="View pattern map" className="w-full" />
          <TextButton tone="paper" onClick={home}>Back to home</TextButton>
        </div>
      </div>
      {node}
    </div>
  );
}
