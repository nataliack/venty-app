"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useApp, type Pattern } from "@/lib/store";
import { fabricAdvice, fitName, metresFor, SEED_PATTERNS, type GarmentKey } from "@/lib/data";
import { Screen, Eyebrow, H1, Pill, Glow, Glass, Chip, RB, Sheet, Toggle, TopBar, Split, Blob, Crown, cx, useToast, useDesk } from "@/components/ui";
import { BodyFigure, Flat } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";

// Phone navigation: a light floating bar with the Create button raised in a notch in the centre.
// The current tab sits in a soft periwinkle capsule. No glows.
function TabBar({ tab }: { tab: "home" | "bodies" | "patterns" | "you" }) {
  const { replace } = useApp();
  const [open, setOpen] = useState(false);
  const items: [typeof tab, IconName, string][] = [["home", "home", "Home"], ["bodies", "body", "Bodies"], ["patterns", "scissors", "Patterns"], ["you", "user", "You"]];
  const btn = ([k, ic, l]: (typeof items)[number]) => {
    const on = tab === k;
    return (
      <button key={k} onClick={() => replace(k)} aria-current={on ? "page" : undefined} className={cx("flex h-full flex-1 flex-col items-center justify-center gap-1 text-[12px] transition-colors", on ? "font-semibold text-[#26335f]" : "font-medium text-[#26335f]/50")}>
        <span className={cx("grid h-8 w-14 place-items-center rounded-full transition-colors", on && "bg-[#687ef5]/18")}><Icon name={ic} size={22} strokeWidth={on ? 2.1 : 1.7} /></span>
        {l}
      </button>
    );
  };
  return (
    <>
      <div className="relative mt-5">
        {/* docked flush to the bottom edge; the padding keeps the icons above the home indicator */}
        <nav className="tabbar flex items-stretch rounded-t-[28px] px-2" style={{ height: "calc(64px + var(--dock))", paddingBottom: "var(--dock)" }}>
          {items.slice(0, 2).map(btn)}
          <span className="w-[78px] shrink-0" />
          {items.slice(2).map(btn)}
        </nav>
        <button onClick={() => setOpen(true)} aria-label="Create" className="createbtn tap absolute left-1/2 top-0 grid h-[62px] w-[62px] -translate-x-1/2 -translate-y-[36%] place-items-center rounded-full"><Icon name="plus" size={26} strokeWidth={2.2} /></button>
      </div>
      <CreateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { go, newBody, newDraft, startBody } = useApp();
  const row = (ic: IconName, t: string, d: string, color: string, fn: () => void) => (
    <Glow as="button" color={color} variant="side" onClick={() => { onClose(); fn(); }} className="flex w-full items-center gap-4 rounded-[24px] p-5">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><Icon name={ic} size={22} /></span>
      <span className="flex-1"><span className="block text-[17px] font-semibold">{t}</span><span className="block text-[13px] text-white/60">{d}</span></span>
      <Icon name="chevR" size={20} />
    </Glow>
  );
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between"><span className="text-[20px] font-semibold">Create</span><RB icon="close" size={38} onClick={onClose} /></div>
      <div className="flex flex-col gap-2.5">
        {row("scissors", "Design your own", "From a photo, a sketch or your own words", "#687ef5", () => { newDraft(); go("patSelectBody"); })}
        {row("dress", "Use a pre-made pattern", "Dresses, tops, trousers and skirts", "#4f63e0", () => go("templates"))}
        {row("body", "Make a body", "Measure yourself or someone you sew for", "#4d5e85", () => { startBody(); })}
      </div>
    </Sheet>
  );
}

// Home notices: resume paused measures; offer the tour to people who skipped it. Both dismiss themselves once used.
function Notices() {
  const { bodies, resumeBody, tourSkipped, set, go } = useApp();
  const b = bodies.find((x) => x.id === resumeBody && x.done.length < 24);
  if (!b && !tourSkipped) return null;
  return (
    <div className="mt-5 flex flex-col gap-2.5 lg:max-w-[720px]">
      {b && (
        <button onClick={() => { set({ activeBody: b.id }); go("wizard"); }} className="card-soft tap flex w-full items-center gap-3.5 rounded-[22px] !border-primary/60 p-4 text-left">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/25 text-peri"><Icon name="ruler" size={22} /></span>
          <div className="min-w-0 flex-1"><div className="text-[16px] font-medium">Continue finishing your measurements</div><div className="text-[14px] text-white/55">{b.name} · {b.done.length} of 24 saved</div>
            <div className="mt-2 flex gap-[2px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("h-1 flex-1 rounded-full", i < b.done.length ? "bg-primary" : "bg-white/15")} />)}</div></div>
          <Icon name="chevR" size={18} className="text-white/50" />
        </button>
      )}
      {tourSkipped && (
        <div className="card-soft relative flex items-center gap-3.5 rounded-[22px] p-4">
          <button onClick={() => go("onboarding", { from: "app" })} className="flex flex-1 items-center gap-3.5 text-left">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10"><Icon name="video" size={20} /></span>
            <span><span className="block text-[16px] font-medium">New here? Take the tour</span><span className="block text-[14px] text-white/55">See how a photo becomes your pattern.</span></span>
          </button>
          <button onClick={() => set({ tourSkipped: false })} aria-label="Dismiss" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10"><Icon name="close" size={16} /></button>
        </div>
      )}
    </div>
  );
}

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

const STATUS_DOT: Record<string, string> = { Printed: "bg-primary", Fitting: "bg-peri", Draft: "bg-white/40" };

function SectionHead({ title, onAll }: { title: string; onAll: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[18px] font-normal tracking-[-.02em] lg:text-[22px]">{title}</h2>
      <button onClick={onAll} className="tap flex h-8 items-center gap-0.5 rounded-full border border-white/15 pl-3 pr-2 text-[13px] font-medium text-white/75 hover:text-white">View all<Icon name="chevR" size={14} /></button>
    </div>
  );
}

// Updates behind the bell: only things that matter to you (work waiting, patterns ready, what's new). No marketing.
function useUpdates() {
  const { bodies, patterns, resumeBody, set, go } = useApp();
  const unfinished = bodies.find((x) => x.id === resumeBody && x.done.length < 24);
  const ready = patterns.find((x) => x.status === "Fitting");
  const list: { icon: IconName; t: string; d: string; when: string; go?: () => void }[] = [];
  if (unfinished) list.push({ icon: "ruler", t: `Finish ${unfinished.name}’s measurements`, d: `${unfinished.done.length} of 24 saved. Pick up where you left off.`, when: "Today", go: () => { set({ activeBody: unfinished.id }); go("wizard"); } });
  if (ready) list.push({ icon: "printer", t: `${ready.name} is ready to print`, d: `Drafted to ${ready.body}. Lay it out on your sheets when you’re ready.`, when: "Today", go: () => go("pattern", { id: ready.id }) });
  list.push({ icon: "dress", t: "New pre-made patterns", d: "A wrap dress and wide-leg trousers were added to the library.", when: "Yesterday", go: () => go("templates") });
  list.push({ icon: "pencil", t: "New: sketch on your photos", d: "Add a photo and draw your changes on top of it.", when: "This week" });
  return list;
}

function UpdatesButton() {
  const seen = useApp((s) => s.updatesSeen);
  const set = useApp((s) => s.set);
  const [open, setOpen] = useState(false);
  const list = useUpdates();
  return (
    <>
      <button onClick={() => { setOpen(true); set({ updatesSeen: true }); }} aria-label={seen ? "Updates" : "Updates, new"} className="tap relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#4f63e0]/15 bg-white text-[#4f63e0] shadow-[0_6px_16px_-10px_rgba(79,99,224,.6)]">
        <Icon name="bell" size={21} />
        {!seen && <span className="absolute right-[9px] top-[9px] h-2.5 w-2.5 rounded-full border-2 border-white bg-[#687ef5]" />}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-[22px] font-normal tracking-[-.02em]">Updates</h3><RB icon="close" size={38} onClick={() => setOpen(false)} /></div>
        <div className="flex flex-col gap-2">{list.map((u) => {
          const body = <><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/20 text-peri"><Icon name={u.icon} size={20} /></span>
            <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-3"><span className="text-[16px] font-medium">{u.t}</span><span className="shrink-0 text-[13px] text-white/45">{u.when}</span></span><span className="mt-0.5 block text-[15px] leading-snug text-white/60">{u.d}</span></span></>;
          return u.go
            ? <button key={u.t} onClick={() => { setOpen(false); u.go!(); }} className="card-soft tap flex items-start gap-3.5 rounded-[20px] p-4 text-left">{body}</button>
            : <div key={u.t} className="flex items-start gap-3.5 rounded-[20px] border border-white/8 p-4">{body}</div>;
        })}</div>
      </Sheet>
    </>
  );
}

// Home: the top keeps the Welcome sky (with a soft graph-paper grid fading down) and holds the one main job,
// starting a pattern, as two clear choices. Everything else sits below on the dark page.
export function Home() {
  const { go, user, bodies, patterns, newDraft, setDraft, startBody, set } = useApp();
  const name = user.guest ? "Guest" : user.name;
  const desk = useDesk();
  const make = () => { newDraft(); go("patSelectBody"); };
  return (
    <Screen noPad dock footer={desk ? undefined : <TabBar tab="home" />}>
      {/* the dark page sits behind the rounded corners, so nothing grey shows through */}
      <div className="bg-bg">
      <section className="home-hero light-hero relative px-5 pb-6 lg:px-12 lg:py-12">
        <div className="light-mat" aria-hidden />
        <div className="relative">
          <div className="flex h-12 items-center gap-3 pt-1">
            <span className="violet-panel grid h-11 w-11 shrink-0 place-items-center rounded-full text-[17px] font-medium">{name[0].toUpperCase()}</span>
            <div className="min-w-0 flex-1 leading-tight"><div className="text-[14px] text-[#3f4c80]">{greet()}</div><div className="truncate text-[17px] font-medium text-[#26335f]">{name}</div></div>
            <UpdatesButton />
          </div>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-12">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} className="h1 mt-8 !text-[36px] text-[#26335f] [text-wrap:balance] lg:mt-14 lg:!text-[60px]">What are we making today?</motion.h1>
              <p className="mt-2.5 max-w-[440px] text-[16px] leading-snug text-[#3f4c80] lg:text-[18px]">Design your own, or start from one of our pre‑made patterns.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-0 lg:gap-4">
              <button onClick={make} className="tap relative isolate flex min-h-[132px] flex-col justify-between overflow-hidden rounded-[24px] p-4 text-left text-white shadow-[0_18px_36px_-18px_rgba(28,34,82,.9)] lg:min-h-[170px] lg:p-6">
                <Crown className="-z-10" />
                <span className="relative flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-white/20"><Icon name="pencil" size={20} /></span><Icon name="chevR" size={20} className="text-white/85" /></span>
                <span className="relative"><span className="block text-[18px] font-medium leading-tight lg:text-[20px]">Design your own</span><span className="mt-1 block text-[14px] leading-snug text-white/85">Photo, sketch or words</span></span>
              </button>
              <button onClick={() => go("templates")} className="paper-card tap flex min-h-[132px] flex-col justify-between rounded-[24px] p-4 text-left lg:min-h-[170px] lg:p-6">
                <span className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#687ef5]/12 text-[#4f63e0]"><Icon name="dress" size={20} /></span><Icon name="chevR" size={20} className="text-[#4f63e0]/70" /></span>
                <span><span className="block text-[18px] font-medium leading-tight text-[#26335f] lg:text-[20px]">Use a pre‑made</span><span className="mt-1 block text-[14px] leading-snug text-[#3f4c80]">Ready-to-fit patterns</span></span>
              </button>
            </div>
          </div>
        </div>
      </section>
      </div>

      <div className="px-6 lg:px-0">
        <Notices />
        <div className="lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-12">
          <div>
            <div className="mt-7"><SectionHead title="Your bodies" onAll={() => go("bodies")} /></div>
            <div className="noscroll -mx-6 mt-3 flex gap-2.5 overflow-x-auto px-6 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
              <button onClick={() => startBody()} aria-label="New body" className="tap grid h-[76px] w-[64px] shrink-0 place-items-center rounded-[20px] border border-dashed border-white/30 text-white/80 hover:border-white/60 lg:w-auto lg:grid-cols-[auto_auto] lg:justify-center lg:gap-2 lg:text-[15px] lg:font-medium">
                <Icon name="plus" size={22} /><span className="hidden lg:inline">New body</span>
              </button>
              {bodies.map((b) => (
                <button key={b.id} onClick={() => { set({ activeBody: b.id }); go("preview"); }} className="card-soft tap flex h-[76px] shrink-0 items-center gap-3 rounded-[20px] pl-2 pr-4 text-left">
                  <span className="grid h-[60px] w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-primary/20"><BodyFigure sex={b.sex} width={20} glow={false} className="h-[52px] w-full" /></span>
                  <span className="min-w-0"><span className="block truncate text-[15px] font-medium">{b.name}</span><span className="block whitespace-nowrap text-[13px] text-white/55">{b.done.length} of 24 measurements</span></span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mt-7"><SectionHead title="Your patterns" onAll={() => go("patterns")} /></div>
            <div className="mt-2 flex flex-col">
              {patterns.slice(0, 3).map((p) => (
                <button key={p.id} onClick={() => go("pattern", { id: p.id })} className="tap flex items-center gap-3.5 border-b border-white/8 py-3 text-left last:border-0">
                  <span className="card-soft grid h-[52px] w-[48px] shrink-0 place-items-center rounded-[14px]"><Flat g={p.garment as GarmentKey} size={32} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[16px] font-medium">{p.name}</span><span className="block truncate text-[14px] text-white/55">{p.body}</span></span>
                  <span className="flex items-center gap-1.5 text-[14px] text-white/70"><span className={cx("h-2 w-2 rounded-full", STATUS_DOT[p.status])} />{p.status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => go("templates")} className="card-soft tap mt-5 flex w-full items-center gap-3 rounded-[22px] p-3 text-left lg:mt-8 lg:p-4">
          <div className="flex shrink-0 -space-x-3"><span className="grid h-12 w-11 place-items-center rounded-[14px] bg-[#2b3266]"><Flat g="slip" size={30} /></span><span className="grid h-12 w-11 place-items-center rounded-[14px] bg-[#343c63]"><Flat g="tee" size={30} /></span></div>
          <div className="flex-1"><div className="text-[16px] font-medium">Pre-made patterns</div><div className="text-[14px] text-white/55">10 patterns, ready to fit to a body</div></div>
          <Icon name="chevR" size={18} className="text-white/50" />
        </button>
        <div className="h-4" />
      </div>
    </Screen>
  );
}

export function Bodies() {
  const { go, bodies, set, newBody, newDraft, startBody } = useApp();
  const [f, setF] = useState("All");
  const list = bodies.filter((b) => f === "All" || (f === "Me" ? b.name.toLowerCase().startsWith("me") : f === "Family" ? ["mum", "sister", "tom", "dad"].some((x) => b.name.toLowerCase().includes(x)) : b.name.toLowerCase().includes("client")));
  const desk = useDesk();
  return (
    <Screen dock footer={desk ? undefined : <TabBar tab="bodies" />}>
      <div className="flex h-12 items-center"><Eyebrow>Library</Eyebrow><span className="flex-1" /><RB icon="search" /></div>
      <H1 className="mt-3">Body library</H1>
      <div className="mt-4 flex gap-2">{["All", "Me", "Family", "Clients"].map((c) => <Chip key={c} on={f === c} onClick={() => setF(c)}>{c}</Chip>)}</div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-7 lg:grid-cols-4 lg:gap-5">
        {list.map((b, i) => (
          <Glow key={b.id} as="button" color={i % 2 ? "#4d5e85" : "#687ef5"} variant="fade" onClick={() => { set({ activeBody: b.id }); go("preview"); }} className="relative h-[230px] rounded-[26px] p-4 lg:h-[320px] lg:p-5">
            {b.done.length < 24 && <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2 py-1 text-[9px] font-semibold">Incomplete</span>}
            <div className="flex h-[150px] justify-center lg:h-[230px]"><BodyFigure sex={b.sex} width={desk ? 90 : 62} variant="solid" glow={false} /></div>
            <div className="absolute bottom-4 left-4 right-4"><div className="text-[14px] font-semibold">{b.name}</div><div className="flex items-baseline gap-2"><span className="serif text-[26px]">{b.done.length}/24</span><span className="eyebrow">Measures</span></div></div>
          </Glow>
        ))}
        <button onClick={() => { startBody(); }} className="tap flex h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/25 lg:h-[320px]">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Icon name="plus" size={24} /></span>
          <span className="mt-3 text-[15px] font-semibold">New body</span><span className="text-[11px] text-white/50">4 measures to start</span>
        </button>
      </div>
      <button className="mt-4 hidden" onClick={() => newDraft()} />
    </Screen>
  );
}

export function Patterns() {
  const { go, patterns, setDraft } = useApp();
  const [f, setF] = useState("All");
  const list = patterns.filter((p) => f === "All" || (f === "Printed" ? p.status === "Printed" : p.status !== "Printed"));
  const desk = useDesk();
  return (
    <Screen dock footer={desk ? undefined : <TabBar tab="patterns" />}>
      <div className="flex h-12 items-center"><Eyebrow>Library</Eyebrow><span className="flex-1" /><RB icon="search" /></div>
      <H1 className="mt-3">Pattern library</H1>
      <div className="mt-4 flex h-11 rounded-full glass p-1 lg:max-w-[420px]">{["All", "In progress", "Printed"].map((c) => <button key={c} onClick={() => setF(c)} className={cx("flex-1 rounded-full text-[14px] font-medium", f === c ? "bg-white text-bg" : "text-white/70")}>{c}</button>)}</div>
      <div className="mt-4 flex flex-col gap-2.5 lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-4">
        {list.map((p) => (
          <Glass key={p.id} onClick={() => go("pattern", { id: p.id })} className="flex w-full items-center gap-3 rounded-[22px] p-3 lg:gap-5 lg:rounded-[26px] lg:p-5">
            <div className="grid h-[60px] w-[52px] lg:h-[96px] lg:w-[84px] place-items-center rounded-[14px] bg-primary/35"><Flat g={p.garment as GarmentKey} size={38} /></div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold">{p.name}</div><div className="text-[13px] text-white/50">{p.body}</div>
              <span className={cx("mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold", p.status === "Printed" ? "bg-primary/25 text-white" : "bg-white/10 text-white/70")}><span className="h-1.5 w-1.5 rounded-full bg-current" />{p.status}</span>
            </div>
            <div className="text-right"><div className="serif text-[28px] leading-none">{String(p.pieces).padStart(2, "0")}</div><div className="eyebrow">Pcs</div></div>
          </Glass>
        ))}
      </div>
    </Screen>
  );
}

export function You() {
  const { user, units, experience, set, reset, bodies, patterns, go } = useApp();
  const [confirm, setConfirm] = useState(false);
  const kiosk = useApp((s) => s.kiosk);
  const { toast, node } = useToast();
  const desk = useDesk();
  return (
    <Screen dock footer={desk ? undefined : <TabBar tab="you" />}>
      <div className="flex h-12 items-center"><Eyebrow>Profile</Eyebrow></div>
      <div className="lg:mt-4 lg:grid lg:grid-cols-2 lg:gap-12"><div>
      <div className="mt-3 flex items-center gap-4">
        <Glow color="#687ef5" variant="orb" className="grid h-[72px] w-[72px] place-items-center rounded-[22px]"><span className="serif text-[34px]">{(user.guest ? "G" : user.name[0]).toUpperCase()}</span></Glow>
        <div><div className="text-[22px] font-normal">{user.guest ? "Guest" : user.name}</div><div className="text-[14px] text-white/55">{user.email || "Exploring as a guest"}</div></div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">{[["Bodies", bodies.length], ["Patterns", patterns.length], ["Printed", patterns.filter((p) => p.status === "Printed").length]].map(([l, n]) => (
        <Glass key={l as string} className="rounded-[18px] p-3 lg:p-5"><div className="serif text-[30px] leading-none lg:text-[48px]">{String(n).padStart(2, "0")}</div><div className="eyebrow mt-2">{l}</div></Glass>
      ))}</div>
      </div><div>
      <Eyebrow className="mt-6 text-white/40 lg:mt-3">Settings</Eyebrow>
      <Glass className="mt-2.5 divide-y divide-white/8 rounded-[22px]">
        <div className="flex items-center justify-between px-4 py-3.5"><span className="text-[15px]">Units</span><div className="flex rounded-full bg-white/8 p-1">{(["cm", "in"] as const).map((u) => <button key={u} onClick={() => set({ units: u })} className={cx("h-8 w-12 rounded-full text-[14px] font-medium", units === u ? "bg-white text-bg" : "text-white/60")}>{u}</button>)}</div></div>
        <div className="flex items-center justify-between gap-3 px-4 py-3.5"><span className="text-[15px]">Sewing experience</span><select value={experience ?? ""} onChange={(e) => set({ experience: e.target.value === "" ? null : Number(e.target.value), prefsDone: e.target.value !== "" })} className="rounded-full bg-white/8 px-3 py-1.5 text-[14px] outline-none"><option value="" disabled>Choose</option><option value="0">New to sewing</option><option value="1">Made a few things</option><option value="2">Professional</option></select></div>
        <div className="flex items-center justify-between px-4 py-3.5"><span className="text-[15px]">App tour</span><button onClick={() => go("onboarding", { from: "app" })} className="text-[14px] font-medium text-peri">Play</button></div>
        <div className="flex items-center justify-between px-4 py-3.5"><div><div className="text-[15px]">Expo mode</div><div className="text-[11px] text-white/45">Reset after 2 minutes idle</div></div><Toggle on={kiosk} onChange={(v) => { set({ kiosk: v }); toast(v ? "Expo mode on" : "Expo mode off"); }} /></div>
      </Glass>
      <Pill variant="glass" className="mt-5" icon={<Icon name="refresh" size={18} />} onClick={() => setConfirm(true)}>Reset for the next visitor</Pill>
      <p className="mt-3 text-center text-[11px] text-white/35">Tip: press and hold the top-left corner for 2 seconds to reset from anywhere.</p>
      </div></div>
      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <h3 className="text-[22px] font-normal">Start fresh?</h3>
        <p className="mt-2 text-[15px] text-white/60">This clears this visitor’s bodies and patterns and goes back to the start.</p>
        <Pill className="mt-5" onClick={() => { setConfirm(false); reset(); }}>Reset Venty</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setConfirm(false)}>Cancel</Pill>
      </Sheet>
      {node}
      <motion.div />
    </Screen>
  );
}


// A finished (or in-progress) pattern, as a complete page you can come back to: the garment on the body,
// where it stands, and a shopping list you can show at the fabric shop.
export function PatternView({ p }: { p?: Record<string, unknown> }) {
  const { go, patterns, bodies, set, newDraft } = useApp();
  const pat = patterns.find((x) => x.id === p?.id) ?? patterns[0];
  const desk = useDesk();
  if (!pat) return null;
  const body = bodies.find((b) => b.name === pat.body);
  const sp: NonNullable<Pattern["spec"]> = pat.spec ?? SEED_PATTERNS.find((x) => x.id === pat.id)?.spec ?? { ease: 4, drape: 0.6, seam: 1.5, printer: "A4" as const, metres: metresFor(pat.garment, 4) };
  const tip = fabricAdvice(sp.ease);
  const stretch = sp.stretch ?? tip.stretch;
  const shop: [string, string][] = [
    ["Fabric to buy", `${sp.metres} metres, 140 cm wide`],
    ["Stretch", { "A lot": "Stretchy", "A bit": "A little stretch", No: "No stretch" }[stretch as "A lot" | "A bit" | "No"] ?? stretch],
    ...(sp.fabric ? [["Fabric you chose", sp.fabric] as [string, string]] : []),
  ];
  const made: [string, string][] = [
    ["Fit", `${fitName(sp.ease)}, +${sp.ease} cm of room`],
    ["Seam allowance", sp.seam ? `${sp.seam} cm, on every piece` : "Not added, add your own"],
    ["Pieces", String(pat.pieces)],
    ["Paper", sp.printer === "A0" ? "1 A0 sheet, print shop" : `${sp.sheets ?? 9} A4 sheets, at home`],
    ...(sp.details ?? []).slice(0, 4),
  ];
  const open = (to: string) => { if (body) set({ activeBody: body.id }); newDraft({ garment: pat.garment, ease: sp.ease, seam: sp.seam, printer: sp.printer, drape: sp.drape, ...(sp.fabric ? { fabric: sp.fabric } : {}), ...(sp.stretch ? { stretch: sp.stretch as "No" | "A bit" | "A lot" } : {}), chosen: { fit: true, fabric: !!sp.fabric, stretch: !!sp.stretch }, details: sp.details }); go(to); };
  const list = (title: string, rows: [string, string][]) => (
    <div className="card-soft mt-3 rounded-[24px] px-5 pb-1 pt-4">
      <div className="text-[15px] font-medium text-white/85">{title}</div>
      <div className="mt-1 divide-y divide-white/8">{rows.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-4 py-3"><span className="text-[15px] text-white/60">{k}</span><span className="text-right text-[16px]">{v}</span></div>)}</div>
    </div>
  );
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => open("garment")}>Change the design</Pill><Pill className="flex-1" onClick={() => open("printMethod")}>{pat.status === "Printed" ? "Print again" : "Print it"}</Pill></div>}>
      <TopBar left="back" />
      <Split cols="lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" left={<>
        <div className="mt-2 flex items-center gap-2 text-[15px] text-white/70 lg:mt-0"><span className={cx("h-2 w-2 rounded-full", STATUS_DOT[pat.status])} />{pat.status === "Printed" ? "Printed" : pat.status === "Fitting" ? "Ready to print" : "Draft"} · drafted to {pat.body}</div>
        <H1 className="mt-2">{pat.name}</H1>
        <div className="relative mt-4 h-[min(300px,34dvh)] overflow-hidden rounded-[28px] py-4 lg:h-[min(560px,62dvh)] lg:rounded-[36px]">
          <Crown />
          <BodyFigure sex={body?.sex ?? "female"} width={desk ? 200 : 130} variant="solid" garment={pat.garment} glow={false} className="relative h-full w-full" />
        </div>
      </>} right={<>
        {list("Shopping list", shop)}
        <p className="mt-2 px-1 text-[14px] leading-snug text-white/50">{tip.why}</p>
        {list("How it was made", made)}
      </>} />
    </Screen>
  );
}
