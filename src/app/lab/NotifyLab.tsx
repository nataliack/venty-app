"use client";
// Lab · notifications (25 Oct 2026), round 2: the bottom sheet (chosen), with the app's own sheet (its surface and the
// handle in a cut in its top edge: SheetSurface) and the feed refined (unread dots, Today and Earlier, a chevron on the
// rows that lead somewhere, Mark all as read, straight hairlines, an empty state). A short notification goes straight to
// its place (Finish your measurements: the measuring steps). A long one, with paragraphs, pictures and links, opens a
// screen of its own that slides in over the sheet; back returns to the sheet.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "@/components/icons";
import { cx, SheetSurface } from "@/components/ui";

// a long notification's content: a picture at the top, paragraphs (a link may sit in one), pictures with captions,
// and one thing to do
type Rich = { kicker: string; image: string; body: ReactNode[]; gallery?: { src: string; caption: string }[]; cta: string };
type Item = { id: string; icon: IconName; t: string; d: string; when: string; group: "Today" | "Earlier"; leads: boolean; unread: boolean; rich?: Rich; goes?: string };
const A = ({ children }: { children: ReactNode }) => <span className="font-medium text-[#a9b5fb] underline decoration-[#a9b5fb]/40 underline-offset-[3px]">{children}</span>;
const BASE: Item[] = [
  { id: "measure", icon: "ruler", t: "Finish Me’s measurements", d: "18 of 24 saved. Pick up where you left off.", when: "Today", group: "Today", leads: true, unread: true, goes: "the measuring steps" },
  { id: "print", icon: "printer", t: "Midi A-line skirt is ready to print", d: "Drafted to Me. Lay it out on your sheets when you’re ready.", when: "Today", group: "Today", leads: true, unread: true, goes: "the pattern" },
  {
    id: "new", icon: "dress", t: "New patterns to make", d: "A wrap dress and wide-leg trousers were added to the library.", when: "Yesterday", group: "Earlier", leads: true, unread: true,
    rich: {
      kicker: "New in Patterns to make", image: "/auth/look-street-green.webp",
      body: [
        <>Two new patterns are in the library, both drafted to your own measurements the moment you choose them.</>,
        <>The <b className="font-medium text-white">wrap dress</b> has a crossover bodice, flutter sleeves and a tie at the waist. It adjusts as you wear it, so it is a kind first fit.</>,
        <>The <b className="font-medium text-white">wide-leg trousers</b> sit high on the waist with front pleats. Venty grades them to your waist, hip and rise. See <A>how the rise is measured</A> before you start.</>,
      ],
      gallery: [{ src: "/auth/look-limo-mauve.webp", caption: "Wrap dress · Intermediate" }, { src: "/auth/look-street-burgundy.webp", caption: "Wide-leg trouser · Intermediate" }],
      cta: "See the new patterns",
    },
  },
  {
    id: "sketch", icon: "pencil", t: "New: sketch on your photos", d: "Add a photo and draw your changes on top of it.", when: "This week", group: "Earlier", leads: true, unread: false,
    rich: {
      kicker: "What’s new", image: "/auth/detail-bows.webp",
      body: [
        <>You can now draw straight onto a photo of a garment you like. Circle a neckline, sketch a longer hem, add bows. Venty reads your lines with the picture and drafts the pattern with your changes.</>,
        <>Tap the pencil in the studio, choose a colour, and draw. Use two fingers to move the photo. Read <A>tips for clear sketches</A> to get the best result.</>,
      ],
      gallery: [{ src: "/auth/detail-hems.webp", caption: "A longer hem, drawn on" }, { src: "/auth/detail-corset.webp", caption: "A new neckline" }],
      cta: "Try it in the studio",
    },
  },
];
const MORE: Item[] = [
  { id: "m1", icon: "printer", t: "Bias midi skirt was printed", d: "12 sheets. Tape them together along the marks.", when: "Mon", group: "Earlier", leads: true, unread: false, goes: "the pattern" },
  { id: "m2", icon: "body", t: "Ana’s body is ready", d: "All 24 measurements saved.", when: "Sun", group: "Earlier", leads: true, unread: false, goes: "the body" },
  { id: "m3", icon: "ruler", t: "Finish Ana’s measurements", d: "20 of 24 saved.", when: "Fri", group: "Earlier", leads: true, unread: false, goes: "the measuring steps" },
];
type Kind = "some" | "read" | "none" | "many";
const items = (k: Kind): Item[] => k === "none" ? [] : k === "read" ? BASE.map((x) => ({ ...x, unread: false })) : k === "many" ? [...BASE, ...MORE] : BASE;

function useFeed(kind: Kind) {
  const [read, setRead] = useState<Record<string, boolean>>({});
  const list = items(kind).map((x) => ({ ...x, unread: x.unread && !read[x.id] }));
  return { list, unread: list.filter((x) => x.unread).length, markAll: () => setRead(Object.fromEntries(list.map((x) => [x.id, true]))), markOne: (id: string) => setRead((r) => ({ ...r, [id]: true })) };
}

// a row: the icon in its pressed tile (a cornflower dot on it while unread), the title (white while unread), when, the
// line under it, a chevron on the rows that lead somewhere
function Row({ x, onTap }: { x: Item; onTap: () => void }) {
  return (
    <button onClick={onTap} className="group relative flex w-full items-start gap-3 px-2 py-3.5 text-left">
      <span aria-hidden className="absolute inset-x-0 inset-y-1 rounded-[14px] transition-colors group-hover:bg-white/[.04]" />
      <span className="iconbadge relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px]">
        <Icon name={x.icon} size={17} strokeWidth={1.9} />
        {x.unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#687ef5] ring-2 ring-[#1b1c26]" />}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cx("text-[15px] leading-snug", x.unread ? "font-medium text-white" : "text-white/80")}>{x.t}</span>
          <span className="shrink-0 text-[12px] text-white/40">{x.when}</span>
        </span>
        <span className="mt-0.5 block text-[13.5px] leading-snug text-white/55">{x.d}</span>
      </span>
      {x.leads && <Icon name="chevR" size={16} className="relative mt-0.5 shrink-0 text-white/30" />}
    </button>
  );
}

function Feed({ list, onTap }: { list: Item[]; onTap: (x: Item) => void }) {
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
                <Row x={x} onTap={() => onTap(x)} />
              </div>
            ))}
          </section>
        );
      })}
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

// the app's sheet, drawn inside the phone: its own surface and the handle in a cut in its top edge (SheetSurface), the
// handle turning periwinkle while it is held; drag it down (or tap outside) to close
function PhoneSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [[w, h], setSize] = useState([0, 0]);
  const [press, setPress] = useState(false);
  const [drag, setDrag] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const fit = () => setSize([el.offsetWidth, el.offsetHeight]); const ro = new ResizeObserver(fit); ro.observe(el); fit(); return () => ro.disconnect(); }, []);
  return (
    <>
      <motion.div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      {/* the app's sheet surface hides itself on a wide screen (a computer gets a dialog there); the lab is seen on one,
          so inside these phones it stays */}
      <style>{`.lab-phone-sheet > svg { display: block !important; }`}</style>
      <motion.div ref={ref} className="lab-phone-sheet absolute inset-x-0 bottom-0 z-50 isolate flex max-h-[80%] flex-col px-6 pb-8 pt-[34px] text-white"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }} onDragStart={() => setDrag(true)} onDragEnd={(_, i) => { setDrag(false); if (i.offset.y > 90) onClose(); }}>
        {w > 0 && <SheetSurface w={w} h={h} on={press || drag} tone="dark" />}
        <div className="absolute inset-x-0 top-0 h-11" aria-hidden onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerCancel={() => setPress(false)} onPointerLeave={() => setPress(false)} />
        {children}
      </motion.div>
    </>
  );
}

// a long notification, on a screen of its own: back to the sheet, the picture, what it is and when, the title, the
// paragraphs (links in them), pictures with captions, and one thing to do at the foot
function Detail({ x, onBack }: { x: Item; onBack: () => void }) {
  const r = x.rich!;
  return (
    <motion.div className="absolute inset-0 z-[60] flex flex-col bg-bg text-white" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.45 }}>
      <div className="min-h-0 flex-1 overflow-y-auto noscroll">
        <div className="relative">
          <img src={r.image} alt="" className="h-[300px] w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(11 12 21 / .45), transparent 30%, transparent 60%, var(--color-bg))" }} />
          <button onClick={onBack} aria-label="Back to notifications" className="rb rb-sm absolute left-5 top-12"><Icon name="back" size={18} /></button>
        </div>
        <div className="relative -mt-6 px-6 pb-8">
          <div className="text-[13px] text-white/50">{r.kicker} · {x.when}</div>
          <h1 className="mt-2 text-[30px] font-normal leading-[1.08] tracking-[-.03em]">{x.t}</h1>
          <div className="mt-4 space-y-3.5 text-[16px] leading-relaxed text-white/75">{r.body.map((p, i) => <p key={i}>{p}</p>)}</div>
          {r.gallery && (
            <div className="mt-6 grid grid-cols-2 gap-3">{r.gallery.map((g) => (
              <figure key={g.src}><img src={g.src} alt="" className="aspect-[4/5] w-full rounded-[18px] object-cover" /><figcaption className="mt-2 text-[13px] text-white/55">{g.caption}</figcaption></figure>
            ))}</div>
          )}
        </div>
      </div>
      <div className="shrink-0 px-6 pb-8 pt-3"><span className="pill pill-primary w-full text-[16px] text-white">{r.cta}</span></div>
    </motion.div>
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

// one phone, working: the bell opens the sheet; a short row says where it would go; a long one opens its screen
function Notifications({ kind, label, startOn }: { kind: Kind; label: string; startOn?: string }) {
  const f = useFeed(kind);
  const [open, setOpen] = useState(true);
  const [detail, setDetail] = useState<Item | null>(() => (startOn ? items(kind).find((x) => x.id === startOn) ?? null : null));
  const [toast, setToast] = useState<string | null>(null);
  const tap = (x: Item) => {
    f.markOne(x.id);
    if (x.rich) { setDetail(x); return; }
    setToast(`Opens ${x.goes}`); setTimeout(() => setToast(null), 1400);
  };
  return (
    <Phone label={label}>
      <HomeTop unread={f.unread} onBell={() => setOpen(true)} />
      <AnimatePresence>{open && (
        <PhoneSheet key="sheet" onClose={() => setOpen(false)}>
          <div className="flex items-center gap-3">
            <h3 className="flex-1 text-[20px] font-normal tracking-[-.02em] text-white">Notifications{f.unread > 0 && <span className="ml-2 align-middle text-[13px] text-white/45">{f.unread} new</span>}</h3>
            {f.unread > 0 && <button onClick={f.markAll} className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-[#a9b5fb] hover:bg-white/[.05]"><Icon name="check" size={14} strokeWidth={2.4} />Mark all as read</button>}
          </div>
          <div className="-mr-2 mt-2 min-h-0 flex-1 overflow-y-auto pr-2 noscroll"><Feed list={f.list} onTap={tap} /></div>
        </PhoneSheet>
      )}</AnimatePresence>
      <AnimatePresence>{detail && <Detail key="detail" x={detail} onBack={() => setDetail(null)} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="absolute inset-x-6 top-14 z-[70] rounded-full bg-white px-4 py-3 text-center text-[14px] font-medium text-bg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{toast}</motion.div>}</AnimatePresence>
    </Phone>
  );
}

export function NotifyLab() {
  const [kind, setKind] = useState<Kind>("some");
  const KINDS: [Kind, string][] = [["some", "Three new"], ["read", "All read"], ["none", "Nothing yet"], ["many", "A long list"]];
  return (
    <section>
      <h2 className="h1 !text-[34px]">Notifications</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">The bottom sheet (chosen), with the app&apos;s own sheet and its handle in the cut in the top edge (hold or drag it: it turns periwinkle; drag down to close). A short notification goes straight to its place; a long one, with paragraphs, pictures and links, opens a screen of its own over the sheet, and back returns to the sheet. Left: the sheet, working (tap New patterns to make, or New: sketch on your photos). Right: a long one already open.</p>
      <div className="sticky top-0 z-30 -mx-6 mt-5 border-b border-white/10 bg-[#05060b]/90 px-6 py-3 backdrop-blur">
        <div role="tablist" aria-label="What there is to show" className="flex w-fit rounded-full bg-white/[.06] p-1">
          {KINDS.map(([k, t]) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cx("h-10 rounded-full px-5 text-[15px] font-medium transition-colors", kind === k ? "bg-white text-bg" : "text-white/70 hover:text-white")}>{t}</button>)}
        </div>
      </div>
      <div key={kind} className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <Notifications kind={kind} label="The sheet" />
        {kind !== "none" && <Notifications kind={kind} label="A long notification, opened" startOn="new" />}
      </div>
    </section>
  );
}
