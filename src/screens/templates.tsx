"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { TEMPLATES, LEVELS, templateBy, templateDetails, kindOf, lengthCmFor, type Category, type GarmentKey } from "@/lib/data";
import { Screen, TopBar, TopAction, Eyebrow, H1, HS, Lead, Pill, Glow, Glass, Chip, Check, Segmented, Sheet, SheetHead, cx, useToast } from "@/components/ui";
import { Split, useDesk } from "@/components/ui";
import { BodyFigure, Flat, Piece } from "@/components/art";
import { Icon } from "@/components/icons";
import { draftSpec } from "./pattern";
import { useKeyboard } from "./studio";
import { LOOK, CAT, KINDS, byKind, LEVELS_, PIECES_, piecesIn, Img, Lvl, Frame, MadeMark, KindTiles, PressedPhoto, PINNED, pinIn, ToolBtn, SearchOpen, OnChips, Group, SheetFooter } from "./library";

// Card: the flat drawing, the name, and one quiet line (level · pieces). Hover only lifts the edge.
export function TplCard({ t, desk, onClick }: { t: (typeof TEMPLATES)[number]; desk: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx("card-soft tap flex w-full flex-col overflow-hidden text-left transition-transform duration-300 ease-out lg:hover:-translate-y-1", desk ? "h-[min(420px,52dvh)] rounded-[30px] p-6" : "h-[236px] rounded-[24px] p-4")}>
      <div className="grid min-h-0 flex-1 place-items-center"><Flat g={t.key} size={desk ? 170 : 96} className="max-h-full" /></div>
      <div className="mt-2 shrink-0">
        <div className={cx("font-medium leading-tight", desk ? "text-[20px]" : "text-[17px]")}>{t.name}</div>
        <div className={cx("mt-1 flex items-center gap-2 text-white/60", desk ? "text-[15px]" : "text-[14px]")}><Level n={LEVELS.indexOf(t.level) + 1} /><span className="truncate">{t.level} · {t.pieces} pieces</span></div>
      </div>
    </button>
  );
}
// difficulty as three small bars, like the bars on a pattern envelope
const Level = ({ n }: { n: number }) => <span className="flex items-end gap-[2px]" aria-hidden>{[1, 2, 3].map((k) => <span key={k} className={cx("w-[3px] rounded-full", k <= n ? "bg-peri" : "bg-white/20")} style={{ height: 4 + k * 3 }} />)}</span>;


// Patterns to make (25 Oct 2026, "Shelf", chosen in the lab /lab/mc2): the page "Start from a pattern" opens, in the
// pattern library's build. Back, then the title with Search and Filter (level, pieces) beside it; the kinds as pressed
// photo tiles; one grid of dark trays. Scrolled past the kinds (phones), they are pinned to the top as pills. Request a
// pattern is not a pattern, so it is never a card: one quiet line under the grid (and under "No patterns match"),
// opening a sheet with one box to type in. That sheet rises above the iPhone keyboard (useKeyboard), so the box and
// Send stay in view while typing.
export function Templates({ p }: { p?: Record<string, unknown> }) {
  const { go, patterns } = useApp();
  const desk = useDesk();
  const picked = !!p?.picked; // came with a body already chosen
  const [cat, setCat] = useState(p?.cat ? CAT[p.cat as Category] : "All");
  const [q, setQ] = useState("");
  const [lv, setLv] = useState<string[]>([]);
  const [pc, setPc] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [sheet, setSheet] = useState<null | "filter" | "request">(null);
  const { toast, node } = useToast();
  const list = TEMPLATES.filter((t) => byKind(cat).includes(t) && (!lv.length || lv.includes(t.level)) && (!pc.length || pc.some((x) => piecesIn(t.pieces, x))) && (!q.trim() || t.name.toLowerCase().includes(q.trim().toLowerCase())));
  const on = [...lv.map((x) => ({ k: x, off: () => setLv(lv.filter((y) => y !== x)) })), ...pc.map((x) => ({ k: `${x} pieces`, off: () => setPc(pc.filter((y) => y !== x)) }))];
  const clear = () => { setLv([]); setPc([]); };
  const open = (key: GarmentKey) => go("template", { key, picked });
  const madeOf = (g: GarmentKey) => patterns.find((x) => x.garment === g);

  // the kinds pinned once scrolled past (phones), found from the screen's own scroller
  const anchor = useRef<HTMLDivElement>(null);
  const kinds = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState(false);
  useEffect(() => {
    const sc = anchor.current?.closest(".scroller");
    if (!sc || desk) { setBar(false); return; }
    const check = () => { const k = kinds.current?.getBoundingClientRect(); setBar(!!k && k.bottom - sc.getBoundingClientRect().top < 60); };
    check();
    sc.addEventListener("scroll", check, { passive: true });
    return () => sc.removeEventListener("scroll", check);
  }, [desk]);
  const pinned = (
    <AnimatePresence>
      {bar && (
        <motion.div key="kinds" {...pinIn} className={PINNED} style={{ paddingTop: "var(--top)" }}>
          <div className="noscroll flex gap-2 overflow-x-auto px-6">
            {KINDS.map((x) => (
              <button key={x} onClick={() => setCat(x)} className={cx("flex h-10 shrink-0 items-center gap-2 rounded-full pl-[5px] pr-4 text-[14px] transition-colors", x === cat ? "bg-snow font-medium text-ink" : "bg-card text-white/75")}>
                <PressedPhoto k={x} size={30} r={15} light={x === cat} />{x}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const requestLine = (cls?: string) => (
    <p className={cx("text-center text-[15px] text-white/50", cls)}>Can’t find what you’re after? <button onClick={() => setSheet("request")} className="font-medium text-peri">Request a pattern</button></p>
  );
  return (
    <Screen noPad wide={desk} bg={pinned}>
      <div ref={anchor} className="px-6 lg:px-0">
        <TopBar left="back" />
        <div className="mt-3">
          {searching ? <SearchOpen q={q} setQ={setQ} placeholder="Search patterns" onCancel={() => { setSearching(false); setQ(""); }} /> : (
            <div className="flex min-h-11 items-center justify-between gap-3">
              <H1 className="min-w-0">Patterns to make</H1>
              <span className="flex shrink-0 items-center gap-2">
                <ToolBtn icon="search" label="Search" onClick={() => setSearching(true)} />
                <ToolBtn icon="sliders" label="Filter" n={on.length} onClick={() => setSheet("filter")} />
              </span>
            </div>
          )}
        </div>
        <Lead className="mt-2">Choose a style, then fit it to your body.</Lead>
      </div>
      <div ref={kinds} className="mt-5"><KindTiles value={cat} onChange={setCat} /></div>
      <OnChips items={on} onClear={clear} />
      {list.length ? (
        <>
          <div className="mt-5 grid grid-cols-2 items-start gap-x-3 gap-y-4 px-6 sm:grid-cols-3 lg:grid-cols-5 lg:px-0">
            {list.map((t) => <Frame key={t.key} imgH={206} pic={<><Img src={LOOK[t.key]} /><MadeMark made={madeOf(t.key)} /></>} name={t.name} line={<Lvl t={t} />} onClick={() => open(t.key)} />)}
          </div>
          {requestLine("mt-8 px-6")}
        </>
      ) : (
        <div className="mt-10 px-6 text-center">
          <p className="text-[17px]">No patterns match</p>
          <button onClick={() => { setQ(""); clear(); setCat("All"); }} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
          {requestLine("mt-6")}
        </div>
      )}
      <div className="h-6" />
      <Sheet open={sheet === "filter"} onClose={() => setSheet(null)}>
        <SheetHead title="Filter" />
        <Group title="Level" items={LEVELS_} value={lv} onChange={setLv} />
        <Group title="Pieces" items={PIECES_} value={pc} onChange={setPc} />
        <SheetFooter n={list.length} canClear={on.length > 0} onClear={clear} onShow={() => setSheet(null)} />
      </Sheet>
      <RequestSheet open={sheet === "request"} onClose={() => setSheet(null)} onSent={() => { setSheet(null); toast("Thanks, your request is in"); }} />
      {node}
    </Screen>
  );
}

// Request a pattern: one box to type in and Send, faded until something is typed (tapping it empty puts you in the
// box). On an iPhone the keyboard lies over the page, so the sheet rises by what it covers and the box and Send stay
// above it (Android resizes the page itself, so there the sheet simply stays at the bottom). The box can be scrolled
// and selected in without dragging the sheet down.
function RequestSheet({ open, onClose, onSent }: { open: boolean; onClose: () => void; onSent: () => void }) {
  const [text, setText] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  const kb = useKeyboard(open);
  const lift = kb.open ? Math.max(0, window.innerHeight - kb.top - kb.height) : 0;
  useEffect(() => {
    const el = box.current; if (!el) return;
    const stop = (e: PointerEvent) => e.stopPropagation();
    el.addEventListener("pointerdown", stop);
    return () => el.removeEventListener("pointerdown", stop);
  }, [open]);
  const ready = text.trim().length > 0;
  const send = () => { if (!ready) { box.current?.focus(); return; } box.current?.blur(); setText(""); onSent(); };
  return (
    <Sheet open={open} onClose={() => { box.current?.blur(); onClose(); }} lift={lift}>
      <SheetHead title="Request a pattern">Tell us what you’d like to make.</SheetHead>
      {/* pressed into the sheet like the search field; empty, with a hint of what to write. 16px, so iOS never zooms */}
      <textarea ref={box} value={text} onChange={(e) => setText(e.target.value)} rows={4} enterKeyHint="send" aria-label="Your request" placeholder="A wrap top with puff sleeves, for a beginner"
        className="ruler-track mt-5 block w-full resize-none rounded-[20px] px-4 py-3.5 text-[16px] leading-snug text-white outline-none placeholder:text-white/35" />
      <Pill className={cx("mt-5", !ready && "is-off")} onClick={send}>Send request</Pill>
    </Sheet>
  );
}

export function TemplateDetail({ p }: { p?: Record<string, unknown> }) {
  const { go, newDraft, draft, bodies } = useApp();
  const t = templateBy((p?.key as GarmentKey) ?? "slip");
  const picked = !!p?.picked && !!draft.bodyId;
  const forName = bodies.find((x) => x.id === draft.bodyId)?.name.split(",")[0];
  const [len, setLen] = useState(t.defaultLength);
  const desk = useDesk();
  return (
    <Screen footer={<Pill onClick={() => { newDraft({ garment: t.key, source: "template", length: len, kind: kindOf(t.key), details: templateDetails(t.key, len), lengthCm: lengthCmFor(kindOf(t.key), len), ...(picked ? { bodyId: draft.bodyId } : {}) }); go(picked ? "tplFit" : "tplBody"); }}>{picked && forName ? `Fit to ${forName}` : "Fit to a body"}</Pill>}>
      <TopBar left="back" eyebrow={t.category} />
      <Split left={
      <Glow color={t.color} variant="edge" className="mt-3 flex h-[min(330px,38dvh)] justify-center rounded-[30px] lg:mt-0 lg:h-[min(620px,70dvh)] lg:rounded-[40px]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full py-4"><BodyFigure width={desk ? 200 : 120} variant="solid" glow={false} spec={{ kind: kindOf(t.key), details: templateDetails(t.key, len), ease: 4, lengthCm: lengthCmFor(kindOf(t.key), len) }} className="h-full w-auto" /></motion.div>
      </Glow>} right={<>
      <HS className="mt-5 text-[46px] lg:mt-0 lg:text-[72px]">{t.name}</HS>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{[`${t.pieces} pieces`, t.tag].map((c) => <span key={c} className="text-[15px] text-white/60">{c}</span>)}</div>
      <p className="mt-4 text-[15px] leading-relaxed text-white/60 lg:max-w-[460px] lg:text-[16px]">{t.blurb}</p>
      <Eyebrow className="mt-5">Length</Eyebrow>
      <div className="mt-2 flex gap-2">{t.lengths.map((l) => <Chip key={l} on={l === len} onClick={() => setLen(l)}>{l}</Chip>)}</div>
      <div className="hidden lg:block">
        <Eyebrow className="mt-8">Pattern pieces</Eyebrow>
        <div className="mt-3 flex flex-wrap items-end gap-4">{t.pieceSet.map((k) => <div key={k} className="glass grid h-[110px] w-[92px] place-items-center rounded-[16px]"><Piece k={k} width={60} /></div>)}</div>
      </div>
      </>} />
    </Screen>
  );
}

export function TplBody() {
  const { go, bodies, activeBody, set, setDraft, draft, newBody, startBody } = useApp();
  const t = templateBy(draft.garment);
  const [sel, setSel] = useState(activeBody);
  const b = bodies.find((x) => x.id === sel) ?? bodies[0];
  return (
    <Screen footer={<Pill onClick={() => { set({ activeBody: b.id }); setDraft({ bodyId: b.id }); go("tplFit"); }}>Fit {t.name.toLowerCase()} to {b.name.split(",")[0]}</Pill>}>
      <TopBar left="back" eyebrow={`${t.name} · Fit to`} />
      <Split left={<>
      <HS className="mt-4 lg:mt-0">Who is this for?</HS>
      <Lead className="mt-2 text-[15px]">We’ll grade the pattern to this body’s measurements.</Lead>
      <div className="mt-10 hidden lg:block"><Flat g={t.key} size={180} /></div>
      </>} right={
      <div className="mt-5 flex flex-col gap-2.5 lg:mt-0 lg:gap-3">
        {bodies.map((x) => (
          <Glass key={x.id} onClick={() => setSel(x.id)} selected={x.id === sel} className="flex h-[84px] w-full items-center gap-4 rounded-[24px] px-4 lg:h-[100px] lg:px-6">
            <BodyFigure sex={x.sex} width={26} glow={false} />
            <div className="flex-1"><div className="text-[16px] font-semibold">{x.name}</div><div className="text-[14px] text-white/55">{x.done.length} of 24 measurements</div></div>
            <Check on={x.id === sel} className={x.id === sel ? "icon-primary !text-white" : ""} />
          </Glass>
        ))}
        <button onClick={() => { startBody(); }} className="tap flex h-16 items-center gap-3 rounded-[22px] border border-dashed border-white/25 px-5 text-[16px] font-medium text-white/75"><Icon name="plus" size={20} />New body</button>
      </div>} />
    </Screen>
  );
}

export function TplFit() {
  const { replace, draft, body } = useApp();
  const b = body(); const t = templateBy(draft.garment);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t0 = performance.now(); let raf = 0;
    const tick = (n: number) => { const k = Math.min(1, (n - t0) / 7000); setPct(Math.round(100 * (1 - Math.pow(1 - k, 2)))); if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => replace("tplResult"), 300); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [replace]);
  const steps = ["Reading your measurements", `Grading the ${t.name.toLowerCase()}`, "Adding room at the hip", `Laying out ${t.pieces} pieces`];
  const active = Math.min(3, Math.floor(pct / 26));
  return (
    <Screen fixed>
      <TopBar eyebrow={`Fitting to ${b.name}`} center />
      <div className="lg:grid lg:min-h-[calc(100dvh-var(--top)-110px)] lg:grid-cols-2 lg:items-center lg:gap-16"><div>
      <div className="relative flex h-[min(330px,38dvh)] justify-center pt-2 lg:h-[min(620px,72dvh)]">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="h-full"><BodyFigure sex={b.sex} width={120} garment={draft.garment} spec={draftSpec(draft)} garmentStyle="flat" className="h-full w-auto" /></motion.div>
      </div>
      </div><div>
      <div className="serif mt-2 text-center text-[96px] leading-none tabular-nums lg:text-left lg:text-[200px]">{pct}%</div>
      <Glass className="mt-5 rounded-[26px] p-5 lg:mt-8 lg:p-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3 py-2">
            <span className={cx("grid h-5 w-5 place-items-center rounded-full", i < active ? "bg-primary" : i === active ? "bg-primary/60 animate-pulse" : "border border-white/30")}>{i < active && <Icon name="check" size={12} strokeWidth={3} />}</span>
            <span className={cx("text-[15px]", i === active && "font-semibold", i > active && "text-white/45")}>{s}</span>
          </div>
        ))}
      </Glass>
      </div></div>
    </Screen>
  );
}

export function TplResult() {
  const { go, draft, body, savePattern, units } = useApp();
  const b = body(); const t = templateBy(draft.garment);
  const [view, setView] = useState("On body");
  useEffect(() => { savePattern("Fitting"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const M = b.measures;
  const u = (v: number) => (units === "in" ? (v / 2.54).toFixed(1) : Math.round(v).toString());
  const notes = t.category === "Pants" ? [["Waist", M.waist, "+2 cm room"], ["Hip", M.hips, "+5 cm room"], ["Rise", M.rise, "Mid"], ["Inside leg", M.insideLeg, t.defaultLength]] :
    t.category === "Skirts" ? [["Waist", M.waist, "+1 cm room"], ["Hip", M.hips, "+6 cm room"], ["Waist to hip", M.waistHip, "Graded"], ["Length", 70, draft.length ?? t.defaultLength]] :
    t.category === "Tops" ? [["Bust", M.bust, "+6 cm room"], ["Across back", M.acrossBack, "Graded"], ["Arm", M.upperArm, "+3 cm room"], ["Length", 58, draft.length ?? t.defaultLength]] :
    [["Bust", M.bust, "+2 cm room"], ["Waist", M.waist, "+4 cm room"], ["Hip", M.hips, "+6 cm room"], ["Length", 112, draft.length ?? t.defaultLength]];
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Change the design</Pill><Pill className="flex-1" onClick={() => go("printMethod")}>Looks right</Pill></div>}>
      <TopBar left="back" eyebrow={`Fitted to ${b.name}`}><TopAction onClick={() => useApp.getState().home()}>Save for later</TopAction></TopBar>
      <div className="lg:flex lg:items-end lg:justify-between">
      <H1 className="mt-3">{t.name}, on you</H1>
      <Segmented className="mt-4 lg:w-[300px]" items={["On body", "Pattern"]} value={view} onChange={(v) => (v === "Pattern" ? go("garment", { view: "Pattern" }) : setView(v))} />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_130px] gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <Glow color={t.color} variant="fade" className="flex h-[min(470px,52dvh)] justify-center rounded-[28px] pt-4 lg:h-[min(600px,66dvh)] lg:rounded-[36px] lg:pt-8"><BodyFigure sex={b.sex} width={150} garment={t.key} spec={draftSpec(draft)} className="h-[94%] w-auto" /></Glow>
        <div className="flex flex-col justify-between py-1 lg:grid lg:grid-cols-2 lg:content-center lg:gap-5">
          {notes.map(([l, v, e]) => (
            <div key={l as string} className="lg:rounded-[24px] lg:border lg:border-white/10 lg:bg-card lg:p-6"><Eyebrow className=" lg:">{l}</Eyebrow><div className="flex items-baseline gap-1.5"><span className="serif text-[40px] leading-none lg:text-[64px]">{u(v as number)}</span><span className="text-[10px] text-white/50">{units}</span></div><div className="text-[11px] font-medium text-peri">{e}</div></div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
