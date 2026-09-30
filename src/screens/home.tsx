"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "@/lib/store";
import type { GarmentKey } from "@/lib/data";
import { Screen, Eyebrow, H1, Pill, Glow, Glass, Chip, RB, Sheet, Toggle, cx, useToast, useDesk , FX } from "@/components/ui";
import { BodyFigure, Flat } from "@/components/art";
import { Icon, type IconName } from "@/components/icons";

function TabBar({ tab }: { tab: "home" | "bodies" | "patterns" | "you" }) {
  const { replace } = useApp();
  const [open, setOpen] = useState(false);
  const items: [typeof tab, IconName, string][] = [["home", "home", "Home"], ["bodies", "body", "Bodies"], ["patterns", "scissors", "Patterns"], ["you", "user", "You"]];
  const btn = ([k, ic, l]: (typeof items)[number]) => (
    <button key={k} onClick={() => replace(k)} className={cx("flex w-14 flex-col items-center gap-1 text-[10px]", tab === k ? "text-white" : "text-white/45")}>
      <Icon name={ic} size={21} />{l}
    </button>
  );
  return (
    <>
      <div className="glass-2 flex h-[68px] items-center justify-between rounded-[28px] px-3">
        {items.slice(0, 2).map(btn)}
        <button onClick={() => setOpen(true)} aria-label="Create" className="tap grid h-12 w-[72px] place-items-center rounded-full bg-primary shadow-[0_8px_30px_rgba(104,126,245,.55)]"><Icon name="plus" size={24} /></button>
        {items.slice(2).map(btn)}
      </div>
      <CreateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { go, newBody, newDraft } = useApp();
  const row = (ic: IconName, t: string, d: string, color: string, fn: () => void) => (
    <Glow as="button" color={color} variant="side" onClick={() => { onClose(); fn(); }} className="flex w-full items-center gap-4 rounded-[24px] p-5">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><Icon name={ic} size={22} /></span>
      <span className="flex-1"><span className="block text-[17px] font-semibold">{t}</span><span className="block text-[12px] text-white/60">{d}</span></span>
      <Icon name="chevR" size={20} />
    </Glow>
  );
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between"><span className="text-[20px] font-semibold">Create</span><RB icon="close" size={38} onClick={onClose} /></div>
      <div className="flex flex-col gap-2.5">
        {row("scissors", "Make a pattern", "Photo, link, sketch or style", "#687ef5", () => { newDraft(); go("patSelectBody"); })}
        {row("dress", "Start from a template", "Dresses, tops, pants, skirts", "#4f63e0", () => go("templates"))}
        {row("body", "Make a body", "Measure yourself or someone you sew for", "#4d5e85", () => { newBody(); go("gender"); })}
      </div>
    </Sheet>
  );
}

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

export function Home() {
  const { go, user, bodies, patterns, newDraft, newBody, setDraft } = useApp();
  const last = patterns[0];
  const desk = useDesk();
  if (desk) return (
    <Screen>
      <div className="flex h-12 items-center gap-3">
        <span className="eyebrow">{greet()}, {user.guest ? "guest" : user.name}</span>
        <span className="flex-1" /><RB icon="search" onClick={() => go("templates")} />
      </div>
      <H1 className="mt-3">What are we making?</H1>
      <div className="mt-7 grid grid-cols-3 gap-5">
        <Glow color="#687ef5" variant="edge" onClick={() => { newDraft(); go("patSelectBody"); }} className="group relative col-span-2 row-span-2 h-[360px] rounded-[32px] p-8">
          <FX kind="aurora" />
          <Eyebrow className="text-[11px] text-white/70">Start here</Eyebrow>
          <div className="mt-3 text-[40px] font-semibold tracking-tight">Make a pattern</div>
          <div className="mt-2 max-w-[300px] text-[16px] leading-snug text-white/70">From a photo, a link, a sketch or a style. Drafted to your body.</div>
          <div className="absolute bottom-8 left-8 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-white text-bg"><Icon name="upload" size={22} /></span><span className="eyebrow text-[11px] text-white/80">Photo · Link · Sketch · Voice</span></div>
          <div className="absolute bottom-3 right-16 opacity-95"><BodyFigure width={118} variant="solid" garment="flutter" glow={false} dim={0.7} /></div>
        </Glow>
        <Glass onClick={() => { newBody(); go("gender"); }} className="relative h-[170px] rounded-[28px] p-6">
          <div className="text-[20px] font-semibold">Make a body</div><div className="mt-1 text-[13px] text-white/55">Measure yourself or someone new</div>
          <span className="absolute bottom-6 right-6 grid h-10 w-10 place-items-center rounded-full bg-white/10"><Icon name="plus" size={20} /></span>
        </Glass>
        <Glass onClick={() => go("templates")} className="relative h-[170px] rounded-[28px] p-6">
          <div className="text-[20px] font-semibold">Templates</div><div className="mt-1 text-[13px] text-white/55">10 styles, ready to fit</div>
          <div className="absolute bottom-3 right-5 flex gap-1 opacity-90"><Flat g="slip" size={44} /><Flat g="tee" size={44} /><Flat g="wideleg" size={44} /></div>
        </Glass>
      </div>
      <Eyebrow className="mt-9 text-[10px] text-white/40">Your library</Eyebrow>
      <div className="mt-3 grid grid-cols-3 gap-5">
        <Glow color="#4d5e85" variant="fade" onClick={() => go("bodies")} className="group relative min-h-[220px] rounded-[28px] p-6">
          <FX kind="tide" />
          <span className="serif text-[56px] leading-none">{String(bodies.length).padStart(2, "0")}</span>
          <div className="absolute right-5 top-5 flex -space-x-2 opacity-90">{bodies.slice(0, 3).map((b) => <BodyFigure key={b.id} sex={b.sex} width={34} glow={false} />)}</div>
          <div className="absolute bottom-6 left-6"><div className="text-[17px] font-semibold">Body library</div><div className="eyebrow text-[10px]">Bodies</div></div>
        </Glow>
        <Glow color="#687ef5" variant="fade" onClick={() => go("patterns")} className="group relative min-h-[220px] rounded-[28px] p-6">
          <FX kind="orbit" />
          <span className="serif text-[56px] leading-none">{String(patterns.length).padStart(2, "0")}</span>
          <div className="absolute right-5 top-4"><Flat g="flutter" size={80} /></div>
          <div className="absolute bottom-6 left-6"><div className="text-[17px] font-semibold">Pattern library</div><div className="eyebrow text-[10px]">Patterns</div></div>
        </Glow>
        <Glass className="group relative isolate min-h-[220px] overflow-hidden rounded-[28px] p-6">
          <FX kind="sheen" />
          <Eyebrow className="text-[10px] text-white/40">Continue</Eyebrow>
          <div className="mt-3 flex flex-col gap-2">{patterns.slice(0, 3).map((p) => (
            <button key={p.id} onClick={() => { setDraft({ garment: p.garment as GarmentKey }); go("garment"); }} className="tap flex items-center gap-3 rounded-[14px] p-1.5 text-left hover:bg-white/5">
              <div className="grid h-11 w-10 place-items-center rounded-[10px] bg-primary/30"><Flat g={p.garment as GarmentKey} size={28} /></div>
              <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold">{p.name}</div><div className="text-[11px] text-white/50">{p.status} · {p.body}</div></div>
              <Icon name="chevR" size={16} className="text-white/40" />
            </button>
          ))}</div>
        </Glass>
      </div>
      <div className="h-20" />
    </Screen>
  );
  return (
    <Screen footer={desk ? undefined : <TabBar tab="home" />}>
      <div className="flex h-12 items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-[15px] font-semibold">{(user.guest ? "G" : user.name[0]).toUpperCase()}</span>
        <span className="eyebrow">{greet()}, {user.guest ? "guest" : user.name}</span>
        <span className="flex-1" /><RB icon="search" onClick={() => go("templates")} />
      </div>
      <H1 className="mt-4">What are we making?</H1>
      <Glow as="button" color="#687ef5" variant="edge" onClick={() => { newDraft(); go("patSelectBody"); }} className="group relative mt-5 block h-[184px] w-full rounded-[28px] p-5">
        <FX kind="aurora" />
        <Eyebrow className="text-[10px] text-white/70">Start here</Eyebrow>
        <div className="mt-2 text-[26px] font-semibold">Make a pattern</div>
        <div className="mt-1 max-w-[180px] text-[13px] leading-snug text-white/70">From a photo, a link, a sketch or a style.</div>
        <div className="absolute bottom-5 left-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-bg"><Icon name="upload" size={20} /></span><span className="eyebrow text-[10px] text-white/80">Photo · Link · Sketch</span></div>
        <div className="absolute bottom-0 right-3 opacity-90"><BodyFigure width={92} variant="solid" garment="flutter" glow={false} dim={0.5} /></div>
      </Glow>
      <Glass onClick={() => { newBody(); go("gender"); }} className="mt-3 flex h-[84px] w-full items-center gap-3 rounded-[24px] px-4">
        <div className="flex-1"><div className="text-[16px] font-semibold">Make a body</div><div className="text-[12px] text-white/55">Measure yourself or someone new</div></div>
        <Icon name="plus" size={22} />
      </Glass>
      <Eyebrow className="mt-5 text-[10px] text-white/40">Your library</Eyebrow>
      <div className="mt-2.5 grid grid-cols-2 gap-3">
        <Glow as="button" color="#4d5e85" variant="fade" onClick={() => go("bodies")} className="group relative h-[140px] rounded-[24px] p-4">
          <FX kind="tide" />
          <span className="serif text-[40px] leading-none">{String(bodies.length).padStart(2, "0")}</span>
          <div className="absolute right-3 top-3 flex -space-x-2 opacity-90">{bodies.slice(0, 3).map((b) => <BodyFigure key={b.id} sex={b.sex} width={24} glow={false} />)}</div>
          <div className="absolute bottom-4 left-4"><div className="text-[14px] font-semibold">Body library</div><div className="eyebrow text-[9px]">Bodies</div></div>
        </Glow>
        <Glow as="button" color="#687ef5" variant="fade" onClick={() => go("patterns")} className="group relative h-[140px] rounded-[24px] p-4">
          <FX kind="orbit" />
          <span className="serif text-[40px] leading-none">{String(patterns.length).padStart(2, "0")}</span>
          <div className="absolute right-3 top-2"><Flat g="flutter" size={56} /></div>
          <div className="absolute bottom-4 left-4"><div className="text-[14px] font-semibold">Pattern library</div><div className="eyebrow text-[9px]">Patterns</div></div>
        </Glow>
      </div>
      <Glass onClick={() => go("templates")} className="mt-3 flex w-full items-center gap-3 rounded-[22px] p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/8"><Flat g="slip" size={34} /></div>
        <div className="flex-1"><div className="text-[14px] font-semibold">Templates</div><div className="text-[12px] text-white/55">10 styles, ready to fit</div></div>
        <Icon name="chevR" size={18} className="text-white/50" />
      </Glass>
      {last && (
        <>
          <Eyebrow className="mt-5 text-[10px] text-white/40">Continue</Eyebrow>
          <Glass onClick={() => { useApp.getState().setDraft({ garment: last.garment as GarmentKey }); go("garment"); }} className="nofx group mt-2.5 flex w-full items-center gap-3 rounded-[22px] p-3">
            <FX kind="sheen" />
            <div className="grid h-14 w-12 place-items-center rounded-[12px] bg-primary/30"><Flat g={last.garment as GarmentKey} size={34} /></div>
            <div className="flex-1"><div className="text-[14px] font-semibold">{last.name}</div><div className="text-[12px] text-white/55">{last.status} · {last.body}</div>
              <div className="mt-1.5 flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={cx("h-1 w-6 rounded-full", i < (last.status === "Printed" ? 4 : last.status === "Fitting" ? 3 : 1) ? "bg-primary" : "bg-white/15")} />)}</div></div>
            <Icon name="chevR" size={18} className="text-white/50" />
          </Glass>
        </>
      )}
    </Screen>
  );
}

export function Bodies() {
  const { go, bodies, set, newBody, newDraft } = useApp();
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
            {b.done.length < 24 && b.done.length <= 4 && <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.06em]">Incomplete</span>}
            <div className="flex h-[150px] justify-center lg:h-[230px]"><BodyFigure sex={b.sex} width={desk ? 90 : 62} variant="solid" glow={false} /></div>
            <div className="absolute bottom-4 left-4 right-4"><div className="text-[13px] font-semibold">{b.name}</div><div className="flex items-baseline gap-2"><span className="serif text-[26px]">{Math.max(4, b.done.length)}/24</span><span className="eyebrow text-[8px]">Measures</span></div></div>
          </Glow>
        ))}
        <button onClick={() => { newBody(); go("gender"); }} className="tap flex h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/25 lg:h-[320px]">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Icon name="plus" size={24} /></span>
          <span className="mt-3 text-[14px] font-semibold">New body</span><span className="text-[11px] text-white/50">4 measures to start</span>
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
      <div className="mt-4 flex h-11 rounded-full glass p-1 lg:max-w-[420px]">{["All", "In progress", "Printed"].map((c) => <button key={c} onClick={() => setF(c)} className={cx("flex-1 rounded-full text-[13px] font-medium", f === c ? "bg-white text-bg" : "text-white/70")}>{c}</button>)}</div>
      <div className="mt-4 flex flex-col gap-2.5 lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-4">
        {list.map((p) => (
          <Glass key={p.id} onClick={() => { setDraft({ garment: p.garment as GarmentKey }); go("garment"); }} className="flex w-full items-center gap-3 rounded-[22px] p-3 lg:gap-5 lg:rounded-[26px] lg:p-5">
            <div className="grid h-[60px] w-[52px] lg:h-[96px] lg:w-[84px] place-items-center rounded-[14px] bg-primary/35"><Flat g={p.garment as GarmentKey} size={38} /></div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold">{p.name}</div><div className="text-[12px] text-white/50">{p.body}</div>
              <span className={cx("mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.06em]", p.status === "Printed" ? "bg-primary/25 text-white" : "bg-white/10 text-white/70")}><span className="h-1.5 w-1.5 rounded-full bg-current" />{p.status}</span>
            </div>
            <div className="text-right"><div className="serif text-[28px] leading-none">{String(p.pieces).padStart(2, "0")}</div><div className="eyebrow text-[8px]">Pcs</div></div>
          </Glass>
        ))}
      </div>
    </Screen>
  );
}

export function You() {
  const { user, units, set, reset, bodies, patterns, replace } = useApp();
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
        <div><div className="text-[22px] font-semibold">{user.guest ? "Guest" : user.name}</div><div className="text-[13px] text-white/55">{user.email || "Exploring as a guest"}</div></div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">{[["Bodies", bodies.length], ["Patterns", patterns.length], ["Printed", patterns.filter((p) => p.status === "Printed").length]].map(([l, n]) => (
        <Glass key={l as string} className="rounded-[18px] p-3 lg:p-5"><div className="serif text-[30px] leading-none lg:text-[48px]">{String(n).padStart(2, "0")}</div><div className="eyebrow mt-2 text-[9px]">{l}</div></Glass>
      ))}</div>
      </div><div>
      <Eyebrow className="mt-6 text-[10px] text-white/40 lg:mt-3">Settings</Eyebrow>
      <Glass className="mt-2.5 divide-y divide-white/8 rounded-[22px]">
        <div className="flex items-center justify-between px-4 py-3.5"><span className="text-[14px]">Units</span><div className="flex rounded-full bg-white/8 p-1">{(["cm", "in"] as const).map((u) => <button key={u} onClick={() => set({ units: u })} className={cx("h-8 w-12 rounded-full text-[13px] font-medium", units === u ? "bg-white text-bg" : "text-white/60")}>{u}</button>)}</div></div>
        <div className="flex items-center justify-between px-4 py-3.5"><span className="text-[14px]">Replay onboarding</span><button onClick={() => replace("onboarding")} className="text-[13px] font-medium text-peri">Play</button></div>
        <div className="flex items-center justify-between px-4 py-3.5"><div><div className="text-[14px]">Expo mode</div><div className="text-[11px] text-white/45">Reset after 2 minutes idle</div></div><Toggle on={kiosk} onChange={(v) => { set({ kiosk: v }); toast(v ? "Expo mode on" : "Expo mode off"); }} /></div>
      </Glass>
      <Pill variant="glass" className="mt-5" icon={<Icon name="refresh" size={18} />} onClick={() => setConfirm(true)}>Reset for the next visitor</Pill>
      <p className="mt-3 text-center text-[11px] text-white/35">Tip: press and hold the top-left corner for 2 seconds to reset from anywhere.</p>
      </div></div>
      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <h3 className="text-[22px] font-semibold">Start fresh?</h3>
        <p className="mt-2 text-[14px] text-white/60">This clears this visitor’s bodies and patterns and goes back to the start.</p>
        <Pill className="mt-5" onClick={() => { setConfirm(false); reset(); }}>Reset Venty</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setConfirm(false)}>Cancel</Pill>
      </Sheet>
      {node}
      <motion.div />
    </Screen>
  );
}

