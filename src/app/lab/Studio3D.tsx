"use client";
// Lab · 3D body studio: tune the look (material, lights, shadow) and the body (sex, measurements) live, and see the
// same body inside copies of the screens where it will live. Settings stay in this browser; "Copy settings" puts the
// exact values on the clipboard, to be built into the app.
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Leva, useControls, button, folder } from "leva";
import { Icon } from "@/components/icons";
import { LOOKS, type Look } from "@/components/Body3D";
import { MEASURE_NAMES, SHOTS } from "@/lib/bodyShots";
import { ALL_MEASURES } from "@/lib/data";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false });

const STORE = "venty-lab-3d";
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

export function Studio3D() {
  // true once in the browser (the saved look lives in localStorage, so the panel starts after the first paint)
  const ready = useSyncExternalStore(() => () => {}, () => true, () => false);
  const init = useMemo(() => ({ ...LOOKS.chrome, ...(typeof window !== "undefined" ? saved() : {}) }), []);

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
  const fm = ALL_MEASURES.find((m) => m.key === focus);
  const value = (measures as Record<string, number>)[focus] ?? fm?.value;
  const L = look as unknown as Look;

  if (!ready) return null;
  return (
    <section>
      {/* ?shots in the address hides the panel (for clean screenshots) */}
      <Leva collapsed={false} hidden={typeof window !== "undefined" && window.location.search.includes("shots")} titleBar={{ title: "3D body" }} />
      <h2 className="h1 !text-[34px]">3D body</h2>
      <p className="mt-3 max-w-[640px] text-[16px] leading-snug text-white/65">The MakeHuman mannequin, fitted to the measurements in the panel and lit by the look. Pick a measurement under Measuring: the body takes the pose for it and the camera frames it (the first phone). Drag a body to turn it. Your settings stay in this browser; Copy settings puts the exact values on the clipboard.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {/* a measuring step: the title, the body in its card with the tape ring, the value */}
        <Phone label="Measuring">
          <div className="px-5 pt-14 text-white">
            <div className="text-[13px] text-white/55">Measures · {MEASURE_NAMES[focus]}</div>
            <h1 className="h1 mt-2 !text-[30px]">{MEASURE_NAMES[focus]}</h1>
            <p className="mt-1.5 line-clamp-2 text-[15px] text-white/60">{fm?.hint}</p>
            <div className="glass relative mt-4 h-[380px] overflow-hidden rounded-[24px]">
              <Body3D sex={sex} measures={measures} look={L} focus={focus} autoRotate={body.turning} className="absolute inset-0" />
            </div>
            <div className="dial mt-4 flex h-[110px] items-center justify-center"><span className="serif text-[44px] leading-none">{value?.toFixed(1)}</span><span className="unit ml-2">cm</span></div>
          </div>
        </Phone>
        {/* the body on its own: the preview after setup */}
        <Phone label="Your body">
          <div className="absolute inset-0" style={{ background: "radial-gradient(60% 45% at 50% 55%, rgb(104 126 245 / .22), transparent 70%)" }} />
          <div className="relative px-5 pt-14 text-white">
            <h1 className="h1 !text-[30px]">Me, Spring 26</h1>
            <p className="mt-1 text-[15px] text-white/55">24 of 24 measurements</p>
          </div>
          <Body3D sex={sex} measures={measures} look={L} focus="height" autoRotate={body.turning} className="absolute inset-x-0 bottom-24 top-36" />
          <div className="absolute inset-x-5 bottom-8 grid grid-cols-4 gap-2 text-white">{(["height", "bust", "waist", "hips"] as const).map((k) => (
            <div key={k} className="card-soft rounded-[16px] px-2.5 py-2.5"><div className="text-[12px] capitalize text-white/55">{k}</div><div className="serif mt-1.5 text-[22px] leading-none">{Math.round(measures[k])}</div></div>
          ))}</div>
        </Phone>
        {/* the result screen's stage (the garment comes in the next step) */}
        <Phone label="On your body">
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
