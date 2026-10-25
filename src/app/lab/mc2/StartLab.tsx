"use client";
// Lab (MC 2): "Start from a pattern" (the Create menu's second row, the `templates` page), restyled after the pattern
// library (the Lookbook, live 25 Oct 2026): dark trays, pressed photo tiles for the kinds, round tools, sheets. It is a
// step in a flow (Back at the top left, no tab bar), so each direction leans towards choosing one, not keeping many.
// Three directions beside Today, each on a real-size phone. Nothing here is used by the app.
import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TEMPLATES, CATEGORIES, type Category } from "@/lib/data";
import { Icon } from "@/components/icons";
import { cx, Pill } from "@/components/ui";
import { TplCard } from "@/screens/templates";
import {
  PHOTO, Img, Shell, KINDS, byKind, SKINS, Lvl, Frame, KindFilter, ToolBtn, SearchOpen, PhoneSheet, SheetTitle, Group, SheetFooter,
  Count, PressedPhoto, Sunk, OnChips, LEVELS_, PIECES_, piecesIn,
} from "./concepts";

const s = SKINS.dark;
type Tpl = (typeof TEMPLATES)[number];
const CAT_LABEL: Record<Category, string> = { Dresses: "Dresses", Tops: "Tops", Pants: "Trousers", Skirts: "Skirts" };
const KIND_ONE: Record<Category, string> = { Dresses: "Dress", Tops: "Top", Pants: "Trousers", Skirts: "Skirt" };
const Back = () => <button aria-label="Back" className="rb"><Icon name="back" size={20} /></button>;

// ─── the shared state of the page: kind, search, level and pieces ───
function usePicker() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [lv, setLv] = useState<string[]>([]);
  const [pc, setPc] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [sheet, setSheet] = useState(false);
  const list = TEMPLATES.filter((t) => byKind(cat).includes(t) && (!lv.length || lv.includes(t.level)) && (!pc.length || pc.some((x) => piecesIn(t.pieces, x))) && (!q.trim() || t.name.toLowerCase().includes(q.trim().toLowerCase())));
  const on = [...lv.map((x) => ({ k: x, off: () => setLv(lv.filter((y) => y !== x)) })), ...pc.map((x) => ({ k: `${x} pieces`, off: () => setPc(pc.filter((y) => y !== x)) }))];
  const clear = () => { setLv([]); setPc([]); };
  return { cat, setCat, q, setQ, lv, setLv, pc, setPc, searching, setSearching, sheet, setSheet, list, on, clear };
}
type Picker = ReturnType<typeof usePicker>;

// the top: Back, then the title with Search and Filter beside it (the search opens across that row), one line under it
function Head({ k, title = "Patterns to make" }: { k: Picker; title?: string }) {
  return (
    <div className="px-6">
      <Back />
      <div className="mt-4">
        {k.searching ? <SearchOpen q={k.q} setQ={k.setQ} placeholder="Search patterns" onCancel={() => { k.setSearching(false); k.setQ(""); }} /> : (
          <div className="flex h-11 items-center justify-between gap-3">
            <h1 className="h1 !text-[34px]">{title}</h1>
            <span className="flex shrink-0 items-center gap-2">
              <ToolBtn icon="search" label="Search" onClick={() => k.setSearching(true)} />
              <ToolBtn icon="sliders" label="Filter" n={k.on.length} onClick={() => k.setSheet(true)} />
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-[16px] leading-snug text-white/60">Choose a style, then fit it to your body.</p>
    </div>
  );
}
function FilterSheet({ k }: { k: Picker }) {
  return (
    <PhoneSheet open={k.sheet} onClose={() => k.setSheet(false)}>
      <SheetTitle>Filter</SheetTitle>
      <Group title="Level" items={LEVELS_} value={k.lv as (typeof LEVELS_)[number][]} onChange={k.setLv} />
      <Group title="Pieces" items={PIECES_} value={k.pc as (typeof PIECES_)[number][]} onChange={k.setPc} />
      <SheetFooter n={k.list.length} canClear={k.on.length > 0} onClear={k.clear} onShow={() => k.setSheet(false)} />
    </PhoneSheet>
  );
}
// pinned once you scroll past the kinds: the kinds as pills under the status bar (no tabs: this page has none)
function PinnedKinds({ k }: { k: Picker }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="absolute inset-x-0 top-0 z-10 border-b border-white/8 bg-bg pb-3 pt-[54px]">
      <div className="noscroll flex gap-2 overflow-x-auto px-6">
        {KINDS.map((x) => (
          <button key={x} onClick={() => k.setCat(x)} className={cx("flex h-10 shrink-0 items-center gap-2 rounded-full pl-[5px] pr-4 text-[14px] transition-colors", x === k.cat ? "bg-snow font-medium text-ink" : "bg-card text-white/75")}>
            <PressedPhoto k={x} size={30} r={15} light={x === k.cat} />{x}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
function useShrink() {
  const kinds = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState(false);
  const onScroll = (el: HTMLDivElement) => { const r = kinds.current; setBar(!!r && el.scrollTop > r.offsetTop + r.offsetHeight - 96); };
  return { kinds, bar, onScroll };
}
// "Request a pattern" (today's dashed card), as an empty tray: the pressed surface with a plus, in the same frame
const Request = ({ imgH }: { imgH: number }) => (
  <Frame s={s} imgH={imgH} pic={<span className="absolute inset-0 grid place-items-center" style={s.surface}><span className="grid h-12 w-12 place-items-center rounded-full text-white/70" style={s.tile}><Icon name="plus" size={22} /></span></span>}
    name="Request a pattern" line={<span className="text-[13px] text-white/55">Tell us what to add</span>} />
);
const Nothing = ({ k }: { k: Picker }) => (
  <div className="mt-10 px-6 text-center">
    <p className="text-[17px]">No patterns match</p>
    <button onClick={() => { k.setQ(""); k.clear(); k.setCat("All"); }} className="tap mt-2 h-10 text-[15px] font-medium text-peri">Clear the search and filters</button>
  </div>
);
const noTabs = <span />;

// ═══ Today ═══
function Today() {
  const [cat, setCat] = useState<Category>("Dresses");
  const list = TEMPLATES.filter((t) => t.category === cat);
  return (
    <Shell footer={noTabs}>
      <div className="px-6">
        <div className="flex items-center justify-between"><Back /><button aria-label="Search" className="rb"><Icon name="search" size={20} /></button></div>
        <h1 className="h1 mt-4 !text-[34px]">Patterns to make</h1>
        <p className="mt-2 text-[16px] leading-snug text-white/60">Choose a style, fit it to your body and get the pattern.</p>
        <div className="noscroll mt-6 flex gap-6 border-b border-white/10">
          {CATEGORIES.map((c) => <button key={c} onClick={() => setCat(c)} className={cx("relative shrink-0 pb-3 text-[17px]", c === cat ? "text-white" : "text-white/45")}>{CAT_LABEL[c]}{c === cat && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-white" />}</button>)}
        </div>
        <div className="mt-4 flex items-center justify-between"><span className="text-[15px] text-white/60"><Count n={list.length} /></span><button className="flex h-10 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[15px] font-medium">Any level<Icon name="chevD" size={16} /></button></div>
        <div className="mt-4 grid grid-cols-2 gap-3">{list.map((t) => <TplCard key={t.key} t={t} desk={false} onClick={() => {}} />)}</div>
      </div>
    </Shell>
  );
}

// ═══ A · Shelf: the library's Patterns to make, as a page: the kinds, then one grid of tray cards ═══
function Shelf() {
  const k = usePicker();
  const { kinds, bar, onScroll } = useShrink();
  return (
    <Shell footer={noTabs} onScroll={onScroll} overlay={<><AnimatePresence>{bar && <PinnedKinds k={k} />}</AnimatePresence><FilterSheet k={k} /></>}>
      <Head k={k} />
      <div ref={kinds} className="mt-5"><KindFilter v="tiles" value={k.cat} onChange={k.setCat} /></div>
      <OnChips items={k.on} onClear={k.clear} />
      {k.list.length ? (
        <div className="mt-5 grid grid-cols-2 items-start gap-x-3 gap-y-4 px-6">
          {k.list.map((t) => <Frame key={t.key} s={s} imgH={206} pic={<Img src={PHOTO[t.key]} />} name={t.name} line={<Lvl t={t} s={s} />} />)}
          {!k.q && !k.on.length && <Request imgH={206} />}
        </div>
      ) : <Nothing k={k} />}
    </Shell>
  );
}

// ═══ B · Deck: one big tray at a time, the ones beside it peeking; the chosen one's details under it and its button
//     at the bottom, so choosing happens here ═══
// sized so the card, its words and the button all fit on a 393 × 852 phone without scrolling (measured)
const DECK_W = 240, DECK_H = 330;
function DeckCard({ t, on }: { t: Tpl; on: boolean }) {
  return (
    <div className={cx("flex shrink-0 snap-center flex-col rounded-[30px] p-[7px] transition-[opacity,transform] duration-300", !on && "scale-[.94] opacity-55")} style={{ width: DECK_W, height: DECK_H, ...s.rim }}>
      <span className="relative block min-h-0 flex-1 overflow-hidden rounded-[25px]"><Img src={PHOTO[t.key]} /><Sunk s={s} /></span>
      <span className="flex h-[66px] shrink-0 items-center justify-between gap-3 px-2">
        <span className="min-w-0">
          <span className="block truncate text-[17px] leading-tight tracking-[-.01em]">{t.name}</span>
          <span className="mt-1 block"><Lvl t={t} s={s} /></span>
        </span>
        <span className="shrink-0 text-[13px] text-white/55"><span className="serif text-[15px] text-white/80">{t.pieces}</span> pieces</span>
      </span>
    </div>
  );
}
function Deck() {
  const k = usePicker();
  const [i, setI] = useState(0);
  const t = k.list[Math.min(i, k.list.length - 1)];
  const onScroll = (el: HTMLDivElement) => setI(Math.round(el.scrollLeft / (DECK_W + 12)));
  const pick = (c: string) => { k.setCat(c); setI(0); };
  return (
    <Shell footer={t ? <div className="pb-2"><Pill>See the {t.name.toLowerCase()}</Pill></div> : noTabs} overlay={<FilterSheet k={k} />}>
      <Head k={k} />
      <div className="mt-5"><KindFilter v="tiles" value={k.cat} onChange={pick} /></div>
      <OnChips items={k.on} onClear={k.clear} />
      {t ? (
        <>
          <div key={k.cat + k.on.length + k.q} onScroll={(e) => onScroll(e.currentTarget)} className="noscroll -mb-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-8 pt-2" style={{ paddingInline: (393 - DECK_W) / 2 }}>
            {k.list.map((x, n) => <DeckCard key={x.key} t={x} on={n === i} />)}
          </div>
          {/* the one in the middle, in words: what kind, what it is like */}
          <AnimatePresence mode="wait">
            <motion.div key={t.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="px-6 text-center">
              <p className="text-[14px] text-white/55">{KIND_ONE[t.category]} · {t.tag} · {t.lengths.join(", ")}</p>
              <p className="mx-auto mt-2 line-clamp-3 max-w-[320px] text-[15px] leading-snug text-white/70">{t.blurb}</p>
            </motion.div>
          </AnimatePresence>
        </>
      ) : <Nothing k={k} />}
    </Shell>
  );
}

// ═══ C · Rows: wide trays, one per pattern, the photo on the left and enough words on the right to compare them ═══
function RowCard({ t }: { t: Tpl }) {
  return (
    <button className="tap flex h-[160px] w-full items-stretch gap-3 rounded-[26px] p-[6px] pr-4 text-left" style={s.rim}>
      <span className="relative block w-[112px] shrink-0 overflow-hidden rounded-[21px]"><Img src={PHOTO[t.key]} /><Sunk s={s} /></span>
      <span className="flex min-w-0 flex-1 flex-col py-2.5">
        <span className="block truncate text-[18px] leading-tight tracking-[-.01em]">{t.name}</span>
        <span className="mt-1.5 flex items-center gap-3"><Lvl t={t} s={s} /><span className="text-[13px] text-white/55">{t.pieces} pieces</span></span>
        <span className="mt-2 line-clamp-2 text-[14px] leading-snug text-white/60">{t.blurb}</span>
        <span className="mt-auto text-[13px] text-white/45">{t.tag}</span>
      </span>
    </button>
  );
}
function Rows() {
  const k = usePicker();
  const { kinds, bar, onScroll } = useShrink();
  return (
    <Shell footer={noTabs} onScroll={onScroll} overlay={<><AnimatePresence>{bar && <PinnedKinds k={k} />}</AnimatePresence><FilterSheet k={k} /></>}>
      <Head k={k} />
      <div ref={kinds} className="mt-5"><KindFilter v="tiles" value={k.cat} onChange={k.setCat} /></div>
      <OnChips items={k.on} onClear={k.clear} />
      {k.list.length ? (
        <div className="mt-5 flex flex-col gap-3 px-6">{k.list.map((t) => <RowCard key={t.key} t={t} />)}</div>
      ) : <Nothing k={k} />}
    </Shell>
  );
}

const DIRS: { k: string; name: string; note: string; C: () => ReactNode }[] = [
  { k: "shelf", name: "A · Shelf", note: "The library’s Patterns to make as a page of its own: Back, Search and Filter by the title, the kinds as pressed photo tiles, then one grid of tray cards (Request a pattern as an empty tray at the end). The kinds pin to the top as pills once you scroll.", C: Shelf },
  { k: "deck", name: "B · Deck", note: "For choosing: one big tray at a time, the ones beside it peeking and dimmed; its kind, tag, lengths and a line about it under the deck, and its own button at the bottom (See the slip dress). Swipe or pick a kind.", C: Deck },
  { k: "rows", name: "C · Rows", note: "For comparing: wide trays one under the other, the photo pressed in on the left, the name, level, pieces, two lines about it and its tag on the right. The kinds pin to the top as pills once you scroll.", C: Rows },
];

// a phone at the iPhone's real size (393 × 852), a touch smaller on a narrow screen so it fits
function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3 max-[424px]:[zoom:.86]">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[55px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">{children}</div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

export function StartLab() {
  const [d, setD] = useState("shelf");
  const c = DIRS.find((x) => x.k === d)!;
  return (
    <section className="mx-auto max-w-[1000px]">
      <h1 className="h1 !text-[34px]">Start from a pattern</h1>
      <p className="mt-2 max-w-[640px] text-[16px] leading-snug text-white/60">The page the Create menu’s “Start from a pattern” opens, restyled after the pattern library. Three directions beside Today; the photos are the same stand-ins.</p>
      <div className="noscroll mt-6 flex gap-2 overflow-x-auto">
        {DIRS.map((x) => <button key={x.k} onClick={() => setD(x.k)} className={cx("h-11 shrink-0 rounded-full px-5 text-[15px] font-medium transition-colors", x.k === d ? "bg-snow text-ink" : "bg-card text-white/75 hover:text-white")}>{x.name}</button>)}
      </div>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/70">{c.note}</p>
      <div key={d} className="mt-8 flex flex-wrap justify-center gap-x-14 gap-y-10">
        <Phone label="Today"><Today /></Phone>
        <Phone label={c.name}><c.C /></Phone>
      </div>
    </section>
  );
}

