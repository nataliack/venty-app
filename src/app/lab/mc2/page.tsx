"use client";
// Lab (MC 2): the pattern library redrawn, both tabs (Your patterns, Patterns to make) for a new visitor and for someone
// who has made eight. Four concepts from Jose's references, beside Today. Nothing here is used by the app.
import { useState, type ReactNode } from "react";
import { cx } from "@/components/ui";
import { Today, Lookbook, Runway, Editorial, FittingRoom, BRIEFS, type Props, type LookOpts } from "./concepts";

const CONCEPTS: { k: string; name: string; note: string; C: (p: Props) => ReactNode }[] = [
  { k: "today", name: "Today", note: "The library as it is on main: garments drawn on small Crown swatches, a list and a grid.", C: Today },
  { k: "lookbook", name: "Lookbook", note: "Like a photo app’s albums: your patterns as tall photo cards you swipe (or a grid, with search, filters and an order, for when there are many), and the patterns to make in a row per kind under photo filters. Refined: the switches below change the cards, the filters and where Create a pattern sits.", C: Lookbook },
  { k: "runway", name: "Runway", note: "The garments stand in a row on a dark stage, the middle one large. Patterns to make are cut-out photos; your own patterns stand on your body.", C: Runway },
  { k: "editorial", name: "Editorial", note: "A light page under a full-bleed photo, like a fashion shop: a featured pattern, round kind photos, then a grid of photos.", C: Editorial },
  { k: "fitting", name: "Fitting room", note: "Your body in the middle wearing one pattern at a time, notes in the margin like on a pattern, and a rail of round swatches to change it.", C: FittingRoom },
];

// a phone at the iPhone's real size (393 × 852), a touch smaller on a narrow screen so it fits
function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3 max-[424px]:[zoom:.86]">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[55px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        {children}
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

// the lookbook's own choices, each with what it does
const SWITCHES: { k: keyof LookOpts; name: string; opts: { v: string; name: string; note: string }[] }[] = [
  { k: "card", name: "Cards", opts: [
    { v: "tray", name: "Tray", note: "The pattern tray’s build: a raised snow rim, the photo pressed into it, the words on the rim below." },
    { v: "flat", name: "Flat", note: "Photos edge to edge, the words on the photo or under it." },
  ] },
  { k: "filters", name: "Filters on scroll", opts: [
    { v: "shrink", name: "Shrink", note: "Scroll past the round photos and they come back as a slim bar pinned to the top: small photos in pills." },
    { v: "away", name: "Scroll away", note: "The round photos scroll off with the page." },
  ] },
  { k: "cta", name: "Create a pattern", opts: [
    { v: "row", name: "First card", note: "Once you have patterns, the first card of your own is Create a pattern (in the grid too)." },
    { v: "title", name: "By the title", note: "Once you have patterns, a Create button sits beside the title." },
  ] },
];

export default function LabMC2() {
  const [k, setK] = useState("lookbook");
  const [opts, setOpts] = useState<LookOpts>({ card: "tray", filters: "shrink", cta: "row" });
  const c = CONCEPTS.find((x) => x.k === k)!;
  return (
    // the app pins html and body (position: fixed, overflow hidden), so the lab scrolls in its own layer
    <main className="fixed inset-0 overflow-y-auto bg-bg px-5 pb-24 pt-10 text-white lg:px-14">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="h1 !text-[34px]">Pattern library</h1>
        <p className="mt-2 max-w-[640px] text-[16px] leading-snug text-white/60">Both tabs, for a new visitor and for someone who has made three patterns. The photos are stand-ins from the sign-up page and the tour until yours are made; what each concept needs is listed under the phones.</p>
        <div className="noscroll mt-6 flex gap-2 overflow-x-auto">
          {CONCEPTS.map((x) => (
            <button key={x.k} onClick={() => setK(x.k)} className={cx("h-11 shrink-0 rounded-full px-5 text-[15px] font-medium transition-colors", x.k === k ? "bg-snow text-ink" : "bg-card text-white/75 hover:text-white")}>{x.name}</button>
          ))}
        </div>
        <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/70">{c.note}</p>
        {k === "lookbook" && (
          <div className="mt-6 flex flex-col gap-4">
            {SWITCHES.map((sw) => {
              const cur = sw.opts.find((o) => o.v === opts[sw.k])!;
              return (
                <div key={sw.k}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-[150px] text-[15px] text-white/55">{sw.name}</span>
                    {sw.opts.map((o) => (
                      <button key={o.v} onClick={() => setOpts({ ...opts, [sw.k]: o.v })} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", o.v === opts[sw.k] ? "bg-snow text-ink" : "bg-card text-white/75 hover:text-white")}>{o.name}</button>
                    ))}
                  </div>
                  <p className="mt-1.5 max-w-[640px] text-[14px] leading-snug text-white/55 sm:pl-[158px]">{cur.note}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* keyed on the concept, so every phone starts fresh on its own tab */}
      <div key={k} className="mx-auto mt-10 flex max-w-[1000px] flex-col gap-16">
        {[{ has: false, title: "No patterns yet" }, { has: true, title: "Eight patterns made" }].map((row) => (
          <section key={row.title}>
            <h2 className="text-[22px] tracking-[-.02em]">{row.title}</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-x-14 gap-y-10">
              <Phone label="Your patterns"><c.C has={row.has} tab="Your patterns" opts={opts} /></Phone>
              <Phone label="Patterns to make"><c.C has={row.has} tab="Patterns to make" opts={opts} /></Phone>
            </div>
          </section>
        ))}
        <section>
          <h2 className="text-[22px] tracking-[-.02em]">Pictures it needs</h2>
          <ul className="mt-3 flex max-w-[680px] flex-col gap-2.5">
            {BRIEFS[k].map((b) => <li key={b} className="text-[15px] leading-snug text-white/70">{b}</li>)}
          </ul>
        </section>
      </div>
    </main>
  );
}
