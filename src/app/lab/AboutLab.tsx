"use client";
// Lab · About Venty (25 Oct 2026): a page in the profile about who made Venty, Natalia Chamon: her portrait, how to reach
// her, a little about Venty, and at the very end the attributions for the 3D garments and bodies, on a page of their own.
// Six ways to show her; each phone works (tap the last row for the attributions). Her portrait is the landing page's
// master (Venty-landing-page/media/people). Her email, phone and LinkedIn are not known yet (the landing page leaves them
// empty too), so those rows say so.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Icon, type IconName } from "@/components/icons";
import { cx, Crown } from "@/components/ui";
import { BODY_CREDIT, GARMENT_CREDITS, LICENCE_URL } from "@/lib/credits";

// ─── who made Venty (only what is known: the landing page's footer, "Designer of Venty · QUT, Brisbane") ───
const NATALIA = {
  first: "Natalia", last: "Chamon", role: "Designer of Venty", place: "QUT, Brisbane",
  photo: "/lab/natalia.webp", cut: "/lab/natalia-cut.webp",
};
type Contact = { k: string; icon: IconName | "linkedin"; label: string; value: string; href: string };
const CONTACTS: Contact[] = [
  { k: "web", icon: "link", label: "Portfolio", value: "nataliachamon.com", href: "https://nataliachamon.com/" },
  { k: "mail", icon: "mail", label: "Email", value: "", href: "" },
  { k: "phone", icon: "phone", label: "Phone", value: "", href: "" },
  { k: "in", icon: "linkedin", label: "LinkedIn", value: "", href: "" },
];
const VENTY = "Venty drafts sewing patterns to your own measurements. This is the demo made for the QUT Design Festival 2026.";

// ─── small parts ───
function Pick<T extends string>({ items, value, onChange }: { items: { k: T; name: string }[]; value: T; onChange: (k: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">{items.map((x) => (
      <button key={x.k} onClick={() => onChange(x.k)} aria-pressed={value === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", value === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
}
function Glyph({ icon, size = 20 }: { icon: Contact["icon"]; size?: number }) {
  if (icon === "linkedin") return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M8 10.5V16M8 7.6v.1M11.5 16v-5.5M11.5 13.2q0-2.7 2.4-2.7 2.1 0 2.1 2.6V16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  );
  return <Icon name={icon} size={size} />;
}
// a link out (a new tab), or, while the value is not known yet, a quiet row that says so
function Out({ c, className, children }: { c: Contact; className?: string; children: ReactNode }) {
  if (!c.href) return <div className={cx(className, "opacity-60")} aria-disabled>{children}</div>;
  const web = /^https?:/.test(c.href);
  return <a href={c.href} className={className} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}
const valueOf = (c: Contact) => c.value || "To be added";

function Back({ onClick, light }: { onClick?: () => void; light?: boolean }) {
  return <button onClick={onClick} aria-label="Back" className={cx("rb rb-sm", light && "!bg-white/70 !text-ink !shadow-none")}><Icon name="back" size={18} /></button>;
}

// the last row on every version: the attributions, on their own page
function AttributionsRow({ onOpen, light }: { onOpen: () => void; light?: boolean }) {
  return (
    <button onClick={onOpen} className={cx("mt-8 flex w-full items-center gap-3 rounded-[18px] px-4 py-3.5 text-left", light ? "bg-ink/[.05]" : "bg-white/[.05]")}>
      <span className="flex-1"><span className="block text-[15px] font-medium">3D garment attributions</span><span className={cx("block text-[13px]", light ? "text-ink/55" : "text-white/50")}>Who made the 3D bodies and garments</span></span>
      <Icon name="chevR" size={18} className={light ? "text-ink/40" : "text-white/40"} />
    </button>
  );
}

// ─── the attributions page (the same for every version) ───
const byAuthor = (() => {
  const m = new Map<string, typeof GARMENT_CREDITS>();
  for (const c of GARMENT_CREDITS) m.set(c.author, [...(m.get(c.author) ?? []), c]);
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
})();
function Licence({ l }: { l: string }) {
  const url = LICENCE_URL[l];
  const cls = "rounded-full bg-white/[.07] px-2 py-0.5 text-[12px] text-white/70";
  return url ? <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>{l}</a> : <span className={cls}>{l}</span>;
}
function Attributions({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg px-5 pb-10 pt-12 text-white noscroll">
      <Back onClick={onBack} />
      <h1 className="mt-5 text-[30px] font-normal leading-[1.05] tracking-[-.03em]">3D garment attributions</h1>
      <p className="mt-3 text-[15px] leading-snug text-white/65">The 3D body and the garments you see it wear were made by the MakeHuman community and shared under open licences. Every garment was changed for Venty: fitted to Venty&apos;s bodies, resized with your measurements, and its textures made smaller.</p>
      <div className="mt-6 rounded-[20px] bg-white/[.04] px-4 py-3.5">
        <div className="text-[15px] font-medium">{BODY_CREDIT.title}</div>
        <div className="mt-1 flex items-center gap-2 text-[13px] text-white/55">{BODY_CREDIT.author}<Licence l={BODY_CREDIT.licence} /></div>
      </div>
      {byAuthor.map(([author, list]) => (
        <section key={author} className="mt-6">
          <h2 className="flex items-baseline justify-between text-[16px] font-medium">{author}<span className="text-[13px] font-normal text-white/45">{list.length} {list.length === 1 ? "garment" : "garments"}</span></h2>
          <ul className="mt-2 divide-y divide-white/[.07] rounded-[18px] bg-white/[.04] px-4">
            {list.map((c) => (
              <li key={c.asset} className="flex items-center gap-3 py-3">
                <a href={c.source} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-[14px] text-white/85 underline decoration-white/20 underline-offset-4">{c.title}</a>
                <Licence l={c.licence} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-6 text-[13px] leading-snug text-white/45">Each title opens the garment&apos;s page in the MakeHuman asset repository. CC BY: shared on condition its maker is credited. CC0: no rights reserved.</p>
    </div>
  );
}

// a phone whose About page opens the attributions, sliding in from the right
function Device({ label, about, light }: { label: string; about: (open: () => void) => ReactNode; light?: boolean }) {
  const [page, setPage] = useState<"about" | "credits">("about");
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className={cx("relative isolate h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[46px] shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]", light ? "paper" : "bg-bg")}>
        <div className="absolute inset-0 overflow-y-auto noscroll">{about(() => setPage("credits"))}</div>
        <AnimatePresence>
          {page === "credits" && (
            <motion.div key="c" className="absolute inset-0 z-20" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }}>
              <Attributions onBack={() => setPage("about")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

// ─── 1 · Portrait cover: her photo fills the top and fades into the page, her name over the fade ───
function Cover({ open }: { open: () => void }) {
  return (
    <div className="relative min-h-full pb-10 text-white">
      <div className="relative h-[430px]">
        <img src={NATALIA.photo} alt="Natalia Chamon" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(11 12 21 / .35) 0%, transparent 22%, transparent 48%, var(--color-bg) 96%)" }} />
        <div className="absolute left-5 top-12"><Back /></div>
        <div className="absolute inset-x-5 bottom-2">
          <h1 className="text-[46px] font-normal leading-[.95] tracking-[-.04em]">{NATALIA.first}<br />{NATALIA.last}</h1>
          <p className="mt-3 text-[15px] text-white/65">{NATALIA.role} · {NATALIA.place}</p>
        </div>
      </div>
      <div className="px-5">
        <div className="mt-6 divide-y divide-white/[.07] rounded-[22px] bg-white/[.04] px-4">
          {CONTACTS.map((c) => (
            <Out key={c.k} c={c} className="flex items-center gap-3.5 py-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[.07] text-white/85"><Glyph icon={c.icon} size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block text-[13px] text-white/50">{c.label}</span><span className="block truncate text-[15px]">{valueOf(c)}</span></span>
              {c.href && <Icon name="chevR" size={16} className="text-white/35" />}
            </Out>
          ))}
        </div>
        <h2 className="mt-8 text-[20px] font-normal tracking-[-.02em]">About Venty</h2>
        <p className="mt-2 text-[15px] leading-snug text-white/65">{VENTY}</p>
        <AttributionsRow onOpen={open} />
      </div>
    </div>
  );
}

// ─── 2 · Cover story: Crown, her name set huge behind her, her cut-out in front; the contacts as round actions ───
function Story({ open }: { open: () => void }) {
  const still = useReducedMotion();
  return (
    <div className="relative min-h-full pb-10">
      <div className="relative h-[470px] overflow-hidden text-white">
        <Crown live className="!absolute" />
        <div className="absolute left-5 top-12 z-20"><Back light /></div>
        <motion.div className="absolute inset-x-0 top-[84px] z-0 text-center leading-[.84] tracking-[-.06em]"
          initial={still ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}>
          <div className="text-[80px] font-normal">{NATALIA.first}</div>
          <div className="text-[80px] font-normal text-white/60">{NATALIA.last}</div>
        </motion.div>
        <motion.img src={NATALIA.cut} alt="Natalia Chamon" className="absolute -bottom-2 left-1/2 z-10 w-[290px] -translate-x-1/2"
          initial={still ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }} />
      </div>
      <div className="px-5 text-ink">
        <p className="mt-5 text-center text-[15px] text-ink/60">{NATALIA.role} · {NATALIA.place}</p>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {CONTACTS.map((c) => (
            <Out key={c.k} c={c} className="flex flex-col items-center gap-2">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-white"><Glyph icon={c.icon} /></span>
              <span className="text-[13px] text-ink/70">{c.label}</span>
            </Out>
          ))}
        </div>
        <div className="paper-card mt-7 rounded-[22px] px-4 py-4">
          <h2 className="text-[18px] font-normal tracking-[-.02em]">About Venty</h2>
          <p className="mt-1.5 text-[15px] leading-snug text-ink/65">{VENTY}</p>
        </div>
        <AttributionsRow onOpen={open} light />
      </div>
    </div>
  );
}

// ─── 3 · Her card: a card you can tilt (it follows the finger) and flip over for how to reach her ───
function CardPage({ open }: { open: () => void }) {
  const [flip, setFlip] = useState(false);
  const still = useReducedMotion();
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 180, damping: 18 }), sy = useSpring(ry, { stiffness: 180, damping: 18 });
  const shine = useTransform(sy, [-14, 14], ["20%", "80%"]);
  const glare = useTransform(shine, (x) => `linear-gradient(115deg, transparent 20%, rgb(255 255 255 / .45) ${x}, transparent 80%)`);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (still) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 22); rx.set(-((e.clientY - r.top) / r.height - 0.5) * 22);
  };
  const face = "absolute inset-0 overflow-hidden rounded-[26px] [backface-visibility:hidden]";
  return (
    <div className="stage-ink relative min-h-full px-5 pb-10 pt-12 text-white">
      <Back />
      <h1 className="mt-5 text-[30px] font-normal tracking-[-.03em]">About Venty</h1>
      <p className="mt-1 text-[15px] text-white/55">Made by {NATALIA.first}. Tap her card to turn it over.</p>
      <div className="mt-6" style={{ perspective: 900 }} onPointerMove={move} onPointerLeave={() => { rx.set(0); ry.set(0); }}>
        {/* tap the card to turn it over (a tap on a link on its back follows the link instead) */}
        <motion.div role="button" tabIndex={0} aria-label={flip ? "Show Natalia's card" : "Show how to reach Natalia"} className="relative block h-[420px] w-full cursor-pointer [transform-style:preserve-3d]"
          onClick={(e) => { if (!(e.target as Element).closest("a")) setFlip((f) => !f); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlip((f) => !f); } }}
          style={{ rotateX: sx, rotateY: sy }}>
          <motion.div className="absolute inset-0 [transform-style:preserve-3d]" animate={{ rotateY: flip ? 180 : 0 }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18 }}>
            {/* the front: her photo, her name */}
            <div className={face}>
              <img src={NATALIA.photo} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_25%]" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, rgb(11 12 21 / .85))" }} />
              <motion.div className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: glare }} />
              <div className="absolute inset-x-5 bottom-5 text-left">
                <div className="text-[30px] font-normal leading-none tracking-[-.03em]">{NATALIA.first} {NATALIA.last}</div>
                <div className="mt-2 text-[14px] text-white/70">{NATALIA.role} · {NATALIA.place}</div>
              </div>
              <div className="absolute inset-0 rounded-[26px] shadow-[inset_0_0_0_1px_rgb(255_255_255/.14)]" />
            </div>
            {/* the back: how to reach her */}
            <div className={cx(face, "violet-panel [transform:rotateY(180deg)]")}>
              <div className="flex h-full flex-col justify-center gap-2 px-5 text-left">
                {CONTACTS.map((c) => (
                  <Out key={c.k} c={c} className="flex items-center gap-3 rounded-[16px] bg-white/[.12] px-4 py-3">
                    <Glyph icon={c.icon} size={18} /><span className="flex-1"><span className="block text-[12px] text-white/70">{c.label}</span><span className="block text-[15px]">{valueOf(c)}</span></span>
                  </Out>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <p className="mt-6 text-[15px] leading-snug text-white/65">{VENTY}</p>
      <AttributionsRow onOpen={open} />
    </div>
  );
}

// ─── 4 · Cut 1: her portrait cut as a pattern piece on the cornflower of the pattern look, its seam allowance dashed
//      round it, a grainline, and its label like a pattern piece's ───
const BODICE = "M40 18h70q14 40 50 40l58-26 24 70q-40 22-34 74l8 124H40z";
function PiecePage({ open }: { open: () => void }) {
  const still = useReducedMotion();
  return (
    <div className="relative min-h-full pb-10 pt-24 text-white" style={{ background: "#687ef5" }}>
      <div className="absolute left-5 top-12 z-10"><Back /></div>
      <div className="relative mx-auto h-[340px] w-[290px]">
        <svg viewBox="0 0 290 340" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs><clipPath id="cut1"><path d={BODICE} /></clipPath></defs>
          <image href={NATALIA.photo} x="10" y="10" width="290" height="330" preserveAspectRatio="xMidYMin slice" clipPath="url(#cut1)" />
          <motion.path d={BODICE} fill="none" stroke="#f0f4fe" strokeWidth="2.5" initial={still ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut" }} />
          <path d={BODICE} fill="none" stroke="#f0f4fe" strokeWidth="1.4" strokeDasharray="7 6" transform="translate(145 175) scale(1.09) translate(-145 -175)" opacity=".85" />
          <path d="M262 120v130M254 128l8-8 8 8M254 242l8 8 8-8" fill="none" stroke="#f0f4fe" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="px-6">
        <div className="mt-4 text-[13px] text-white/80">Cut 1 · the designer</div>
        <h1 className="mt-1 text-[40px] font-normal leading-none tracking-[-.04em]">{NATALIA.first} {NATALIA.last}</h1>
        <p className="mt-2 text-[15px] text-white/80">{NATALIA.role} · {NATALIA.place}</p>
        <div className="mt-6 space-y-2">
          {CONTACTS.map((c) => (
            <Out key={c.k} c={c} className="flex items-center gap-3 rounded-[16px] border border-dashed border-white/50 px-4 py-3">
              <Glyph icon={c.icon} size={18} /><span className="flex-1 text-[15px]">{c.value || c.label}</span><span className="text-[13px] text-white/70">{c.value ? c.label : "To be added"}</span>
            </Out>
          ))}
        </div>
        <p className="mt-7 text-[15px] leading-snug text-white/85">{VENTY}</p>
        <button onClick={open} className="mt-8 flex w-full items-center gap-3 rounded-[18px] bg-white/[.14] px-4 py-3.5 text-left">
          <span className="flex-1"><span className="block text-[15px] font-medium">3D garment attributions</span><span className="block text-[13px] text-white/70">Who made the 3D bodies and garments</span></span>
          <Icon name="chevR" size={18} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}

// ─── 5 · Halftone: her portrait drawn in dots (as on the landing page's footer), the contacts as tiles ───
function Halftone({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const c = ref.current; if (!c) return;
      const S = 320, step = 6, dpr = 2;
      c.width = S * dpr; c.height = S * dpr;
      const x = c.getContext("2d"); if (!x) return;
      const o = document.createElement("canvas"); o.width = o.height = S;
      const ox = o.getContext("2d"); if (!ox) return;
      ox.drawImage(img, 0, 0, S, S);
      const px = ox.getImageData(0, 0, S, S).data;
      x.scale(dpr, dpr);
      x.fillStyle = "#f0f4fe";
      for (let y = step / 2; y < S; y += step) for (let q = step / 2; q < S; q += step) {
        const i = (Math.floor(y) * S + Math.floor(q)) * 4;
        // only she is drawn (the cut-out's backdrop is clear), the lighter the bigger the dot
        const l = (0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2]) / 255 * (px[i + 3] / 255);
        const r = (step / 2) * Math.min(1, Math.pow(l, 0.85) * 1.15);
        if (r > 0.25) { x.beginPath(); x.arc(q, y, r, 0, Math.PI * 2); x.fill(); }
      }
    };
  }, [src]);
  return <canvas ref={ref} className={className} aria-label="Portrait of Natalia Chamon, drawn in dots" role="img" />;
}
function DotsPage({ open }: { open: () => void }) {
  return (
    <div className="relative min-h-full px-5 pb-10 pt-12 text-white">
      <Back />
      <div className="relative mt-4 overflow-hidden rounded-[28px] bg-ink">
        <Halftone src={NATALIA.cut} className="block aspect-square w-full" />
        <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(180deg, transparent, var(--color-ink))" }} />
      </div>
      <h1 className="mt-5 text-[38px] font-normal leading-none tracking-[-.04em]">{NATALIA.first} {NATALIA.last}</h1>
      <p className="mt-2 text-[15px] text-white/60">{NATALIA.role} · {NATALIA.place}</p>
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {CONTACTS.map((c, i) => (
          <Out key={c.k} c={c} className={cx("flex flex-col justify-between rounded-[20px] p-4", i === 0 ? "col-span-2 h-[104px] bg-primary" : "h-[104px] bg-white/[.05]")}>
            <Glyph icon={c.icon} />
            <span><span className="block text-[13px] text-white/60">{c.label}</span><span className="block truncate text-[15px]">{valueOf(c)}</span></span>
          </Out>
        ))}
      </div>
      <p className="mt-7 text-[15px] leading-snug text-white/65">{VENTY}</p>
      <AttributionsRow onOpen={open} />
    </div>
  );
}

// ─── 6 · The label: a woven garment label, stitched round its edge and swaying on its loop, "made by" her ───
function LabelPage({ open }: { open: () => void }) {
  const still = useReducedMotion();
  return (
    <div className="relative min-h-full pb-10 text-ink">
      <div className="px-5 pt-12"><Back light /></div>
      <div className="relative mt-2 flex flex-col items-center">
        <div className="h-10 w-px bg-ink/30" />
        <motion.div className="origin-top" animate={still ? {} : { rotate: [-2.2, 2.2, -2.2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <div className="relative w-[270px] rounded-[10px] bg-ink p-2 text-white shadow-[0_24px_50px_-20px_rgb(19_21_35/.6)]">
            <div className="rounded-[6px] border border-dashed border-white/40 px-5 pb-6 pt-5" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgb(255 255 255 / .035) 0 1px, transparent 1px 3px), repeating-linear-gradient(0deg, rgb(255 255 255 / .03) 0 1px, transparent 1px 3px)" }}>
              <div className="mx-auto h-3 w-3 rounded-full bg-bg shadow-[inset_0_1px_2px_rgb(0_0_0/.8)]" />
              <img src={NATALIA.photo} alt="Natalia Chamon" className="mx-auto mt-4 h-[150px] w-[150px] rounded-full object-cover" />
              <div className="mt-5 text-center text-[14px] text-white/60">Made by</div>
              <div className="mt-1 text-center text-[32px] font-normal leading-none tracking-[-.03em]">{NATALIA.first} {NATALIA.last}</div>
              <div className="mx-auto mt-4 h-px w-16 bg-white/25" />
              <div className="mt-4 text-center text-[13px] text-white/60">{NATALIA.role}<br />{NATALIA.place}</div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="px-5">
        <div className="paper-card mt-9 divide-y divide-ink/[.07] rounded-[22px] px-4">
          {CONTACTS.map((c) => (
            <Out key={c.k} c={c} className="flex items-center gap-3.5 py-3.5">
              <Glyph icon={c.icon} size={18} /><span className="flex-1 text-[15px]">{c.label}</span><span className="text-[14px] text-ink/55">{valueOf(c)}</span>
            </Out>
          ))}
        </div>
        <p className="mt-6 text-[15px] leading-snug text-ink/65">{VENTY}</p>
        <AttributionsRow onOpen={open} light />
      </div>
    </div>
  );
}

// ─── the section ───
type V = "cover" | "story" | "card" | "piece" | "dots" | "label";
const VERSIONS: { k: V; name: string; note: string; light?: boolean; page: (open: () => void) => ReactNode }[] = [
  { k: "cover", name: "1 · Portrait cover", note: "Her photo fills the top and fades into the dark page, her name large over the fade. The contacts as rows below: calm and familiar, like a contact page.", page: (o) => <Cover open={o} /> },
  { k: "story", name: "2 · Cover story", note: "A moment screen: Crown, her name set huge behind her and her portrait (cut out) in front, like a magazine cover. They rise in as the page opens. The contacts as four round actions, like a phone's contact card.", light: true, page: (o) => <Story open={o} /> },
  { k: "card", name: "3 · Her card", note: "Her portrait as a card that tilts with your finger (a light glances across it) and turns over when tapped, to show how to reach her.", page: (o) => <CardPage open={o} /> },
  { k: "piece", name: "4 · Cut 1", note: "Her portrait cut as a pattern piece on the pattern look's cornflower: the cutting line draws itself in, the seam allowance dashed round it, a grainline, and a label like a pattern piece's.", page: (o) => <PiecePage open={o} /> },
  { k: "dots", name: "5 · Halftone", note: "Her portrait drawn in dots, as on the landing page's footer. The portfolio is the big cornflower tile; the rest are small tiles.", page: (o) => <DotsPage open={o} /> },
  { k: "label", name: "6 · The label", note: "A woven garment label on paper, stitched round its edge and swaying gently on its loop: made by Natalia Chamon.", light: true, page: (o) => <LabelPage open={o} /> },
];

export function AboutLab() {
  const [show, setShow] = useState<V | "all">("all");
  const list = show === "all" ? VERSIONS : VERSIONS.filter((v) => v.k === show);
  return (
    <section>
      <h2 className="h1 !text-[34px]">About Venty</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">A page in the profile about who made Venty: Natalia, her portrait and how to reach her, a line about Venty, and at the very end the 3D garment attributions on a page of their own (tap the last row on any phone). Six ways to show her. Her portrait is the landing page&apos;s. Her email, phone and LinkedIn are still to come (the landing page leaves them empty too), so those rows say so.</p>
      <div className="mt-5"><Pick items={[{ k: "all" as const, name: "All six" }, ...VERSIONS.map((v) => ({ k: v.k, name: v.name }))]} value={show} onChange={setShow} /></div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {list.map((v) => (
          <div key={v.k} className="flex w-[360px] flex-col gap-4">
            <Device label={v.name} light={v.light} about={v.page} />
            <p className="text-[14px] leading-snug text-white/55">{v.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
