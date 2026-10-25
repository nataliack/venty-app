"use client";
// The lab (like the landing page's /lab): try styles side by side without touching the app. Phone-sized copies of real
// screens drawn with the app's own classes. Nothing here is used by the app. Approved and early sections were cleared on
// 24 Oct 2026 to keep the page light; they are kept in git under the tag lab-archive-2026-10-24
// (git checkout lab-archive-2026-10-24 -- src/app/lab/<file>).
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { cx, Crown } from "@/components/ui";
import { Studio3D } from "./Studio3D";
import { AboutLab } from "./AboutLab";
import { MatLab } from "./MatLab";
import { ReadyLab } from "./ReadyLab";
import { NotifyLab } from "./NotifyLab";
import { SexCapture, SexLab } from "./SexLab";

// ─── a phone ───
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

// ─── Profile: the top (so it stops looking like home) and the studio stats ───
type Top = "now" | "cover" | "photo";
type Stats = "now" | "strip" | "list";
const TOPS: { k: Top; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "The same light block and graph paper as home's top." },
  { k: "cover", name: "Cover", note: "A cover band of Crown (the app's gradient, slowly moving) at the top, your photo overlapping its bottom edge, and your name on the dark page below. Like a profile page, and nothing like home." },
  { k: "photo", name: "Your photo", note: "The cover is your own picture, blurred right out and tinted periwinkle, fading into the page; your photo sits on it. Personal: everyone's profile looks a little different." },
];
const STATS: { k: Stats; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "Three tiles: an icon, a big Bigilla number, the label and a line." },
  { k: "strip", name: "Stat strip", note: "One card in three parts split by hairlines: a clean number in the body font, the label, and the useful line. No icons, nothing shouting." },
  { k: "list", name: "List", note: "Three rows like the settings below: an inset tile, the label with its useful line, and the count on the right. The calmest, and it reads in one glance." },
];
const STUDIO: { icon: IconName; n: number; label: string; line: string }[] = [
  { icon: "body", n: 2, label: "Bodies", line: "Me, Mum" },
  { icon: "scissors", n: 3, label: "Patterns", line: "1 ready to print" },
  { icon: "printer", n: 1, label: "Printed", line: "Flutter midi dress" },
];
const Facts = ({ dark }: { dark?: boolean }) => (
  <p className={cx("mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[14px]", dark ? "text-white/60" : "text-[#3f4c80]")}>
    <span className="inline-flex items-center gap-1.5"><Icon name="scissors" size={15} />Intermediate sewist</span>
    <span className="inline-flex items-center gap-1.5"><Icon name="ruler" size={15} />Measures in cm</span>
  </p>
);
function ProfileTop({ t }: { t: Top }) {
  if (t === "now") return (
    <section className="light-hero relative overflow-hidden rounded-b-[34px] px-5 pb-6 pt-12">
      <div className="light-mat" aria-hidden />
      <div className="relative">
        <div className="flex h-10 items-center justify-between"><span className="text-[15px] font-medium text-[#3f4c80]">Profile</span><span className="bell-btn flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium"><Icon name="pencil" size={15} />Edit profile</span></div>
        <div className="mt-3 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ana.jpg" alt="" className="avatar-ring h-[92px] w-[92px] rounded-full object-cover" />
          <h1 className="h1 mt-3 !text-[30px] text-[#26335f]">Ana</h1>
          <div className="text-[14px] text-[#5d6a99]">ana@venty.studio</div>
          <Facts />
        </div>
      </div>
    </section>
  );
  // the cover: Crown, or your photo blurred and tinted; the top row sits on it in white
  const cover = t === "cover"
    ? <Crown live />
    : <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ana.jpg" alt="" className="absolute inset-0 h-full w-full scale-150 object-cover" style={{ filter: "blur(36px) saturate(1.3)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(104 126 245 / .45) 0%, rgb(79 99 224 / .35) 45%, rgb(11 12 21 / 0) 100%)", mixBlendMode: "normal" }} />
      </>;
  return (
    <section className="relative text-white">
      <div className="relative h-[220px] overflow-hidden" style={{ WebkitMaskImage: "linear-gradient(180deg, #000 35%, transparent)", maskImage: "linear-gradient(180deg, #000 35%, transparent)" }}>{cover}</div>
      <div className="absolute inset-x-0 top-12 flex h-10 items-center justify-between px-5">
        <span className="text-[15px] font-medium text-white/90">Profile</span>
        <span className="flex h-10 items-center gap-1.5 rounded-full bg-white/15 px-4 text-[14px] font-medium backdrop-blur-md" style={{ boxShadow: "inset 0 0 0 1px rgb(255 255 255 / .25)" }}><Icon name="pencil" size={15} />Edit profile</span>
      </div>
      <div className="relative -mt-[84px] flex flex-col items-center px-5 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ana.jpg" alt="" className="h-[100px] w-[100px] rounded-full object-cover" style={{ boxShadow: "0 0 0 4px #0b0c15, 0 18px 40px -16px rgb(0 0 0 / .8)" }} />
        <h1 className="h1 mt-3 !text-[30px]">Ana</h1>
        <div className="text-[14px] text-white/55">ana@venty.studio</div>
        <Facts dark />
      </div>
    </section>
  );
}
function StudioStats({ st }: { st: Stats }) {
  if (st === "now") return (
    <div className="mt-2.5 grid grid-cols-3 gap-2.5">{STUDIO.map((x) => (
      <div key={x.label} className="card-soft flex min-h-[132px] flex-col rounded-[22px] p-3.5">
        <span className="iconbadge grid h-9 w-9 place-items-center rounded-[11px]"><Icon name={x.icon} size={17} strokeWidth={1.9} /></span>
        <span className="serif mt-4 text-[32px] leading-none">{x.n}</span>
        <span className="mt-1.5 text-[14px] font-medium">{x.label}</span>
        <span className="mt-0.5 truncate text-[12px] text-white/50">{x.line}</span>
      </div>
    ))}</div>
  );
  if (st === "strip") return (
    <div className="card-soft mt-2.5 grid grid-cols-3 divide-x divide-white/[.07] rounded-[22px] py-4">{STUDIO.map((x) => (
      <div key={x.label} className="min-w-0 px-3.5">
        <div className="text-[30px] font-normal leading-none tracking-[-.03em] tabular-nums">{x.n}</div>
        <div className="mt-2 text-[14px] font-medium">{x.label}</div>
        <div className="mt-0.5 truncate text-[12px] text-white/50">{x.line}</div>
      </div>
    ))}</div>
  );
  return (
    <div className="card-soft mt-2.5 divide-y divide-white/[.07] overflow-hidden rounded-[22px]">{STUDIO.map((x) => (
      <div key={x.label} className="flex min-h-[60px] items-center gap-3.5 px-4 py-3">
        <span className="iconbadge grid h-9 w-9 shrink-0 place-items-center rounded-[11px]"><Icon name={x.icon} size={17} strokeWidth={1.9} /></span>
        <span className="min-w-0 flex-1"><span className="block text-[15px]">{x.label}</span><span className="block truncate text-[13px] text-white/50">{x.line}</span></span>
        <span className="text-[17px] tabular-nums text-white/80">{x.n}</span>
        <Icon name="chevR" size={18} className="text-white/40" />
      </div>
    ))}</div>
  );
}
function ProfileLab() {
  const [t, setT] = useState<Top>("cover");
  const [st, setSt] = useState<Stats>("strip");
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  return (
    <section>
      <h2 className="h1 !text-[34px]">Profile</h2>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="max-w-[560px]">
          <p className="text-[15px] text-white/50">The top</p>
          <div className="mt-2">{pick(TOPS, t, setT)}</div>
          <p className="mt-3 text-[15px] leading-snug text-white/65">{TOPS.find((x) => x.k === t)!.note}</p>
          <p className="mt-8 text-[15px] text-white/50">Your studio</p>
          <div className="mt-2">{pick(STATS, st, setSt)}</div>
          <p className="mt-3 text-[15px] leading-snug text-white/65">{STATS.find((x) => x.k === st)!.note}</p>
        </div>
        <Phone label="Profile">
          <ProfileTop t={t} />
          <div className="px-5 text-white">
            <h2 className="mt-6 px-1 text-[15px] text-white/55">Your studio</h2>
            <StudioStats st={st} />
            <h2 className="mt-6 px-1 text-[15px] text-white/55">Preferences</h2>
            <div className="card-soft mt-2.5 divide-y divide-white/[.07] overflow-hidden rounded-[22px]">{([["ruler", "Units", "Centimetres"], ["scissors", "Sewing level", "Intermediate"]] as const).map(([ic, l, d]) => (
              <div key={l} className="flex min-h-[60px] items-center gap-3.5 px-4 py-3">
                <span className="iconbadge grid h-9 w-9 shrink-0 place-items-center rounded-[11px]"><Icon name={ic} size={17} strokeWidth={1.9} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[15px]">{l}</span><span className="block text-[13px] text-white/50">{d}</span></span>
                <Icon name="chevR" size={18} className="text-white/40" />
              </div>
            ))}</div>
          </div>
        </Phone>
      </div>
    </section>
  );
}

export default function Lab() {
  return (
    // the app pins html and body (no page scroll), so the lab scrolls inside its own box
    <div className="fixed inset-0 overflow-y-auto bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <p className="text-[14px] text-white/50">Venty lab</p>
        <SexCapture />
        <div className="mt-6"><SexLab /></div>
        <div className="my-16 h-px bg-white/10" />
        <div className="mt-6"><NotifyLab /></div>
        <div className="my-16 h-px bg-white/10" />
        <div className="mt-6"><ReadyLab /></div>
        <div className="my-16 h-px bg-white/10" />
        <div className="mt-6"><MatLab /></div>
        <div className="my-16 h-px bg-white/10" />
        <div className="mt-6"><AboutLab /></div>
        <div className="my-16 h-px bg-white/10" />
        <div className="mt-6"><Studio3D /></div>
        <div className="my-16 h-px bg-white/10" />
        <div className="mt-6"><ProfileLab /></div>
      </div>
    </div>
  );
}
