"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useApp } from "@/lib/store";
import { TEMPLATES, CATEGORIES, LEVELS, templateBy, type Category, type GarmentKey } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, HS, Lead, Pill, Glow, Glass, Chip, Check, Segmented, Option, Sheet, cx, useToast } from "@/components/ui";
import { Split, useDesk } from "@/components/ui";
import { BodyFigure, Flat, Piece } from "@/components/art";
import { Icon } from "@/components/icons";

// Card: the flat drawing, the name, and one quiet line (level · pieces). Hover only lifts the edge.
function TplCard({ t, desk, onClick }: { t: (typeof TEMPLATES)[number]; desk: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx("card-soft tap flex w-full flex-col overflow-hidden text-left transition-transform duration-300 ease-out lg:hover:-translate-y-1", desk ? "h-[min(420px,52dvh)] rounded-[30px] p-6" : "h-[236px] rounded-[24px] p-4")}>
      <div className="grid min-h-0 flex-1 place-items-center"><Flat g={t.key} size={desk ? 170 : 96} className="max-h-full" /></div>
      <div className="mt-2 shrink-0">
        <div className={cx("font-medium leading-tight", desk ? "text-[20px]" : "text-[17px]")}>{t.name}</div>
        <div className={cx("mt-1 flex items-center gap-2 text-white/60", desk ? "text-[15px]" : "text-[14px]")}><Level n={LEVELS.indexOf(t.level) + 1} /><span className="truncate">{t.level} · {t.pieces} pieces</span></div>
      </div>
    </button>
  );
}
// difficulty as three small bars, like the bars on a pattern envelope
const Level = ({ n }: { n: number }) => <span className="flex items-end gap-[2px]" aria-hidden>{[1, 2, 3].map((k) => <span key={k} className={cx("w-[3px] rounded-full", k <= n ? "bg-peri" : "bg-white/20")} style={{ height: 4 + k * 3 }} />)}</span>;

const CAT_LABEL: Record<Category, string> = { Dresses: "Dresses", Tops: "Tops", Pants: "Trousers", Skirts: "Skirts" };

export function Templates({ p }: { p?: Record<string, unknown> }) {
  const { go } = useApp();
  const [cat, setCat] = useState<Category>((p?.cat as Category) ?? "Dresses");
  const [q, setQ] = useState<string | null>(null);
  const [level, setLevel] = useState<string>("Any level");
  const [pickLevel, setPickLevel] = useState(false);
  const picked = !!p?.picked; // came with a body already chosen
  const list = TEMPLATES.filter((t) => t.category === cat && (level === "Any level" || t.level === level) && (!q || t.name.toLowerCase().includes(q.toLowerCase())));
  const open = (key: GarmentKey) => go("template", { key, picked });
  const { toast, node } = useToast();
  const desk = useDesk();
  // one row of text tabs with a sliding underline: no stacked pills
  const tabs = (
    <div className="noscroll -mx-6 flex gap-6 overflow-x-auto border-b border-white/10 px-6 lg:mx-0 lg:gap-8 lg:px-0">
      {CATEGORIES.map((c) => (
        <button key={c} onClick={() => setCat(c)} className={cx("relative shrink-0 pb-3 text-[17px] transition-colors lg:text-[19px]", c === cat ? "text-white" : "text-white/45 hover:text-white/75")}>
          {CAT_LABEL[c]}
          {c === cat && <motion.span layoutId="cat-line" className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-white" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
        </button>
      ))}
    </div>
  );
  const bar = (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-[15px] text-white/60">{list.length} {list.length === 1 ? "pattern" : "patterns"}</span>
      <button onClick={() => setPickLevel(true)} className="tap flex h-10 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[15px] font-medium">{level}<Icon name="chevD" size={16} /></button>
    </div>
  );
  const request = (
    <button onClick={() => toast("Thanks, we’ll add more soon")} className={cx("tap flex w-full flex-col items-center justify-center border border-dashed border-white/25 transition-colors hover:border-white/45", desk ? "h-[min(420px,52dvh)] rounded-[30px]" : "h-[236px] rounded-[24px]")}>
      <Icon name="plus" size={desk ? 28 : 24} className="text-white/70" /><span className="mt-3 text-[15px] font-medium text-white/75">Request a pattern</span>
    </button>
  );
  const grid = (
    <motion.div key={cat + level} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx("grid", desk ? "mt-6 grid-cols-4 gap-5" : "mt-4 grid-cols-2 gap-3")}>
      {list.map((t) => <TplCard key={t.key} t={t} desk={desk} onClick={() => open(t.key)} />)}
      {!list.length && <p className="col-span-full py-6 text-[16px] text-white/60">No {level === "Any level" ? "" : level.toLowerCase() + " "}{CAT_LABEL[cat].toLowerCase()} yet.</p>}
      {(desk ? list.length < 4 : list.length % 2 === 1) && request}
    </motion.div>
  );
  return (
    <Screen wide={desk}>
      <TopBar left="back" right="search" onRight={() => setQ(q === null ? "" : null)} />
      {q !== null && <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patterns" className="glass mt-3 h-12 w-full rounded-full px-5 text-[16px] outline-none lg:max-w-[420px]" />}
      <H1 className="mt-4">Pre-made patterns</H1>
      <Lead className="mt-2">Choose one, fit it to a body and get the pattern.</Lead>
      <div className="mt-6">{tabs}</div>
      {bar}
      {grid}
      <div className="h-6" />
      <Sheet open={pickLevel} onClose={() => setPickLevel(false)}>
        <h3 className="text-[22px] font-normal tracking-[-.02em]">Sewing level</h3>
        <div className="mt-4 flex flex-col gap-2">{["Any level", ...LEVELS].map((l) => (
          <Option key={l} on={level === l} onClick={() => { setLevel(l); setPickLevel(false); }} className="flex h-[60px] items-center gap-3 rounded-[18px] px-4">
            {l !== "Any level" && <Level n={LEVELS.indexOf(l as (typeof LEVELS)[number]) + 1} />}<span className="text-[17px]">{l}</span>
          </Option>
        ))}</div>
      </Sheet>
      {node}
    </Screen>
  );
}

export function TemplateDetail({ p }: { p?: Record<string, unknown> }) {
  const { go, newDraft, draft, bodies } = useApp();
  const t = templateBy((p?.key as GarmentKey) ?? "slip");
  const picked = !!p?.picked && !!draft.bodyId;
  const forName = bodies.find((x) => x.id === draft.bodyId)?.name.split(",")[0];
  const [len, setLen] = useState(t.defaultLength);
  const [fav, setFav] = useState(false);
  const desk = useDesk();
  return (
    <Screen footer={<Pill onClick={() => { newDraft({ garment: t.key, source: "template", length: len, ...(picked ? { bodyId: draft.bodyId } : {}) }); go(picked ? "tplFit" : "tplBody"); }}>{picked && forName ? `Fit to ${forName}` : "Fit to a body"}</Pill>}>
      <TopBar left="back" eyebrow={t.category} right="heart" onRight={() => setFav(!fav)} />
      <Split left={
      <Glow color={t.color} variant="edge" className="mt-3 grid h-[min(330px,38dvh)] place-items-center rounded-[30px] lg:mt-0 lg:h-[min(620px,70dvh)] lg:rounded-[40px]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="animate-floaty"><Flat g={t.key} size={desk ? 320 : 200} /></motion.div>
        {fav && <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[11px]">♥ Saved</span>}
      </Glow>} right={<>
      <HS className="mt-5 text-[46px] lg:mt-0 lg:text-[72px]">{t.name}</HS>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{[`${t.pieces} pieces`, t.tag].map((c) => <span key={c} className="text-[15px] text-white/60">{c}</span>)}</div>
      <p className="mt-4 text-[15px] leading-relaxed text-white/60 lg:max-w-[460px] lg:text-[16px]">{t.blurb}</p>
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
  const { go, bodies, activeBody, set, setDraft, draft, newBody, startBody } = useApp();
  const t = templateBy(draft.garment);
  const [sel, setSel] = useState(activeBody);
  const b = bodies.find((x) => x.id === sel) ?? bodies[0];
  return (
    <Screen footer={<Pill onClick={() => { set({ activeBody: b.id }); setDraft({ bodyId: b.id }); go("tplFit"); }}>Fit {t.name.toLowerCase()} to {b.name.split(",")[0]}</Pill>}>
      <TopBar left="back" eyebrow={`${t.name} · Fit to`} />
      <Split left={<>
      <HS className="mt-4 lg:mt-0">Who is this for?</HS>
      <Lead className="mt-2 text-[15px]">We’ll grade the pattern to this body’s measurements.</Lead>
      <div className="mt-10 hidden lg:block"><Flat g={t.key} size={180} /></div>
      </>} right={
      <div className="mt-5 flex flex-col gap-2.5 lg:mt-0 lg:gap-3">
        {bodies.map((x) => (
          <Glass key={x.id} onClick={() => setSel(x.id)} selected={x.id === sel} className="flex h-[84px] w-full items-center gap-4 rounded-[24px] px-4 lg:h-[100px] lg:px-6">
            <BodyFigure sex={x.sex} width={26} glow={false} />
            <div className="flex-1"><div className="text-[16px] font-semibold">{x.name}</div><div className="text-[14px] text-white/55">{x.done.length} of 24 measurements</div></div>
            <Check on={x.id === sel} className={x.id === sel ? "!bg-primary !text-white" : ""} />
          </Glass>
        ))}
        <button onClick={() => { startBody(); }} className="tap flex h-16 items-center gap-3 rounded-[22px] border border-dashed border-white/25 px-5 text-[16px] font-medium text-white/75"><Icon name="plus" size={20} />New body</button>
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
    const tick = (n: number) => { const k = Math.min(1, (n - t0) / 7000); setPct(Math.round(100 * (1 - Math.pow(1 - k, 2)))); if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => replace("tplResult"), 300); };
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
            <span className={cx("text-[15px]", i === active && "font-semibold", i > active && "text-white/45")}>{s}</span>
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
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edits")}>Change the design</Pill><Pill className="flex-1" onClick={() => go("printMethod")}>Looks right</Pill></div>}>
      <TopBar left="back" eyebrow={`Fitted to ${b.name}`} />
      <div className="lg:flex lg:items-end lg:justify-between">
      <H1 className="mt-3">{t.name}, on you</H1>
      <Segmented className="mt-4 lg:w-[300px]" items={["On body", "Pattern"]} value={view} onChange={(v) => (v === "Pattern" ? go("garment", { view: "Pattern" }) : setView(v))} />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_130px] gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <Glow color={t.color} variant="fade" className="flex h-[min(470px,52dvh)] justify-center rounded-[28px] pt-4 lg:h-[min(600px,66dvh)] lg:rounded-[36px] lg:pt-8"><BodyFigure sex={b.sex} width={150} garment={t.key} className="h-[94%] w-auto" /></Glow>
        <div className="flex flex-col justify-between py-1 lg:grid lg:grid-cols-2 lg:content-center lg:gap-5">
          {notes.map(([l, v, e]) => (
            <div key={l as string} className="lg:rounded-[24px] lg:border lg:border-white/10 lg:bg-white/5 lg:p-6"><Eyebrow className=" lg:">{l}</Eyebrow><div className="flex items-baseline gap-1.5"><span className="serif text-[40px] leading-none lg:text-[64px]">{u(v as number)}</span><span className="text-[10px] text-white/50">{units}</span></div><div className="text-[11px] font-medium text-peri">{e}</div></div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
