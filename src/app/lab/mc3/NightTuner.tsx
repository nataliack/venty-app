"use client";
// Lab (MC 3): tune the Night icon yourself. Every control changes Night's settings (NIGHT in icons.ts) and the preview is
// drawn by the very function the PNGs are baked from (nightSvg), so what you see is what the icon becomes. Copy settings
// gives the numbers to paste back; they are also kept in this browser between visits.
import { useEffect, useState, type ReactNode } from "react";
import { LOGO } from "@/components/art";
import { NIGHT, nightSvg, type Night, type NightLight } from "./icons";

const KEY = "venty-lab-night";
// the app's colours, to pick from in one tap
const SWATCHES = [["Night", "#0b0c15"], ["Ink", "#131523"], ["Card", "#1b1c26"], ["Slate", "#3c4b63"], ["Denim", "#4d5e85"], ["Indigo", "#4f63e0"], ["Primary", "#687ef5"], ["Peri", "#8c9cf8"], ["Lav", "#a0abca"]] as const;

function Slider({ label, hint, value, min, max, step, onChange }: { label: string; hint?: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-[14px]"><span className="text-white/80">{label}{hint && <span className="text-white/40"> · {hint}</span>}</span><span className="tabular-nums text-white/60">{value}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-1.5 w-full accent-primary" />
    </label>
  );
}
function Colour({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[14px]">
        <span className="text-white/80">{label}</span>
        <span className="flex items-center gap-2"><span className="tabular-nums text-white/60">{value}</span><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-white/15 bg-transparent" aria-label={label} /></span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SWATCHES.map(([n, c]) => (
          <button key={c} onClick={() => onChange(c)} title={n} aria-label={`${label}: ${n}`} className={`h-6 w-6 rounded-full border ${value === c ? "border-white" : "border-white/20"}`} style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="rounded-[22px] border border-white/10 p-4"><legend className="px-1.5 text-[15px] text-white/90">{title}</legend><div className="flex flex-col gap-4">{children}</div></fieldset>
);

export function NightTuner() {
  const [n, setN] = useState<Night>(NIGHT);
  const [copied, setCopied] = useState(false);
  // kept in this browser between visits (a convenience; the page works without it). Read after the first render, so the
  // page the server drew and the one the browser draws first are the same
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setN(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} }, [n]);
  const light = (i: number, patch: Partial<NightLight>) => setN((o) => ({ ...o, lights: o.lights.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(nightSvg(n, LOGO[4], true))}`;
  const json = JSON.stringify(n);
  const copy = async () => { try { await navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };
  return (
    <section>
      <h2 className="h1 !text-[34px]">Tune Night</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">Move the sliders until it looks right, then Copy settings and send them to me; I bake exactly these numbers into the icon. Up and down past 1024 puts a light&apos;s centre under the icon, so only its fade shows.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        {/* the preview stays in view while you slide */}
        <div className="sticky top-0 z-10 -mx-4 flex items-end gap-5 bg-[#05060b] px-4 py-3 lg:mx-0 lg:flex-col lg:items-start lg:px-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Night icon preview" width={200} height={200} className="h-[150px] w-[150px] rounded-[22.37%] lg:h-[260px] lg:w-[260px]" />
          <div className="flex flex-col items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" width={60} height={60} className="h-[60px] w-[60px] rounded-[22.37%]" />
            <span className="text-[12px] text-white/50">Home screen</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Group title="Background">
            <Colour label="Top" value={n.top} onChange={(v) => setN((o) => ({ ...o, top: v }))} />
            <Colour label="Bottom" value={n.bottom} onChange={(v) => setN((o) => ({ ...o, bottom: v }))} />
          </Group>
          {n.lights.map((l, i) => (
            <Group key={i} title={`Light ${i + 1}${l.a === 0 ? " (off: raise Strength)" : ""}`}>
              <Colour label="Colour" value={l.color} onChange={(v) => light(i, { color: v })} />
              <Slider label="Strength" value={l.a} min={0} max={1} step={0.01} onChange={(v) => light(i, { a: v })} />
              <Slider label="Up and down" hint="past 1024 is under the icon" value={l.y} min={-400} max={2400} step={10} onChange={(v) => light(i, { y: v })} />
              <Slider label="Across" value={l.x} min={-400} max={1424} step={10} onChange={(v) => light(i, { x: v })} />
              <Slider label="Width" value={l.w} min={100} max={3000} step={10} onChange={(v) => light(i, { w: v })} />
              <Slider label="Height" hint="against its width" value={l.h} min={0.1} max={2} step={0.01} onChange={(v) => light(i, { h: v })} />
              <Slider label="Softness" hint="lower fades further" value={l.soft} min={0.5} max={5} step={0.05} onChange={(v) => light(i, { soft: v })} />
            </Group>
          ))}
          <Group title="Grain">
            <Slider label="Grain" hint="keeps the fade from banding" value={n.grain} min={0} max={4} step={0.25} onChange={(v) => setN((o) => ({ ...o, grain: v }))} />
          </Group>
          <div className="flex flex-wrap gap-2">
            <button onClick={copy} className="h-10 rounded-full bg-white px-4 text-[14px] font-medium text-bg">{copied ? "Copied" : "Copy settings"}</button>
            <button onClick={() => setN(NIGHT)} className="h-10 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/75 hover:text-white">Reset to the icon now</button>
          </div>
          {/* the settings as text too, to select by hand where copying is blocked */}
          <textarea readOnly value={json} rows={4} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-[14px] border border-white/10 bg-white/[.04] p-3 font-mono text-[12px] text-white/60" aria-label="Night settings" />
        </div>
      </div>
    </section>
  );
}
