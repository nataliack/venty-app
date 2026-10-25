"use client";
// Lab · notifications (25 Oct 2026): what opens behind home's bell. Four ways: A, today's bottom sheet refined (unread
// dots, Today and Earlier, a chevron on the rows that lead somewhere, Mark all as read, an empty state); B, a screen of
// its own; C, a panel that grows out of the bell; D, on a computer, a panel that drops from the bell. Each phone works:
// tap the bell to open and close, tap a row to read it. The tabs switch what there is to show.
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "@/components/icons";
import { cx } from "@/components/ui";

type Item = { id: string; icon: IconName; t: string; d: string; when: string; group: "Today" | "Earlier"; leads: boolean; unread: boolean };
const BASE: Item[] = [
  { id: "measure", icon: "ruler", t: "Finish Me’s measurements", d: "18 of 24 saved. Pick up where you left off.", when: "Today", group: "Today", leads: true, unread: true },
  { id: "print", icon: "printer", t: "Midi A-line skirt is ready to print", d: "Drafted to Me. Lay it out on your sheets when you’re ready.", when: "Today", group: "Today", leads: true, unread: true },
  { id: "new", icon: "dress", t: "New patterns to make", d: "A wrap dress and wide-leg trousers were added to the library.", when: "Yesterday", group: "Earlier", leads: true, unread: false },
  { id: "sketch", icon: "pencil", t: "New: sketch on your photos", d: "Add a photo and draw your changes on top of it.", when: "This week", group: "Earlier", leads: false, unread: false },
];
const MORE: Item[] = [
  { id: "m1", icon: "printer", t: "Bias midi skirt was printed", d: "12 sheets. Tape them together along the marks.", when: "Mon", group: "Earlier", leads: true, unread: false },
  { id: "m2", icon: "body", t: "Ana’s body is ready", d: "All 24 measurements saved.", when: "Sun", group: "Earlier", leads: true, unread: false },
  { id: "m3", icon: "dress", t: "New patterns to make", d: "A cami and a boxy tee were added to the library.", when: "Sat", group: "Earlier", leads: true, unread: false },
  { id: "m4", icon: "ruler", t: "Finish Ana’s measurements", d: "20 of 24 saved.", when: "Fri", group: "Earlier", leads: true, unread: false },
  { id: "m5", icon: "pencil", t: "New: change the design in words", d: "Tell Venty what to change and it updates the pattern.", when: "Last week", group: "Earlier", leads: false, unread: false },
];
type Kind = "some" | "read" | "none" | "many";
const items = (k: Kind): Item[] => k === "none" ? [] : k === "read" ? BASE.map((x) => ({ ...x, unread: false })) : k === "many" ? [...BASE, ...MORE] : BASE;

// one list's state: which are read
function useFeed(kind: Kind) {
  const [read, setRead] = useState<Record<string, boolean>>({});
  const list = items(kind).map((x) => ({ ...x, unread: x.unread && !read[x.id] }));
  return { list, unread: list.filter((x) => x.unread).length, markAll: () => setRead(Object.fromEntries(list.map((x) => [x.id, true]))), markOne: (id: string) => setRead((r) => ({ ...r, [id]: true })) };
}

// a row: the icon in its pressed tile (a cornflower dot on it while unread), the title (white while unread, softer once
// read), when, the line under it; a chevron on the rows that lead somewhere
function Row({ x, onTap, compact }: { x: Item; onTap: () => void; compact?: boolean }) {
  const inner = (
    <>
      <span className="iconbadge relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px]">
        <Icon name={x.icon} size={17} strokeWidth={1.9} />
        {x.unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#687ef5] ring-2 ring-[#1b1c26]" />}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cx("text-[15px] leading-snug", x.unread ? "font-medium text-white" : "text-white/80")}>{x.t}</span>
          <span className="shrink-0 text-[12px] text-white/40">{x.when}</span>
        </span>
        {!compact && <span className="mt-0.5 block text-[13.5px] leading-snug text-white/55">{x.d}</span>}
      </span>
      {x.leads && <Icon name="chevR" size={16} className="relative mt-0.5 shrink-0 text-white/30" />}
    </>
  );
  const cls = cx("group relative flex w-full items-start gap-3 px-2 text-left", compact ? "py-2.5" : "py-3.5");
  return <button onClick={onTap} className={cls}><span aria-hidden className="absolute inset-x-0 inset-y-1 rounded-[14px] transition-colors group-hover:bg-white/[.04]" />{inner}</button>;
}

// the list: Today and Earlier, straight hairlines between rows (not between groups), or the empty state
function Feed({ list, markOne, compact }: { list: Item[]; markOne: (id: string) => void; compact?: boolean }) {
  if (!list.length) return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="iconbadge grid h-12 w-12 place-items-center rounded-[14px]"><Icon name="bell" size={20} /></span>
      <div className="mt-4 text-[16px] font-medium text-white">You’re all caught up</div>
      <div className="mt-1 max-w-[240px] text-[14px] leading-snug text-white/55">When a pattern is ready or something new arrives, you’ll see it here.</div>
    </div>
  );
  return (
    <div className="-mx-2">
      {(["Today", "Earlier"] as const).map((g) => {
        const rows = list.filter((x) => x.group === g);
        if (!rows.length) return null;
        return (
          <section key={g} className="mt-2 first:mt-0">
            <h4 className="px-2 pb-1 pt-2 text-[13px] text-white/45">{g}</h4>
            {rows.map((x, i) => (
              <div key={x.id}>
                {i > 0 && <span aria-hidden className="mx-2 block h-px bg-white/[.07]" />}
                <Row x={x} onTap={() => markOne(x.id)} compact={compact} />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Header({ unread, markAll, left, title = "Notifications" }: { unread: number; markAll: () => void; left?: ReactNode; title?: string }) {
  return (
    <div className="flex items-center gap-3">
      {left}
      <h3 className="flex-1 text-[20px] font-normal tracking-[-.02em] text-white">{title}{unread > 0 && <span className="ml-2 align-middle text-[13px] text-white/45">{unread} new</span>}</h3>
      {unread > 0 && <button onClick={markAll} className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-[#a9b5fb] hover:bg-white/[.05]"><Icon name="check" size={14} strokeWidth={2.4} />Mark all as read</button>}
    </div>
  );
}

// home's top, as it is (the light hero with the bell), the dark page under it
function HomeTop({ unread, onBell }: { unread: number; onBell: () => void }) {
  return (
    <div className="absolute inset-0 bg-bg">
      <section className="home-hero light-hero relative px-5 pb-7" style={{ paddingTop: 52 }}>
        <div className="light-mat" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dfe3f5] text-[16px] font-medium text-[#26335f]">M</span>
            <div className="flex-1 leading-tight"><div className="text-[13px] text-[#26335f]/60">Good evening</div><div className="text-[16px] font-medium text-[#12131c]">Me</div></div>
            <button onClick={onBell} aria-label={unread ? `Notifications, ${unread} new` : "Notifications"} className="bell-btn tap relative grid h-10 w-10 shrink-0 place-items-center rounded-full">
              <Icon name="bell" size={19} strokeWidth={1.8} />
              {unread > 0 && <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#687ef5] ring-2 ring-white" />}
            </button>
          </div>
          <h1 className="mt-8 text-[34px] font-normal leading-[1.05] tracking-[-.03em] text-[#12131c]">What are we<br />making today?</h1>
          <p className="mt-3 text-[15px] text-[#12131c]/60">Design your own pattern, or start from one of ours.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">{["Create a pattern", "Start from a pattern"].map((t) => <div key={t} className="h-[120px] rounded-[24px] bg-[#171821] p-4 text-[15px] font-medium text-white">{t}</div>)}</div>
        </div>
      </section>
    </div>
  );
}

function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">{children}</div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

// A · the sheet, refined
function A({ kind }: { kind: Kind }) {
  const f = useFeed(kind);
  const [open, setOpen] = useState(true);
  return (
    <Phone label="A · Sheet, refined">
      <HomeTop unread={f.unread} onBell={() => setOpen(true)} />
      <AnimatePresence>{open && (
        <>
          <motion.div className="absolute inset-0 z-40 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div className="absolute inset-x-0 bottom-0 z-50 flex max-h-[78%] flex-col rounded-t-[32px] border-t border-white/[.08] bg-[#1b1c26] px-6 pb-8 pt-3"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}>
            <span className="mx-auto mb-4 block h-[5px] w-12 rounded-full bg-white/20" />
            <Header unread={f.unread} markAll={f.markAll} />
            <div className="-mr-2 mt-2 min-h-0 flex-1 overflow-y-auto pr-2 noscroll"><Feed list={f.list} markOne={f.markOne} /></div>
          </motion.div>
        </>
      )}</AnimatePresence>
    </Phone>
  );
}

// B · a screen of its own, sliding in from the right like any other screen
function B({ kind }: { kind: Kind }) {
  const f = useFeed(kind);
  const [open, setOpen] = useState(true);
  return (
    <Phone label="B · A screen of its own">
      <HomeTop unread={f.unread} onBell={() => setOpen(true)} />
      <AnimatePresence>{open && (
        <motion.div className="absolute inset-0 z-50 flex flex-col bg-bg px-5 pt-12" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.45 }}>
          <Header unread={f.unread} markAll={f.markAll} left={<button onClick={() => setOpen(false)} aria-label="Back" className="rb rb-sm"><Icon name="back" size={18} /></button>} />
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-8 noscroll"><Feed list={f.list} markOne={f.markOne} /></div>
        </motion.div>
      )}</AnimatePresence>
    </Phone>
  );
}

// C · a panel that grows out of the bell: anchored under it, opening from its corner, the page dimmed a little
function C({ kind }: { kind: Kind }) {
  const f = useFeed(kind);
  const [open, setOpen] = useState(true);
  return (
    <Phone label="C · From the bell">
      <HomeTop unread={f.unread} onBell={() => setOpen((o) => !o)} />
      <AnimatePresence>{open && (
        <>
          <motion.div className="absolute inset-0 z-40 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div className="absolute right-4 top-[104px] z-50 flex max-h-[600px] w-[352px] flex-col rounded-[26px] border border-white/[.08] bg-[#1b1c26] px-5 pb-4 pt-4 shadow-[0_30px_80px_-20px_rgb(0_0_0/.8)]"
            style={{ transformOrigin: "calc(100% - 22px) -10px" }}
            initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.2 }} transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}>
            {/* the little point to the bell */}
            <span aria-hidden className="absolute -top-[7px] right-[22px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-l border-t border-white/[.08] bg-[#1b1c26]" />
            <Header unread={f.unread} markAll={f.markAll} />
            <div className="mt-1 min-h-0 flex-1 overflow-y-auto noscroll"><Feed list={f.list.slice(0, 5)} markOne={f.markOne} compact /></div>
            {f.list.length > 5 && <button className="mt-2 h-10 rounded-full bg-white/[.06] text-[14px] font-medium text-white/85">See all {f.list.length}</button>}
          </motion.div>
        </>
      )}</AnimatePresence>
    </Phone>
  );
}

// D · on a computer: the panel drops from the bell, no dimming, closes on a click outside
function D({ kind }: { kind: Kind }) {
  const f = useFeed(kind);
  const [open, setOpen] = useState(true);
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate h-[640px] w-[1000px] max-w-full shrink-0 overflow-hidden rounded-[22px] bg-bg shadow-[0_0_0_1px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]" onClick={() => setOpen(false)}>
        <div className="absolute inset-y-0 left-0 w-[220px] border-r border-white/[.06] p-5 text-[14px] text-white/60"><div className="text-[20px] text-white">Venty</div>{["Home", "Make a pattern", "Patterns to make", "Body library", "Pattern library"].map((t) => <div key={t} className="mt-4">{t}</div>)}</div>
        <div className="absolute inset-y-0 left-[220px] right-0">
          <section className="light-hero relative m-4 h-[300px] overflow-hidden rounded-[28px] px-8 pt-6">
            <div className="flex items-center justify-end">
              <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} aria-label="Notifications" className="bell-btn tap relative grid h-10 w-10 place-items-center rounded-full">
                <Icon name="bell" size={19} strokeWidth={1.8} />{f.unread > 0 && <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#687ef5] ring-2 ring-white" />}
              </button>
            </div>
            <h1 className="mt-6 text-[44px] font-normal leading-[1.05] tracking-[-.03em] text-[#12131c]">What are we making today?</h1>
          </section>
        </div>
        <AnimatePresence>{open && (
          <motion.div onClick={(e) => e.stopPropagation()} className="absolute right-8 top-[76px] z-50 flex max-h-[520px] w-[400px] flex-col rounded-[24px] border border-white/[.08] bg-[#1b1c26] px-5 pb-4 pt-4 shadow-[0_30px_80px_-20px_rgb(0_0_0/.8)]"
            style={{ transformOrigin: "calc(100% - 22px) -10px" }}
            initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Header unread={f.unread} markAll={f.markAll} />
            <div className="mt-1 min-h-0 flex-1 overflow-y-auto noscroll"><Feed list={f.list} markOne={f.markOne} /></div>
          </motion.div>
        )}</AnimatePresence>
      </div>
      <figcaption className="text-[14px] text-white/55">D · On a computer, from the bell</figcaption>
    </figure>
  );
}

export function NotifyLab() {
  const [kind, setKind] = useState<Kind>("some");
  const KINDS: [Kind, string][] = [["some", "Two new"], ["read", "All read"], ["none", "Nothing yet"], ["many", "A long list"]];
  return (
    <section>
      <h2 className="h1 !text-[34px]">Notifications</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">What opens behind home&apos;s bell. Every version has the same feed, refined: a cornflower dot on what&apos;s new, Today and Earlier, a chevron on the rows that lead somewhere, Mark all as read, straight hairlines between rows, and an empty state. A keeps today&apos;s bottom sheet; B gives notifications a screen of their own; C grows a panel out of the bell; D is a computer, the panel dropping from the bell. Tap the bell to open and close, tap a row to read it.</p>
      <div className="sticky top-0 z-30 -mx-6 mt-5 border-b border-white/10 bg-[#05060b]/90 px-6 py-3 backdrop-blur">
        <div role="tablist" aria-label="What there is to show" className="flex w-fit rounded-full bg-white/[.06] p-1">
          {KINDS.map(([k, t]) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cx("h-10 rounded-full px-5 text-[15px] font-medium transition-colors", kind === k ? "bg-white text-bg" : "text-white/70 hover:text-white")}>{t}</button>)}
        </div>
      </div>
      {/* a new key per kind, so each phone starts open with that kind's list */}
      <div key={kind} className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <A kind={kind} /><B kind={kind} /><C kind={kind} />
        <D kind={kind} />
      </div>
    </section>
  );
}
