"use client";
import { haptic } from "@/lib/haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { FABRICS, PIECE_LABEL, templateBy, type PieceKey } from "@/lib/data";
import { Screen, TopBar, HS, H1, Lead, Pill, Glow, Glass, Option, Arrows, Check, cx, useToast, Split, useDesk } from "@/components/ui";
import { Piece, pieceSize } from "@/components/art";
import { Icon } from "@/components/icons";
import { garmentName, piecesFor } from "./pattern";
import { FlowHeader } from "./measure";

const GRID = { backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "18px 18px" };

// Print flow, in the order it really depends on: printer → seam allowance → layout on the sheets → fabric → print.
const PRINT_STEPS = ["Printer", "Seams", "Layout", "Fabric", "Print"];
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
  const add = yes === true;
  const ready = yes === false || (yes === true && amt !== null);
  const pickNo = () => { setYes(false); setDraft({ seam: null }); };
  const pickYes = () => { setYes(true); if (amt !== null) setDraft({ seam: amt }); };
  const pickAmt = (v: number) => { setAmt(v); setDraft({ seam: v }); };
  return (
    <Screen header={<PrintHeader step={1} sub={ready ? 0.5 : 0} />} footer={<Arrows ready={ready} onNext={() => go("arrange")} />}>
      <Split left={<>
      <HS className="mt-4 lg:mt-0">Add seam<br />allowance?</HS>
      <Lead className="mt-3">The dashed line around each piece, where you sew. Skip it if you add your own.</Lead>
      </>} right={<>
      <Glass className="relative mt-5 grid h-[min(210px,25dvh)] place-items-center rounded-[26px] lg:mt-0 lg:h-[min(340px,38dvh)]" >
        <div className="absolute inset-0 rounded-[26px]" style={GRID} />
        <Piece k="bodiceFront" width={120} label="Bodice front" allowance={add} />
        {add && amt !== null && <span className="absolute right-6 top-6 text-[15px] font-medium text-peri">{amt} cm</span>}
      </Glass>
      <div className="mt-3 flex flex-col gap-2.5" data-need={yes === null ? "1" : "0"}>
        <Option on={yes === false} onClick={pickNo} className="flex h-[60px] items-center gap-4 rounded-[18px] px-4"><span className="w-10 text-[17px] font-medium">No</span><span className="text-[15px] text-white/60">I’ll add my own</span></Option>
        <Option on={add} onClick={pickYes} className="flex h-[60px] items-center gap-4 rounded-[18px] px-4"><span className="w-10 text-[17px] font-medium">Yes</span><span className="text-[15px] text-white/60">Add it to every piece</span></Option>
      </div>
      <AnimatePresence>{add && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          <div className="mt-4 text-[15px] font-medium text-white/80">How much?</div>
          <div className="mt-2.5 grid grid-cols-2 gap-3" data-need={amt === null ? "1" : "0"}>{[1.0, 1.5].map((v) => (
            <Option key={v} on={amt === v} onClick={() => pickAmt(v)} className="flex h-[64px] items-center rounded-[18px] px-4"><span className="flex items-baseline gap-2"><span className="serif text-[30px] leading-none">{v.toFixed(1)}</span><span className="unit" translate="no">cm</span></span></Option>
          ))}</div>
        </motion.div>)}</AnimatePresence>
      </>} />
    </Screen>
  );
}

// 3 · arrange the pieces on the sheets. The grid is the real paper: each cell is one A4 sheet.
// Drag pieces closer together and the count of sheets to print goes down.
const COLS = 4, ROWS = 4, SHEET_W = 210, SHEET_H = 297; // mm
const MM_PER_UNIT = 1.8; // pattern-piece units to mm
const W_MM = COLS * SHEET_W, H_MM = ROWS * SHEET_H;
function pack(pieces: PieceKey[]) {
  // simple shelf packing, left to right, in mm
  const gap = 24; let x = gap, y = gap, row = 0;
  return pieces.map((k) => {
    const { w, h } = pieceSize(k); const pw = w * MM_PER_UNIT, ph = h * MM_PER_UNIT;
    if (x + pw > W_MM - gap) { x = gap; y += row + gap; row = 0; }
    const at = { left: (x / W_MM) * 100, top: (y / H_MM) * 100 };
    x += pw + gap; row = Math.max(row, ph);
    return at;
  });
}

export function Arrange() {
  const { go, draft, setDraft } = useApp();
  const a4 = draft.printer !== "A0";
  const pieces = piecesFor(draft.garment);
  const area = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [seed, setSeed] = useState(0);
  const [rot, setRot] = useState<Record<string, number>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const desk = useDesk();
  const start = pack(pieces);

  // which sheets does any piece touch?
  const measure = useCallback(() => {
    const box = area.current?.getBoundingClientRect(); if (!box) return;
    const cw = box.width / COLS, ch = box.height / ROWS, on = new Set<string>();
    Object.values(refs.current).forEach((el) => {
      if (!el) return; const r = el.getBoundingClientRect();
      for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
        const x0 = box.left + col * cw, y0 = box.top + row * ch;
        if (r.right > x0 + 2 && r.left < x0 + cw - 2 && r.bottom > y0 + 2 && r.top < y0 + ch - 2) on.add(`${row}-${col}`);
      }
    });
    setUsed(on);
  }, []);
  useEffect(() => { const t = setTimeout(measure, 350); return () => clearTimeout(t); }, [measure, seed]);
  useEffect(() => { if (a4 && used.size) setDraft({ sheets: used.size }); }, [a4, used, setDraft]);

  const sheets = a4 ? used.size : 1;
  const tools = (
    <div className="mt-3 flex justify-center gap-2">
      <button onClick={() => { if (!sel) return; setRot({ ...rot, [sel]: ((rot[sel] ?? 0) + 90) % 360 }); }} className={cx("tap flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-[15px] font-medium", !sel && "opacity-40")}><Icon name="rotate" size={18} />Rotate piece</button>
      <button onClick={() => { setRot({}); setSel(null); setSeed(seed + 1); }} className="tap flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-[15px] font-medium"><Icon name="grid" size={18} />Start over</button>
    </div>
  );
  return (
    <Screen header={<PrintHeader step={2} sub={0.5} />} footer={<Arrows onNext={() => go("needs")} />}>
      <Split cols="lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]" left={<>
        <H1 className="mt-4 lg:mt-0">Arrange your pieces</H1>
        <Lead className="mt-2">{a4 ? "Each box is one A4 sheet. Drag pieces closer together to print fewer sheets." : "This is your A0 sheet. Drag the pieces to where you want them."}</Lead>
        <div className="mt-3 flex items-baseline gap-2"><span className="serif text-[34px] leading-none lg:text-[56px]">{sheets}</span><span className="text-[16px] text-white/65">{a4 ? `of ${COLS * ROWS} A4 sheets to print` : "A0 sheet to print"}</span></div>
        {desk && tools}
      </>} right={<>
        <div key={seed} ref={area} className="relative mx-auto mt-4 overflow-hidden rounded-[10px] border border-white/20 bg-white/[.03] lg:mt-0" style={{ width: `min(100%, calc((100dvh - ${desk ? 220 : 400}px) * ${W_MM / H_MM}))`, aspectRatio: `${W_MM} / ${H_MM}` }}>
          {a4 && Array.from({ length: ROWS * COLS }, (_, n) => {
            const row = Math.floor(n / COLS), col = n % COLS, on = used.has(`${row}-${col}`);
            return (
              <div key={n} className={cx("absolute border transition-colors duration-300", on ? "border-white/35 bg-primary/15" : "border-dashed border-white/12")} style={{ left: `${(col / COLS) * 100}%`, top: `${(row / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` }}>
                <span className="absolute left-1.5 top-1 text-[11px] text-white/45">{"ABCD"[row]}{col + 1}</span>
              </div>
            );
          })}
          {pieces.map((k, i) => {
            const { w } = pieceSize(k);
            return (
              <motion.div key={k} ref={(el) => { refs.current[k] = el; }} drag dragConstraints={area} dragMomentum={false} dragElastic={0}
                onDragStart={() => setSel(k)} onDragEnd={() => requestAnimationFrame(measure)} onTap={() => setSel(k)} onAnimationComplete={measure}
                whileDrag={{ scale: 1.04, zIndex: 10 }} animate={{ rotate: rot[k] ?? 0 }}
                className={cx("absolute cursor-grab touch-none rounded-md active:cursor-grabbing", sel === k && "outline outline-1 outline-offset-2 outline-peri")}
                style={{ left: `${start[i].left}%`, top: `${start[i].top}%`, width: `${((w * MM_PER_UNIT) / W_MM) * 100}%` }}>
                <Piece k={k} label={PIECE_LABEL[k]} className="h-auto w-full" />
              </motion.div>
            );
          })}
        </div>
        {!desk && tools}
      </>} />
    </Screen>
  );
}

// 4 · what you'll need to buy
export function Needs() {
  const { go, draft, setDraft } = useApp();
  return (
    <Screen header={<PrintHeader step={3} sub={0.5} />} footer={<Arrows onNext={() => go("print")} />}>
      <Split center={false} className="lg:pt-6" left={<>
      <H1 className="mt-4 lg:mt-0">What you’ll need</H1>
      <Glow color="#687ef5" variant="side" className="relative mt-5 rounded-[26px] p-5 lg:mt-8 lg:p-8">
        <div className="text-[16px] font-medium text-white/85">Fabric to buy</div>
        <div className="mt-2 flex items-baseline gap-2"><span className="serif text-[64px] leading-none">2.4</span><span className="text-[18px] font-medium text-white/80" translate="no">metres</span></div>
        <div className="mt-2 text-[15px] leading-snug text-white/75">Of fabric 140 cm wide. This includes 10% extra in case it shrinks when you wash it.</div>
      </Glow>
      </>} right={<>
      <div className="mt-6 text-[16px] font-medium text-white/85 lg:mt-16">Fabrics that work well</div>
      <div className="mt-2.5 flex flex-col gap-2">{FABRICS.map((f) => (
        <Glass key={f.name} onClick={() => setDraft({ fabric: f.name })} selected={draft.fabric === f.name} className="flex min-h-[64px] w-full items-center gap-3 rounded-[18px] px-3 py-2">
          <span className="h-10 w-10 shrink-0 rounded-[10px]" style={{ background: f.swatch }} />
          <span className="flex-1"><span className="block text-[16px] font-medium">{f.name}</span><span className="block text-[14px] text-white/60">{f.note}</span></span>
        </Glass>
      ))}</div>
      </>} />
    </Screen>
  );
}

// 5 · print
export function PrintReady() {
  const { replace, draft, savePattern, body } = useApp();
  const { toast, node } = useToast();
  const a4 = draft.printer !== "A0";
  const count = a4 ? draft.sheets ?? 9 : 1;
  const [printing, setPrinting] = useState(0);
  const print = () => {
    setPrinting(0.01);
    const t0 = performance.now();
    const tick = (n: number) => { const k = Math.min(1, (n - t0) / 3200); setPrinting(k); if (k < 1) requestAnimationFrame(tick); else { haptic("success"); savePattern("Printed"); replace("printed", { n: count }); } };
    requestAnimationFrame(tick);
  };
  const rows: [string, string][] = [
    ["Pattern", garmentName(draft.garment)],
    ["Drafted to", body().name],
    ["Paper", a4 ? `${count} A4 sheets, at home` : "1 A0 sheet, at a print shop"],
    ["Seam allowance", draft.seam ? `${draft.seam} cm, on every piece` : "Not added"],
  ];
  return (
    <Screen header={<PrintHeader step={4} sub={0.5} />} footer={<div className="flex flex-col items-center gap-1"><Pill onClick={print}>{a4 ? `Print ${count} sheets` : "Send to print shop"}</Pill><button onClick={() => toast("PDF saved to Files")} className="h-12 px-4 text-[16px] font-medium text-white/70 hover:text-white">Save as PDF instead</button></div>}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">Ready to print</HS>
        <Lead className="mt-3">Check the details, then print. Your first page is a map showing where every sheet goes.</Lead>
      </>} right={
        <Glass className="mt-6 divide-y divide-white/8 rounded-[24px] px-5 lg:mt-0">
          {rows.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-4 py-4"><span className="text-[15px] text-white/60">{k}</span><span className="text-right text-[16px]">{v}</span></div>)}
        </Glass>} />
      <AnimatePresence>{printing > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-bg/85 backdrop-blur-md">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-bg"><Icon name="printer" size={34} /></div>
          <div className="serif mt-6 text-[56px] leading-none">{Math.max(1, Math.round(printing * count))}/{count}</div>
          <div className="mt-2 text-[16px] text-white/75">{a4 ? "Sending sheets to your printer…" : "Sending your pattern to the print shop…"}</div>
          <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-primary" style={{ width: `${printing * 100}%` }} /></div>
        </motion.div>)}</AnimatePresence>
      {node}
    </Screen>
  );
}

// Mini map: where each sheet goes (reached from the end screen)
const ROW_L = ["A", "B", "C", "D"];
export function MiniMap() {
  const { back, draft } = useApp();
  const pieces = piecesFor(draft.garment);
  return (
    <Screen footer={<Pill variant="dark" onClick={back}>Back</Pill>}>
      <TopBar left="back" />
      <Split cols="lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" left={<>
      <H1 className="mt-4">Pattern mini map</H1>
      <Lead className="mt-2">Tape each row first, then join the rows. Match the triangles on the edges.</Lead>
      </>} right={<>
      <div className="relative mt-4 grid grid-cols-4 grid-rows-4 overflow-hidden rounded-[20px] border border-white/15 lg:mx-auto lg:w-[min(480px,54dvh)]" style={{ aspectRatio: "3 / 4" }}>
        {ROW_L.flatMap((r) => [1, 2, 3, 4].map((c) => <div key={r + c} className="relative border border-dashed border-white/15"><span className="absolute left-1 top-0.5 text-[11px] text-white/45">{r + c}</span></div>))}
        <div className="absolute inset-0 grid grid-cols-3 place-items-center p-4">{pieces.map((k) => <Piece key={k} k={k} width={78} label={PIECE_LABEL[k]} />)}</div>
      </div>
      </>} />
    </Screen>
  );
}

// The end: the pattern is done, now the sewing starts
export function Printed({ p }: { p?: Record<string, unknown> }) {
  const { home, go, draft } = useApp();
  const n = Number(p?.n ?? 9);
  const { toast, node } = useToast();
  const kind = draft.garment === "flutter" ? "dress" : ({ Dresses: "dress", Tops: "top", Pants: "trousers", Skirts: "skirt" } as const)[templateBy(draft.garment).category];
  return (
    <Screen footer={<Pill onClick={home}>Back to home</Pill>} bg={<div className="absolute inset-0" style={{ background: "radial-gradient(90% 45% at 30% 0%, rgba(104,126,245,.5), transparent 70%)" }} />}>
      <TopBar left="close" onLeft={home} />
      <Split left={<>
      <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="mt-4 grid h-14 w-14 place-items-center rounded-full bg-primary"><Icon name="check" size={28} strokeWidth={2.4} /></motion.span>
      <HS className="mt-5">Good job! Your<br />pattern is complete</HS>
      <Lead className="mt-3">{n === 1 ? "Your sheet is printed." : `All ${n} sheets are printed.`} Now you can start making your {kind}.</Lead>
      </>} right={<>
      <Glow color="#8c9cf8" variant="fade" className="mt-6 rounded-[26px] p-5 lg:mt-0">
        <div className="text-[17px] font-medium">Support resources</div><div className="text-[15px] text-white/70">Help while you cut and sew.</div>
        <div className="mt-3 flex flex-col gap-2">{([["book", `Sewing guide for this ${kind}`], ["layers", "Sewing words, explained"], ["video", "Video: taping the sheets together"]] as const).map(([ic, t]) => (
          <button key={t} onClick={() => toast("Opening " + t.toLowerCase())} className="flex min-h-12 items-center gap-3 rounded-[14px] bg-black/20 px-3 text-left text-[15px]"><Icon name={ic} size={18} /><span className="flex-1">{t}</span><Icon name="chevR" size={16} /></button>
        ))}</div>
      </Glow>
      <Glass onClick={() => go("minimap")} className="mt-3 flex w-full items-center gap-3 rounded-[22px] p-4"><Icon name="map" size={22} /><div className="flex-1"><div className="text-[16px] font-medium">View pattern mini map</div><div className="text-[14px] text-white/60">Where each sheet goes</div></div><Icon name="chevR" size={18} className="text-white/50" /></Glass>
      </>} />
      {node}
    </Screen>
  );
}
