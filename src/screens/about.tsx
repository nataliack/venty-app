"use client";
// About Venty (from the lab's "Portrait cover", 25 Oct 2026): who made Venty. Natalia's portrait fills the top and fades
// into the page, her name over the fade; then her business cards as a small cinematic stage (the cards float on Crown,
// a light glancing across them), which opens the cards screen; how to reach her; a line about Venty; and last, the 3D
// credits on a page of their own. The card pictures are stills of the real cards, so this page loads no 3D at all.
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useApp } from "@/lib/store";
import { Screen, TopBar, HS, Lead, RB, Crown, cx } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { BODY_CREDIT, GARMENT_CREDITS, LICENCE_URL } from "@/lib/credits";

const NATALIA = { first: "Natalia", last: "Chamon", role: "Founder of Venty", place: "Brisbane, Australia" };
const CONTACTS: { icon: IconName; label: string; value: string; href: string }[] = [
  { icon: "globe", label: "Portfolio", value: "nataliachamon.com", href: "https://nataliachamon.com" },
  { icon: "mail", label: "Email", value: "natalia.chamom@gmail.com", href: "mailto:natalia.chamom@gmail.com" },
  { icon: "phone", label: "Phone", value: "0420 991 942", href: "tel:+61420991942" },
  { icon: "linkedin", label: "LinkedIn", value: "linkedin.com/in/natalia-c", href: "https://www.linkedin.com/in/natalia-c-8201a8226/" },
];
const VENTY = "Venty drafts sewing patterns to your own measurements. This is the demo made for the QUT Design Festival 2026.";

// a row that leads somewhere: an icon badge, a label and a line under it, a chevron
function Row({ icon, label, sub, href, onClick }: { icon: IconName; label: string; sub: string; href?: string; onClick?: () => void }) {
  const inner = (
    <>
      <span className="iconbadge grid h-9 w-9 shrink-0 place-items-center rounded-[11px]"><Icon name={icon} size={17} strokeWidth={1.9} /></span>
      <span className="min-w-0 flex-1"><span className="block text-[13px] text-white/50">{label}</span><span className="block truncate text-[16px]">{sub}</span></span>
      <Icon name="chevR" size={18} className="shrink-0 text-white/40" />
    </>
  );
  const cls = "flex min-h-[60px] w-full items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-white/[.03]";
  if (href) return <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

// her cards on a small stage: the two cards float in perspective on Crown, a light glancing across now and then
function CardsStage({ onOpen }: { onOpen: () => void }) {
  const still = useReducedMotion();
  const sway = (rotate: number[], duration: number) => (still ? {} : { animate: { rotate }, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } });
  const card = "absolute aspect-[90/55] w-[58%] rounded-[3px] shadow-[0_1px_0_rgb(255_255_255/.12),0_18px_30px_-14px_rgb(19_21_35/.75),0_4px_10px_-4px_rgb(19_21_35/.5)]";
  return (
    <button onClick={onOpen} className="tap card-soft group mt-6 block w-full overflow-hidden rounded-[26px] text-left" aria-label="Open her business cards">
      <div className="relative h-[210px] overflow-hidden lg:h-[250px]" style={{ perspective: 900 }}>
        <Crown className="!absolute" />
        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}
          {...(still ? {} : { animate: { rotateY: [-9, 7, -9], rotateX: [9, 4, 9], y: [0, -5, 0] }, transition: { duration: 9, repeat: Infinity, ease: "easeInOut" } })}>
          <motion.img src="/cards/natalia-cream-back.webp" alt="" className={cx(card, "left-[31%] top-[13%]")} style={{ rotate: 6, z: -40 }} {...sway([6, 7.5, 6], 7)} />
          <motion.div className={cx(card, "left-[11%] top-[33%] overflow-hidden")} style={{ rotate: -5, z: 30 }} {...sway([-5, -6.5, -5], 8)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cards/venty-dark-front.webp" alt="" className="h-full w-full" />
            {/* a light glancing across the card now and then */}
            {!still && <motion.span className="absolute inset-y-0 w-1/2 mix-blend-screen" style={{ background: "linear-gradient(100deg, transparent, rgb(214 222 255 / .28), transparent)" }}
              animate={{ x: ["-120%", "260%"] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut" }} />}
          </motion.div>
        </motion.div>
      </div>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium">Her business cards</span><span className="block text-[14px] text-white/55">Turn them over, try their colours, save one</span></span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform group-hover:translate-x-0.5"><Icon name="chevR" size={18} strokeWidth={2} /></span>
      </div>
    </button>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-7">
    <h2 className="px-1 text-[15px] text-white/55">{title}</h2>
    <div className="card-soft mt-2.5 divide-y divide-white/[.07] overflow-hidden rounded-[22px]">{children}</div>
  </section>
);

export function About() {
  const { back, go } = useApp();
  return (
    <Screen noPad>
      <div className="lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-12 lg:pt-6">
        {/* her portrait, fading into the page; on a desktop, a tall card of its own */}
        <div className="relative -mt-[var(--top)] h-[440px] lg:sticky lg:top-6 lg:mt-0 lg:h-[600px] lg:overflow-hidden lg:rounded-[32px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/people/natalia.webp" alt="Natalia Chamon" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(11 12 21 / .4) 0%, transparent 22%, transparent 48%, var(--color-bg) 96%)" }} />
          <div className="absolute left-5 lg:hidden" style={{ top: "var(--top)" }}><RB icon="back" label="Back" onClick={back} /></div>
          <div className="absolute inset-x-6 bottom-2 lg:bottom-7 lg:inset-x-7">
            <h1 className="text-[46px] font-normal leading-[.95] tracking-[-.04em] lg:text-[56px]">{NATALIA.first}<br />{NATALIA.last}</h1>
            <p className="mt-3 text-[15px] text-white/65">{NATALIA.role} · {NATALIA.place}</p>
          </div>
        </div>
        <div className="px-6 pb-4 lg:px-0">
          <div className="hidden lg:block"><RB icon="back" label="Back" onClick={back} /></div>
          <CardsStage onOpen={() => go("cards")} />
          <Section title="Reach her">
            {CONTACTS.map((c) => <Row key={c.label} icon={c.icon} label={c.label} sub={c.value} href={c.href} />)}
          </Section>
          <section className="mt-8 px-1">
            <h2 className="text-[20px] font-normal tracking-[-.02em]">About Venty</h2>
            <p className="mt-2 text-[15px] leading-snug text-white/65">{VENTY}</p>
          </section>
          <Section title="Credits">
            <Row icon="body" label="Who made the 3D bodies and garments" sub="3D credits" onClick={() => go("credits")} />
          </Section>
        </div>
      </div>
    </Screen>
  );
}

// ─── the 3D credits: the body and every garment, by maker, each linked to its page ───
const byAuthor = (() => {
  const m = new Map<string, typeof GARMENT_CREDITS>();
  for (const c of GARMENT_CREDITS) m.set(c.author, [...(m.get(c.author) ?? []), c]);
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
})();
function Licence({ l }: { l: string }) {
  const url = LICENCE_URL[l], cls = "shrink-0 rounded-full bg-white/[.07] px-2 py-0.5 text-[12px] text-white/70";
  return url ? <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>{l}</a> : <span className={cls}>{l}</span>;
}
export function Credits() {
  return (
    <Screen header={<TopBar left="back" />}>
      <div className="lg:mx-auto lg:max-w-[640px]">
        <HS className="mt-2 lg:mt-0">3D credits</HS>
        <Lead className="mt-3">The 3D body and the garments it wears were made by the MakeHuman community and shared under open licences. Every garment was changed for Venty: fitted to its bodies, resized with your measurements, and its textures made smaller.</Lead>
        <div className="card-soft mt-6 rounded-[22px] px-4 py-3.5">
          <div className="text-[15px] font-medium">{BODY_CREDIT.title}</div>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-white/55">{BODY_CREDIT.author}<Licence l={BODY_CREDIT.licence} /></div>
        </div>
        {byAuthor.map(([author, list]) => (
          <section key={author} className="mt-6">
            <h2 className="flex items-baseline justify-between px-1 text-[16px] font-medium">{author}<span className="text-[13px] font-normal text-white/45">{list.length} {list.length === 1 ? "garment" : "garments"}</span></h2>
            <ul className="card-soft mt-2 divide-y divide-white/[.07] rounded-[18px] px-4">
              {list.map((c) => (
                <li key={c.asset} className="flex items-center gap-3 py-3">
                  <a href={c.source} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-[14px] text-white/85 underline decoration-white/20 underline-offset-4">{c.title}</a>
                  <Licence l={c.licence} />
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="mt-6 px-1 text-[13px] leading-snug text-white/45">Each title opens the garment&apos;s page in the MakeHuman asset repository. CC BY: shared on condition its maker is credited. CC0: no rights reserved.</p>
      </div>
    </Screen>
  );
}
