"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useApp, type Body, type Pin, type Ref } from "@/lib/store";
import { FITS } from "@/lib/data";
import { NextButton, cx, useDesk } from "@/components/ui";
import { SketchPad } from "@/components/SketchPad";
import { Ico, SI } from "@/components/studio-icons";

/* P02 · the studio: "What are we making?" One field, the landing page's Made to measure composer brought into the app.
   References sit as compact chips above the words; the body and the ease are on the toolbar; Create my pattern is the
   field's own button, so the screen has no second footer button and only the back button at the top.

   Adding: + opens the picker straight away, the brush starts a sketch, and on a computer images can be dropped or pasted
   anywhere on the card. A chip opens a viewer with plain actions (Draw on it, Replace, Remove). Drawing happens in the
   pad (SketchPad.tsx). Everything stays on the device, and it is kept in the draft, so going back to this screen from
   the next step finds it as you left it.

   A light screen, because this is a moment of making: the landing page's cloud, its fading dot grid and a soft
   primary-blue light under the card. */

const MAX_REFS = 6;
// uploads are local previews: free their memory when they go
const release = (src?: string) => { if (src?.startsWith("blob:")) { try { URL.revokeObjectURL(src); } catch { /* already freed */ } } };
const num = (v: number, units: "cm" | "in") => (units === "in" ? (v / 2.54).toFixed(1) : String(Math.round(v * 2) / 2));
// a body's three key measurements, or how far its measuring got
const summary = (b: Body, units: "cm" | "in"): ReactNode =>
  ["bust", "waist", "hips"].every((k) => b.done.includes(k))
    ? <>Bust {num(b.measures.bust, units)} · Waist {num(b.measures.waist, units)} · Hip {num(b.measures.hips, units)} <span translate="no">{units}</span></>
    : `${b.done.length} of 24 measurements`;

export function Prompt() {
  const { draft, setDraft, set, go, back, bodies, activeBody, units } = useApp();
  const desk = useDesk();
  const [atts, setAtts] = useState<Ref[]>(() => draft.refs ?? []);
  const [text, setText] = useState(() => draft.prompt ?? "");
  const nextId = useRef(Math.max(0, ...(draft.refs ?? []).map((a) => a.id)) + 1);
  const [menu, setMenu] = useState<null | "body" | "ease">(null); // one menu open at a time
  const bodyBtn = useRef<HTMLButtonElement>(null);
  const easeBtn = useRef<HTMLButtonElement>(null);
  const [focused, setFocused] = useState(false);
  const [view, setView] = useState<number | null>(null);
  const [pad, setPad] = useState<null | { forId?: number }>(null);
  const [drag, setDrag] = useState(false);
  const [over, setOver] = useState(false); // the words run past the field (it scrolls), so the mirror caret steps aside
  const kb = useKeyboard(!desk);
  const file = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const replaceId = useRef<number | null>(null);

  const body = bodies.find((b) => b.id === (draft.bodyId ?? activeBody)) ?? bodies[0];
  const fitChosen = !!draft.chosen?.fit;
  const preset = FITS.find((f) => f.ease === draft.ease);
  const easeLabel = !fitChosen ? "Ease" : preset ? preset.label : `+${draft.ease} cm`;
  const ready = atts.length > 0 || text.trim().length > 0;

  // keep the studio in the draft, so the next step (and coming back to this one) sees it
  useEffect(() => { setDraft({ refs: atts, prompt: text }); }, [atts, text, setDraft]);

  // On a computer the field grows with the words, from five lines up. On a phone it fills the card (the card fills the
  // screen) and scrolls inside once the words run past it.
  useLayoutEffect(() => {
    const t = field.current;
    if (!t) return;
    if (desk) { t.style.height = "auto"; t.style.height = `${t.scrollHeight}px`; } else t.style.height = "";
    const check = () => setOver(t.scrollHeight > t.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(t);
    return () => ro.disconnect();
  }, [text, desk]);
  // with the keyboard up, keep the end of the words in view
  useEffect(() => {
    const t = field.current;
    if (kb.open && t && document.activeElement === t) t.scrollTop = t.scrollHeight;
  }, [kb.open, kb.height]);

  const label = (a: Ref) => `${a.kind === "photo" ? "Photo" : "Sketch"} ${atts.filter((x) => x.kind === a.kind && x.id <= a.id).length}`;
  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (replaceId.current !== null && imgs[0]) {
      const id = replaceId.current;
      const src = URL.createObjectURL(imgs[0]);
      setAtts((l) => l.map((a) => { if (a.id !== id) return a; release(a.src); return { ...a, src, marked: false, pins: [] }; }));
      replaceId.current = null;
      return;
    }
    replaceId.current = null;
    setAtts((l) => [...l, ...imgs.slice(0, Math.max(0, MAX_REFS - l.length)).map((f) => ({ id: nextId.current++, kind: "photo" as const, src: URL.createObjectURL(f) }))]);
  };
  const remove = (a: Ref) => { release(a.src); setAtts((l) => l.filter((x) => x.id !== a.id)); };

  // any press outside the open menu closes it (its own button toggles it); Escape too
  useEffect(() => {
    if (!menu) return;
    const btn = menu === "body" ? bodyBtn : easeBtn;
    const off = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        setMenu(null);
        btn.current?.focus();
        return;
      }
      const t = e.target as Node;
      if (btn.current?.contains(t) || (t as HTMLElement).closest?.(".cmp-menu")) return;
      setMenu(null);
    };
    document.addEventListener("pointerdown", off);
    document.addEventListener("keydown", off);
    return () => { document.removeEventListener("pointerdown", off); document.removeEventListener("keydown", off); };
  }, [menu]);
  const toggle = (m: "body" | "ease") => setMenu((o) => (o === m ? null : m));

  // the viewer closes on Escape
  useEffect(() => {
    if (view === null) return;
    const on = (e: KeyboardEvent) => { if (e.key === "Escape") setView(null); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [view]);

  const pickBody = (id: string) => { set({ activeBody: id }); setDraft({ bodyId: id }); setMenu(null); bodyBtn.current?.focus(); };
  const pickEase = (ease: number) => { setDraft({ ease, chosen: { ...draft.chosen, fit: true } }); setMenu(null); };

  const create = () => {
    setDraft({
      refs: atts,
      photo: (atts.find((a) => a.kind === "photo") ?? atts[0])?.src, // a photo shows the garment best; else the first sketch
      source: atts.some((a) => a.kind === "photo") ? "photo" : atts.length ? "sketch" : "voice",
      prompt: text.trim() || undefined,
      garment: "flutter",
      details: undefined, // a new design is read again
    });
    go("ref");
  };

  const current = view !== null ? atts.find((a) => a.id === view) : undefined;
  const padFor = pad?.forId ? atts.find((a) => a.id === pad.forId) : undefined;

  const card = (
    <div className={cx("cmp-card", drag && "is-drop", current && "is-viewing")} data-need={ready ? "0" : "1"}
      onPaste={(e) => {
        const files = Array.from(e.clipboardData.items).filter((i) => i.type.startsWith("image/")).map((i) => i.getAsFile()).filter(Boolean) as File[];
        if (files.length) { e.preventDefault(); addFiles(files); }
      }}>
      {/* references: only once there is one */}
      {atts.length > 0 && <ul className="cmp-chips" aria-label="References">
        {atts.map((a) => (
          <li key={a.id} className="cmp-chipwrap">
            {/* the whole image opens it; the dots are where the eye goes */}
            <button type="button" className="cmp-chipref" onClick={() => setView(a.id)} title={label(a)}
              aria-label={`${label(a)}${a.marked ? ", marked up" : ""}${a.pins?.length ? `, ${a.pins.length} notes` : ""}. Options`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.src} alt="" draggable={false} />
              <span className="cmp-chipref__more" aria-hidden="true"><Ico d={SI.more} size={18} weight={3} /></span>
              {!!a.pins?.length && <span className="cmp-chipref__count serif">{a.pins.length}</span>}
            </button>
            {/* remove: on the corner, half outside the image */}
            <button type="button" className="cmp-chipx" aria-label={`Remove ${label(a)}`} title="Remove" onClick={() => remove(a)}>
              <Ico d={SI.x} size={11} weight={2.2} />
            </button>
          </li>
        ))}
      </ul>}

      <label className="sr-only" htmlFor="cmp-prompt">Describe it</label>
      <div className={cx("cmp-textwrap", atts.length === 0 && "is-first")}>
        <textarea ref={field} id="cmp-prompt" className="cmp-text" rows={desk ? 5 : 6} value={text} onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Describe it in a few words" autoComplete="off" />
        {/* the cursor at the end of the words, blinking at rest; gone once the field is focused (the real caret takes over),
            and while the words scroll inside the field (the mirror would no longer line up) */}
        {!focused && !over && (
          <div className="cmp-text cmp-mirror" aria-hidden="true">{text}<span className="cmp-caret" /></div>
        )}
      </div>

      {/* the toolbar: adding on the left (photos, a sketch), who and how it fits on the right, then Create */}
      <div className="cmp-tools">
        <div className="cmp-tools__add">
          <button type="button" className="cmp-icon" onClick={() => { replaceId.current = null; file.current?.click(); }} disabled={atts.length >= MAX_REFS} aria-label="Add images" title="Add images">
            <Ico d={SI.plus} size={18} />
          </button>
          <button type="button" className="cmp-icon" onClick={() => setPad({})} disabled={atts.length >= MAX_REFS} aria-label="New sketch" title="Sketch">
            <Ico d={SI.brush} size={17} />
          </button>
        </div>
        <div className="cmp-tools__set">
        {body && (
          <div className="cmp-who relative min-w-0">
            <button ref={bodyBtn} type="button" className="cmp-chip cmp-menu-btn" onClick={() => toggle("body")} aria-expanded={menu === "body"} aria-haspopup="listbox" aria-label={`Drafted to ${body.name}. Change`} title={body.name}>
              <Ico d={SI.tape} size={16} />
              <span className="truncate">{body.name}</span>
              <Ico d={SI.chev} size={14} />
            </button>
            {menu === "body" && (
              <Menu anchor={bodyBtn} label="Draft to">
                {bodies.map((b) => (
                  <li key={b.id}>
                    <button type="button" role="option" aria-selected={b.id === body.id} onClick={() => pickBody(b.id)}>
                      <span className="truncate">{b.name}</span>
                      <span className="cmp-small">{summary(b, units)}</span>
                    </button>
                  </li>
                ))}
              </Menu>
            )}
          </div>
        )}
        {/* ease: a segmented control where there is room, a dropdown where there is not */}
        <div className="cmp-seg cmp-ease" role="group" aria-label="Ease: how much room it has">
          <span className="cmp-seg__label" aria-hidden="true"><Ico d={SI.ease} size={13} />Ease</span>
          {FITS.map((f) => (
            <button key={f.key} type="button" aria-pressed={fitChosen && preset?.key === f.key} onClick={() => pickEase(f.ease)} title={`${f.note}, +${f.ease} cm`}>{f.label}</button>
          ))}
        </div>
        <div className="cmp-ease-drop relative">
          <button ref={easeBtn} type="button" className={cx("cmp-chip cmp-menu-btn", !fitChosen && "is-empty")} onClick={() => toggle("ease")} aria-expanded={menu === "ease"} aria-haspopup="listbox" aria-label={fitChosen ? `Ease: ${easeLabel}. Change` : "Ease: how much room it has. Choose"}>
            <Ico d={SI.ease} size={15} />
            {easeLabel}
            <Ico d={SI.chev} size={14} />
          </button>
          {menu === "ease" && (
            <Menu anchor={easeBtn} label="Ease" end>
              {FITS.map((f) => (
                <li key={f.key}>
                  <button type="button" role="option" aria-selected={fitChosen && preset?.key === f.key} onClick={() => { pickEase(f.ease); easeBtn.current?.focus(); }}>
                    <span className="flex w-full items-baseline justify-between gap-3"><span>{f.label}</span><span className="cmp-small" translate="no">+{f.ease} cm</span></span>
                    <span className="cmp-small">{f.note}</span>
                  </button>
                </li>
              ))}
            </Menu>
          )}
        </div>
        </div>
        <NextButton ready={ready} onClick={create} label="Create my pattern" className="cmp-go" />
      </div>

      {drag && (
        <div className="cmp-drop" aria-hidden="true"><Ico d={SI.image} size={22} />Drop to add</div>
      )}

      {/* the viewer: one reference, large, with plain actions */}
      {current && (
        <div className="cmp-viewer" role="dialog" aria-label={label(current)}>
          <div className="cmp-viewer__img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={label(current)} />
            {current.pins?.map((p, i) => (
              <span key={i} className="pad-pin" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} title={p.note}><span className="serif">{i + 1}</span></span>
            ))}
          </div>
          <div className="cmp-viewer__side">
            <p className="cmp-viewer__title">{label(current)}{current.marked && <span className="cmp-small"> · marked up</span>}</p>
            {!!current.pins?.length && (
              <ol className="mt-2 space-y-1">
                {current.pins.map((p, i) => <li key={i} className="cmp-small flex gap-2"><span className="pad-note__n serif">{i + 1}</span>{p.note}</li>)}
              </ol>
            )}
            <div className="cmp-viewer__actions">
              <button type="button" className="cmp-ghost" onClick={() => { setPad({ forId: current.id }); setView(null); }}><Ico d={SI.brush} size={16} /> Draw on it</button>
              {current.kind === "photo" && (
                <button type="button" className="cmp-ghost" onClick={() => { replaceId.current = current.id; file.current?.click(); setView(null); }}><Ico d={SI.replace} size={16} /> Replace</button>
              )}
              <button type="button" className="cmp-ghost is-danger" onClick={() => { remove(current); setView(null); }}><Ico d={SI.trash} size={16} /> Remove</button>
              <button type="button" className="cmp-ghost is-done" onClick={() => setView(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    // the whole screen takes a dropped image (the card lights up), so a near miss never opens the file in the browser
    // With the keyboard up (phones), the screen sits in the part you can still see, and the title steps aside, so the
    // field and Create stay above the keyboard instead of under it.
    <div className={cx("cmp-page absolute inset-x-0 flex flex-col", kb.open && "is-typing")} style={kb.open ? { top: kb.top, height: kb.height } : { top: 0, bottom: 0 }}
      onDragEnter={(e) => { if (!e.dataTransfer.types.includes("Files")) return; e.preventDefault(); setDrag(true); }}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false); }}
      onDrop={(e) => { if (!e.dataTransfer.files.length) return; e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
      <div className="cmp-dots" aria-hidden="true" />
      <div className="relative z-10 shrink-0 px-4 lg:px-14" style={{ paddingTop: kb.open ? 8 : "var(--top)" }}>
        <div className="flex h-12 items-center"><button type="button" className="cmp-back" onClick={back} aria-label="Back"><Ico d={SI.back} size={20} weight={1.8} /></button></div>
      </div>
      <div className="scroller relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden noscroll px-4 lg:px-14">
        {/* top-aligned: the title, then the field taking the rest of the screen (on a computer, its own height) */}
        <div className="mx-auto flex min-h-full w-full max-w-[880px] flex-col" style={{ paddingBottom: kb.open ? 10 : "calc(var(--bottom) + 8px)" }}>
          {!kb.open && (
            <div className="shrink-0 pt-1 text-center lg:pt-4">
              <h1 className="h1 cmp-title [text-wrap:balance]">What are we making?</h1>
              <p className="lead cmp-lead mx-auto mt-2 max-w-[400px] [text-wrap:pretty]">Add photos, a sketch or a few words. Mix them however you like.</p>
            </div>
          )}
          {/* the halo bleeds to the screen's edges and is clipped there, so it never makes the page scroll sideways */}
          <div className={cx("-mx-4 flex flex-1 flex-col px-4 [overflow-x:clip] lg:-mx-14 lg:mt-10 lg:flex-none lg:px-14", kb.open ? "mt-1" : "mt-6")}>
            <div className="cmp-wrap relative flex flex-1 flex-col lg:flex-none">
              <div className="cmp-halo" aria-hidden="true" />
              {card}
            </div>
          </div>
        </div>
      </div>

      <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />

      {pad && (
        <SketchPad
          base={padFor?.src}
          pins={padFor?.pins}
          title={padFor ? label(padFor) : "New sketch"}
          onClose={() => setPad(null)}
          onSave={(src: string, pins: Pin[]) => {
            if (padFor) setAtts((l) => l.map((a) => { if (a.id !== padFor.id) return a; release(a.src); return { ...a, src, pins, marked: true }; }));
            else setAtts((l) => (l.length >= MAX_REFS ? l : [...l, { id: nextId.current++, kind: "sketch", src, pins }]));
            setPad(null);
          }}
        />
      )}
    </div>
  );
}

/* The on-screen keyboard on phones. iOS lays it over the page and shrinks only the visual viewport (Android usually
   resizes the page itself, so there this stays closed and the layout simply fits). While a text field is focused and
   the keyboard is up, this reports the part of the screen you can still see. */
function useKeyboard(on: boolean) {
  const [kb, setKb] = useState({ open: false, top: 0, height: 0 });
  useEffect(() => {
    const vv = window.visualViewport;
    if (!on || !vv) return;
    const read = () => {
      const typing = !!document.activeElement?.matches?.("textarea, input:not([type=range]):not([type=file]):not([type=checkbox])");
      const open = typing && window.innerHeight - vv.height > 140;
      setKb((k) => {
        if (!open) return k.open ? { open: false, top: 0, height: 0 } : k;
        return k.open && k.top === vv.offsetTop && k.height === vv.height ? k : { open: true, top: vv.offsetTop, height: vv.height };
      });
    };
    const later = () => setTimeout(read, 60); // focus moves before the keyboard does
    vv.addEventListener("resize", read);
    vv.addEventListener("scroll", read);
    window.addEventListener("focusin", later);
    window.addEventListener("focusout", later);
    return () => { vv.removeEventListener("resize", read); vv.removeEventListener("scroll", read); window.removeEventListener("focusin", later); window.removeEventListener("focusout", later); };
  }, [on]);
  return kb;
}

/* A menu off its button, drawn into the device frame (a portal) so no scroll area or card can clip it. It opens below
   the button when there is room, above when there is not, and keeps to the screen's edges. `end` lines it up with the
   button's right edge. */
function Menu({ anchor, label, end, children }: { anchor: RefObject<HTMLButtonElement | null>; label: string; end?: boolean; children: ReactNode }) {
  const el = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState<CSSProperties>({ visibility: "hidden" });
  useLayoutEffect(() => {
    const place = () => {
      const b = anchor.current?.getBoundingClientRect();
      const m = el.current;
      if (!b || !m) return;
      const frame = (document.querySelector(".device") ?? document.documentElement).getBoundingClientRect();
      const w = m.offsetWidth;
      const h = m.offsetHeight;
      const gap = 8;
      const below = frame.bottom - b.bottom - gap >= h || b.top - frame.top - gap < h;
      const x = end ? b.right - w : b.left;
      setAt({ top: below ? b.bottom + gap : b.top - gap - h, left: Math.max(frame.left + gap, Math.min(x, frame.right - w - gap)) });
    };
    // placing it needs its measured size, so it is placed before the first paint
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [anchor, end]);
  return createPortal(
    <ul ref={el} className="cmp-menu" style={at} role="listbox" aria-label={label}>{children}</ul>,
    document.querySelector(".device") ?? document.body,
  );
}
