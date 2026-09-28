"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useApp } from "@/lib/store";
import { TEMPLATES, CATEGORIES, templateBy, type Category, type GarmentKey } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, HS, Lead, Pill, Glow, Glass, Chip, Check, Segmented, cx, useToast } from "@/components/ui";
import { Split, useDesk } from "@/components/ui";
import { BodyFigure, Flat, Piece } from "@/components/art";
import { Icon } from "@/components/icons";

export function Templates({ p }: { p?: Record<string, unknown> }) {
  const { go } = useApp();
  const [cat, setCat] = useState<Category>((p?.cat as Category) ?? "Dresses");
  const [q, setQ] = useState<string | null>(null);
  const list = TEMPLATES.filter((t) => t.category === cat && (!q || t.name.toLowerCase().includes(q.toLowerCase())));
  const [feat, ...rest] = list.length ? list : TEMPLATES.filter((t) => t.category === cat);
  const { toast, node } = useToast();
  const desk = useDesk();
  if (desk) return (
    <Screen wide>
      <TopBar left="back" eyebrow="Templates · 10 styles" right="search" onRight={() => setQ(q === null ? "" : null)} />
      <div className="mt-3 flex items-end justify-between gap-6">
        <div><H1>Start from a template</H1><Lead className="mt-2">Pick a style, fit it to a body, get the pattern.</Lead></div>
        <div className="flex items-center gap-2">
          {q !== null && <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search styles" className="glass h-10 w-[200px] rounded-full px-4 text-[14px] outline-none" />}
          {CATEGORIES.map((c) => <Chip key={c} on={c === cat} onClick={() => setCat(c)}>{c}</Chip>)}
        </div>
      </div>
      <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid grid-cols-4 gap-5">
        <Glow color={feat.color} variant="fade" onClick={() => go("template", { key: feat.key })} className="relative col-span-2 h-[min(460px,58dvh)] rounded-[34px] p-7">
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.08em]">Featured</span>
          <div className="absolute right-6 top-8"><Flat g={feat.key} size={250} /></div>
          <div className="absolute bottom-8 left-7 max-w-[260px]"><div className="serif text-[60px] leading-[.95]">{feat.name}</div><div className="mt-3 text-[14px] font-medium text-white/70">{feat.level} · {feat.pieces} pieces · {feat.hours}</div></div>
        </Glow>
        {rest.map((t) => (
          <Glass key={t.key} onClick={() => go("template", { key: t.key })} className="relative h-[min(460px,58dvh)] rounded-[30px] p-6 hover:bg-white/10">
            <div className="flex justify-center pt-6"><Flat g={t.key} size={170} /></div>
            <div className="absolute bottom-6 left-6"><div className="text-[20px] font-semibold">{t.name}</div><div className="text-[13px] text-white/55">{t.level} · {t.pieces} pieces</div></div>
          </Glass>
        ))}
        {rest.length < 2 && (
          <button onClick={() => toast("Thanks — we’ll add more soon")} className="tap flex h-[min(460px,58dvh)] flex-col items-center justify-center rounded-[30px] border border-dashed border-white/25">
            <Icon name="plus" size={28} className="text-white/70" /><span className="mt-3 text-[16px] font-medium text-white/75">Request a style</span><span className="text-[12px] text-white/45">More coming soon</span>
          </button>
        )}
      </motion.div>
      {node}
    </Screen>
  );
  return (
    <Screen>
      <TopBar left="back" eyebrow="Templates · 10 styles" right="search" onRight={() => setQ(q === null ? "" : null)} />
      {q !== null && <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search styles" className="glass mt-3 h-12 w-full rounded-full px-5 text-[15px] outline-none" />}
      <H1 className="mt-4">Start from a template</H1>
      <Lead className="mt-2 text-[14px]">Pick a style, fit it to a body, get the pattern.</Lead>
      <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 noscroll">{CATEGORIES.map((c) => <Chip key={c} on={c === cat} onClick={() => setCat(c)}>{c}</Chip>)}</div>
      <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Glow as="button" color={feat.color} variant="fade" onClick={() => go("template", { key: feat.key })} className="relative mt-4 block h-[250px] w-full rounded-[30px] p-5">
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.08em]">Featured</span>
          <div className="absolute right-2 top-4"><Flat g={feat.key} size={feat.name.length > 11 ? 140 : 165} /></div>
          <div className="absolute bottom-5 left-5 max-w-[180px]"><div className={cx("serif leading-[.95]", feat.name.length > 11 ? "text-[34px]" : "text-[40px]")}>{feat.name}</div><div className="mt-2 text-[13px] font-medium text-white/70">{feat.level} · {feat.pieces} pieces</div></div>
        </Glow>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {rest.map((t) => (
            <Glass key={t.key} onClick={() => go("template", { key: t.key })} className="relative h-[220px] rounded-[24px] p-4">
              <div className="flex justify-center"><Flat g={t.key} size={84} /></div>
              <div className="absolute bottom-4 left-4"><div className="text-[15px] font-semibold">{t.name}</div><div className="text-[11px] text-white/55">{t.level} · {t.pieces} pieces</div></div>
            </Glass>
          ))}
          {rest.length < 2 && (
            <button onClick={() => toast("Thanks — we’ll add more soon")} className="tap flex h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/25">
              <Icon name="plus" size={24} className="text-white/70" /><span className="mt-3 text-[14px] font-medium text-white/75">Request a style</span><span className="text-[11px] text-white/45">More coming soon</span>
            </button>
          )}
        </div>
      </motion.div>
      <div className="h-6" />
      {node}
    </Screen>
  );
}

export function TemplateDetail({ p }: { p?: Record<string, unknown> }) {
  const { go, newDraft } = useApp();
  const t = templateBy((p?.key as GarmentKey) ?? "slip");
  const [len, setLen] = useState(t.defaultLength);
  const [fav, setFav] = useState(false);
  const desk = useDesk();
  return (
    <Screen footer={<Pill onClick={() => { newDraft({ garment: t.key, source: "template", length: len }); go("tplBody"); }}>Fit to my body</Pill>}>
      <TopBar left="back" eyebrow={`${t.category} · Template`} right="heart" onRight={() => setFav(!fav)} />
      <Split left={
      <Glow color={t.color} variant="edge" className="mt-3 grid h-[min(330px,38dvh)] place-items-center rounded-[30px] lg:mt-0 lg:h-[min(620px,70dvh)] lg:rounded-[40px]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="animate-floaty"><Flat g={t.key} size={desk ? 320 : 200} /></motion.div>
        {fav && <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[11px]">♥ Saved</span>}
      </Glow>} right={<>
      <HS className="mt-5 text-[46px] lg:mt-0 lg:text-[72px]">{t.name}</HS>
      <div className="mt-3 flex flex-wrap gap-2">{[t.level, `${t.pieces} pieces`, t.hours, t.tag].map((c) => <span key={c} className="chip">{c}</span>)}</div>
      <p className="mt-4 text-[14px] leading-relaxed text-white/60 lg:max-w-[460px] lg:text-[16px]">{t.blurb}</p>
      <Eyebrow className="mt-5">Length</Eyebrow>
      <div className="mt-2 flex gap-2">{t.lengths.map((l) => <Chip key={l} on={l === len} onClick={() => setLen(l)}>{l}</Chip>)}</div>
      <div className="hidden lg:block">
        <Eyebrow className="mt-8">Pattern pieces</Eyebrow>
        <div className="mt-3 flex flex-wrap items-end gap-4">{t.pieceSet.map((k) => <div key={k} className="glass grid h-[110px] w-[92px] place-items-center rounded-[16px]"><Piece k={k} width={60} /></div>)}</div>
      </div>
      </>} />
    </Screen>
  );
}

export function TplBody() {
  const { go, bodies, activeBody, set, setDraft, draft, newBody } = useApp();
  const t = templateBy(draft.garment);
  const [sel, setSel] = useState(activeBody);
  const b = bodies.find((x) => x.id === sel) ?? bodies[0];
  return (
    <Screen footer={<Pill onClick={() => { set({ activeBody: b.id }); setDraft({ bodyId: b.id }); go("tplFit"); }}>Fit {t.name.toLowerCase()} to {b.name.split(",")[0]}</Pill>}>
      <TopBar left="back" eyebrow={`${t.name} · Fit to`} />
      <Split left={<>
      <HS className="mt-4 lg:mt-0">Who is this for?</HS>
      <Lead className="mt-2 text-[14px]">We’ll grade the pattern to this body’s measurements.</Lead>
      <div className="mt-10 hidden lg:block"><Flat g={t.key} size={180} /></div>
      </>} right={
      <div className="mt-5 flex flex-col gap-2.5 lg:mt-0 lg:gap-3">
        {bodies.map((x) => (
          <Glass key={x.id} onClick={() => setSel(x.id)} selected={x.id === sel} className="flex h-[84px] w-full items-center gap-4 rounded-[24px] px-4 lg:h-[100px] lg:px-6">
            <BodyFigure sex={x.sex} width={26} glow={false} />
            <div className="flex-1"><div className="text-[16px] font-semibold">{x.name}</div><div className="text-[12px] text-white/55">{Math.max(4, x.done.length)} / 24 measures</div></div>
            <Check on={x.id === sel} className={x.id === sel ? "!bg-primary !text-white" : ""} />
          </Glass>
        ))}
        <button onClick={() => { newBody(); go("gender"); }} className="tap flex h-16 items-center gap-3 rounded-[22px] border border-dashed border-white/25 px-5 text-[15px] font-medium text-white/75"><Icon name="plus" size={20} />New body</button>
      </div>} />
    </Screen>
  );
}

export function TplFit() {
  const { replace, draft, body } = useApp();
  const b = body(); const t = templateBy(draft.garment);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t0 = performance.now(); let raf = 0;
    const tick = (n: number) => { const k = Math.min(1, (n - t0) / 3000); setPct(Math.round(100 * (1 - Math.pow(1 - k, 2)))); if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => replace("tplResult"), 300); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [replace]);
  const steps = ["Reading your measurements", `Grading the ${t.name.toLowerCase()}`, "Adding ease at the hip", `Laying out ${t.pieces} pieces`];
  const active = Math.min(3, Math.floor(pct / 26));
  return (
    <Screen fixed>
      <TopBar eyebrow={`Fitting to ${b.name}`} center />
      <div className="lg:grid lg:min-h-[calc(100dvh-var(--top)-110px)] lg:grid-cols-2 lg:items-center lg:gap-16"><div>
      <div className="relative flex h-[min(330px,38dvh)] justify-center pt-2 lg:h-[min(620px,72dvh)]">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="h-full"><BodyFigure sex={b.sex} width={120} garment={draft.garment} garmentStyle="flat" className="h-full w-auto" /></motion.div>
      </div>
      </div><div>
      <div className="serif mt-2 text-center text-[96px] leading-none tabular-nums lg:text-left lg:text-[200px]">{pct}%</div>
      <Glass className="mt-5 rounded-[26px] p-5 lg:mt-8 lg:p-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3 py-2">
            <span className={cx("grid h-5 w-5 place-items-center rounded-full", i < active ? "bg-primary" : i === active ? "bg-primary/60 animate-pulse" : "border border-white/30")}>{i < active && <Icon name="check" size={12} strokeWidth={3} />}</span>
            <span className={cx("text-[14px]", i === active && "font-semibold", i > active && "text-white/45")}>{s}</span>
          </div>
        ))}
      </Glass>
      </div></div>
    </Screen>
  );
}

export function TplResult() {
  const { go, draft, body, savePattern, units } = useApp();
  const b = body(); const t = templateBy(draft.garment);
  const [view, setView] = useState("On body");
  useEffect(() => { savePattern("Fitting"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const M = b.measures;
  const u = (v: number) => (units === "in" ? (v / 2.54).toFixed(1) : Math.round(v).toString());
  const notes = t.category === "Pants" ? [["Waist", M.waist, "+2 ease"], ["Hip", M.hips, "+5 ease"], ["Rise", M.rise, "Mid"], ["Inside leg", M.insideLeg, t.defaultLength]] :
    t.category === "Skirts" ? [["Waist", M.waist, "+1 ease"], ["Hip", M.hips, "+6 ease"], ["Waist to hip", M.waistHip, "Graded"], ["Length", 70, draft.length ?? t.defaultLength]] :
    t.category === "Tops" ? [["Bust", M.bust, "+6 ease"], ["Across back", M.acrossBack, "Graded"], ["Arm", M.upperArm, "+3 ease"], ["Length", 58, draft.length ?? t.defaultLength]] :
    [["Bust", M.bust, "+2 ease"], ["Waist", M.waist, "+4 ease"], ["Hip", M.hips, "+6 ease"], ["Length", 112, draft.length ?? t.defaultLength]];
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="glass" className="flex-1" onClick={() => go("edits")}>Tweak fit</Pill><Pill className="flex-1" onClick={() => go("seam")}>Get pattern</Pill></div>}>
      <TopBar left="back" eyebrow={`Fitted to ${b.name}`} />
      <div className="lg:flex lg:items-end lg:justify-between">
      <H1 className="mt-3">{t.name}, on you</H1>
      <Segmented className="mt-4 lg:w-[300px]" items={["On body", "Pattern"]} value={view} onChange={(v) => (v === "Pattern" ? go("garment", { view: "Pattern" }) : setView(v))} />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_130px] gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <Glow color={t.color} variant="fade" className="flex h-[min(470px,52dvh)] justify-center rounded-[28px] pt-4 lg:h-[min(600px,66dvh)] lg:rounded-[36px] lg:pt-8"><BodyFigure sex={b.sex} width={150} garment={t.key} className="h-[94%] w-auto" /></Glow>
        <div className="flex flex-col justify-between py-1 lg:grid lg:grid-cols-2 lg:content-center lg:gap-5">
          {notes.map(([l, v, e]) => (
            <div key={l as string} className="lg:rounded-[24px] lg:border lg:border-white/10 lg:bg-white/5 lg:p-6"><Eyebrow className="text-[9px] lg:text-[11px]">{l}</Eyebrow><div className="flex items-baseline gap-1.5"><span className="serif text-[40px] leading-none lg:text-[64px]">{u(v as number)}</span><span className="text-[10px] text-white/50">{units}</span></div><div className="text-[11px] font-medium text-peri">{e}</div></div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
