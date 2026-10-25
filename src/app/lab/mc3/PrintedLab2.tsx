"use client";
// Lab (MC 3): "Your pattern is complete", round 2: three new ideas, each from what has just happened (a pattern printed on
// sheets of paper), beside Today. Every version has a clear View pattern map (the primary: the next thing anyone needs, to
// tape the sheets) and Back to home in words. The sheets everywhere are the real ones: the layout you arranged, cut into
// the A4 sheets it prints on (only the sheets a piece lands on), each showing the part of the pattern printed on it.
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon, type IconName } from "@/components/icons";
import { BodyFigure, PIECES, VentyLogo } from "@/components/art";
import { cx, NextButton, TextButton } from "@/components/ui";
import { useApp } from "@/lib/store";
import { FLUTTER, metresAt, notionsFor, templateBy, type PieceKey } from "@/lib/data";
import { draftSpec, piecesFor } from "@/screens/pattern";
import { COLS, ROWS, SHEET_H, SHEET_W, W_MM, H_MM, pack, pieceW, type At } from "@/screens/print";
import { Phone } from "./parts";
import { Today } from "./PrintedLab";

type V = "envelope" | "printer" | "tape";
const RATIO = SHEET_H / SHEET_W;

// ─── the pattern, the sheets it prints on, and what to buy, from the store's draft ───
export function useMade() {
  const { draft } = useApp();
  const body = useApp((s) => s.body());
  const pieces = piecesFor(draft.garment);
  const pos: At = (draft.layout?.garment === draft.garment ? draft.layout.at : undefined) ?? pack(pieces);
  // the sheets a piece lands on, from each piece's box (turned pieces swap their sides)
  const sheets = useMemo(() => {
    const on = new Set<string>();
    pieces.forEach((k) => {
      const p = PIECES[k], at = pos[k] ?? { x: 50, y: 50, r: 0 };
      let w = (pieceW(k) / 100) * W_MM, h = w * (p.h / p.w);
      if (Math.round(at.r / 90) % 2) [w, h] = [h, w];
      const cx = (at.x / 100) * W_MM, cy = (at.y / 100) * H_MM;
      for (let c = Math.max(0, Math.floor((cx - w / 2) / SHEET_W)); c <= Math.min(COLS - 1, Math.floor((cx + w / 2 - 1) / SHEET_W)); c++)
        for (let r = Math.max(0, Math.floor((cy - h / 2) / SHEET_H)); r <= Math.min(ROWS - 1, Math.floor((cy + h / 2 - 1) / SHEET_H)); r++) on.add(`${r}-${c}`);
    });
    return [...on].map((s) => s.split("-").map(Number) as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }, [pieces, pos]);
  const kind = draft.garment === "flutter" ? "dress" : ({ Dresses: "dress", Tops: "top", Pants: "trousers", Skirts: "skirt" } as const)[templateBy(draft.garment).category];
  return {
    draft, body, pieces, pos, sheets, kind,
    name: draft.garment === "flutter" ? "Flutter midi dress" : templateBy(draft.garment).name,
    metres: (w: number) => metresAt(draft.garment, draft.ease, w),
    stretch: draft.chosen?.stretch ? draft.stretch : undefined,
    extras: notionsFor(draft.details ?? FLUTTER.read, pieces),
  };
}

// the whole layout as printed (ink lines on white, the grainline in indigo), one sheet `cell` wide
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
// one printed sheet: white paper, the part of the pattern printed on it, the corner marks used to line sheets up
export function Sheet({ rc, cell, m, className, style }: { rc: [number, number]; cell: number; m: ReturnType<typeof useMade>; className?: string; style?: CSSProperties }) {
  const [r, c] = rc, h = cell * RATIO;
  return (
    <div className={cx("absolute overflow-hidden bg-white shadow-[0_6px_14px_-8px_rgb(18_19_28/.35),0_0_0_1px_rgb(18_19_28/.06)]", className)} style={{ width: cell, height: h, ...style }}>
      <div className="absolute" style={{ left: -c * cell, top: -r * h }}><LayoutInk pieces={m.pieces} pos={m.pos} cell={cell} /></div>
      {/* corner marks */}
      {[[3, 3], [cell - 9, 3], [3, h - 9], [cell - 9, h - 9]].map(([x, y], i) => <span key={i} className="absolute h-1.5 w-1.5 border-[#12131c]/25" style={{ left: x, top: y, borderLeftWidth: i % 2 ? 0 : 1, borderRightWidth: i % 2 ? 1 : 0, borderTopWidth: i < 2 ? 1 : 0, borderBottomWidth: i < 2 ? 0 : 1 }} />)}
    </div>
  );
}

// the page: paper, the content, then View pattern map and Back to home
export function Page({ children, top = true }: { children: ReactNode; top?: boolean }) {
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-6 noscroll" style={{ paddingTop: top ? "var(--top)" : 0 }}>{children}</div>
      <div className="shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}>
        <NextButton ready label="View pattern map" className="w-full" />
        <TextButton tone="paper">Back to home</TextButton>
      </div>
    </div>
  );
}
export const raised = "bg-white shadow-[0_6px_14px_-8px_rgb(18_19_28/.32),0_1px_2px_rgb(18_19_28/.08),inset_0_-1px_0_rgb(18_19_28/.06)]";
export const Title = ({ children, line }: { children: ReactNode; line: ReactNode }) => (
  <div className="text-center">
    <h1 className="h1 !text-[30px] text-[#12131c] [text-wrap:balance]">{children}</h1>
    <p className="lead mx-auto mt-2 max-w-[330px] [text-wrap:pretty]">{line}</p>
  </div>
);

// ─── A · The pattern envelope: sewing patterns come in an envelope, so this one does. The front: a Crown band with the
// mark, the garment on the body, its name, who it is drafted to and its facts. Turned over (it flips), the back is what a
// real envelope's back is: the fabric chart for each width, and what else you will need ───
function Envelope() {
  const m = useMade();
  const [back, setBack] = useState(false);
  const still = useReducedMotion();
  const face = "absolute inset-0 overflow-hidden rounded-[16px] bg-white [backface-visibility:hidden] shadow-[0_24px_40px_-24px_rgb(18_19_28/.55),0_2px_4px_rgb(18_19_28/.1)]";
  return (
    <Page>
      <p className="mt-2 text-center text-[15px] text-[#12131c]/60">All {m.sheets.length} sheets are printed</p>
      <div className="flex flex-1 flex-col items-center justify-center py-3" style={{ perspective: 1200 }}>
        <motion.button onClick={() => setBack((b) => !b)} aria-label={back ? "Turn to the front" : "Turn over: what to buy"}
          className="relative h-[372px] w-[288px] [transform-style:preserve-3d]" initial={false}
          animate={{ rotateY: back ? 180 : 0, rotate: back ? 1.5 : -2 }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}>
          {/* the front */}
          <div className={face}>
            <div className="violet-panel relative h-[104px] px-4 pt-4 text-left">
              <VentyLogo width={58} />
              <span className="absolute right-4 top-4 text-[12px] text-white/85">Made to measure</span>
              {/* the envelope's flap, folded down over the band */}
              <svg className="absolute inset-x-0 top-0 h-full w-full" viewBox="0 0 288 104" preserveAspectRatio="none" aria-hidden><path d="M0 0 L144 46 L288 0" fill="none" stroke="rgb(255 255 255 / .35)" strokeWidth="1" /></svg>
            </div>
            <div className="relative mx-auto h-[150px] w-[120px]"><BodyFigure sex={m.body.sex} width={90} variant="solid" garment={m.draft.garment} spec={draftSpec(m.draft)} glow={false} className="h-full w-full" /></div>
            <div className="px-4 text-center">
              <div className="h-serif !text-[22px] leading-tight text-[#12131c]">{m.name}</div>
              <div className="mt-1 text-[13px] text-[#12131c]/55">Drafted to {m.body.name || "your"} measurements</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 border-t border-[#12131c]/[.08] text-center">
              {[[String(m.pieces.length), "pieces"], ["A4", "paper"], [String(m.sheets.length), "sheets"]].map(([a, b], i) => (
                <div key={b} className={cx("py-2.5", i > 0 && "border-l border-[#12131c]/[.08]")}><div className="text-[16px] font-medium tabular-nums text-[#12131c]">{a}</div><div className="text-[12px] text-[#12131c]/50">{b}</div></div>
              ))}
            </div>
          </div>
          {/* the back: the fabric chart */}
          <div className={cx(face, "[transform:rotateY(180deg)] px-5 pt-5 text-left text-[#12131c]")}>
            <div className="text-[13px] text-[#12131c]/50">{m.name}</div>
            <div className="h-serif mt-0.5 !text-[22px] leading-tight">Fabric to buy</div>
            <table className="mt-3 w-full text-[14px]">
              <thead><tr className="text-[12px] text-[#12131c]/50"><th className="pb-1 text-left font-normal">Fabric width</th><th className="pb-1 text-right font-normal">You need</th></tr></thead>
              <tbody>{[115, 140, 150].map((w) => (
                <tr key={w} className="border-t border-[#12131c]/[.08]"><td className="py-2">{w} cm</td><td className="py-2 text-right font-medium tabular-nums">{m.metres(w)} m</td></tr>
              ))}</tbody>
            </table>
            <div className="mt-1 text-[13px] text-[#12131c]/55">{m.stretch === "A lot" ? "A stretchy fabric" : m.stretch === "No" ? "No stretch" : "A fabric with a little stretch"}</div>
            <div className="mt-3 border-t border-[#12131c]/[.08] pt-3 text-[12px] text-[#12131c]/50">You will also need</div>
            <ul className="mt-1 space-y-1 text-[14px] leading-snug">{m.extras.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#12131c]/40" />{t}</li>)}</ul>
          </div>
        </motion.button>
        <button onClick={() => setBack((b) => !b)} className={cx("mt-5 flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-[#12131c]/75", raised)}>
          <Icon name="rotate" size={16} />{back ? "Turn to the front" : "Turn over: what to buy"}
        </button>
      </div>
      <Title line={<>Now you can start making your {m.kind}.</>}>Your pattern is complete</Title>
      <div className="h-2" />
    </Page>
  );
}

// ─── B · Fresh from the printer: the printer's slot, the sheets sliding out of it one after another and fanning out, the
// map page on top. Each sheet is the real one, with its part of the pattern ───
function Printer() {
  const m = useMade();
  const still = useReducedMotion();
  const [run, setRun] = useState(0);
  const n = m.sheets.length, cell = 136;
  const guides: [IconName, string][] = [["layers", "What to buy"], ["video", "How to tape"], ["book", "Sewing guide"]];
  return (
    <Page>
      {/* the printer: its body raised in the card colour, lit from the top, the output slot pressed into it */}
      <div className="relative mt-3 shrink-0">
        <div className="pill-dark relative z-20 mx-auto flex h-[58px] items-end justify-center rounded-[22px] pb-3">
          <span className="ruler-track block h-[10px] w-[78%] rounded-full" />
          <button onClick={() => setRun((x) => x + 1)} aria-label="Print again (show it again)" className="absolute right-3 top-2.5 grid h-7 w-7 place-items-center rounded-full text-white/55"><Icon name="refresh" size={14} /></button>
        </div>
        {/* the sheets come out under the slot; above it they are hidden in the printer */}
        <div key={run} className="relative -mt-4 h-[330px] overflow-hidden" style={{ clipPath: "inset(0 -40px -40px -40px)" }}>
          {m.sheets.map((rc, i) => {
            const d = i - (n - 1) / 2;
            return (
              <motion.div key={rc.join()} className="absolute left-1/2 top-4" style={{ marginLeft: -cell / 2, zIndex: i }}
                initial={still ? false : { y: -cell * RATIO - 30, rotate: 0, x: 0 }} animate={{ y: 18 + Math.abs(d) * 3, rotate: d * 3.2, x: d * 13 }}
                transition={{ delay: 0.15 + i * 0.16, type: "spring", stiffness: 140, damping: 20 }}>
                <Sheet rc={rc} cell={cell} m={m} className="rounded-[3px]" style={{ position: "relative" }} />
              </motion.div>
            );
          })}
          {/* the map page, printed last, on top */}
          <motion.div className="absolute left-1/2 top-4 z-[99] bg-white p-2 shadow-[0_10px_20px_-10px_rgb(18_19_28/.45),0_0_0_1px_rgb(18_19_28/.06)]"
            style={{ marginLeft: -cell / 2, width: cell, height: cell * RATIO }}
            initial={still ? false : { y: -cell * RATIO - 30 }} animate={{ y: 30, rotate: -1 }} transition={{ delay: 0.25 + n * 0.16, type: "spring", stiffness: 140, damping: 20 }}>
            <div className="text-[8px] font-medium text-[#12131c]/70">Pattern map</div>
            <div className="relative mt-1 overflow-hidden" style={{ width: cell - 16, height: (cell - 16) * (H_MM / W_MM) }}>
              {Array.from({ length: ROWS * COLS }, (_, k) => <span key={k} className="absolute border border-dashed border-[#12131c]/15" style={{ left: `${(k % COLS) * 25}%`, top: `${Math.floor(k / COLS) * 25}%`, width: "25%", height: "25%" }} />)}
              <LayoutInk pieces={m.pieces} pos={m.pos} cell={(cell - 16) / COLS} />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="min-h-3 flex-1" />
      <Title line={<>{n} sheets and the map. Lay them out as the map shows, then tape them together.</>}>Your pattern is complete</Title>
      <div className="mt-4 grid grid-cols-3 gap-2">{guides.map(([ic, t]) => (
        <button key={t} className={cx("flex h-[60px] flex-col items-center justify-center gap-1 rounded-[18px] px-2 text-[13px] text-[#12131c]/75", raised)}><Icon name={ic} size={17} className="text-[#3c4b63]" />{t}</button>
      ))}</div>
      <div className="min-h-2 flex-1" />
    </Page>
  );
}

// ─── C · Tape it together: the sheets fly into place one after another, in the order to tape them, each numbered; then
// the tape goes on along the joins and the whole pattern shows. Show me again replays it ───
function Tape() {
  const m = useMade();
  const still = useReducedMotion();
  const [run, setRun] = useState(0);
  const [taped, setTaped] = useState(false);
  const rows = m.sheets.map(([r]) => r), cols = m.sheets.map(([, c]) => c);
  const r0 = Math.min(...rows), c0 = Math.min(...cols), nr = Math.max(...rows) - r0 + 1, nc = Math.max(...cols) - c0 + 1;
  const W = 300, H = 380;
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
  const total = 0.2 + m.sheets.length * 0.28 + 0.4;
  // the tape goes on once every sheet is down (at once, with reduced motion); Show me again takes it off first
  useEffect(() => {
    const t = setTimeout(() => setTaped(true), still ? 0 : total * 1000);
    return () => clearTimeout(t);
  }, [run, still, total]);
  const again = () => { setTaped(false); setRun((x) => x + 1); };
  return (
    <Page>
      {/* the table: a surface pressed into the paper */}
      <div className="relative mt-3 shrink-0 overflow-hidden rounded-[26px] bg-[#12131c]/[.045] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85)]" style={{ height: H + 40 }}>
        <div key={run} className="absolute left-1/2 top-1/2">
          {m.sheets.map(([r, c], i) => {
            const p = at(r, c);
            return (
              <motion.div key={`${r}-${c}`} className="absolute" style={{ left: p.x, top: p.y, zIndex: 10 + i }}
                initial={still ? false : { x: -p.x - cell / 2 + (i % 2 ? 8 : -8), y: gh / 2 + 60 - p.y, rotate: i % 2 ? 6 : -5, opacity: 0 }}
                animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.28, type: "spring", stiffness: 150, damping: 20 }}>
                <Sheet rc={[r, c]} cell={cell} m={m} style={{ position: "relative" }} />
                <motion.span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-[6px] bg-[#12131c]/[.06] text-[11px] font-medium tabular-nums text-[#12131c]/70 shadow-[inset_0_1px_2px_rgb(18_19_28/.14)]"
                  animate={{ opacity: taped ? 0 : 1 }} transition={{ duration: 0.4 }}>{i + 1}</motion.span>
              </motion.div>
            );
          })}
          {/* the tape, once every sheet is down */}
          {joins.map((j, i) => (
            <motion.span key={i} className="absolute z-50 rounded-[2px] bg-white/70 shadow-[0_1px_2px_rgb(18_19_28/.18)] backdrop-blur-[1px]"
              style={{ left: j.x, top: j.y, width: j.v ? 10 : 30, height: j.v ? 30 : 10, translate: "-50% -50%", rotate: `${(i % 3) - 1}deg` }}
              initial={false} animate={{ opacity: taped ? 1 : 0, scale: taped ? 1 : 0.6 }} transition={{ delay: taped ? i * 0.05 : 0, duration: 0.3 }} />
          ))}
        </div>
      </div>
      <button onClick={again} className={cx("mx-auto mt-3 flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-[#12131c]/70", raised)}><Icon name="refresh" size={14} />Show me again</button>
      <div className="min-h-4 flex-1" />
      <Title line={<>Tape the {m.sheets.length} sheets together in this order, then cut along the lines.</>}>Your pattern is complete</Title>
      <div className="min-h-2 flex-1" />
    </Page>
  );
}

const VERSIONS: { k: V; name: string; note: string }[] = [
  { k: "envelope", name: "A · The pattern envelope", note: "Sewing patterns come in an envelope, so yours does: a Crown band with the mark, the garment on your body, its name and facts. Turn it over and the back is the fabric chart for each width and what else you need, as on a real envelope." },
  { k: "printer", name: "B · Fresh from the printer", note: "The printer's slot, and the sheets sliding out of it one after another, fanning out, the map page last on top. Each sheet is the real one, with its part of your pattern. The refresh on the printer shows it again." },
  { k: "tape", name: "C · Tape it together", note: "The sheets fly into place on a table pressed into the paper, one after another in the order to tape them, numbered; then the tape goes on along the joins and the whole pattern shows. Show me again replays it." },
];

export function PrintedLab2() {
  const [v, setV] = useState<V>("envelope");
  return (
    <section>
      <h2 className="h1 !text-[34px]">Your pattern is complete, round 2</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">Three new ideas, each from what has just happened: a pattern printed on sheets of paper. Every one has View pattern map as its button, and Back to home in words.</p>
      <div className="mt-6 flex max-w-[720px] flex-col gap-3">
        <div className="flex flex-wrap gap-2">{VERSIONS.map((x) => (
          <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
        ))}</div>
        <p className="text-[15px] leading-snug text-white/65">{VERSIONS.find((x) => x.k === v)!.note}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        <Phone label={VERSIONS.find((x) => x.k === v)!.name}>{v === "envelope" ? <Envelope /> : v === "printer" ? <Printer /> : <Tape />}</Phone>
        <Phone label="Today"><Today /></Phone>
      </div>
    </section>
  );
}
