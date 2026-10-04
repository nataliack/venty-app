"use client";
import { haptic } from "@/lib/haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { FLUTTER, templateBy, type GarmentKey, type PieceKey } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, HS, Lead, Pill, Glow, Glass, Chip, RB, Arrows, Check, Option, Segmented, Sheet, cx, Blob, Field, Split, useDesk } from "@/components/ui";
import { BodyFigure, Piece, Ruler } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";
import { FlowHeader } from "./measure";

export const garmentName = (g: GarmentKey) => (g === "flutter" ? FLUTTER.name : templateBy(g).name);
export const piecesFor = (g: GarmentKey): PieceKey[] => (g === "flutter" ? ["bodiceFront", "bodiceBack", "sleeve", "skirtFront", "skirtBack", "facing"] : templateBy(g).pieceSet);

// Reference thumbnail: your photo and sketch (merged into one image in the studio), or an illustrated stand-in.
export function RefImage({ className }: { className?: string }) {
  const draft = useApp((s) => s.draft);
  // eslint-disable-next-line @next/next/no-img-element
  if (draft.photo) return <img src={draft.photo} alt="Your photo and sketch" className={cx("h-full w-full bg-[#121427] object-contain", className)} />;
  return (
    <div className={cx("relative grid h-full w-full place-items-center overflow-hidden", className)} style={{ background: "linear-gradient(160deg,#8c9cf8,#4f63e0 60%,#2b3470)" }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.5) 1px, transparent 1.2px)", backgroundSize: "6px 6px" }} />
      <BodyFigure width={90} variant="solid" garment={draft.garment} glow={false} dim={0.35} />
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
  const pic = useRef<HTMLImageElement>(null);
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
  // merge the photo (fitted the way it is shown) and the sketch into one picture for the next steps
  const merge = () => {
    const c = cv.current; if (!c || !c.width) return undefined;
    const out = document.createElement("canvas"); out.width = c.width; out.height = c.height;
    const g = out.getContext("2d"); if (!g) return undefined;
    g.fillStyle = "#121427"; g.fillRect(0, 0, out.width, out.height);
    const img = pic.current;
    if (photo && img?.naturalWidth) {
      const pad = 16 * (window.devicePixelRatio || 1), k = Math.min((out.width - pad * 2) / img.naturalWidth, (out.height - pad * 2) / img.naturalHeight);
      const w = img.naturalWidth * k, h = img.naturalHeight * k; g.drawImage(img, (out.width - w) / 2, (out.height - h) / 2, w, h);
    }
    g.drawImage(c, 0, 0);
    try { return out.toDataURL("image/jpeg", 0.82); } catch { return photo ?? undefined; }
  };
  const next = () => {
    setDraft({ photo: merge(), source: photo ? "photo" : "sketch", garment: "flutter", chosen: {} });
    go("ref");
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
      {photo && <img ref={pic} src={photo} alt="Your garment photo" className="pointer-events-none absolute inset-0 h-full w-full object-contain p-4" />}
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

// P04–P07 · check the garment, then choose the fit, then the fabric. One step each, with a progress bar.
const MAKE_STEPS = ["Garment", "Fit", "Fabric"];
const exitMake = () => {
  const s = useApp.getState(); const at = s.stack.map((r) => r.id).lastIndexOf("prompt");
  if (at >= 0) useApp.setState({ stack: s.stack.slice(0, at + 1), dir: -1 }); else s.back();
};
const MakeHeader = ({ step, sub }: { step: number; sub: number }) => <FlowHeader steps={MAKE_STEPS.map((label, i) => ({ label, value: i < step ? 1 : i === step ? sub : 0 }))} onClose={exitMake} />;
const FITS = [["Close", 1, "Skims the body"], ["Easy", 4, "A little room to move"], ["Loose", 8, "Relaxed and flowing"]] as const;
const fitOf = (ease: number) => (ease <= 2 ? 0 : ease >= 7 ? 2 : 1);

// Fit dial: a needle on a half circle points at Close, Easy or Loose and swings when you change it.
function FitDial({ pick }: { pick: number | null }) {
  const angles = [-58, 0, 58];
  const ox = 150, oy = 150, r = 112;
  const pt = (deg: number, rad: number) => [ox + rad * Math.sin((deg * Math.PI) / 180), oy - rad * Math.cos((deg * Math.PI) / 180)];
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="pointer-events-none absolute inset-x-[-20%] top-[10%] h-[120%]" style={{ background: "radial-gradient(50% 50% at 50% 55%, rgb(104 126 245 / .38), rgb(104 126 245 / .12) 45%, transparent 75%)", filter: "blur(24px)" }} />
      <div className="relative">
      <svg viewBox="0 0 300 172" className="relative w-full" aria-hidden>
        <path d={`M ${pt(-90, r).join(" ")} A ${r} ${r} 0 0 1 ${pt(90, r).join(" ")}`} fill="none" stroke="rgb(255 255 255 / .14)" strokeWidth="14" strokeLinecap="round" />
        {Array.from({ length: 19 }, (_, i) => -90 + i * 10).map((d) => { const [x1, y1] = pt(d, r - 22); const [x2, y2] = pt(d, r - (d % 30 === 0 ? 32 : 27)); return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(255 255 255 / .3)" strokeWidth="1.4" />; })}
        {FITS.map(([l], i) => { const [x, y] = pt(angles[i], r + 0); return <circle key={l} cx={x} cy={y} r={pick === i ? 7 : 4} fill={pick === i ? "#fff" : "rgb(255 255 255 / .45)"} style={{ transition: "r .3s, fill .3s" }} />; })}
      </svg>
      {/* the needle is an HTML element so it always turns around the dial's centre */}
      <motion.span initial={false} animate={{ rotate: pick === null ? 0 : angles[pick], opacity: pick === null ? 0.25 : 1 }} transition={{ type: "spring", stiffness: 140, damping: 14 }}
        className="absolute w-[4px] rounded-full bg-white" style={{ left: "50%", bottom: `${((172 - oy) / 172) * 100}%`, height: `${((r - 30) / 172) * 100}%`, translate: "-50% 0", transformOrigin: "50% 100%", marginBottom: 0 }} />
      <span className="absolute grid h-[22px] w-[22px] place-items-center rounded-full bg-white" style={{ left: "50%", bottom: `${((172 - oy) / 172) * 100}%`, translate: "-50% 50%" }}><span className="h-2 w-2 rounded-full bg-primary" /></span>
      </div>
      <div className="relative -mt-1 grid grid-cols-3 text-center text-[15px]">{FITS.map(([l], i) => <span key={l} className={cx("transition-colors", pick === i ? "font-medium text-white" : "text-white/50")}>{l}</span>)}</div>
    </div>
  );
}

export function AIRead({ p }: { p?: Record<string, unknown> }) {
  const { go, draft, setDraft } = useApp();
  const tab = (p?.tab as string) ?? "Overview";
  const chosen = draft.chosen ?? {};
  const [pick, setPick] = useState<string | null>(null);
  const [read, setRead] = useState(FLUTTER.read);
  const opts: Record<string, string[]> = { Sleeves: ["Flutter", "Short", "Cap", "None"], Neckline: ["V-neck", "Round", "Square"], Length: ["Knee", "Midi", "Maxi"], Waist: ["Fitted", "Relaxed", "Tie"], Skirt: ["A-line", "Straight", "Bias"], Fastening: ["Back zip", "Buttons", "Pull-on"] };
  const fit = chosen.fit ? fitOf(draft.ease) : null;
  const choose = (patch: Partial<typeof draft>, key: "fit" | "fabric" | "stretch") => setDraft({ ...patch, chosen: { ...chosen, [key]: true } });
  const ref = <div className="h-full overflow-hidden rounded-[24px] border border-white/15"><RefImage /></div>;
  const val = (k: string) => read.find(([x]) => x === k)?.[1] ?? "";

  if (tab === "Fitting") return (
    <Screen header={<MakeHeader step={1} sub={fit === null ? 0 : 0.5} />} footer={<Arrows ready={fit !== null} onNext={() => go("ai", { tab: "Fabric" })} />}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">How should<br />it fit?</HS>
        <Lead className="mt-3">Ease is the extra room between your body and the fabric.</Lead>
      </>} right={<>
        <div className="mt-6 lg:mt-0"><FitDial pick={fit} /></div>
        <div className="mt-6 grid grid-cols-3 gap-2.5" data-need={fit === null ? "1" : "0"}>{FITS.map(([l, e, d], i) => (
          <Option key={l} on={fit === i} radio={false} onClick={() => choose({ ease: e }, "fit")} className="flex min-h-[104px] flex-col justify-between rounded-[20px] p-3.5">
            <span className="text-[17px] font-medium">{l}</span>
            <span><span className="block text-[14px] text-white/60">+{e} cm</span><span className="block text-[13px] leading-snug text-white/45">{d}</span></span>
          </Option>
        ))}</div>
      </>} />
    </Screen>
  );

  if (tab === "Fabric") {
    const ready = !!chosen.fabric && !!chosen.stretch;
    return (
      <Screen header={<MakeHeader step={2} sub={(chosen.fabric ? 0.5 : 0) + (chosen.stretch ? 0.4 : 0)} />} footer={<Arrows ready={ready} onNext={() => go("generating")} label="Create my pattern" />}>
        <Split center={false} className="lg:mt-6" left={<>
          <HS className="mt-4 lg:mt-0">Tell us about<br />the fabric</HS>
          <Lead className="mt-3">It changes how much room and drape we build into the pattern.</Lead>
        </>} right={<>
          <div className="mt-6 text-[16px] font-medium text-white/85 lg:mt-0">Fabric type</div>
          <div className="mt-2.5 flex flex-wrap gap-2" data-need={chosen.fabric ? "0" : "1"}>{["Cotton poplin", "Linen", "Viscose crepe", "Satin", "Jersey", "Denim"].map((f) => <Chip key={f} on={!!chosen.fabric && draft.fabric === f} onClick={() => choose({ fabric: f }, "fabric")} className="!h-11 !px-4 !text-[15px]">{f}</Chip>)}</div>
          <div className="mt-6 text-[16px] font-medium text-white/85">Does it stretch?</div>
          <div className="mt-2.5 flex flex-col gap-2" data-need={chosen.stretch ? "0" : "1"}>{([["No", "It doesn’t move"], ["A bit", "It gives when you pull"], ["A lot", "Stretches and springs back"]] as const).map(([k, d]) => (
            <Option key={k} on={!!chosen.stretch && draft.stretch === k} onClick={() => choose({ stretch: k }, "stretch")} className="flex h-[56px] items-center gap-4 rounded-[16px] px-4"><span className="w-14 text-[16px] font-medium">{k}</span><span className="flex-1 text-[15px] text-white/60">{d}</span></Option>
          ))}</div>
          <div className="mt-6 text-[16px] font-medium text-white/85">Stiff or soft?</div>
          <div className="card-soft mt-2.5 rounded-[20px] p-4">
            <div className="flex justify-between text-[14px] text-white/65"><span>Stiff</span><span>Drapes</span></div>
            <input type="range" min={0} max={100} value={Math.round(draft.drape * 100)} onChange={(e) => setDraft({ drape: Number(e.target.value) / 100 })} className="mt-3 w-full accent-white" />
            <div className="mt-1 text-[15px] text-white/75">{draft.drape > 0.6 ? "Soft: a gentle, fluid drape" : draft.drape > 0.3 ? "Medium: keeps some shape" : "Crisp: holds its shape"}</div>
          </div>
        </>} />
      </Screen>
    );
  }

  // Overview: what we read from your photo or sketch. Tap a detail to change it.
  return (
    <Screen header={<MakeHeader step={0} sub={0.5} />} footer={<Arrows onNext={() => go("ai", { tab: "Fitting" })} label="Looks right" />}>
      <Split cols="lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" left={<>
        <HS className="mt-4 lg:mt-0">Here’s what<br />we read</HS>
        <Lead className="mt-3">Check the garment. Tap any detail to change it.</Lead>
        <div className="mt-6 hidden h-[min(420px,46dvh)] lg:block">{ref}</div>
      </>} right={<>
        <div className="mt-5 flex gap-3 lg:mt-0">
          <div className="h-[150px] w-[118px] shrink-0 lg:hidden">{ref}</div>
          <div className="card-soft flex-1 rounded-[24px] p-4 lg:p-6">
            <div className="text-[14px] text-white/60">Garment</div>
            <div className="mt-1 text-[24px] tracking-[-.02em] lg:text-[30px]">{val("Length")} dress</div>
            <div className="mt-1 text-[15px] leading-snug text-white/65">{val("Sleeves")} sleeves, {val("Neckline").toLowerCase()}, {val("Length").toLowerCase()} length, {val("Waist").toLowerCase()} waist.</div>
          </div>
        </div>
        <div className="card-soft mt-3 rounded-[24px] px-4 pb-1 pt-3 lg:px-6">
          <div className="text-[14px] text-white/60">Details</div>
          <div className="mt-1 divide-y divide-white/8">{read.map(([k, v]) => (
            <button key={k} onClick={() => setPick(k)} className="flex min-h-[52px] w-full items-center justify-between text-[16px]"><span className="text-white/80">{k}</span><span className="flex items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-[15px]">{v}</span><Icon name="chevR" size={16} className="text-white/40" /></span></button>
          ))}</div>
        </div>
      </>} />
      <Sheet open={!!pick} onClose={() => setPick(null)}>
        <h3 className="text-[22px] font-normal tracking-[-.02em]">{pick}</h3>
        <div className="mt-4 flex flex-col gap-2">{pick && opts[pick].map((o) => (
          <Option key={o} on={read.find(([k]) => k === pick)?.[1] === o} onClick={() => { setRead(read.map(([k, v]) => [k, k === pick ? o : v])); setPick(null); }} className="flex h-[56px] items-center rounded-[16px] px-4"><span className="text-[16px]">{o}</span></Option>
        ))}</div>
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
