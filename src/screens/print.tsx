"use client";
import { haptic } from "@/lib/haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { PIECE_LABEL, FLUTTER, nameFor, templateBy, fabricAdvice, fitName, metresFor, metresAt, notionsFor, type GarmentKey, type PieceKey } from "@/lib/data";
import { Screen, TopBar, HS, H1, Lead, Pill, Glass, Option, Arrows, RB, TextButton, PaperScreen, cx, useToast, Split, useDesk } from "@/components/ui";
import { Piece, pieceSize } from "@/components/art";
import { Icon } from "@/components/icons";
import { garmentName, piecesFor } from "./pattern";
import { FlowHeader } from "./measure";

const GRID = { backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "18px 18px" };

// Print flow, in the order it really depends on: paper → seam allowance → layout on the sheets → review and print.
// (What fabric to buy is on the finished page and the pattern's own page, where it is needed: at the shop.)
const PRINT_STEPS = ["Method", "Seams", "Layout", "Review"];
// Closing the flow returns to the garment you were looking at.
const exitPrint = () => {
  const s = useApp.getState(); const ids = s.stack.map((r) => r.id);
  const at = Math.max(ids.lastIndexOf("garment"), ids.lastIndexOf("tplResult"));
  if (at >= 0) useApp.setState({ stack: s.stack.slice(0, at + 1), dir: -1 }); else s.home();
};
function PrintHeader({ step, sub = 0 }: { step: number; sub?: number }) {
  return <FlowHeader steps={PRINT_STEPS.map((label, i) => ({ label, value: i < step ? 1 : i === step ? sub : 0 }))} onClose={exitPrint} />;
}

// 1 · how are you printing it? (the layout depends on the paper, so this comes first)
export function PrintMethod() {
  const { go, draft, setDraft } = useApp();
  const [pick, setPick] = useState<"A4" | "A0" | null>(null);
  const choose = (k: "A4" | "A0") => { setPick(k); if (draft.printer !== k) setDraft({ printer: k, sheets: undefined }); };
  return (
    <Screen header={<PrintHeader step={0} sub={pick ? 0.5 : 0} />} footer={<Arrows ready={pick !== null} onNext={() => go("seam")} />}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">How are you<br />printing it?</HS>
        <Lead className="mt-3">We lay the pattern out on the paper you choose.</Lead>
      </>} right={
        <div className="mt-6 flex flex-col gap-3 lg:mt-0" data-need={pick ? "0" : "1"}>
          {([["A4", "At home, on A4 paper", "Print on your own printer, then tape the sheets together."], ["A0", "At a print shop, on A0 paper", "Large sheets, printed for you. Much less taping."]] as const).map(([k, t, d]) => (
            <Option key={k} on={pick === k} onClick={() => choose(k)} className="flex min-h-[132px] items-center gap-5 rounded-[26px] p-5 pr-14 lg:min-h-[170px] lg:p-7">
              {k === "A4" ? <span className="grid shrink-0 grid-cols-3 gap-1">{Array.from({ length: 9 }, (_, i) => <span key={i} className="h-[22px] w-[16px] rounded-[2px] border border-white/55 bg-white/10" />)}</span>
                : <span className="h-[74px] w-[54px] shrink-0 rounded-[4px] border border-white/55 bg-white/10" />}
              <span><span className="block text-[18px] font-medium">{t}</span><span className="mt-1 block text-[15px] leading-snug text-white/65">{d}</span></span>
            </Option>
          ))}
        </div>} />
    </Screen>
  );
}

// 2 · seam allowance
export function Seam() {
  const { go, draft, setDraft } = useApp();
  const [yes, setYes] = useState<boolean | null>(null); // nothing pre-selected
  const [amt, setAmt] = useState<number | null>(null);
  const [typed, setTyped] = useState<string | null>(null); // what is in the box while typing
  const add = yes === true;
  const ready = yes === false || (yes === true && amt !== null);
  const pickNo = () => { setYes(false); setDraft({ seam: null }); };
  const pickYes = () => { setYes(true); if (amt !== null) setDraft({ seam: amt }); };
  const pickAmt = (v: number) => { setAmt(v); setDraft({ seam: v }); };
  return (
    <Screen header={<PrintHeader step={1} sub={ready ? 0.5 : 0} />} footer={<Arrows ready={ready} onNext={() => go("arrange")} />}>
      <Split left={<>
      <HS className="mt-4 lg:mt-0">Add seam<br />allowance?</HS>
      <Lead className="mt-3">Extra fabric outside the stitching line, so there is room to sew the pieces together. Skip it if you add your own.</Lead>
      </>} right={<>
      <Glass className="relative mt-5 grid h-[min(210px,25dvh)] place-items-center rounded-[26px] lg:mt-0 lg:h-[min(340px,38dvh)]" >
        <div className="absolute inset-0 rounded-[26px]" style={GRID} />
        <Piece k={piecesFor(draft.garment)[0]} width={120} label={PIECE_LABEL[piecesFor(draft.garment)[0]]} allowance={add ? amt ?? 1.5 : false} />
        {add && amt !== null && <span className="absolute right-6 top-6 text-[15px] font-medium text-peri">{amt} cm</span>}
      </Glass>
      <div className="mt-3 flex flex-col gap-2.5" data-need={yes === null ? "1" : "0"}>
        <Option on={yes === false} onClick={pickNo} className="flex h-[60px] items-center gap-4 rounded-[18px] px-4"><span className="w-10 text-[17px] font-medium">No</span><span className="text-[15px] text-white/60">I’ll add my own</span></Option>
        <Option on={add} onClick={pickYes} className="flex h-[60px] items-center gap-4 rounded-[18px] px-4"><span className="w-10 text-[17px] font-medium">Yes</span><span className="text-[15px] text-white/60">Add it to every piece</span></Option>
      </div>
      <AnimatePresence>{add && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          {/* any amount you like: type it, or step it in half centimetres. Empty until you set it */}
          <div className="mt-4 text-[15px] font-medium text-white/80">How much?</div>
          <div data-need={amt === null ? "1" : "0"} className="field mt-2.5 flex items-center gap-2 !rounded-[20px] px-3 py-2.5">
            <RB icon="minus" size={44} className="rb-plain" onClick={() => pickAmt(Math.max(0.5, (amt ?? 1) - 0.5))} label="Less seam allowance" />
            <label className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5">
              <span className="sr-only">Seam allowance in centimetres</span>
              <input inputMode="decimal" placeholder="—" value={typed ?? (amt === null ? "" : String(amt))}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => { const t = e.target.value.replace(",", "."); setTyped(t); const n = parseFloat(t); if (!isNaN(n) && n > 0) pickAmt(Math.min(50, Math.round(n * 10) / 10)); }}
                onBlur={() => setTyped(null)}
                className="serif w-[90px] bg-transparent text-right text-[36px] leading-none outline-none placeholder:text-white/25" />
              <span className="unit" translate="no">cm</span>
            </label>
            <RB icon="plus" size={44} className="rb-plain" onClick={() => pickAmt(Math.min(50, (amt ?? 0.5) + 0.5))} label="More seam allowance" />
          </div>
          <p className="mt-2 text-[14px] leading-snug text-white/55">Most home patterns use 1 to 1.5 cm.</p>
        </motion.div>)}</AnimatePresence>
      </>} />
    </Screen>
  );
}

// 3 · arrange the pieces on the sheets. The grid is the real paper: each cell is one A4 sheet.
// Drag pieces closer together and the count of sheets to print goes down. The layout is saved, and the
// mini map later draws exactly this arrangement.
const COLS = 4, ROWS = 4, SHEET_W = 210, SHEET_H = 297; // mm
const MM_PER_UNIT = 1.8; // pattern-piece units to mm
const W_MM = COLS * SHEET_W, H_MM = ROWS * SHEET_H;
type At = Record<string, { x: number; y: number; r: number }>;
const pieceW = (k: PieceKey) => ((pieceSize(k).w * MM_PER_UNIT) / W_MM) * 100; // width, % of the sheet area
function pack(pieces: PieceKey[]): At {
  // simple shelf packing, left to right, in mm; stored as piece centres in %
  const gap = 24; let x = gap, y = gap, row = 0; const out: At = {};
  pieces.forEach((k) => {
    const { w, h } = pieceSize(k); const pw = w * MM_PER_UNIT, ph = h * MM_PER_UNIT;
    if (x + pw > W_MM - gap) { x = gap; y += row + gap; row = 0; }
    out[k] = { x: ((x + pw / 2) / W_MM) * 100, y: ((y + ph / 2) / H_MM) * 100, r: 0 };
    x += pw + gap; row = Math.max(row, ph);
  });
  return out;
}
// which sheets a set of piece boxes touches
function sheetsUsed(box: DOMRect, rects: DOMRect[]) {
  const cw = box.width / COLS, ch = box.height / ROWS, on = new Set<string>();
  rects.forEach((r) => {
    for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
      const x0 = box.left + col * cw, y0 = box.top + row * ch;
      if (r.right > x0 + 2 && r.left < x0 + cw - 2 && r.bottom > y0 + 2 && r.top < y0 + ch - 2) on.add(`${row}-${col}`);
    }
  });
  return on;
}
// the paper: A4 cells (A1 … D4), tinted where a piece lands; or one A0 sheet
function Sheets({ a4, used, labels = true }: { a4: boolean; used: Set<string>; labels?: boolean }) {
  if (!a4) return labels ? <span className="absolute left-2 top-1.5 text-[11px] text-white/45">A0 sheet</span> : null;
  return <>{Array.from({ length: ROWS * COLS }, (_, n) => {
    const row = Math.floor(n / COLS), col = n % COLS, on = used.has(`${row}-${col}`);
    return (
      <div key={n} className={cx("absolute border transition-colors duration-300", on ? "border-white/35 bg-primary/15" : "border-dashed border-white/12")} style={{ left: `${(col / COLS) * 100}%`, top: `${(row / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` }}>
        {labels && <span className="absolute left-1.5 top-1 text-[11px] text-white/45">{"ABCD"[row]}{col + 1}</span>}
      </div>
    );
  })}</>;
}
const paperStyle = (desk: boolean, reserve: number) => ({ width: `min(100%, calc((100dvh - ${desk ? 220 : reserve}px) * ${W_MM / H_MM}))`, aspectRatio: `${W_MM} / ${H_MM}` });
// the paper as large as its box allows (the box is a size container), never wider or taller than it
// The paper as large as its box allows, never wider or taller than it. Measured (not container units, which some
// browsers resolve to zero inside a flex column), and drawn once the size is known.
function FitBox({ className, children, onSize }: { className?: string; children: (style: React.CSSProperties) => React.ReactNode; onSize?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const read = () => { const w = Math.min(el.clientWidth, el.clientHeight * (W_MM / H_MM)); if (w > 0) setSize((o) => (o && Math.abs(o.w - w) < 0.5 ? o : { w, h: w / (W_MM / H_MM) })); };
    read(); // straight away, then whenever the box changes
    const ro = new ResizeObserver(read); ro.observe(el);
    window.addEventListener("resize", read);
    return () => { ro.disconnect(); window.removeEventListener("resize", read); };
  }, []);
  // tell the owner once the paper is drawn at its size (the layout reads the pieces' real positions)
  const told = useRef(onSize);
  useEffect(() => { told.current = onSize; });
  useEffect(() => { if (size) told.current?.(); }, [size]);
  return <div ref={ref} className={cx("relative", className)}>{size && <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: size.w, height: size.h }}>{children({ width: "100%", height: "100%" })}</div>}</div>;
}

// The pattern map: exactly the layout you arranged (or a tidy one, for patterns made before layouts were saved), with
// the sheets it prints on. Used on the finished page, the pattern's own page and the full-screen map.
export function MapBoard({ garment, printer, at, className, style, labels = true }: { garment: GarmentKey; printer: "A4" | "A0"; at?: At; className?: string; style?: React.CSSProperties; labels?: boolean }) {
  const a4 = printer !== "A0";
  const pieces = piecesFor(garment);
  const pos = at ?? pack(pieces);
  const area = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [used, setUsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    const el = area.current; if (!el) return;
    const read = () => { const box = el.getBoundingClientRect(); if (box.width) setUsed(sheetsUsed(box, Object.values(refs.current).filter(Boolean).map((r) => r!.getBoundingClientRect()))); };
    const t = setTimeout(read, 200);
    const ro = new ResizeObserver(read); ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);
  return (
    <div ref={area} className={cx("relative overflow-hidden rounded-[10px] border border-white/25 bg-white/[.04]", className)} style={{ aspectRatio: `${W_MM} / ${H_MM}`, ...style }}>
      <Sheets a4={a4} used={used} labels={labels} />
      {pieces.map((k) => (
        <div key={k} ref={(el) => { refs.current[k] = el; }} className="absolute" style={{ left: `${pos[k]?.x ?? 50}%`, top: `${pos[k]?.y ?? 50}%`, width: `${pieceW(k)}%`, translate: "-50% -50%", rotate: `${pos[k]?.r ?? 0}deg` }}>
          <Piece k={k} label={PIECE_LABEL[k]} className="h-auto w-full" />
        </div>
      ))}
    </div>
  );
}

export function Arrange() {
  const { go, draft, setDraft } = useApp();
  const a4 = draft.printer !== "A0";
  const pieces = piecesFor(draft.garment);
  const area = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const saved = draft.layout && draft.layout.garment === draft.garment && draft.layout.printer === draft.printer ? draft.layout.at : null;
  const [start, setStart] = useState<At>(() => saved ?? pack(pieces));
  const [seed, setSeed] = useState(0);
  const [rot, setRot] = useState<Record<string, number>>(() => Object.fromEntries(Object.entries(start).map(([k, v]) => [k, v.r])));
  const [sel, setSel] = useState<string | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [touched, setTouched] = useState(false); // until you touch a piece, a little demo shows you can drag it
  const desk = useDesk();
  const choose = (k: string) => { setSel(k); setTouched(true); };
  const rotate = (k: string) => { setRot({ ...rot, [k]: ((rot[k] ?? 0) + 90) % 360 }); setTouched(true); };
  const rotRef = useRef(rot); rotRef.current = rot;

  // read where every piece is now, save it, and count the sheets it touches
  const measure = useCallback(() => {
    const box = area.current?.getBoundingClientRect(); if (!box || box.width < 40) return; // not laid out yet: never save a layout from it
    const at: At = {}; const rects: DOMRect[] = [];
    Object.entries(refs.current).forEach(([k, el]) => {
      if (!el) return; const r = el.getBoundingClientRect(); rects.push(r);
      at[k] = { x: ((r.left + r.width / 2 - box.left) / box.width) * 100, y: ((r.top + r.height / 2 - box.top) / box.height) * 100, r: rotRef.current[k] ?? 0 };
    });
    const on = sheetsUsed(box, rects);
    setUsed(on);
    setDraft({ layout: { garment: draft.garment, printer: draft.printer, at }, sheets: a4 ? on.size : 1 });
  }, [a4, draft.garment, draft.printer, setDraft]);
  useEffect(() => { const t = setTimeout(measure, 350); return () => clearTimeout(t); }, [measure, seed]);

  const sheets = a4 ? used.size : 1;
  // putting the pieces back where they started can be undone for a few seconds, so it is never a scary button
  const [undo, setUndo] = useState<{ at: At; rot: Record<string, number> } | null>(null);
  useEffect(() => { if (!undo) return; const t = setTimeout(() => setUndo(null), 6000); return () => clearTimeout(t); }, [undo]);
  const restart = () => { if (draft.layout?.at) setUndo({ at: draft.layout.at, rot }); const fresh = pack(pieces); setStart(fresh); setRot({}); setSel(null); setSeed(seed + 1); };
  const undoRestart = () => { if (!undo) return; setStart(undo.at); setRot(undo.rot); setSel(null); setSeed(seed + 1); setUndo(null); };
  const tools = (
    <div className="shrink-0">
    {/* what you can do here, in two plain steps (or, once a piece is chosen, what to do with it) */}
    <div className="mt-3 flex min-h-[44px] flex-col items-center justify-center gap-1 text-[14px] text-white/75 lg:items-start" aria-live="polite">
      {undo ? <span>Pieces laid out for you. <button onClick={undoRestart} className="font-medium text-white underline underline-offset-2">Undo</button></span>
        : sel ? <span><span className="text-white">{PIECE_LABEL[sel as PieceKey]}</span> chosen. Drag it, or tap <Icon name="rotate" size={14} className="mx-0.5 inline align-[-2px]" /> to turn it.</span>
        : <>
          <span className="flex items-center gap-2"><Icon name="move" size={16} className="shrink-0 text-peri" />Drag a piece to move it</span>
          <span className="flex items-center gap-2"><Icon name="rotate" size={16} className="shrink-0 text-peri" />Tap a piece to turn it</span>
        </>}
    </div>
    <div className="mt-2 flex shrink-0 justify-center gap-2 lg:justify-start">
      <button onClick={() => sel && rotate(sel)} disabled={!sel} className={cx("tap flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-[15px] font-medium", !sel && "opacity-40")}><Icon name="rotate" size={18} />Turn piece</button>
      <button onClick={() => { restart(); setTouched(true); }} className="tap flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-[15px] font-medium"><Icon name="grid" size={18} />Arrange for me</button>
    </div>
    </div>
  );
  const board = (style: React.CSSProperties, className?: string) => (
    <div key={seed} ref={area} className={cx("relative overflow-hidden rounded-[10px] border border-white/20 bg-white/[.03]", className)} style={style}>
      <Sheets a4={a4} used={used} labels={false} />
      {pieces.map((k, i) => (
        <motion.div key={k} ref={(el) => { refs.current[k] = el; }} drag dragConstraints={area} dragMomentum={false} dragElastic={0}
          onDragStart={() => choose(k)} onDragEnd={() => requestAnimationFrame(measure)} onTap={() => choose(k)} onAnimationComplete={measure}
          whileDrag={{ scale: 1.04, zIndex: 10 }} animate={{ rotate: rot[k] ?? 0 }}
          className={cx("absolute cursor-grab touch-none rounded-md active:cursor-grabbing", sel === k && "outline outline-1 outline-offset-2 outline-peri")}
          style={{ left: `${start[k]?.x ?? 50}%`, top: `${start[k]?.y ?? 50}%`, width: `${pieceW(k)}%`, translate: "-50% -50%" }}>
          <Piece k={k} label={PIECE_LABEL[k]} className="h-auto w-full" />
          {/* the chosen piece carries its own turn button, right where you are looking */}
          {sel === k && <button aria-label={`Turn ${PIECE_LABEL[k]}`} onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); rotate(k); }}
            className="absolute -right-3 -top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white text-bg shadow-[0_4px_14px_rgb(0_0_0/.45)]"><Icon name="rotate" size={18} /></button>}
          {/* a first-time demo on the first piece: a finger mark sliding across it, and "Drag me" */}
          {!touched && i === 0 && (
            <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <motion.span animate={{ x: [-14, 14, -14] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-bg shadow-[0_0_0_6px_rgb(140_156_248/.35)]"><Icon name="move" size={20} /></motion.span>
              <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-bg">Drag me</span>
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
  // centred on phones, and the sheet count is one plain line of text (no big number competing with the heading)
  const intro = <div className="text-center lg:text-left">
    <H1 className="mt-3 lg:mt-0">Lay out your pattern</H1>
    <Lead className="mx-auto mt-2 max-w-[340px] [text-wrap:pretty] lg:mx-0">{a4 ? "This is your printer paper: each square is one A4 page. Moving pieces closer together prints fewer pages. You can also skip this and tap Next." : "This is your A0 sheet. Move the pieces where you want them, or skip this and tap Next."}</Lead>
    <p className={cx("mt-2 text-[15px] text-white/85 transition-opacity", a4 && !used.size && "opacity-0")}>{a4 ? <>Uses <span className="tabular-nums">{sheets}</span> {sheets === 1 ? "page" : "pages"}</> : "Uses 1 A0 sheet"}</p>
  </div>;
  const footer = <Arrows onNext={() => { measure(); go("print"); }} />;
  if (desk) return (
    <Screen header={<PrintHeader step={2} sub={0.5} />} footer={footer}>
      <Split cols="lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]" left={<>{intro}{tools}</>} right={board(paperStyle(desk, 400), "mx-auto")} />
    </Screen>
  );
  // phones: the paper takes whatever room is left between the words and the tools, on any screen height, so Rotate
  // and Start over are always on screen
  return (
    <Screen header={<PrintHeader step={2} sub={0.5} />} footer={footer} fill>
      <div className="shrink-0">{intro}</div>
      <FitBox className="mt-3 min-h-[240px] flex-1" onSize={() => setTimeout(measure, 60)}>{(st) => board(st)}</FitBox>
      {tools}
    </Screen>
  );
}

const STRETCH_WORDS = { "A lot": "stretchy", "A bit": "a little stretch", No: "no stretch" } as const;
// What to buy for this pattern, in one line: how much, how wide, how stretchy
export const fabricLine = (garment: GarmentKey, ease: number, stretch?: "A lot" | "A bit" | "No") =>
  `${metresFor(garment, ease)} metres, 140 cm wide, ${STRETCH_WORDS[stretch ?? fabricAdvice(ease).stretch]}`;

// the same pattern on narrower or wider fabric
export const otherWidths = (garment: GarmentKey, ease: number) => `On 115 cm wide fabric: ${metresAt(garment, ease, 115)} metres. On 150 cm: ${metresAt(garment, ease, 150)} metres.`;

// 4 · review, then print
export function PrintReady() {
  const { replace, back, draft, savePattern, body } = useApp();
  const { toast, node } = useToast();
  const a4 = draft.printer !== "A0";
  const later = () => { savePattern("Fitting"); toast("Saved. Print it any time from your patterns"); setTimeout(() => useApp.getState().home(), 900); };
  const count = a4 ? draft.sheets ?? 9 : 1;
  const [printing, setPrinting] = useState(0);
  const print = () => {
    setPrinting(0.01);
    const t0 = performance.now();
    const tick = (n: number) => { const k = Math.min(1, (n - t0) / 3200); setPrinting(k); if (k < 1) requestAnimationFrame(tick); else { haptic("success"); savePattern("Printed"); replace("printed", { n: count }); } };
    requestAnimationFrame(tick);
  };
  // every row says what it means without sewing or printing words a beginner wouldn't know
  const rows: [string, string][] = [
    ["Garment", nameFor(draft.garment, draft.source === "template" ? undefined : draft.kind, draft.details)],
    ["Drafted to", body().name],
    ["Fit", `${fitName(draft.ease)}, ${draft.ease} cm of room`],
    ["Seam allowance", draft.seam ? `${draft.seam} cm, on every piece` : "Not added, you add your own"],
    ["Paper size", a4 ? "A4, on your printer at home" : "A0, at a print shop"],
    ["Sheets to print", a4 ? `${count}, plus 1 map page` : "1"],
  ];
  return (
    <><Screen header={<PrintHeader step={3} sub={0.5} />} footer={<>
      <div className="flex items-center gap-3"><RB icon="back" variant="dark" size={56} onClick={back} label="Back" /><Pill className="min-w-0 flex-1" onClick={print}>{a4 ? `Print ${count} sheets` : "Send to print shop"}</Pill></div>
      <TextButton className="mt-1" onClick={later}>Save and print later</TextButton>
    </>}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">Ready to print</HS>
        <Lead className="mt-3">Check the details, then print. The map page shows where every sheet goes.</Lead>
      </>} right={
        <div className="mt-6 lg:mt-0">
          <div className="card-soft divide-y divide-white/8 rounded-[24px] px-5">
            {rows.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-4 py-3.5"><span className="shrink-0 text-[15px] text-white/60">{k}</span><span className="text-right text-[16px]">{v}</span></div>)}
          </div>
          {/* scale check: if the printer shrinks the page, the whole pattern comes out the wrong size */}
          <div className="mt-4 flex items-start gap-3.5">
            <span className="grid h-[52px] w-[52px] shrink-0 place-items-center border-[1.5px] border-white/80 text-[11px] text-white/70" translate="no">10 cm</span>
            <p className="text-[15px] leading-snug text-white/75">Print at 100% (actual size), not &ldquo;fit to page&rdquo;. Then measure the 10 cm test square on your first page before you cut.</p>
          </div>
        </div>} />
    </Screen>
      <AnimatePresence>{printing > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-bg/85 backdrop-blur-md">
          {/* the printer in the app's icon style (the primary gradient, a light edge, a soft glow), breathing while it works */}
          <span className="relative grid h-24 w-24 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20 [animation-duration:2s]" />
            <span className="icon-primary relative grid h-24 w-24 place-items-center rounded-full"><Icon name="printer" size={38} strokeWidth={1.8} /></span>
          </span>
          <div className="mt-7 text-[22px] tracking-[-.02em]">{a4 ? "Printing your sheets" : "Sending to the print shop"}</div>
          {/* one small sheet per page, filling in as each one prints */}
          {a4 ? (
            <div className="mt-5 flex max-w-[260px] flex-wrap justify-center gap-1.5" aria-label={`${Math.max(1, Math.round(printing * count))} of ${count} sheets`}>
              {Array.from({ length: count }, (_, i) => (
                <span key={i} className={cx("h-[26px] w-[19px] rounded-[3px] border transition-all duration-300", i < Math.round(printing * count) ? "border-white bg-white" : "border-white/25 bg-white/[.04]")} />
              ))}
            </div>
          ) : (
            <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-white" style={{ width: `${printing * 100}%` }} /></div>
          )}
          <div className="mt-3 text-[15px] tabular-nums text-white/60">{a4 ? `${Math.max(1, Math.round(printing * count))} of ${count} sheets` : "Your pattern is on its way"}</div>
        </motion.div>)}</AnimatePresence>
      {node}
    </>
  );
}

// The pattern map, full screen: exactly the layout you arranged, with the sheets it prints on. Opened from the finished
// page (the pattern being made) or from a saved pattern's page ({ id }).
export function MiniMap({ p }: { p?: Record<string, unknown> }) {
  const { draft, patterns } = useApp();
  const pat = p?.id ? patterns.find((x) => x.id === p.id) : undefined;
  const garment = pat?.garment ?? draft.garment;
  const printer = pat ? pat.spec?.printer ?? "A4" : draft.printer;
  const at = pat ? pat.spec?.layout : draft.layout?.garment === draft.garment ? draft.layout.at : undefined;
  const a4 = printer !== "A0";
  const desk = useDesk();
  return (
    <Screen fill={!desk}>
      <TopBar left="back" />
      <Split cols="lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" left={<>
        <H1 className="mt-4 lg:mt-0">Your pattern map</H1>
        <Lead className="mt-2">{a4 ? "Where every piece sits on your sheets. Tape each row first, then join the rows. Match the triangles on the edges." : "Where every piece sits on your A0 sheet."}</Lead>
      </>} right={desk ? <MapBoard garment={garment} printer={printer} at={at} className="mx-auto" style={paperStyle(true, 300)} /> : null} />
      {!desk && <FitBox className="mt-4 min-h-[300px] flex-1">{(st) => <MapBoard garment={garment} printer={printer} at={at} style={st} />}</FitBox>}
    </Screen>
  );
}

// The end: the pattern is done, now the sewing starts. A moment, so it uses paper and violet. The picture is the
// pattern map itself (the one thing you need while taping the sheets), not decoration; tap it to open it large.
export function Printed({ p }: { p?: Record<string, unknown> }) {
  const { home, go, draft } = useApp();
  const n = Number(p?.n ?? 9);
  const { toast, node } = useToast();
  const kind = draft.garment === "flutter" ? "dress" : ({ Dresses: "dress", Tops: "top", Pants: "trousers", Skirts: "skirt" } as const)[templateBy(draft.garment).category];
  const at = draft.layout?.garment === draft.garment ? draft.layout.at : undefined;
  const art = (
    <button onClick={() => go("minimap")} aria-label="Open your pattern map" className="absolute inset-0 flex flex-col items-center px-6 pb-4 pt-[calc(var(--top)+10px)] lg:px-12 lg:pb-8 lg:pt-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="relative min-h-0 w-full flex-1">
        <FitBox className="h-full">{(st) => <MapBoard garment={draft.garment} printer={draft.printer} at={at} className="shadow-[0_20px_50px_-24px_rgb(11_12_21/.8)]" style={st} />}</FitBox>
      </motion.div>
      <span className="mt-3 flex items-center gap-1.5 text-[14px] text-white/90">Your pattern map<Icon name="chevR" size={15} /></span>
    </button>
  );
  return (
    <PaperScreen art={art} artH="h-[46%]" footer={<Pill onClick={home}>Back to home</Pill>}>
      <div className="flex items-center gap-2 text-[15px] text-[#12131c]/70"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#12131c] text-white"><Icon name="check" size={12} strokeWidth={3} /></span>{n === 1 ? "Your sheet is printed" : `All ${n} sheets are printed`}</div>
      <h1 className="h1 mt-3 !text-[32px] text-[#12131c] lg:!text-[52px]">Your pattern is complete</h1>
      <p className="lead mt-2">Now you can start making your {kind}.</p>
      <div className="mt-4 border-t border-[#12131c]/10 pt-3">
        <div className="text-[14px] text-[#12131c]/55">Fabric to buy</div>
        <div className="mt-0.5 text-[16px]">{fabricLine(draft.garment, draft.ease, draft.chosen?.stretch ? draft.stretch : undefined)}</div>
        {/* fabric comes in other widths too, and the pattern needs more than fabric */}
        <div className="mt-1 text-[14px] leading-snug text-[#12131c]/60">{otherWidths(draft.garment, draft.ease)}</div>
        <div className="mt-2.5 text-[14px] text-[#12131c]/55">You will also need</div>
        <div className="mt-0.5 text-[15px] leading-snug">{notionsFor(draft.details ?? FLUTTER.read, piecesFor(draft.garment)).join(" · ")}</div>
      </div>
      <div className="mt-4 flex flex-col gap-2">{([["book", `Sewing guide for this ${kind}`], ["layers", "Sewing words, explained"], ["video", "Video: taping the sheets together"]] as const).map(([ic, t]) => (
        <button key={t} onClick={() => toast("Opening " + t.toLowerCase())} className="paper-card tap flex min-h-[54px] items-center gap-3 rounded-[16px] px-4 text-left text-[16px]"><Icon name={ic} size={19} className="text-[#3c4b63]" /><span className="flex-1">{t}</span><Icon name="chevR" size={16} className="text-[#12131c]/40" /></button>
      ))}</div>
      <div className="h-4" />
      {node}
    </PaperScreen>
  );
}
