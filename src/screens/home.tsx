"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "@/lib/store";
import type { GarmentKey } from "@/lib/data";
import { Screen, Eyebrow, H1, Pill, Glow, Glass, Chip, RB, Sheet, Toggle, cx, useToast, useDesk , FX } from "@/components/ui";
import { BodyFigure, Flat } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";

// Phone navigation: a light bar (the same family as the home hero) with one raised Create button in a notch.
// Create is the one action that matters most, so it is the only thing that sits above the bar.
function TabBar({ tab }: { tab: "home" | "bodies" | "patterns" | "you" }) {
  const { replace } = useApp();
  const [open, setOpen] = useState(false);
  const items: [typeof tab, IconName, string][] = [["home", "home", "Home"], ["bodies", "body", "Bodies"], ["patterns", "scissors", "Patterns"], ["you", "user", "You"]];
  const btn = ([k, ic, l]: (typeof items)[number]) => (
    <button key={k} onClick={() => replace(k)} aria-current={tab === k ? "page" : undefined} className={cx("flex h-full flex-1 flex-col items-center justify-center gap-1 text-[12px] font-medium transition-colors", tab === k ? "text-ink" : "text-ink/45")}>
      <Icon name={ic} size={22} strokeWidth={tab === k ? 2.1 : 1.7} />{l}
    </button>
  );
  return (
    <>
      <div className="relative mt-3">
        <nav className="tabbar flex h-[68px] items-stretch rounded-[26px] px-1.5">
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
        {row("scissors", "Make a pattern", "Photo, link, sketch or style", "#687ef5", () => { newDraft(); go("patSelectBody"); })}
        {row("dress", "Choose a pre-made pattern", "Dresses, tops, pants, skirts", "#4f63e0", () => go("templates"))}
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
        <Glass onClick={() => { set({ activeBody: b.id }); go("wizard"); }} className="flex w-full items-center gap-3.5 rounded-[22px] border-primary/70 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/25 text-peri"><Icon name="ruler" size={22} /></span>
          <div className="min-w-0 flex-1"><div className="text-[16px] font-medium">Continue finishing your measurements</div><div className="text-[14px] text-white/55">{b.name} · {b.done.length} of 24 saved</div>
            <div className="mt-2 flex gap-[2px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("h-1 flex-1 rounded-full", i < b.done.length ? "bg-primary" : "bg-white/15")} />)}</div></div>
          <Icon name="chevR" size={18} className="text-white/50" />
        </Glass>
      )}
      {tourSkipped && (
        <div className="relative flex items-center gap-3.5 rounded-[22px] border border-white/12 bg-white/[.04] p-4">
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

// Home: a coloured hero on top holds the one main job (start a pattern, from any source);
// everything else sits below it on the dark page: bodies, recent patterns, templates.
export function Home() {
  const { go, user, bodies, patterns, newDraft, setDraft, startBody, set } = useApp();
  const body = useApp((s) => s.body());
  const name = user.guest ? "Guest" : user.name;
  const desk = useDesk();
  const startFrom = (start?: "link" | "sketch") => { newDraft(start ? { start } : undefined); go("patSelectBody"); };
  const actions: [IconName, string, () => void][] = [
    ["image", "Photo", () => startFrom()],
    ["link", "Link", () => startFrom("link")],
    ["pencil", "Sketch", () => startFrom("sketch")],
    ["dress", "Pre-made", () => go("templates")],
  ];
  return (
    <Screen noPad footer={desk ? undefined : <TabBar tab="home" />}>
      <section className="home-hero relative overflow-hidden px-5 pb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-12 lg:px-12 lg:py-11">
        <div>
          <div className="flex h-12 items-center gap-3 pt-1">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-[17px] font-medium text-white">{name[0].toUpperCase()}</span>
            <div className="min-w-0 flex-1 leading-tight"><div className="text-[13px] text-ink/60">{greet()}</div><div className="truncate text-[17px] font-medium">{name}</div></div>
            <button onClick={() => go("templates")} aria-label="Search templates" className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white lg:hidden"><Icon name="search" size={20} /></button>
          </div>
          <h1 className="h1 mt-6 !text-[34px] text-[#252c66] lg:mt-10 lg:!text-[56px]">What are we<br className="lg:hidden" /> making?</h1>
          <p className="mt-2 max-w-[420px] text-[16px] leading-snug text-[#252c66]/75 lg:text-[18px]">Start from any look you love. We draft it to {body.name || "your body"}.</p>
        </div>
        <div className="hero-card mt-5 grid grid-cols-4 gap-2 rounded-[28px] p-3 lg:mt-0 lg:gap-3 lg:p-4">
          {actions.map(([ic, l, fn]) => (
            <button key={l} onClick={fn} className="tap group flex flex-col items-center gap-2 rounded-[20px] py-2 lg:py-4">
              <span className="herotile grid h-[56px] w-[56px] place-items-center rounded-[18px] text-white transition-transform group-hover:-translate-y-0.5 lg:h-[76px] lg:w-[76px] lg:rounded-[24px]"><Icon name={ic} size={24} /></span>
              <span className="text-[14px] font-medium text-[#252c66] lg:text-[15px]">{l}</span>
            </button>
          ))}
        </div>
      </section>

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
                <Glass key={b.id} onClick={() => { set({ activeBody: b.id }); go("preview"); }} className="flex h-[76px] shrink-0 items-center gap-3 rounded-[20px] pl-2 pr-4">
                  <span className="grid h-[60px] w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-primary/20"><BodyFigure sex={b.sex} width={20} glow={false} className="h-[52px] w-full" /></span>
                  <span className="min-w-0"><span className="block truncate text-[15px] font-medium">{b.name}</span><span className="block whitespace-nowrap text-[13px] text-white/50">{b.done.length} of 24 measurements</span></span>
                </Glass>
              ))}
            </div>
          </div>
          <div>
            <div className="mt-7"><SectionHead title="Your patterns" onAll={() => go("patterns")} /></div>
            <div className="mt-2 flex flex-col">
              {patterns.slice(0, 3).map((p) => (
                <button key={p.id} onClick={() => { setDraft({ garment: p.garment as GarmentKey }); go("garment"); }} className="tap flex items-center gap-3.5 border-b border-white/8 py-3 text-left last:border-0">
                  <span className="grid h-[52px] w-[48px] shrink-0 place-items-center rounded-[14px] border border-white/10 bg-white/[.06]"><Flat g={p.garment as GarmentKey} size={32} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[16px] font-medium">{p.name}</span><span className="block truncate text-[14px] text-white/50">{p.body}</span></span>
                  <span className="flex items-center gap-1.5 text-[14px] text-white/70"><span className={cx("h-2 w-2 rounded-full", STATUS_DOT[p.status])} />{p.status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Glass onClick={() => go("templates")} className="mt-5 flex w-full items-center gap-3 rounded-[22px] p-3 lg:mt-8 lg:p-4">
          <div className="flex shrink-0 -space-x-3"><span className="grid h-12 w-11 place-items-center rounded-[14px] bg-primary/25"><Flat g="slip" size={30} /></span><span className="grid h-12 w-11 place-items-center rounded-[14px] bg-denim/60"><Flat g="tee" size={30} /></span></div>
          <div className="flex-1"><div className="text-[16px] font-medium">Pre-made patterns</div><div className="text-[14px] text-white/55">10 patterns, ready to fit to a body</div></div>
          <Icon name="chevR" size={18} className="text-white/50" />
        </Glass>
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
    <Screen footer={desk ? undefined : <TabBar tab="bodies" />}>
      <div className="flex h-12 items-center"><Eyebrow>Library</Eyebrow><span className="flex-1" /><RB icon="search" /></div>
      <div className="mt-3 flex items-baseline justify-between"><H1>Body library</H1><span className="serif text-[36px]">{String(bodies.length).padStart(2, "0")}</span></div>
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
    <Screen footer={desk ? undefined : <TabBar tab="patterns" />}>
      <div className="flex h-12 items-center"><Eyebrow>Library</Eyebrow><span className="flex-1" /><RB icon="search" /></div>
      <div className="mt-3 flex items-baseline justify-between"><H1>Pattern library</H1><span className="serif text-[36px]">{String(patterns.length).padStart(2, "0")}</span></div>
      <div className="mt-4 flex h-11 rounded-full glass p-1 lg:max-w-[420px]">{["All", "In progress", "Printed"].map((c) => <button key={c} onClick={() => setF(c)} className={cx("flex-1 rounded-full text-[14px] font-medium", f === c ? "bg-white text-bg" : "text-white/70")}>{c}</button>)}</div>
      <div className="mt-4 flex flex-col gap-2.5 lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-4">
        {list.map((p) => (
          <Glass key={p.id} onClick={() => { setDraft({ garment: p.garment as GarmentKey }); go("garment"); }} className="flex w-full items-center gap-3 rounded-[22px] p-3 lg:gap-5 lg:rounded-[26px] lg:p-5">
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
    <Screen footer={desk ? undefined : <TabBar tab="you" />}>
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

