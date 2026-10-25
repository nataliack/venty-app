"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { BASE, WIZARD, ALL_MEASURES } from "@/lib/data";
import { Screen, TopBar, HS, Lead, Pill, Glow, Glass, RB, Check, Sheet, SheetHead, TextButton, Option, Arrows, PaperScreen, cx, useToast, Blob, Split, useDesk } from "@/components/ui";
import { BodyFigure, Ruler } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";
import { FlowHeader, bodySteps } from "./measure";
import { useInstall } from "@/components/Install";
import dynamic from "next/dynamic";
import { BodyLoader } from "@/components/BodyLoader";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false, loading: () => <BodyLoader /> });
export { MeasureBase, HowSheet } from "./measure";

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cx("text-[15px] font-medium text-white/80", className)}>{children}</div>;
const Note = ({ icon = "info", children, className }: { icon?: IconName; children: React.ReactNode; className?: string }) => (
  <div className={cx("flex items-start gap-2.5 text-[14px] leading-snug text-white/55", className)}><Icon name={icon} size={18} className="mt-px shrink-0" />{children}</div>
);

// ─── App preferences: asked once, before the first body. Units default to cm (never "none"). ─────────
export const EXP = [
  { t: "Beginner", d: "I’m new to sewing" }, // index = the saved `experience`
  { t: "Intermediate", d: "I’ve made a few things from patterns" },
  { t: "Advanced", d: "I sew often, or professionally" },
];
export function Prefs() {
  const { units, experience, set, go } = useApp();
  // on a phone browser, also ask about the home screen; "Yes" shows the short guide, then the flow carries on
  const { offer } = useInstall();
  const [addHome, setAddHome] = useState<boolean | null>(null);
  const ready = experience !== null && (!offer || addHome !== null);
  // answered here, so home does not ask again with its own card
  const next = () => { set({ prefsDone: true, ...(offer && addHome !== null ? { installDismissed: true } : {}) }); if (offer && addHome) go("install", { then: "name" }); else go("name"); };
  return (
    <Screen header={<TopBar left="close" onLeft={useApp.getState().exitFlow} />} footer={<Arrows ready={ready} onNext={next} />}>
      <Split left={<>
        <HS className="mt-2 lg:mt-0">Before we begin</HS>
      </>} right={<>
        <Label className="mt-7 lg:mt-0">Do you measure in centimetres or inches?</Label>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {(["cm", "in"] as const).map((u) => (
            // the name, and the short form in an inset tile (like the app's icon tiles), in the body font
            <Option key={u} on={units === u} onClick={() => set({ units: u })} className="flex h-[96px] flex-col justify-between rounded-[22px] p-4 lg:h-[130px]">
              <div className="text-[17px] font-medium">{u === "cm" ? "Centimetres" : "Inches"}</div>
              <span className="iconbadge iconbadge-word grid h-8 min-w-10 place-items-center self-start rounded-[8px] px-2 text-[15px] font-medium leading-none" translate="no">{u}</span>
            </Option>
          ))}
        </div>
        <Label className="mt-6">What’s your sewing level?</Label>
        <div className="mt-2.5 flex flex-col gap-2.5" data-need={experience === null ? "1" : "0"}>
          {EXP.map((e, i) => (
            <Option key={i} on={experience === i} onClick={() => set({ experience: i })} className="flex min-h-[76px] flex-col justify-center rounded-[22px] px-4 py-3.5 pr-12">
              <div className="text-[17px] font-medium">{e.t}</div><div className="mt-0.5 text-[15px] text-white/60">{e.d}</div>
            </Option>
          ))}
        </div>
        {offer && <>
          <Label className="mt-6">Add Venty to your home screen?</Label>
          <p className="mt-1 text-[15px] text-white/55">Open it in one tap, like an app.</p>
          <div className="mt-2.5 grid grid-cols-2 gap-3" data-need={addHome === null ? "1" : "0"}>
            {([[true, "Yes, show me"], [false, "Not now"]] as const).map(([v, t]) => (
              <Option key={t} on={addHome === v} onClick={() => setAddHome(v)} className="flex min-h-[64px] items-center rounded-[22px] px-4 py-3 pr-11"><span className="text-[16px] font-medium leading-tight">{t}</span></Option>
            ))}
          </div>
        </>}
      </>} />
    </Screen>
  );
}

// ─── Step 1 · Body: a name and a starting form, on one screen. Nothing pre-filled. ───────────────────
export function NameBody() {
  const { go } = useApp();
  const body = useApp((s) => s.body());
  const update = useApp((s) => s.updateBody);
  const [name, setName] = useState(body.name);
  const [sex, setSex] = useState<"female" | "male" | null>(body.name ? body.sex : null);
  const ready = name.trim().length > 0 && sex !== null;
  const next = () => { update({ name: name.trim(), sex: sex! }); go("method"); };
  return (
    <Screen header={<FlowHeader steps={bodySteps(0, (name.trim() ? 0.5 : 0) + (sex ? 0.5 : 0))} />} footer={<Arrows ready={ready} onNext={next} hidePrev label="Next" />}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">Who are you<br />measuring?</HS>
        <Lead className="mt-3">Give this body a name, so you can find it later.</Lead>
      </>} right={<>
        <label className="mt-7 block lg:mt-0">
          <Label>Name</Label>
          <span className="field mt-2.5 flex h-[60px] items-center px-4" data-need={name.trim() ? "0" : "1"}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a name" maxLength={28} autoComplete="off" enterKeyHint="next" className="text-[19px]" />
            {name && <button onClick={() => setName("")} aria-label="Clear" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/70"><Icon name="close" size={14} /></button>}
          </span>
        </label>
        <Label className="mt-6">Start the body with a</Label>
        <div className="mt-2.5 grid grid-cols-2 gap-3" data-need={sex ? "0" : "1"}>
          {(["female", "male"] as const).map((s) => (
            <Option key={s} on={sex === s} onClick={() => setSex(s)} className="flex h-[150px] items-end rounded-[22px] p-4 lg:h-[220px]">
              <div className="absolute left-4 top-3 h-[86px] lg:h-[150px]"><BodyFigure sex={s} width={36} glow={false} className="h-full w-auto" /></div>
              <div className="text-[17px] font-medium">{s === "female" ? "Female form" : "Male form"}</div>
            </Option>
          ))}
        </div>
      </>} />
    </Screen>
  );
}

// ─── Step 2 · Method: photo scan (AI fills, you check) or by hand ───────────────────────────────
export function Method() {
  const { go } = useApp();
  const update = useApp((s) => s.updateBody);
  const [m, setM] = useState<"scan" | "hand" | null>(null);
  const next = () => {
    if (m === "scan") go("scanPrep");
    else { update({ photoScan: false, est: [] }); go("measure", { key: "height" }); }
  };
  const opt = (k: "scan" | "hand", icon: IconName, t: string, d: string) => (
    <Option on={m === k} onClick={() => setM(k)} className="rounded-[24px] p-5 lg:p-7">
      <span className="iconbadge grid h-11 w-11 place-items-center rounded-[13px]"><Icon name={icon} size={21} strokeWidth={1.9} /></span>
      <div className="mt-4 text-[19px] font-medium tracking-[-.01em]">{t}</div>
      <div className="mt-1 max-w-[290px] text-[16px] leading-snug text-white/65">{d}</div>
    </Option>
  );
  return (
    <Screen header={<FlowHeader steps={bodySteps(1, m ? 0.5 : 0)} />} footer={<Arrows ready={!!m} onNext={next} label={m === "scan" ? "Open photo scan" : m === "hand" ? "Start measuring" : "Next"} />}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">Choose how<br />to measure</HS>
      </>} right={
        <div className="mt-7 flex flex-col gap-3 lg:mt-0" data-need={m ? "0" : "1"}>
          {opt("scan", "camera", "Scan with my camera", "Take 3 photos. AI estimates your measurements, then you check each one.")}
          {opt("hand", "tape", "Measure by hand", "Use a soft measuring tape. We guide you through 4 measurements.")}
        </div>} />
    </Screen>
  );
}

// ─── Step 4 · Review the four base measures (after hand entry or after the scan) ────────────────
export function BaseMeasures() {
  const { go, units } = useApp();
  const body = useApp((s) => s.body());
  const [sheet, setSheet] = useState(false);
  const [photos, setPhotos] = useState(false);
  const scan = !!body.photoScan;
  const checked = BASE.filter((b) => body.done.includes(b.key)).length;
  const all = checked === 4;
  return (
    <Screen header={<FlowHeader steps={bodySteps(3, all ? 1 : checked / 4)} />} footer={<Arrows ready={all} onNext={() => setSheet(true)} label="Continue" />}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">{scan ? <>Check your<br />measurements</> : <>Your base<br />measurements</>}</HS>
        <Lead className="mt-3">{scan ? `AI estimated these from your photos. Tap each one to check it. ${checked} of 4 checked.` : "Tap any one to change it."}</Lead>
        <div className="mt-10 hidden justify-center lg:flex"><BodyFigure sex={body.sex} width={170} markers={[BASE[1].marker, BASE[2].marker, BASE[3].marker]} /></div>
      </>} right={<>
        <div className="mt-7 flex flex-col gap-2.5 lg:mt-0">
          {BASE.map((b) => {
            const ok = body.done.includes(b.key);
            return (
              // AI estimates must each be checked once: a dark card with the periwinkle Check (the action). Once confirmed
              // the card turns snow white (done) and offers a quiet Edit. One row: the name, the number in a centred
              // column (right-aligned in a fixed width, so the units line up card to card), then Check or Edit
              <button key={b.key} onClick={() => go("measure", { key: b.key, edit: true })} className={cx("field tap grid h-[64px] grid-cols-[minmax(0,1fr)_124px_minmax(0,1fr)] items-center px-5 text-left transition-colors duration-300", ok && "snow-card")}>
                <span className="min-w-0 truncate text-[17px]">{b.label}</span>
                <span className="flex items-baseline justify-center"><span className="serif w-[88px] text-right text-[30px] leading-none" translate="no">{fmt(body.measures[b.key], units)}</span><span className="unit ml-1.5 w-[22px]" translate="no">{units}</span></span>
                <span className="flex justify-end">{ok ? <span className="flex items-center gap-1 text-[14px] font-medium text-white/55"><Icon name="pencil" size={14} />Edit</span>
                  : <span className="icon-primary inline-flex h-8 items-center rounded-full px-3.5 text-[14px] font-medium">Check</span>}</span>
              </button>
            );
          })}
        </div>
        {scan && body.photos?.some(Boolean) && (
          <button onClick={() => setPhotos(true)} className="mt-4 flex w-full items-center gap-3 rounded-[18px] py-2 text-left">
            <span className="flex -space-x-3">{(body.photos ?? []).map((ph, i) => ph && <img key={i} src={ph} alt="" className="h-12 w-9 rounded-[8px] border-2 border-bg object-cover" />)}</span>
            <span className="flex-1 text-[15px] text-white/70">Your scan photos</span><Icon name="chevR" size={18} className="text-white/45" />
          </button>
        )}
      </>} />
      <FinishSheet open={sheet} onClose={() => setSheet(false)} />
      <PhotosSheet open={photos} onClose={() => setPhotos(false)} />
    </Screen>
  );
}

export function PhotosSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const body = useApp((s) => s.body());
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between"><h3 className="text-[24px] font-normal tracking-[-.03em]">Scan photos</h3><RB icon="close" size={38} onClick={onClose} /></div>
      <p className="mt-1 text-[15px] text-white/55">Kept on this device only.</p>
      <div className="mt-4 grid grid-cols-3 gap-2.5">{["Front", "Back", "Side"].map((v, i) => (
        <div key={v}><div className="aspect-[3/4] overflow-hidden rounded-[16px] bg-card">{body.photos?.[i] && <img src={body.photos[i]!} alt={`${v} photo`} className="h-full w-full object-cover" />}</div><div className="mt-1.5 text-center text-[14px] text-white/70">{v}</div></div>
      ))}</div>
      <Pill className="mt-6" variant="white" onClick={onClose}>Done</Pill>
    </Sheet>
  );
}

// After the base review: one question, one line on why, then the choice. "Later" is words only (the quiet option).
function FinishSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { go, set, activeBody } = useApp();
  const body = useApp((s) => s.body());
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHead title="Add 20 more measurements?">
        {body.photoScan ? "Your base measurements are saved. AI estimated the other 20 from your photos, so you just check each one." : "Your base measurements are saved. The other 20 give the closest fit, and you can stop at any time."}
      </SheetHead>
      <Pill className="mt-6" onClick={() => { onClose(); go("wizard"); }}>Yes, add 20 more</Pill>
      <TextButton className="mt-1" onClick={() => { onClose(); set({ resumeBody: activeBody }); go("ready"); }}>Later</TextButton>
    </Sheet>
  );
}

// ─── Photo scan ───────────────────────────────────────────────────────
const TIPS: [IconName, string, string][] = [
  ["shirt", "Wear fitted clothes", "Leggings or a fitted top."],
  ["wall", "Stand against a plain wall", "Good, even light. No mirrors behind you."],
  ["phone", "Place the phone at hip height", "Prop it up, or ask a friend to hold it for you."],
];
export function ScanPrep() {
  const { go } = useApp();
  return (
    // phones: centred, the heading at the top, the three tips in the middle, the privacy note just above the button
    <Screen header={<FlowHeader steps={bodySteps(2, 0)} />} footer={<Arrows ready onNext={() => go("scanCam")} label="Open camera" />} fill>
      <div className="flex flex-1 flex-col lg:grid lg:min-h-[calc(100dvh-var(--top)-var(--bottom)-120px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
        <div className="text-center lg:text-left">
          <HS className="mt-4 lg:mt-0">Before you scan</HS>
          <Lead className="mx-auto mt-3 max-w-[330px] [text-wrap:pretty] lg:mx-0">You’ll take 3 photos of yourself: one from the front, one from the back and one from the side.</Lead>
        </div>
        <div className="flex flex-1 flex-col lg:block">
          {/* tips to read, not to tap: no card, no box and no tile, just a line icon over the words (beside them on a
              computer), so nothing here looks like a button */}
          <ul className="my-auto flex flex-col gap-6 lg:my-0 lg:gap-7">{TIPS.map(([ic, t, d]) => (
            <li key={t} className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left">
              <Icon name={ic} size={24} strokeWidth={1.7} className="shrink-0 text-peri/80 lg:mt-px" />
              <div className="mt-2 lg:mt-0"><div className="text-[17px] font-medium leading-tight">{t}</div><div className="mt-1 text-[15px] leading-snug text-white/60">{d}</div></div>
            </li>
          ))}</ul>
          <Note icon="lock" className="mx-auto mt-5 max-w-[300px] justify-center pb-2 text-center lg:mx-0 lg:mt-8 lg:max-w-none lg:justify-start lg:text-left">Your photos stay on this device. You can view or delete them any time.</Note>
        </div>
      </div>
    </Screen>
  );
}

const VIEWS = ["Front", "Back", "Side"] as const;
const VIEW_HINT = ["Face the camera, arms slightly away from your body", "Turn around, same pose", "Turn to your right, arms by your sides"];
const fakePhoto = (i: number) => "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='480'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#d9dcea'/><stop offset='1' stop-color='#9aa1bd'/></linearGradient></defs><rect width='360' height='480' fill='url(#g)'/><g fill='#2a2f48'><circle cx='180' cy='92' r='26'/>${i === 2 ? "<rect x='158' y='122' width='46' height='170' rx='22'/><rect x='160' y='280' width='40' height='170' rx='18'/>" : "<path d='M130 128h100l18 150h-22l-8 172h-28l-10-130-10 130h-28l-8-172h-22z'/>"}</g><text x='18' y='462' font-family='sans-serif' font-size='14' fill='#2a2f48'>${VIEWS[i]}</text></svg>`);

export function ScanCam() {
  const replace = useApp((s) => s.replace);
  const back = useApp((s) => s.back);
  const updateBody = useApp((s) => s.updateBody);
  const body = useApp((s) => s.body());
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState(false);
  const [photos, setPhotos] = useState<(string | null)[]>(body.photos ?? [null, null, null]);
  const [view, setView] = useState(() => Math.max(0, (body.photos ?? [null, null, null]).findIndex((p) => !p)));
  const [shot, setShot] = useState<string | null>(null); // photo under review
  const [saved, setSaved] = useState<number | null>(null); // view just approved (for the confirmation)
  const [flash, setFlash] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment"); // back camera, or the front one to see yourself
  const [reading, setReading] = useState(false);
  const all = photos.every(Boolean);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        stream.current?.getTracks().forEach((t) => t.stop());
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 } }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream.current = s;
        if (video.current) { video.current.srcObject = s; await video.current.play().catch(() => {}); setLive(true); }
      } catch { /* no camera: illustrated view, photos are simulated */ }
    })();
    return () => { cancelled = true; stream.current?.getTracks().forEach((t) => t.stop()); };
  }, [facing]);
  useEffect(() => {
    const track = stream.current?.getVideoTracks()[0];
    try { track?.applyConstraints({ advanced: [{ torch: flash } as MediaTrackConstraintSet] }).catch(() => {}); } catch {}
  }, [flash]);

  const capture = () => {
    try { navigator.vibrate?.(20); } catch {}
    const v = video.current;
    if (live && v && v.videoWidth) {
      const c = document.createElement("canvas"); const w = 360; c.width = w; c.height = Math.round((v.videoHeight / v.videoWidth) * w);
      c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
      setShot(c.toDataURL("image/jpeg", 0.72));
    } else setShot(fakePhoto(view));
  };
  const fromLibrary = (f?: File) => {
    if (!f) return;
    const img = new Image(); const url = URL.createObjectURL(f);
    img.onload = () => { const c = document.createElement("canvas"); c.width = 360; c.height = Math.round((img.height / img.width) * 360); c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height); setShot(c.toDataURL("image/jpeg", 0.72)); URL.revokeObjectURL(url); };
    img.src = url;
  };
  const use = () => {
    const next = photos.map((p, i) => (i === view ? shot : p));
    setPhotos(next); updateBody({ photos: next }); setShot(null); setSaved(view);
    setTimeout(() => setSaved(null), 1100);
    const missing = next.findIndex((p) => !p);
    if (missing >= 0) setTimeout(() => setView(missing), 500);
  };
  const pickView = (i: number) => { setView(i); setShot(photos[i]); };
  const read = () => {
    setReading(true);
    setTimeout(() => {
      // simulated AI read: proportions estimated from the photos; every value still has to be checked by the user
      const seed = Date.now() % 997;
      const measures = Object.fromEntries(ALL_MEASURES.map((m, k) => { const j = ((seed * (k + 3)) % 7 - 3) / 100; return [m.key, Math.round(m.value * (1 + j) * 2) / 2]; }));
      updateBody({ photoScan: true, measures, est: ALL_MEASURES.map((m) => m.key), done: [], photos });
      replace("base");
    }, 2400);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0b12]">
      {/* viewfinder */}
      {/* the front camera shows a mirror image, as phones do; the photo itself is saved the right way round */}
      <video ref={video} playsInline muted className={cx("absolute inset-0 h-full w-full object-cover transition-opacity", live && !shot ? "opacity-100" : "opacity-0", facing === "user" && "-scale-x-100")} />
      {!live && !shot && <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 50% 40%, #232842, #0a0b12)" }} />}
      {!shot && (
        <div className="pointer-events-none absolute inset-x-[14%] bottom-[24%] top-[20%]">
          {["left-0 top-0 border-l-2 border-t-2 rounded-tl-[18px]", "right-0 top-0 border-r-2 border-t-2 rounded-tr-[18px]", "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[18px]", "right-0 bottom-0 border-r-2 border-b-2 rounded-br-[18px]"].map((c) => <span key={c} className={cx("absolute h-8 w-8 border-white/80", c)} />)}
          <div className="absolute inset-0 flex justify-center py-4 opacity-25"><BodyFigure sex={body.sex} width={120} glow={false} className="h-full w-auto" /></div>
        </div>
      )}
      {/* review: the photo as a framed picture in the middle (not the whole screen), so it reads as the photo you took */}
      {shot && <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 50% 45%, #1d2138, #0a0b12)" }} />}
      <AnimatePresence>{shot && (
        <motion.div key={shot.slice(-40)} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-x-0 bottom-[170px] top-[calc(var(--top)+130px)] flex items-center justify-center px-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot} alt={`${VIEWS[view]} photo`} className="max-h-full max-w-full rounded-[22px] border border-white/20 object-contain shadow-[0_30px_80px_-30px_rgb(0_0_0/.9)]" />
        </motion.div>
      )}</AnimatePresence>

      {/* top: close + views */}
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-5 pb-8" style={{ paddingTop: "var(--top)" }}>
        <div className="flex items-center gap-3">
          <RB icon="close" size={40} onClick={back} label="Close camera" />
          <div className="mx-auto flex rounded-full bg-black/40 p-1 backdrop-blur-md">{VIEWS.map((v, i) => (
            <button key={v} onClick={() => pickView(i)} className={cx("flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium transition-colors", i === view ? "bg-white text-bg" : "text-white/80")}>
              {photos[i] ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className={cx("grid h-4 w-4 place-items-center rounded-full", i === view ? "bg-bg text-white" : "bg-primary")}><Icon name="check" size={10} strokeWidth={3.2} /></motion.span> : null}{v}
            </button>
          ))}</div>
          {!shot ? <RB icon="rotate" size={40} onClick={() => { setFlash(false); setFacing(facing === "environment" ? "user" : "environment"); }} label={facing === "environment" ? "Use the front camera" : "Use the back camera"} /> : <span className="w-10" />}
        </div>
        {!shot && !all && <p className="mt-3 text-center text-[15px] text-white/85">{VIEW_HINT[view]}</p>}
      </div>

      {/* approved confirmation */}
      <AnimatePresence>{saved !== null && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3"><span className="grid h-20 w-20 place-items-center rounded-full bg-primary shadow-[0_0_60px_rgba(104,126,245,.8)]"><Icon name="check" size={40} strokeWidth={2.4} /></span><span className="rounded-full bg-black/50 px-4 py-1.5 text-[15px] backdrop-blur">{VIEWS[saved]} saved</span></div>
        </motion.div>)}</AnimatePresence>

      {/* reading */}
      {reading && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4"><span className="h-10 w-10 rounded-full border-2 border-white/25 border-t-white" style={{ animation: "spin .8s linear infinite" }} /><span className="text-[17px]">Reading your proportions…</span></div>
        </div>
      )}

      {/* bottom controls, low and out of the way */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pt-10" style={{ paddingBottom: "calc(var(--bottom) + 2px)" }}>
        {shot ? (
          <div className="flex gap-3">
            <Pill variant="glass" className="flex-1" onClick={() => setShot(null)} icon={<Icon name="refresh" size={18} />}>Retake</Pill>
            <Pill className="flex-1" onClick={photos[view] === shot ? () => setShot(null) : use} icon={<Icon name="check" size={18} />}>{photos[view] === shot ? "Keep" : "Use photo"}</Pill>
          </div>
        ) : all ? (
          <Pill onClick={read} disabled={reading} icon={<Icon name="sparkle" size={18} />}>Read my measures</Pill>
        ) : (
          <div className="flex items-center justify-between px-2">
            <button onClick={() => file.current?.click()} aria-label="Choose from library" className="tap grid h-12 w-12 place-items-center rounded-full bg-white/10">
              <Icon name="image" size={22} />
            </button>
            <button onClick={capture} aria-label={`Take ${VIEWS[view]} photo`} className="tap grid h-[76px] w-[76px] place-items-center rounded-full border-[3px] border-white"><span className="h-[60px] w-[60px] rounded-full bg-white" /></button>
            {facing === "environment" ? <button onClick={() => setFlash(!flash)} aria-pressed={flash} aria-label="Flash" className={cx("tap grid h-12 w-12 place-items-center rounded-full", flash ? "bg-white text-bg" : "bg-white/10")}><Icon name="flash" size={22} /></button> : <span className="h-12 w-12" />}
          </div>
        )}
      </div>
      <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { fromLibrary(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

// ─── Body preview / edit / ready ──────────────────────────────────────
export function Preview() {
  const { go, units } = useApp();
  const body = useApp((s) => s.body());
  const [view, setView] = useState(0);
  const views = ["Front", "Side", "Back"];
  const count = body.done.length;
  const sx = view === 1 ? 0.55 : 1;
  const dragStart = useRef<number | null>(null);
  const M = body.measures;
  const shape = Math.min(1.12, Math.max(0.9, ((M.bust + M.hips) / 2 - M.waist * 0.3) / 71));
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edit")}>Edit measures</Pill><Pill className="flex-1" onClick={() => go("ready")}>Save body</Pill></div>}>
      <TopBar left="back" right="more" onRight={() => go("edit")} />
      <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        <div className="lg:order-2">
          <HS className="mt-3">{body.name || "Body"}</HS>
          <div className="mt-1 text-[15px] text-white/55">{count} of 24 measurements{body.photoScan ? " · from photo scan" : ""}</div>
          <p className="mt-4 hidden max-w-[400px] text-[16px] text-white/60 lg:block">Drag the figure or use the arrows to turn it. Tap any number to change it.</p>
          <div className="mt-4 hidden grid-cols-2 gap-3 lg:grid">{BASE.map((b) => (
            <Glass key={b.key} onClick={() => go("measure", { key: b.key, edit: true })} className="rounded-[22px] px-5 py-5"><div className="text-[14px] text-white/60">{b.label}</div><div className="mt-3 flex items-baseline gap-2"><span className="serif text-[48px] leading-none" translate="no">{fmt(M[b.key], units).replace(/\.0$/, "")}</span><span className="unit" translate="no">{units}</span></div></Glass>
          ))}</div>
        </div>
        <div className="relative mt-2 flex h-[min(430px,48dvh)] touch-none items-center justify-center lg:order-1 lg:h-[min(680px,76dvh)]"
          onPointerDown={(e) => (dragStart.current = e.clientX)} onPointerUp={(e) => { if (dragStart.current !== null) { const dx = e.clientX - dragStart.current; if (Math.abs(dx) > 30) setView((v) => (v + (dx < 0 ? 1 : 2)) % 3); } dragStart.current = null; }}>
          <Blob className="left-1/2 top-1/2 h-[300px] w-[220px] -translate-x-1/2 -translate-y-1/2 opacity-40 lg:h-[460px] lg:w-[320px]" />
          <motion.div animate={{ scaleX: sx, opacity: 1 }} transition={{ type: "spring", bounce: 0.2 }} className="relative h-full">
            <div className="relative flex h-full justify-center"><BodyFigure sex={body.sex} width={170} scaleX={shape} className="h-full w-auto" /></div>
          </motion.div>
          <RB icon="back" className="absolute left-0 top-1/2 -translate-y-1/2 lg:left-6" onClick={() => setView((v) => (v + 2) % 3)} label="Turn left" />
          <RB icon="chevR" className="absolute right-0 top-1/2 -translate-y-1/2 lg:right-6" onClick={() => setView((v) => (v + 1) % 3)} label="Turn right" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><span className="glass-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px]">{views[view]} · drag to turn</span></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 lg:hidden">{BASE.map((b) => (
        <Glass key={b.key} onClick={() => go("measure", { key: b.key, edit: true })} className="rounded-[18px] px-3 py-3"><div className="text-[13px] text-white/60">{b.label}</div><div className="serif mt-2 text-[26px] leading-none" translate="no">{fmt(M[b.key], units).replace(/\.0$/, "")}</div></Glass>
      ))}</div>
    </Screen>
  );
}

export function EditMeasures({ p }: { p?: Record<string, unknown> }) {
  const { back, units } = useApp();
  const body = useApp((s) => s.body());
  const setMeasure = useApp((s) => s.setMeasure);
  const list = [...BASE, WIZARD[0], WIZARD[1], WIZARD[5], WIZARD[2]];
  const [sel, setSel] = useState<string>((p?.key as string) ?? "waist");
  const m = ALL_MEASURES.find((x) => x.key === sel)!;
  const v = body.measures[sel] ?? m.value;
  const { toast, node } = useToast();
  const desk = useDesk();
  return (
    <Screen footer={<Pill onClick={() => { toast("Changes saved"); setTimeout(back, 700); }}>Save changes</Pill>}>
      <TopBar left="back" />
      <HS className="mt-3">Edit measures</HS>
      <div className="mt-1 text-[15px] text-white/55">{body.name}</div>
      <div className="lg:mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
        <div className="mt-4 flex gap-3 lg:mt-0">
          <div className="flex w-[40%] justify-center pt-2 lg:w-[45%]"><BodyFigure sex={body.sex} width={desk ? 190 : 130} markers={[m.marker]} /></div>
          <div className="flex flex-1 flex-col gap-2">{list.map((x) => (
            <Glass key={x.key} onClick={() => setSel(x.key)} selected={x.key === sel} className="flex h-[46px] items-center justify-between rounded-[14px] px-3.5">
              <span className="text-[14px] text-white/75">{x.label}</span><span className="serif text-[22px]" translate="no">{fmt(body.measures[x.key] ?? x.value, units).replace(/\.0$/, "")}</span>
            </Glass>
          ))}</div>
        </div>
        <div className="dial mt-4 lg:mt-0 lg:self-center">
          <div className="px-5 pt-3.5 text-[16px] font-medium">{m.label}</div>
          <div className="mt-2 flex items-center justify-between px-3">
            <RB icon="minus" size={48} onClick={() => setMeasure(sel, Math.max(m.min, v - 0.5))} label="Minus 0.5" className="rb-plain" />
            <span className="flex items-baseline gap-2"><span className="serif text-[46px] leading-none lg:text-[64px]" translate="no">{fmt(v, units)}</span><span className="unit" translate="no">{units}</span></span>
            <RB icon="plus" size={48} onClick={() => setMeasure(sel, Math.min(m.max, v + 0.5))} label="Plus 0.5" className="rb-plain" />
          </div>
          <Ruler value={v} min={m.min} max={m.max} onChange={(nv) => setMeasure(sel, nv)} className="mt-2" />
        </div>
      </div>
      {node}
    </Screen>
  );
}

export function Ready() {
  const { go, home, set, activeBody } = useApp();
  const body = useApp((s) => s.body());
  const count = body.done.length;
  const left = 24 - count;
  useEffect(() => { set({ resumeBody: left > 0 ? activeBody : null }); }, [left, activeBody, set]);
  // a moment, so the onboarding's paper below, and above it a cinematic shot: the start screen's night card, the 3D body
  // from the waist up, three-quarter, posed
  const art = (
    <>
      <div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="absolute inset-0 pt-[var(--top)]">
        <Body3D sex={body.sex} measures={body.measures} focus="portrait" autoRotate={false} className="h-full w-full" />
      </motion.div>
    </>
  );
  return (
    <PaperScreen art={art} artH="h-[40%]" footer={<div className="flex flex-col items-center gap-1"><Pill onClick={() => { useApp.getState().newDraft({ bodyId: activeBody }); go("prompt", { picked: true }); }}>Choose what to make</Pill><button onClick={home} className="h-12 px-4 text-[16px] font-medium text-[#12131c]/65 hover:text-[#12131c]">Go to home</button></div>}>
      <div className="text-center lg:text-left">
        <div className="flex items-center justify-center gap-2 text-[15px] text-[#12131c]/70 lg:justify-start"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#12131c] text-white"><Icon name="check" size={12} strokeWidth={3} /></span>Saved to your bodies</div>
        {/* the heading and its text are one group (12px apart); the saved line above sits further off (24px) */}
        <h1 className="h1 mt-6 !text-[34px] text-[#12131c] [text-wrap:balance] lg:!text-[52px]">Well done! Your body is ready</h1>
        <p className="lead mx-auto mt-3 max-w-[360px] [text-wrap:pretty] lg:mx-0">Every pattern you make for {body.name || "this body"} will be drafted to these measurements.</p>
      </div>
      <div className="mt-5 border-t border-[#12131c]/10 pt-4">
        <div className="flex items-baseline justify-between"><span className="text-[17px]">{body.name}</span><span className="text-[15px] text-[#12131c]/60"><span className="serif text-[20px] text-[#12131c]">{count}</span> of 24 measurements</span></div>
        <div className="mt-2.5 flex gap-[3px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("h-1 flex-1 rounded-full", i < count ? "bg-primary" : "bg-[#12131c]/12")} />)}</div>
        {left > 0 && <button onClick={() => go("wizard")} className="mt-3 flex items-center gap-1 text-[15px] font-medium text-primary-2">Add the other {left} for a closer fit<Icon name="chevR" size={16} /></button>}
      </div>
    </PaperScreen>
  );
}
