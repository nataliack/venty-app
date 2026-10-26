"use client";
// The first half of the brand system: cover, contents, the idea, and the logo (the lockup, how it is drawn, its
// colours, the app icons, its space and size, what not to do).
import { LOGO } from "@/components/art";
import { cx } from "@/components/ui";
import { ASSET, BASELINE, CAP_TOP, DESC, GRAPH, Label, Logo, LOGO_BOX, MARK_BOX, NIGHT_DOTS, Num, PAPER_DOTS, Slide, Title, WORD_BOX, X_TOP, pathPoints } from "./kit";

export const SECTIONS = ["The idea", "Logo", "Colour", "Gradients", "Typography", "Interface", "Pattern and texture", "Imagery"];

export function Cover() {
  return (
    <Slide id="cover" name="Cover" image={`${ASSET}/crown.webp`} folio={false}>
      <div className="absolute inset-x-[96px] top-[64px] flex justify-between text-[24px] text-white/80">
        <span>Venty</span><span>Brand system</span><span>October 2026</span>
      </div>
      <Logo className="absolute left-[96px] top-[196px] w-[820px]" />
      <div className="absolute bottom-[88px] right-[96px] w-[700px]">
        <Title className="text-[150px]">Brand system</Title>
        <p className="mt-8 text-[34px] leading-[1.2] tracking-[-.02em] text-white/85">Venty turns any idea into a pattern drafted for you.</p>
      </div>
      <p className="absolute bottom-[96px] left-[96px] text-[24px] text-white/70">QUT Design Festival 2026</p>
    </Slide>
  );
}

export function Contents() {
  return (
    <Slide id="contents" name="Contents" pattern={NIGHT_DOTS}>
      <Title className="absolute left-[96px] top-[96px] text-[200px]">Contents</Title>
      <ol className="absolute right-[96px] top-[110px] w-[820px]">
        {SECTIONS.map((s, i) => (
          <li key={s} className="flex items-baseline gap-10 border-t border-white/12 py-[18px] last:border-b">
            <Num className="w-[70px] text-[56px] leading-none text-peri">{i + 1}</Num>
            <span className="text-[48px] leading-none tracking-[-.03em]">{s}</span>
          </li>
        ))}
      </ol>
    </Slide>
  );
}

// the product in one sentence (the landing page's own words) and the three steps (docs/VENTY_CONTEXT.md, section 1)
export function Idea() {
  const steps = [
    ["Save a picture you love", "A photo, a screenshot, a magazine page, a link or your own sketch."],
    ["Drafted to your body", "Venty drafts a sewing pattern from it, sized to your own measurements."],
    ["Preview, then print", "See it on your body, adjust the fit, and print it at home on A4."],
  ];
  return (
    <Slide id="idea" name="The idea" tone="light" bg="#f3f1ec" pattern={PAPER_DOTS}>
      <Label className="absolute left-[96px] top-[96px]">The idea</Label>
      <Title className="absolute left-[96px] top-[160px] w-[1500px] text-[118px]">
        Shop patterns are drafted for the average body. <span className="text-primary">Venty drafts for yours.</span>
      </Title>
      <div className="absolute inset-x-[96px] top-[640px] grid grid-cols-3 gap-12">
        {steps.map(([t, d], i) => (
          <div key={t} className="border-t border-ink/15 pt-7">
            <Num className="text-[64px] leading-none text-primary">{i + 1}</Num>
            <p className="mt-5 text-[38px] leading-tight tracking-[-.025em]">{t}</p>
            <p className="mt-3 text-[25px] leading-snug text-ink/60">{d}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

export function LogoHero() {
  return (
    <Slide id="logo" name="Logo" image={`${ASSET}/edge.webp`}>
      <Logo className="absolute left-1/2 top-[110px] w-[880px] -translate-x-1/2" />
      <div className="absolute bottom-[130px] left-[96px] w-[560px]">
        <Label>The logo</Label>
        <p className="mt-3 text-[30px] leading-snug tracking-[-.015em] text-white/85">The mark stacked above the wordmark. Five shapes, drawn once; only the colour changes.</p>
      </div>
    </Slide>
  );
}

// how the mark is drawn: its outline, every anchor point and every curve's handles, in its own box
export function MarkBuild() {
  const d = LOGO[4], { anchors, handles } = pathPoints(d);
  const s = 1080 / MARK_BOX.w, u = (px: number) => px / s; // screen px to the mark's units
  const curves = (d.match(/C/g) ?? []).length;
  return (
    <Slide id="mark-build" name="Logo" bg="#131523" pattern={{ ...GRAPH, opacity: 0.8 }}>
      <svg viewBox={`${MARK_BOX.x - u(40)} ${MARK_BOX.y - u(60)} ${MARK_BOX.w + u(140)} ${MARK_BOX.h + u(120)}`} className="absolute left-[56px] top-[170px]" style={{ width: 1080 + 140, height: MARK_BOX.h * s + 120 }} aria-hidden>
        <rect x={MARK_BOX.x} y={MARK_BOX.y} width={MARK_BOX.w} height={MARK_BOX.h} fill="none" stroke="rgb(140 156 248 / .55)" strokeDasharray={`${u(8)} ${u(8)}`} vectorEffect="non-scaling-stroke" strokeWidth={1.5} />
        <path d={d} fill="rgb(104 126 245 / .1)" stroke="#f0f4fe" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {handles.map(([a, b], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(140 156 248 / .7)" strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
        {handles.map(([, b], i) => <circle key={i} cx={b.x} cy={b.y} r={u(3.5)} fill="#8c9cf8" />)}
        {anchors.map((p, i) => <rect key={i} x={p.x - u(4.5)} y={p.y - u(4.5)} width={u(9)} height={u(9)} fill="#131523" stroke="#f0f4fe" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />)}
        <text x={MARK_BOX.x + MARK_BOX.w / 2} y={MARK_BOX.y - u(22)} textAnchor="middle" fill="#8c9cf8" fontSize={u(22)}>{MARK_BOX.w} units</text>
        <text x={MARK_BOX.x + MARK_BOX.w + u(14)} y={MARK_BOX.y + MARK_BOX.h / 2} fill="#8c9cf8" fontSize={u(22)} dominantBaseline="middle">{MARK_BOX.h}</text>
      </svg>
      <div className="absolute right-[96px] top-[110px] w-[520px]">
        <Title className="text-[110px]">The mark</Title>
        <p className="mt-8 text-[28px] leading-snug text-white/75">One closed shape, drawn in curves. It leads the stacked logo and stands alone on the app icon.</p>
        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-9">
          {[["Anchor points", anchors.length], ["Curves", curves], ["Width to height", (MARK_BOX.w / MARK_BOX.h).toFixed(2)], ["Shapes", 1]].map(([k, v]) => (
            <div key={k} className="border-t border-white/12 pt-4"><Label>{k}</Label><Num className="mt-2 block text-[64px] leading-none">{v}</Num></div>
          ))}
        </dl>
      </div>
    </Slide>
  );
}

// the wordmark on its lines: cap height, x-height, baseline, descender (measured from the letters)
export function WordBuild() {
  const w = 1320, s = w / WORD_BOX.w, top = 300, y = (v: number) => top + (v - WORD_BOX.y) * s;
  const lines = [
    { v: CAP_TOP, k: "Cap height", n: BASELINE - CAP_TOP },
    { v: X_TOP, k: "x-height", n: BASELINE - X_TOP },
    { v: BASELINE, k: "Baseline", n: null },
    { v: DESC, k: "Descender", n: DESC - BASELINE },
  ];
  return (
    <Slide id="word-build" name="Logo" tone="light" bg="#f0f4fe" pattern={GRAPH}>
      <Title className="absolute left-[96px] top-[96px] text-[110px]">The wordmark</Title>
      <p className="absolute right-[96px] top-[112px] w-[560px] text-[28px] leading-snug text-ink/65">Custom letters, set tight. The y carries a long tail that closes the word.</p>
      {lines.map((l) => (
        <div key={l.k} className="absolute inset-x-0 flex items-center" style={{ top: y(l.v) }}>
          <div className="h-px flex-1 bg-primary/70" />
          <span className="absolute right-[96px] -translate-y-[calc(100%+6px)] text-[22px] text-primary">{l.k}{l.n != null && <Num className="ml-3 text-[26px]">{l.n}</Num>}</span>
        </div>
      ))}
      <Logo part="word" color="#131523" className="absolute left-[96px]" style={{ top, width: w }} />
    </Slide>
  );
}

// the logo in each of its colourways, on the surfaces it lives on
export function LogoColours() {
  const ways = [
    { k: "White on Night", img: `${ASSET}/edge.webp`, bg: "#0b0c15", c: "#fff", light: false },
    { k: "Ink on Snow", bg: "#f0f4fe", c: "#131523", light: true },
    { k: "White on Haze", img: `${ASSET}/haze.webp`, bg: "#687ef5", c: "#fff", light: false },
    { k: "Cornflower on Paper", bg: "#f3f1ec", c: "#687ef5", light: true },
  ];
  return (
    <Slide id="logo-colours" name="Logo" folio={false}>
      <div className="grid h-full grid-cols-2 grid-rows-2">
        {ways.map((x) => (
          <div key={x.k} className="relative overflow-hidden" style={{ background: x.bg }}>
            {x.img && <img src={x.img} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <Logo color={x.c} className="absolute left-1/2 top-[86px] w-[440px] -translate-x-1/2" />
            <p className={cx("absolute bottom-[36px] left-[48px] text-[22px]", x.light ? "text-ink/55" : "text-white/65")}>{x.k}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// the home-screen icons people choose from (src/lib/appIcons.ts), as the phone rounds them
export function AppIcons() {
  const icons = [["Today", "/icon-512.png"], ["Night", "night"], ["Primary", "primary"], ["Snow", "snow"], ["Pattern", "pattern"], ["Pressed", "pressed"], ["Raised", "raised"], ["Denim", "denim"]];
  return (
    <Slide id="app-icon" name="Logo" pattern={NIGHT_DOTS}>
      <Title className="absolute left-[96px] top-[96px] text-[110px]">App icon</Title>
      <p className="absolute right-[96px] top-[112px] w-[620px] text-[28px] leading-snug text-white/70">Eight finishes of the mark for the home screen. The mark is the same size and in the same place on every one; people choose theirs when they add Venty.</p>
      <div className="absolute inset-x-[96px] top-[470px] grid grid-cols-8 gap-[34px]">
        {icons.map(([n, k]) => (
          <figure key={n}>
            <img src={k.startsWith("/") ? k : `/app-icons/v1/${k}-512.png`} alt={`${n} app icon`} className="aspect-square w-full rounded-[22.4%] shadow-[0_24px_50px_-20px_rgb(0_0_0/.8),0_0_0_1px_rgb(255_255_255/.08)]" />
            <figcaption className="mt-5 text-center text-[24px] text-white/70">{n}</figcaption>
          </figure>
        ))}
      </div>
    </Slide>
  );
}

// clear space (x: the wordmark's x-height) and the smallest sizes. New rules, for Jose to confirm.
export function Space() {
  const w = 400, s = w / LOGO_BOX.w, x = (BASELINE - X_TOP) * s, h = LOGO_BOX.h * s;
  return (
    <Slide id="space" name="Logo" tone="light" bg="#f0f4fe">
      <Title className="absolute left-[96px] top-[96px] text-[110px]">Space and size</Title>
      <div className="absolute left-[96px] top-[290px]" style={{ width: w + 2 * x, height: h + 2 * x }}>
        <div className="absolute inset-0 border-2 border-dashed border-primary/60 bg-primary/[.06]" />
        <div className="absolute border border-primary/40 bg-snow" style={{ left: x, top: x, width: w, height: h }} />
        <Logo color="#131523" className="absolute" style={{ left: x, top: x, width: w }} />
        {["top", "left"].map((k) => (
          <span key={k} className="absolute grid place-items-center font-serif text-[30px] font-bold text-primary" style={k === "top" ? { left: x + w / 2 - 20, top: 0, height: x, width: 40 } : { left: 0, top: x + h / 2 - 20, width: x, height: 40 }}>x</span>
        ))}
      </div>
      <div className="absolute right-[96px] top-[290px] w-[700px]">
        <p className="text-[28px] leading-snug text-ink/70">Keep clear space of <span className="font-serif font-bold">x</span> on every side: the height of the wordmark’s small letters. Nothing else enters it.</p>
        <div className="mt-14 grid grid-cols-2 gap-10 border-t border-ink/12 pt-8">
          <div>
            <div className="flex h-[150px] items-end"><Logo color="#131523" className="w-[120px]" /></div>
            <Label className="mt-5">Smallest logo</Label>
            <p className="mt-1 text-[30px] tracking-[-.02em]"><Num>120</Num> px wide, <Num>25</Num> mm in print</p>
          </div>
          <div>
            <div className="flex h-[150px] items-end"><Logo part="mark" color="#131523" className="w-[40px]" /></div>
            <Label className="mt-5">Smallest mark</Label>
            <p className="mt-1 text-[30px] tracking-[-.02em]"><Num>40</Num> px wide, <Num>8</Num> mm in print</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// what never to do to the logo
export function Misuse() {
  const tile = "relative grid h-[250px] place-items-center overflow-hidden rounded-[28px] bg-white shadow-[0_1px_0_rgb(19_21_35/.04),0_20px_40px_-30px_rgb(19_21_35/.4)]";
  const items: [string, React.ReactNode][] = [
    ["Don’t stretch or squash it.", <Logo key="a" color="#131523" className="h-[170px] w-[300px]" style={{ transform: "scaleX(1.5)" }} />],
    ["Don’t turn it.", <Logo key="b" color="#131523" className="w-[200px] -rotate-[18deg]" />],
    ["Don’t use colours from outside the palette.", <Logo key="c" color="#e0573c" className="w-[200px]" />],
    ["Don’t add shadows, outlines or glows.", <Logo key="d" color="#687ef5" className="w-[200px]" style={{ filter: "drop-shadow(6px 8px 0 #131523)" }} />],
    ["Don’t rearrange the mark and the word.", <div key="e" className="flex items-center gap-4"><Logo part="word" color="#131523" className="w-[220px]" /><Logo part="mark" color="#131523" className="w-[90px]" /></div>],
    ["Don’t set it on a busy picture.", <div key="f" className="absolute inset-0" style={{ background: "repeating-linear-gradient(45deg, #8c9cf8 0 14px, #f0f4fe 14px 28px)" }}><Logo color="#fff" className="absolute left-1/2 top-1/2 w-[200px] -translate-x-1/2 -translate-y-1/2" /></div>],
  ];
  return (
    <Slide id="misuse" name="Logo" tone="light" bg="#f3f1ec">
      <Title className="absolute left-[96px] top-[96px] text-[110px]">Keep it whole</Title>
      <div className="absolute inset-x-[96px] top-[262px] grid grid-cols-3 gap-x-10 gap-y-7">
        {items.map(([t, el]) => (
          <figure key={t}>
            <div className={tile}>{el}<span className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-ink text-[24px] leading-none text-white" aria-hidden>×</span></div>
            <figcaption className="mt-4 text-[24px] text-ink/70">{t}</figcaption>
          </figure>
        ))}
      </div>
    </Slide>
  );
}
