"use client";
import { haptic } from "@/lib/haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { FLUTTER, templateBy, type GarmentKey, type PieceKey } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, HS, Lead, Pill, Glow, Glass, Chip, RB, Arrows, Check, Option, Segmented, Sheet, cx, Blob, Field, Split, useDesk } from "@/components/ui";
import { BodyFigure, Piece, Ruler } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";

export const garmentName = (g: GarmentKey) => (g === "flutter" ? FLUTTER.name : templateBy(g).name);
export const piecesFor = (g: GarmentKey): PieceKey[] => (g === "flutter" ? ["bodiceFront", "bodiceBack", "sleeve", "skirtFront", "skirtBack", "facing"] : templateBy(g).pieceSet);

// Reference thumbnail: the uploaded photo, or an illustrated stand-in.
export function RefImage({ className }: { className?: string }) {
  const draft = useApp((s) => s.draft);
  // eslint-disable-next-line @next/next/no-img-element
  if (draft.photo) return <img src={draft.photo} alt="Your reference" className={cx("h-full w-full object-cover", className)} />;
  return (
    <div className={cx("relative grid h-full w-full place-items-center overflow-hidden", className)} style={{ background: "linear-gradient(160deg,#8c9cf8,#4f63e0 60%,#2b3470)" }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.5) 1px, transparent 1.2px)", backgroundSize: "6px 6px" }} />
      <BodyFigure width={90} variant="solid" garment={draft.garment} glow={false} dim={0.35} />
      {draft.source === "link" && <span className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-1 text-[9px]">pinterest.com</span>}
    </div>
  );
}

// P01 · who is this for: a plain vertical list, so every body is visible without swiping
export function PatSelectBody() {
  const { bodies, set, go, setDraft, startBody } = useApp();
  const [pick, setPick] = useState<string | null>(null); // nothing chosen until tapped
  const next = () => { if (!pick) return; set({ activeBody: pick }); setDraft({ bodyId: pick }); go("prompt", { picked: true }); };
  return (
    <Screen footer={<Arrows ready={pick !== null} onNext={next} />}>
      <TopBar left="back" />
      <Split left={<>
        <HS className="mt-3 lg:mt-0">Who is this<br />pattern for?</HS>
        <Lead className="mt-3">Pick a body. The pattern is drafted to its measurements.</Lead>
      </>} right={
        <div className="mt-6 flex flex-col gap-2.5 lg:mt-0 lg:gap-3" data-need={pick ? "0" : "1"}>
          {bodies.map((x) => (
            <Option key={x.id} on={pick === x.id} onClick={() => setPick(x.id)} className="flex h-[84px] items-center gap-4 rounded-[24px] px-4 pr-14 lg:h-[96px] lg:px-6">
              <span className="grid h-[64px] w-12 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-primary/20"><BodyFigure sex={x.sex} width={22} glow={false} className="h-[56px] w-full" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[17px] font-medium">{x.name}</span><span className="block text-[15px] text-white/60">{x.done.length} of 24 measurements</span></span>
            </Option>
          ))}
          <button onClick={() => startBody()} className="tap flex h-16 items-center gap-3 rounded-[22px] border border-dashed border-white/25 px-5 text-[16px] font-medium text-white/75 hover:border-white/50"><Icon name="plus" size={20} />New body</button>
        </div>} />
    </Screen>
  );
}

// P02 · the studio: one canvas. Add a photo of the garment, sketch on it or beside it, or both.
// The canvas lives on the page (not in a sheet), so drawing never drags anything away.
type Stroke = [number, number][]; // points, normalised 0..1 so the drawing survives a resize
export function Prompt() {
  const { go, setDraft } = useApp();
  const file = useRef<HTMLInputElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const cur = useRef<Stroke | null>(null);
  const [n, setN] = useState(0); // number of strokes, for the UI
  const [photo, setPhoto] = useState<string | null>(null);
  const desk = useDesk();

  const ctx = () => { const c = cv.current; const g = c?.getContext("2d"); if (!c || !g) return null; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#fff"; g.lineWidth = 2.6 * (window.devicePixelRatio || 1); return { c, g }; };
  const redraw = useCallback(() => {
    const k = ctx(); if (!k) return; const { c, g } = k;
    g.clearRect(0, 0, c.width, c.height);
    strokes.current.forEach((st) => { g.beginPath(); st.forEach(([x, y], i) => (i ? g.lineTo(x * c.width, y * c.height) : g.moveTo(x * c.width, y * c.height))); if (st.length === 1) g.lineTo(st[0][0] * c.width + 0.1, st[0][1] * c.height); g.stroke(); });
  }, []);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const fit = () => { const r = c.getBoundingClientRect(); const d = window.devicePixelRatio || 1; c.width = Math.round(r.width * d); c.height = Math.round(r.height * d); redraw(); };
    const ro = new ResizeObserver(fit); ro.observe(c); fit();
    return () => ro.disconnect();
  }, [redraw]);
  const at = (e: React.PointerEvent): [number, number] => { const r = cv.current!.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  const down = (e: React.PointerEvent) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); cur.current = [at(e)]; strokes.current.push(cur.current); redraw(); };
  const move = (e: React.PointerEvent) => {
    const st = cur.current; const k = ctx(); if (!st || !k) return;
    const p = at(e); const [lx, ly] = st[st.length - 1]; st.push(p);
    k.g.beginPath(); k.g.moveTo(lx * k.c.width, ly * k.c.height); k.g.lineTo(p[0] * k.c.width, p[1] * k.c.height); k.g.stroke();
  };
  const up = () => { if (cur.current) { cur.current = null; setN(strokes.current.length); } };
  const undo = () => { strokes.current.pop(); redraw(); setN(strokes.current.length); };
  const clear = () => { strokes.current = []; redraw(); setN(0); setPhoto(null); };
  const onFile = (f?: File) => { if (!f) return; try { setPhoto(URL.createObjectURL(f)); } catch { /* ignore */ } };
  const ready = !!photo || n > 0;
  const next = () => {
    setDraft({ photo: photo ?? undefined, source: photo ? "photo" : "sketch", garment: "flutter" });
    go("ref", photo && n ? { note: "From your photo and sketch: fitted bodice, flared midi skirt." } : photo ? undefined : { note: "From your sketch: fitted bodice, flared midi skirt." });
  };

  const tool = (icon: IconName, label: string, fn: () => void, on = true) => (
    <button onClick={fn} disabled={!on} className={cx("tap flex h-12 items-center gap-2 rounded-full border border-white/15 px-4 text-[15px] font-medium transition-opacity", !on && "opacity-35")}><Icon name={icon} size={18} />{label}</button>
  );
  const tools = (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => file.current?.click()} className="tap flex h-12 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-medium text-bg"><Icon name="image" size={18} />{photo ? "Change photo" : "Add a photo"}</button>
      {tool("refresh", "Undo", undo, n > 0)}
      {tool("trash", "Clear", clear, ready)}
    </div>
  );
  const canvas = (
    <div className={cx("relative overflow-hidden rounded-[28px] border border-white/15 bg-[#121427]", desk ? "h-[min(640px,70dvh)]" : "h-[min(430px,50dvh)]")} style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / .12) 1px, transparent 1.3px)", backgroundSize: "18px 18px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {photo && <img src={photo} alt="Your garment photo" className="pointer-events-none absolute inset-0 h-full w-full object-contain p-4" />}
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10"><Icon name="pencil" size={24} /></span>
          <div className="mt-3 text-[19px]">Sketch here, or add a photo</div>
          <div className="mt-1 max-w-[280px] text-[15px] leading-snug text-white/60">Draw on top of a photo to show what you would change.</div>
        </div>
      )}
      <canvas ref={cv} aria-label="Sketch area" className="absolute inset-0 h-full w-full cursor-crosshair touch-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
    </div>
  );
  return (
    <Screen footer={<Arrows ready={ready} onNext={next} label="Continue" />}>
      <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <TopBar left="back" />
      <Split cols="lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]" left={<>
        <H1 className="mt-3 lg:mt-0">What are we<br />making?</H1>
        <Lead className="mt-3 max-w-[420px]">Add a photo of a garment you love, sketch your idea, or do both on the same page.</Lead>
        {desk && <div className="mt-8">{tools}</div>}
      </>} right={<div className="mt-5 lg:mt-0" data-need={ready ? "0" : "1"}>{canvas}{!desk && <div className="mt-3">{tools}</div>}</div>} />
    </Screen>
  );
}

// P04 · reference added
export function Reference({ p }: { p?: Record<string, unknown> }) {
  const { go } = useApp();
  const note = (p?.note as string) ?? "Midi length, flutter sleeves, fitted waist, V neck.";
  const [edit, setEdit] = useState(false);
  const [n, setN] = useState(note);
  return (
    <Screen footer={<Arrows onNext={() => go("generating")} />}>
      <div className="h-12" />
      <Split cols="lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" left={<div className="hidden h-[min(600px,68dvh)] overflow-hidden rounded-[32px] border border-white/15 lg:block"><RefImage /></div>} right={<>
      <Eyebrow>New pattern</Eyebrow>
      <H1 className="mt-4">Got it. How do you<br />want to continue?</H1>
      <div className="mt-5 grid grid-cols-[150px_1fr] gap-3 lg:grid-cols-1">
        <div className="h-[190px] overflow-hidden rounded-[22px] border border-white/15 lg:hidden"><RefImage /></div>
        <Glass className="relative rounded-[22px] p-4 lg:min-h-[130px] lg:p-5">
          <Eyebrow>Your note</Eyebrow>
          {edit ? <textarea autoFocus value={n} onChange={(e) => setN(e.target.value)} onBlur={() => setEdit(false)} className="mt-2 h-[100px] w-full resize-none bg-transparent text-[14px] outline-none" /> : <p className="mt-2 text-[14px] leading-snug">{n}</p>}
          <button onClick={() => setEdit(true)} className="chip absolute bottom-3 left-3 !h-8"><Icon name="pencil" size={13} />Edit</button>
        </Glass>
      </div>
      <Glow as="button" color="#687ef5" variant="side" onClick={() => go("generating")} className="relative mt-4 block w-full rounded-[26px] p-5 lg:p-7">
        <div className="flex items-center gap-2 text-[16px] font-semibold"><Icon name="sparkle" size={18} />Generate now</div>
        <div className="mt-1 text-[13px] text-white/65">Venty decides the details. Edit anything after.</div>
        <Check className="absolute right-4 top-4" />
      </Glow>
      <Glass onClick={() => go("ai")} className="mt-3 block w-full rounded-[26px] p-5 lg:p-7">
        <div className="flex items-center gap-2 text-[16px] font-semibold"><Icon name="sliders" size={18} />See details before creating</div>
        <div className="mt-1 text-[13px] text-white/55">Check what we read: type, fit and fabric.</div>
      </Glass>
      </>} />
    </Screen>
  );
}

// P05–P07 · AI assumed values (Overview / Fitting / Fabric)
export function AIRead({ p }: { p?: Record<string, unknown> }) {
  const { go, draft, setDraft } = useApp();
  const [tab, setTab] = useState((p?.tab as string) ?? "Overview");
  const [pick, setPick] = useState<string | null>(null);
  const [read, setRead] = useState(FLUTTER.read);
  const opts: Record<string, string[]> = { Sleeves: ["Flutter", "Short", "Cap", "None"], Neckline: ["V-neck", "Round", "Square"], Length: ["Knee", "Midi", "Maxi"], Waist: ["Fitted", "Relaxed", "Tie"], Skirt: ["A-line", "Straight", "Bias"], Fastening: ["Back zip", "Buttons", "Pull-on"] };
  const next = () => (tab === "Overview" ? setTab("Fitting") : tab === "Fitting" ? setTab("Fabric") : go("generating"));
  const fits = [["Close", 1], ["Easy", 4], ["Loose", 8]] as const;
  return (
    <Screen footer={tab === "Fabric" ? <Pill onClick={() => go("generating")}>Generate garment</Pill> : <Arrows onNext={next} />}>
      <TopBar left={tab === "Fabric" ? "back" : null} eyebrow={tab === "Overview" ? "AI read · Assumed values" : tab === "Fitting" ? "AI read · Fitting" : "AI read · Fabric"} />
      <Split center={false} className="lg:mt-6" left={<>
      <H1 className="mt-4 lg:mt-0">{tab === "Overview" ? "Here’s what we read" : tab === "Fitting" ? "How should it fit?" : "Tell us about the fabric"}</H1>
      <Segmented className="mt-4 lg:mt-6" items={["Overview", "Fitting", "Fabric"]} value={tab} onChange={setTab} />
      <div className="mt-6 hidden h-[min(380px,42dvh)] overflow-hidden rounded-[28px] border border-white/15 lg:block"><RefImage /></div>
      </>} right={<div className="lg:-mt-4">
      {tab === "Overview" && (
        <>
          <Glow color="#687ef5" variant="side" className="relative mt-4 rounded-[26px] p-5">
            <Eyebrow className=" text-white/70">Garment</Eyebrow>
            <div className="mt-1 text-[24px] font-normal">Dress</div>
            <div className="mt-1 max-w-[170px] text-[13px] text-white/70">Midi, flutter sleeves, fitted waist, A-line skirt.</div>
            <div className="absolute right-5 top-1/2 grid h-[78px] w-[78px] -translate-y-1/2 place-items-center rounded-full border border-white/50"><span className="serif text-[34px]">{FLUTTER.match}</span></div>
            <div className="eyebrow absolute bottom-3 right-7">Match</div>
          </Glow>
          <Glass className="mt-3 rounded-[24px] p-4">
            <Eyebrow>Details · tap to change</Eyebrow>
            <div className="mt-2 divide-y divide-white/6">{read.map(([k, v]) => (
              <button key={k} onClick={() => setPick(k)} className="flex w-full items-center justify-between py-2.5 text-[15px]"><span className="text-white/80">{k}</span><span className="flex items-center gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[13px]">{v}</span><Icon name="chevR" size={16} className="text-white/40" /></span></button>
            ))}</div>
          </Glass>
        </>
      )}
      {tab === "Fitting" && (
        <>
          <Glow color="#4d5e85" variant="edge" className="relative mt-4 grid h-[min(300px,34dvh)] place-items-center rounded-[28px] lg:h-[min(440px,50dvh)]">
            <span className="eyebrow absolute top-4">Easy</span><span className="eyebrow absolute left-4 top-1/2">Close</span><span className="eyebrow absolute right-4 top-1/2">Loose</span>
            <motion.div className="h-[150px] w-[150px] rounded-full lg:h-[220px] lg:w-[220px]" style={{ background: "conic-gradient(from 200deg, #fff, #8c9cf8, #4f63e0, #1a1f3a, #fff)", boxShadow: "0 0 60px rgba(104,126,245,.5)" }} animate={{ rotate: draft.ease * 18 }} transition={{ type: "spring" }} />
            <div className="absolute bottom-5 text-center"><div className="serif text-[46px] leading-none">+{draft.ease.toFixed(1)}</div><div className="eyebrow mt-1">cm ease at waist</div></div>
          </Glow>
          <div className="mt-3 grid grid-cols-3 gap-2">{fits.map(([l, e]) => (
            <button key={l} onClick={() => setDraft({ ease: e })} className={cx("tap rounded-[18px] p-3 text-left transition-colors", draft.ease === e ? "bg-white text-bg" : "glass")}><div className="text-[15px] font-semibold">{l}</div><div className={cx("text-[11px]", draft.ease === e ? "text-bg/60" : "text-white/50")}>+{e} cm</div></button>
          ))}</div>
        </>
      )}
      {tab === "Fabric" && (
        <>
          <Eyebrow className="mt-5">Fabric type</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">{["Cotton poplin", "Linen", "Viscose crepe", "Satin", "Jersey", "Denim"].map((f) => <Chip key={f} on={draft.fabric === f} onClick={() => setDraft({ fabric: f })}>{f}</Chip>)}</div>
          <Eyebrow className="mt-5">Does it stretch?</Eyebrow>
          <div className="mt-2 flex flex-col gap-2">{([["No", "It doesn’t move"], ["A bit", "It gives when you pull"], ["A lot", "Stretches and springs back"]] as const).map(([k, d]) => (
            <Glass key={k} onClick={() => setDraft({ stretch: k })} selected={draft.stretch === k} className="flex h-[48px] w-full items-center gap-4 rounded-[16px] px-4"><span className="w-12 text-[15px] font-semibold">{k}</span><span className="flex-1 text-[13px] text-white/55">{d}</span>{draft.stretch === k && <span className="h-2 w-2 rounded-full bg-primary" />}</Glass>
          ))}</div>
          <Eyebrow className="mt-5">Stiff or soft?</Eyebrow>
          <Glow color="#687ef5" variant="fade" className="mt-2 rounded-[22px] p-4">
            <div className="flex justify-between text-[10px] text-white/70"><span>Stiff</span><span>Drapes</span></div>
            <input type="range" min={0} max={100} value={Math.round(draft.drape * 100)} onChange={(e) => setDraft({ drape: Number(e.target.value) / 100 })} className="mt-3 w-full accent-white" />
            <div className="mt-1 text-[13px] text-white/75">{draft.drape > 0.6 ? "Soft — holds a gentle, fluid drape" : draft.drape > 0.3 ? "Medium — keeps some shape" : "Crisp — holds its shape"}</div>
          </Glow>
        </>
      )}
      </div>} />
      <Sheet open={!!pick} onClose={() => setPick(null)}>
        <h3 className="text-[20px] font-semibold">{pick}</h3>
        <div className="mt-4 flex flex-wrap gap-2">{pick && opts[pick].map((o) => <Chip key={o} on={read.find(([k]) => k === pick)?.[1] === o} onClick={() => { setRead(read.map(([k, v]) => [k, k === pick ? o : v])); setPick(null); }}>{o}</Chip>)}</div>
      </Sheet>
    </Screen>
  );
}

// P08 · generating (also used for regenerate)
export function Generating({ p }: { p?: Record<string, unknown> }) {
  const { replace, draft, body } = useApp();
  const b = body();
  const [pct, setPct] = useState(0);
  const steps = ["Reading your reference", "Drafting the blocks", `Adding ease for an ${draft.ease <= 2 ? "Close" : draft.ease >= 7 ? "Loose" : "Easy"} fit`, `Grading to ${b.name}`];
  const dur = p?.quick ? 2200 : 4200;
  useEffect(() => {
    const t0 = performance.now(); let raf = 0;
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setPct(Math.round(100 * (1 - Math.pow(1 - k, 2)))); if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => { haptic("success"); replace("garment"); }, 350); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [dur, replace]);
  const active = Math.min(3, Math.floor(pct / 26));
  return (
    <Screen fixed bg={<><Blob className="left-[-20%] top-[8%] h-[70%] w-[140%] opacity-70" /><Blob className="left-[20%] top-[20%] h-[40%] w-[60%] opacity-50" color="#c1c8d9" /></>}>
      <TopBar left="close" onLeft={() => useApp.getState().back()} eyebrow={p?.quick ? "Regenerating" : "Drafting your pattern"} center />
      <div className="lg:grid lg:min-h-[calc(100dvh-var(--top)-110px)] lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="flex h-[48%] flex-col items-center justify-center lg:h-auto lg:items-start">
        <div className="serif text-[110px] leading-none tabular-nums lg:text-[220px]">{pct}%</div>
        <div className="mt-3 text-[14px] text-white/70 lg:text-[18px]">{garmentName(draft.garment)}</div>
      </div>
      <Glass className="rounded-[26px] p-5 lg:p-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3 py-2">
            <span className={cx("grid h-5 w-5 place-items-center rounded-full transition-colors", i < active ? "bg-white text-bg" : i === active ? "bg-primary" : "border border-white/30")}>{i < active && <Icon name="check" size={12} strokeWidth={3} />}</span>
            <span className={cx("text-[15px]", i === active ? "font-semibold" : i > active ? "text-white/45" : "")}>{s}</span>
          </div>
        ))}
      </Glass>
      </div>
    </Screen>
  );
}

// P09 / P10 · garment realistic & pattern view
export function Garment({ p }: { p?: Record<string, unknown> }) {
  const { go, draft, body, savePattern } = useApp();
  const b = body();
  const [view, setView] = useState((p?.view as string) ?? "Realistic");
  const name = garmentName(draft.garment);
  const pieces = piecesFor(draft.garment);
  useEffect(() => { savePattern("Fitting"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const desk = useDesk();
  if (desk) return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Make edits</Pill><Pill className="flex-1" onClick={() => go("printMethod")}>Looks right</Pill></div>}>
      <TopBar left="back" onLeft={() => useApp.getState().home()} eyebrow={`AI garment · V${draft.version}`} right="more" onRight={() => go("edits")} />
      <div className="mt-4 grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-start gap-14">
        <AnimatePresence mode="wait">
          {view === "Realistic" ? (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Glow color="#4d5e85" variant="fade" className="relative flex h-[min(640px,72dvh)] justify-center rounded-[36px] pt-6">
                <BodyFigure sex={b.sex} width={240} variant="solid" garment={draft.garment} glow={false} className="h-[94%] w-auto" />
              </Glow>
            </motion.div>
          ) : (
            <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass grid h-[min(640px,72dvh)] grid-cols-3 place-items-center gap-4 rounded-[36px] p-8" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
                {pieces.map((k) => <Piece key={k} k={k} width={130} label={k.replace(/([A-Z])/g, " $1")} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pt-4">
          <Eyebrow>Fitted to {b.name}</Eyebrow>
          <h1 className="mt-2 text-[44px] font-normal leading-tight tracking-tight">{name}</h1>
          <div className="mt-6 w-[280px]"><Segmented items={["Realistic", "Pattern"]} value={view} onChange={setView} /></div>
          <div className="mt-8 grid grid-cols-3 gap-3">{[[String(pieces.length).padStart(2, "0"), "Pieces"], [String(draft.seam ?? 1.5), "cm SA"], [String(draft.ease), "cm ease"]].map(([v, l]) => (
            <Glass key={l} className="rounded-[20px] px-4 py-4"><div className="serif text-[40px] leading-none">{v}</div><div className="eyebrow mt-2">{l}</div></Glass>
          ))}</div>
          <Glass className="mt-4 rounded-[22px] p-5">
            <Eyebrow>Details</Eyebrow>
            <div className="mt-2 divide-y divide-white/6 text-[15px]">{[["Fabric", draft.fabric], ["Stretch", draft.stretch], ["Sleeve", draft.sleeve], ["Length", `${draft.lengthCm} cm`]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><span className="text-white/60">{k}</span><span>{v}</span></div>)}</div>
          </Glass>
        </div>
      </div>
    </Screen>
  );
  return (
    <Screen footer={<><div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Make edits</Pill><Pill className="flex-1" onClick={() => go("printMethod")}>Looks right</Pill></div></>}>
      <TopBar left="back" onLeft={() => useApp.getState().home()} eyebrow={`AI garment · V${draft.version}`} right="more" onRight={() => go("edits")} />
      <h1 className="mt-2 text-center text-[24px] font-normal tracking-tight">{name}</h1>
      <div className="mt-3 flex justify-center"><div className="w-[220px]"><Segmented items={["Realistic", "Pattern"]} value={view} onChange={setView} /></div></div>
      <AnimatePresence mode="wait">
        {view === "Realistic" ? (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mt-3 flex h-[min(470px,54dvh)] justify-center">
            <Blob className="left-1/2 top-1/3 h-[260px] w-[220px] -translate-x-1/2 opacity-40" />
            <BodyFigure sex={b.sex} width={180} variant="solid" garment={draft.garment} glow={false} className="h-full w-auto" />
          </motion.div>
        ) : (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass mt-3 grid grid-cols-3 place-items-center gap-3 rounded-[24px] p-4" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
              {pieces.map((k) => <Piece key={k} k={k} width={86} label={k.replace(/([A-Z])/g, " $1")} />)}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">{[[String(pieces.length).padStart(2, "0"), "Pieces"], [String(draft.seam ?? 1.5), "cm SA"], ["ME", "Body"]].map(([v, l]) => (
              <Glass key={l} className="flex items-baseline gap-2 rounded-[16px] px-3 py-2.5"><span className="serif text-[24px]">{v}</span><span className="eyebrow">{l}</span></Glass>
            ))}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}

// P11 · make edits
export function Edits() {
  const { go, replace, draft, setDraft, body } = useApp();
  const b = body();
  const [prompt, setPrompt] = useState("");
  const regen = () => { setDraft({ version: draft.version + 1 }); replace("generating", { quick: true }); };
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={regen}>Regenerate</Pill><Pill className="flex-1" onClick={() => { setDraft({ version: draft.version + 1 }); go("garment"); }}>Done</Pill></div>}>
      <TopBar left="back" eyebrow={`Edit garment · V${draft.version + 1}`} />
      <Split center={false} className="lg:mt-4" cols="lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" left={<>
      <H1 className="mt-3 lg:hidden">Make it yours</H1>
      <Glow color="#687ef5" variant="fade" className="relative mt-4 flex h-[190px] justify-center rounded-[28px] pt-3 lg:mt-0 lg:h-[min(620px,70dvh)] lg:rounded-[36px] lg:pt-8">
        <span className="absolute left-4 top-4 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold">V1</span>
        <span className="absolute left-4 top-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold">V{draft.version + 1} · {draft.lengthCm > 104 ? "Longer hem" : draft.lengthCm < 104 ? "Shorter hem" : "Your edits"}</span>
        <RB icon="move" size={38} className="absolute right-4 top-4" />
        <BodyFigure sex={b.sex} width={64} variant="solid" garment={draft.garment} glow={false} className="h-full w-auto lg:h-[94%]" />
      </Glow>
      </>} right={<>
      <H1 className="hidden lg:block">Make it yours</H1>
      <Glass className="mt-3 rounded-[24px] px-4 pb-2 pt-4 lg:mt-6 lg:px-6 lg:pt-6">
        {([["Length", "lengthCm", 80, 130], ["Neckline depth", "neckline", 4, 22]] as const).map(([l, k, mn, mx]) => (
          <div key={k} className="mb-1">
            <div className="flex items-baseline justify-between"><span className="text-[15px] font-medium">{l}</span><span className="flex items-baseline gap-2"><span className="serif text-[34px] leading-none">{draft[k]}</span><span className="text-[10px] text-white/50">cm</span></span></div>
            <Ruler value={draft[k]} min={mn} max={mx} step={1} px={14} onChange={(v) => setDraft({ [k]: v } as never)} />
          </div>
        ))}
      </Glass>
      <Eyebrow className="mt-4">Sleeve</Eyebrow>
      <div className="mt-2 flex gap-2">{["Cap", "Flutter", "Short", "3/4", "None"].map((s) => <Chip key={s} on={draft.sleeve === s} onClick={() => setDraft({ sleeve: s })}>{s}</Chip>)}</div>
      <label className="glass mt-4 flex h-[54px] items-center gap-3 rounded-[18px] px-4"><Icon name="sparkle" size={18} className="text-peri" /><input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && regen()} placeholder="Tell Venty what to change…" className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/40" /><Icon name="mic" size={18} className="text-white/60" /></label>
      </>} />
    </Screen>
  );
}
