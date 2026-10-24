"use client";
// Lab · 3D body studio: tune the look (material, lights, shadow) and the body (sex, measurements) live, and see the
// same body inside copies of the screens where it will live. Settings stay in this browser; "Copy settings" puts the
// exact values on the clipboard, to be built into the app.
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Leva, useControls, button, folder } from "leva";
import { Icon } from "@/components/icons";
import { cx, Glass, Pill, RB } from "@/components/ui";
import { MarkCover } from "@/components/art";
import { LOOKS, type Look } from "@/components/Body3D";
import { BodyLoader } from "@/components/BodyLoader";
import { ALL_MEASURES, BASE } from "@/lib/data";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false, loading: () => <BodyLoader /> });

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

// ink, with a cornflower light from above so faint it is felt more than seen (the app's .stage-ink)
const INK = "radial-gradient(75% 50% at 50% -8%, rgb(104 126 245 / .15), rgb(104 126 245 / .055) 45%, transparent 76%), var(--color-ink)";

// the garments being tried (tools/body3d/garments.json): what each stands in for, and the group it is shown in
const GARMENTS: { name: string; label: string; group: "Dresses" | "Tops" | "Trousers" | "Skirts"; must?: boolean }[] = [
  { name: "toigo_camisole_dress_with_full_skirt", label: "Slip dress", group: "Dresses", must: true },
  { name: "aethelraed_flapper_dress", label: "Wrap dress", group: "Dresses", must: true },
  { name: "mindfront_f_dress_02", label: "A-line midi", group: "Dresses", must: true },
  { name: "mindfront_f_dress_01", label: "Flutter midi", group: "Dresses", must: true },
  { name: "elvs_halter_dress_mini", label: "Halter, mini", group: "Dresses" },
  { name: "elvs_halter_dress_knee_length", label: "Halter, knee", group: "Dresses" },
  { name: "toigo_halter_dress_midi", label: "Halter, midi", group: "Dresses" },
  { name: "elvs_halter_dress_long", label: "Halter, long", group: "Dresses" },
  { name: "toigo_shift_dress", label: "Shift dress", group: "Dresses" },
  { name: "toigo_camisole_top", label: "Cami", group: "Tops", must: true },
  { name: "joepal_crude_t-shirt_female", label: "Tee (female)", group: "Tops", must: true },
  { name: "elvs_crude_t-shirt_male", label: "Tee (male)", group: "Tops", must: true },
  { name: "elvs_male_shirt_untucked_bd1", label: "Shirt", group: "Tops", must: true },
  { name: "punkduck_spaghetti_strap_tank_top", label: "Strap tank", group: "Tops" },
  { name: "punkduck_v_neck_top", label: "V-neck top", group: "Tops" },
  { name: "elvs_ruffle_sleeve_peasant_blouse_1", label: "Ruffle blouse", group: "Tops" },
  { name: "toigo_fisherman_sweater", label: "Sweater", group: "Tops" },
  { name: "mindfront_cardigan_long_open_front", label: "Long cardigan", group: "Tops" },
  { name: "elvs_gored_elephant_pants", label: "Wide-leg", group: "Trousers", must: true },
  { name: "toigo_wool_pants", label: "Straight pant", group: "Trousers", must: true },
  { name: "mindfront_male_trousers_1", label: "Trousers (male)", group: "Trousers" },
  { name: "elvs_jeans_straight_leg", label: "Straight jeans", group: "Trousers" },
  { name: "elvs_gored_midi_skirt", label: "Bias midi skirt", group: "Skirts", must: true },
  { name: "scsouza_mini_denin_skirt", label: "A-line mini", group: "Skirts", must: true },
  { name: "toigo_long_full_skirt", label: "Long full skirt", group: "Skirts" },
  { name: "toigo_skirt_with_lace_ruffle", label: "Knee skirt", group: "Skirts" },
  { name: "elvs_pencil_skirt", label: "Pencil skirt", group: "Skirts" },
];
// fabric colours to try (any colour works: the garment is one plain fabric)
const FABRICS = ["#e8e3da", "#1c1d26", "#687ef5", "#c9a27e", "#7d8b6a", "#b4475a", "#f0f4fe"];

// the body library's cards: a picture of each body (Jose will bring a cinematic one; the mannequin stands in), in one of
// five styles, after the looks already chosen for the app (the start screen's night card, snow, inset tiles, the pattern
// floor). No 3D on these
type LibStyle = "night" | "poster" | "floor" | "snow" | "inset";
const LIB_STYLES: { k: LibStyle; name: string; note: string }[] = [
  { k: "night", name: "A · Night card", note: "The start screen's night card: flat night with cornflower lights roaming its lower part, the body rising out of the top of the card, the name on the night." },
  { k: "poster", name: "B · Portrait poster", note: "The picture fills the card from the head down, fading into ink at the bottom where the name sits: a film poster." },
  { k: "floor", name: "C · Pattern floor", note: "Ink, the faint cornflower light from above and the pattern floor, the body standing on it: the measuring screens' stage, small." },
  { k: "snow", name: "D · Snow", note: "A snow card (the app's light tops and chosen cards), the body standing with a soft shadow, ink words." },
  { k: "inset", name: "E · Inset window", note: "The card colour, the body standing in a window pressed into the card (the inset tiles' look), the name and count below it." },
];

function BodyCard({ style, name, n, img }: { style: LibStyle; name: string; n: number; img: string }) {
  const label = (dark = true) => (
    <div className="absolute bottom-4 left-4 right-4">
      <div className={cx("text-[15px] font-medium", !dark && "text-[#12131c]")}>{name}</div>
      <div className={cx("text-[13px]", dark ? "text-white/65" : "text-[#12131c]/60")}><span className={cx("serif text-[15px]", dark ? "text-white" : "text-[#12131c]")}>{n}</span> of 24 measurements</div>
    </div>
  );
  // eslint-disable-next-line @next/next/no-img-element
  const pic = (cls: string) => <img src={img} alt="" draggable={false} className={cx("pointer-events-none absolute select-none", cls)} />;
  if (style === "night") return (
    <div className="relative h-[230px]">
      {/* on the dark page the night needs an edge to read as a card (on the start screen it sits on paper) */}
      <div className="night rounded-[26px]" style={{ clipPath: "inset(0 round 26px)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / .08), inset 0 1px 0 rgb(255 255 255 / .1)" }} aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
      {/* the body comes out of the card at the top, cut cleanly along its bottom edge */}
      <div className="absolute inset-0" style={{ clipPath: "inset(-40px -40px 0 -40px round 0 0 26px 26px)" }}>{pic("left-1/2 top-[-12px] h-[150%] w-auto max-w-none -translate-x-1/2")}</div>
      <div className="absolute inset-x-0 bottom-0 h-[44%] rounded-b-[26px]" style={{ background: "linear-gradient(180deg, transparent, rgb(11 12 21 / .85))" }} />
      {label()}
    </div>
  );
  if (style === "poster") return (
    <div className="relative h-[230px] overflow-hidden rounded-[26px] border border-white/[.08]" style={{ background: "radial-gradient(80% 50% at 50% 0%, rgb(104 126 245 / .16), transparent 70%), var(--color-ink)" }}>
      {pic("left-1/2 top-[6%] h-[170%] w-auto max-w-none -translate-x-1/2")}
      <div className="absolute inset-x-0 bottom-0 h-[55%]" style={{ background: "linear-gradient(180deg, transparent, var(--color-ink) 78%)" }} />
      {label()}
    </div>
  );
  if (style === "floor") return (
    <div className="relative h-[230px] overflow-hidden rounded-[26px] border border-white/[.08]" style={{ background: INK }}>
      <div className="absolute inset-x-0 bottom-0 h-[46%]" style={{ perspective: "180px", perspectiveOrigin: "50% 0%" }}>
        <div className="absolute -inset-x-[60%] bottom-[-40%] top-0" style={{ transform: "rotateX(62deg)", transformOrigin: "50% 0%",
          background: "repeating-linear-gradient(0deg, rgb(75 79 99 / .7) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgb(75 79 99 / .7) 0 1px, transparent 1px 18px)",
          maskImage: "radial-gradient(40% 55% at 50% 15%, #000 15%, transparent 100%)", WebkitMaskImage: "radial-gradient(40% 55% at 50% 15%, #000 15%, transparent 100%)" }} />
      </div>
      <div className="absolute left-1/2 top-[66%] h-3 w-20 -translate-x-1/2 rounded-[50%] bg-black/70 blur-[5px]" />
      {pic("left-1/2 top-[10%] h-[58%] w-auto -translate-x-1/2")}
      <div className="absolute left-4 top-4 right-4"><div className="text-[15px] font-medium">{name}</div><div className="text-[13px] text-white/65"><span className="serif text-[15px] text-white">{n}</span> of 24</div></div>
    </div>
  );
  if (style === "snow") return (
    <div className="relative h-[230px] overflow-hidden rounded-[26px] bg-snow shadow-[inset_0_1px_0_#fff,0_10px_24px_-14px_rgb(0_0_0/.6)]">
      <div className="absolute left-1/2 top-[60%] h-3 w-16 -translate-x-1/2 rounded-[50%] bg-[#1c2252]/25 blur-[5px]" />
      {pic("left-1/2 top-[8%] h-[54%] w-auto -translate-x-1/2")}
      {label(false)}
    </div>
  );
  return (
    <div className="glass relative h-[230px] rounded-[26px] p-2.5">
      <div className="lab-inset relative h-[150px] overflow-hidden rounded-[18px]">
        <div className="absolute left-1/2 top-[86%] h-2.5 w-14 -translate-x-1/2 rounded-[50%] bg-black/70 blur-[4px]" />
        {pic("left-1/2 top-[7%] h-[82%] w-auto -translate-x-1/2")}
      </div>
      {label()}
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
    turning: true,
  }));
  // for testing the lab from the browser's console: window.__labSetBody({ bust: 120 })
  useEffect(() => { (window as unknown as { __labSetBody?: typeof setBody }).__labSetBody = setBody; }, [setBody]);
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
  const [edit, setEdit] = useState("waist");
  const [libStyle, setLibStyle] = useState<LibStyle>("night");
  const [paused6, setPaused6] = useState(false);
  // what the body wears on the fitting screen: a top and a bottom can be worn together, a dress alone
  const [wear, setWear] = useState<string[]>(["mindfront_f_dress_01"]);
  // the fabric: each garment's own look (its original textures), or a plain colour of ours
  const [fabric, setFabric] = useState<string | null>(null);
  const toggleWear = (name: string) => setWear((cur) => {
    if (cur.includes(name)) return cur.filter((x) => x !== name);
    const g = GARMENTS.find((x) => x.name === name)!.group;
    const keep = g === "Dresses" ? [] : cur.filter((x) => { const h = GARMENTS.find((y) => y.name === x)!.group; return h !== g && h !== "Dresses" && !(g === "Skirts" && h === "Trousers") && !(g === "Trousers" && h === "Skirts"); });
    // innermost first: a bottom under a top (the top's hem over the waistband)
    const order = (x: string) => (GARMENTS.find((y) => y.name === x)!.group === "Tops" ? 1 : 0);
    return [...keep, name].sort((a, b) => order(a) - order(b));
  });
  const L = look as unknown as Look;

  if (!ready) return null;
  return (
    <section>
      {/* ?shots in the address hides the panel (for clean screenshots) */}
      <Leva collapsed={false} hidden={typeof window !== "undefined" && window.location.search.includes("shots")} titleBar={{ title: "3D body" }} />
      <h2 className="h1 !text-[34px]">3D body</h2>
      <p className="mt-3 max-w-[640px] text-[16px] leading-snug text-white/65">The MakeHuman mannequin, fitted to the measurements in the panel and lit by the look, in copies of the screens still being designed. The measuring steps and Body ready are live in the app. Drag a body to turn it. Your settings stay in this browser; Copy settings puts the exact values on the clipboard.</p>
      <h3 className="mt-10 text-[22px] font-normal tracking-[-.02em]">Garments on the 3D body (testing)</h3>
      <p className="mt-3 max-w-[760px] text-[15px] leading-snug text-white/60">MakeHuman garments, fitted to our bodies with the body&apos;s own size controls: change the measurements or the sex in the panel and the garment follows. Each one downloads only when you put it on. A top and a bottom can be worn together; a dress is worn alone. The fabric is each garment&apos;s own look (Original), or a plain colour of ours that keeps its surface detail. The ones marked with a dot stand in for the app&apos;s garments; the rest are extras.</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-5">
          {(["Dresses", "Tops", "Trousers", "Skirts"] as const).map((grp) => (
            <div key={grp}>
              <div className="mb-2 text-[14px] text-white/50">{grp}</div>
              <div className="flex flex-wrap gap-2">{GARMENTS.filter((x) => x.group === grp).map((x) => (
                <button key={x.name} onClick={() => toggleWear(x.name)} aria-pressed={wear.includes(x.name)} title={x.name}
                  className={cx("flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors", wear.includes(x.name) ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>
                  {x.must && <span className={cx("h-1.5 w-1.5 rounded-full", wear.includes(x.name) ? "bg-primary" : "bg-peri")} />}{x.label}
                </button>
              ))}</div>
            </div>
          ))}
          <div>
            <div className="mb-2 text-[14px] text-white/50">Fabric</div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFabric(null)} aria-pressed={fabric === null} className={cx("h-9 rounded-full px-4 text-[14px] font-medium transition-colors", fabric === null ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>Original</button>
              {FABRICS.map((c) => (
              <button key={c} onClick={() => setFabric(c)} aria-label={`Fabric ${c}`} aria-pressed={fabric === c} className={cx("h-9 w-9 rounded-full border-2", fabric === c ? "border-white" : "border-white/15")} style={{ background: c }} />
            ))}<input type="color" value={fabric ?? FABRICS[0]} onChange={(e) => setFabric(e.target.value)} aria-label="Any fabric colour" className="h-9 w-12 cursor-pointer rounded-md bg-transparent" /></div>
          </div>
        </div>
        <Phone label="Fitting room">
          <div className="absolute inset-0" style={{ background: INK }} />
          <Body3D sex={sex} measures={measures} look={L} focus="height" stage="grid" lines="white" turn paused={paused6} garments={wear} garmentColor={fabric} snapshot="fit" className="absolute inset-0" />
          <RB icon={paused6 ? "play" : "pause"} size={40} onClick={() => setPaused6((x) => !x)} label={paused6 ? "Turn the body" : "Stop turning"} className="absolute bottom-6 right-5" />
        </Phone>
      </div>

      <h3 className="mt-16 text-[22px] font-normal tracking-[-.02em]">Screens in progress</h3>
      <div className="mt-4"><div className="mb-2 text-[14px] text-white/50">Body library cards</div><Pick items={LIB_STYLES} value={libStyle} onChange={setLibStyle} /><p className="mt-3 max-w-[620px] text-[15px] leading-snug text-white/60">{LIB_STYLES.find((x) => x.k === libStyle)!.note} The mannequin stands in for the picture you are choosing.</p></div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {/* 2 · the body after setup (Preview): turn it, the four base numbers */}
        <Phone label="2 · Your body (after setup)">
          <div className="absolute inset-0" style={{ background: INK }} />
          <div className="px-5 pt-12 text-white">
            <div className="flex h-11 items-center"><RB icon="back" size={40} label="Back" /><div className="flex-1" /><RB icon="more" size={40} label="More" /></div>
            <h1 className="h-serif mt-3">Me, Spring 26</h1>
            <div className="mt-1 text-[15px] text-white/55">24 of 24 measurements</div>
          </div>
          <div className="absolute inset-x-5 top-[170px] h-[390px]">
            <Body3D sex={sex} measures={measures} look={L} focus="height" stage="grid" lines="white" autoRotate={body.turning} snapshot="body" className="absolute inset-0" />
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

        {/* 5 · the body library: a picture per body (no 3D here), in the card style picked above */}
        <Phone label="5 · Body library">
          <div className="relative px-5 text-white">
            <MarkCover className="-mx-5 h-[150px]" />
            <h1 className="h-serif relative -mt-6">Body library</h1>
            <div className="field mt-4 flex h-12 items-center gap-2.5 px-4"><Icon name="search" size={18} className="text-white/50" /><span className="text-[16px] text-white/40">Search bodies</span></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <BodyCard style={libStyle} name="Me, Spring 26" n={24} img="/lab/body-female.webp" />
              <BodyCard style={libStyle} name="Tom" n={4} img="/lab/body-male.webp" />
              <div className="flex h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/25">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Icon name="plus" size={24} /></span>
                <span className="mt-3 text-[15px] font-medium">New body</span><span className="text-[13px] text-white/50">4 measures to start</span>
              </div>
            </div>
          </div>
        </Phone>

        {/* 6 · the result screen: the body on the pattern floor, the whole screen its backdrop (the garment comes later) */}
        <Phone label="6 · On your body">
          <div className="absolute inset-0" style={{ background: INK }} />
          <div className="relative px-5 pt-14 text-center text-white">
            <h1 className="text-[24px] font-normal tracking-[-.02em]">Flutter midi dress</h1>
            <p className="mt-1 text-[15px] text-white/60">Drafted to Me · easy fit</p>
            <div className="mx-auto mt-4 flex w-[240px] rounded-full bg-card p-1 text-[14px] font-medium"><span className="flex-1 rounded-full bg-white py-2 text-bg">On your body</span><span className="flex-1 py-2 text-white/70">Pattern</span></div>
          </div>
          {/* the stage runs to the bottom of the screen, so the floor shows behind the buttons too */}
          <Body3D sex={sex} measures={measures} look={L} focus="height" stage="grid" lines="white" turn paused={paused6} room={0.2} garments={["mindfront_f_dress_01"]} garmentColor={fabric} className="absolute inset-x-0 bottom-0 top-44" />
          <RB icon={paused6 ? "play" : "pause"} size={40} onClick={() => setPaused6((x) => !x)} label={paused6 ? "Turn the body" : "Stop turning"} className="absolute bottom-[100px] right-5" />
          <div className="absolute inset-x-5 bottom-8 flex gap-3 text-white"><span className="pill pill-dark flex-1 text-[15px]">Change the design</span><span className="pill pill-primary flex-1 text-[15px]">Looks right</span></div>
        </Phone>
      </div>
    </section>
  );
}
