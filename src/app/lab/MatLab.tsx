"use client";
// Lab · the pattern canvas (the result screen's Pattern view, 25 Oct 2026): a tray whose rim is raised and whose inside
// is pressed down, like the look switch (.knob raised, .ruler-track pressed in) and the measuring ruler, with the grid
// on the pressed surface and the pieces on top. The grid is fixed: a thick line every five thin squares, both centred,
// so every thick line falls on a thin one (the app's 96 / 24 px grid put its thick lines half way between thin ones).
import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { Piece, PIECES } from "@/components/art";
import { cx } from "@/components/ui";
import { PIECE_LABEL, type GarmentKey, type PieceKey } from "@/lib/data";
import { piecesFor } from "@/screens/pattern";

// the grid: thin squares of CELL px, a thick line every five (an odd number, so centred thick and thin lines meet)
const CELL = 20;
const grid = (thin: string, thick: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${thick} 1px, transparent 1px), linear-gradient(90deg, ${thick} 1px, transparent 1px), linear-gradient(${thin} 1px, transparent 1px), linear-gradient(90deg, ${thin} 1px, transparent 1px)`,
  backgroundSize: `${CELL * 5}px ${CELL * 5}px, ${CELL * 5}px ${CELL * 5}px, ${CELL}px ${CELL}px, ${CELL}px ${CELL}px`,
  backgroundPosition: "center",
});

// the raised rim and the pressed surface, lit from above (a light top edge, a shadow under; the surface darker along
// its top inside edge, a faint lip below), in the switch's colours
const RIM_INK: CSSProperties = {
  background: "linear-gradient(180deg, #2e3040, #1e2030)",
  boxShadow: "0 18px 36px -16px rgb(0 0 0 / .75), 0 2px 4px rgb(0 0 0 / .5), inset 0 1px 0 rgb(255 255 255 / .2), inset 0 -1px 0 rgb(0 0 0 / .45), inset 0 0 0 1px rgb(255 255 255 / .06)",
};
const RIM_SNOW: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff, #dfe4f3)",
  boxShadow: "0 18px 36px -16px rgb(0 0 0 / .7), 0 2px 4px rgb(0 0 0 / .35), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .25)",
};
const PRESS_DARK = "inset 0 3px 8px rgb(0 0 0 / .6), inset 0 1px 2px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .06)";
const PRESS_LIGHT = "inset 0 3px 8px rgb(28 36 84 / .32), inset 0 1px 2px rgb(28 36 84 / .3), inset 0 -1px 0 rgb(255 255 255 / .9)";

// ─── 7 · the snow tray with a ruled rim (25 Oct 2026): the snow tray's colours, centimetre ticks on all four sides of
// the rim (on its inner edge, lined up with the grid), and a taller raised band at the bottom that holds the count and
// who it is drafted to, so the pieces have the whole surface. Grey and white grid lines, so they never compete with
// the pieces' cornflower grainlines. The pieces are paper: solid white (no grid through them), a soft slate outline,
// lying a little above the surface. ───
const SNOW_RIM: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff, #e7eaf3)",
  boxShadow: "0 18px 36px -16px rgb(0 0 0 / .7), 0 2px 4px rgb(0 0 0 / .3), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(28 36 84 / .2)",
};
const SNOW_SURFACE: CSSProperties = { backgroundColor: "#eceef4", boxShadow: "inset 0 3px 8px rgb(28 36 84 / .26), inset 0 1px 2px rgb(28 36 84 / .26), inset 0 -1px 0 rgb(255 255 255 / .95)", ...grid("rgb(19 21 35 / .05)", "rgb(19 21 35 / .1)") };
const TICK = "rgb(60 75 99 / .5)";
// ticks along a strip of the rim, hanging from the edge next to the surface: a short one every square, a long one every five
const rule = (side: "top" | "bottom" | "left" | "right"): CSSProperties => {
  const across = side === "top" || side === "bottom";
  const dir = across ? "90deg" : "0deg";
  const edge = side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left";
  const pos = across ? `center ${edge}` : `${edge} center`;
  return {
    backgroundImage: `linear-gradient(${dir}, ${TICK} 1px, transparent 1px), linear-gradient(${dir}, ${TICK} 1px, transparent 1px)`,
    backgroundSize: across ? `${CELL * 5}px 7px, ${CELL}px 4px` : `7px ${CELL * 5}px, 4px ${CELL}px`,
    backgroundPosition: `${pos}, ${pos}`, backgroundRepeat: across ? "repeat-x" : "repeat-y",
  };
};
function PaperPiece({ k, width, label }: { k: PieceKey; width: number; label: string }) {
  const p = PIECES[k];
  const [x1, y1, x2, y2] = p.grain;
  const u = p.w / width; // viewBox units per screen px
  const arrow = x1 === x2 ? `M${x1 - 3.5 * u} ${y1 + 6 * u}L${x1} ${y1}L${x1 + 3.5 * u} ${y1 + 6 * u}M${x2 - 3.5 * u} ${y2 - 6 * u}L${x2} ${y2}L${x2 + 3.5 * u} ${y2 - 6 * u}` : `M${x1 + 6 * u} ${y1 - 3.5 * u}L${x1} ${y1}L${x1 + 6 * u} ${y1 + 3.5 * u}M${x2 - 6 * u} ${y2 - 3.5 * u}L${x2} ${y2}L${x2 - 6 * u} ${y2 + 3.5 * u}`;
  // the label beside the grainline, on the side with more of the piece; a piece too thin or too curved for two lines
  // beside a short grainline (a band, a facing) has one line just below it
  const thin = p.h / u < 44 || Math.hypot(x2 - x1, y2 - y1) / u < 40;
  const left = x1 === x2 && x1 > p.w / 2;
  const tx = thin ? p.w / 2 : x1 === x2 ? x1 + (left ? -9 : 9) * u : p.w / 2;
  const anchor = thin || x1 !== x2 ? "middle" : left ? "end" : "start";
  const ty = thin ? p.h + 13 * u : x1 === x2 ? (y1 + y2) / 2 : y1 - 8 * u;
  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} width={width} aria-hidden style={{ overflow: "visible", filter: "drop-shadow(0 1px 1px rgb(28 36 84 / .14)) drop-shadow(0 6px 10px rgb(28 36 84 / .12))" }}>
      <path d={p.d} fill="#fff" fillRule="evenodd" stroke="#6b7590" strokeWidth={1.3 * u} strokeLinejoin="round" />
      <path d={`M${x1} ${y1}L${x2} ${y2}${arrow}`} fill="none" stroke="#687ef5" strokeWidth={1.4 * u} strokeLinecap="round" strokeLinejoin="round" />
      <text x={tx} y={ty} textAnchor={anchor} fontSize={9 * u} fill="#3c4b63">
        {thin ? <tspan x={tx}>{label}<tspan fill="#7a849c"> · {p.fold ? "Cut 1 on fold" : "Cut 2"}</tspan></tspan> : <>
          <tspan x={tx}>{label}</tspan>
          <tspan x={tx} dy={11 * u} fontSize={8 * u} fill="#7a849c">{p.fold ? "Cut 1 on fold" : "Cut 2"}</tspan>
        </>}
      </text>
    </svg>
  );
}
function RuledTray({ rim, pieces, name }: { rim: number; pieces: PieceKey[]; name: string }) {
  const R = 30, band = 40, ins = 18; // band: the bottom rim's height; ins: the ticks stop short of the rounded corners
  const n = pieces.length;
  const w = n <= 2 ? 132 : n <= 4 ? 108 : 94;
  return (
    <div className="relative h-full" style={{ ...SNOW_RIM, borderRadius: R }}>
      {/* the ticks: each strip spans exactly the surface's side, so its centre is the grid's and they line up */}
      <span aria-hidden className="pointer-events-none absolute" style={{ top: 0, height: rim, left: rim + ins, right: rim + ins, ...rule("top") }} />
      <span aria-hidden className="pointer-events-none absolute" style={{ bottom: band - rim, height: rim, left: rim + ins, right: rim + ins, ...rule("bottom") }} />
      <span aria-hidden className="pointer-events-none absolute" style={{ left: 0, width: rim, top: rim + ins, bottom: band + ins, ...rule("left") }} />
      <span aria-hidden className="pointer-events-none absolute" style={{ right: 0, width: rim, top: rim + ins, bottom: band + ins, ...rule("right") }} />
      <div className="absolute overflow-hidden" style={{ ...SNOW_SURFACE, top: rim, left: rim, right: rim, bottom: band, borderRadius: R - rim * 0.6 }}>
        <div className={cx("grid h-full place-content-center place-items-center gap-x-3 gap-y-5 px-3 py-4", n <= 2 ? "grid-cols-2" : "grid-cols-3")}>
          {pieces.map((k, i) => (
            <motion.div key={`${name}-${k}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, rotate: (i % 3 - 1) * 3 }} transition={{ delay: 0.06 * i, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
              <PaperPiece k={k} width={w} label={PIECE_LABEL[k]} />
            </motion.div>
          ))}
        </div>
      </div>
      {/* the bottom band: the count and who it is drafted to, centred in the band below its ticks */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 text-[13px] text-[#3c4b63]" style={{ height: band - rim, paddingTop: 2 }}>
        <span>{n} pieces</span><span>Drafted to Me</span>
      </div>
    </div>
  );
}

type Mat = { k: string; name: string; note: string; rim: CSSProperties; surface: CSSProperties; tone: "dark" | "light"; text: string; ruler?: boolean; lit?: boolean };
const MATS: Mat[] = [
  { k: "snowRuled", name: "7 · Snow tray, ruled", note: "4 and 5 together: the snow tray, centimetre ticks round all four sides of the rim, and a taller band at the bottom that holds the count, so the pieces have the whole surface. Grey and white grid lines; the pieces are solid white paper with a soft slate outline.", rim: SNOW_RIM, surface: SNOW_SURFACE, tone: "light", text: "" },
  { k: "inkSnow", name: "1 · Ink rim, snow paper", note: "The switch's dark knob as the rim; inside, snow paper pressed down, the cornflower grid on it. Closest to today, with depth.", rim: RIM_INK,
    surface: { backgroundColor: "#f1f3fc", boxShadow: PRESS_LIGHT, ...grid("rgb(104 126 245 / .09)", "rgb(104 126 245 / .2)") }, tone: "light", text: "text-[#3c4b63]" },
  { k: "inkInk", name: "2 · All ink", note: "The rim and the switch's pressed-in track as the surface, snow grid lines, the pieces drawn in white. One piece with the switch and the dark screen.", rim: RIM_INK,
    surface: { background: "linear-gradient(180deg, #121320, #171823)", boxShadow: PRESS_DARK, ...grid("rgb(240 244 254 / .045)", "rgb(240 244 254 / .11)") }, tone: "dark", text: "text-white/55" },
  { k: "cornflower", name: "3 · Cornflower cutting mat", note: "The pressed surface in cornflower with a snow grid, like the 3D pattern look, so the flat pieces and the pattern on the body read as one.", rim: RIM_INK,
    surface: { backgroundColor: "#687ef5", boxShadow: "inset 0 3px 8px rgb(20 28 90 / .55), inset 0 1px 2px rgb(20 28 90 / .5), inset 0 -1px 0 rgb(255 255 255 / .2)", ...grid("rgb(240 244 254 / .12)", "rgb(240 244 254 / .3)") }, tone: "dark", text: "text-white/80" },
  { k: "snowTray", name: "4 · Snow tray", note: "All light: a snow rim like white plastic, the paper inside pressed a shade deeper. The lightest, it stands out most on the dark screen.", rim: RIM_SNOW,
    surface: { backgroundColor: "#eceff9", boxShadow: PRESS_LIGHT, ...grid("rgb(104 126 245 / .08)", "rgb(104 126 245 / .18)") }, tone: "light", text: "text-[#3c4b63]" },
  { k: "ruled", name: "5 · Ruled rim", note: "The ink rim with centimetre ticks along its top and left, lined up with the grid inside, like a cutting mat's edge. Snow paper inside.", rim: RIM_INK, ruler: true,
    surface: { backgroundColor: "#f1f3fc", boxShadow: PRESS_LIGHT, ...grid("rgb(104 126 245 / .09)", "rgb(104 126 245 / .2)") }, tone: "light", text: "text-[#3c4b63]" },
  { k: "lit", name: "6 · Lit edge", note: "All ink, with a fine cornflower light along the pressed edge, as if lit from under the rim.", rim: RIM_INK, lit: true,
    surface: { background: "linear-gradient(180deg, #121320, #171823)", boxShadow: `${PRESS_DARK}, inset 0 0 0 1px rgb(140 156 248 / .6), inset 0 0 22px rgb(104 126 245 / .3)`, ...grid("rgb(240 244 254 / .045)", "rgb(240 244 254 / .11)") }, tone: "dark", text: "text-white/55" },
];

// centimetre ticks on the rim (a long one every five), centred like the grid so they meet its lines
const ticks = (dir: "x" | "y"): CSSProperties => ({
  backgroundImage: `linear-gradient(${dir === "x" ? "90deg" : "0deg"}, rgb(240 244 254 / .55) 1px, transparent 1px)`,
  backgroundSize: dir === "x" ? `${CELL}px 100%` : `100% ${CELL}px`, backgroundPosition: "center",
});

function Tray({ mat, rim, pieces, name }: { mat: Mat; rim: number; pieces: string[]; name: string }) {
  const r = 30;
  const n = pieces.length;
  const w = n <= 2 ? 128 : n <= 4 ? 104 : 90;
  return (
    <div className="relative h-full" style={{ ...mat.rim, borderRadius: r, padding: rim }}>
      {mat.ruler && (
        <>
          <span aria-hidden className="pointer-events-none absolute top-0 opacity-80" style={{ left: rim + 14, right: rim + 14, height: rim * 0.55, ...ticks("x") }} />
          <span aria-hidden className="pointer-events-none absolute left-0 opacity-80" style={{ top: rim + 14, bottom: rim + 14, width: rim * 0.55, ...ticks("y") }} />
        </>
      )}
      <div className="relative h-full overflow-hidden" style={{ ...mat.surface, borderRadius: r - rim * 0.6 }}>
        <div className={cx("grid h-full place-content-center place-items-center gap-x-3 gap-y-4 px-4 pb-10 pt-5", n <= 2 ? "grid-cols-2" : "grid-cols-3")}>
          {pieces.map((k, i) => (
            <motion.div key={`${name}-${k}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, rotate: (i % 3 - 1) * 3 }} transition={{ delay: 0.06 * i, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ filter: mat.tone === "light" ? "drop-shadow(0 3px 4px rgb(28 36 84 / .14))" : "drop-shadow(0 3px 5px rgb(0 0 0 / .35))" }}>
              <Piece k={k as never} tone={mat.tone} width={w} label={PIECE_LABEL[k as keyof typeof PIECE_LABEL]} />
            </motion.div>
          ))}
        </div>
        <div className={cx("absolute inset-x-4 bottom-3 flex items-baseline justify-between text-[13px]", mat.text)}><span>{n} pieces</span><span>Drafted to Me</span></div>
      </div>
    </div>
  );
}

function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        <div className="dotgrid" />
        {children}
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}
function Pick<T extends string | number>({ items, value, onChange }: { items: { k: T; name: string }[]; value: T; onChange: (k: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">{items.map((x) => (
      <button key={x.k} onClick={() => onChange(x.k)} aria-pressed={value === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", value === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
}

const GARMENTS: { k: GarmentKey; name: string; title: string }[] = [
  { k: "mini", name: "A-line skirt (2 pieces)", title: "Midi A-line skirt" },
  { k: "tee", name: "Tee (4 pieces)", title: "Boxy tee" },
  { k: "flutter", name: "Flutter dress (6 pieces)", title: "Flutter midi dress" },
];

export function MatLab() {
  const [rim, setRim] = useState(8);
  const [g, setG] = useState<GarmentKey>("mini");
  const pieces = piecesFor(g);
  const title = GARMENTS.find((x) => x.k === g)!.title;
  return (
    <section>
      <h2 className="h1 !text-[34px]">Pattern canvas</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">The result screen&apos;s Pattern view: a tray with a raised rim and a pressed-down inside, in the look switch&apos;s colours and light (from above). The grid sits on the pressed surface, the pieces on top. The grid is fixed: a thick line every five thin squares, both centred, so the lines meet (today&apos;s thick lines fall half way between thin ones). Pick the rim&apos;s thickness and a garment; the pieces are drawn a little bigger to use the room.</p>
      <div className="mt-5 space-y-3">
        <div><div className="mb-2 text-[14px] text-white/50">Rim</div><Pick items={[6, 8, 10, 12].map((x) => ({ k: x, name: `${x} px` }))} value={rim} onChange={setRim} /></div>
        <div><div className="mb-2 text-[14px] text-white/50">Garment</div><Pick items={GARMENTS} value={g} onChange={setG} /></div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {MATS.map((m) => (
          <div key={m.k} className="flex w-[360px] flex-col gap-4">
            <Phone label={m.name}>
              <div className="relative px-5 pt-12 text-center text-white">
                <div className="flex h-11 items-center justify-between"><span className="rb rb-sm" aria-hidden /><span className="text-[15px] font-medium text-white/85">Save for later</span></div>
                <h1 className="mt-3 text-[24px] font-normal tracking-[-.02em]">{title}</h1>
                <p className="mt-1 text-[14px] text-white/60">Drafted to Me · relaxed fit</p>
                <div className="mx-auto mt-4 flex w-[240px] rounded-full bg-card p-1 text-[14px] font-medium"><span className="flex-1 py-2 text-white/70">On your body</span><span className="flex-1 rounded-full bg-white py-2 text-bg">Pattern</span></div>
              </div>
              <div className="absolute inset-x-4 top-[244px] h-[408px]">{m.k === "snowRuled" ? <RuledTray rim={Math.max(rim, 10)} pieces={pieces} name={`${m.k}-${g}`} /> : <Tray mat={m} rim={rim} pieces={pieces} name={`${m.k}-${g}`} />}</div>
              <div className="absolute inset-x-5 bottom-8 flex gap-3 text-white"><span className="pill pill-dark flex-1 text-[15px]">Change the design</span><span className="pill pill-primary flex-1 text-[15px]">Looks right</span></div>
            </Phone>
            <p className="text-[14px] leading-snug text-white/55">{m.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
