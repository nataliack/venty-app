"use client";
// The UI chat's lab page (/lab/ui). Today: Natalia's business card for the profile page, set up so it can be designed:
// pick the stock and a finish and a press for every element, and turn the card in your hand. The layout and copy are
// placeholders until the card is designed.
import { useState, type ReactNode } from "react";
import { LOGO } from "@/components/art";
import { cx } from "@/components/ui";
import { BusinessCard, PRESSES, SIZES, SURFACES, type El, type Press, type Stock, type Surface } from "./BusinessCard";

const MARK = [LOGO[4]], WORD = LOGO.slice(0, 4);
const ELS: El[] = [
  { id: "mark", name: "Background mark", face: "front", kind: "art", paths: MARK, x: 41, y: 9, w: 62, surface: "blind", press: "chisel-deboss" },
  { id: "word", name: "Wordmark", face: "front", kind: "art", paths: WORD, x: 7, y: 7, w: 30, surface: "ink", press: "chisel-emboss" },
  { id: "tag", name: "Tagline", face: "front", kind: "text", text: "Sewing patterns, drafted to you", x: 7, y: 48.5, size: 2.5, surface: "ink", press: "flat" },
  { id: "bmark", name: "Mark", face: "back", kind: "art", paths: MARK, x: 7, y: 7, w: 11, surface: "foil-cornflower", press: "flat" },
  { id: "name", name: "Name", face: "back", kind: "text", text: "Natalia Chamon", x: 7, y: 33, size: 6, tracking: -0.03, surface: "ink", press: "letterpress" },
  { id: "role", name: "Role", face: "back", kind: "text", text: "Designer of Venty", x: 7, y: 38.5, size: 2.6, surface: "ink", press: "flat" },
  { id: "web", name: "Website", face: "back", kind: "text", text: "nataliachamon.com", x: 7, y: 49, size: 2.3, surface: "ink", press: "flat" },
  { id: "place", name: "Place", face: "back", kind: "text", text: "QUT, Brisbane", x: 83, y: 49, size: 2.3, align: "right", surface: "ink", press: "flat" },
];

const PAPERS = [
  { c: "#f0f4fe", name: "Snow" }, { c: "#f5f2ea", name: "Cotton" }, { c: "#131523", name: "Ink" },
  { c: "#0b0c15", name: "Night" }, { c: "#687ef5", name: "Cornflower" }, { c: "#0d0d0f", name: "Black" },
];
const INKS = [{ c: "#131523", name: "Ink" }, { c: "#f0f4fe", name: "Snow" }, { c: "#687ef5", name: "Cornflower" }, { c: "#8c9cf8", name: "Periwinkle" }];
const STOCK: Stock = { size: "au", paper: "#f0f4fe", ink: "#131523", coating: "uncoated", texture: "smooth", thickness: 0.6, corner: 0, edge: "paper", through: 0.45 };

type F = Record<string, [Surface, Press]>;
const PRESETS: { name: string; stock: Partial<Stock>; f: F }[] = [
  { name: "Snow, chisel", stock: { paper: "#f0f4fe", ink: "#131523", texture: "smooth", coating: "uncoated", thickness: 0.6, edge: "paper" },
    f: { mark: ["blind", "chisel-deboss"], word: ["ink", "chisel-emboss"], tag: ["ink", "flat"], bmark: ["foil-cornflower", "flat"], name: ["ink", "letterpress"], role: ["ink", "flat"], web: ["ink", "flat"], place: ["ink", "flat"] } },
  { name: "Ink, white foil", stock: { paper: "#131523", ink: "#8c9cf8", texture: "smooth", coating: "soft", thickness: 0.8, edge: "ink" },
    f: { mark: ["blind", "deboss"], word: ["foil-white", "emboss"], tag: ["foil-white", "flat"], bmark: ["foil-white", "flat"], name: ["foil-white", "flat"], role: ["ink", "flat"], web: ["ink", "flat"], place: ["ink", "flat"] } },
  { name: "Black on black", stock: { paper: "#0d0d0f", ink: "#f0f4fe", texture: "smooth", coating: "soft", thickness: 0.8, edge: "paper" },
    f: { mark: ["spot", "flat"], word: ["foil-black", "chisel-emboss"], tag: ["ink", "flat"], bmark: ["foil-black", "flat"], name: ["foil-black", "deboss"], role: ["ink", "flat"], web: ["ink", "flat"], place: ["ink", "flat"] } },
  { name: "Cornflower, silver", stock: { paper: "#687ef5", ink: "#f0f4fe", texture: "smooth", coating: "silk", thickness: 0.6, edge: "paper" },
    f: { mark: ["blind", "chisel-deboss"], word: ["foil-silver", "deep-emboss"], tag: ["ink", "flat"], bmark: ["foil-silver", "flat"], name: ["foil-silver", "flat"], role: ["ink", "flat"], web: ["ink", "flat"], place: ["ink", "flat"] } },
  { name: "Cotton, letterpress", stock: { paper: "#f5f2ea", ink: "#131523", texture: "cotton", coating: "uncoated", thickness: 1.2, edge: "cornflower" },
    f: { mark: ["blind", "deep-emboss"], word: ["ink", "letterpress"], tag: ["ink", "letterpress"], bmark: ["ink", "letterpress"], name: ["ink", "letterpress"], role: ["ink", "letterpress"], web: ["ink", "letterpress"], place: ["ink", "letterpress"] } },
  { name: "Night, holographic", stock: { paper: "#0b0c15", ink: "#8c9cf8", texture: "felt", coating: "uncoated", thickness: 1.2, edge: "foil-silver" },
    f: { mark: ["blind", "chisel-deboss"], word: ["foil-holo", "chisel-emboss"], tag: ["ink", "flat"], bmark: ["foil-holo", "flat"], name: ["foil-holo", "flat"], role: ["ink", "flat"], web: ["ink", "flat"], place: ["ink", "flat"] } },
];

const sel = "h-10 w-full min-w-0 rounded-xl border border-white/15 bg-[#11121a] px-3 text-[14px] text-white";
function Row({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 py-1.5"><span className="text-[14px] text-white/65">{label}</span><span className="flex min-w-0 gap-2">{children}</span></label>;
}
function Pick<T extends string | number>({ v, set, list }: { v: T; set: (v: T) => void; list: { k: T; name: string }[] }) {
  return (
    <select className={sel} value={String(v)} onChange={(e) => set(list.find((x) => String(x.k) === e.target.value)!.k)}>
      {list.map((x) => <option key={String(x.k)} value={String(x.k)}>{x.name}</option>)}
    </select>
  );
}

function CardLab() {
  const [els, setEls] = useState(ELS);
  const [stock, setStock] = useState(STOCK);
  const [relief, setRelief] = useState(1.6);
  const [flip, setFlip] = useState(0);
  const [page, setPage] = useState<"dark" | "light">("dark");
  const [preset, setPreset] = useState(0);
  const [near, setNear] = useState(false);
  const put = <K extends keyof Stock>(k: K, v: Stock[K]) => setStock((s) => ({ ...s, [k]: v }));
  const fin = (id: string, surface?: Surface, press?: Press) => setEls((l) => l.map((e) => (e.id === id ? { ...e, surface: surface ?? e.surface, press: press ?? e.press } : e)));
  const apply = (i: number) => {
    const p = PRESETS[i]; setPreset(i);
    setStock((s) => ({ ...s, ...p.stock }));
    setEls((l) => l.map((e) => (p.f[e.id] ? { ...e, surface: p.f[e.id][0], press: p.f[e.id][1] } : e)));
  };
  return (
    <section>
      <h2 className="h1 !text-[34px]">Natalia&apos;s card</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/60">
        For the profile page. Set the stock, then a finish and a press for each element, and turn the card in your hand. The layout and words are placeholders until the card is designed.
      </p>
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <div className={cx("relative overflow-hidden rounded-[30px]", page === "dark" ? "bg-bg" : "bg-snow")}>
            <BusinessCard els={els} stock={stock} relief={relief} flip={flip} near={near} className="h-[320px] w-full cursor-grab active:cursor-grabbing sm:h-[440px] lg:h-[600px]" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={() => setFlip((f) => f + 1)} className="pill-dark h-10 rounded-full px-4 text-[14px] font-medium">Turn it over</button>
            <button onClick={() => setNear((n) => !n)} aria-pressed={near} className={cx("h-10 rounded-full px-4 text-[14px] font-medium", near ? "bg-white text-bg" : "pill-dark")}>Close up</button>
            <div className="flex rounded-full border border-white/15 p-1">
              {(["dark", "light"] as const).map((k) => (
                <button key={k} onClick={() => setPage(k)} className={cx("h-8 rounded-full px-3.5 text-[13px] font-medium", page === k ? "bg-white text-bg" : "text-white/70")}>{k === "dark" ? "Dark page" : "Light page"}</button>
              ))}
            </div>
            <span className="text-[13px] text-white/45">Drag to turn it. Double click to flip.</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[15px] text-white/50">Start from</p>
          <div className="mt-2 flex flex-wrap gap-2">{PRESETS.map((p, i) => (
            <button key={p.name} onClick={() => apply(i)} aria-pressed={preset === i} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", preset === i ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{p.name}</button>
          ))}</div>

          <p className="mt-8 text-[15px] text-white/50">Stock</p>
          <div className="mt-1">
            <Row label="Size"><Pick v={stock.size} set={(v) => put("size", v)} list={(Object.keys(SIZES) as Stock["size"][]).map((k) => ({ k, name: SIZES[k].name }))} /></Row>
            <Row label="Paper"><Pick v={stock.paper} set={(v) => put("paper", v)} list={PAPERS.map((p) => ({ k: p.c, name: p.name }))} /></Row>
            <Row label="Ink"><Pick v={stock.ink} set={(v) => put("ink", v)} list={INKS.map((p) => ({ k: p.c, name: p.name }))} /></Row>
            <Row label="Surface"><Pick v={stock.coating} set={(v) => put("coating", v)} list={[{ k: "uncoated", name: "Uncoated" }, { k: "silk", name: "Silk" }, { k: "soft", name: "Soft touch" }]} /></Row>
            <Row label="Texture"><Pick v={stock.texture} set={(v) => put("texture", v)} list={[{ k: "smooth", name: "Smooth" }, { k: "cotton", name: "Cotton" }, { k: "felt", name: "Felt" }]} /></Row>
            <Row label="Thickness"><Pick v={stock.thickness} set={(v) => put("thickness", v)} list={[{ k: 0.4, name: "0.4 mm (standard)" }, { k: 0.6, name: "0.6 mm (heavy)" }, { k: 0.8, name: "0.8 mm (thick)" }, { k: 1.2, name: "1.2 mm (duplexed)" }]} /></Row>
            <Row label="Corners"><Pick v={stock.corner} set={(v) => put("corner", v)} list={[{ k: 0, name: "Square" }, { k: 2, name: "Round 2 mm" }, { k: 4, name: "Round 4 mm" }]} /></Row>
            <Row label="Edges"><Pick v={stock.edge} set={(v) => put("edge", v)} list={[{ k: "paper", name: "Paper" }, { k: "ink", name: "Painted, ink" }, { k: "cornflower", name: "Painted, cornflower" }, { k: "foil-gold", name: "Gold foil" }, { k: "foil-silver", name: "Silver foil" }]} /></Row>
          </div>

          {(["front", "back"] as const).map((face) => (
            <div key={face}>
              <p className="mt-8 text-[15px] text-white/50">{face === "front" ? "Front" : "Back"}</p>
              <div className="mt-1">{els.filter((e) => e.face === face).map((e) => (
                <Row key={e.id} label={e.name}>
                  <Pick v={e.surface} set={(v) => fin(e.id, v)} list={SURFACES} />
                  <Pick v={e.press} set={(v) => fin(e.id, undefined, v)} list={PRESSES} />
                </Row>
              ))}</div>
            </div>
          ))}

          <p className="mt-8 text-[15px] text-white/50">Light</p>
          <div className="mt-1">
            <Row label="Relief"><input type="range" min={0.4} max={4} step={0.1} value={relief} onChange={(e) => setRelief(+e.target.value)} className="w-full accent-[#687ef5]" /></Row>
            <Row label="Shows through"><input type="range" min={0} max={1} step={0.05} value={stock.through} onChange={(e) => put("through", +e.target.value)} className="w-full accent-[#687ef5]" /></Row>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LabUI() {
  return (
    // the app pins html and body (no page scroll), so the lab scrolls inside its own box
    <div className="fixed inset-0 overflow-y-auto bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <p className="text-[14px] text-white/50">Venty lab · UI</p>
        <div className="mt-6"><CardLab /></div>
      </div>
    </div>
  );
}
