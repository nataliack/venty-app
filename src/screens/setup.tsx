"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { BASE, WIZARD, ALL_MEASURES } from "@/lib/data";
import { Screen, TopBar, HS, Lead, Pill, Glow, Glass, RB, Check, Sheet, Option, Arrows, cx, useToast, Blob, Split, useDesk } from "@/components/ui";
import { BodyFigure, Ruler } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";
import { FlowHeader, bodySteps } from "./measure";
export { MeasureBase, HowSheet } from "./measure";

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cx("text-[15px] font-medium text-white/80", className)}>{children}</div>;
const Note = ({ icon = "info", children, className }: { icon?: IconName; children: React.ReactNode; className?: string }) => (
  <div className={cx("flex items-start gap-2.5 text-[14px] leading-snug text-white/55", className)}><Icon name={icon} size={18} className="mt-px shrink-0" />{children}</div>
);

// ─── App preferences: asked once, before the first body. Units default to cm (never "none"). ─────────
const EXP = [
  { t: "Beginner", d: "I’m new to sewing" },
  { t: "Intermediate", d: "I’ve made a few things from patterns" },
  { t: "Advanced", d: "I sew often, or professionally" },
];
export function Prefs() {
  const { units, experience, set, go } = useApp();
  return (
    <Screen header={<TopBar left="close" onLeft={useApp.getState().exitFlow} />} footer={<Arrows ready={experience !== null} onNext={() => { set({ prefsDone: true }); go("name"); }} />}>
      <Split left={<>
        <HS className="mt-2 lg:mt-0">Before we begin</HS>
      </>} right={<>
        <Label className="mt-7 lg:mt-0">Do you measure in centimetres or inches?</Label>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {(["cm", "in"] as const).map((u) => (
            <Option key={u} on={units === u} onClick={() => set({ units: u })} className="h-[104px] rounded-[22px] p-4 lg:h-[150px]">
              <div className="text-[17px] font-medium">{u === "cm" ? "Centimetres" : "Inches"}</div>
              <div className="serif mt-1 text-[30px] leading-none text-white/90" translate="no">{u}</div>
              <span className="ticks" />
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
      <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><Icon name={icon} size={22} /></span>
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
              // AI estimates must each be checked once ("Check"); confirmed values just offer "Edit"
              <button key={b.key} onClick={() => go("measure", { key: b.key, edit: true })} className={cx("field tap flex h-[72px] items-center gap-3 px-5 text-left", !ok && "!border-primary/60")}>
                <span className="flex flex-1 items-center gap-2.5 text-[17px]">{ok && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary"><Icon name="check" size={12} strokeWidth={3} /></span>}{b.label}</span>
                <span className="flex items-baseline gap-1.5"><span className="serif text-[30px] leading-none" translate="no">{fmt(body.measures[b.key], units)}</span><span className="unit" translate="no">{units}</span></span>
                {ok ? <span className="flex w-[58px] items-center justify-end gap-1 text-[14px] font-medium text-white/60"><Icon name="pencil" size={14} />Edit</span>
                  : <span className="flex w-[58px] justify-end"><span className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-bg">Check</span></span>}
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
        <div key={v}><div className="aspect-[3/4] overflow-hidden rounded-[16px] bg-white/5">{body.photos?.[i] && <img src={body.photos[i]!} alt={`${v} photo`} className="h-full w-full object-cover" />}</div><div className="mt-1.5 text-center text-[14px] text-white/70">{v}</div></div>
      ))}</div>
      <Pill className="mt-6" variant="white" onClick={onClose}>Done</Pill>
    </Sheet>
  );
}

function FinishSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { go, set, activeBody } = useApp();
  const body = useApp((s) => s.body());
  const n = body.done.length;
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center gap-2.5 text-[16px] text-white/75"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary"><Icon name="check" size={14} strokeWidth={3} /></span>{n} measurements saved</div>
      <h3 className="mt-5 text-[26px] font-normal leading-tight tracking-[-.03em]">Great job getting this far</h3>
      <p className="mt-2 text-[17px] leading-snug text-white/85">Would you like to add 20 more measurements to make your body even more precise?</p>
      <p className="mt-2 text-[16px] leading-snug text-white/60">{body.photoScan ? "AI estimated them from your photos too. You just check each one." : "They give the closest fit. You can stop any time and finish later."}</p>
      <Pill className="mt-6" onClick={() => { onClose(); go("wizard"); }}>Yes, add 20 more</Pill>
      <Pill className="mt-2.5" variant="glass" onClick={() => { onClose(); set({ resumeBody: activeBody }); go("ready"); }}>Later</Pill>
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
    <Screen header={<FlowHeader steps={bodySteps(2, 0)} />} footer={<Arrows ready onNext={() => go("scanCam")} label="Open camera" />}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">Before you scan</HS>
        <Lead className="mt-3">You’ll take 3 photos of yourself: one from the front, one from the back and one from the side.</Lead>
      </>} right={<>
        <ul className="mt-7 flex flex-col gap-5 lg:mt-0">{TIPS.map(([ic, t, d]) => (
          <li key={t} className="flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center text-peri"><Icon name={ic} size={26} /></span><div><div className="text-[17px] font-medium">{t}</div><div className="text-[15px] text-white/55">{d}</div></div></li>
        ))}</ul>
        <Note icon="lock" className="mt-8">Your photos stay on this device. You can view or delete them any time.</Note>
      </>} />
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
  const [reading, setReading] = useState(false);
  const all = photos.every(Boolean);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 } }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream.current = s;
        if (video.current) { video.current.srcObject = s; await video.current.play().catch(() => {}); setLive(true); }
      } catch { /* no camera: illustrated view, photos are simulated */ }
    })();
    return () => { cancelled = true; stream.current?.getTracks().forEach((t) => t.stop()); };
  }, []);
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
      <video ref={video} playsInline muted className={cx("absolute inset-0 h-full w-full object-cover transition-opacity", live && !shot ? "opacity-100" : "opacity-0")} />
      {!live && !shot && <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 50% 40%, #232842, #0a0b12)" }} />}
      {!shot && (
        <div className="pointer-events-none absolute inset-x-[14%] bottom-[24%] top-[20%]">
          {["left-0 top-0 border-l-2 border-t-2 rounded-tl-[18px]", "right-0 top-0 border-r-2 border-t-2 rounded-tr-[18px]", "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[18px]", "right-0 bottom-0 border-r-2 border-b-2 rounded-br-[18px]"].map((c) => <span key={c} className={cx("absolute h-8 w-8 border-white/80", c)} />)}
          <div className="absolute inset-0 flex justify-center py-4 opacity-25"><BodyFigure sex={body.sex} width={120} glow={false} className="h-full w-auto" /></div>
        </div>
      )}
      {/* review */}
      <AnimatePresence>{shot && <motion.img key={shot.slice(-40)} src={shot} alt={`${VIEWS[view]} photo`} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 h-full w-full object-cover" />}</AnimatePresence>

      {/* top: close + views */}
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-5 pb-8" style={{ paddingTop: "var(--top)" }}>
        <div className="flex items-center gap-3">
          <RB icon="close" size={40} onClick={back} label="Close camera" />
          <div className="mx-auto flex rounded-full bg-black/40 p-1 backdrop-blur-md">{VIEWS.map((v, i) => (
            <button key={v} onClick={() => pickView(i)} className={cx("flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium transition-colors", i === view ? "bg-white text-bg" : "text-white/80")}>
              {photos[i] ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className={cx("grid h-4 w-4 place-items-center rounded-full", i === view ? "bg-bg text-white" : "bg-primary")}><Icon name="check" size={10} strokeWidth={3.2} /></motion.span> : null}{v}
            </button>
          ))}</div>
          <span className="w-10" />
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
            <button onClick={() => file.current?.click()} aria-label="Choose from library" className="tap grid h-12 w-12 place-items-center overflow-hidden rounded-[12px] border border-white/30 bg-white/10">
              {photos.find(Boolean) ? <img src={photos.filter(Boolean).slice(-1)[0]!} alt="" className="h-full w-full object-cover" /> : <Icon name="image" size={22} />}
            </button>
            <button onClick={capture} aria-label={`Take ${VIEWS[view]} photo`} className="tap grid h-[76px] w-[76px] place-items-center rounded-full border-[3px] border-white"><span className="h-[60px] w-[60px] rounded-full bg-white" /></button>
            <button onClick={() => setFlash(!flash)} aria-pressed={flash} aria-label="Flash" className={cx("tap grid h-12 w-12 place-items-center rounded-full", flash ? "bg-white text-bg" : "bg-white/10")}><Icon name="flash" size={22} /></button>
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
        <div className="field mt-4 !rounded-[26px] px-3 pt-3 lg:mt-0 lg:self-center">
          <div className="px-2 text-[16px] font-medium">{m.label}</div>
          <div className="mt-2 flex items-center justify-between">
            <RB icon="minus" size={48} onClick={() => setMeasure(sel, Math.max(m.min, v - 0.5))} label="Minus 0.5" className="rb-plain" />
            <span className="flex items-baseline gap-2"><span className="serif text-[46px] leading-none lg:text-[64px]" translate="no">{fmt(v, units)}</span><span className="unit" translate="no">{units}</span></span>
            <RB icon="plus" size={48} onClick={() => setMeasure(sel, Math.min(m.max, v + 0.5))} label="Plus 0.5" className="rb-plain" />
          </div>
          <div className="-mx-3"><Ruler value={v} min={m.min} max={m.max} onChange={(nv) => setMeasure(sel, nv)} className="mt-1" /></div>
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
  return (
    <Screen footer={<><Pill onClick={() => { useApp.getState().newDraft({ bodyId: activeBody }); go("prompt", { picked: true }); }}>Choose what to make</Pill><Pill variant="dark" className="mt-2.5" onClick={home}>Go to home</Pill></>}
      bg={<div className="absolute inset-0" style={{ background: "radial-gradient(80% 45% at 50% 18%, rgba(104,126,245,.5), transparent 70%)" }} />}>
      <Split left={<div className="h-[min(300px,36dvh)] pt-2 lg:h-[min(640px,72dvh)]"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="h-full w-full"><BodyFigure sex={body.sex} width={140} className="h-full w-full" /></motion.div></div>} right={<>
        <div className="mt-6 flex items-center gap-2 text-[15px] text-white/70 lg:mt-0"><span className="grid h-5 w-5 place-items-center rounded-full bg-primary"><Icon name="check" size={12} strokeWidth={3} /></span>Saved to your bodies</div>
        <HS className="mt-3">Well done!<br />Your body is ready</HS>
        <Lead className="mt-3">Good job finishing {body.name ? `${body.name}’s` : "your"} measurements. Every pattern you make will be drafted to them.</Lead>
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-baseline justify-between"><span className="text-[17px]">{body.name}</span><span className="text-[15px] text-white/60"><span className="serif text-[20px] text-white">{count}</span> of 24 measurements</span></div>
          <div className="mt-2.5 flex gap-[3px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("h-1 flex-1 rounded-full", i < count ? "bg-primary" : "bg-white/15")} />)}</div>
          {left > 0 && <button onClick={() => go("wizard")} className="mt-3 flex items-center gap-1 text-[15px] font-medium text-peri">Add the other {left} for a closer fit<Icon name="chevR" size={16} /></button>}
        </div>
      </>} />
    </Screen>
  );
}
