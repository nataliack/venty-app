"use client";
import { haptic } from "@/lib/haptics";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { FLUTTER, FITS, PIECE_LABEL, fitName, fabricAdvice, templateBy, type GarmentKey, type PieceKey } from "@/lib/data";
import { Screen, TopBar, TopAction, H1, HS, Lead, Pill, RB, Arrows, Option, Segmented, Sheet, SheetHead, cx, Split, useDesk, useToast } from "@/components/ui";
import { BodyFigure, Piece } from "@/components/art";
import { Icon } from "@/components/icons";
import { FlowHeader, MiniDial } from "./measure";
import { Ico, SI } from "@/components/studio-icons";

export const garmentName = (g: GarmentKey) => (g === "flutter" ? FLUTTER.name : templateBy(g).name);
export const piecesFor = (g: GarmentKey): PieceKey[] => (g === "flutter" ? ["bodiceFront", "bodiceBack", "sleeve", "skirtFront", "skirtBack", "facing"] : templateBy(g).pieceSet);

// Reference thumbnail: your photo and sketch (merged into one image in the studio), or an illustrated stand-in.
export function RefImage({ className }: { className?: string }) {
  const draft = useApp((s) => s.draft);
  // eslint-disable-next-line @next/next/no-img-element
  if (draft.photo) return <img src={draft.photo} alt="Your photo and sketch" className={cx("h-full w-full bg-[#121427] object-contain", className)} />;
  return (
    <div className={cx("violet-panel relative grid h-full w-full place-items-center overflow-hidden", className)}>
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
    <Screen footer={<Arrows hidePrev ready={pick !== null} onNext={next} />}>
      <TopBar left="back" />
      <Split left={<>
        <HS className="mt-3 lg:mt-0">Who is this<br />pattern for?</HS>
        <Lead className="mt-3">Pick a body. The pattern is drafted to its measurements.</Lead>
      </>} right={
        <div className="mt-6 flex flex-col gap-2.5 lg:mt-0 lg:gap-3" data-need={pick ? "0" : "1"}>
          {bodies.map((x) => (
            <Option key={x.id} on={pick === x.id} onClick={() => setPick(x.id)} radioAt="center" className="flex h-[84px] items-center gap-4 rounded-[24px] p-2.5 pr-14 lg:h-[96px]">
              <span className="grid h-full w-[54px] shrink-0 place-items-center overflow-hidden rounded-[16px] bg-primary/20 py-1.5"><BodyFigure sex={x.sex} width={22} glow={false} className="h-full w-full" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[17px] font-medium">{x.name}</span><span className="block text-[15px] text-white/60">{x.done.length} of 24 measurements</span></span>
            </Option>
          ))}
          <button onClick={() => startBody()} className="tap flex h-16 items-center gap-3 rounded-[22px] border border-dashed border-white/25 px-5 text-[16px] font-medium text-white/75 hover:border-white/50"><Icon name="plus" size={20} />New body</button>
        </div>} />
    </Screen>
  );
}

// P04–P07 · check the garment, then choose the fit, then the fabric. One step each, with a progress bar.
const MAKE_STEPS = ["Garment", "Fit", "Stretch"];
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
    <div className="relative mx-auto h-[min(220px,25dvh)] w-full max-w-[320px] lg:h-[min(440px,48dvh)]">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 50% at 50% 50%, rgb(104 126 245 / .32), transparent 75%)", filter: "blur(18px)" }} />
      <BodyFigure sex={sex} width={110} glow={false} className="absolute inset-0 h-full w-full" />
      <svg viewBox="-10 -6 220 542" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }} aria-hidden>
        <motion.path initial={false} animate={{ d: dressOutline(ease), opacity: on ? 1 : 0.4 }} transition={spring} fill="rgb(140 156 248 / .3)" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <motion.path initial={false} animate={{ d: waistSeam(ease), opacity: on ? 0.7 : 0.25 }} transition={spring} fill="none" stroke="#fff" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

// Every garment detail and the full range a sewist expects for it.
const DETAIL_OPTS: Record<string, string[]> = {
  Sleeves: ["Sleeveless", "Cap", "Short", "Flutter", "Puff", "Elbow", "Three-quarter", "Long", "Bell"],
  Neckline: ["V-neck", "Round", "Scoop", "Square", "Sweetheart", "Boat", "High neck", "Halter", "Off-shoulder", "Cowl"],
  Length: ["Extra mini", "Mini", "Above the knee", "Knee", "Midi", "Maxi"],
  Waist: ["Fitted", "Relaxed", "Tie", "Elastic", "Empire", "Drop waist", "Belted"],
  Skirt: ["A-line", "Straight", "Bodycon", "Bias cut", "Pencil", "Pleated", "Full circle", "Wrap", "Tiered", "Mermaid"],
  Fastening: ["Back zip", "Side zip", "Buttons", "Wrap tie", "Pull-on", "Hook and eye"],
};
// Pick one option for a detail (the garment check and Change the design share it).
function DetailSheet({ pick, value, onPick, onClose }: { pick: string | null; value?: string; onPick: (o: string) => void; onClose: () => void }) {
  return (
    <Sheet open={!!pick} onClose={onClose}>
      <SheetHead title={pick} />
      <div className="mt-4 grid max-h-[56dvh] grid-cols-2 gap-2 overflow-y-auto noscroll">{pick && DETAIL_OPTS[pick].map((o) => (
        <Option key={o} on={value === o} radio={false} onClick={() => onPick(o)} className="flex h-[54px] items-center rounded-[16px] px-4"><span className="text-[16px]">{o}</span></Option>
      ))}</div>
    </Sheet>
  );
}

// What you gave the studio, in full: every picture, your words and your pinned notes. Opened from the garment check,
// so the check itself stays short however much you added.
function BriefSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const draft = useApp((s) => s.draft);
  const refs = draft.refs ?? [];
  const notes = refs.flatMap((r) => r.pins ?? []).map((p) => p.note.trim()).filter(Boolean);
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="max-h-[72dvh] overflow-y-auto noscroll pb-2">
        <SheetHead title="What you asked for" />
        {refs.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">{refs.map((r) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={r.id} src={r.src} alt={r.kind === "photo" ? "Your photo" : "Your sketch"} className="aspect-[3/4] w-full rounded-[14px] bg-[#121427] object-cover" />
          ))}</div>
        )}
        {draft.prompt && <>
          <div className="mt-5 text-[14px] text-white/55">Your words</div>
          <p className="mt-1 whitespace-pre-wrap text-[16px] leading-snug text-white/85">{draft.prompt}</p>
        </>}
        {notes.length > 0 && <>
          <div className="mt-5 text-[14px] text-white/55">Your notes</div>
          <ol className="mt-1.5 space-y-1.5">{notes.map((n, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[16px] leading-snug text-white/85"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/12 text-[11px] leading-none tabular-nums">{i + 1}</span>{n}</li>
          ))}</ol>
        </>}
      </div>
      <Pill className="mt-4" variant="white" onClick={onClose}>Done</Pill>
    </Sheet>
  );
}

export function AIRead({ p }: { p?: Record<string, unknown> }) {
  const { go, draft, setDraft } = useApp();
  const tab = (p?.tab as string) ?? "Overview";
  const chosen = draft.chosen ?? {};
  const [pick, setPick] = useState<string | null>(null);
  const [brief, setBrief] = useState(false);
  const [custom, setCustom] = useState(() => !!chosen.fit && !FITS.some((f) => f.ease === draft.ease));
  const [read, setRead] = useState<[string, string][]>(draft.details ?? FLUTTER.read);
  const choose = (patch: Partial<typeof draft>, key: "fit" | "fabric" | "stretch") => setDraft({ ...patch, chosen: { ...chosen, [key]: true } });
  const val = (k: string) => read.find(([x]) => x === k)?.[1] ?? "";
  // the notes pinned on your pictures in the studio, in order
  const refs = draft.refs ?? [];
  const notes = refs.flatMap((r) => r.pins ?? []).map((p) => p.note.trim()).filter(Boolean);

  if (tab === "Fitting") {
    const preset = FITS.find((f) => f.ease === draft.ease);
    const setEase = (e: number) => choose({ ease: Math.max(0, Math.min(30, e)) }, "fit");
    const own = !!chosen.fit && (custom || !preset);
    return (
      <Screen header={<MakeHeader step={1} sub={chosen.fit ? 0.5 : 0} />} footer={<Arrows ready={!!chosen.fit} onNext={() => go("ai", { tab: "Fabric" })} />}>
        <Split left={<>
          <HS className="mt-4 lg:mt-0">How should it fit?</HS>
          <Lead className="mt-2">Ease is the room between your body and the garment.</Lead>
          <div className="mt-3"><FitPreview ease={draft.ease} sex={useApp.getState().body().sex} on={!!chosen.fit} /></div>
        </>} right={<>
          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:mt-0" data-need={chosen.fit ? "0" : "1"}>{FITS.map((f) => (
            <Option key={f.key} on={!!chosen.fit && !own && preset?.key === f.key} onClick={() => { setCustom(false); setEase(f.ease); }} className="flex flex-col justify-between rounded-[20px] p-3.5 pr-11">
              <span><span className="block text-[17px] font-medium leading-tight">{f.label}</span><span className="mt-0.5 block whitespace-nowrap text-[14px] text-white/75" translate="no">+{f.ease} cm</span></span>
              <span className="mt-1.5 text-[14px] leading-snug text-white/55">{f.note}</span>
            </Option>
          ))}</div>
          {/* your own amount: the same selectable card, with a stepper inside */}
          <Option on={own} onClick={() => { setCustom(true); setEase(draft.ease); }} radioAt="center" className="mt-2.5 flex items-center gap-2 rounded-[20px] py-3 pl-4 pr-12">
            <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium">Your own</span><span className="block text-[14px] text-white/55">Up to 30 cm</span></span>
            <span className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <RB icon="minus" size={40} className="rb-plain" onClick={() => { setCustom(true); setEase(draft.ease - 1); }} label="Less room" />
            <span className="w-[58px] text-center"><span className="serif text-[24px] leading-none">{draft.ease}</span><span className="unit ml-1" translate="no">cm</span></span>
            <RB icon="plus" size={40} className="rb-plain" onClick={() => { setCustom(true); setEase(draft.ease + 1); }} label="More room" />
            </span>
          </Option>
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
          <HS className="mt-4 lg:mt-0">How stretchy is your fabric?</HS>
          <Lead className="mt-3">Stretch changes how much room the pattern needs. Choose the fabric you plan to sew with.</Lead>
          {/* a suggestion is information, so it is plain text with an icon: no card, no button colour, nothing that looks chosen */}
          <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">
            <Icon name="info" size={20} className="mt-0.5 shrink-0 text-white/55" />
            <div>
              <div className="text-[16px] font-medium">For {/^[AEIOU]/.test(fitName(draft.ease)) ? "an" : "a"} {fitName(draft.ease).toLowerCase()} fit: {tip.title.toLowerCase()}</div>
              <div className="mt-1 text-[15px] leading-snug text-white/60">{tip.why}</div>
            </div>
          </div>
        </>} right={<>
          <div className="mt-4 flex flex-col gap-2 lg:mt-0" data-need={chosen.stretch ? "0" : "1"}>{([["No", "It doesn’t move"], ["A bit", "It gives when you pull"], ["A lot", "Stretches and springs back"]] as const).map(([k, d]) => (
            <Option key={k} on={!!chosen.stretch && draft.stretch === k} onClick={() => choose({ stretch: k }, "stretch")} radioAt="center" className="flex min-h-[64px] flex-col justify-center rounded-[18px] py-3 pl-4 pr-12"><span className="text-[17px] font-medium leading-tight">{stretchLabel[k]}</span><span className="mt-0.5 text-[15px] leading-snug text-white/60">{d}</span></Option>
          ))}</div>
          {off && <p className="mt-3 flex items-start gap-2 text-[15px] leading-snug text-white/65"><Icon name="info" size={18} className="mt-px shrink-0" />That works too. Your fit was planned for {tip.title.toLowerCase()}, so try the garment on as you sew.</p>}
        </>} />
      </Screen>
    );
  }

  // Overview: what we read from your photo or sketch. Tap a detail to change it. What you gave the studio stays one
  // short row (however much it was); the full brief opens in a sheet.
  const thumb = (
    <div className="relative h-full w-full overflow-hidden rounded-[18px] border border-white/12">
      <RefImage />
      {refs.length > 1 && <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[12px] leading-none tabular-nums backdrop-blur">+{refs.length - 1}</span>}
    </div>
  );
  const asked = [refs.length ? `${refs.length} ${refs.length === 1 ? "picture" : "pictures"}` : "", notes.length ? `${notes.length} ${notes.length === 1 ? "note" : "notes"}` : ""].filter(Boolean).join(", ");
  const hasBrief = !!draft.prompt || refs.length > 0 || notes.length > 0;
  return (
    <Screen header={<MakeHeader step={0} sub={0.5} />} footer={<Arrows onNext={() => { setDraft({ details: read }); go("ai", { tab: chosen.fit ? "Fabric" : "Fitting" }); }} label="Looks right" />}>
      <Split cols="lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" left={<>
        <HS className="mt-4 lg:mt-0">Let’s check your garment</HS>
        <Lead className="mt-3">Make sure every detail is how you want it. Tap one to change it.</Lead>
        <div className="mt-6 hidden h-[min(420px,46dvh)] lg:block">{thumb}</div>
      </>} right={<>
        <div className="card-soft mt-5 rounded-[24px] lg:mt-0">
          <div className="flex gap-3.5 p-3">
            <div className="h-[104px] w-[80px] shrink-0 lg:hidden">{thumb}</div>
            <div className="min-w-0 flex-1 py-1 lg:px-3 lg:py-2">
              <div className="text-[22px] tracking-[-.02em] lg:text-[30px]">Dress</div>
              <div className="mt-1 text-[15px] leading-snug text-white/65">{val("Length")} length, {val("Sleeves").toLowerCase()} sleeves, {val("Neckline").toLowerCase()}, {val("Skirt").toLowerCase()} skirt.</div>
            </div>
          </div>
          {hasBrief && (
            <button onClick={() => setBrief(true)} className="flex min-h-[52px] w-full items-center gap-3 border-t border-white/8 px-4 text-left">
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] text-white/55">What you asked for{asked && <span> · {asked}</span>}</span>
                {draft.prompt && <span className="block truncate text-[15px] text-white/85">“{draft.prompt}”</span>}
              </span>
              <span className="shrink-0 text-[14px] font-medium text-white/70">View</span><Icon name="chevR" size={16} className="-ml-2 shrink-0 text-white/40" />
            </button>
          )}
        </div>
        <div className="card-soft mt-3 rounded-[24px] px-4 pb-1 pt-3 lg:px-6">
          <div className="text-[14px] text-white/60">Details</div>
          <div className="mt-1 divide-y divide-white/8">{read.map(([k, v]) => (
            <button key={k} onClick={() => setPick(k)} className="flex min-h-[52px] w-full items-center justify-between text-[16px]"><span className="text-white/80">{k}</span><span className="flex items-center gap-2"><span className="text-[16px]">{v}</span><Icon name="chevR" size={16} className="text-white/40" /></span></button>
          ))}
            {/* the fit chosen in the studio shows here (and opens the fit step), so it is never asked twice */}
            {chosen.fit && <button onClick={() => go("ai", { tab: "Fitting" })} className="flex min-h-[52px] w-full items-center justify-between text-[16px]"><span className="text-white/80">Fit</span><span className="flex items-center gap-2"><span className="text-[16px]">{fitName(draft.ease)}, +{draft.ease} cm</span><Icon name="chevR" size={16} className="text-white/40" /></span></button>}
          </div>
        </div>
      </>} />
      <DetailSheet pick={pick} value={pick ? val(pick) : undefined} onClose={() => setPick(null)} onPick={(o) => { setRead(read.map(([k, v]) => [k, k === pick ? o : v])); setPick(null); }} />
      <BriefSheet open={brief} onClose={() => setBrief(false)} />
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
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setPct(100 * (1 - Math.pow(1 - k, 1.6))); if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => { haptic("success"); replace("garment"); }, 500); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [dur, replace]);
  const active = Math.min(3, Math.floor(pct / 25.5));
  // A light page, so drafting reads as its own moment (not one more dark working screen): the pieces draft themselves
  // on pattern paper one after another, a pen point at the end of each line, with the four stages listed underneath.
  // No big percentage: the number font has no % sign, and the drawing says more about what is happening.
  const pieces = piecesFor(draft.garment);
  const k = pct / 100;
  const per = 0.86 / pieces.length; // each piece's share of the time; the last bit is the pieces settling
  const desk = useDesk();
  return (
    <div className="cmp-page absolute inset-0 flex flex-col overflow-hidden">
      <div className="cmp-dots" aria-hidden="true" />
      <div className="relative z-10 shrink-0 px-6 lg:px-14" style={{ paddingTop: "var(--top)" }}>
        <div className="flex h-12 items-center"><button type="button" className="cmp-back" onClick={() => useApp.getState().back()} aria-label="Stop drafting"><Ico d={SI.x} size={18} weight={1.8} /></button></div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center" style={{ paddingBottom: "calc(var(--bottom) + 12px)" }}>
        <div className="relative w-full max-w-[340px] lg:max-w-[520px]">
          <div className="cmp-halo" aria-hidden="true" />
          <div className="pattern-mat is-raised relative rounded-[28px] p-5 lg:rounded-[36px] lg:p-8">
            <div className="grid grid-cols-3 place-items-center gap-x-3 gap-y-4">
              {pieces.map((pk, i) => (
                <Piece key={pk} k={pk} tone="light" width={desk ? 124 : 76} draw={Math.max(0, Math.min(1, (k - i * per) / per))} />
              ))}
            </div>
          </div>
        </div>
        <h1 className="h1 cmp-title relative mt-9 !text-[28px] lg:!text-[40px]">{p?.quick ? "Updating your pattern" : "Drafting your pattern"}</h1>
        <ol className="relative mt-5 flex w-full max-w-[280px] flex-col gap-2.5 text-left">{steps.map((t, i) => (
          <li key={i} className={cx("flex items-center gap-3 text-[15px] transition-colors duration-500", i < active ? "text-[#131523]/55" : i === active ? "text-[#131523]" : "text-[#131523]/30")}>
            <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full transition-all duration-500", i < active ? "bg-[#131523] text-white" : i === active ? "border-[1.5px] border-primary" : "border-[1.5px] border-[#131523]/20")}>
              {i < active ? <Icon name="check" size={11} strokeWidth={3} /> : i === active ? <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> : null}
            </span>
            {t}
          </li>
        ))}</ol>
      </div>
    </div>
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
  const { toast, node } = useToast();
  // the pattern is already saved ("Ready to print"), so leaving here keeps it in the library to print later
  const later = () => { toast("Saved to your patterns"); setTimeout(() => useApp.getState().home(), 700); };
  // two choices at the bottom (change it, or carry on to printing); leaving for now is a page action, top right
  const footer = <div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Change the design</Pill><Pill className="flex-1" onClick={() => go("printMethod")}>Looks right</Pill></div>;
  // Both views share one fixed height, so switching never moves the page. The light behind the figure is drawn inside
  // its own box and fades to nothing before the edges, so no scroll area can cut it into a line.
  const h = desk ? "h-[min(580px,62dvh)]" : "h-[min(440px,48dvh)]";
  const stage = (
    <div className={cx("relative mt-3", h)}>
      <AnimatePresence mode="wait" initial={false}>
        {view === "On your body" ? (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(closest-side, rgb(104 126 245 / .26), rgb(104 126 245 / .08) 55%, transparent)" }} />
            <BodyFigure sex={b.sex} width={180} variant="solid" garment={draft.garment} glow={false} className="relative h-full w-full" />
          </motion.div>
        ) : (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="pattern-mat absolute inset-0 rounded-[28px] lg:rounded-[36px]">
            <div className="grid h-full grid-cols-3 place-content-center place-items-center gap-x-2 gap-y-3 px-4 pb-9 pt-4">
              {pieces.map((k, i) => (
                <motion.div key={k} initial={{ opacity: 0, y: 14, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: (i % 3 - 1) * 4 }} transition={{ delay: 0.06 * i, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
                  <Piece k={k} tone="light" width={desk ? 150 : 92} label={PIECE_LABEL[k]} />
                </motion.div>
              ))}
            </div>
            <div className="absolute inset-x-4 bottom-3 flex items-baseline justify-between text-[13px] text-[#3c4b63]"><span>{pieces.length} pieces</span><span>Drafted to {b.name}</span></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return (
    <Screen footer={footer}>
      <TopBar left="back"><TopAction onClick={later}>Save for later</TopAction></TopBar>
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
      {node}
    </Screen>
  );
}

// P11 · change the design: adjust, then update the pattern (one clear action)
export function Edits() {
  const { replace, draft, setDraft, body } = useApp();
  const b = body();
  const [prompt, setPrompt] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const details = draft.details ?? FLUTTER.read;
  const val = (k: string) => details.find(([x]) => x === k)?.[1] ?? "";
  const update = () => { setDraft({ version: draft.version + 1 }); replace("generating", { quick: true }); };
  // the garment on the body, on the same quiet stage as the result screen (no primary-blue panel: that colour is for buttons)
  const preview = (h: string) => (
    <div className={cx("card-soft relative overflow-hidden rounded-[24px] lg:rounded-[36px]", h)}>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(closest-side, rgb(104 126 245 / .22), transparent)" }} />
      <BodyFigure sex={b.sex} width={64} variant="solid" garment={draft.garment} glow={false} className="relative h-full w-full py-3 lg:py-8" />
    </div>
  );
  return (
    <Screen footer={<Arrows hidePrev onNext={update} label="Update my pattern" />}>
      <TopBar left="back" />
      <Split center={false} className="lg:mt-4" cols="lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" left={<>
        {/* phones: the title beside a small preview, so the controls start high */}
        <div className="mt-2 flex items-center gap-4 lg:hidden">
          <div className="min-w-0 flex-1"><H1 className="!text-[30px]">Change the design</H1><Lead className="mt-2">Adjust anything, then update your pattern.</Lead></div>
          {preview("h-[150px] w-[104px] shrink-0")}
        </div>
        <div className="hidden lg:block">{preview("h-[min(620px,70dvh)]")}</div>
      </>} right={<>
        <H1 className="hidden lg:block">Change the design</H1>
        <Lead className="mt-2 hidden lg:block">Adjust anything, then update your pattern.</Lead>
        <div className="mt-5 grid grid-cols-2 gap-2.5 lg:mt-6">
          <MiniDial label="Shoulder to hem" value={draft.lengthCm} min={80} max={130} onChange={(v) => setDraft({ lengthCm: v })} />
          <MiniDial label="Neckline depth" value={draft.neckline} min={4} max={22} onChange={(v) => setDraft({ neckline: v })} />
        </div>
        {/* the details, as on the garment check: tap one to change it */}
        <div className="card-soft mt-2.5 grid grid-cols-2 rounded-[24px]">{details.map(([k, v], i) => (
          <button key={k} onClick={() => setPick(k)} className={cx("flex min-h-[60px] items-center gap-2 px-4 py-2.5 text-left", i % 2 === 1 && "border-l border-white/8", i > 1 && "border-t border-white/8")}>
            <span className="min-w-0 flex-1"><span className="block text-[13px] text-white/55">{k}</span><span className="block truncate text-[16px]">{v}</span></span>
            <Icon name="chevR" size={16} className="shrink-0 text-white/40" />
          </button>
        ))}</div>
        <label className="mt-5 block">
          <span className="mb-2 block text-[15px] font-medium text-white/80">Anything else?</span>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="For example, make the skirt fuller" className="field block w-full resize-none px-4 py-3 text-[16px] leading-snug outline-none placeholder:text-white/35" />
        </label>
      </>} />
      <DetailSheet pick={pick} value={pick ? val(pick) : undefined} onClose={() => setPick(null)} onPick={(o) => {
        // on the photo dress, a wrap tie makes it the wrap dress (and another fastening makes it the photo dress again)
        const dressy = draft.garment === "flutter" || draft.garment === "wrap";
        const garment = dressy && pick === "Fastening" ? (o === "Wrap tie" ? "wrap" : "flutter") : draft.garment;
        setDraft({ garment, details: details.map(([k, v]) => [k, k === pick ? o : v] as [string, string]) }); setPick(null);
      }} />
    </Screen>
  );
}
