"use client";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "./icons";
import { useApp } from "@/lib/store";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

// ─── Screen shell ─────────────────────────────────────────────────────
// header (optional, pinned) · scroll area (only scrolls, and only fades, when content overflows) · footer (pinned, no backdrop).
export function Screen({ children, footer, header, className, bg, noPad, wide, dock }: { children: ReactNode; footer?: ReactNode; header?: ReactNode; className?: string; bg?: ReactNode; noPad?: boolean; fixed?: boolean; wide?: boolean; dock?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const check = () => setOver(el.scrollHeight - el.clientHeight > 2 && el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    const ro = new ResizeObserver(check); ro.observe(el); if (el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener("scroll", check, { passive: true }); check();
    return () => { ro.disconnect(); el.removeEventListener("scroll", check); };
  }, []);
  const max = wide ? "lg:max-w-[1280px]" : "lg:max-w-[1180px]";
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="dotgrid" />
      {bg}
      {header && <div className="relative z-10 shrink-0 px-6 lg:px-14" style={{ paddingTop: "var(--top)" }}><div className={cx("lg:mx-auto lg:w-full", max)}>{header}</div></div>}
      <div ref={ref} className={cx("scroller relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden noscroll", over && "is-over", !noPad && "px-6", "lg:px-14", className)} style={{ paddingTop: header ? 0 : "var(--top)" }}>
        <div className={cx("lg:mx-auto lg:w-full", max, "pb-5", !footer && "pb-[calc(var(--bottom)+12px)]")}>
          {children}
        </div>
      </div>
      {footer && (
        <div className="relative z-10 shrink-0 px-6 pt-2 lg:px-14" style={{ paddingBottom: dock ? "var(--dock)" : "var(--bottom)" }}>
          <div className={cx("lg:mx-auto lg:flex lg:w-full lg:justify-end", max)}>
            <div className="lg:w-[480px]">{footer}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Crown: the app's light gradient (from the landing page), animated with four drifting lights.
export const Crown = ({ className }: { className?: string }) => (
  <div className={cx("sky sky-light", className)} aria-hidden><span className="drift d1" /><span className="drift d2" /><span className="drift d3" /><span className="drift d4" /></div>
);

// A "moment" screen in the onboarding style: a violet picture panel and warm paper below (side by side on desktop).
// Used where something starts or finishes, so those screens stand apart from the dark working screens.
export function PaperScreen({ art, children, footer, top, artH = "h-[54%]" }: { art: ReactNode; children: ReactNode; footer: ReactNode; top?: ReactNode; artH?: string }) {
  const desk = useDesk();
  if (desk) return (
    <div className="paper absolute inset-0 grid grid-cols-[1.05fr_0.95fr]">
      <div className="p-5"><div className="relative h-full overflow-hidden rounded-[36px] text-white"><Crown />{art}{top && <div className="absolute inset-x-0 top-0 p-8">{top}</div>}</div></div>
      <div className="flex min-h-0 flex-col justify-center overflow-y-auto px-14 py-10 noscroll"><div className="mx-auto w-full max-w-[480px]">{children}<div className="mt-10">{footer}</div></div></div>
    </div>
  );
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <div className={cx("relative shrink-0 overflow-hidden rounded-b-[32px] text-white", artH)}><Crown />{art}{top && <div className="absolute inset-x-0 top-0 px-5" style={{ paddingTop: "var(--top)" }}>{top}</div>}</div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-5 noscroll"><div className="my-auto py-2">{children}</div></div>
      <div className="shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}>{footer}</div>
    </div>
  );
}

// Two-column desktop layout; stacks in order on phones.
export function Split({ left, right, className, cols = "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]", center = true }: { left: ReactNode; right: ReactNode; className?: string; cols?: string; center?: boolean }) {
  return (
    <div className={cx("lg:grid lg:gap-16", cols, center && "lg:min-h-[calc(100dvh-var(--top)-var(--bottom)-120px)] lg:items-center", className)}>
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}

export function TopBar({ eyebrow, left = null, onLeft, right, onRight, center = false, children }: { eyebrow?: string; left?: "back" | "close" | null; onLeft?: () => void; right?: IconName | null; onRight?: () => void; center?: boolean; children?: ReactNode }) {
  const back = useApp((s) => s.back);
  return (
    <div className={cx("flex h-12 items-center gap-3", center && "justify-center")}>
      {left && <RB icon={left} onClick={onLeft ?? back} label={left === "back" ? "Back" : "Close"} />}
      {eyebrow && <span className={cx("eyebrow", center && "absolute left-0 right-0 text-center pointer-events-none")}>{eyebrow}</span>}
      <div className="flex-1" />
      {children}
      {right && <RB icon={right} onClick={onRight} label={right} />}
    </div>
  );
}

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cx("eyebrow", className)}>{children}</div>;
export const H1 = ({ children, className }: { children: ReactNode; className?: string }) => <h1 className={cx("h1", className)}>{children}</h1>;
export const HS = ({ children, className }: { children: ReactNode; className?: string }) => <h1 className={cx("h-serif", className)}>{children}</h1>;
export const Lead = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx("lead", className)}>{children}</p>;

// ─── Buttons ──────────────────────────────────────────────────────────
export function Pill({ children, variant = "primary", onClick, className, icon, disabled, style }: { children: ReactNode; variant?: "primary" | "glass" | "white" | "dark"; onClick?: () => void; className?: string; icon?: ReactNode; disabled?: boolean; style?: CSSProperties }) {
  return (
    <button onClick={onClick} disabled={disabled} style={style} className={cx("pill w-full", `pill-${variant}`, disabled && "opacity-40", className)}>
      {icon}
      {children}
    </button>
  );
}

export function RB({ icon, onClick, label, variant = "glass", size = 44, className, style }: { icon: IconName; onClick?: () => void; label?: string; variant?: "glass" | "dark" | "white" | "primary"; size?: number; className?: string; style?: CSSProperties }) {
  const v = variant === "white" ? "!bg-white !text-bg" : variant === "primary" ? "!bg-primary !border-primary" : variant === "dark" ? "rb-sm" : "";
  return (
    <button aria-label={label ?? icon} onClick={onClick} className={cx("rb shrink-0", v, className)} style={{ width: size, height: size, ...style }}>
      <Icon name={icon} size={Math.round(size * 0.46)} />
    </button>
  );
}

// Bottom bar for steps: round back button on the left, the primary button filling the rest of the row.
// With no back button the primary button runs full width. Until a choice is made it is greyed out;
// tapping it then points at what is still missing (see showNeeded).
export function Arrows({ onPrev, onNext, hidePrev, ready = true, label = "Next" }: { onPrev?: () => void; onNext?: () => void; hidePrev?: boolean; ready?: boolean; label?: string; nudge?: boolean; nextLabel?: string }) {
  const back = useApp((s) => s.back);
  return (
    <div className="flex items-center gap-3 pb-1">
      {!hidePrev && <RB icon="back" variant="dark" size={56} onClick={onPrev ?? back} label="Back" />}
      <NextButton ready={ready} onClick={onNext} label={label} className="flex-1" />
    </div>
  );
}

export function NextButton({ ready, onClick, label = "Next", className }: { ready: boolean; onClick?: () => void; label?: string; nudge?: boolean; className?: string }) {
  return (
    <button aria-disabled={!ready} onClick={(e) => (ready ? onClick?.() : showNeeded(e.currentTarget))}
      className={cx("pill pill-primary min-w-0 px-6", !ready && "is-off", className)}>
      <span className="truncate">{label}</span>
    </button>
  );
}

// A blocked Next: briefly mark every still-empty required input on the current screen ([data-need="1"])
// with a small shake and a violet edge, then let it settle. Quiet, and only on demand.
export function showNeeded(from: Element) {
  const root = from.closest(".device") ?? document;
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-need="1"]'));
  els.forEach((el) => { el.classList.remove("need-flash"); void el.offsetWidth; el.classList.add("need-flash"); setTimeout(() => el.classList.remove("need-flash"), 900); });
  if (els[0]) els[0].scrollIntoView({ block: "nearest", behavior: "smooth" });
  try { navigator.vibrate?.(12); } catch {}
}

// Selectable option card (no option is ever pre-selected): radio ring idle, violet edge + gradient when chosen.
export function Option({ on, onClick, children, className, radio = true }: { on: boolean; onClick: () => void; children: ReactNode; className?: string; radio?: boolean }) {
  return (
    <div role="radio" aria-checked={on} tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }} className={cx("opt text-left", on && "on", className)}>
      {children}
      {radio && <span className="radio absolute right-4 top-4">{on && <Icon name="check" size={13} strokeWidth={3} />}</span>}
    </div>
  );
}

export function Chip({ children, on, onClick, className, icon }: { children: ReactNode; on?: boolean; onClick?: () => void; className?: string; icon?: IconName }) {
  return (
    <button onClick={onClick} className={cx("chip tap", on && "on", className)}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}

export function Check({ on = true, size = 26, className }: { on?: boolean; size?: number; className?: string }) {
  return (
    <span className={cx("grid shrink-0 place-items-center rounded-full transition-all", on ? "bg-white text-bg" : "border border-white/30", className)} style={{ width: size, height: size }}>
      {on && <Icon name="check" size={size * 0.62} strokeWidth={2.4} />}
    </span>
  );
}

// ─── Surfaces ─────────────────────────────────────────────────────────
export function Glow({ children, color = "#687ef5", variant = "edge", className, onClick, style }: { children?: ReactNode; color?: string; variant?: "edge" | "fade" | "side" | "orb" | "dim"; className?: string; onClick?: () => void; style?: CSSProperties; as?: "div" | "button" }) {
  return (
    <div {...press(onClick)} className={cx("glow text-left", variant, onClick && "tap cursor-pointer transition-transform select-none", className)} style={{ ["--gc" as string]: color, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

// div that behaves like a button (buttons vertically centre their content, which breaks card layouts)
function press(onClick?: () => void) {
  if (!onClick) return {};
  return { role: "button", tabIndex: 0, onClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } };
}

export function Glass({ children, className, onClick, selected, strong }: { children?: ReactNode; className?: string; onClick?: () => void; selected?: boolean; strong?: boolean }) {
  return (
    <div {...press(onClick)} className={cx(strong ? "glass-2" : "glass", "text-left transition-all", onClick && "tap cursor-pointer select-none", selected && "sel", className)}>
      {children}
    </div>
  );
}

export function Segmented({ items, value, onChange, className }: { items: string[]; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cx("glass relative flex h-12 rounded-full p-1", className)}>
      {items.map((it) => (
        <button key={it} onClick={() => onChange(it)} className="relative z-10 flex-1 rounded-full text-[14px] font-medium">
          {value === it && <motion.span layoutId={"seg" + items.join()} className="absolute inset-0 -z-10 rounded-full bg-white" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />}
          <span className={value === it ? "font-semibold text-bg" : "text-white/70"}>{it}</span>
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={cx("relative h-8 w-[52px] rounded-full transition-colors", on ? "bg-primary" : "bg-white/15")} aria-pressed={on}>
      <motion.span layout className="absolute top-1 h-6 w-6 rounded-full bg-white" style={{ left: on ? 24 : 4 }} transition={{ type: "spring", bounce: 0.3 }} />
    </button>
  );
}

export function Field({ label, value, onChange, type = "text", placeholder, inputMode, autoComplete = "off", error }: { label: string; value: string; onChange: (v: string) => void; type?: string; focus?: boolean; placeholder?: string; inputMode?: "email" | "text"; autoComplete?: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-medium text-white/70">{label}</span>
      <span className="field flex h-14 items-center px-4">
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} inputMode={inputMode} autoComplete={autoComplete} autoCapitalize="off" spellCheck={false} className="text-[17px]" />
      </span>
      {error && <span className="mt-1.5 block text-[13px] text-peri">{error}</span>}
    </label>
  );
}

export function Dots({ n, i, className }: { n: number; i: number; className?: string }) {
  return (
    <div className={cx("flex items-center justify-center gap-1.5", className)}>
      {Array.from({ length: n }, (_, k) => (
        <motion.span key={k} animate={{ width: k === i ? 22 : 8, opacity: k === i ? 1 : 0.28 }} className="h-2 rounded-full bg-white" />
      ))}
    </div>
  );
}

// Bottom sheet on phones, centred dialog on desktop
// Overlays render into the device frame, so they always cover the whole screen (never clipped by a scroll area).
function Layer({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<Element | null>(null);
  useEffect(() => setEl(document.querySelector(".device") ?? document.body), []);
  return el ? createPortal(children, el) : null;
}

export function Sheet({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <Layer><AnimatePresence>
      {open && (
        <>
          <motion.div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="pointer-events-none absolute inset-0 z-50 flex items-end justify-center lg:items-center">
            <motion.div className={cx("pointer-events-auto w-full rounded-t-[36px] border-t border-white/15 px-6 pt-3 lg:w-[480px] lg:rounded-[32px] lg:border lg:px-8 lg:pb-8 lg:pt-6", className)} style={{ paddingBottom: "var(--bottom)", background: "linear-gradient(180deg, #2a2f48 0%, #161826 60%)" }}
              initial={{ y: "100%", opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }} onDragEnd={(_, i) => { if (i.offset.y > 90) onClose(); }}>
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/30 lg:hidden" />
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence></Layer>
  );
}

// Toast
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2200); return () => clearTimeout(t); }, [msg]);
  const node = (
    <Layer><AnimatePresence>
      {msg && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="pointer-events-none absolute inset-x-6 bottom-28 z-50 flex justify-center lg:bottom-12">
          <div className="glass-2 flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-medium"><Icon name="check" size={16} /> {msg}</div>
        </motion.div>
      )}
    </AnimatePresence></Layer>
  );
  return { toast: setMsg, node };
}

// Flow progress: labelled segments; each fills 0..1. Used by every setup and measuring step so progress always reads the same way.
export function FlowProgress({ steps, className }: { steps: { label: string; value: number }[]; className?: string }) {
  const cur = steps.findIndex((s) => s.value < 1);
  return (
    <div className={cx("flex gap-1.5", className)}>
      {steps.map((s, i) => (
        <div key={s.label} className="min-w-0 flex-1">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/12"><motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${Math.round(Math.min(1, s.value) * 100)}%` }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }} /></div>
          <div className={cx("mt-1.5 truncate text-[12px]", i === cur ? "text-white" : s.value >= 1 ? "text-white/60" : "text-white/35")}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// Big serif number with unit
export function Num({ v, unit, size = 44, className }: { v: string | number; unit?: string; size?: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-baseline gap-2", className)}>
      <span className="serif leading-none" style={{ fontSize: size }}>{v}</span>
      {unit && <span className="unit" translate="no">{unit}</span>}
    </span>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx("h-1 overflow-hidden rounded-full bg-white/10", className)}>
      <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

export function Blob({ className, color = "#687ef5", style }: { className?: string; color?: string; style?: CSSProperties }) {
  const stops = [[0, 1], [15, .9], [30, .72], [44, .52], [56, .35], [67, .21], [77, .11], [86, .045], [93, .014], [100, 0]].map(([p, a]) => `color-mix(in srgb, ${color} ${a * 100}%, transparent) ${p}%`).join(", ");
  return <div className={cx("pointer-events-none absolute scale-[1.6] blur-[40px]", className)} style={{ background: `radial-gradient(closest-side, ${stops})`, ...style }} />;
}

// true on desktop-width screens (≥1024px)
export function useDesk() {
  const [d, setD] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const f = () => setD(m.matches);
    f(); m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return d;
}

// Hover / press gradient effects that live inside a card. Put <FX kind="…" /> as the first child of a
// Glow or Glass that has the "group" class; it fades in and starts moving on hover, or on press on touch.
export type FXKind = "aurora" | "tide" | "orbit" | "sheen" | "ripple";
export function FX({ kind }: { kind: FXKind }) {
  const n = kind === "aurora" ? 3 : kind === "orbit" ? 2 : kind === "ripple" ? 3 : 1;
  return <span aria-hidden className={`fx fx-${kind}`}>{Array.from({ length: n }, (_, i) => <i key={i} />)}</span>;
}
