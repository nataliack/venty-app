"use client";
// Lab: home's two start cards (Create a pattern, Start from a pattern). Side by side at about 166px each, the names and
// their lines wrap to two lines and crowd the icon. These keep the content and give it room. Real home top, phone size.
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { cx } from "@/components/ui";

type V = "now" | "rows" | "small" | "main" | "names";
const VARIANTS: { k: V; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "Two cards side by side, about 166px each: “Start from a pattern” and both lines wrap to two lines, crowding the icon." },
  { k: "rows", name: "A · Two wide rows", note: "Each card runs the full width: the icon on the left, the name and its line beside it, a chevron at the end. Every name and line fits on one line, so nothing wraps and the two read the same. The section is a little taller." },
  { k: "small", name: "B · Smaller type", note: "Two cards side by side, as today, with the name at 16px and its line at 13px (at most two lines), and a touch less padding. Still compact; the words are a size smaller." },
  { k: "main", name: "C · One main card", note: "Create a pattern as one wide card (the main way in), and starting from a pattern as a quiet line under it, with a chevron. Calm, and it says which comes first." },
  { k: "names", name: "D · Names only", note: "Two cards side by side with the icon and the name only, no line under it. The tidiest; the names have to explain themselves." },
];

const CARDS: [IconName, string, string][] = [
  ["pencil", "Create a pattern", "From a photo, sketch or words"],
  ["dress", "Start from a pattern", "Pick a design, fit it to you"],
];

const Chev = ({ className }: { className?: string }) => <Icon name="chevR" size={20} className={cx("shrink-0 text-white/60", className)} />;
const Dot = ({ ic, size = 44 }: { ic: IconName; size?: number }) => <span className="icon-primary grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size }}><Icon name={ic} size={Math.round(size * 0.45)} strokeWidth={2} /></span>;

function Cards({ v }: { v: V }) {
  if (v === "rows") return (
    <div className="mt-6 flex flex-col gap-2.5">{CARDS.map(([ic, t, d]) => (
      <div key={t} className="pair-dark flex items-center gap-3.5 rounded-[24px] p-4 text-white">
        <Dot ic={ic} />
        <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium leading-tight">{t}</span><span className="mt-0.5 block text-[14px] leading-snug text-white/70">{d}</span></span>
        <Chev />
      </div>
    ))}</div>
  );
  if (v === "main") return (
    <>
      <div className="pair-dark mt-6 flex items-center gap-3.5 rounded-[24px] p-4 text-white">
        <Dot ic="pencil" />
        <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium leading-tight">Create a pattern</span><span className="mt-0.5 block text-[14px] leading-snug text-white/70">From a photo, sketch or words</span></span>
        <Chev />
      </div>
      <div className="mt-3 flex items-center justify-center gap-1 text-[15px] font-medium text-[#3f4c80]">Or start from one of our patterns<Icon name="chevR" size={16} /></div>
    </>
  );
  if (v === "names") return (
    <div className="mt-6 grid grid-cols-2 gap-3">{CARDS.map(([ic, t]) => (
      <div key={t} className="pair-dark flex min-h-[112px] flex-col justify-between rounded-[24px] p-4 text-white">
        <span className="flex items-center justify-between"><Dot ic={ic} /><Chev /></span>
        <span className="mt-4 block text-[17px] font-medium leading-tight [text-wrap:balance]">{t}</span>
      </div>
    ))}</div>
  );
  const small = v === "small";
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">{CARDS.map(([ic, t, d]) => (
      <div key={t} className={cx("pair-dark flex flex-col justify-between rounded-[24px] text-white", small ? "min-h-[120px] p-3.5" : "min-h-[128px] p-4")}>
        <span className="flex items-center justify-between"><Dot ic={ic} size={small ? 40 : 44} /><Chev /></span>
        <span className={small ? "mt-3" : ""}>
          <span className={cx("block font-medium leading-tight", small ? "text-[16px] [text-wrap:balance]" : "text-[18px]")}>{t}</span>
          <span className={cx("mt-1 block leading-snug text-white/70", small ? "line-clamp-2 text-[13px] [text-wrap:balance]" : "text-[14px] [text-wrap:balance]")}>{d}</span>
        </span>
      </div>
    ))}</div>
  );
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate h-[640px] w-[393px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
      <div className="dotgrid" />
      {children}
    </div>
  );
}

// home's light top, as in the app (393 wide, so the cards are their real width)
function HomeTop({ v }: { v: V }) {
  return (
    <section className="light-hero relative overflow-hidden rounded-b-[36px] px-5 pb-7 pt-14">
      <div className="light-mat" aria-hidden />
      <div className="relative">
        <div className="flex h-11 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ana.jpg" alt="" className="avatar-ring h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1 leading-tight"><div className="text-[13px] text-[#5d6a99]">Good afternoon</div><div className="text-[15px] font-medium text-[#3f4c80]">Ana</div></div>
          <span className="bell-btn grid h-10 w-10 place-items-center rounded-full"><Icon name="bell" size={19} strokeWidth={1.8} /></span>
        </div>
        <h1 className="h1 mt-8 !text-[34px] text-[#26335f]">What are we making today?</h1>
        <p className="mt-2.5 text-[16px] leading-snug text-[#3f4c80]">Design your own pattern, or start from one of ours.</p>
        <Cards v={v} />
      </div>
    </section>
  );
}

export function CardsLab() {
  const [v, setV] = useState<V>("rows");
  return (
    <section>
      <h2 className="h1 !text-[34px]">Home start cards</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">The two cards on home&apos;s light top, at their real width on a 393px phone. The same words in each version; only the layout changes. The right phone is Today, for comparison.</p>
      <div className="mt-6 flex flex-wrap gap-2">{VARIANTS.filter((x) => x.k !== "now").map((x) => (
        <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
      ))}</div>
      <p className="mt-4 max-w-[760px] text-[16px] leading-snug text-white/65">{VARIANTS.find((x) => x.k === v)!.note}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <figure className="flex flex-col items-center gap-3"><Phone><HomeTop v={v} /></Phone><figcaption className="text-[14px] text-white/55">{VARIANTS.find((x) => x.k === v)!.name}</figcaption></figure>
        <figure className="flex flex-col items-center gap-3"><Phone><HomeTop v="now" /></Phone><figcaption className="text-[14px] text-white/55">Today</figcaption></figure>
      </div>
    </section>
  );
}
