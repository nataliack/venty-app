"use client";
// Lab · the body's starting form (25 Oct 2026): the first measuring step's two cards, Female form and Male form, which
// still draw the old flat figure. Five versions with the real 3D mannequins, as stills rendered from Body3D (light, no
// 3D to load on this step; public/lab/sex-*.webp): full length (front) and waist up (three-quarter, posed, as on Body
// ready). Nothing is chosen at first (the app's rule); the tabs show each version with nothing, Female or Male chosen.
// With ?capture in the address, a stage renders the stills (window.__ventySnap) for tools to save into public/lab.
import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Icon } from "@/components/icons";
import { cx, Option } from "@/components/ui";
import { BodyLoader } from "@/components/BodyLoader";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false, loading: () => <BodyLoader /> });
const useCapture = () => useSyncExternalStore(() => () => {}, () => window.location.search.includes("capture"), () => false);

// the capture stage: each body on a transparent canvas, the size of the still
export function SexCapture() {
  const on = useCapture();
  if (!on) return null;
  return (
    <div className="flex flex-wrap gap-4">
      {(["female", "male"] as const).map((s) => (
        <div key={s} className="relative h-[900px] w-[420px] bg-transparent"><Body3D sex={s} focus="height" whole autoRotate={false} snapshot={`full-${s}`} className="absolute inset-0" /></div>
      ))}
      {(["female", "male"] as const).map((s) => (
        <div key={`p${s}`} className="relative h-[560px] w-[440px] bg-transparent"><Body3D sex={s} focus="portrait" autoRotate={false} snapshot={`portrait-${s}`} className="absolute inset-0" /></div>
      ))}
      {/* close-ups for the cards' faces (6): the portrait shot, sharper, to be turned either way before saving */}
      {(["female", "male"] as const).flatMap((s) => ["a", "b"].map((t) => (
        <div key={`c${s}${t}`} className="relative h-[700px] w-[600px] bg-transparent"><Body3D sex={s} focus="portrait" autoRotate={false} snapshot={`close-${s}-${t}`} className="absolute inset-0" /></div>
      )))}
    </div>
  );
}

type Sex = "female" | "male";
const SEXES: Sex[] = ["female", "male"];
const label = (s: Sex) => (s === "female" ? "Female form" : "Male form");
const full = (s: Sex) => `/lab/sex-full-${s}.webp`;
const portrait = (s: Sex) => `/lab/sex-portrait-${s}.webp`;
const INK: CSSProperties = { background: "radial-gradient(75% 55% at 50% -8%, rgb(104 126 245 / .18), rgb(104 126 245 / .06) 45%, transparent 76%), var(--color-ink)" };
// the pattern floor, flat: whitish lines fading up from the foot of the card
const FLOOR: CSSProperties = {
  backgroundImage: "linear-gradient(rgb(240 244 254 / .08) 1px, transparent 1px), linear-gradient(90deg, rgb(240 244 254 / .08) 1px, transparent 1px)",
  backgroundSize: "18px 18px", backgroundPosition: "center bottom",
  WebkitMaskImage: "linear-gradient(0deg, #000 0%, transparent 100%)", maskImage: "linear-gradient(0deg, #000 0%, transparent 100%)",
};
const KNOB: CSSProperties = { background: "linear-gradient(180deg, #2e3040, #1a1c28)", boxShadow: "0 2px 4px rgb(0 0 0 / .28), 0 1px 1px rgb(0 0 0 / .3), inset 0 1px 0 rgb(255 255 255 / .22)" };
const Tick = ({ light }: { light?: boolean }) => (
  <span className={cx("grid h-6 w-6 place-items-center rounded-full", light ? "bg-white text-ink" : "text-white")} style={light ? { boxShadow: "0 2px 6px rgb(0 0 0 / .35)" } : KNOB}><Icon name="check" size={13} strokeWidth={3} /></span>
);

type CardsProps = { sex: Sex | null; pick: (s: Sex) => void };

// 1 · Portrait: the body waist up, three-quarter, bleeding off the card's foot, its name over a shade; the chosen card
// ringed in white with a tick
function Portrait({ sex, pick }: CardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">{SEXES.map((s) => {
      const on = sex === s;
      return (
        <button key={s} onClick={() => pick(s)} aria-pressed={on} className={cx("relative h-[190px] overflow-hidden rounded-[22px] text-left transition-shadow", on ? "shadow-[0_0_0_2px_#fff]" : "shadow-[0_0_0_1px_rgb(255_255_255/.08)]")} style={INK}>
          <img src={portrait(s)} alt="" className={cx("absolute bottom-0 left-1/2 h-[170px] w-auto max-w-none -translate-x-1/2 transition-[opacity,transform] duration-500", on ? "scale-[1.04]" : sex ? "opacity-60" : "")} />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-20" style={{ background: "linear-gradient(180deg, transparent, rgb(11 12 21 / .8))" }} />
          <span className="absolute bottom-3.5 left-4 text-[16px] font-medium text-white">{label(s)}</span>
          {on && <span className="absolute right-3 top-3"><Tick light /></span>}
        </button>
      );
    })}</div>
  );
}

// 2 · On the floor: the whole body standing on the pattern floor, as on the measuring stage; the name under the card;
// the chosen card lit from above (a cornflower light) and its floor brighter
function Floor({ sex, pick }: CardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">{SEXES.map((s) => {
      const on = sex === s;
      return (
        <button key={s} onClick={() => pick(s)} aria-pressed={on} className="text-left">
          <span className={cx("relative block h-[200px] overflow-hidden rounded-[22px] transition-shadow", on ? "shadow-[0_0_0_2px_#fff]" : "shadow-[0_0_0_1px_rgb(255_255_255/.08)]")} style={INK}>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-[70px] transition-opacity duration-500" style={{ ...FLOOR, opacity: on ? 1 : 0.55 }} />
            {on && <span aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 50% at 50% 0%, rgb(140 156 248 / .28), transparent 70%)" }} />}
            <span aria-hidden className="absolute bottom-3 left-1/2 h-3 w-[70px] -translate-x-1/2 rounded-[50%] bg-black/60 blur-[6px]" />
            <img src={full(s)} alt="" className={cx("absolute bottom-3.5 left-1/2 h-[176px] w-auto max-w-none -translate-x-1/2 transition-opacity duration-500", sex && !on && "opacity-55")} />
            {on && <span className="absolute right-3 top-3"><Tick light /></span>}
          </span>
          <span className={cx("mt-2.5 block text-center text-[16px] font-medium transition-colors", on ? "text-white" : "text-white/70")}>{label(s)}</span>
        </button>
      );
    })}</div>
  );
}

// 3 · The app's option: the same card as every other choice (glass, snow once chosen), the body waist up on its right
// half, the name on the left
function AppOption({ sex, pick }: CardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">{SEXES.map((s) => (
      <Option key={s} on={sex === s} onClick={() => pick(s)} className="relative flex h-[170px] items-end overflow-hidden rounded-[22px] p-4">
        <img src={portrait(s)} alt="" className="absolute bottom-0 right-2 h-[128px] w-auto max-w-none" />
        <span className="relative text-[16px] font-medium">{label(s).split(" ")[0]}<br />form</span>
      </Option>
    ))}</div>
  );
}

// 4 · Pressed in, lifted out: both cards pressed into the page at rest; the chosen one rises out of it (raised, like the
// look switch's knob), its body brighter, the other's dimmed
const PRESS: CSSProperties = { background: "linear-gradient(180deg, #121320, #171823)", boxShadow: "inset 0 3px 8px rgb(0 0 0 / .6), inset 0 1px 2px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .06)" };
const RAISE: CSSProperties = { background: "linear-gradient(180deg, #2a2c3c, #1d1f2b)", boxShadow: "0 14px 28px -12px rgb(0 0 0 / .8), 0 2px 4px rgb(0 0 0 / .5), inset 0 1px 0 rgb(255 255 255 / .18), inset 0 -1px 0 rgb(0 0 0 / .45)" };
function Pressed({ sex, pick }: CardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">{SEXES.map((s) => {
      const on = sex === s;
      return (
        <motion.button key={s} onClick={() => pick(s)} aria-pressed={on} className="relative h-[200px] overflow-hidden rounded-[22px] text-left" style={on ? RAISE : PRESS}
          animate={{ y: on ? -3 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
          <img src={full(s)} alt="" className={cx("absolute bottom-3 left-1/2 h-[140px] w-auto max-w-none -translate-x-1/2 transition-opacity duration-500", on ? "opacity-100" : sex ? "opacity-40" : "opacity-80")} />
          <span className="absolute left-4 top-3.5 text-[15px] font-medium text-white">{label(s)}</span>
          {on && <span className="absolute bottom-3 right-3"><Tick /></span>}
        </motion.button>
      );
    })}</div>
  );
}

// 5 · One stage: both bodies side by side on one floor in one card; tap a body to choose it: it stays lit with a
// cornflower light at its feet and its name in a tag, the other fades back
function Stage({ sex, pick }: CardsProps) {
  return (
    <div className="relative h-[230px] overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgb(255_255_255/.08)]" style={INK}>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[80px]" style={FLOOR} />
      <div className="absolute inset-0 grid grid-cols-2">{SEXES.map((s) => {
        const on = sex === s;
        return (
          <button key={s} onClick={() => pick(s)} aria-pressed={on} aria-label={label(s)} className="relative">
            {on && <span aria-hidden className="absolute bottom-2 left-1/2 h-8 w-[110px] -translate-x-1/2 rounded-[50%] blur-[10px]" style={{ background: "rgb(104 126 245 / .55)" }} />}
            <span aria-hidden className="absolute bottom-4 left-1/2 h-3 w-[60px] -translate-x-1/2 rounded-[50%] bg-black/60 blur-[6px]" />
            <img src={full(s)} alt="" className={cx("absolute bottom-5 left-1/2 h-[166px] w-auto max-w-none -translate-x-1/2 transition-[opacity,filter] duration-500", sex && !on && "opacity-35 grayscale")} />
            <span className={cx("absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-[10px] px-2.5 py-1 text-[13px] font-medium transition-colors", on ? "bg-white text-ink" : "bg-white/10 text-white/75")}>{label(s)}</span>
          </button>
        );
      })}</div>
    </div>
  );
}

// 6 · A pressed row and a close-up (Jose, 25 Oct 2026): two cards in a row. At the foot of each, a row pressed into the
// card holds the name on two lines and, on its right, the app's choice circle (a ring at rest). The body rises out of
// that row: close up, head to the top of the stomach, turned to the right, never past the row's sides. Chosen, the whole
// card turns snow, its pressed row the snow version of it, and the circle the primary's cornflower with its tick.
const close = (s: Sex) => `/lab/sex-close-${s}.webp`;
const ROW_DARK: CSSProperties = { background: "rgb(0 0 0 / .26)", boxShadow: "inset 0 2px 5px rgb(0 0 0 / .55), inset 0 1px 1.5px rgb(0 0 0 / .5), inset 0 -1px 0 rgb(255 255 255 / .06)" };
const ROW_SNOW: CSSProperties = { background: "rgb(52 62 110 / .07)", boxShadow: "inset 0 3px 7px rgb(28 36 84 / .22), inset 0 1px 1.5px rgb(28 36 84 / .22), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9)" };
function CloseUp({ sex, pick }: CardsProps) {
  // the row at the foot of the card; the body rises out of it, in a box exactly as wide as the row and ending at its
  // top, so nothing of it shows past the row's sides or under it: it seems to come out of the card
  const ROW_H = 62, INSET = 8;
  return (
    <div className="grid grid-cols-2 gap-3">{SEXES.map((s) => {
      const on = sex === s;
      return (
        <button key={s} onClick={() => pick(s)} role="radio" aria-checked={on} aria-label={label(s)}
          className={cx("relative h-[232px] overflow-hidden rounded-[22px] text-left transition-colors duration-300", on ? "bg-snow" : "bg-card shadow-[inset_0_0_0_1px_rgb(255_255_255/.08)]")}>
          {/* the body, head to the top of the stomach, turned to the right */}
          <span aria-hidden className="absolute overflow-hidden" style={{ left: INSET, right: INSET, top: 0, bottom: INSET + ROW_H }}>
            <img src={close(s)} alt="" className="absolute left-1/2 top-[10px] h-[168px] w-auto max-w-none -translate-x-1/2" />
          </span>
          {/* the pressed row: the name on two lines, the choice circle on its right */}
          <span className="absolute flex items-center justify-between rounded-[16px] px-3 transition-[background,box-shadow] duration-300" style={{ left: INSET, right: INSET, bottom: INSET, height: ROW_H, ...(on ? ROW_SNOW : ROW_DARK) }}>
            <span className={cx("text-[15px] font-medium leading-[1.2] transition-colors", on ? "text-ink" : "text-white")}>{s === "female" ? "Female" : "Male"}<br />form</span>
            <span className={cx("radio relative", on && "icon-primary")} style={on ? { border: 0 } : undefined}>{on && <Icon name="check" size={13} strokeWidth={3} />}</span>
          </span>
        </button>
      );
    })}</div>
  );
}

// the screen around the cards: as the app's first step (progress, the question, the name, then the form)
function Screen({ children, ready }: { children: ReactNode; ready: boolean }) {
  return (
    <div className="flex h-full flex-col px-6 pt-12 text-white">
      <div className="flex h-11 items-center gap-3"><span className="rb rb-sm" aria-hidden><Icon name="back" size={18} /></span><span className="h-1 flex-1 rounded-full bg-white/10"><span className="block h-full w-1/12 rounded-full bg-primary" /></span></div>
      <h1 className="mt-5 text-[34px] font-normal leading-[1.05] tracking-[-.03em]">Who are you<br />measuring?</h1>
      <p className="mt-3 text-[16px] text-white/60">Give this body a name, so you can find it later.</p>
      <div className="mt-6 text-[14px] text-white/55">Name</div>
      <div className="field mt-2 flex h-[56px] items-center px-4 text-[18px]">Me</div>
      <div className="mt-5 text-[14px] text-white/55">Start the body with a</div>
      <div className="mt-2.5">{children}</div>
      <div className="mt-auto pb-7 pt-4"><span className={cx("pill pill-primary w-full text-[16px] transition-opacity", !ready && "opacity-40")}>Next</span></div>
    </div>
  );
}

const VERSIONS: { k: string; name: string; note: string; C: (p: CardsProps) => ReactNode }[] = [
  { k: "close", name: "6 · A pressed row and a close-up", note: "Jose's: at the foot of each card, a row pressed into it with the name on two lines and the app's choice circle on its right (a ring at rest). The body rises out of that row, close up (head, chest and the top of the stomach, turned to the right), never past the row's sides. Chosen, the whole card turns snow, the pressed row its snow version, the circle cornflower with a tick.", C: CloseUp },
  { k: "portrait", name: "1 · Portrait", note: "The body waist up, three-quarter and posed (as on Body ready), bleeding off the card's foot; its name over a soft shade. The chosen card ringed in white with a tick, the other dimmed.", C: Portrait },
  { k: "floor", name: "2 · On the floor", note: "The whole body standing on the pattern floor, as on the measuring stage, the name under the card. The chosen one lit from above in cornflower, its floor brighter.", C: Floor },
  { k: "option", name: "3 · The app's option", note: "The same card as every other choice in the app (glass, snow once chosen), the body waist up on its right half. The most consistent.", C: AppOption },
  { k: "pressed", name: "4 · Pressed in, lifted out", note: "Both cards pressed into the page at rest; the chosen one rises out (raised, like the look switch's knob), its body brighter, the other's faded.", C: Pressed },
  { k: "stage", name: "5 · One stage", note: "Both bodies side by side on one floor in one card. Tap a body: it stays lit, a cornflower light at its feet and its name in a white tag; the other fades back.", C: Stage },
];

function Phone({ v, start }: { v: (typeof VERSIONS)[number]; start: Sex | null }) {
  const [sex, setSex] = useState<Sex | null>(start);
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        <div className="dotgrid" />
        <Screen ready={sex !== null}><v.C sex={sex} pick={setSex} /></Screen>
      </div>
      <figcaption className="text-[14px] text-white/55">{v.name}</figcaption>
    </figure>
  );
}

export function SexLab() {
  const [start, setStart] = useState<"none" | Sex>("none");
  return (
    <section>
      <h2 className="h1 !text-[34px]">Starting form</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">The first measuring step&apos;s two cards, Female form and Male form, with the real 3D mannequins instead of the old flat figure. Stills rendered from the 3D bodies (light: no 3D to load on this step), full length or waist up. Nothing is chosen at first; the tabs show each version with nothing, Female or Male chosen, and tapping a card works too.</p>
      <div className="sticky top-0 z-30 -mx-6 mt-5 border-b border-white/10 bg-[#05060b]/90 px-6 py-3 backdrop-blur">
        <div role="tablist" aria-label="What is chosen" className="flex w-fit rounded-full bg-white/[.06] p-1">
          {([["none", "Nothing chosen"], ["female", "Female chosen"], ["male", "Male chosen"]] as const).map(([k, t]) => <button key={k} role="tab" aria-selected={start === k} onClick={() => setStart(k)} className={cx("h-10 rounded-full px-5 text-[15px] font-medium transition-colors", start === k ? "bg-white text-bg" : "text-white/70 hover:text-white")}>{t}</button>)}
        </div>
      </div>
      <div key={start} className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {VERSIONS.map((v) => <div key={v.k} className="flex w-[393px] flex-col gap-4"><Phone v={v} start={start === "none" ? null : start} /><p className="text-[14px] leading-snug text-white/55">{v.note}</p></div>)}
      </div>
    </section>
  );
}
