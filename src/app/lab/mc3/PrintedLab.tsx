"use client";
// Lab (MC 3): "Your pattern is complete" (Printed in print.tsx) refined in the app's latest build, beside Today. The
// pattern map becomes a tray like the Pattern tab's (a raised snow rim round a pressed surface whose lines are the sheets,
// the pieces lying on it as white paper, no sheet codes); "All 9 sheets are printed" is pressed into the paper with its
// tick on a raised knob, as "Saved to your bodies" is on Body ready. Each version uses the store's draft, so it shows the
// pattern being made.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { PIECES } from "@/components/art";
import { Crown, cx, Pill } from "@/components/ui";
import { useApp } from "@/lib/store";
import { FLUTTER, notionsFor, templateBy, PIECE_LABEL, type GarmentKey } from "@/lib/data";
import { piecesFor } from "@/screens/pattern";
import { COLS, ROWS, H_MM, W_MM, MapBoard, fabricLine, otherWidths, pack, pieceW, sheetsUsed, type At } from "@/screens/print";
import { Phone } from "./parts";

type V = "ready" | "next" | "list";
const INK = "18 19 28";

// ─── the pattern map as a tray: the layout you arranged, on its sheets ───
const RIM = { background: "linear-gradient(180deg, #ffffff, #e7eaf3)", boxShadow: "0 18px 36px -16px rgb(0 0 0 / .55), 0 2px 4px rgb(0 0 0 / .22), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .2)" };
const SURFACE = { backgroundColor: "#eceef4", boxShadow: "inset 0 3px 8px rgb(28 36 84 / .26), inset 0 1px 2px rgb(28 36 84 / .26), inset 0 -1px 0 rgb(255 255 255 / .95)" };
const PAPER_SHADOW = "drop-shadow(0 1px 0 rgb(28 36 84 / .16)) drop-shadow(0 3px 2px rgb(28 36 84 / .2))";

function MapTray({ garment, at, className, rim = 7, radius = 20 }: { garment: GarmentKey; at?: At; className?: string; rim?: number; radius?: number }) {
  const pieces = piecesFor(garment);
  const pos = at ?? pack(pieces);
  const area = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [used, setUsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    const el = area.current; if (!el) return;
    const read = () => { const box = el.getBoundingClientRect(); if (box.width) setUsed(sheetsUsed(box, Object.values(refs.current).filter(Boolean).map((r) => r!.getBoundingClientRect()))); };
    const t = setTimeout(read, 200); const ro = new ResizeObserver(read); ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);
  return (
    <div className={cx("relative", className)} style={{ ...RIM, padding: rim, borderRadius: radius, aspectRatio: `${W_MM + 2 * rim * (W_MM / 300)} / ${H_MM + 2 * rim * (W_MM / 300)}` }}>
      <div ref={area} className="relative h-full w-full overflow-hidden" style={{ ...SURFACE, borderRadius: radius - rim }}>
        {/* the sheets: a line between each, the ones the pieces print on a touch deeper */}
        {Array.from({ length: ROWS * COLS }, (_, n) => {
          const row = Math.floor(n / COLS), col = n % COLS;
          return <div key={n} className={cx("absolute border transition-colors duration-300", used.has(`${row}-${col}`) ? "border-[#12131c]/[.14] bg-[#12131c]/[.035]" : "border-dashed border-[#12131c]/[.08]")}
            style={{ left: `${(col / COLS) * 100}%`, top: `${(row / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` }} />;
        })}
        {pieces.map((k) => {
          const p = PIECES[k], [x1, y1, x2, y2] = p.grain;
          return (
            <div key={k} ref={(el) => { refs.current[k] = el; }} className="absolute" style={{ left: `${pos[k]?.x ?? 50}%`, top: `${pos[k]?.y ?? 50}%`, width: `${pieceW(k)}%`, translate: "-50% -50%", rotate: `${pos[k]?.r ?? 0}deg`, filter: PAPER_SHADOW }}>
              <svg viewBox={`0 0 ${p.w} ${p.h}`} className="block h-auto w-full overflow-visible" aria-label={PIECE_LABEL[k]}>
                <path d={p.d} fill="#fff" stroke="#8a93ad" strokeWidth="1.6" strokeLinejoin="round" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#687ef5" strokeWidth="1.4" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// "All 9 sheets are printed": a squarish label pressed into the paper, the tick on a small raised knob (Body ready's build)
export function Printed({ n }: { n: number }) {
  return (
    <span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75"
      style={{ background: `rgb(${INK} / .045)`, boxShadow: `inset 0 2px 5px rgb(${INK} / .16), inset 0 1px 1.5px rgb(${INK} / .18), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9)` }}>
      <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-white" style={{ background: "linear-gradient(180deg, #2e3040, #1a1c28)", boxShadow: "0 2px 4px rgb(0 0 0 / .28), 0 1px 1px rgb(0 0 0 / .3), inset 0 1px 0 rgb(255 255 255 / .22)" }}><Icon name="check" size={12} strokeWidth={3} /></span>
      {n === 1 ? "Your sheet is printed" : `All ${n} sheets are printed`}
    </span>
  );
}
// pressed into the paper (a card's floor), and raised off it (white, lit from the top)
const pressed = `bg-[#12131c]/[.045] shadow-[inset_0_2px_5px_rgb(18_19_28/.16),inset_0_1px_1.5px_rgb(18_19_28/.18),inset_0_-1px_0_rgb(255_255_255/.9),0_1px_0_rgb(255_255_255/.9)]`;
// raised off the paper: white, lit from the top, a neutral shadow (not the snow of the dark pages, which reads icy here)
const raised = "bg-white shadow-[0_6px_14px_-8px_rgb(18_19_28/.32),0_1px_2px_rgb(18_19_28/.08),inset_0_-1px_0_rgb(18_19_28/.06)]";
const Tile = ({ icon }: { icon: IconName }) => (
  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#12131c]/[.06] text-[#3c4b63] shadow-[inset_0_1px_2px_rgb(18_19_28/.14)]" aria-hidden><Icon name={icon} size={17} /></span>
);

// the app's paper moment on a phone (PaperScreen's phone layout), with the art panel's height given
function Paper({ art, artH, children, footer }: { art: ReactNode; artH: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <div className="relative shrink-0 overflow-hidden rounded-b-[32px] text-white" style={{ height: artH }}><Crown />{art}</div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-5 noscroll"><div className="flex min-h-full flex-col">{children}</div></div>
      <div className="shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}>{footer}</div>
    </div>
  );
}
// the night card with the tray on it and the pattern's name on a white tag (Body ready's build)
const NightTray = ({ garment, at, name }: { garment: GarmentKey; at?: At; name: string }) => (
  <>
    <div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
    <div className="absolute inset-x-0 bottom-14 top-0 flex items-center justify-center px-10" style={{ paddingTop: "calc(var(--top) + 8px)" }}>
      <MapTray garment={garment} at={at} className="h-full max-w-full" />
    </div>
    <div className="absolute inset-x-6 bottom-4 flex justify-center"><span className="max-w-full truncate rounded-[12px] bg-white px-3.5 py-2 text-[14px] font-medium text-[#12131c]">{name}</span></div>
  </>
);

function useMade() {
  const { draft } = useApp();
  const kind = draft.garment === "flutter" ? "dress" : ({ Dresses: "dress", Tops: "top", Pants: "trousers", Skirts: "skirt" } as const)[templateBy(draft.garment).category];
  const name = draft.garment === "flutter" ? "Flutter midi dress" : templateBy(draft.garment).name;
  return {
    garment: draft.garment, kind, name,
    at: draft.layout?.garment === draft.garment ? draft.layout.at : undefined,
    fabric: fabricLine(draft.garment, draft.ease, draft.chosen?.stretch ? draft.stretch : undefined),
    widths: otherWidths(draft.garment, draft.ease),
    extras: notionsFor(draft.details ?? FLUTTER.read, piecesFor(draft.garment)),
  };
}
const GUIDES = (kind: string): [IconName, string, string][] => [["book", "Sewing guide", `for this ${kind}`], ["layers", "Sewing words", "explained"], ["video", "Video", "taping the sheets"]];

// ─── Today ───
export function Today() {
  const m = useMade();
  return (
    <Paper artH="46%" footer={<Pill>Back to home</Pill>}
      art={<div className="absolute inset-0 flex flex-col items-center px-6 pb-4" style={{ paddingTop: "calc(var(--top) + 10px)" }}>
        <div className="flex min-h-0 w-full flex-1 justify-center"><MapBoard garment={m.garment} printer="A4" at={m.at} className="h-full !w-auto shadow-[0_20px_50px_-24px_rgb(11_12_21/.8)]" /></div>
        <span className="mt-3 flex items-center gap-1.5 text-[14px] text-white/90">Your pattern map<Icon name="chevR" size={15} /></span>
      </div>}>
      <div className="my-auto py-2">
        <div className="flex items-center gap-2 text-[15px] text-[#12131c]/70"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#12131c] text-white"><Icon name="check" size={12} strokeWidth={3} /></span>All 9 sheets are printed</div>
        <h1 className="h1 mt-3 !text-[32px] text-[#12131c]">Your pattern is complete</h1>
        <p className="lead mt-2">Now you can start making your {m.kind}.</p>
        <div className="mt-4 border-t border-[#12131c]/10 pt-3">
          <div className="text-[14px] text-[#12131c]/55">Fabric to buy</div>
          <div className="mt-0.5 text-[16px]">{m.fabric}</div>
          <div className="mt-1 text-[14px] leading-snug text-[#12131c]/60">{m.widths}</div>
          <div className="mt-2.5 text-[14px] text-[#12131c]/55">You will also need</div>
          <div className="mt-0.5 text-[15px] leading-snug">{m.extras.join(" · ")}</div>
        </div>
        <div className="mt-4 flex flex-col gap-2">{GUIDES(m.kind).map(([ic, t, d]) => (
          <span key={t} className="paper-card flex min-h-[54px] items-center gap-3 rounded-[16px] px-4 text-[16px]"><Icon name={ic} size={19} className="text-[#3c4b63]" /><span className="flex-1">{t} {d}</span><Icon name="chevR" size={18} className="text-[#12131c]/35" /></span>
        ))}</div>
      </div>
    </Paper>
  );
}

// ─── A · Like Body ready: the tray on a night card, the label and title centred, the shopping list pressed in, the guides
// as three raised tiles ───
function LikeReady() {
  const m = useMade();
  return (
    <Paper artH="31%" art={<NightTray garment={m.garment} at={m.at} name={m.name} />} footer={<Pill>Back to home</Pill>}>
      <div className="text-center">
        <Printed n={9} />
        <h1 className="h1 mt-3 !text-[30px] text-[#12131c] [text-wrap:balance]">Your pattern is complete</h1>
        <p className="lead mt-2">Now you can start making your {m.kind}.</p>
      </div>
      <div className="flex-1" />
      <div className={cx("mt-5 rounded-[22px] p-1.5", pressed)}>
        <div className="flex items-start gap-3 p-2.5"><Tile icon="ruler" /><span className="min-w-0 flex-1"><span className="block text-[13px] text-[#12131c]/55">Fabric to buy</span><span className="block text-[15px] leading-snug">{m.fabric}</span><span className="mt-0.5 block text-[13px] leading-snug text-[#12131c]/55">{m.widths}</span></span></div>
        <div className="mx-2.5 h-px bg-[#12131c]/[.08]" />
        <div className="flex items-start gap-3 p-2.5"><Tile icon="scissors" /><span className="min-w-0 flex-1"><span className="block text-[13px] text-[#12131c]/55">You will also need</span><span className="block text-[15px] leading-snug">{m.extras.join(" · ")}</span></span></div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">{GUIDES(m.kind).map(([ic, t, d]) => (
        <button key={t} className={cx("flex flex-col items-center gap-1.5 rounded-[18px] px-2 py-3 text-center", raised)}><Icon name={ic} size={19} className="text-[#3c4b63]" /><span className="text-[13px] leading-tight">{t}<span className="block text-[12px] text-[#12131c]/50">{d}</span></span></button>
      ))}</div>
      <div className="flex-1" />
    </Paper>
  );
}

// ─── B · What's next: the tray on a night card, then the four things to do, in order, numbered, pressed into the paper ───
function WhatsNext() {
  const m = useMade();
  const steps: { t: string; d: string; go?: boolean }[] = [
    { t: "Buy your fabric", d: m.fabric },
    { t: "Get the extras", d: m.extras.join(" · ") },
    { t: "Tape the sheets together", d: "Watch how, step by step", go: true },
    { t: `Sew your ${m.kind}`, d: `The sewing guide for this ${m.kind}`, go: true },
  ];
  return (
    <Paper artH="31%" art={<NightTray garment={m.garment} at={m.at} name={m.name} />} footer={<Pill>Back to home</Pill>}>
      <div className="text-center">
        <Printed n={9} />
        <h1 className="h1 mt-4 !text-[30px] text-[#12131c] [text-wrap:balance]">Your pattern is complete</h1>
      </div>
      <div className="flex-1" />
      <p className="mt-4 text-center text-[15px] text-[#12131c]/60">What&apos;s next</p>
      <ol className={cx("mt-2.5 rounded-[22px] p-1.5", pressed)}>
        {steps.map((s, i) => (
          <li key={s.t} className={cx("flex items-center gap-3 rounded-[16px] p-2.5", s.go && "cursor-pointer")}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#12131c]/[.06] text-[15px] font-medium leading-none tabular-nums text-[#12131c]/75 shadow-[inset_0_1px_2px_rgb(18_19_28/.12)]">{i + 1}</span>
            <span className="min-w-0 flex-1"><span className="block text-[16px] leading-tight">{s.t}</span><span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-[#12131c]/55">{s.d}</span></span>
            {s.go && <Icon name="chevR" size={18} className="shrink-0 text-[#12131c]/35" />}
          </li>
        ))}
      </ol>
      <div className="flex-1" />
    </Paper>
  );
}

// ─── C · Shopping list: the tray on the paper itself; a raised receipt with boxes to tick as you buy; the guides as three
// round buttons ───
function ShoppingList() {
  const m = useMade();
  const items = [m.fabric, ...m.extras];
  const [got, setGot] = useState<Set<number>>(new Set());
  const flip = (i: number) => setGot((o) => { const n = new Set(o); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 noscroll" style={{ paddingTop: "calc(var(--top) + 8px)" }}>
        <div className="mx-auto h-[220px] max-w-full"><MapTray garment={m.garment} at={m.at} className="h-full max-w-full" rim={8} radius={22} /></div>
        <div className="mt-5 text-center">
          <Printed n={9} />
          <h1 className="h1 mt-3 !text-[30px] text-[#12131c] [text-wrap:balance]">Your pattern is complete</h1>
        </div>
        <div className="min-h-4 flex-1" />
        {/* the receipt: raised white paper, its top edge a row of ruler ticks */}
        <div className="relative mt-4 overflow-hidden rounded-[20px] bg-white px-4 pb-3 pt-5 shadow-[0_14px_28px_-18px_rgb(28_34_82/.55),0_1px_2px_rgb(18_19_28/.08),inset_0_0_0_1px_rgb(18_19_28/.04)]">
          <span className="absolute inset-x-0 top-0 h-2.5" aria-hidden style={{ backgroundImage: "linear-gradient(90deg, rgb(18 19 28 / .22) 1px, transparent 1px), linear-gradient(90deg, rgb(18 19 28 / .12) 1px, transparent 1px)", backgroundSize: "45px 10px, 9px 5px", backgroundRepeat: "repeat-x", backgroundPosition: "12px 0, 12px 0" }} />
          <div className="flex items-baseline justify-between"><span className="text-[15px] font-medium">To buy</span><span className="text-[13px] text-[#12131c]/50">{got.size} of {items.length}</span></div>
          <ul className="mt-1.5">
            {items.map((t, i) => (
              <li key={t}>
                <button onClick={() => flip(i)} aria-pressed={got.has(i)} className="flex w-full items-start gap-3 py-1.5 text-left">
                  <span className={cx("mt-px grid h-5 w-5 shrink-0 place-items-center rounded-[6px] transition-colors", got.has(i) ? "bg-[#1f2130] text-white shadow-[0_2px_3px_rgb(0_0_0/.25),inset_0_1px_0_rgb(255_255_255/.2)]" : "bg-[#12131c]/[.05] shadow-[inset_0_1px_2px_rgb(18_19_28/.2)]")}>{got.has(i) && <Icon name="check" size={11} strokeWidth={3} />}</span>
                  <span className={cx("text-[15px] leading-snug transition-colors", got.has(i) && "text-[#12131c]/40 line-through")}>{t}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">{GUIDES(m.kind).map(([ic, t]) => (
          <button key={t} className="flex flex-col items-center gap-1.5 text-[13px] text-[#12131c]/70"><span className={cx("grid h-12 w-12 place-items-center rounded-full", raised)}><Icon name={ic} size={19} className="text-[#3c4b63]" /></span>{t}</button>
        ))}</div>
        <div className="min-h-4 flex-1" />
      </div>
      <div className="shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}><Pill>Back to home</Pill></div>
    </div>
  );
}

const VERSIONS: { k: V; name: string; note: string }[] = [
  { k: "ready", name: "A · Like Body ready", note: "The night card of Body ready with your layout on a tray and the pattern's name on its tag; the label pressed in, the title centred; fabric and extras in one pressed card; the guides as three raised tiles." },
  { k: "next", name: "B · What's next", note: "The same top, then what to do now, in order: buy the fabric, get the extras, tape the sheets, sew it. The last two open the video and the guide." },
  { k: "list", name: "C · Shopping list", note: "The tray on the paper itself (no night card); a raised receipt with a ruler edge and boxes to tick as you buy; the guides as three round buttons." },
];

export function PrintedLab() {
  const [v, setV] = useState<V>("ready");
  return (
    <section>
      <h2 className="h1 !text-[34px]">Your pattern is complete</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">Refined in the app&apos;s latest build: the pattern map as a tray like the Pattern tab&apos;s (the sheets as its lines, the pieces as paper, no sheet codes), and &ldquo;All 9 sheets are printed&rdquo; pressed into the paper as on Body ready.</p>
      <div className="mt-6 flex max-w-[720px] flex-col gap-3">
        <div className="flex flex-wrap gap-2">{VERSIONS.map((x) => (
          <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
        ))}</div>
        <p className="text-[15px] leading-snug text-white/65">{VERSIONS.find((x) => x.k === v)!.note}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        <Phone label={VERSIONS.find((x) => x.k === v)!.name}>{v === "ready" ? <LikeReady /> : v === "next" ? <WhatsNext /> : <ShoppingList />}</Phone>
        <Phone label="Today"><Today /></Phone>
      </div>
    </section>
  );
}
