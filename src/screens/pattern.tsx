"use client";
import { haptic } from "@/lib/haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { FLUTTER, FITS, fitName, fabricAdvice, templateBy, type GarmentKey, type PieceKey } from "@/lib/data";
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
  const [text, setText] = useState("");
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
  const ready = !!photo || n > 0 || text.trim().length > 0;
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
    setDraft({ photo: photo || n ? merge() : undefined, source: photo ? "photo" : n ? "sketch" : "voice", prompt: text.trim() || undefined, garment: "flutter", chosen: {}, details: undefined });
    go("ref");
  };

  const tool = (icon: IconName, label: string, fn: () => void, on = true) => (
    <button onClick={fn} disabled={!on} className={cx("tap flex h-12 items-center gap-2 rounded-full border border-white/15 px-4 text-[15px] font-medium transition-opacity", !on && "opacity-35")}><Icon name={icon} size={18} />{label}</button>
  );
  const tools = (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => file.current?.click()} className="tap flex h-12 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-medium text-bg"><Icon name="image" size={18} />{photo ? "Change photo" : "Add a photo"}</button>
      {tool("refresh", "Undo", undo, n > 0)}
      {tool("trash", "Clear", clear, !!photo || n > 0)}
    </div>
  );
  const canvas = (
    <div className={cx("relative overflow-hidden rounded-[28px] border border-white/15 bg-[#121427]", desk ? "h-[min(520px,54dvh)]" : "h-[min(380px,44dvh)]")} style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / .12) 1px, transparent 1.3px)", backgroundSize: "18px 18px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {photo && <img ref={pic} src={photo} alt="Your garment photo" className="pointer-events-none absolute inset-0 h-full w-full object-contain p-4" />}
      {!photo && n === 0 && (
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
        <Lead className="mt-3 max-w-[420px]">Add a photo, sketch your idea and describe it. Use one, or mix all three.</Lead>
      </>} right={<div className="mt-5 lg:mt-0" data-need={ready ? "0" : "1"}>
        <label className="block">
          <span className="mb-2 block text-[15px] font-medium text-white/80">Describe it</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="e.g. a midi wrap dress with flutter sleeves" className="field block w-full resize-none bg-transparent px-4 py-3 text-[16px] leading-snug outline-none placeholder:text-white/35" />
        </label>
        <div className="mt-4">{tools}</div>
        <div className="mt-3">{canvas}</div>
      </div>} />
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
// Fit preview: the body inside a dress silhouette. The more ease, the roomier the dress: bodice, waist and skirt
// all widen, so tight hugs the body and oversized becomes a big, loose dress.
const smooth = (pts: number[][]) => { // Catmull-Rom through the points, as cubic curves
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
};
const dressOutline = (ease: number) => {
  const k = Math.max(0, ease); const w = (base: number, f: number) => base + k * f; // half-widths from the centre line (x = 100)
  const side = [[86, 86], [100 - w(34, 0.25), 94], [100 - w(52, 0.75), 116], [100 - w(46, 0.75), 134], [100 - w(50, 1.1), 152], [100 - w(36, 1.25), 205], [100 - w(52, 1.5), 268], [100 - w(64, 2.0), 340], [100 - w(76, 2.4), 410]];
  const left = smooth(side);
  const right = smooth(side.map(([x, y]) => [200 - x, y]).reverse());
  const hemL = side[side.length - 1], hemR = [200 - hemL[0], hemL[1]];
  return `${left} Q 100 ${hemL[1] + 10 + k * 0.3} ${hemR[0]} ${hemR[1]} ${right.replace(/^M [^C]+/, "")} L 100 108 Z`;
};
const waistSeam = (ease: number) => { const x = 36 + Math.max(0, ease) * 1.25; return `M ${100 - x} 205 Q 100 210 ${100 + x} 205`; };
function FitPreview({ ease, sex, on }: { ease: number; sex: "female" | "male"; on: boolean }) {
  const spring = { type: "spring" as const, stiffness: 110, damping: 18 };
  return (
    <div className="relative mx-auto h-[min(300px,33dvh)] w-full max-w-[320px] lg:h-[min(440px,48dvh)]">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 50% at 50% 50%, rgb(104 126 245 / .32), transparent 75%)", filter: "blur(18px)" }} />
      <BodyFigure sex={sex} width={110} glow={false} className="absolute inset-0 h-full w-full" />
      <svg viewBox="-10 -6 220 542" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }} aria-hidden>
        <motion.path initial={false} animate={{ d: dressOutline(ease), opacity: on ? 1 : 0.4 }} transition={spring} fill="rgb(140 156 248 / .3)" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <motion.path initial={false} animate={{ d: waistSeam(ease), opacity: on ? 0.7 : 0.25 }} transition={spring} fill="none" stroke="#fff" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

export function AIRead({ p }: { p?: Record<string, unknown> }) {
  const { go, draft, setDraft } = useApp();
  const tab = (p?.tab as string) ?? "Overview";
  const chosen = draft.chosen ?? {};
  const [pick, setPick] = useState<string | null>(null);
  const [read, setRead] = useState<[string, string][]>(draft.details ?? FLUTTER.read);
  const opts: Record<string, string[]> = {
    Sleeves: ["Sleeveless", "Cap", "Short", "Flutter", "Puff", "Elbow", "Three-quarter", "Long", "Bell"],
    Neckline: ["V-neck", "Round", "Scoop", "Square", "Sweetheart", "Boat", "High neck", "Halter", "Off-shoulder", "Cowl"],
    Length: ["Extra mini", "Mini", "Above the knee", "Knee", "Midi", "Maxi"],
    Waist: ["Fitted", "Relaxed", "Tie", "Elastic", "Empire", "Drop waist", "Belted"],
    Skirt: ["A-line", "Straight", "Bodycon", "Bias cut", "Pencil", "Pleated", "Full circle", "Wrap", "Tiered", "Mermaid"],
    Fastening: ["Back zip", "Side zip", "Buttons", "Wrap tie", "Pull-on", "Hook and eye"],
  };
  const choose = (patch: Partial<typeof draft>, key: "fit" | "fabric" | "stretch") => setDraft({ ...patch, chosen: { ...chosen, [key]: true } });
  const ref = <div className="h-full overflow-hidden rounded-[24px] border border-white/15"><RefImage /></div>;
  const val = (k: string) => read.find(([x]) => x === k)?.[1] ?? "";

  if (tab === "Fitting") {
    const preset = FITS.find((f) => f.ease === draft.ease);
    const setEase = (e: number) => choose({ ease: Math.max(0, Math.min(30, e)) }, "fit");
    return (
      <Screen header={<MakeHeader step={1} sub={chosen.fit ? 0.5 : 0} />} footer={<Arrows ready={!!chosen.fit} onNext={() => go("ai", { tab: "Fabric" })} />}>
        <Split left={<>
          <HS className="mt-4 lg:mt-0">How should<br />it fit?</HS>
          <Lead className="mt-3">Ease is the extra room between your body and the garment. Watch the dress grow as you add more.</Lead>
          <div className="mt-4"><FitPreview ease={draft.ease} sex={useApp.getState().body().sex} on={!!chosen.fit} /></div>
        </>} right={<>
          <div className="mt-5 grid grid-cols-2 gap-2.5 lg:mt-0" data-need={chosen.fit ? "0" : "1"}>{FITS.map((f) => (
            <Option key={f.key} on={!!chosen.fit && preset?.key === f.key} radio={false} onClick={() => setEase(f.ease)} className="flex min-h-[86px] flex-col justify-between rounded-[20px] p-3.5">
              <span className="flex items-baseline justify-between"><span className="text-[17px] font-medium">{f.label}</span><span className="text-[14px] text-white/60">+{f.ease} cm</span></span>
              <span className="text-[14px] leading-snug text-white/55">{f.note}</span>
            </Option>
          ))}</div>
          <div className={cx("card-soft mt-2.5 flex items-center gap-3 rounded-[20px] p-3 pl-4", chosen.fit && !preset && "!border-primary")}>
            <span className="flex-1"><span className="block text-[16px] font-medium">Your own</span><span className="block text-[14px] text-white/55">Any amount, up to 30 cm</span></span>
            <RB icon="minus" size={44} className="rb-plain" onClick={() => setEase(draft.ease - 1)} label="Less room" />
            <span className="w-[64px] text-center"><span className="serif text-[26px] leading-none">+{draft.ease}</span><span className="unit ml-1" translate="no">cm</span></span>
            <RB icon="plus" size={44} className="rb-plain" onClick={() => setEase(draft.ease + 1)} label="More room" />
          </div>
        </>} />
      </Screen>
    );
  }

  if (tab === "Fabric") {
    const tip = fabricAdvice(draft.ease);
    const stretchLabel = { "A lot": "Stretchy", "A bit": "A little stretch", No: "No stretch" } as const;
    const off = chosen.stretch && draft.stretch !== tip.stretch;
    return (
      <Screen header={<MakeHeader step={2} sub={chosen.stretch ? 0.5 : 0} />} footer={<Arrows ready={!!chosen.stretch} onNext={() => go("generating")} label="Create my pattern" />}>
        <Split center={false} className="lg:mt-6" left={<>
          <HS className="mt-4 lg:mt-0">Choose your<br />fabric</HS>
          <Lead className="mt-3">Based on your {fitName(draft.ease).toLowerCase()} fit, here is what to look for. You can choose something else.</Lead>
          <div className="start-main mt-5 rounded-[24px] p-5">
            <div className="text-[14px] text-white/80">We suggest</div>
            <div className="mt-1 text-[22px] tracking-[-.02em]">{tip.title}</div>
            <div className="mt-1.5 text-[15px] leading-snug text-white/85">{tip.why}</div>
          </div>
        </>} right={<>
          <div className="mt-6 text-[16px] font-medium text-white/85 lg:mt-0">Does your fabric stretch?</div>
          <div className="mt-2.5 flex flex-col gap-2" data-need={chosen.stretch ? "0" : "1"}>{([["No", "It doesn’t move"], ["A bit", "It gives when you pull"], ["A lot", "Stretches and springs back"]] as const).map(([k, d]) => (
            <Option key={k} on={!!chosen.stretch && draft.stretch === k} onClick={() => choose({ stretch: k }, "stretch")} className="flex h-[58px] items-center gap-4 rounded-[16px] px-4"><span className="w-[124px] text-[16px] font-medium">{stretchLabel[k]}</span><span className="flex-1 text-[15px] text-white/60">{d}</span></Option>
          ))}</div>
          {off && <p className="mt-2.5 flex items-start gap-2 text-[15px] leading-snug text-white/65"><Icon name="info" size={18} className="mt-px shrink-0" />That works too. Your fit was planned for {tip.title.toLowerCase()}, so try the garment on as you sew.</p>}
        </>} />
      </Screen>
    );
  }

  // Overview: what we read from your photo or sketch. Tap a detail to change it.
  return (
    <Screen header={<MakeHeader step={0} sub={0.5} />} footer={<Arrows onNext={() => { setDraft({ details: read }); go("ai", { tab: "Fitting" }); }} label="Looks right" />}>
      <Split cols="lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" left={<>
        <HS className="mt-4 lg:mt-0">Let’s check<br />your garment</HS>
        <Lead className="mt-3">Make sure every detail is exactly how you want it. Tap one to change it.</Lead>
        <div className="mt-6 hidden h-[min(420px,46dvh)] lg:block">{ref}</div>
      </>} right={<>
        <div className="mt-5 flex gap-3 lg:mt-0">
          <div className="h-[150px] w-[118px] shrink-0 lg:hidden">{ref}</div>
          <div className="card-soft flex-1 rounded-[24px] p-4 lg:p-6">
            <div className="text-[14px] text-white/60">Garment</div>
            <div className="mt-1 text-[24px] tracking-[-.02em] lg:text-[30px]">Dress</div>
            <div className="mt-1 text-[15px] leading-snug text-white/65">{val("Length")} length, {val("Sleeves").toLowerCase()} sleeves, {val("Neckline").toLowerCase()}, {val("Skirt").toLowerCase()} skirt.</div>
            {draft.prompt && <div className="mt-2 text-[14px] italic leading-snug text-white/50">“{draft.prompt}”</div>}
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
        <div className="mt-4 grid max-h-[56dvh] grid-cols-2 gap-2 overflow-y-auto noscroll">{pick && opts[pick].map((o) => (
          <Option key={o} on={read.find(([k]) => k === pick)?.[1] === o} radio={false} onClick={() => { setRead(read.map(([k, v]) => [k, k === pick ? o : v])); setPick(null); }} className="flex h-[54px] items-center rounded-[16px] px-4"><span className="text-[16px]">{o}</span></Option>
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
  const steps = ["Reading your design", "Drafting the pattern pieces", `Adding room for a ${fitName(draft.ease).toLowerCase()} fit`, `Fitting it to ${b.name}`];
  const dur = p?.quick ? 5000 : 9000; // slow enough to read every step
  useEffect(() => {
    const t0 = performance.now(); let raf = 0;
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setPct(Math.round(100 * (1 - Math.pow(1 - k, 1.6)))); if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => { haptic("success"); replace("garment"); }, 500); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [dur, replace]);
  const active = Math.min(3, Math.floor(pct / 25.5));
  return (
    <Screen fixed bg={<><Blob className="left-[-20%] top-[8%] h-[70%] w-[140%] opacity-70" /><Blob className="left-[20%] top-[20%] h-[40%] w-[60%] opacity-50" color="#c1c8d9" /></>}>
      <TopBar left="close" onLeft={() => useApp.getState().back()} />
      <div className="flex min-h-[calc(100dvh-var(--top)-var(--bottom)-80px)] flex-col items-center justify-center text-center">
        <div className="text-[17px] text-white/75 lg:text-[20px]">{p?.quick ? "Updating your pattern" : "Drafting your pattern"}</div>
        <div className="serif mt-3 text-[112px] leading-none tabular-nums lg:text-[200px]">{pct}%</div>
        <div className="mt-2 text-[18px] lg:text-[22px]">{garmentName(draft.garment)}</div>
        <div className="mt-8 h-[52px] lg:mt-12">
          <AnimatePresence mode="wait"><motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="text-[17px] text-white/85 lg:text-[19px]">{steps[active]}…</motion.div></AnimatePresence>
          <div className="mt-4 flex justify-center gap-1.5">{steps.map((_, i) => <span key={i} className={cx("h-1.5 rounded-full transition-all duration-500", i < active ? "w-6 bg-white" : i === active ? "w-10 bg-primary" : "w-6 bg-white/20")} />)}</div>
        </div>
      </div>
    </Screen>
  );
}

// P09 / P10 · the garment on your body, and its pattern pieces
export function Garment({ p }: { p?: Record<string, unknown> }) {
  const { go, draft, body, savePattern } = useApp();
  const b = body();
  const [view, setView] = useState((p?.view as string) ?? "On your body");
  const name = garmentName(draft.garment);
  const pieces = piecesFor(draft.garment);
  useEffect(() => { savePattern("Fitting"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const desk = useDesk();
  const footer = <div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Change the design</Pill><Pill className="flex-1" onClick={() => go("printMethod")}>Looks right</Pill></div>;
  const stage = (
    <AnimatePresence mode="wait">
      {view === "On your body" ? (
        <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cx("relative", desk ? "h-[min(620px,70dvh)]" : "mt-3 h-[min(460px,52dvh)]")}>
          <Blob className="left-1/2 top-1/3 h-[260px] w-[220px] -translate-x-1/2 opacity-40" />
          <BodyFigure sex={b.sex} width={180} variant="solid" garment={draft.garment} glow={false} className="relative h-full w-full" />
        </motion.div>
      ) : (
        <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className={cx("card-soft grid grid-cols-3 place-items-center gap-3 rounded-[28px] p-4", desk ? "h-[min(620px,70dvh)]" : "mt-3")} style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
            {pieces.map((k) => <Piece key={k} k={k} width={desk ? 130 : 86} label={k.replace(/([A-Z])/g, " $1")} />)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return (
    <Screen footer={footer}>
      <TopBar left="back" onLeft={() => useApp.getState().home()} />
      <div className={cx(desk && "mt-2 grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center gap-14")}>
        <div className={cx(!desk && "text-center")}>
          {!desk && <><h1 className="text-[26px] font-normal tracking-[-.02em]">{name}</h1><p className="mt-1 text-[15px] text-white/60">Drafted to {b.name} · {fitName(draft.ease).toLowerCase()} fit</p></>}
          <div className={cx("mt-3", !desk && "flex justify-center")}><div className="w-[260px]"><Segmented items={["On your body", "Pattern"]} value={view} onChange={setView} /></div></div>
          {stage}
        </div>
        {desk && (
          <div>
            <h1 className="text-[44px] font-normal leading-tight tracking-tight">{name}</h1>
            <p className="mt-2 text-[17px] text-white/60">Drafted to {b.name} · {fitName(draft.ease).toLowerCase()} fit, +{draft.ease} cm</p>
            <div className="card-soft mt-8 divide-y divide-white/8 rounded-[24px] px-5">{[["Pieces", String(pieces.length)], ["Fabric", draft.chosen?.fabric ? draft.fabric : "Your choice"], ["Stretch", draft.chosen?.stretch ? draft.stretch : "Not set"], ...(draft.details ?? FLUTTER.read).slice(0, 3)].map(([k, v]) => <div key={k} className="flex justify-between py-3.5 text-[16px]"><span className="text-white/60">{k}</span><span>{v}</span></div>)}</div>
          </div>
        )}
      </div>
    </Screen>
  );
}

// P11 · change the design: adjust, then update the pattern (one clear action)
export function Edits() {
  const { replace, draft, setDraft, body } = useApp();
  const b = body();
  const [prompt, setPrompt] = useState("");
  const update = () => { setDraft({ version: draft.version + 1 }); replace("generating", { quick: true }); };
  return (
    <Screen footer={<Arrows onNext={update} label="Update my pattern" />}>
      <TopBar left="back" />
      <Split center={false} className="lg:mt-4" cols="lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" left={<>
      <H1 className="mt-3 lg:hidden">Change the design</H1>
      <Lead className="mt-2 lg:hidden">Adjust anything below, then update your pattern.</Lead>
      <Glow color="#687ef5" variant="fade" className="relative mt-4 h-[180px] rounded-[28px] pt-3 lg:mt-0 lg:h-[min(620px,70dvh)] lg:rounded-[36px] lg:pt-8">
        <BodyFigure sex={b.sex} width={64} variant="solid" garment={draft.garment} glow={false} className="h-full w-full" />
      </Glow>
      </>} right={<>
      <H1 className="hidden lg:block">Change the design</H1>
      <Lead className="mt-2 hidden lg:block">Adjust anything below, then update your pattern.</Lead>
      <div className="card-soft mt-4 rounded-[24px] px-4 pb-2 pt-4 lg:mt-6 lg:px-6 lg:pt-6">
        {([["Length", "lengthCm", 80, 130], ["Neckline depth", "neckline", 4, 22]] as const).map(([l, k, mn, mx]) => (
          <div key={k} className="mb-1">
            <div className="flex items-baseline justify-between"><span className="text-[16px] font-medium">{l}</span><span className="flex items-baseline gap-1.5"><span className="serif text-[30px] leading-none">{draft[k]}</span><span className="unit" translate="no">cm</span></span></div>
            <Ruler value={draft[k]} min={mn} max={mx} step={1} px={14} onChange={(v) => setDraft({ [k]: v } as never)} />
          </div>
        ))}
      </div>
      <div className="mt-5 text-[16px] font-medium text-white/85">Sleeves</div>
      <div className="mt-2.5 flex flex-wrap gap-2">{["Sleeveless", "Cap", "Short", "Flutter", "Three-quarter", "Long"].map((x) => <Chip key={x} on={draft.sleeve === x} onClick={() => setDraft({ sleeve: x })} className="!h-11 !px-4 !text-[15px]">{x}</Chip>)}</div>
      <label className="mt-5 block">
        <span className="mb-2 block text-[16px] font-medium text-white/85">Anything else?</span>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="e.g. make the skirt fuller" className="field block w-full resize-none bg-transparent px-4 py-3 text-[16px] leading-snug outline-none placeholder:text-white/35" />
      </label>
      </>} />
    </Screen>
  );
}
