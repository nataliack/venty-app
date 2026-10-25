"use client";
// Lab (MC 3): "Your pattern is complete", round 3, from round 2's C (Tape it together), with Jose's notes. At the top, "All
// 13 sheets are printed" pressed into the paper with its tick on a raised knob (Body ready's build). Then three slides to
// drag, each on a surface pressed into the paper: the sheets flying into place and taped together (numbered on solid
// badges, Show me again inside the slide); a moment after the tape is on, the fabric to buy, said plainly (the metres for
// the fabric's width, also buy); and help while you sew (the only raised things, the three guides, each saying where it
// goes). Under them the pager from Add to home screen (a knob in a track pressed into the paper that follows the drag);
// then the title, View pattern map and Back to home.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon, type IconName } from "@/components/icons";
import { cx } from "@/components/ui";
import { Phone } from "./parts";
import { Printed, Today } from "./PrintedLab";
import { Page, Sheet, Title, raised, useMade } from "./PrintedLab2";

const SLIDE_H = 392, GAP = 12, AFTER = 2600, RATIO = 297 / 210;
const SLIDES = ["Tape it together", "Fabric to buy", "Help while you sew"];
// the pager: segments 34 wide; the knob is a segment less the 5px channel each side, the track its height plus 5 each side
const SEG = 34, CH = 5, KH = 12;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

// ─── slide 1: the sheets fly into place on a table pressed into the paper, one after another in the order to tape them,
// each on a solid numbered badge; then the tape goes on along the joins and the numbers go. Show me again replays it ───
function TapeTable({ m, run, taped, onAgain }: { m: ReturnType<typeof useMade>; run: number; taped: boolean; onAgain: () => void }) {
  const still = useReducedMotion();
  const rows = m.sheets.map(([r]) => r), cols = m.sheets.map(([, c]) => c);
  const r0 = Math.min(...rows), c0 = Math.min(...cols), nr = Math.max(...rows) - r0 + 1, nc = Math.max(...cols) - c0 + 1;
  const W = 305, H = SLIDE_H - 84;
  const cell = Math.floor(Math.min(W / nc, H / (nr * RATIO)));
  const gw = cell * nc, gh = cell * RATIO * nr;
  const at = (r: number, c: number) => ({ x: (c - c0) * cell - gw / 2, y: (r - r0) * cell * RATIO - gh / 2 });
  const on = new Set(m.sheets.map((s) => s.join("-")));
  const joins: { x: number; y: number; v: boolean }[] = [];
  m.sheets.forEach(([r, c]) => {
    const p = at(r, c);
    if (on.has(`${r}-${c + 1}`)) joins.push({ x: p.x + cell, y: p.y + (cell * RATIO) / 2, v: true });
    if (on.has(`${r + 1}-${c}`)) joins.push({ x: p.x + cell / 2, y: p.y + cell * RATIO, v: false });
  });
  return (
    <div className="relative h-full overflow-hidden rounded-[26px] bg-[#12131c]/[.045] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85)]">
      <div key={run} className="absolute left-1/2" style={{ top: 18 + H / 2 }}>
        {m.sheets.map(([r, c], i) => {
          const p = at(r, c);
          return (
            <motion.div key={`${r}-${c}`} className="absolute" style={{ left: p.x, top: p.y, zIndex: 10 + i }}
              initial={still ? false : { x: -p.x - cell / 2 + (i % 2 ? 8 : -8), y: gh / 2 + 60 - p.y, rotate: i % 2 ? 6 : -5, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.28, type: "spring", stiffness: 150, damping: 20 }}>
              <Sheet rc={[r, c]} cell={cell} m={m} style={{ position: "relative" }} />
              {/* the order to tape them, on a solid badge (nothing shows through it) */}
              <motion.span className="absolute left-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-[6px] bg-[#e9e7e2] px-1 text-[11px] font-medium tabular-nums text-[#12131c]/75 shadow-[inset_0_1px_2px_rgb(18_19_28/.18),0_1px_0_rgb(255_255_255/.9)]"
                animate={{ opacity: taped ? 0 : 1 }} transition={{ duration: 0.4 }}>{i + 1}</motion.span>
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

// a slide's surface: pressed into the paper, as the table is
const SURFACE = "relative flex h-full flex-col overflow-hidden rounded-[26px] bg-[#12131c]/[.045] px-[18px] pb-[18px] pt-5 text-[#12131c] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85)]";

// ─── slide 2: what to buy, said plainly for anyone. "Fabric to buy", the metres large, and a sentence saying what fabric to
// ask for; the switch says which question it answers (the shop's fabric may be another width), and the metres follow it;
// then "Also buy" and the extras as a plain list. Nothing here is raised: none of it is a button but the switch's knob ───
function Fabric({ m }: { m: ReturnType<typeof useMade> }) {
  const widths = [115, 140, 150];
  const [w, setW] = useState(140);
  const still = useReducedMotion();
  const at = widths.indexOf(w), seg = 72;
  const stretch = m.stretch === "A lot" ? "stretchy" : m.stretch === "No" ? "with no stretch" : "with a little stretch";
  return (
    <div className={SURFACE}>
      <h3 className="text-[17px] font-medium">Fabric to buy</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={w} className="serif text-[52px] leading-[.9]" initial={still ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }}>{m.metres(w)}</motion.span>
        </AnimatePresence>
        <span className="text-[18px]">metres</span>
      </div>
      <p className="mt-1.5 text-[15px] leading-snug text-[#12131c]/70">of fabric {w} cm wide, {stretch}.</p>
      <p className="mt-4 text-[14px] text-[#12131c]/55">Is the fabric at the shop another width?</p>
      {/* the fabric's width: a track pressed in, the knob raised, sliding to the width chosen */}
      <div className="relative mt-2 flex h-11 self-start rounded-full bg-[#12131c]/[.07] p-[5px] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85)]" role="radiogroup" aria-label="The fabric's width">
        <motion.span className={cx("absolute top-[5px] h-[34px] rounded-full", raised)} style={{ width: seg }} initial={false} animate={{ left: 5 + at * seg }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }} aria-hidden />
        {widths.map((x) => (
          <button key={x} role="radio" aria-checked={w === x} onClick={() => setW(x)} className={cx("relative z-10 h-[34px] text-[15px] transition-colors", w === x ? "font-medium text-[#12131c]" : "text-[#12131c]/50")} style={{ width: seg }}>{x} cm</button>
        ))}
      </div>
      <div className="mt-4 border-t border-[#12131c]/10 pt-3">
        <h3 className="text-[16px] font-medium">Also buy</h3>
        <ul className="mt-1.5 space-y-1.5">{m.extras.map((t) => (
          <li key={t} className="flex gap-2.5 text-[15px] leading-snug"><span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#12131c]/45" />{t}</li>
        ))}</ul>
      </div>
    </div>
  );
}

// ─── slide 3: help while you sew. The only raised things on the slides, as they are the only buttons: each a full row
// saying where it takes you ───
function Help({ m }: { m: ReturnType<typeof useMade> }) {
  const rows: [IconName, string, string][] = [
    ["video", "Video: taping the sheets", "Watch how, before you start"],
    ["book", `Sewing guide for this ${m.kind}`, "Every step, from cutting to the hem"],
    ["layers", "Sewing words, explained", "Grainline, notches, darts and more"],
  ];
  return (
    <div className={SURFACE}>
      <h3 className="text-[17px] font-medium">Help while you sew</h3>
      <p className="mt-1 text-[15px] leading-snug text-[#12131c]/60">Open any of these when you need it.</p>
      <div className="mt-4 flex flex-col gap-2.5">{rows.map(([ic, t, d]) => (
        <button key={t} className={cx("flex items-center gap-3 rounded-[18px] p-3 text-left", raised)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#12131c]/[.06] text-[#3c4b63] shadow-[inset_0_1px_2px_rgb(18_19_28/.14)]" aria-hidden><Icon name={ic} size={19} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[16px] leading-tight">{t}</span><span className="mt-0.5 block text-[14px] leading-snug text-[#12131c]/55">{d}</span></span>
          <Icon name="chevR" size={18} className="shrink-0 text-[#12131c]/35" />
        </button>
      ))}</div>
    </div>
  );
}

function Complete() {
  const m = useMade();
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0); // where the carousel is, in slides
  const [run, setRun] = useState(0);
  const [taped, setTaped] = useState(false);
  const touched = useRef(false), self = useRef(false);
  const step = () => (ref.current ? ref.current.clientWidth - 48 + GAP : 1); // a slide and the gap after it
  const go = (i: number) => { self.current = true; setTimeout(() => { self.current = false; }, 900); ref.current?.scrollTo({ left: i * step(), behavior: still ? "auto" : "smooth" }); };
  // the tape goes on once every sheet is down; a moment later the carousel moves on to the fabric, unless it was touched
  const total = 0.2 + m.sheets.length * 0.28 + 0.4;
  useEffect(() => {
    const t = setTimeout(() => setTaped(true), still ? 0 : total * 1000);
    return () => clearTimeout(t);
  }, [run, still, total]);
  useEffect(() => {
    if (!taped || touched.current) return;
    const t = setTimeout(() => { if (!touched.current) go(1); }, AFTER);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taped]);
  const again = () => { touched.current = true; setTaped(false); setRun((x) => x + 1); };
  const fc = Math.min(SLIDES.length - 1, Math.max(0, f)), i = Math.floor(fc), t = fc - i;
  const front = i + ease(clamp(t * 2)), back = i + ease(clamp(t * 2 - 1));
  return (
    <Page>
      <div className="mt-2 text-center"><Printed n={m.sheets.length} /></div>
      <div className="min-h-3 flex-1" />
      {/* two slides, dragged or moved on by themselves; each the column's width (the row's width less its 24px start
          padding, which the width is measured within, less the end's 24px), the last ending on the page's padding */}
      <div ref={ref} onScroll={(e) => { setF(e.currentTarget.scrollLeft / step()); if (!self.current) touched.current = true; }}
        onPointerDown={() => { touched.current = true; }} onWheel={() => { touched.current = true; }}
        className="-mx-6 flex shrink-0 snap-x snap-mandatory gap-3 overflow-x-auto pl-6 noscroll" style={{ scrollPaddingLeft: 24 }}>
        <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}><TapeTable m={m} run={run} taped={taped} onAgain={again} /></div>
        <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}><Fabric m={m} /></div>
        <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}><Help m={m} /></div>
        <span className="w-3 shrink-0" aria-hidden />
      </div>
      {/* the pager: a knob in a track pressed into the paper, following the drag */}
      <div className="relative mx-auto mt-3 shrink-0 rounded-full bg-[#12131c]/[.07] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)]"
        style={{ width: SEG * SLIDES.length, height: KH + 2 * CH }} role="tablist" aria-label="Slides">
        <span className="pill-white absolute rounded-full" aria-hidden style={{ background: "#f3f1ec", left: CH + back * SEG, top: CH, width: SEG - 2 * CH + (front - back) * SEG, height: KH }} />
        {SLIDES.map((s, n) => (
          <button key={s} role="tab" aria-selected={Math.round(fc) === n} aria-label={s} onClick={() => { touched.current = true; go(n); }} className="absolute top-0 h-full" style={{ left: n * SEG, width: SEG }} />
        ))}
      </div>
      <div className="min-h-3 flex-1" />
      <Title line={<>Now you can start making your {m.kind}.</>}>Your pattern is complete</Title>
      <div className="min-h-2 flex-1" />
    </Page>
  );
}

export function PrintedLab3() {
  const [k, setK] = useState(0);
  return (
    <section>
      <h2 className="h1 !text-[34px]">Your pattern is complete, round 3</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">From round 2&apos;s C (Tape it together), with your notes: the printed label pressed in at the top; a carousel you can drag, the taping first (solid number badges, Show me again inside it), then what to buy on the same light surface (the metres for each width, the extras, the three guides); the pager from Add to home screen under it.</p>
      <button onClick={() => setK((x) => x + 1)} className="mt-4 h-10 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/75 hover:text-white">Start again</button>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        <Phone label="Round 3"><Complete key={k} /></Phone>
        <Phone label="Today"><Today /></Phone>
      </div>
    </section>
  );
}
