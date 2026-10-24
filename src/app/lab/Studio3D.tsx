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
import { LOOKS, type Lines, type Look, type Stage } from "@/components/Body3D";
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

// twenty ways to present the body: the card's backdrop (CSS, with a decoration behind the body) and what it stands on
// (the floor, in the scene). Each takes a different approach
type Deco = "crown" | "arch" | "strip" | "rings" | "frame" | "cone" | "beams" | "dots" | "floor";
type Scene = { k: string; name: string; note: string; floor: Stage; chart?: boolean; bg: string; deco?: Deco };
const DARK = "linear-gradient(180deg, #141626 0%, #0c0d16 100%)";
// ink, with a cornflower light from above so faint it is felt more than seen
const INK = "radial-gradient(75% 50% at 50% -8%, rgb(104 126 245 / .15), rgb(104 126 245 / .055) 45%, transparent 76%), var(--color-ink)";
const SCENES: Scene[] = [
  { k: "today", name: "1 · Today", note: "What the app has: the plain card colour, the body floating in it.", floor: "none", bg: "var(--color-card)" },
  { k: "pool", name: "2 · Pool of light", note: "Soft light from above falls into a pool of cornflower on the floor, a shadow under the feet. A quiet studio.", floor: "glow", bg: "radial-gradient(70% 55% at 50% 0%, rgb(140 156 248 / .2), transparent 72%), linear-gradient(180deg, #181a29 0%, #0e0f18 100%)" },
  { k: "podium", name: "3 · Podium", note: "A low round podium with a fine cornflower edge, a soft spot behind: a turntable for the turning body.", floor: "podium", bg: "radial-gradient(62% 46% at 50% 40%, rgb(104 126 245 / .18), transparent 72%), #0d0e17" },
  { k: "grid", name: "4 · Pattern floor", note: "A graph-paper floor, the grid of the pattern sheets, fading into the dark: the body stands where its pattern is drawn. Refined: ink, a very faint cornflower light from above, quieter lines (real 10 cm squares, bolder every 50, the same at every height), a shadow under the feet. The floor is in the 3D scene: one flat plane, very cheap next to the body.", floor: "grid", bg: INK },
  { k: "gridFlat", name: "4b · Pattern floor, drawn", note: "The same floor drawn flat behind the body (an image, nothing in the 3D scene), the shadow still in the scene. A touch cheaper, but it cannot follow the camera: fine on the height step, where the camera never moves.", floor: "shadow", bg: INK, deco: "floor" },
  { k: "horizon", name: "5 · Studio horizon", note: "A wall and a floor meeting in a soft horizon behind the feet, like a photo studio with the lights on the wall.", floor: "shadow", bg: "linear-gradient(180deg, #23273d 0%, #1b1e30 58%, #131523 67%, #0b0c14 100%)" },
  { k: "slate", name: "6 · Slate sweep", note: "A mid blue-grey seamless backdrop (a cyclorama) with light falling off at the edges: the body reads in its own tones, like a product shot.", floor: "shadow", bg: "radial-gradient(95% 75% at 50% 38%, #3a4766 0%, #252c43 52%, #151927 100%)" },
  { k: "crown", name: "7 · Crown", note: "The landing page's Crown gradient behind the body, a pool of light at the feet: the brand's own light.", floor: "glow", bg: "#0b0c15", deco: "crown" },
  { k: "chart", name: "8 · Height chart", note: "Fine lines on the wall behind every 10 cm of real height, bolder every 50: the body is measured against them, which suits the height step.", floor: "shadow", chart: true, bg: DARK },
  { k: "niche", name: "9 · Niche", note: "A soft, lighter arch behind the body, like a niche in a shop window: it frames the figure and gives the eye a place to land.", floor: "shadow", bg: DARK, deco: "arch" },
  { k: "strip", name: "10 · Mirror light", note: "A tall soft light behind the body, like a fitting-room mirror, on a dark glossy floor that reflects it.", floor: "mirror", bg: DARK, deco: "strip" },
  { k: "mirror", name: "11 · Mirror floor", note: "A dark, softly reflecting floor: the body and its reflection, nothing else. Premium and calm.", floor: "mirror", bg: "linear-gradient(180deg, #171929 0%, #0b0c14 100%)" },
  { k: "ticks", name: "12 · Tape ring", note: "A ring of ruler ticks round the feet, like a dial on the floor: measuring, said with the floor.", floor: "ticks", bg: "radial-gradient(60% 40% at 50% 85%, rgb(104 126 245 / .12), transparent 75%), " + DARK },
  { k: "dots", name: "13 · Dot floor", note: "The app's dot grid on the wall, and a floor of dots fading out round the feet.", floor: "dots", bg: DARK, deco: "dots" },
  { k: "spot", name: "14 · Spotlight", note: "Near black, one cone of light from above onto the body and a pool at its feet: a stage, a moment.", floor: "glow", bg: "#07080d", deco: "cone" },
  { k: "disc", name: "15 · Light disc", note: "The body stands on a disc of light, as on a lightbox: lit from below, it glows at the feet.", floor: "disc", bg: "linear-gradient(180deg, #121423 0%, #0a0b12 100%)" },
  { k: "plinth", name: "16 · Plinth", note: "A low rounded plinth, like a display block in a gallery: the body as an object to look at.", floor: "plinth", bg: "radial-gradient(80% 60% at 50% 30%, #20243a 0%, #10121d 70%)" },
  { k: "rings", name: "17 · Rings", note: "Faint rings spreading out behind the body, like a tape coiled: a pattern of measuring, very quiet.", floor: "shadow", bg: DARK, deco: "rings" },
  { k: "window", name: "18 · Window light", note: "Two soft beams of daylight falling across the wall from a window to one side: warmer, a room rather than a studio.", floor: "shadow", bg: "linear-gradient(180deg, #1a1c2c 0%, #10111b 100%)", deco: "beams" },
  { k: "mist", name: "19 · Mist", note: "The floor fades into a light haze, a pool of light in it: the body standing in morning mist.", floor: "glow", bg: "linear-gradient(180deg, #0e0f18 0%, #151726 45%, #2d3557 78%, #3a4470 100%)" },
  { k: "outline", name: "20 · Line drawing", note: "No fill at all: a fine cornflower arch drawn round the body and a ring at its feet, like a pattern's outline.", floor: "line", bg: "#0b0c15", deco: "frame" },
];

function Decor({ d }: { d?: Deco }) {
  if (!d) return null;
  if (d === "crown") return <><Crown /><div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgb(11 12 21 / .6))" }} /></>;
  if (d === "dots") return <div className="dotgrid" />;
  if (d === "floor") {
    // graph paper laid on the floor in perspective: fine lines every square, bolder every five, fading out round the feet
    const line = (c: string, step: number, w: number) => `repeating-linear-gradient(0deg, ${c} 0 ${w}px, transparent ${w}px ${step}px), repeating-linear-gradient(90deg, ${c} 0 ${w}px, transparent ${w}px ${step}px)`;
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] overflow-hidden" style={{ perspective: "260px", perspectiveOrigin: "50% 0%" }}>
        {/* the floor round the feet a shade lighter, so the shadow under them reads */}
        <div className="absolute left-1/2 top-[8%] h-[46%] w-[70%] -translate-x-1/2 rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgb(193 200 217 / .07), transparent)" }} />
        <div className="absolute -inset-x-[60%] bottom-[-30%] top-0" style={{ transform: "rotateX(64deg)", transformOrigin: "50% 0%",
          background: `${line("rgb(58 69 128 / .55)", 110, 1.2)}, ${line("rgb(38 44 76 / .9)", 22, 1)}`, backgroundPosition: "center top",
          maskImage: "radial-gradient(42% 55% at 50% 22%, #000 20%, transparent 100%)", WebkitMaskImage: "radial-gradient(42% 55% at 50% 22%, #000 20%, transparent 100%)" }} />
      </div>
    );
  }
  const base = "pointer-events-none absolute";
  if (d === "arch") return <div className={cx(base, "left-1/2 top-[7%] bottom-[16%] w-[58%] -translate-x-1/2 rounded-t-full")} style={{ background: "linear-gradient(180deg, rgb(140 156 248 / .17), rgb(140 156 248 / .05) 80%, transparent)" }} />;
  if (d === "frame") return <div className={cx(base, "left-1/2 top-[7%] bottom-[14%] w-[56%] -translate-x-1/2 rounded-t-full border-[1.5px] border-b-0 border-[#8c9cf8]/60")} />;
  if (d === "strip") return <div className={cx(base, "left-1/2 top-[5%] bottom-[20%] w-[24%] -translate-x-1/2 rounded-full blur-[18px]")} style={{ background: "rgb(193 200 250 / .22)" }} />;
  if (d === "rings") return <div className={cx(base, "inset-0")} style={{ background: "repeating-radial-gradient(circle at 50% 46%, transparent 0 21px, rgb(140 156 248 / .1) 21px 22px)", maskImage: "radial-gradient(60% 60% at 50% 46%, #000 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(60% 60% at 50% 46%, #000 40%, transparent 100%)" }} />;
  if (d === "cone") return <div className={cx(base, "inset-0")} style={{ background: "linear-gradient(180deg, rgb(240 244 254 / .2), rgb(240 244 254 / .03) 85%)", clipPath: "polygon(42% 0, 58% 0, 82% 100%, 18% 100%)" }} />;
  return <div className={cx(base, "inset-0")} style={{ background: "linear-gradient(115deg, transparent 18%, rgb(240 244 254 / .09) 27%, transparent 38%, transparent 50%, rgb(240 244 254 / .06) 57%, transparent 66%)" }} />;
}

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

// the card the body stands in: its backdrop and decoration, the body (with its floor), and a pause button for the turning
// (paused, it stays still until the button is tapped again, dragging included)
function StageCard({ scene, h, paused, onPause, children }: { scene: Scene; h: string; paused: boolean; onPause: () => void; children: ReactNode }) {
  return (
    <div className={cx("relative mt-4 overflow-hidden rounded-[24px] border border-white/[.08]", h)} style={{ background: scene.bg }}>
      <Decor d={scene.deco} />
      {children}
      {/* the app's own round button (as help, above), bottom right: clear of help, by the feet, in thumb reach */}
      <RB icon={paused ? "play" : "pause"} size={40} onClick={onPause} label={paused ? "Turn the body" : "Stop turning"} className="absolute bottom-3 right-3" />
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
  const [sceneK, setSceneK] = useState("grid");
  const [lines, setLines] = useState<Lines>("white");
  const scene = SCENES.find((x) => x.k === sceneK) ?? SCENES[0];
  const stepScene = (d: number) => setSceneK(SCENES[(SCENES.indexOf(scene) + d + SCENES.length) % SCENES.length].k);
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
        <div>
          <div className="mb-2 flex items-center gap-3 text-[14px] text-white/50">Stage, {SCENES.indexOf(scene) + 1} of {SCENES.length}<span className="flex-1" /><RB icon="back" size={36} onClick={() => stepScene(-1)} label="Previous stage" /><RB icon="chevR" size={36} onClick={() => stepScene(1)} label="Next stage" /></div>
          <Pick items={SCENES} value={sceneK} onChange={setSceneK} />
          <p className="mt-3 max-w-[520px] text-[15px] leading-snug text-white/60">{scene.note}</p>
          {scene.floor === "grid" && <div className="mt-4"><div className="mb-2 text-[14px] text-white/50">Floor lines</div><Pick items={[{ k: "cornflower" as Lines, name: "Cornflower" }, { k: "white" as Lines, name: "White" }]} value={lines} onChange={setLines} /></div>}
        </div>
        <div><div className="mb-2 text-[14px] text-white/50">Dial</div><Pick items={DIALS} value={dialStyle} onChange={setDialStyle} /><p className="mt-3 max-w-[520px] text-[15px] leading-snug text-white/60">{DIALS.find((x) => x.k === dialStyle)!.note}</p></div>
      </div>
      <p className="mt-4 max-w-[760px] text-[15px] leading-snug text-white/50">On both: drag the body to turn it, the button at the bottom right stops and starts the turning, and the ruler keeps following your finger even outside the dial until you let go.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {/* the height step: slide the ruler and the body grows or shrinks, feet on the floor; it turns slowly (pause) */}
        <Phone label="Height: slide to change it">
          <div className="px-5 pt-12 text-white">
            <div className="flex h-11 items-center gap-3"><RB icon="close" size={40} label="Close" /><div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[12%] rounded-full bg-white" /></div></div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div><h1 className="h1 !text-[30px]">Height</h1><p className="mt-1.5 text-[15px] leading-snug text-white/60">Stand tall against a wall, heels together.</p></div>
              <RB icon="help" size={40} label="How to measure" className="shrink-0" />
            </div>
            <StageCard scene={scene} h="h-[300px]" paused={paused} onPause={() => setPaused((x) => !x)}>
              <Body3D sex={sex} measures={measures} look={L} focus="height" stage={scene.floor} chart={scene.chart} lines={lines} turn={body.turning} paused={paused} snapshot="stage" className="absolute inset-0" />
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
            <StageCard scene={scene} h="h-[280px]" paused={paused} onPause={() => setPaused((x) => !x)}>
              <Body3D sex={sex} measures={measures} look={L} focus={focus} stage={scene.floor} chart={scene.chart} lines={lines} paused={paused} autoRotate={body.turning} className="absolute inset-0" />
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
