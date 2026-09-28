"use client";
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon, type IconName } from "./icons";
import { useApp } from "@/lib/store";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

// ─── Screen shell ─────────────────────────────────────────────────────
// Phone: full-bleed column. Desktop (lg): centred content column with a right-aligned action bar.
export function Screen({ children, footer, className, bg, noPad, fixed, wide }: { children: ReactNode; footer?: ReactNode; className?: string; bg?: ReactNode; noPad?: boolean; fixed?: boolean; wide?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="dotgrid" />
      {bg}
      <div className={cx("relative flex-1 noscroll", fixed ? "overflow-hidden lg:overflow-y-auto" : "overflow-y-auto overflow-x-hidden", !noPad && "px-6", "lg:px-14", className)} style={{ paddingTop: "var(--top)" }}>
        <div className={cx("lg:mx-auto lg:w-full", wide ? "lg:max-w-[1280px]" : "lg:max-w-[1180px]")}>
          {children}
        </div>
        {footer && <div className="h-4" />}
      </div>
      {footer && (
        <div className="relative z-10 px-6 pt-3 lg:px-14" style={{ paddingBottom: "var(--bottom)", background: "linear-gradient(to top, #0b0c15 55%, rgba(11,12,21,0))" }}>
          <div className={cx("lg:mx-auto lg:flex lg:w-full lg:justify-end", wide ? "lg:max-w-[1280px]" : "lg:max-w-[1180px]")}>
            <div className="lg:w-[480px]">{footer}</div>
          </div>
        </div>
      )}
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

export function Arrows({ onPrev, onNext, hidePrev, nextLabel }: { onPrev?: () => void; onNext?: () => void; hidePrev?: boolean; nextLabel?: string }) {
  const back = useApp((s) => s.back);
  return (
    <>
      <div className="flex items-center justify-between pb-1 lg:hidden">
        {hidePrev ? <span /> : <RB icon="back" variant="dark" size={42} onClick={onPrev ?? back} label="Previous" />}
        {nextLabel && <span className="text-[13px] text-white/50">{nextLabel}</span>}
        <RB icon="chevR" variant="dark" size={42} onClick={onNext} label="Next" />
      </div>
      <div className="hidden items-center gap-3 lg:flex">
        {!hidePrev && <Pill variant="dark" className="!w-[150px]" onClick={onPrev ?? back} icon={<Icon name="back" size={18} />}>Back</Pill>}
        <Pill className="flex-1" onClick={onNext}>Continue<Icon name="chevR" size={18} /></Pill>
      </div>
    </>
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

export function Field({ label, value, onChange, type = "text", focus, placeholder, inputMode }: { label: string; value: string; onChange: (v: string) => void; type?: string; focus?: boolean; placeholder?: string; inputMode?: "email" | "text" }) {
  const [f, setF] = useState(false);
  return (
    <label className={cx("glass block h-16 rounded-[20px] px-[18px] pt-3 transition-all", (f || focus) && "sel")}>
      <span className="block text-[10px] font-medium uppercase tracking-[.08em] text-white/45">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} type={type} placeholder={placeholder} inputMode={inputMode} autoComplete="off" autoCapitalize="off"
        className="mt-1 w-full bg-transparent text-[16px] font-medium outline-none placeholder:text-white/30 caret-primary" />
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
export function Sheet({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <AnimatePresence>
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
    </AnimatePresence>
  );
}

// Toast
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2200); return () => clearTimeout(t); }, [msg]);
  const node = (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="pointer-events-none absolute inset-x-6 bottom-28 z-50 flex justify-center lg:bottom-12">
          <div className="glass-2 flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-medium"><Icon name="check" size={16} /> {msg}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return { toast: setMsg, node };
}

// Stepper (wizard)
export function Stepper({ step, done }: { step: number; done: number[] }) {
  const labels = ["Around", "Down", "Across", "Sitting"];
  return (
    <div className="relative flex justify-between px-1">
      <div className="absolute left-[26px] right-[26px] top-[13px] h-px bg-white/15" />
      <motion.div className="absolute left-[26px] top-[13px] h-px bg-primary" animate={{ width: `calc((100% - 52px) * ${Math.min(3, Math.max(0, step - 1 + (done.includes(step) ? 1 : 0))) / 3})` }} />
      {labels.map((l, i) => {
        const n = i + 1; const isDone = done.includes(n); const cur = n === step && !isDone;
        return (
          <div key={l} className="relative z-10 flex w-[52px] flex-col items-center gap-1.5">
            <span className={cx("grid h-[26px] w-[26px] place-items-center rounded-full text-[11px] font-semibold transition-colors", isDone ? "bg-primary" : cur ? "bg-white text-bg shadow-[0_0_0_5px_rgba(255,255,255,.12)]" : "border border-white/25 bg-bg text-white/50")}>
              {isDone ? <Icon name="check" size={14} strokeWidth={2.6} /> : n}
            </span>
            <span className={cx("text-[11px]", cur || isDone ? "text-white" : "text-white/40")}>{l}</span>
          </div>
        );
      })}
    </div>
  );
}

// Big serif number with unit
export function Num({ v, unit, size = 44, className }: { v: string | number; unit?: string; size?: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-baseline gap-2", className)}>
      <span className="serif leading-none" style={{ fontSize: size }}>{v}</span>
      {unit && <span className="text-[11px] font-medium uppercase tracking-[.08em] text-white/50">{unit}</span>}
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
  return <div className={cx("pointer-events-none absolute rounded-full blur-[70px]", className)} style={{ background: color, ...style }} />;
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
