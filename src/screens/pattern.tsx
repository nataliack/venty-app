"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { FLUTTER, templateBy, type GarmentKey, type PieceKey } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, Lead, Pill, Glow, Glass, Chip, RB, Arrows, Check, Segmented, Sheet, cx, Blob, Field, Split, useDesk } from "@/components/ui";
import { BodyFigure, Piece, Ruler } from "@/components/art";
import { Icon } from "@/components/icons";

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

// P01 · who is this for
export function PatSelectBody() {
  const { bodies, activeBody, set, go, setDraft, newBody } = useApp();
  const idx = Math.max(0, bodies.findIndex((b) => b.id === activeBody));
  const [i, setI] = useState(idx);
  const b = bodies[i] ?? bodies[0];
  const next = () => { set({ activeBody: b.id }); setDraft({ bodyId: b.id }); go("prompt"); };
  const desk = useDesk();
  if (desk) return (
    <Screen footer={<Arrows onNext={next} />}>
      <div className="h-12" />
      <div className="flex items-end justify-between"><div><Eyebrow>New pattern · 01</Eyebrow><H1 className="mt-4">Who is this for?</H1><Lead className="mt-2">Patterns are drafted to the body you pick.</Lead></div>
        <Chip icon="plus" onClick={() => { newBody(); go("gender"); }}>New body</Chip></div>
      <div className="mt-8 grid grid-cols-4 gap-5">
        {bodies.map((x, k) => (
          <Glow key={x.id} onClick={() => setI(k)} color={k === i ? "#687ef5" : "#3c4b63"} variant="fade" className={cx("relative h-[min(460px,56dvh)] rounded-[32px] transition-opacity", k !== i && "opacity-60 hover:opacity-90")}>
            {k === i && <Check className="absolute right-4 top-4" />}
            <div className="flex h-[76%] justify-center pt-8"><BodyFigure sex={x.sex} width={110} variant="solid" glow={false} className="h-full w-auto" /></div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between"><div><div className="text-[17px] font-semibold">{x.name}</div><div className="eyebrow text-[9px]">Measures</div></div><span className="serif text-[38px] leading-none">{Math.max(4, x.done.length)}/24</span></div>
          </Glow>
        ))}
      </div>
    </Screen>
  );
  return (
    <Screen footer={<Arrows onNext={next} />} noPad>
      <div className="px-6"><div className="h-12" /><Eyebrow>New pattern · 01</Eyebrow><H1 className="mt-4">Who is this for?</H1><Lead className="mt-2 text-[14px]">Patterns are drafted to the body you pick.</Lead></div>
      <motion.div className="mt-6 flex touch-pan-y" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3} onDragEnd={(_, info) => { if (info.offset.x < -50) setI(Math.min(bodies.length - 1, i + 1)); if (info.offset.x > 50) setI(Math.max(0, i - 1)); }}>
        <motion.div className="flex gap-4 px-[44px]" animate={{ x: -i * (294 + 16) }} transition={{ type: "spring", bounce: 0.15 }}>
          {bodies.map((x, k) => (
            <Glow key={x.id} as="button" onClick={() => setI(k)} color={k === i ? "#687ef5" : "#3c4b63"} variant="fade" className={cx("relative h-[min(380px,44dvh)] w-[294px] shrink-0 rounded-[32px] transition-opacity", k !== i && "opacity-50")}>
              {k === i && <Check className="absolute right-4 top-4" />}
              <div className="flex h-[78%] justify-center pt-6"><BodyFigure sex={x.sex} width={90} variant="solid" glow={false} className="h-full w-auto" /></div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between"><div><div className="text-[16px] font-semibold">{x.name}</div><div className="eyebrow text-[9px]">Measures</div></div><span className="serif text-[34px] leading-none">{Math.max(4, x.done.length)}/24</span></div>
            </Glow>
          ))}
        </motion.div>
      </motion.div>
      <div className="mt-4 flex justify-center gap-1.5">{bodies.map((_, k) => <span key={k} className={cx("h-1.5 rounded-full bg-white transition-all", k === i ? "w-5" : "w-1.5 opacity-30")} />)}</div>
      <div className="mt-4 flex justify-center"><Chip icon="plus" onClick={() => { newBody(); go("gender"); }}>New body</Chip></div>
    </Screen>
  );
}

// P02 · prompt hub
export function Prompt() {
  const { go, setDraft } = useApp();
  const file = useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = useState<null | "link" | "sketch" | "describe">(null);
  const [link, setLink] = useState("https://pin.it/flutter-midi-dress");
  const [text, setText] = useState("Midi wrap dress, flutter sleeves, V neck");
  const [listening, setListening] = useState(false);
  const onFile = (f?: File) => {
    if (!f) return;
    let url: string | undefined; try { url = URL.createObjectURL(f); } catch { url = undefined; }
    setDraft({ photo: url, source: "photo", garment: "flutter" });
    go("ref");
  };
  const voice = () => { setListening(true); setTimeout(() => { setListening(false); setDraft({ source: "voice", garment: "flutter" }); go("ref", { note: "Midi length, flutter sleeves, fitted waist, V neck." }); }, 2600); };
  const desk = useDesk();
  const [over, setOver] = useState(false);
  return (
    <Screen footer={desk ? undefined : 
      <div className="flex items-center justify-between pb-1">
        <RB icon="keyboard" onClick={() => setSheet("describe")} />
        <button onClick={voice} className={cx("tap flex h-12 w-24 items-center justify-center rounded-full bg-primary shadow-[0_8px_30px_rgba(104,126,245,.5)]", listening && "animate-pulse")} aria-label="Speak"><Icon name="mic" size={22} /></button>
        <RB icon="camera" onClick={() => file.current?.click()} />
      </div>}>
      <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <TopBar left="back" eyebrow="New pattern · 02" />
      <Split left={<>
      <H1 className="mt-4 lg:mt-0">What are we<br />making?</H1>
      <div className="hidden lg:block">
        <Lead className="mt-4 max-w-[420px]">Drop in a photo, paste a link, sketch the shape, describe it — or just say it.</Lead>
        <Glass onClick={() => setSheet("describe")} className="mt-8 flex h-[60px] w-full items-center gap-3 rounded-[20px] px-5 text-[15px] text-white/45"><Icon name="sparkle" size={20} className="text-peri" />Describe it — “midi wrap dress, flutter…”</Glass>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={voice} className={cx("tap flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold shadow-[0_8px_30px_rgba(104,126,245,.5)]", listening && "animate-pulse")}><Icon name="mic" size={20} />Say it</button>
          <RB icon="keyboard" size={56} onClick={() => setSheet("describe")} />
          <RB icon="camera" size={56} onClick={() => file.current?.click()} />
        </div>
      </div>
      </>} right={<>
      <Glow as="button" color="#8c9cf8" variant="fade" onClick={() => file.current?.click()} className={cx("mt-5 block h-[min(230px,28dvh)] w-full rounded-[30px] lg:mt-0 lg:h-[min(400px,48dvh)] lg:rounded-[36px]", over && "ring-2 ring-white")}
        {...(desk ? { onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(true); }, onDragLeave: () => setOver(false), onDrop: (e: React.DragEvent) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files?.[0]); } } : {})}>
        <div className="absolute inset-3 rounded-[24px] border border-dashed border-white/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-bg"><Icon name="upload" size={22} /></span>
          <div className="mt-3 text-[17px] font-semibold lg:text-[24px]">Drop a photo you love</div>
          <div className="mt-1 text-[12px] text-white/70 lg:text-[14px]">{desk ? "Drag an image here, or click to choose one." : "From Pinterest, a magazine, or the street."}</div>
          <div className="mt-3 flex gap-2">
            <span className="chip !h-8 !bg-white/15" onClick={(e) => { e.stopPropagation(); file.current?.click(); }}><Icon name="image" size={14} />Photos</span>
            <span className="chip !h-8 !bg-white/15" onClick={(e) => { e.stopPropagation(); setSheet("link"); }}><Icon name="link" size={14} />Paste link</span>
          </div>
        </div>
      </Glow>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:mt-4 lg:gap-4">
        <Glow as="button" color="#687ef5" variant="side" onClick={() => setSheet("sketch")} className="h-[110px] rounded-[24px] p-4 lg:h-[150px] lg:p-6"><Icon name="pencil" size={20} /><div className="absolute bottom-4 left-4"><div className="text-[14px] font-semibold">Sketch it</div><div className="eyebrow text-[9px]">Draw the shape</div></div></Glow>
        <Glow as="button" color="#4d5e85" variant="dim" onClick={() => go("templates")} className="h-[110px] rounded-[24px] p-4 lg:h-[150px] lg:p-6"><Icon name="grid" size={20} /><div className="absolute bottom-4 left-4"><div className="text-[14px] font-semibold">Start from a style</div><div className="eyebrow text-[9px]">10 templates</div></div></Glow>
      </div>
      <Glass onClick={() => setSheet("describe")} className="mt-3 flex h-[52px] w-full items-center gap-3 rounded-[18px] px-4 text-[13px] text-white/45 lg:hidden"><Icon name="sparkle" size={18} className="text-peri" />Describe it — “midi wrap dress, flutter…”</Glass>
      </>} />
      <AnimatePresence>{listening && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 grid place-items-center bg-bg/80 backdrop-blur-sm">
          <div className="flex flex-col items-center"><div className="flex h-16 items-center gap-1.5">{Array.from({ length: 9 }, (_, k) => <motion.span key={k} className="w-1.5 rounded-full bg-primary" animate={{ height: [12, 44, 18, 36, 12] }} transition={{ duration: 1, repeat: Infinity, delay: k * 0.08 }} />)}</div>
            <div className="mt-4 text-[16px] font-medium">Listening…</div><div className="mt-1 text-[13px] text-white/60">“Midi length, flutter sleeves, fitted waist”</div></div>
        </motion.div>)}</AnimatePresence>
      <Sheet open={sheet === "link"} onClose={() => setSheet(null)}>
        <h3 className="text-[20px] font-semibold">Paste a link</h3><p className="mt-1 text-[13px] text-white/60">Pinterest, Instagram or any shop page.</p>
        <div className="mt-4"><Field label="Link" value={link} onChange={setLink} /></div>
        <Pill className="mt-4" onClick={() => { setSheet(null); setDraft({ source: "link", photo: undefined, garment: "flutter" }); go("ref"); }}>Use this link</Pill>
      </Sheet>
      <Sheet open={sheet === "describe"} onClose={() => setSheet(null)}>
        <h3 className="text-[20px] font-semibold">Describe it</h3>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="glass mt-4 w-full resize-none rounded-[20px] p-4 text-[16px] outline-none" />
        <div className="mt-3 flex flex-wrap gap-2">{["Flutter sleeves", "Midi", "V neck", "Tie waist"].map((c) => <Chip key={c} onClick={() => setText((t) => (t.includes(c) ? t : t + ", " + c.toLowerCase()))}>+ {c}</Chip>)}</div>
        <Pill className="mt-4" onClick={() => { setSheet(null); setDraft({ source: "voice", photo: undefined, garment: "flutter" }); go("ref", { note: text }); }}>Continue</Pill>
      </Sheet>
      <SketchSheet open={sheet === "sketch"} onClose={() => setSheet(null)} onDone={() => { setSheet(null); setDraft({ source: "sketch", photo: undefined, garment: "flutter" }); go("ref", { note: "From your sketch: fitted bodice, flared midi skirt." }); }} />
    </Screen>
  );
}

function SketchSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    if (!open) return; const c = cv.current; if (!c) return; const r = c.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2;
    const ctx = c.getContext("2d"); if (!ctx) return; ctx.scale(2, 2); ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.strokeStyle = "#fff";
  }, [open]);
  const pos = (e: React.PointerEvent) => { const r = cv.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="text-[20px] font-semibold">Sketch the shape</h3><p className="mt-1 text-[13px] text-white/60">A rough outline is plenty.</p>
      <div className="glass relative mt-4 h-[300px] overflow-hidden rounded-[24px]">
        <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-15"><BodyFigure width={100} glow={false} /></div>
        <canvas ref={cv} className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={(e) => { drawing.current = true; const ctx = cv.current!.getContext("2d")!; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { if (!drawing.current) return; const ctx = cv.current!.getContext("2d")!; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); }}
          onPointerUp={() => (drawing.current = false)} />
      </div>
      <Pill className="mt-4" onClick={onDone}>Use my sketch</Pill>
    </Sheet>
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
      <Eyebrow>New pattern · 03</Eyebrow>
      <H1 className="mt-4">Got it. How do you<br />want to continue?</H1>
      <div className="mt-5 grid grid-cols-[150px_1fr] gap-3 lg:grid-cols-1">
        <div className="h-[190px] overflow-hidden rounded-[22px] border border-white/15 lg:hidden"><RefImage /></div>
        <Glass className="relative rounded-[22px] p-4 lg:min-h-[130px] lg:p-5">
          <Eyebrow className="text-[9px]">Your note</Eyebrow>
          {edit ? <textarea autoFocus value={n} onChange={(e) => setN(e.target.value)} onBlur={() => setEdit(false)} className="mt-2 h-[100px] w-full resize-none bg-transparent text-[13px] outline-none" /> : <p className="mt-2 text-[13px] leading-snug">{n}</p>}
          <button onClick={() => setEdit(true)} className="chip absolute bottom-3 left-3 !h-8"><Icon name="pencil" size={13} />Edit</button>
        </Glass>
      </div>
      <Glow as="button" color="#687ef5" variant="side" onClick={() => go("generating")} className="relative mt-4 block w-full rounded-[26px] p-5 lg:p-7">
        <div className="flex items-center gap-2 text-[16px] font-semibold"><Icon name="sparkle" size={18} />Generate now</div>
        <div className="mt-1 text-[12px] text-white/65">Venty decides the details. Edit anything after.</div>
        <Check className="absolute right-4 top-4" />
      </Glow>
      <Glass onClick={() => go("ai")} className="mt-3 block w-full rounded-[26px] p-5 lg:p-7">
        <div className="flex items-center gap-2 text-[16px] font-semibold"><Icon name="sliders" size={18} />See details before creating</div>
        <div className="mt-1 text-[12px] text-white/55">Check what we read: type, fit and fabric.</div>
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
            <Eyebrow className="text-[9px] text-white/70">Garment</Eyebrow>
            <div className="mt-1 text-[24px] font-semibold">Dress</div>
            <div className="mt-1 max-w-[170px] text-[12px] text-white/70">Midi, flutter sleeves, fitted waist, A-line skirt.</div>
            <div className="absolute right-5 top-1/2 grid h-[78px] w-[78px] -translate-y-1/2 place-items-center rounded-full border border-white/50"><span className="serif text-[34px]">{FLUTTER.match}</span></div>
            <div className="eyebrow absolute bottom-3 right-7 text-[8px]">Match</div>
          </Glow>
          <Glass className="mt-3 rounded-[24px] p-4">
            <Eyebrow className="text-[9px]">Details · tap to change</Eyebrow>
            <div className="mt-2 divide-y divide-white/6">{read.map(([k, v]) => (
              <button key={k} onClick={() => setPick(k)} className="flex w-full items-center justify-between py-2.5 text-[14px]"><span className="text-white/80">{k}</span><span className="flex items-center gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px]">{v}</span><Icon name="chevR" size={16} className="text-white/40" /></span></button>
            ))}</div>
          </Glass>
        </>
      )}
      {tab === "Fitting" && (
        <>
          <Glow color="#4d5e85" variant="edge" className="relative mt-4 grid h-[min(300px,34dvh)] place-items-center rounded-[28px] lg:h-[min(440px,50dvh)]">
            <span className="eyebrow absolute top-4 text-[9px]">Easy</span><span className="eyebrow absolute left-4 top-1/2 text-[9px]">Close</span><span className="eyebrow absolute right-4 top-1/2 text-[9px]">Loose</span>
            <motion.div className="h-[150px] w-[150px] rounded-full lg:h-[220px] lg:w-[220px]" style={{ background: "conic-gradient(from 200deg, #fff, #8c9cf8, #4f63e0, #1a1f3a, #fff)", boxShadow: "0 0 60px rgba(104,126,245,.5)" }} animate={{ rotate: draft.ease * 18 }} transition={{ type: "spring" }} />
            <div className="absolute bottom-5 text-center"><div className="serif text-[46px] leading-none">+{draft.ease.toFixed(1)}</div><div className="eyebrow mt-1 text-[9px]">cm ease at waist</div></div>
          </Glow>
          <div className="mt-3 grid grid-cols-3 gap-2">{fits.map(([l, e]) => (
            <button key={l} onClick={() => setDraft({ ease: e })} className={cx("tap rounded-[18px] p-3 text-left transition-colors", draft.ease === e ? "bg-white text-bg" : "glass")}><div className="text-[14px] font-semibold">{l}</div><div className={cx("text-[11px]", draft.ease === e ? "text-bg/60" : "text-white/50")}>+{e} cm</div></button>
          ))}</div>
        </>
      )}
      {tab === "Fabric" && (
        <>
          <Eyebrow className="mt-5 text-[9px]">Fabric type</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">{["Cotton poplin", "Linen", "Viscose crepe", "Satin", "Jersey", "Denim"].map((f) => <Chip key={f} on={draft.fabric === f} onClick={() => setDraft({ fabric: f })}>{f}</Chip>)}</div>
          <Eyebrow className="mt-5 text-[9px]">Does it stretch?</Eyebrow>
          <div className="mt-2 flex flex-col gap-2">{([["No", "It doesn’t move"], ["A bit", "It gives when you pull"], ["A lot", "Stretches and springs back"]] as const).map(([k, d]) => (
            <Glass key={k} onClick={() => setDraft({ stretch: k })} selected={draft.stretch === k} className="flex h-[48px] w-full items-center gap-4 rounded-[16px] px-4"><span className="w-12 text-[14px] font-semibold">{k}</span><span className="flex-1 text-[12px] text-white/55">{d}</span>{draft.stretch === k && <span className="h-2 w-2 rounded-full bg-primary" />}</Glass>
          ))}</div>
          <Eyebrow className="mt-5 text-[9px]">Stiff or soft?</Eyebrow>
          <Glow color="#687ef5" variant="fade" className="mt-2 rounded-[22px] p-4">
            <div className="flex justify-between text-[10px] uppercase tracking-[.08em] text-white/70"><span>Stiff</span><span>Drapes</span></div>
            <input type="range" min={0} max={100} value={Math.round(draft.drape * 100)} onChange={(e) => setDraft({ drape: Number(e.target.value) / 100 })} className="mt-3 w-full accent-white" />
            <div className="mt-1 text-[12px] text-white/75">{draft.drape > 0.6 ? "Soft — holds a gentle, fluid drape" : draft.drape > 0.3 ? "Medium — keeps some shape" : "Crisp — holds its shape"}</div>
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
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setPct(Math.round(100 * (1 - Math.pow(1 - k, 2)))); if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => replace("garment"), 350); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [dur, replace]);
  const active = Math.min(3, Math.floor(pct / 26));
  return (
    <Screen fixed bg={<><Blob className="left-[-20%] top-[8%] h-[70%] w-[140%] opacity-70" /><Blob className="left-[20%] top-[20%] h-[40%] w-[60%] opacity-50" color="#c1c8d9" /></>}>
      <TopBar left="close" onLeft={() => useApp.getState().back()} eyebrow={p?.quick ? "Regenerating" : "Drafting your pattern"} center />
      <div className="lg:grid lg:min-h-[calc(100dvh-var(--top)-110px)] lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="flex h-[48%] flex-col items-center justify-center lg:h-auto lg:items-start">
        <div className="serif text-[110px] leading-none tabular-nums lg:text-[220px]">{pct}%</div>
        <div className="mt-3 text-[13px] text-white/70 lg:text-[18px]">{garmentName(draft.garment)}</div>
      </div>
      <Glass className="rounded-[26px] p-5 lg:p-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3 py-2">
            <span className={cx("grid h-5 w-5 place-items-center rounded-full transition-colors", i < active ? "bg-white text-bg" : i === active ? "bg-primary" : "border border-white/30")}>{i < active && <Icon name="check" size={12} strokeWidth={3} />}</span>
            <span className={cx("text-[14px]", i === active ? "font-semibold" : i > active ? "text-white/45" : "")}>{s}</span>
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
  const isDress = draft.garment === "flutter" || templateBy(draft.garment).category === "Dresses";
  if (desk) return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Make edits</Pill><Pill className="flex-1" onClick={() => go("seam")}>Looks right</Pill></div>}>
      <TopBar left="back" onLeft={() => useApp.getState().home()} eyebrow={`AI garment · V${draft.version}`} right="more" onRight={() => go("edits")} />
      <div className="mt-4 grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-start gap-14">
        <AnimatePresence mode="wait">
          {view === "Realistic" ? (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Glow color="#4d5e85" variant="fade" className="relative flex h-[min(640px,72dvh)] justify-center rounded-[36px] pt-6">
                <BodyFigure sex={b.sex} width={240} variant="solid" garment={draft.garment} glow={false} className="h-[94%] w-auto" />
                {isDress ? (<>
                  <span className="glass-2 absolute left-8 top-[22%] rounded-full px-4 py-2 text-[13px]">{draft.sleeve} sleeve</span>
                  <span className="glass-2 absolute right-8 top-[38%] rounded-full px-4 py-2 text-[13px]">Fitted waist · +{draft.ease} cm</span>
                  <span className="glass-2 absolute bottom-[26%] left-8 rounded-full px-4 py-2 text-[13px]">Midi · {draft.lengthCm} cm</span>
                </>) : <span className="glass-2 absolute right-8 top-[38%] rounded-full px-4 py-2 text-[13px]">Graded to {b.name}</span>}
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
          <h1 className="mt-2 text-[44px] font-semibold leading-tight tracking-tight">{name}</h1>
          <div className="mt-6 w-[280px]"><Segmented items={["Realistic", "Pattern"]} value={view} onChange={setView} /></div>
          <div className="mt-8 grid grid-cols-3 gap-3">{[[String(pieces.length).padStart(2, "0"), "Pieces"], [String(draft.seam ?? 1.5), "cm SA"], [String(draft.ease), "cm ease"]].map(([v, l]) => (
            <Glass key={l} className="rounded-[20px] px-4 py-4"><div className="serif text-[40px] leading-none">{v}</div><div className="eyebrow mt-2 text-[9px]">{l}</div></Glass>
          ))}</div>
          <Glass className="mt-4 rounded-[22px] p-5">
            <Eyebrow className="text-[10px]">Details</Eyebrow>
            <div className="mt-2 divide-y divide-white/6 text-[14px]">{[["Fabric", draft.fabric], ["Stretch", draft.stretch], ["Sleeve", draft.sleeve], ["Length", `${draft.lengthCm} cm`]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><span className="text-white/60">{k}</span><span>{v}</span></div>)}</div>
          </Glass>
          <p className="mt-4 text-[13px] text-white/45">Make edits before printing, or continue if it looks right.</p>
        </div>
      </div>
    </Screen>
  );
  return (
    <Screen footer={<><Eyebrow className="mb-2 text-center text-[9px]">Make edits before printing?</Eyebrow><div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Make edits</Pill><Pill className="flex-1" onClick={() => go("seam")}>Looks right</Pill></div></>}>
      <TopBar left="back" onLeft={() => useApp.getState().home()} eyebrow={`AI garment · V${draft.version}`} right="more" onRight={() => go("edits")} />
      <h1 className="mt-2 text-center text-[24px] font-semibold tracking-tight">{name}</h1>
      <div className="mt-3 flex justify-center"><div className="w-[220px]"><Segmented items={["Realistic", "Pattern"]} value={view} onChange={setView} /></div></div>
      <AnimatePresence mode="wait">
        {view === "Realistic" ? (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mt-3 flex h-[min(470px,54dvh)] justify-center">
            <Blob className="left-1/2 top-1/3 h-[260px] w-[220px] -translate-x-1/2 opacity-40" />
            <BodyFigure sex={b.sex} width={180} variant="solid" garment={draft.garment} glow={false} className="h-full w-auto" />
            {draft.garment === "flutter" || templateBy(draft.garment).category === "Dresses" ? (
              <>
                <span className="glass-2 absolute left-0 top-[20%] rounded-full px-3 py-1.5 text-[11px]">{draft.sleeve} sleeve</span>
                <span className="glass-2 absolute right-0 top-[36%] rounded-full px-3 py-1.5 text-[11px]">Fitted waist · +{draft.ease} cm</span>
                <span className="glass-2 absolute bottom-[26%] left-0 rounded-full px-3 py-1.5 text-[11px]">Midi · {draft.lengthCm} cm</span>
              </>
            ) : (
              <span className="glass-2 absolute right-0 top-[38%] rounded-full px-3 py-1.5 text-[11px]">Graded to {b.name}</span>
            )}
          </motion.div>
        ) : (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass mt-3 grid grid-cols-3 place-items-center gap-3 rounded-[24px] p-4" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
              {pieces.map((k) => <Piece key={k} k={k} width={86} label={k.replace(/([A-Z])/g, " $1")} />)}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">{[[String(pieces.length).padStart(2, "0"), "Pieces"], [String(draft.seam ?? 1.5), "cm SA"], ["ME", "Body"]].map(([v, l]) => (
              <Glass key={l} className="flex items-baseline gap-2 rounded-[16px] px-3 py-2.5"><span className="serif text-[24px]">{v}</span><span className="eyebrow text-[8px]">{l}</span></Glass>
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
        <span className="absolute left-4 top-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.06em]">V{draft.version + 1} · {draft.lengthCm > 104 ? "Longer hem" : draft.lengthCm < 104 ? "Shorter hem" : "Your edits"}</span>
        <RB icon="move" size={38} className="absolute right-4 top-4" />
        <BodyFigure sex={b.sex} width={64} variant="solid" garment={draft.garment} glow={false} className="h-full w-auto lg:h-[94%]" />
      </Glow>
      </>} right={<>
      <H1 className="hidden lg:block">Make it yours</H1>
      <Glass className="mt-3 rounded-[24px] px-4 pb-2 pt-4 lg:mt-6 lg:px-6 lg:pt-6">
        {([["Length", "lengthCm", 80, 130], ["Neckline depth", "neckline", 4, 22]] as const).map(([l, k, mn, mx]) => (
          <div key={k} className="mb-1">
            <div className="flex items-baseline justify-between"><span className="text-[14px] font-medium">{l}</span><span className="flex items-baseline gap-2"><span className="serif text-[34px] leading-none">{draft[k]}</span><span className="text-[10px] uppercase text-white/50">cm</span></span></div>
            <Ruler value={draft[k]} min={mn} max={mx} step={1} px={14} onChange={(v) => setDraft({ [k]: v } as never)} />
          </div>
        ))}
      </Glass>
      <Eyebrow className="mt-4 text-[9px]">Sleeve</Eyebrow>
      <div className="mt-2 flex gap-2">{["Cap", "Flutter", "Short", "3/4", "None"].map((s) => <Chip key={s} on={draft.sleeve === s} onClick={() => setDraft({ sleeve: s })}>{s}</Chip>)}</div>
      <label className="glass mt-4 flex h-[54px] items-center gap-3 rounded-[18px] px-4"><Icon name="sparkle" size={18} className="text-peri" /><input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && regen()} placeholder="Tell Venty what to change…" className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/40" /><Icon name="mic" size={18} className="text-white/60" /></label>
      </>} />
    </Screen>
  );
}
