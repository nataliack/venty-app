"use client";
// The UI chat's lab page (/lab/ui). Natalia's business card, for the profile page: two families of designs (for Venty,
// and her own), each in colourways, turned in 3D with real finishes; an inspector to change the stock and every
// element's finish, press and colour; and a wall of every design and colourway, flat, to compare them at a glance.
import { useMemo, useRef, useState, type ReactNode } from "react";
import { cx } from "@/components/ui";
import { BusinessCard, FlatFace, FOIL, PRESSES, SIZES, SURFACES, type El, type Press, type Stock, type Surface } from "./BusinessCard";
import { DESIGNS, PALETTE, type Family } from "./designs";
import { NC } from "./brand";

// ─── little visual controls ───
const FOIL_CSS: Record<string, string> = {
  "foil-gold": "linear-gradient(135deg,#fff3cf,#c9a456 45%,#fbe3a1 62%,#a8833b)",
  "foil-silver": "linear-gradient(135deg,#ffffff,#9aa1ad 45%,#eef1f6 62%,#7d8592)",
  "foil-copper": "linear-gradient(135deg,#ffe0cc,#b8714b 45%,#f6c2a1 62%,#8f5233)",
  "foil-cornflower": "linear-gradient(135deg,#e3e8ff,#6b7de8 45%,#c6cefe 62%,#4f5fc4)",
  "foil-holo": "linear-gradient(135deg,#f4d4ff,#c9f1ff 30%,#fff3c4 55%,#d6dcff 75%,#ffd3e8)",
  "foil-white": "linear-gradient(135deg,#ffffff,#e8ebf2 55%,#ffffff)",
  "foil-butter": "linear-gradient(135deg,#fffbe8,#fff0b2 55%,#f3e2a0)",
  "foil-cream": "linear-gradient(135deg,#ffffff,#fff7e2 55%,#efe6cf)",
  "foil-black": "linear-gradient(135deg,#3a3c45,#07080b 45%,#2a2c33 62%,#000)",
};
function surfaceCss(s: Surface, color: string, paper: string) {
  if (s === "ink") return { background: color };
  if (s === "blind") return { background: paper, boxShadow: "inset 1.5px 1.5px 2px rgb(0 0 0 / .45), inset -1px -1px 1.5px rgb(255 255 255 / .35)" };
  if (s === "spot") return { background: `radial-gradient(circle at 32% 28%, rgb(255 255 255 / .85), transparent 38%), ${paper}` };
  return { background: FOIL_CSS[s] ?? FOIL[s].c };
}
const PRESS_D: Record<Press, string> = {
  flat: "M2 8H26",
  emboss: "M2 9H8C10 9 10 4 14 4C18 4 18 9 20 9H26",
  "chisel-emboss": "M2 9H8L11 4H17L20 9H26",
  "deep-emboss": "M2 10H7C10 10 10 2 14 2C18 2 18 10 21 10H26",
  deboss: "M2 5H8C10 5 10 10 14 10C18 10 18 5 20 5H26",
  "chisel-deboss": "M2 5H8L11 10H17L20 5H26",
  letterpress: "M2 5H9.4L10 4.2L10.6 11H17.4L18 4.2L18.6 5H26",
};
const ring = (on: boolean) => (on ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d0e16]" : "ring-1 ring-white/15 hover:ring-white/40");
function Dot({ on, title, style, onClick, size = 26 }: { on: boolean; title: string; style: React.CSSProperties; onClick: () => void; size?: number }) {
  return <button type="button" title={title} aria-label={title} aria-pressed={on} onClick={onClick} className={cx("shrink-0 rounded-full transition-shadow", ring(on))} style={{ width: size, height: size, ...style }} />;
}
function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return <button type="button" title={title} aria-pressed={on} onClick={onClick} className={cx("h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition-colors", on ? "bg-white text-bg" : "border border-white/12 text-white/70 hover:text-white")}>{children}</button>;
}
function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-t border-white/[.08] py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-medium text-white/85 [&::-webkit-details-marker]:hidden">
        {title}<span className="text-white/35 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="mb-1.5 text-[12.5px] text-white/45">{label}</p><div className="flex flex-wrap items-center gap-2">{children}</div></div>;
}

// ─── the wall: every design in every colourway, front over back ───
function Pair({ els, stock, on, onClick, label }: { els: El[]; stock: Stock; on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cx("group w-full rounded-[22px] p-3 text-left transition-colors", on ? "bg-white/[.09]" : "hover:bg-white/[.04]")}>
      <div className="relative aspect-[1.45] w-full">
        <FlatFace els={els} stock={stock} face="back" px={4} className="absolute bottom-0 right-0 w-[78%] rounded-[3px] shadow-[0_14px_30px_-12px_rgb(0_0_0/.9)]" />
        <FlatFace els={els} stock={stock} face="front" px={4} className="absolute left-0 top-0 w-[78%] rounded-[3px] shadow-[0_18px_40px_-14px_rgb(0_0_0/.95)] transition-transform group-hover:-translate-y-0.5" />
      </div>
      <p className={cx("mt-3 text-[13.5px]", on ? "text-white" : "text-white/60")}>{label}</p>
    </button>
  );
}

const BACKDROPS = [{ c: "#0b0c15", name: "Night" }, { c: "#f0f4fe", name: "Snow" }, { c: NC.green, name: "Green" }, { c: NC.cream, name: "Cream" }, { c: "#687ef5", name: "Cornflower" }];

export default function LabUI() {
  const [family, setFamily] = useState<Family>("venty");
  const [sel, setSel] = useState({ d: DESIGNS[0].id, w: DESIGNS[0].ways[0].id });
  const design = DESIGNS.find((d) => d.id === sel.d)!;
  const [card, setCard] = useState(() => design.make(sel.w));
  const [relief, setRelief] = useState(1.6);
  const [flip, setFlip] = useState(0);
  const [near, setNear] = useState(false);
  const [backdrop, setBackdrop] = useState(BACKDROPS[0].c);
  const top = useRef<HTMLDivElement>(null);
  const all = useMemo(() => DESIGNS.map((d) => ({ d, ways: d.ways.map((w) => ({ w, ...d.make(w.id) })) })), []);

  const choose = (d: string, w: string, scroll = false) => {
    const x = DESIGNS.find((y) => y.id === d)!;
    setSel({ d, w }); setFamily(x.family); setCard(x.make(w));
    if (scroll) top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const put = <K extends keyof Stock>(k: K, v: Stock[K]) => setCard((c) => ({ ...c, stock: { ...c.stock, [k]: v } }));
  const edit = (id: string, face: string, p: Partial<El>) => setCard((c) => ({ ...c, els: c.els.map((e) => (e.id === id && e.face === face ? { ...e, ...p } : e)) }));
  const { stock, els } = card;
  const pal = PALETTE[family];
  const papers = [...new Set([...pal, "#ffffff", "#f5f2ea"])];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#05060b] text-white">
      <div ref={top} className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-[14px] text-white/50">Venty lab · UI</p>
        <h1 className="h1 mt-2 !text-[34px]">Natalia&apos;s card</h1>
        <p className="mt-2 max-w-[680px] text-[15px] leading-snug text-white/55">Two families, for Venty and her own. Pick a design and a colourway, turn the card in your hand, then change any paper, finish, press or colour. Every design is on the wall below.</p>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          {/* the card */}
          <div className="lg:sticky lg:top-6">
            <div className="relative overflow-hidden rounded-[30px] transition-colors duration-500" style={{ background: backdrop }}>
              <BusinessCard els={els} stock={stock} relief={relief} flip={flip} near={near} className="h-[300px] w-full cursor-grab active:cursor-grabbing sm:h-[440px] lg:h-[560px]" />
              <div className="pointer-events-none absolute left-5 top-4 text-[13px]" style={{ color: ["#f0f4fe", NC.cream].includes(backdrop) ? "rgb(19 21 35 / .55)" : "rgb(255 255 255 / .55)" }}>{design.name} · {design.ways.find((w) => w.id === sel.w)?.name}</div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button type="button" onClick={() => setFlip((f) => f + 1)} className="pill-dark h-10 rounded-full px-4 text-[14px] font-medium">Turn it over</button>
              <button type="button" onClick={() => setNear((n) => !n)} aria-pressed={near} className={cx("h-10 rounded-full px-4 text-[14px] font-medium", near ? "bg-white text-bg" : "pill-dark")}>Close up</button>
              <span className="ml-1 flex items-center gap-2">{BACKDROPS.map((b) => <Dot key={b.c} size={22} on={backdrop === b.c} title={`${b.name} backdrop`} style={{ background: b.c }} onClick={() => setBackdrop(b.c)} />)}</span>
              <span className="text-[13px] text-white/40">Drag to turn. Double click to flip.</span>
            </div>
          </div>

          {/* the inspector */}
          <div className="min-w-0 rounded-[28px] bg-[#0d0e16] p-5 ring-1 ring-white/[.06]">
            <div className="flex rounded-full bg-white/[.05] p-1">
              {(["venty", "natalia"] as const).map((f) => (
                <button key={f} type="button" onClick={() => { const d = DESIGNS.find((x) => x.family === f)!; choose(d.id, d.ways[0].id); }} aria-pressed={family === f} className={cx("h-9 flex-1 rounded-full text-[14px] font-medium transition-colors", family === f ? "bg-white text-bg" : "text-white/65 hover:text-white")}>{f === "venty" ? "For Venty" : "Her own"}</button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {all.filter((x) => x.d.family === family).map(({ d, ways }) => (
                <button key={d.id} type="button" onClick={() => choose(d.id, d.ways[0].id)} aria-pressed={sel.d === d.id} className={cx("rounded-[16px] p-2 text-left transition-colors", sel.d === d.id ? "bg-white/[.1] ring-1 ring-white/30" : "bg-white/[.03] hover:bg-white/[.06]")}>
                  <FlatFace els={ways[0].els} stock={ways[0].stock} face="front" px={2.4} className="w-full rounded-[3px]" />
                  <span className="mt-1.5 block px-0.5 text-[13px] text-white/80">{d.name}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13.5px] leading-snug text-white/50">{design.note}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {design.ways.map((w) => (
                <button key={w.id} type="button" onClick={() => choose(design.id, w.id)} aria-pressed={sel.w === w.id} className={cx("flex h-10 items-center gap-2 rounded-full pl-1.5 pr-3.5 text-[13px] font-medium transition-colors", sel.w === w.id ? "bg-white text-bg" : "border border-white/12 text-white/70 hover:text-white")}>
                  <span className="flex">{w.sw.map((c, i) => <span key={i} className="-ml-1.5 h-6 w-6 rounded-full ring-2 first:ml-0" style={{ background: c, ["--tw-ring-color" as string]: sel.w === w.id ? "#fff" : "#0d0e16" }} />)}</span>
                  {w.name}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <Section title="Paper">
                <Field label="Front">{papers.map((c) => <Dot key={c} on={stock.paper === c} title={c} style={{ background: c }} onClick={() => put("paper", c)} />)}</Field>
                <Field label="Back">{papers.map((c) => <Dot key={c} on={stock.back === c} title={c} style={{ background: c }} onClick={() => put("back", c)} />)}</Field>
                <Field label="Surface">{([["uncoated", "Uncoated"], ["silk", "Silk"], ["soft", "Soft touch"]] as const).map(([k, n]) => <Chip key={k} on={stock.coating === k} onClick={() => put("coating", k)}>{n}</Chip>)}</Field>
                <Field label="Texture">{([["smooth", "Smooth"], ["cotton", "Cotton"], ["felt", "Felt"]] as const).map(([k, n]) => <Chip key={k} on={stock.texture === k} onClick={() => put("texture", k)}>{n}</Chip>)}</Field>
                <Field label="Thickness">{[0.4, 0.6, 0.8, 1.2].map((t) => (
                  <Chip key={t} on={stock.thickness === t} onClick={() => put("thickness", t)} title={`${t} mm`}>
                    <span className="flex items-center gap-2"><span className="inline-block w-5 rounded-[1px] bg-current" style={{ height: Math.max(1.5, t * 5) }} />{t} mm</span>
                  </Chip>
                ))}</Field>
                <Field label="Edges">
                  {([["paper", "Paper", stock.paper], ["ink", "Ink", stock.ink], ["accent", "Painted", stock.accent], ["foil-gold", "Gold", ""], ["foil-silver", "Silver", ""]] as const).map(([k, n, c]) => (
                    <Dot key={k} on={stock.edge === k} title={`${n} edges`} style={c ? { background: c } : { background: FOIL_CSS[k] }} onClick={() => put("edge", k)} />
                  ))}
                  {stock.edge === "accent" && <span className="ml-2 flex gap-1.5 border-l border-white/10 pl-3">{pal.map((c) => <Dot key={c} size={20} on={stock.accent === c} title={c} style={{ background: c }} onClick={() => put("accent", c)} />)}</span>}
                </Field>
                <Field label="Corners and size">
                  {[0, 2, 4].map((c) => <Chip key={c} on={stock.corner === c} onClick={() => put("corner", c)}>{c ? `${c} mm round` : "Square"}</Chip>)}
                  {(Object.keys(SIZES) as Stock["size"][]).map((k) => <Chip key={k} on={stock.size === k} onClick={() => put("size", k)}>{SIZES[k].name}</Chip>)}
                </Field>
              </Section>

              {(["front", "back"] as const).map((face) => (
                <Section key={face} title={face === "front" ? "Front" : "Back"}>
                  {els.filter((e) => e.face === face).map((e) => (
                    <div key={e.id} className="rounded-[18px] bg-white/[.03] p-3.5">
                      <p className="text-[14px] text-white/85">{e.name}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {SURFACES.map((s) => <Dot key={s.k} size={24} on={e.surface === s.k} title={s.name} style={surfaceCss(s.k, e.color ?? stock.ink, face === "front" ? stock.paper : stock.back)} onClick={() => edit(e.id, face, { surface: s.k })} />)}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {PRESSES.map((p) => (
                          <button key={p.k} type="button" title={p.name} aria-label={p.name} aria-pressed={e.press === p.k} onClick={() => edit(e.id, face, { press: p.k })} className={cx("grid h-8 w-11 place-items-center rounded-[10px] transition-colors", e.press === p.k ? "bg-white text-bg" : "bg-white/[.05] text-white/60 hover:text-white")}>
                            <svg width="28" height="14" viewBox="0 0 28 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden><path d={PRESS_D[p.k]} /></svg>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[12.5px] text-white/40">{SURFACES.find((s) => s.k === e.surface)?.name}, {PRESSES.find((p) => p.k === e.press)?.name.toLowerCase()}</p>
                      {e.surface === "ink" && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-white/[.06] pt-2.5">
                          {[...new Set([stock.ink, ...pal])].map((c) => <Dot key={c} size={20} on={(e.color ?? stock.ink) === c} title={c} style={{ background: c }} onClick={() => edit(e.id, face, { color: c })} />)}
                        </div>
                      )}
                    </div>
                  ))}
                </Section>
              ))}

              <Section title="Light" open={false}>
                <Field label="Relief"><input type="range" min={0.4} max={4} step={0.1} value={relief} onChange={(e) => setRelief(+e.target.value)} className="w-full accent-[#687ef5]" /></Field>
                <Field label="Shows through the other side"><input type="range" min={0} max={1} step={0.05} value={stock.through} onChange={(e) => put("through", +e.target.value)} className="w-full accent-[#687ef5]" /></Field>
              </Section>
              <button type="button" onClick={() => choose(sel.d, sel.w)} className="pill-dark mt-2 h-10 w-full rounded-full text-[14px] font-medium">Back to this colourway</button>
            </div>
          </div>
        </div>

        {/* the colourways of this design side by side, front over back and big enough to judge; the one on the card shows
            your edits, and a click puts another on the card */}
        <section className="mt-14">
          <h2 className="h1 !text-[28px]">{design.name}, every colourway</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {all.find((x) => x.d.id === design.id)!.ways.map((w) => {
              const on = sel.w === w.w.id, c = on ? card : w;
              return (
                <button key={w.w.id} type="button" onClick={() => choose(design.id, w.w.id)} aria-pressed={on} className={cx("rounded-[24px] p-3 text-left transition-colors", on ? "bg-white/[.09] ring-1 ring-white/30" : "bg-white/[.03] hover:bg-white/[.06]")}>
                  <FlatFace els={c.els} stock={c.stock} face="front" px={6} className="w-full rounded-[4px] shadow-[0_18px_40px_-18px_rgb(0_0_0/.9)]" />
                  <FlatFace els={c.els} stock={c.stock} face="back" px={6} className="mt-3 w-full rounded-[4px] shadow-[0_18px_40px_-18px_rgb(0_0_0/.9)]" />
                  <span className="mt-3 flex items-center gap-2.5 px-1">
                    <span className="flex">{w.w.sw.map((x, i) => <span key={i} className="-ml-1.5 h-5 w-5 rounded-full ring-2 ring-[#0d0e16] first:ml-0" style={{ background: x }} />)}</span>
                    <span className={cx("text-[14px]", on ? "text-white" : "text-white/65")}>{w.w.name}{on ? ", on the card" : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* the wall */}
        {(["venty", "natalia"] as const).map((f) => (
          <section key={f} className="mt-20">
            <h2 className="h1 !text-[28px]">{f === "venty" ? "For Venty" : "Her own"}</h2>
            {all.filter((x) => x.d.family === f).map(({ d, ways }) => (
              <div key={d.id} className="mt-10">
                <h3 className="text-[18px]">{d.name}</h3>
                <p className="mt-1 max-w-[760px] text-[14px] leading-snug text-white/50">{d.note}</p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {ways.map((w) => <Pair key={w.w.id} els={w.els} stock={w.stock} label={w.w.name} on={sel.d === d.id && sel.w === w.w.id} onClick={() => choose(d.id, w.w.id, true)} />)}
                </div>
              </div>
            ))}
          </section>
        ))}
        <p className="mt-20 text-[12.5px] leading-snug text-white/35">Her wordmark, icon, tea asset and hero star are her own SVGs; colours and grid measurements are from nataliachamon.com. Satoshi (Indian Type Foundry), Playfair Display and IBM Plex Mono are her site&apos;s fonts, loaded here for the lab only.</p>
      </div>
    </div>
  );
}
