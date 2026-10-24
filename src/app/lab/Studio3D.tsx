"use client";
// Lab · 3D body studio: tune the look (material, lights, shadow) and the body (sex, measurements) live, and see the
// same body inside copies of the screens where it will live. Settings stay in this browser; "Copy settings" puts the
// exact values on the clipboard, to be built into the app.
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Leva, useControls, button, folder } from "leva";
import { Icon } from "@/components/icons";
import { Blob, Crown, cx, Glass, Glow, Pill, RB } from "@/components/ui";
import { MarkCover, Ruler } from "@/components/art";
import { LOOKS, type Look, type Stage } from "@/components/Body3D";
import { MEASURE_NAMES, SHOTS } from "@/lib/bodyShots";
import { ALL_MEASURES, BASE } from "@/lib/data";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false });

const STORE = "venty-lab-3d";
// the rows of Edit measures (the app's: the base four, then neck, underbust, thigh)
const EDIT_LIST = ["height", "bust", "waist", "hips", "neck", "underbust", "thigh"];
// the measurements each body starts from (cm)
const BODY_DEFAULTS = {
  female: { height: 168, bust: 95.5, underbust: 67, waist: 68, hips: 100, neck: 34.5, thigh: 54 },
  male: { height: 177.5, bust: 127.5, underbust: 77.5, waist: 85.5, hips: 94.5, neck: 37, thigh: 56.5 },
};
const saved = (): Partial<Look & { preset: string }> => {
  try { return JSON.parse(localStorage.getItem(STORE) ?? "{}"); } catch { return {}; }
};

function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        <div className="dotgrid" />
        {children}
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

// where the body stands, and what the card behind it looks like
const STAGES: { k: Stage; name: string; note: string; bg: string }[] = [
  { k: "none", name: "Today", note: "The body floats in the plain card.", bg: "var(--color-card)" },
  { k: "glow", name: "A · Pool of light", note: "A soft light from above falls into a pool of cornflower on the floor, with a shadow under the feet: a quiet studio.", bg: "radial-gradient(70% 55% at 50% 0%, rgb(140 156 248 / .2), transparent 72%), linear-gradient(180deg, #181a29 0%, #0e0f18 100%)" },
  { k: "podium", name: "B · Podium", note: "The body stands on a low round podium with a fine cornflower edge, like a turntable, which suits the turning body.", bg: "radial-gradient(62% 46% at 50% 40%, rgb(104 126 245 / .18), transparent 72%), #0d0e17" },
  { k: "grid", name: "C · Pattern floor", note: "A graph-paper floor, the grid of the pattern sheets, fading into the dark: the body stands where its pattern will be drawn.", bg: "linear-gradient(180deg, #141626 0%, #0c0d16 62%, #10121f 100%)" },
];
type DialStyle = "now" | "snow" | "inset" | "snowInset";
const DIALS: { k: DialStyle; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "The card colour, the ruler along the bottom." },
  { k: "snow", name: "1 · Snow", note: "The whole dial turns snow, ink numbers and ticks, a cornflower needle: the one light thing on the screen, so it reads as the control." },
  { k: "inset", name: "2 · Inset track", note: "The ruler sits in a track pressed into the card (the inset tiles' look), so it reads as something to slide. The same height as today." },
  { k: "snowInset", name: "3 · Snow, inset track", note: "Snow, with the ruler in a soft pressed track." },
];

// the measuring dial, as the app's measuring step draws it: − and + either side of the value, the ruler along the
// bottom (or in a pressed track). It moves the body in the lab (the same value as the panel). Every style is the same
// height, so the screen still fits without scrolling
function Dial({ value, min, max, onChange, style = "now" }: { value: number; min: number; max: number; onChange: (v: number) => void; style?: DialStyle }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 2) / 2)));
  const snow = style === "snow" || style === "snowInset";
  const inset = style === "inset" || style === "snowInset";
  const btn = snow ? "!border-[#12131c]/10 !bg-white !text-[#12131c] shadow-[0_1px_2px_rgb(28_34_82/.12)]" : "rb-plain";
  return (
    <div className={cx("dial h-[132px]", snow && "!border-white/70 !bg-snow text-[#12131c]")}>
      <div className={cx("flex items-center justify-between gap-2 px-3", inset ? "pt-2.5" : "pt-3")}>
        <RB icon="minus" size={inset ? 44 : 48} onClick={() => set(value - 0.5)} label="Minus 0.5 cm" className={btn} />
        <span className={cx("flex items-center justify-center gap-2", inset ? "h-[56px]" : "h-[60px]")}><span className="serif text-[44px] leading-none">{value.toFixed(1)}</span><span className={cx("unit", snow && "!text-[#12131c]/55")}>cm</span></span>
        <RB icon="plus" size={inset ? 44 : 48} onClick={() => set(value + 0.5)} label="Plus 0.5 cm" className={btn} />
      </div>
      {inset
        ? <div className={cx("mx-3 mt-1.5 overflow-hidden rounded-[16px] py-[3px]", snow ? "shadow-[inset_0_2px_5px_rgb(28_34_82/.2),inset_0_-1px_0_rgb(255_255_255/.95)] bg-[#e3e8f6]" : "lab-inset")}><Ruler value={value} min={min} max={max} onChange={set} h={44} light={snow} /></div>
        : <Ruler value={value} min={min} max={max} onChange={set} light={snow} className="mt-2" />}
    </div>
  );
}

// the card the body stands in: its backdrop, the stage, and a pause button for the turning
function StageCard({ stage, h, paused, onPause, children }: { stage: Stage; h: string; paused: boolean; onPause: () => void; children: ReactNode }) {
  const bg = STAGES.find((x) => x.k === stage)!.bg;
  return (
    <div className={cx("relative mt-4 overflow-hidden rounded-[24px] border border-white/[.08]", h)} style={{ background: bg }}>
      {children}
      <button onClick={onPause} aria-label={paused ? "Turn the body" : "Stop turning"} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-[#0b0c15]/55 text-white/80 backdrop-blur hover:text-white">
        <Icon name={paused ? "play" : "pause"} size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

function Pick<T extends string>({ items, value, onChange }: { items: { k: T; name: string }[]; value: T; onChange: (k: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">{items.map((x) => (
      <button key={x.k} onClick={() => onChange(x.k)} aria-pressed={value === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", value === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
}

export function Studio3D() {
  // true once in the browser (the saved look lives in localStorage, so the panel starts after the first paint)
  const ready = useSyncExternalStore(() => () => {}, () => true, () => false);
  const init = useMemo(() => ({ ...LOOKS.venty, ...(typeof window !== "undefined" ? saved() : {}) }), []);

  const [body, setBody] = useControls("Body", () => ({
    sex: { value: "female", options: ["female", "male"] },
    height: { value: BODY_DEFAULTS.female.height, min: 140, max: 200, step: 0.5 },
    bust: { value: BODY_DEFAULTS.female.bust, min: 70, max: 130, step: 0.5 },
    underbust: { value: BODY_DEFAULTS.female.underbust, min: 60, max: 110, step: 0.5 },
    waist: { value: BODY_DEFAULTS.female.waist, min: 55, max: 120, step: 0.5 },
    hips: { value: BODY_DEFAULTS.female.hips, min: 75, max: 140, step: 0.5 },
    neck: { value: BODY_DEFAULTS.female.neck, min: 28, max: 48, step: 0.5 },
    thigh: { value: BODY_DEFAULTS.female.thigh, min: 40, max: 80, step: 0.5 },
    // the measurement being taken: the body poses and the camera frames it (see bodyShots)
    measuring: { value: (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("m")) || "bust", options: Object.fromEntries(Object.keys(SHOTS).map((k) => [MEASURE_NAMES[k] ?? k, k])) },
    turning: true,
  }));
  // each body starts from its own measurements (Jose's, 23 Oct 2026), also when the sex is switched
  useEffect(() => { setBody(BODY_DEFAULTS[body.sex as "female" | "male"]); }, [body.sex, setBody]);
  const [look, setLook] = useControls(() => ({
    Material: folder({
      color: init.color, metalness: { value: init.metalness, min: 0, max: 1 }, roughness: { value: init.roughness, min: 0, max: 1 },
      clearcoat: { value: init.clearcoat, min: 0, max: 1 }, clearcoatRoughness: { value: init.clearcoatRoughness, min: 0, max: 1 },
      sheen: { value: init.sheen, min: 0, max: 1 }, sheenColor: init.sheenColor, envIntensity: { value: init.envIntensity, min: 0, max: 3 },
    }),
    Lights: folder({
      keyIntensity: { value: init.keyIntensity, min: 0, max: 6 }, keyColor: init.keyColor,
      keyAzimuth: { value: init.keyAzimuth, min: -180, max: 180 }, keyElevation: { value: init.keyElevation, min: -10, max: 85 },
      fillIntensity: { value: init.fillIntensity, min: 0, max: 4 }, fillColor: init.fillColor,
      rimIntensity: { value: init.rimIntensity, min: 0, max: 6 }, rimColor: init.rimColor,
      ambient: { value: init.ambient, min: 0, max: 1.5 },
    }),
    Shadow: folder({ shadowOpacity: { value: init.shadowOpacity, min: 0, max: 1 }, shadowBlur: { value: init.shadowBlur, min: 0, max: 6 }, ringColor: init.ringColor }),
  }));
  useControls("Presets", {
    Venty: button(() => setLook(LOOKS.venty)),
    Chrome: button(() => setLook(LOOKS.chrome)),
    Porcelain: button(() => setLook(LOOKS.porcelain)),
    Matte: button(() => setLook(LOOKS.matte)),
  }, [setLook]);
  // keep the look in this browser, and copy it for the app
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(look)); } catch { /* storage blocked */ } }, [look]);
  useControls("Settings", { "Copy settings": button(() => { navigator.clipboard?.writeText(JSON.stringify(look, null, 2)); }) }, [look]);

  const sex = body.sex as "female" | "male";
  const measures = useMemo(() => ({ height: body.height, bust: body.bust, underbust: body.underbust, waist: body.waist, hips: body.hips, neck: body.neck, thigh: body.thigh }), [body.height, body.bust, body.underbust, body.waist, body.hips, body.neck, body.thigh]);
  const focus = body.measuring as string;
  const [edit, setEdit] = useState("waist");
  const [stage, setStage] = useState<Stage>("glow");
  const [dialStyle, setDialStyle] = useState<DialStyle>("inset");
  const [paused, setPaused] = useState(false);
  const fm = ALL_MEASURES.find((m) => m.key === focus);
  const value = (measures as Record<string, number>)[focus] ?? fm?.value;
  const L = look as unknown as Look;

  if (!ready) return null;
  return (
    <section>
      {/* ?shots in the address hides the panel (for clean screenshots) */}
      <Leva collapsed={false} hidden={typeof window !== "undefined" && window.location.search.includes("shots")} titleBar={{ title: "3D body" }} />
      <h2 className="h1 !text-[34px]">3D body</h2>
      <p className="mt-3 max-w-[640px] text-[16px] leading-snug text-white/65">The MakeHuman mannequin, fitted to the measurements in the panel and lit by the look, in copies of the app&apos;s screens that show a body (today a flat figure). Pick a measurement under Measuring: the body takes the pose for it and the camera frames it (the first phone). On the whole-body screens a taller body reaches higher: change the height to see it. Tap a row in Edit measures to move the tape. Drag a body to turn it. Your settings stay in this browser; Copy settings puts the exact values on the clipboard.</p>
      <h3 className="mt-10 text-[22px] font-normal tracking-[-.02em]">Height and measuring: the stage and the dial</h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div><div className="mb-2 text-[14px] text-white/50">Stage</div><Pick items={STAGES} value={stage} onChange={setStage} /><p className="mt-3 max-w-[520px] text-[15px] leading-snug text-white/60">{STAGES.find((x) => x.k === stage)!.note}</p></div>
        <div><div className="mb-2 text-[14px] text-white/50">Dial</div><Pick items={DIALS} value={dialStyle} onChange={setDialStyle} /><p className="mt-3 max-w-[520px] text-[15px] leading-snug text-white/60">{DIALS.find((x) => x.k === dialStyle)!.note}</p></div>
      </div>
      <p className="mt-4 max-w-[760px] text-[15px] leading-snug text-white/50">On both: drag the body to turn it, the button at the top right stops and starts the turning, and the ruler keeps following your finger even outside the dial until you let go.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {/* the height step: slide the ruler and the body grows or shrinks, feet on the floor; it turns slowly (pause) */}
        <Phone label="Height: slide to change it">
          <div className="px-5 pt-12 text-white">
            <div className="flex h-11 items-center gap-3"><RB icon="close" size={40} label="Close" /><div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[12%] rounded-full bg-white" /></div></div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div><h1 className="h1 !text-[30px]">Height</h1><p className="mt-1.5 text-[15px] leading-snug text-white/60">Stand tall against a wall, heels together.</p></div>
              <RB icon="help" size={40} label="How to measure" className="shrink-0" />
            </div>
            <StageCard stage={stage} h="h-[300px]" paused={paused} onPause={() => setPaused((x) => !x)}>
              <Body3D sex={sex} measures={measures} look={L} focus="height" stage={stage} turn={body.turning} paused={paused} snapshot="stage" className="absolute inset-0" />
            </StageCard>
            <div className="mt-4"><Dial style={dialStyle} value={body.height} min={140} max={200} onChange={(v) => setBody({ height: v })} /></div>
          </div>
          <div className="absolute inset-x-5 bottom-7 flex items-center gap-3"><RB icon="back" variant="dark" size={56} label="Back" /><Pill className="flex-1">Next</Pill></div>
        </Phone>

        {/* a measuring step (MeasureStep): the title, the body with the tape, the value */}
        <Phone label="Measuring (pick it under Measuring)">
          <div className="px-5 pt-12 text-white">
            <div className="flex h-11 items-center gap-3"><RB icon="close" size={40} label="Close" /><div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-white" /></div></div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div><h1 className="h1 !text-[30px]">{MEASURE_NAMES[focus]}</h1><p className="mt-1.5 line-clamp-2 text-[15px] leading-snug text-white/60">{fm?.hint}</p></div>
              <RB icon="help" size={40} label="How to measure" className="shrink-0" />
            </div>
            <StageCard stage={stage} h="h-[280px]" paused={paused} onPause={() => setPaused((x) => !x)}>
              <Body3D sex={sex} measures={measures} look={L} focus={focus} stage={stage} paused={paused} autoRotate={body.turning} className="absolute inset-0" />
            </StageCard>
            <div className="mt-4">{focus in measures && fm
              ? <Dial style={dialStyle} value={(measures as Record<string, number>)[focus]} min={fm.min} max={fm.max} onChange={(v) => setBody({ [focus]: v })} />
              : <div className="dial flex h-[132px] items-center justify-center"><span className="serif text-[44px] leading-none">{value?.toFixed(1)}</span><span className="unit ml-2">cm</span></div>}</div>
          </div>
          <div className="absolute inset-x-5 bottom-7 flex items-center gap-3"><RB icon="back" variant="dark" size={56} label="Back" /><Pill className="flex-1">Next</Pill></div>
        </Phone>
      </div>

      <h3 className="mt-16 text-[22px] font-normal tracking-[-.02em]">The other screens (on hold)</h3>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {/* 2 · the body after setup (Preview): turn it, the four base numbers */}
        <Phone label="2 · Your body (after setup)">
          <div className="px-5 pt-12 text-white">
            <div className="flex h-11 items-center"><RB icon="back" size={40} label="Back" /><div className="flex-1" /><RB icon="more" size={40} label="More" /></div>
            <h1 className="h-serif mt-3">Me, Spring 26</h1>
            <div className="mt-1 text-[15px] text-white/55">24 of 24 measurements</div>
          </div>
          <div className="absolute inset-x-5 top-[170px] h-[390px]">
            <Blob className="left-1/2 top-1/2 h-[300px] w-[220px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
            <Body3D sex={sex} measures={measures} look={L} focus="height" autoRotate={body.turning} snapshot="body" className="absolute inset-0" />
            <RB icon="back" className="absolute left-0 top-1/2 -translate-y-1/2" label="Turn left" />
            <RB icon="chevR" className="absolute right-0 top-1/2 -translate-y-1/2" label="Turn right" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><span className="glass-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] text-white">Front · drag to turn</span></div>
          </div>
          <div className="absolute inset-x-5 bottom-[92px] grid grid-cols-4 gap-2 text-white">{BASE.map((b) => (
            <Glass key={b.key} className="rounded-[18px] px-3 py-3"><div className="text-[13px] text-white/60">{b.label}</div><div className="serif mt-2 text-[26px] leading-none">{Math.round((measures as Record<string, number>)[b.key] ?? b.value)}</div></Glass>
          ))}</div>
          <div className="absolute inset-x-5 bottom-7 flex gap-3"><Pill variant="dark" className="flex-1">Edit measures</Pill><Pill className="flex-1">Save body</Pill></div>
        </Phone>

        {/* 3 · Edit measures: the whole body beside the list, the tape on the one picked */}
        <Phone label="3 · Edit measures">
          <div className="px-5 pt-12 text-white">
            <div className="flex h-11 items-center"><RB icon="back" size={40} label="Back" /></div>
            <h1 className="h-serif mt-3">Edit measures</h1>
            <div className="mt-1 text-[15px] text-white/55">Me, Spring 26</div>
            <div className="mt-4 flex gap-3">
              <div className="relative h-[372px] w-[40%]"><Body3D sex={sex} measures={measures} look={L} focus={edit} whole autoRotate={false} className="absolute inset-0" /></div>
              <div className="flex flex-1 flex-col gap-2">{EDIT_LIST.map((k) => {
                const m = ALL_MEASURES.find((x) => x.key === k);
                return (
                  <Glass key={k} onClick={() => setEdit(k)} selected={k === edit} className="flex h-[46px] items-center justify-between rounded-[14px] px-3.5">
                    <span className="text-[14px] text-white/75">{m?.label ?? k}</span><span className="serif text-[22px]">{Math.round((measures as Record<string, number>)[k] ?? m?.value ?? 0)}</span>
                  </Glass>
                );
              })}</div>
            </div>
          </div>
          <div className="absolute inset-x-5 bottom-7"><Pill>Save changes</Pill></div>
        </Phone>

        {/* 4 · Body ready: a moment, so paper and the Crown, the body standing in the Crown */}
        <Phone label="4 · Your body is ready">
          <div className="paper absolute inset-0 flex flex-col">
            <div className="relative h-[40%] shrink-0 overflow-hidden rounded-b-[32px] text-white"><Crown /><Body3D sex={sex} measures={measures} look={L} focus="height" autoRotate={body.turning} className="absolute inset-x-6 bottom-3 top-12" /></div>
            <div className="flex flex-1 flex-col justify-center px-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[15px] text-[#12131c]/70"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#12131c] text-white"><Icon name="check" size={12} strokeWidth={3} /></span>Saved to your bodies</div>
              <h1 className="h1 mt-3 !text-[30px] text-[#12131c] [text-wrap:balance]">Well done! Your body is ready</h1>
              <p className="lead mx-auto mt-3 max-w-[300px] [text-wrap:pretty]">Every pattern you make for Me, Spring 26 will be drafted to these measurements.</p>
            </div>
            <div className="flex flex-col items-center gap-1 px-6 pb-7"><Pill>Choose what to make</Pill><span className="h-12 px-4 pt-3 text-[16px] font-medium text-[#12131c]/65">Go to home</span></div>
          </div>
        </Phone>

        {/* 5 · the body library: each body standing in its card */}
        <Phone label="5 · Body library">
          <div className="relative px-5 text-white">
            <MarkCover className="-mx-5 h-[150px]" />
            <h1 className="h-serif relative -mt-6">Body library</h1>
            <div className="field mt-4 flex h-12 items-center gap-2.5 px-4"><Icon name="search" size={18} className="text-white/50" /><span className="text-[16px] text-white/40">Search bodies</span></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Glow color="#4d5e85" variant="fade" className="relative h-[230px] rounded-[26px] p-4">
                <div className="relative h-[150px]"><Body3D sex={sex} measures={measures} look={L} focus="height" autoRotate={false} className="absolute inset-0" /></div>
                <div className="absolute bottom-4 left-4 right-4"><div className="text-[15px] font-medium">Me, Spring 26</div><div className="text-[13px] text-white/65"><span className="serif text-[15px] text-white">24</span> of 24 measurements</div></div>
              </Glow>
              <div className="flex h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/25">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Icon name="plus" size={24} /></span>
                <span className="mt-3 text-[15px] font-medium">New body</span><span className="text-[13px] text-white/50">4 measures to start</span>
              </div>
            </div>
          </div>
        </Phone>

        {/* 6 · the result screen's stage (the garment on the 3D body comes later) */}
        <Phone label="6 · On your body (garment later)">
          <div className="px-5 pt-14 text-center text-white">
            <h1 className="text-[24px] font-normal tracking-[-.02em]">Flutter midi dress</h1>
            <p className="mt-1 text-[15px] text-white/60">Drafted to Me · easy fit</p>
            <div className="mx-auto mt-4 flex w-[240px] rounded-full bg-card p-1 text-[14px] font-medium"><span className="flex-1 rounded-full bg-white py-2 text-bg">On your body</span><span className="flex-1 py-2 text-white/70">Pattern</span></div>
          </div>
          <Body3D sex={sex} measures={measures} look={L} focus="height" autoRotate={body.turning} className="absolute inset-x-0 bottom-28 top-44" />
          <div className="absolute inset-x-5 bottom-8 flex gap-3 text-white"><span className="pill pill-dark flex-1 text-[15px]">Change the design</span><span className="pill pill-primary flex-1 text-[15px]">Looks right</span></div>
          <span className="absolute left-1/2 top-[52%] -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[12px] text-white/70 backdrop-blur"><Icon name="dress" size={13} className="mr-1 inline" />Garment: next step</span>
        </Phone>
      </div>
    </section>
  );
}
