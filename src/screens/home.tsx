"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useApp, type Pattern } from "@/lib/store";
import { fabricAdvice, fitName, metresFor, SEED_PATTERNS, type GarmentKey } from "@/lib/data";
import { Screen, Eyebrow, H1, Pill, Glow, Glass, Chip, RB, Sheet, Toggle, TopBar, Split, Blob, Crown, cx, useToast, useDesk } from "@/components/ui";
import { BodyFigure, Flat } from "@/components/art";
import { useInstall } from "@/components/Install";
import { Icon, type IconName } from "@/components/icons";

// The bar's outline: a rounded pill with a round notch cut into the top centre. Where the notch meets the top edge
// the corners are rounded too (fillets), so the bar wraps the button like a cradle.
const BAR_H = 68, BAR_R = 28, NOTCH_R = 38, NOTCH_Y = 9, FILLET = 9;
function notchPath(w: number) {
  const c = w / 2, R = NOTCH_R, h = NOTCH_Y, f = FILLET;
  const dx = Math.sqrt((R + f) ** 2 - (h - f) ** 2); // fillet centre sits this far from the notch centre
  const k = R / (R + f); // touch point between fillet and notch, along the line joining their centres
  const p1 = [c + (-dx) * k, h + (f - h) * k], p2 = [c + dx * k, h + (f - h) * k];
  const r = BAR_R, H = BAR_H;
  return [
    `M ${r} 0`, `L ${c - dx} 0`,
    `A ${f} ${f} 0 0 1 ${p1[0]} ${p1[1]}`,
    `A ${R} ${R} 0 1 0 ${p2[0]} ${p2[1]}`,
    `A ${f} ${f} 0 0 1 ${c + dx} 0`,
    `L ${w - r} 0`, `A ${r} ${r} 0 0 1 ${w} ${r}`, `L ${w} ${H - r}`, `A ${r} ${r} 0 0 1 ${w - r} ${H}`,
    `L ${r} ${H}`, `A ${r} ${r} 0 0 1 0 ${H - r}`, `L 0 ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, "Z",
  ].join(" ");
}
function NotchShape() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(353);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth); return () => ro.disconnect(); }, []);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden>
      <svg width={w} height={BAR_H} viewBox={`0 0 ${w} ${BAR_H}`} className="tabbar-shape absolute inset-0 overflow-visible">
        <defs><linearGradient id="tabfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cdd3ef" /><stop offset="1" stopColor="#bac3e8" /></linearGradient></defs>
        <path d={notchPath(w)} fill="url(#tabfill)" stroke="rgb(255 255 255 / .4)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Phone navigation: a light floating bar with the Create button sitting in a round notch in the centre.
// The current tab sits in a soft periwinkle capsule. No glows.
function TabBar({ tab }: { tab: "home" | "bodies" | "patterns" | "you" }) {
  const { replace } = useApp();
  const [open, setOpen] = useState(false);
  const items: [typeof tab, IconName, string][] = [["home", "home", "Home"], ["bodies", "body", "Bodies"], ["patterns", "scissors", "Patterns"], ["you", "user", "You"]];
  const btn = ([k, ic, l]: (typeof items)[number]) => {
    const on = tab === k;
    return (
      <button key={k} onClick={() => replace(k)} aria-current={on ? "page" : undefined} className={cx("relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-[12px] transition-colors", on ? "font-semibold text-[#26335f]" : "font-medium text-[#26335f]/60")}>
        <span className={cx("grid h-8 w-14 place-items-center rounded-full transition-colors", on && "bg-[#687ef5]/25")}><Icon name={ic} size={22} strokeWidth={on ? 2.1 : 1.7} /></span>
        {l}
      </button>
    );
  };
  return (
    <>
      <div className="relative mt-3">
        <nav className="tabbar relative flex h-[68px] items-stretch px-1.5">
          <NotchShape />
          {items.slice(0, 2).map(btn)}
          <span className="w-[84px] shrink-0" />
          {items.slice(2).map(btn)}
        </nav>
        {/* centred on the notch: its centre sits NOTCH_Y below the bar's top edge */}
        <button onClick={() => setOpen(true)} aria-label="Create" className="createbtn tap absolute left-1/2 top-[-22px] grid h-[62px] w-[62px] -translate-x-1/2 place-items-center rounded-full"><Icon name="plus" size={26} strokeWidth={2.2} /></button>
      </div>
      <CreateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { go, newDraft, startBody } = useApp();
  const act = (fn: () => void) => () => { onClose(); fn(); };
  const tile = (ic: IconName, t: string, d: string, fn: () => void) => (
    <button onClick={act(fn)} className="card-soft tap flex min-h-[132px] flex-col justify-between rounded-[22px] p-4 text-left">
      <span className="iconbadge grid h-11 w-11 place-items-center rounded-full"><Icon name={ic} size={21} strokeWidth={2} /></span>
      <span><span className="block text-[16px] font-medium leading-tight">{t}</span><span className="mt-1 block text-[14px] leading-snug text-white/60">{d}</span></span>
    </button>
  );
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="text-[26px] font-normal leading-tight tracking-[-.02em]">Create</h3><p className="mt-1 text-[15px] text-white/60">What would you like to start?</p></div>
        <RB icon="close" size={38} onClick={onClose} />
      </div>
      <button onClick={act(() => { newDraft(); go("patSelectBody"); })} className="tap relative isolate mt-5 flex min-h-[150px] w-full flex-col justify-between overflow-hidden rounded-[26px] p-5 text-left text-white">
        <Crown className="-z-10" />
        <span className="flex items-center justify-between"><span className="iconbadge grid h-12 w-12 place-items-center rounded-full"><Icon name="pencil" size={22} strokeWidth={2} /></span><Icon name="chevR" size={20} className="text-white/85" /></span>
        <span><span className="block text-[21px] leading-tight tracking-[-.01em]">Design your own</span><span className="mt-1 block text-[15px] text-white/80">From a photo, a sketch or your own words</span></span>
      </button>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {tile("dress", "Use a pre-made", "Ready-to-fit patterns", () => go("templates"))}
        {tile("body", "Make a body", "Add measurements", () => startBody())}
      </div>
    </Sheet>
  );
}

// Home notices: resume paused measures; offer the tour to people who skipped it. Both dismiss themselves once used.
function Notices() {
  const { bodies, resumeBody, tourSkipped, installDismissed, set, go } = useApp();
  const b = bodies.find((x) => x.id === resumeBody && x.done.length < 24);
  const { offer } = useInstall();
  const showInstall = offer && !installDismissed;
  if (!b && !tourSkipped && !showInstall) return null;
  return (
    <div className="mt-5 flex flex-col gap-2.5 lg:max-w-[720px]">
      {showInstall && (
        <div className="card-soft relative flex items-center gap-3.5 rounded-[22px] p-4">
          <button onClick={() => go("install")} className="flex flex-1 items-center gap-3.5 text-left">
            <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-full"><Icon name="addhome" size={20} strokeWidth={2} /></span>
            <span><span className="block text-[16px] font-medium">Add to your home screen</span><span className="block text-[14px] text-white/55">Open Venty in one tap, like an app.</span></span>
          </button>
          <button onClick={() => set({ installDismissed: true })} aria-label="Dismiss" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10"><Icon name="close" size={16} /></button>
        </div>
      )}
      {b && (
        <button onClick={() => { set({ activeBody: b.id }); go("wizard"); }} className="card-soft tap flex w-full items-center gap-3.5 rounded-[22px] !border-primary/60 p-4 text-left">
          <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-full"><Icon name="ruler" size={20} strokeWidth={2} /></span>
          <div className="min-w-0 flex-1"><div className="text-[16px] font-medium">Continue finishing your measurements</div><div className="text-[14px] text-white/55">{b.name} · {b.done.length} of 24 saved</div>
            <div className="mt-2 flex gap-[2px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("h-1 flex-1 rounded-full", i < b.done.length ? "bg-primary" : "bg-white/15")} />)}</div></div>
          <Icon name="chevR" size={18} className="text-white/50" />
        </button>
      )}
      {tourSkipped && (
        <div className="card-soft relative flex items-center gap-3.5 rounded-[22px] p-4">
          <button onClick={() => go("onboarding", { from: "app" })} className="flex flex-1 items-center gap-3.5 text-left">
            <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-full"><Icon name="video" size={20} strokeWidth={2} /></span>
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
      <button onClick={() => { setOpen(true); set({ updatesSeen: true }); }} aria-label={seen ? "Updates" : "Updates, new"} className="tap relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#3f4c80] shadow-[0_4px_12px_-6px_rgb(38_51_95_/_.35)] transition-colors hover:bg-[#f6f7fd]">
        <Icon name="bell" size={19} />
        {!seen && <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#687ef5] ring-2 ring-white" />}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-[22px] font-normal tracking-[-.02em]">Updates</h3><RB icon="close" size={38} onClick={() => setOpen(false)} /></div>
        {/* a quiet feed, not a stack of buttons: plain rows split by hairlines. Rows that lead somewhere are still tappable. */}
        <div className="-mx-2 flex flex-col">{list.map((u, i) => {
          const body = <><span className="iconbadge grid h-10 w-10 shrink-0 place-items-center rounded-full"><Icon name={u.icon} size={18} strokeWidth={2} /></span>
            <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-3"><span className="text-[16px]">{u.t}</span><span className="shrink-0 text-[13px] text-white/40">{u.when}</span></span><span className="mt-0.5 block text-[14px] leading-snug text-white/55">{u.d}</span></span></>;
          const row = cx("flex items-start gap-3.5 rounded-[16px] px-2 py-3.5 text-left", i > 0 && "border-t border-white/[.07]");
          return u.go
            ? <button key={u.t} onClick={() => { setOpen(false); u.go!(); }} className={cx(row, "transition-colors hover:bg-white/[.04]")}>{body}</button>
            : <div key={u.t} className={row}>{body}</div>;
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
      <section className="home-hero light-hero relative px-5 pb-7 lg:px-12 lg:py-12">
        <div className="light-mat" aria-hidden />
        <div className="relative">
          {/* .home-hero already pads for the status bar (padding-top: var(--top)); never add a pt-* here, it would override that */}
          {/* kept quiet on purpose: the eye should land on the two cards, not up here */}
          <div className="mt-2 flex h-11 items-center gap-2.5 lg:mt-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d9def4] text-[15px] font-medium text-[#3f4c80]">{name[0].toUpperCase()}</span>
            <div className="min-w-0 flex-1 leading-tight"><div className="text-[13px] text-[#5d6a99]">{greet()}</div><div className="truncate text-[15px] font-medium text-[#3f4c80]">{name}</div></div>
            <UpdatesButton />
          </div>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-12">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} className="h1 mt-8 !text-[34px] text-[#26335f] [text-wrap:balance] lg:mt-14 lg:!text-[60px]">What are we making today?</motion.h1>
              <p className="mt-2.5 max-w-[440px] text-[16px] leading-snug text-[#3f4c80] lg:text-[18px]">Design your own, or use a pre‑made pattern.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-0 lg:gap-4">
              <button onClick={make} className="tap relative isolate flex min-h-[128px] flex-col justify-between overflow-hidden rounded-[24px] p-4 text-left text-white shadow-[0_18px_36px_-18px_rgba(28,34,82,.9)] lg:min-h-[170px] lg:p-6">
                <Crown className="-z-10" />
                <span className="relative flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full border border-white/45 bg-white/20"><Icon name="pencil" size={20} strokeWidth={2} /></span><Icon name="chevR" size={20} className="text-white/85" /></span>
                <span className="relative"><span className="block text-[18px] font-medium leading-tight lg:text-[20px]">Design your own</span><span className="mt-1 block text-[14px] leading-snug text-white/85">Photo, sketch or words</span></span>
              </button>
              <button onClick={() => go("templates")} className="pair-dark tap flex min-h-[128px] flex-col justify-between rounded-[24px] p-4 text-left text-white lg:min-h-[170px] lg:p-6">
                <span className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10"><Icon name="dress" size={20} strokeWidth={2} /></span><Icon name="chevR" size={20} className="text-white/60" /></span>
                <span><span className="block text-[18px] font-medium leading-tight lg:text-[20px]">Use a pre‑made</span><span className="mt-1 block text-[14px] leading-snug text-white/70">Ready-to-fit patterns</span></span>
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

// ─── Libraries: Edit lets you pick items and delete them. Picking is a quiet tick, deleting asks once. ───
const Tick = ({ on }: { on: boolean }) => (
  <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors", on ? "border-white bg-white text-[#0b0c15]" : "border-white/40")}>{on && <Icon name="check" size={13} strokeWidth={3} />}</span>
);
function useEditing<T extends string>() {
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState<T[]>([]);
  const [ask, setAsk] = useState(false);
  const toggle = (id: T) => setSel((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const stop = () => { setEditing(false); setSel([]); setAsk(false); };
  return { editing, setEditing, sel, toggle, stop, ask, setAsk };
}
const EditButton = ({ editing, onClick }: { editing: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={cx("tap h-9 rounded-full px-4 text-[14px] font-medium transition-colors", editing ? "bg-white text-[#0b0c15]" : "border border-white/15 text-white/85 hover:border-white/30")}>{editing ? "Done" : "Edit"}</button>
);
// Library top: just the title, with Edit on the same line. While editing, one quiet line says what to do.
function LibraryHead({ title, editing, canEdit, onEdit }: { title: string; editing: boolean; canEdit: boolean; onEdit: () => void }) {
  return (
    <div className="pt-7 lg:pt-6">
      <div className="flex items-center justify-between gap-4">
        <H1 className="min-w-0">{title}</H1>
        {canEdit && <EditButton editing={editing} onClick={onEdit} />}
      </div>
      <p className={cx("text-[15px] text-white/55 transition-all", editing ? "mt-1.5 h-6 opacity-100" : "h-0 opacity-0")} aria-hidden={!editing}>Tap the ones you want to delete.</p>
    </div>
  );
}
function DeleteBar({ n, what, onDelete, onCancel }: { n: number; what: string; onDelete: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <Pill variant="dark" className="flex-1" onClick={onCancel}>Cancel</Pill>
      <Pill className="flex-1" disabled={n === 0} onClick={onDelete} icon={<Icon name="trash" size={18} />}>{n ? `Delete ${n}` : `Pick ${what}`}</Pill>
    </div>
  );
}
function ConfirmDelete({ open, n, one, many, onYes, onNo }: { open: boolean; n: number; one: string; many: string; onYes: () => void; onNo: () => void }) {
  return (
    <Sheet open={open} onClose={onNo}>
      <h3 className="text-[22px] font-normal">Delete {n === 1 ? `this ${one}` : `${n} ${many}`}?</h3>
      <p className="mt-2 text-[15px] text-white/60">This can’t be undone.</p>
      <Pill className="mt-5" onClick={onYes}>Delete</Pill>
      <Pill variant="dark" className="mt-2.5" onClick={onNo}>Keep {n === 1 ? "it" : "them"}</Pill>
    </Sheet>
  );
}

export function Bodies() {
  const { go, bodies, set, startBody, removeBodies } = useApp();
  const [f, setF] = useState("All");
  const [q, setQ] = useState("");
  const ed = useEditing<string>();
  const list = bodies
    .filter((b) => f === "All" || (f === "Me" ? b.name.toLowerCase().startsWith("me") : f === "Family" ? ["mum", "sister", "tom", "dad"].some((x) => b.name.toLowerCase().includes(x)) : b.name.toLowerCase().includes("client")))
    .filter((b) => !q.trim() || b.name.toLowerCase().includes(q.trim().toLowerCase()));
  const desk = useDesk();
  const footer = ed.editing ? <DeleteBar n={ed.sel.length} what="bodies" onDelete={() => ed.setAsk(true)} onCancel={ed.stop} /> : desk ? undefined : <TabBar tab="bodies" />;
  return (
    <Screen dock={!ed.editing} footer={footer}>
      <LibraryHead title="Body library" editing={ed.editing} canEdit={bodies.length > 0} onEdit={() => (ed.editing ? ed.stop() : ed.setEditing(true))} />
      <label className="field mt-4 flex h-12 items-center gap-2.5 px-4 lg:max-w-[420px]">
        <Icon name="search" size={18} className="shrink-0 text-white/50" />
        <input value={q} onChange={(e) => setQ(e.target.value)} type="text" enterKeyHint="search" placeholder="Search bodies" aria-label="Search bodies" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-white/40" />
        {q && <button onClick={() => setQ("")} aria-label="Clear search" className="grid h-7 w-7 place-items-center rounded-full bg-white/10"><Icon name="close" size={13} /></button>}
      </label>
      <div className="mt-3 flex gap-2">{["All", "Me", "Family", "Clients"].map((c) => <Chip key={c} on={f === c} onClick={() => setF(c)}>{c}</Chip>)}</div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-7 lg:grid-cols-4 lg:gap-5">
        {list.map((b, i) => {
          const on = ed.sel.includes(b.id);
          return (
            <Glow key={b.id} as="button" color="#4d5e85" variant="fade" onClick={() => (ed.editing ? ed.toggle(b.id) : (set({ activeBody: b.id }), go("preview")))} className={cx("relative h-[230px] rounded-[26px] p-4 transition-[box-shadow,opacity] lg:h-[320px] lg:p-5", ed.editing && !on && "opacity-70", on && "ring-2 ring-white")}>
              {b.done.length < 24 && !ed.editing && <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2 py-1 text-[11px] font-medium">Incomplete</span>}
              {ed.editing && <span className="absolute right-3 top-3"><Tick on={on} /></span>}
              <div className="flex h-[150px] justify-center lg:h-[230px]"><BodyFigure sex={b.sex} width={desk ? 90 : 62} variant="solid" glow={false} /></div>
              <div className="absolute bottom-4 left-4 right-4"><div className="text-[15px] font-medium">{b.name}</div><div className="text-[13px] text-white/65"><span className="serif text-[15px] text-white">{b.done.length}</span> of 24 measurements</div></div>
            </Glow>
          );
        })}
        {!ed.editing && !q && (
          <button onClick={() => startBody()} className="tap flex h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/25 lg:h-[320px]">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Icon name="plus" size={24} /></span>
            <span className="mt-3 text-[15px] font-medium">New body</span><span className="text-[13px] text-white/50">4 measures to start</span>
          </button>
        )}
      </div>
      {q && list.length === 0 && <p className="mt-6 text-center text-[15px] text-white/55">No bodies called “{q.trim()}”.</p>}
      <ConfirmDelete open={ed.ask} n={ed.sel.length} one="body" many="bodies" onNo={() => ed.setAsk(false)} onYes={() => { removeBodies(ed.sel); ed.stop(); }} />
    </Screen>
  );
}

// What a pattern's card says: where it stands, in words that help you decide what to do next.
const specOf = (p: Pattern): NonNullable<Pattern["spec"]> => p.spec ?? SEED_PATTERNS.find((x) => x.id === p.id)?.spec ?? { ease: 4, drape: 0.6, seam: 1.5, printer: "A4" as const, metres: metresFor(p.garment, 4) };
const statusLine = (p: Pattern) => {
  const sp = specOf(p);
  if (p.status === "Printed") return sp.printer === "A0" ? "Printed at a print shop" : `Printed on ${sp.sheets ?? 9} A4 sheets`;
  if (p.status === "Fitting") return "Ready to print";
  return "Draft, not finished yet";
};

export function Patterns() {
  const { go, patterns, removePatterns } = useApp();
  const [f, setF] = useState("All");
  const ed = useEditing<string>();
  const list = patterns.filter((p) => f === "All" || (f === "Printed" ? p.status === "Printed" : p.status !== "Printed"));
  const desk = useDesk();
  const footer = ed.editing ? <DeleteBar n={ed.sel.length} what="patterns" onDelete={() => ed.setAsk(true)} onCancel={ed.stop} /> : desk ? undefined : <TabBar tab="patterns" />;
  return (
    <Screen dock={!ed.editing} footer={footer}>
      <LibraryHead title="Pattern library" editing={ed.editing} canEdit={patterns.length > 0} onEdit={() => (ed.editing ? ed.stop() : ed.setEditing(true))} />
      <div className="mt-4 flex h-11 rounded-full glass p-1 lg:max-w-[420px]">{["All", "In progress", "Printed"].map((c) => <button key={c} onClick={() => setF(c)} className={cx("flex-1 rounded-full text-[14px] font-medium", f === c ? "bg-white text-bg" : "text-white/70")}>{c}</button>)}</div>
      <div className="mt-4 flex flex-col gap-3 lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-4">
        {list.map((p, i) => {
          const sp = specOf(p);
          const on = ed.sel.includes(p.id);
          return (
            <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}
              onClick={() => (ed.editing ? ed.toggle(p.id) : go("pattern", { id: p.id }))}
              className={cx("card-soft tap flex w-full items-stretch gap-4 rounded-[26px] p-2.5 pr-4 text-left transition-opacity", ed.editing && !on && "opacity-70", on && "!border-white")}>
              {/* the garment on a small Crown panel, like a swatch card */}
              <span className="violet-panel relative grid h-[116px] w-[96px] shrink-0 place-items-center overflow-hidden rounded-[20px] lg:h-[140px] lg:w-[118px]">
                <Flat g={p.garment as GarmentKey} size={desk ? 82 : 66} stroke="#fff" fill="rgba(255,255,255,.16)" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col py-1.5">
                <span className="flex items-center gap-1.5 text-[13px] text-white/70"><span className={cx("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[p.status])} />{statusLine(p)}</span>
                <span className="mt-1.5 block truncate text-[18px] leading-tight">{p.name}</span>
                <span className="mt-0.5 block truncate text-[14px] text-white/55">Drafted to {p.body}</span>
                <span className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[12px] text-white/75">{fitName(sp.ease)} fit</span>
                  <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[12px] text-white/75"><span className="serif">{sp.metres}</span> m of fabric</span>
                </span>
              </span>
              <span className="grid place-items-center">{ed.editing ? <Tick on={on} /> : <Icon name="chevR" size={18} className="text-white/40" />}</span>
            </motion.button>
          );
        })}
      </div>
      {list.length === 0 && <p className="mt-8 text-center text-[15px] text-white/55">Nothing here yet.</p>}
      <ConfirmDelete open={ed.ask} n={ed.sel.length} one="pattern" many="patterns" onNo={() => ed.setAsk(false)} onYes={() => { removePatterns(ed.sel); ed.stop(); }} />
    </Screen>
  );
}

export function You() {
  const { user, units, experience, set, reset, bodies, patterns, go } = useApp();
  const [confirm, setConfirm] = useState(false);
  const { standalone } = useInstall();
  const kiosk = useApp((s) => s.kiosk);
  const { toast, node } = useToast();
  const desk = useDesk();
  return (
    <Screen dock footer={desk ? undefined : <TabBar tab="you" />}>
      <div className="flex h-12 items-center"><Eyebrow>Profile</Eyebrow></div>
      <div className="lg:mt-4 lg:grid lg:grid-cols-2 lg:gap-12"><div>
      <div className="mt-3 flex items-center gap-4">
        <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-[#d9def4] text-[30px] font-medium text-[#3f4c80]">{(user.guest ? "G" : user.name[0]).toUpperCase()}</span>
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
        {!standalone && <button onClick={() => go("install")} className="flex w-full items-center justify-between px-4 py-3.5 text-left"><span className="text-[15px]">Add Venty to your home screen</span><Icon name="chevR" size={18} className="text-white/45" /></button>}
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
