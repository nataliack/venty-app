"use client";
// The second half of the brand system: colour, gradients, type, the interface's raised and pressed build, the app's
// patterns, imagery, icons, and the close. Components are the app's own classes, shown larger with zoom.
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { ASSET, BLUES, GRAPH, Label, Logo, MANNEQUIN, NIGHT_DOTS, Num, PAPER_DOTS, PRIMARY_DOTS, SURFACES, Slide, Title, contrast, hexRgb, rgbCmyk, rgbHsl, type Colour } from "./kit";

const values = (hex: string) => {
  const rgb = hexRgb(hex), [h, s, l] = rgbHsl(rgb), cmyk = rgbCmyk(rgb);
  return { HEX: hex.toUpperCase(), RGB: rgb.join("  "), HSL: `${h}°  ${s}%  ${l}%`, CMYK: cmyk.join("  ") };
};
const ink = (hex: string) => contrast(hex, "#ffffff") < contrast(hex, "#131523");

// ─── colour ───
export function ColourHero() {
  const v = values("#687EF5");
  return (
    <Slide id="colour" name="Colour" bg="#687ef5">
      <Label className="absolute left-[96px] top-[96px] text-white">Colour</Label>
      <Title className="absolute left-[90px] top-[150px] text-[250px]">Cornflower</Title>
      <p className="absolute left-[96px] top-[430px] w-[640px] text-[34px] leading-snug tracking-[-.02em] text-white/90">The primary. The filled button, the measuring tape round the body, every chosen check.</p>
      <dl className="absolute bottom-[150px] right-[96px] grid w-[900px] grid-cols-2 gap-x-14 gap-y-10">
        {Object.entries(v).map(([k, x]) => (
          <div key={k} className="border-t border-white/35 pt-4"><Label className="text-white">{k}</Label><p className="mt-2 whitespace-pre text-[48px] leading-none tracking-[-.02em] tabular-nums">{x}</p></div>
        ))}
      </dl>
      <p className="absolute bottom-[150px] left-[96px] text-[24px] text-white/75">White on Cornflower <Num className="text-[30px]">{contrast("#687EF5", "#ffffff").toFixed(1)}</Num> : 1</p>
    </Slide>
  );
}

function Swatch({ c }: { c: Colour }) {
  const v = values(c.hex), dark = !ink(c.hex);
  return (
    <div className={cx("relative flex flex-col justify-end rounded-[28px] p-6", dark ? "text-white" : "text-ink")} style={{ background: c.hex, boxShadow: c.hex === "#0B0C15" ? "inset 0 0 0 1px rgb(255 255 255 / .14)" : undefined }}>
      <p className="text-[34px] leading-none tracking-[-.03em]">{c.name}</p>
      <div className={cx("mt-4 space-y-1 text-[19px] tabular-nums", dark ? "text-white/70" : "text-ink/65")}>
        <p>{v.HEX}</p><p>RGB {v.RGB}</p><p>CMYK {v.CMYK}</p>
      </div>
    </div>
  );
}
export function Palette() {
  return (
    <Slide id="palette" name="Colour">
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Palette</Title>
      <p className="absolute right-[96px] top-[100px] w-[700px] text-[26px] leading-snug text-white/65">Blues from the evening sky, and the surfaces they sit on. Values in HEX for screens, RGB and CMYK for everything else (CMYK converted, not proofed).</p>
      <div className="absolute inset-x-[96px] top-[250px] grid grid-cols-6 gap-5" style={{ height: 340 }}>{BLUES.map((c) => <Swatch key={c.name} c={c} />)}</div>
      <div className="absolute inset-x-[96px] top-[612px] grid grid-cols-6 gap-5" style={{ height: 340 }}>{SURFACES.map((c) => <Swatch key={c.name} c={c} />)}</div>
    </Slide>
  );
}

// colour has a job (CLAUDE.md): dark for working, paper and violet for moments, a light top on home
export function ColourJobs() {
  const panel = "relative h-[640px] overflow-hidden rounded-[32px]";
  return (
    <Slide id="colour-jobs" name="Colour" tone="light" bg="#f0f4fe">
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Colour has a job</Title>
      <div className="absolute inset-x-[96px] top-[250px] grid grid-cols-3 gap-8">
        <figure>
          <div className={cx(panel, "bg-bg")} style={NIGHT_DOTS}>
            <p className="absolute left-10 top-12 text-[44px] leading-tight tracking-[-.035em] text-white">Who is this<br />pattern for?</p>
            <div className="absolute inset-x-10 top-[220px] flex h-[110px] items-center gap-5 rounded-[28px] border border-white/10 bg-card p-3 pr-6">
              <img src={`${ASSET}/female-1.webp`} alt="" className="h-full w-[70px] rounded-[18px] object-cover" />
              <span className="flex-1"><span className="block text-[24px] text-white">Ana</span><span className="block text-[19px] text-white/55">24 of 24 measurements</span></span>
            </div>
            <div className="absolute inset-x-10 bottom-10" style={{ zoom: 1.4 }}><button className="pill pill-primary w-full">Next</button></div>
          </div>
          <figcaption className="mt-5 text-[26px] leading-snug"><b className="font-medium">Night is for working.</b> <span className="text-ink/60">Measuring, drafting, every flow.</span></figcaption>
        </figure>
        <figure>
          <div className={cx(panel, "bg-[#f3f1ec]")}>
            <img src={`${ASSET}/crown.webp`} alt="" className="absolute inset-x-0 top-0 h-[52%] w-full rounded-b-[32px] object-cover" />
            <p className="absolute inset-x-10 top-[370px] text-[44px] leading-tight tracking-[-.035em] text-ink">Well done! Your body is ready</p>
          </div>
          <figcaption className="mt-5 text-[26px] leading-snug"><b className="font-medium">Paper and Crown are for moments.</b> <span className="text-ink/60">Starting, a body ready, a pattern complete.</span></figcaption>
        </figure>
        <figure>
          <div className={cx(panel, "bg-[#f6f7fd]")} style={GRAPH}>
            <p className="absolute left-10 top-12 text-[50px] leading-[1.02] tracking-[-.035em] text-[#2c3a8c]">What are we<br />making today?</p>
            <div className="absolute inset-x-10 bottom-10 grid grid-cols-2 gap-4">
              {["Create a pattern", "Start from a pattern"].map((t) => (
                <div key={t} className="relative h-[190px] rounded-[26px] bg-card p-5 text-white"><span className="block w-[120px] text-[22px] leading-tight">{t}</span><span className="icon-primary absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full"><Icon name={t.startsWith("Create") ? "pencil" : "dress"} size={20} /></span></div>
              ))}
            </div>
          </div>
          <figcaption className="mt-5 text-[26px] leading-snug"><b className="font-medium">Snow on graph paper starts the day.</b> <span className="text-ink/60">The light top of home.</span></figcaption>
        </figure>
      </div>
    </Slide>
  );
}

// the three locked gradients (the landing page's Sky), Jose's renders, with their colours
const GRADS = [
  { n: "Crown", k: "Light", img: "crown", note: "Light from the top centre, a blue halo rising from below.", stops: ["#B4BDD9", "#7988B8", "#5A6C99", "#353F62", "#131523", "#687EF5"] },
  { n: "Haze", k: "Purple", img: "haze", note: "Periwinkle washes in from the top left over cornflower.", stops: ["#C0C8DB", "#8C9CF8", "#7A8EF7", "#687EF5", "#6073E6"] },
  { n: "Edge", k: "Dark", img: "edge", note: "A soft cornflower glow roaming the lower two thirds of night.", stops: ["#0B0C15", "#687EF5", "#4F63E0", "#8C9CF8"] },
];
export function Gradients() {
  return (
    <Slide id="gradients" name="Gradients">
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Gradients</Title>
      <p className="absolute right-[96px] top-[100px] w-[640px] text-[26px] leading-snug text-white/65">Three, and locked. Soft light moving across the palette; never a hard edge.</p>
      <div className="absolute inset-x-[96px] top-[250px] grid grid-cols-3 gap-6">
        {GRADS.map((g) => (
          <figure key={g.n} className="relative h-[720px] overflow-hidden rounded-[32px]">
            <img src={`${ASSET}/${g.img}.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-8 top-8 flex items-baseline justify-between"><p className="text-[72px] leading-none tracking-[-.04em]">{g.n}</p><p className="text-[22px] text-white/75">{g.k}</p></div>
            <div className="absolute inset-x-8 bottom-8">
              <p className="text-[22px] leading-snug text-white/85">{g.note}</p>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {g.stops.map((s) => <span key={s} className="flex items-center gap-2 text-[17px] tabular-nums text-white/85"><span className="h-5 w-5 rounded-full shadow-[0_0_0_1.5px_rgb(255_255_255/.5)]" style={{ background: s }} />{s}</span>)}
              </div>
            </div>
          </figure>
        ))}
      </div>
    </Slide>
  );
}

// ─── type ───
export function TypeHero() {
  const weights: [string, number][] = [["Regular", 400], ["Medium", 500], ["Semibold", 600], ["Bold", 700]];
  return (
    <Slide id="type" name="Typography" bg="#131523">
      <p className="absolute left-[60px] top-[-20px] text-[760px] leading-none tracking-[-.06em] text-white">Aa</p>
      <div className="absolute right-[96px] top-[96px] w-[700px]">
        <Label>Typeface</Label>
        <Title className="mt-3 text-[104px]">Familjen Grotesk</Title>
        <p className="mt-8 text-[28px] leading-snug text-white/70">One family for everything people read. Headings are Regular 400 with tight letter spacing, never bold, never spaced-out capitals.</p>
        <div className="mt-10">
          {weights.map(([n, w]) => (
            <div key={n} className="flex items-baseline justify-between border-t border-white/12 py-4">
              <span className="text-[46px] leading-none tracking-[-.03em]" style={{ fontWeight: w }}>Made to measure</span>
              <span className="text-[22px] text-white/55">{n} <Num className="ml-1 text-[24px]">{w}</Num></span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

export function TypeGlyphs() {
  const rows = ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "0123456789", "&?!@#%(),.:;’”"];
  return (
    <Slide id="glyphs" name="Typography" tone="light" bg="#f0f4fe">
      <Label className="absolute left-[96px] top-[96px]">Familjen Grotesk, Regular 400</Label>
      <div className="absolute inset-x-[96px] top-[160px] grid grid-cols-2 gap-x-16">
        {rows.map((r) => <p key={r} className="text-[100px] leading-[1.6] tracking-[-.02em]">{r}</p>)}
      </div>
    </Slide>
  );
}

export function Numbers() {
  return (
    <Slide id="numbers" name="Typography" image={`${ASSET}/haze.webp`}>
      <p className="absolute left-[70px] top-[60px] leading-none"><Num className="text-[620px] tracking-[-.02em]">168</Num><span className="ml-4 text-[90px] tracking-[-.03em]">cm</span></p>
      <div className="absolute bottom-[140px] left-[96px] w-[760px]">
        <Label className="text-white">Numbers</Label>
        <Title className="mt-3 text-[104px]">Bigilla Bold</Title>
        <p className="mt-6 text-[28px] leading-snug text-white/85">For numbers only: measurements, metres of fabric, counts. The units stay in Familjen Grotesk, and so do the signs Bigilla doesn’t have (% ° + – · ×).</p>
      </div>
      <p className="absolute bottom-[150px] right-[96px] text-[120px] leading-none"><Num>0123456789</Num></p>
    </Slide>
  );
}

// the app's sizes, shown at twice their size
export function TypeScale() {
  const rows: { k: string; spec: string; el: ReactNode }[] = [
    { k: "Heading, computer", spec: "52 px  ·  -0.035 em", el: <p className="text-[100px] leading-[1.05] tracking-[-.035em]">What are we making today?</p> },
    { k: "Heading, phone", spec: "34 px  ·  -0.035 em", el: <p className="text-[68px] leading-none tracking-[-.035em]">Who is this pattern for?</p> },
    { k: "Sheet title", spec: "24 px  ·  -0.03 em", el: <p className="text-[48px] leading-none tracking-[-.03em]">Add 20 more measurements?</p> },
    { k: "Lead", spec: "16 px", el: <p className="text-[32px] leading-tight text-white/65">Pick a body. The pattern is drafted to its measurements.</p> },
    { k: "Small", spec: "13 px", el: <p className="text-[26px] text-white/55">24 of 24 measurements</p> },
    { k: "Numbers", spec: "Bigilla Bold, 20 px", el: <p className="text-[40px] leading-none"><Num>88</Num><span className="mx-6 text-white/30">·</span><Num>69</Num><span className="mx-6 text-white/30">·</span><Num>95</Num></p> },
  ];
  return (
    <Slide id="type-scale" name="Typography" pattern={NIGHT_DOTS}>
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Type scale</Title>
      <p className="absolute right-[96px] top-[110px] text-[24px] text-white/55">Shown at twice their size</p>
      <div className="absolute inset-x-[96px] top-[240px]">
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-[300px_1fr] items-center border-t border-white/10 py-[18px]">
            <div><p className="text-[24px]">{r.k}</p><p className="mt-1 text-[19px] tabular-nums text-white/50">{r.spec}</p></div>
            <div className="min-w-0 overflow-hidden whitespace-nowrap py-1">{r.el}</div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ─── interface: raised and pressed, as the app builds them ───
// shown larger: the outer box places it (unzoomed), the inner one is the app's own size, zoomed
const Z = ({ z, children, className, inner }: { z: number; children: ReactNode; className?: string; inner?: string }) => <div className={className}><div className={inner} style={{ zoom: z }}>{children}</div></div>;
export function Interface() {
  return (
    <Slide id="interface" name="Interface" pattern={NIGHT_DOTS}>
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Raised and pressed</Title>
      <p className="absolute right-[96px] top-[100px] w-[640px] text-[26px] leading-snug text-white/65">Everything you can press is raised; everything you slide along is pressed in. Lit from above, like objects on a table.</p>
      <div className="absolute left-[96px] top-[270px] w-[820px]">
        <Label>Raised</Label>
        <div className="mt-8 flex items-center gap-10">
          <Z z={2.4}><span className="rb"><Icon name="back" size={20} /></span></Z>
          <Z z={2.4}><span className="rb"><Icon name="pencil" size={18} /></span></Z>
          <Z z={2.4}><span className="icon-primary grid h-11 w-11 place-items-center rounded-full"><Icon name="plus" size={20} strokeWidth={2.4} /></span></Z>
        </div>
        <Z z={2} className="mt-12" inner="w-[380px]"><button className="pill pill-primary w-full">Make a pattern for this body</button></Z>
        <p className="mt-10 w-[700px] text-[24px] leading-snug text-white/60">A bright line along the top edge, a darker one along the bottom, a soft light inside the rim and a shadow underneath.</p>
      </div>
      <div className="absolute right-[96px] top-[270px] w-[720px]">
        <Label>Pressed</Label>
        <Z z={2.2} className="mt-8" inner="w-[300px]">
          <div className="ruler-track relative flex h-[52px] items-center rounded-full p-[5px] text-[15px]">
            <span className="knob absolute bottom-[5px] left-[5px] top-[5px] w-[calc(50%-5px)] rounded-full" />
            <span className="relative z-10 flex-1 text-center">Fabric</span><span className="relative z-10 flex-1 text-center text-white/55">Pattern</span>
          </div>
        </Z>
        <div className="mt-12 flex items-center gap-8">
          <Z z={2.2}><span className="iconbadge grid h-12 w-12 place-items-center rounded-full"><Icon name="tape" size={22} /></span></Z>
          <Z z={2.2}><span className="iconbadge grid h-12 w-12 place-items-center rounded-full"><Icon name="ruler" size={22} /></span></Z>
          <Z z={2.2}><span className="iconbadge grid h-12 w-12 place-items-center rounded-full"><Icon name="scissors" size={22} /></span></Z>
        </div>
        <p className="mt-10 text-[24px] leading-snug text-white/60">A shadow inside along the top and a faint lip of light along the bottom. The knob that slides in it is raised.</p>
      </div>
    </Slide>
  );
}

// the cards, as the app draws them
export function Components() {
  return (
    <Slide id="components" name="Interface" bg="#131523" pattern={{ ...GRAPH, opacity: 0.5 }}>
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Cards</Title>
      <p className="absolute right-[96px] top-[100px] w-[640px] text-[26px] leading-snug text-white/65">Information sits flat; only the buttons on it rise. One fill for every dark card: Card, #1B1C26.</p>
      {/* a body card, the Body library's build (rim, pressed stage, the picture) */}
      <Z z={1.75} className="absolute left-[96px] top-[250px]">
        <div className="relative w-[200px] rounded-[24px] p-[5px]" style={{ background: "linear-gradient(180deg, rgb(255 255 255 / .035), rgb(255 255 255 / 0) 50%) var(--color-card)", boxShadow: "0 18px 36px -16px rgb(0 0 0 / .8), 0 2px 4px rgb(0 0 0 / .35), inset 0 0 0 1px rgb(255 255 255 / .07), inset 0 1px 0 rgb(255 255 255 / .1), inset 0 -1px 0 rgb(0 0 0 / .35)" }}>
          <span className="relative block aspect-[4/5] overflow-hidden rounded-[19px]">
            <img src={`${ASSET}/female-1.webp`} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 rounded-[inherit]" style={{ boxShadow: "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .07)" }} />
            <span className="absolute inset-x-0 bottom-2 text-center text-[11px] text-white/80"><Num className="text-[15px]">166</Num> cm</span>
          </span>
          <span className="block px-2 pb-1.5 pt-2.5 text-center"><span className="block text-[16px]">Ana</span>
            <span className="mt-2 flex justify-evenly">{[["Bust", 88], ["Waist", 69], ["Hips", 95]].map(([k, v]) => <span key={k}><span className="block text-[10px] text-white/45">{k}</span><Num className="mt-1 block text-[16px] leading-none">{v}</Num></span>)}</span>
          </span>
        </div>
      </Z>
      {/* measurement tiles: a flat card, its button raised */}
      <Z z={1.75} className="absolute left-[620px] top-[300px]" inner="w-[330px] space-y-2">
        {[["Bust", "88", true], ["Waist", "69", true], ["Nape to waist", null, false]].map(([k, v, has]) => (
          <div key={String(k)} className="card-soft flex h-[60px] items-center justify-between rounded-[18px] pl-3.5 pr-2.5">
            <span><span className="block text-[12px] leading-none text-white/60">{k}</span>{v ? <span className="mt-1.5 block leading-none"><Num className="text-[20px]">{v}</Num> cm</span> : <span className="mt-1.5 block text-[13px] leading-none text-white/35">Not measured</span>}</span>
            {has ? <span className="rb !h-9 !w-9"><Icon name="pencil" size={16} /></span> : <span className="pill-primary grid h-9 w-9 place-items-center rounded-full"><Icon name="plus" size={17} strokeWidth={2.4} /></span>}
          </div>
        ))}
      </Z>
      {/* the home start card and a chosen option, in snow */}
      <Z z={1.75} className="absolute right-[96px] top-[300px]" inner="w-[300px] space-y-4">
        <div className="relative h-[150px] rounded-[26px] border border-white/10 bg-card p-5"><span className="block w-[130px] text-[19px] leading-tight">Create a pattern</span><span className="mt-3 block w-[150px] text-[14px] leading-snug text-white/55">From a photo, sketch or words</span><span className="icon-primary absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full"><Icon name="pencil" size={18} /></span></div>
        <div className="opt on flex h-[72px] items-center gap-3 rounded-[22px] p-2 pr-12"><img src={`${ASSET}/male-1.webp`} alt="" className="h-full w-[46px] rounded-[14px] object-cover" /><span><span className="block text-[15px] font-medium">Tom</span><span className="block text-[13px] text-white/60">12 of 24 measurements</span></span><span className="radio icon-primary absolute right-4 top-1/2 -translate-y-1/2"><Icon name="check" size={13} strokeWidth={3} /></span></div>
      </Z>
    </Slide>
  );
}

// ─── pattern and texture: the app's own, at their real spacing ───
export function Patterns() {
  const tiles: { k: string; spec: string; style: CSSProperties; z?: number; light?: boolean }[] = [
    { k: "Night dots", spec: "1 px dots, 16 px apart, white at 7%. Behind every working screen.", style: { background: "#0b0c15", ...NIGHT_DOTS, boxShadow: "inset 0 0 0 2px rgb(255 255 255 / .14)" } },
    { k: "Graph paper", spec: "Cornflower lines every 24 px, stronger every 96 px. The light top of home, the printed pattern.", style: { background: "#f6f7fd", ...GRAPH }, light: true },
    { k: "Paper dots", spec: "1 px dots, 18 px apart, night at 20%. The moments’ paper.", style: { background: "#f3f1ec", ...PAPER_DOTS }, light: true },
    { k: "Button grain", spec: "A fine white dot every 5 px over Cornflower. Only on the primary button. Shown at 3×.", style: PRIMARY_DOTS, z: 3 },
  ];
  return (
    <Slide id="patterns" name="Pattern and texture">
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Pattern and texture</Title>
      <div className="absolute inset-x-[96px] top-[250px] grid grid-cols-4 gap-6">
        {tiles.map((t) => (
          <figure key={t.k}>
            <div className="relative h-[520px] overflow-hidden rounded-[28px]" style={t.z ? { background: "#687ef5" } : t.style}>
              {t.z && <div className="absolute left-0 top-0" style={{ width: `${100 / t.z}%`, height: `${100 / t.z}%`, zoom: t.z, ...t.style }} />}
            </div>
            <figcaption className="mt-5"><p className="text-[30px] tracking-[-.02em]">{t.k}</p><p className="mt-2 text-[21px] leading-snug text-white/60">{t.spec}</p></figcaption>
          </figure>
        ))}
      </div>
    </Slide>
  );
}

// ─── imagery: Jose's mannequins ───
export function Imagery() {
  const pics = ["female-1", "female-2", "female-3", "male-1", "male-2", "male-3"];
  return (
    <Slide id="imagery" name="Imagery" bg="#0b0c15" folio={false}>
      <img src={`${ASSET}/female-1.webp`} alt="" className="absolute left-0 top-0 h-full w-[864px] object-cover" />
      <div className="absolute left-[960px] top-[96px] w-[640px]">
        <Title className="text-[96px]">Imagery</Title>
        <p className="mt-6 text-[26px] leading-snug text-white/70">Faceless, glossy mannequins in a pale blue-grey, lit softly and lost to blur below the chest. Three poses, the same for a woman’s form and a man’s.</p>
        <div className="mt-10 grid grid-cols-3 gap-4">
          {pics.map((p) => <img key={p} src={`${ASSET}/${p}.webp`} alt="" className="aspect-[4/5] w-full rounded-[20px] object-cover" />)}
        </div>
      </div>
      <div className="absolute bottom-[52px] left-[960px] right-[96px] flex items-center justify-between text-[22px] text-white/45">
        <span className="flex items-center gap-3"><span className="h-7 w-7 rounded-full" style={{ background: MANNEQUIN }} />The mannequin, {MANNEQUIN.toUpperCase()}</span>
        <span>Imagery</span>
      </div>
    </Slide>
  );
}

const ICON_SET: IconName[] = ["tape", "ruler", "scissors", "dress", "shirt", "body", "camera", "image", "pencil", "printer", "layers", "sliders", "search", "heart", "bell", "home", "user", "share", "download", "upload", "check", "plus", "minus", "close", "map", "book", "video", "help", "eye", "lock", "sparkle", "grid"];
export function Icons() {
  return (
    <Slide id="icons" name="Interface" tone="light" bg="#f0f4fe">
      <Title className="absolute left-[96px] top-[84px] text-[96px]">Icons</Title>
      <p className="absolute right-[96px] top-[100px] w-[640px] text-[26px] leading-snug text-ink/60">Drawn on a 24 px grid with a 1.8 px line, round ends and round joins. Plain, so the garments and the bodies lead.</p>
      <div className="absolute inset-x-[96px] top-[260px] grid grid-cols-8 gap-5">
        {ICON_SET.map((n) => <div key={n} className="grid aspect-[1.55] place-items-center rounded-[24px] bg-white text-ink shadow-[0_1px_0_rgb(19_21_35/.05),0_14px_30px_-24px_rgb(19_21_35/.5)]"><Icon name={n} size={60} /></div>)}
      </div>
    </Slide>
  );
}

export function Closing() {
  return (
    <Slide id="closing" name="Closing" image={`${ASSET}/haze.webp`} folio={false}>
      <Logo className="absolute left-1/2 top-[200px] w-[700px] -translate-x-1/2" />
      <div className="absolute inset-x-[96px] bottom-[88px] flex items-end justify-between text-[26px] text-white/85">
        <p>Venty is a concept for the QUT Design Festival 2026.</p>
        <p>Wednesday 11 November, 6pm · Brisbane</p>
      </div>
    </Slide>
  );
}
