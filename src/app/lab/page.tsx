"use client";
// The lab (like the landing page's /lab): try styles side by side without touching the app. Three phone-sized copies of
// real screens (home with its notice card, the Notifications pop-up over home, the profile), drawn with the app's own
// classes, and a switch for the style being tried. Nothing here is used by the app.
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { cx, Crown } from "@/components/ui";
import { Studio3D } from "./Studio3D";

type V = "now" | "tile" | "line" | "light" | "inset";
const VARIANTS: { k: V; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "What the app has now: dark navy circles with a fine ring, and a gradient pop-up with a round close button." },
  { k: "tile", name: "A · Tinted tiles", note: "Icons sit in soft rounded squares, faintly tinted periwinkle, the icon in periwinkle. No ring, no gradient: a quiet marker, never a button. The pop-up is the solid card colour with a fine light edge on top, a slim handle and no close button (drag it down or tap outside)." },
  { k: "line", name: "B · Line icons", note: "No container at all: the line icon in periwinkle. The cleanest. The same solid pop-up as A." },
  { k: "inset", name: "D · Inset tiles", note: "The same rounded square, pressed into the card instead of sitting on it: a floor a touch darker than the card, a soft shadow inside along the top edge, a faint highlight on the bottom lip, and a much quieter icon. The pop-up is the solid one from A." },
  { k: "light", name: "C · Light pop-up", note: "Tinted tiles as in A, and the pop-up turns light (the snow of the studio), ink text, periwinkle tiles. It matches the light top of home." },
];

// ─── the icon, per style ───
function Badge({ v, icon, sm, onLight }: { v: V; icon: IconName; sm?: boolean; onLight?: boolean }) {
  const box = sm ? "h-9 w-9" : "h-11 w-11";
  const size = sm ? 17 : 20;
  if (v === "now") return <span className={cx("iconbadge grid shrink-0 place-items-center rounded-full", box)}><Icon name={icon} size={size} strokeWidth={2} /></span>;
  if (v === "inset") return <span className={cx("lab-inset grid shrink-0 place-items-center", box, sm ? "rounded-[11px]" : "rounded-[13px]")}><Icon name={icon} size={size} strokeWidth={1.8} /></span>;
  if (v === "line") return <span className={cx("grid shrink-0 place-items-center", sm ? "w-6" : "w-7", onLight ? "text-[#4f63e0]" : "text-[#a9b5fb]")}><Icon name={icon} size={sm ? 20 : 22} strokeWidth={1.8} /></span>;
  return (
    <span className={cx("grid shrink-0 place-items-center", box, sm ? "rounded-[11px]" : "rounded-[13px]", onLight ? "bg-[rgb(104_126_245_/_.1)] text-[#4f63e0]" : "bg-[rgb(140_156_248_/_.13)] text-[#b3bdfb]")}>
      <Icon name={icon} size={size} strokeWidth={1.9} />
    </span>
  );
}

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

// ─── home: the light top, then the notice card and the first section ───
function HomeTop() {
  return (
    <section className="light-hero relative overflow-hidden rounded-b-[34px] px-5 pb-6 pt-12">
      <div className="light-mat" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ana.jpg" alt="" className="avatar-ring h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1"><div className="text-[13px] text-[#3f4c80]/80">Good evening</div><div className="text-[16px] font-medium leading-tight text-[#26335f]">Ana</div></div>
          <span className="bell-btn relative grid h-10 w-10 place-items-center rounded-full"><Icon name="bell" size={19} strokeWidth={1.8} /><span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#687ef5] ring-2 ring-white" /></span>
        </div>
        <h1 className="h1 mt-8 !text-[30px] text-[#26335f]">What are we making today?</h1>
        <p className="mt-2 text-[15px] text-[#3f4c80]">Design your own pattern, or start from one of ours.</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {([["pencil", "Design from scratch", "From a photo, sketch or words"], ["dress", "Start from a pattern", "Choose a style, then fit it to you"]] as const).map(([ic, t, d]) => (
            <div key={t} className="card-soft rounded-[24px] p-4 text-white">
              <span className="flex items-center justify-between"><span className="icon-primary grid h-11 w-11 place-items-center rounded-full"><Icon name={ic} size={20} strokeWidth={2} /></span><Icon name="chevR" size={18} className="text-white/60" /></span>
              <div className="mt-4 text-[16px] font-medium leading-tight">{t}</div>
              <div className="mt-1 text-[13px] leading-snug text-white/60">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function HomeBody({ v }: { v: V }) {
  return (
    <div className="px-5 pt-5 text-white">
      <div className="card-soft flex items-center gap-3.5 rounded-[22px] p-4">
        <Badge v={v} icon="video" />
        <span className="min-w-0 flex-1"><span className="block text-[16px] font-medium">New here? Take the tour</span><span className="block text-[14px] text-white/55">See how a photo becomes your pattern.</span></span>
        <span className="grid h-8 w-8 place-items-center rounded-full text-white/50"><Icon name="close" size={16} /></span>
      </div>
      <div className="card-soft mt-3 flex items-center gap-3.5 rounded-[22px] p-4">
        <Badge v={v} icon="ruler" />
        <span className="min-w-0 flex-1"><span className="block text-[16px] font-medium">Finish your measurements</span><span className="block text-[14px] text-white/55">Me, Spring 26 · 4 of 24 saved</span></span>
        <Icon name="chevR" size={18} className="text-white/50" />
      </div>
      <div className="mt-7 flex items-center justify-between"><span className="text-[19px]">Your bodies</span><span className="rounded-full border border-white/15 px-3.5 py-1.5 text-[14px]">View all</span></div>
    </div>
  );
}

// ─── the Notifications pop-up, per style ───
const NOTES: { icon: IconName; t: string; d: string; when: string }[] = [
  { icon: "dress", t: "New patterns to make", d: "A wrap dress and wide-leg trousers were added to the library.", when: "Yesterday" },
  { icon: "pencil", t: "New: sketch on your photos", d: "Add a photo and draw your changes on top of it.", when: "This week" },
  { icon: "ruler", t: "Finish your measurements", d: "20 more for the closest fit. Pick up where you left off.", when: "This week" },
];
function Sheet({ v }: { v: V }) {
  const light = v === "light";
  const now = v === "now";
  return (
    <div className={cx("absolute inset-x-0 bottom-0 z-20 px-5 pb-8", now ? "rounded-t-[36px] border-t border-white/15 pt-3" : "rounded-t-[30px] pt-2.5", light ? "bg-[#f6f7fd] text-[#131523]" : "text-white")}
      style={now ? { background: "linear-gradient(180deg, #2a2f48 0%, #161826 60%)" } : light ? { boxShadow: "0 -20px 60px -20px rgb(0 0 0 / .6)" } : { background: "var(--color-card)", boxShadow: "inset 0 1px 0 rgb(255 255 255 / .1), 0 -20px 60px -20px rgb(0 0 0 / .7)" }}>
      <div className={cx("mx-auto rounded-full", now ? "mb-4 h-1.5 w-10 bg-white/30" : "mb-5 h-1 w-9", !now && (light ? "bg-[#131523]/15" : "bg-white/20"))} />
      {now
        ? <div className="mb-4 flex items-center justify-between"><h3 className="text-[22px] font-normal tracking-[-.02em]">Notifications</h3><span className="rb grid h-[38px] w-[38px] place-items-center rounded-full"><Icon name="close" size={17} /></span></div>
        : <h3 className="mb-2 text-[20px] font-normal tracking-[-.02em]">Notifications</h3>}
      <div className="flex flex-col">{NOTES.map((n, i) => (
        <div key={n.t} className={cx("flex items-start gap-3.5 py-3.5", i > 0 && (light ? "border-t border-[#131523]/[.08]" : "border-t border-white/[.07]"))}>
          <Badge v={v} icon={n.icon} sm={v !== "now"} onLight={light} />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3"><span className="text-[16px]">{n.t}</span><span className={cx("shrink-0 text-[13px]", light ? "text-[#131523]/40" : "text-white/40")}>{n.when}</span></span>
            <span className={cx("mt-0.5 block text-[14px] leading-snug", light ? "text-[#131523]/60" : "text-white/55")}>{n.d}</span>
          </span>
        </div>
      ))}</div>
    </div>
  );
}

// ─── the profile: the light top, the studio tiles and one group of rows ───
function Profile({ v }: { v: V }) {
  return (
    <>
      <section className="light-hero relative overflow-hidden rounded-b-[34px] px-5 pb-6 pt-12">
        <div className="light-mat" aria-hidden />
        <div className="relative">
          <div className="flex h-10 items-center justify-between"><span className="text-[15px] font-medium text-[#3f4c80]">Profile</span><span className="bell-btn flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium"><Icon name="pencil" size={15} />Edit profile</span></div>
          <div className="mt-3 flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ana.jpg" alt="" className="avatar-ring h-[92px] w-[92px] rounded-full object-cover" />
            <h1 className="h1 mt-3 !text-[30px] text-[#26335f]">Ana</h1>
            <div className="text-[14px] text-[#3f4c80]">ana@venty.studio</div>
          </div>
        </div>
      </section>
      <div className="px-5 text-white">
        <h2 className="mt-6 px-1 text-[15px] text-white/55">Your studio</h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">{([["body", "2", "Bodies", "Me, Mum"], ["scissors", "3", "Patterns", "1 ready to print"], ["printer", "1", "Printed", "Flutter midi dress"]] as const).map(([ic, n, l, d]) => (
          <div key={l} className="card-soft flex min-h-[132px] flex-col rounded-[22px] p-3.5">
            <Badge v={v} icon={ic} sm />
            <span className="serif mt-4 text-[32px] leading-none">{n}</span>
            <span className="mt-1.5 text-[14px] font-medium">{l}</span>
            <span className="mt-0.5 truncate text-[12px] text-white/50">{d}</span>
          </div>
        ))}</div>
        <h2 className="mt-6 px-1 text-[15px] text-white/55">App</h2>
        <div className="card-soft mt-2.5 divide-y divide-white/[.07] overflow-hidden rounded-[22px]">{([["addhome", "Add Venty to your home screen", "Open it in one tap, like an app"], ["book", "App tour", "How Venty works"], ["lock", "Your privacy", "What Venty keeps, and where"]] as const).map(([ic, t, d]) => (
          <div key={t} className="flex min-h-[60px] items-center gap-3.5 px-4 py-3">
            <Badge v={v} icon={ic} sm />
            <span className="min-w-0 flex-1"><span className="block text-[15px]">{t}</span><span className="block text-[13px] text-white/50">{d}</span></span>
            <Icon name="chevR" size={18} className="text-white/40" />
          </div>
        ))}</div>
      </div>
    </>
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
  const [v, setV] = useState<V>("inset");
  const cur = VARIANTS.find((x) => x.k === v)!;
  return (
    // the app pins html and body (no page scroll), so the lab scrolls inside its own box
    <div className="fixed inset-0 overflow-y-auto bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <p className="text-[14px] text-white/50">Venty lab</p>
        <div className="mt-6"><Studio3D /></div>
        <div className="my-16 h-px bg-white/10" />
        <div className="mt-6"><ProfileLab /></div>
        <div className="my-16 h-px bg-white/10" />
        <h1 className="h1 mt-1">Icons and pop-ups</h1>
        <div className="mt-6 flex flex-wrap gap-2">{VARIANTS.map((x) => (
          <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
        ))}</div>
        <p className="mt-4 max-w-[720px] text-[16px] leading-snug text-white/65">{cur.note}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
          <Phone label="Home"><HomeTop /><HomeBody v={v} /></Phone>
          <Phone label="Notifications">
            <div className="pointer-events-none blur-[2px]"><HomeTop /><HomeBody v={v} /></div>
            <div className="absolute inset-0 z-10 bg-black/50" />
            <Sheet v={v} />
          </Phone>
          <Phone label="Profile"><Profile v={v} /></Phone>
        </div>
      </div>
    </div>
  );
}
