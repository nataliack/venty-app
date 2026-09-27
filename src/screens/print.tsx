"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { FABRICS, PIECE_LABEL } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, Lead, Pill, Glow, Glass, RB, Arrows, Check, Toggle, cx, useToast } from "@/components/ui";
import { Piece } from "@/components/art";
import { Icon } from "@/components/icons";
import { garmentName, piecesFor } from "./pattern";

const GRID = { backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "18px 18px" };

// P12 · seam allowance
export function Seam() {
  const { go, draft, setDraft } = useApp();
  const add = draft.seam !== null;
  return (
    <Screen footer={<Arrows onNext={() => go("arrange")} />}>
      <div className="h-12" /><Eyebrow>Before you print · 01</Eyebrow>
      <H1 className="mt-4">Add seam allowance?</H1>
      <Lead className="mt-2 text-[14px]">The dashed line around each piece. Skip it if you add your own.</Lead>
      <Glass className="relative mt-4 grid h-[min(220px,26dvh)] place-items-center rounded-[26px]" >
        <div className="absolute inset-0 rounded-[26px]" style={GRID} />
        <Piece k="bodiceFront" width={130} label="Bodice front" allowance={add} />
        {add && <span className="absolute right-6 top-6 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold">{draft.seam} cm</span>}
      </Glass>
      <div className="mt-3 flex flex-col gap-2">
        <Glass onClick={() => setDraft({ seam: null })} selected={!add} className="flex h-12 w-full items-center gap-4 rounded-[16px] px-4"><span className="w-10 text-[14px] font-semibold">No</span><span className="text-[12px] text-white/55">I’ll add my own</span></Glass>
        <Glass onClick={() => setDraft({ seam: draft.seam ?? 1.5 })} selected={add} className="flex h-12 w-full items-center gap-4 rounded-[16px] px-4"><span className="w-10 text-[14px] font-semibold">Yes</span><span className="flex-1 text-[12px] text-white/55">Add it to every piece</span>{add && <span className="h-2 w-2 rounded-full bg-primary" />}</Glass>
      </div>
      <AnimatePresence>{add && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          <Eyebrow className="mt-4 text-[9px]">How much?</Eyebrow>
          <div className="mt-2 grid grid-cols-2 gap-3">{[1.0, 1.5].map((v) => (
            draft.seam === v ? (
              <Glow key={v} as="button" color="#687ef5" variant="side" onClick={() => setDraft({ seam: v })} className="flex h-16 items-center justify-between rounded-[18px] px-4"><span className="flex items-baseline gap-2"><span className="serif text-[34px]">{v.toFixed(1)}</span><span className="text-[10px] uppercase">cm</span></span><Check size={24} /></Glow>
            ) : (
              <Glass key={v} onClick={() => setDraft({ seam: v })} className="flex h-16 items-center rounded-[18px] px-4"><span className="flex items-baseline gap-2"><span className="serif text-[34px] text-white/70">{v.toFixed(1)}</span><span className="text-[10px] uppercase text-white/50">cm</span></span></Glass>
            )
          ))}</div>
        </motion.div>)}</AnimatePresence>
    </Screen>
  );
}

// P13 · arrange pieces (draggable)
export function Arrange() {
  const { go, draft } = useApp();
  const pieces = piecesFor(draft.garment);
  const area = useRef<HTMLDivElement>(null);
  const [seed, setSeed] = useState(0);
  const [rot, setRot] = useState<Record<string, number>>({});
  const [sel, setSel] = useState<string | null>(null);
  const { toast, node } = useToast();
  return (
    <Screen footer={<Arrows onNext={() => go("printMethod")} />}>
      <div className="h-12" /><Eyebrow>Print pattern · 02</Eyebrow>
      <H1 className="mt-4">Your pattern</H1>
      <Lead className="mt-2 text-[14px]">We packed the pieces to save paper. Drag to rearrange.</Lead>
      <div ref={area} key={seed} className="glass relative mt-4 h-[min(400px,46dvh)] overflow-hidden rounded-[24px]" style={GRID}>
        {["A", "B", "C", "D"].map((r, i) => <span key={r} className="absolute left-1.5 text-[8px] text-white/40" style={{ top: `${8 + i * 25}%` }}>{r}1</span>)}
        {pieces.map((k, i) => (
          <motion.div key={k} drag dragConstraints={area} dragMomentum={false} onTap={() => setSel(k)} whileDrag={{ scale: 1.05, zIndex: 10 }}
            className={cx("absolute cursor-grab rounded-lg p-1", sel === k && "ring-1 ring-primary")} style={{ left: `${6 + (i % 3) * 31}%`, top: `${4 + Math.floor(i / 3) * 48}%` }}
            animate={{ rotate: rot[k] ?? 0 }}>
            <Piece k={k} width={i > 2 ? 78 : 88} label={PIECE_LABEL[k]} />
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex justify-center"><div className="glass flex gap-1 rounded-full p-1.5">
        <RB icon="move" size={40} className="!border-0 !bg-transparent" onClick={() => toast("Drag any piece to move it")} />
        <RB icon="rotate" size={40} className="!border-0 !bg-transparent" onClick={() => { const k = sel ?? pieces[0]; setRot({ ...rot, [k]: ((rot[k] ?? 0) + 90) % 360 }); }} />
        <RB icon="grid" size={40} className="!border-0 !bg-transparent" onClick={() => { setRot({}); setSeed(seed + 1); toast("Pieces re-packed"); }} />
      </div></div>
      {node}
    </Screen>
  );
}

// P14 · printing method
export function PrintMethod() {
  const { go, draft, setDraft } = useApp();
  return (
    <Screen footer={<Arrows onNext={() => go("needs")} />}>
      <div className="h-12" /><Eyebrow>Print pattern · 03</Eyebrow>
      <H1 className="mt-4">How are you<br />printing it?</H1>
      <div className="mt-5 flex flex-col gap-3">
        {([["A4", "A4 · Home printer", "Tile the pattern, then tape it together.", "16", "Sheets to tape"], ["A0", "A0 · Print shop", "One big sheet. No taping.", "01", "Sheet"]] as const).map(([k, t, d, n, l]) => {
          const on = draft.printer === k;
          return (
            <Glow key={k} as="button" color={on ? "#687ef5" : "#3c4b63"} variant={on ? "fade" : "dim"} onClick={() => setDraft({ printer: k })} className="relative block h-[min(210px,25dvh)] w-full rounded-[28px] p-5">
              <div className="text-[18px] font-semibold">{t}</div><div className="mt-1 text-[12px] text-white/65">{d}</div>
              {on && <Check className="absolute right-4 top-4" />}
              {k === "A4" ? <div className="absolute bottom-5 left-5 grid grid-cols-4 gap-1">{Array.from({ length: 12 }, (_, i) => <span key={i} className="h-[22px] w-[17px] rounded-[3px] border border-white/50 bg-white/10" />)}</div>
                : <div className="absolute bottom-5 left-5 h-[80px] w-[60px] rounded-md border border-white/40 bg-white/10" />}
              <div className="absolute bottom-5 right-5 flex items-end gap-2"><span className="serif text-[60px] leading-none">{n}</span><span className="eyebrow mb-2 w-[60px] text-[9px] leading-tight">{l}</span></div>
            </Glow>
          );
        })}
      </div>
    </Screen>
  );
}

// P15 · what you'll need
export function Needs() {
  const { go, draft, setDraft } = useApp();
  return (
    <Screen footer={<Arrows onNext={() => go("print")} />}>
      <div className="h-12" /><Eyebrow>Print pattern · 04</Eyebrow>
      <H1 className="mt-4">What you’ll need</H1>
      <Glow color="#687ef5" variant="side" className="relative mt-5 rounded-[26px] p-5">
        <Eyebrow className="text-[9px] text-white/70">Fabric needed</Eyebrow>
        <div className="mt-2 flex items-baseline gap-3"><span className="serif text-[64px] leading-none">2.4</span><span className="eyebrow text-[10px]">Metres</span></div>
        <div className="mt-2 text-[12px] text-white/70">at 140 cm wide · allow 10% for shrinkage</div>
      </Glow>
      <Eyebrow className="mt-5 text-[9px]">Recommended fabric</Eyebrow>
      <div className="mt-2 flex flex-col gap-2">{FABRICS.map((f) => (
        <Glass key={f.name} onClick={() => setDraft({ fabric: f.name })} selected={draft.fabric === f.name} className="flex h-[58px] w-full items-center gap-3 rounded-[18px] px-3">
          <span className="h-9 w-9 rounded-[10px]" style={{ background: f.swatch }} />
          <span className="flex-1"><span className="block text-[14px] font-semibold">{f.name}</span><span className="block text-[11px] text-white/55">{f.note}</span></span>
          {f.best && <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase">Best</span>}
        </Glass>
      ))}</div>
      <Eyebrow className="mt-5 text-[9px]">Notions</Eyebrow>
      <div className="mt-2 flex flex-wrap gap-2">{["Invisible zip · 55 cm", "Thread", "Interfacing · 0.3 m"].map((n) => <span key={n} className="chip">{n}</span>)}</div>
    </Screen>
  );
}

// P16 · ready to print
export function PrintReady() {
  const { go, draft } = useApp();
  const pieces = piecesFor(draft.garment);
  const { toast, node } = useToast();
  const [busy, setBusy] = useState(false);
  const pages = draft.printer === "A4" ? 17 : 1;
  return (
    <Screen>
      <TopBar left="back" eyebrow="Print pattern · 05" />
      <H1 className="mt-4">Ready to print</H1>
      <div className="mt-4 flex justify-center">
        <motion.div initial={{ rotate: -3, y: 10, opacity: 0 }} animate={{ rotate: -2, y: 0, opacity: 1 }} className="glass-2 relative h-[min(330px,38dvh)] w-[250px] rounded-[14px] p-4 shadow-2xl" style={GRID}>
          <div className="eyebrow text-[7px]">Page 1 · Mini map</div>
          <div className="mt-3 grid grid-cols-3 gap-2">{pieces.slice(0, 6).map((k) => <Piece key={k} k={k} width={62} />)}</div>
          <div className="absolute bottom-3 left-4 text-[7px] text-white/50">{garmentName(draft.garment).toUpperCase()} · {useApp.getState().body().name.toUpperCase()}</div>
        </motion.div>
      </div>
      <div className="mt-5 flex items-end gap-3"><span className="serif text-[56px] leading-none">{pages}</span><span className="eyebrow mb-2 text-[9px]">Pages · {pages - 1 || 1} tiles + map</span></div>
      <div className="mt-3 flex flex-wrap gap-2"><span className="chip">{draft.printer}</span><span className="chip">{draft.seam ? `${draft.seam} cm SA` : "No SA"}</span><span className="chip">{garmentName(draft.garment).split(" ")[0]}</span></div>
      <div className="mt-6 flex gap-3">
        <Pill className="flex-1" onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); go("pages"); }, 900); }}>{busy ? "Preparing…" : "Print PDF"}</Pill>
        <Pill variant="dark" className="flex-1" onClick={() => toast("PDF saved to Files")}>Save PDF</Pill>
      </div>
      {node}
    </Screen>
  );
}

// P17 · pages to print
const ROWS = ["A", "B", "C", "D"];
const DEFAULT_ON = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3", "D2"];
export function Pages() {
  const { go, replace, savePattern } = useApp();
  const [map, setMap] = useState(true);
  const [mode, setMode] = useState<"All pages" | "Custom">("Custom");
  const [on, setOn] = useState<string[]>(DEFAULT_ON);
  const [printing, setPrinting] = useState(0);
  const count = (mode === "All pages" ? 16 : on.length) + (map ? 1 : 0);
  const print = () => {
    setPrinting(0.01);
    const t0 = performance.now();
    const tick = (n: number) => { const k = Math.min(1, (n - t0) / 2600); setPrinting(k); if (k < 1) requestAnimationFrame(tick); else { savePattern("Printed"); replace("printed", { n: count }); } };
    requestAnimationFrame(tick);
  };
  return (
    <Screen footer={<Pill onClick={print}>Print {count} pages</Pill>}>
      <TopBar left="back" eyebrow="Print PDF" />
      <H1 className="mt-4">Pages to print</H1>
      <Glass className="mt-4 flex h-14 items-center gap-3 rounded-[18px] px-4"><Icon name="map" size={20} /><button className="flex-1 text-left text-[14px] font-medium" onClick={() => go("minimap")}>Include pattern mini map</button><Toggle on={map} onChange={setMap} /></Glass>
      <div className="glass mt-3 flex h-11 rounded-full p-1">{(["All pages", "Custom"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={cx("flex-1 rounded-full text-[13px] font-medium", mode === m ? "bg-white text-bg" : "text-white/70")}>{m}</button>)}</div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {ROWS.flatMap((r) => [1, 2, 3, 4].map((c) => {
          const id = r + c; const sel = mode === "All pages" || on.includes(id);
          return (
            <button key={id} onClick={() => { setMode("Custom"); setOn(sel ? on.filter((x) => x !== id) : [...on, id]); }} className={cx("tap relative aspect-[3/4] rounded-[12px] border text-left transition-colors", sel ? "border-primary bg-primary/25" : "border-white/12 bg-white/4")}>
              <span className="absolute left-2 top-1.5 text-[9px] text-white/60">{id}</span>
              {sel && <Icon name="check" size={14} className="absolute bottom-2 right-2 text-white/80" />}
            </button>
          );
        }))}
      </div>
      <div className="mt-4 flex items-end gap-2"><span className="serif text-[40px] leading-none">{String(count - (map ? 1 : 0)).padStart(2, "0")}/16</span><span className="eyebrow mb-1.5 text-[9px]">Tiles{map ? " + map" : ""}</span></div>
      <AnimatePresence>{printing > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-bg/85 backdrop-blur-md">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-bg"><Icon name="printer" size={34} /></div>
          <div className="serif mt-6 text-[56px] leading-none">{Math.max(1, Math.round(printing * count))}/{count}</div>
          <div className="mt-2 text-[14px] text-white/70">Sending pages to your printer…</div>
          <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-primary" style={{ width: `${printing * 100}%` }} /></div>
        </motion.div>)}</AnimatePresence>
    </Screen>
  );
}

// P18 · mini map
export function MiniMap() {
  const { back, draft } = useApp();
  const pieces = piecesFor(draft.garment);
  return (
    <Screen footer={<Pill variant="dark" onClick={back}>Back to print</Pill>}>
      <TopBar left="back" eyebrow="Page 1 of your print" />
      <H1 className="mt-4">Pattern mini map</H1>
      <Lead className="mt-2 text-[14px]">Tape each row first, then join the rows. Match the triangles.</Lead>
      <div className="relative mt-4 grid grid-cols-4 grid-rows-4 overflow-hidden rounded-[20px] border border-white/15" style={{ aspectRatio: "3 / 4" }}>
        {ROWS.flatMap((r) => [1, 2, 3, 4].map((c) => <div key={r + c} className="relative border border-dashed border-white/15"><span className="absolute left-1 top-0.5 text-[8px] text-white/45">{r + c}</span></div>))}
        <div className="absolute inset-0 grid grid-cols-3 place-items-center p-4">{pieces.map((k) => <Piece key={k} k={k} width={78} label={PIECE_LABEL[k]} />)}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2"><span className="chip"><Icon name="triangle" size={12} />Match triangles</span><span className="chip">— Trim 2 edges only</span><span className="chip">A1 Page code</span></div>
    </Screen>
  );
}

// P19 · after printing
export function Printed({ p }: { p?: Record<string, unknown> }) {
  const { home, go } = useApp();
  const n = Number(p?.n ?? 16);
  const { toast, node } = useToast();
  return (
    <Screen footer={<Pill onClick={home}>Back to home</Pill>} bg={<div className="absolute inset-0" style={{ background: "radial-gradient(90% 45% at 30% 0%, rgba(104,126,245,.5), transparent 70%)" }} />}>
      <TopBar left="close" onLeft={home} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="serif mt-6 text-[76px] leading-none">{n}/{n}</motion.div>
      <Eyebrow className="mt-2 text-[10px]">Pages printed</Eyebrow>
      <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight">Printed. Now the<br />fun part.</h1>
      <Glow color="#8c9cf8" variant="fade" className="mt-6 rounded-[26px] p-4">
        <div className="text-[16px] font-semibold">Support resources</div><div className="text-[12px] text-white/65">Help while you cut and sew.</div>
        <div className="mt-3 flex flex-col gap-1.5">{([["book", "Sewing guide for this dress"], ["layers", "Glossary · plain language"], ["video", "Video · taping tiled pages"]] as const).map(([ic, t]) => (
          <button key={t} onClick={() => toast("Opening " + t.split(" ·")[0].toLowerCase())} className="flex h-10 items-center gap-3 rounded-[12px] bg-black/20 px-3 text-left text-[12px]"><Icon name={ic} size={16} /><span className="flex-1">{t}</span><Icon name="chevR" size={14} /></button>
        ))}</div>
      </Glow>
      <Glass onClick={() => go("minimap")} className="mt-3 flex w-full items-center gap-3 rounded-[22px] p-4"><Icon name="map" size={20} /><div className="flex-1"><div className="text-[15px] font-semibold">View pattern mini map</div><div className="text-[12px] text-white/55">Where each piece sits on the pages</div></div></Glass>
      {node}
    </Screen>
  );
}
