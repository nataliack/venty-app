"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { Pin } from "@/lib/store";
import { useDesk } from "./ui";
import { Ico, SI } from "./studio-icons";

/* The drawing pad: a dialog over the studio, for a new sketch or for drawing on a photo (ported from the landing page's
   Made to measure composer). Tools: pen, highlighter, eraser, and notes (tap to drop a numbered pin). Size slider with a
   live preview, palette swatches plus a custom colour (hue, shade, hex, recent colours), undo and redo (Ctrl/Cmd + Z,
   Shift for redo), clear, and a dress-form guide on paper. Saving flattens the drawing onto the photo; pins stay as data.
   It renders into the device frame (like the app's sheets), so it always covers the whole screen. */

type Tool = "pen" | "marker" | "eraser" | "pin";
type Stroke = { tool: Tool; color: string; size: number; pts: [number, number][] }; // points 0..1, so a resize keeps the drawing

const PAPER = "#f0f4fe"; // snow
const PALETTE = [
  { name: "Ink", c: "#131523" },
  { name: "Slate", c: "#3c4b63" },
  { name: "Primary", c: "#687ef5" },
  { name: "Lavender", c: "#a0abca" },
  { name: "Snow", c: "#f0f4fe" },
];
// a dress form, drawn dashed on a new sketch so there is something to draw on
const FORM =
  "M86 8 L114 8 L113 40 Q150 48 160 70 Q166 92 162 112 Q156 140 144 170 Q140 196 164 226 Q168 246 150 262 L104 266 L104 300 L140 306 Q144 314 100 314 Q56 314 60 306 L96 300 L96 266 L50 262 Q32 246 36 226 Q60 196 56 170 Q44 140 38 112 Q34 92 40 70 Q50 48 87 40 Z";

const hsl = (h: number, s: number, l: number) => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
const cover = (ctx: CanvasRenderingContext2D, im: HTMLImageElement, w: number, h: number) => {
  const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
  ctx.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
};
// one stroke, in the board's own size
const drawStroke = (ctx: CanvasRenderingContext2D, st: Stroke, w: number, h: number) => {
  ctx.globalCompositeOperation = st.tool === "eraser" ? "destination-out" : "source-over";
  ctx.globalAlpha = st.tool === "marker" ? 0.35 : 1;
  ctx.strokeStyle = st.color;
  ctx.lineWidth = st.tool === "marker" ? st.size * 3 : st.tool === "eraser" ? st.size * 4 : st.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  st.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)));
  if (st.pts.length === 1) ctx.lineTo(st.pts[0][0] * w + 0.1, st.pts[0][1] * h);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};
// a canvas sized to the board (crisp on retina, capped at 2x), ready to draw in board pixels
const sized = (c: HTMLCanvasElement, w: number, h: number, dpr: number) => {
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};

function ColourPicker({ value, recent, onPick }: { value: string; recent: string[]; onPick: (c: string) => void }) {
  const [hue, setHue] = useState(230);
  const [tone, setTone] = useState(55); // lightness, 10..90
  const [hex, setHex] = useState(value);
  const pick = (c: string) => { setHex(c); onPick(c); };
  return (
    <div className="pad-picker" role="dialog" aria-label="Custom colour">
      <div className="pad-picker__preview" style={{ background: hex }} />
      <label className="pad-picker__row">
        <span>Hue</span>
        <input type="range" min={0} max={360} value={hue} className="pad-range pad-range--hue"
          onChange={(e) => { const h = Number(e.target.value); setHue(h); pick(hsl(h, 0.78, tone / 100)); }} />
      </label>
      <label className="pad-picker__row">
        <span>Shade</span>
        <input type="range" min={10} max={90} value={tone} className="pad-range"
          style={{ background: `linear-gradient(90deg, ${hsl(hue, 0.78, 0.1)}, ${hsl(hue, 0.78, 0.5)}, ${hsl(hue, 0.78, 0.9)})` }}
          onChange={(e) => { const t = Number(e.target.value); setTone(t); pick(hsl(hue, 0.78, t / 100)); }} />
      </label>
      <label className="pad-picker__row">
        <span>Hex</span>
        <input className="pad-hex" value={hex} maxLength={7} spellCheck={false} autoCapitalize="off" autoComplete="off"
          onChange={(e) => { const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`; setHex(v); if (/^#[0-9a-f]{6}$/i.test(v)) onPick(v); }} />
      </label>
      {recent.length > 0 && (
        <div className="pad-picker__row">
          <span>Recent</span>
          <div className="flex gap-1.5">
            {recent.map((c) => <button key={c} type="button" className="pad-swatch is-sm" style={{ background: c }} aria-label={`Recent colour ${c}`} onClick={() => pick(c)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export function SketchPad({ base, pins: startPins = [], title, onClose, onSave }: {
  base?: string;
  pins?: Pin[];
  title: string;
  onClose: () => void;
  onSave: (src: string, pins: Pin[]) => void;
}) {
  const desk = useDesk();
  const stage = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const under = useRef<HTMLCanvasElement>(null);
  const over = useRef<HTMLCanvasElement>(null);
  const liveCv = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const redo = useRef<Stroke[]>([]);
  const live = useRef<Stroke | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [size, setSize] = useState(4);
  const [color, setColor] = useState(base ? "#687ef5" : "#131523");
  const [recent, setRecent] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);
  const [guide, setGuide] = useState(true);
  const [pins, setPins] = useState<Pin[]>(startPins);
  const [editing, setEditing] = useState<number | null>(null);
  const [counts, setCounts] = useState({ s: 0, r: 0 }); // strokes and redo, for the buttons
  const [ratio, setRatio] = useState(4 / 5); // the board takes the photo's own shape; a sketch is 4:5 paper
  const [loaded, setLoaded] = useState(!base);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const bump = () => setCounts({ s: strokes.current.length, r: redo.current.length });

  const dims = () => ({ w: box.w, h: box.h, dpr: Math.min(2, window.devicePixelRatio || 1) });

  // the board: as large as the space allows, in its own proportions
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(0, Math.floor(Math.min(r.width, r.height * ratio)));
      setBox((b) => (b.w === w && b.h === Math.floor(w / ratio) ? b : { w, h: Math.floor(w / ratio) }));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ratio]);

  useEffect(() => {
    if (!base) return;
    const im = new Image();
    im.onload = () => { img.current = im; setRatio(im.naturalWidth / im.naturalHeight || 4 / 5); setLoaded(true); };
    im.src = base;
  }, [base]);

  const paintUnder = useCallback(() => {
    const c = under.current;
    if (!c || !box.w) return;
    const ctx = sized(c, box.w, box.h, Math.min(2, window.devicePixelRatio || 1));
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, box.w, box.h);
    if (img.current) cover(ctx, img.current, box.w, box.h);
    else if (guide) {
      const s = (box.h * 0.86) / 320;
      ctx.save();
      ctx.translate(box.w / 2 - 100 * s, box.h * 0.07);
      ctx.scale(s, s);
      ctx.strokeStyle = "rgba(77, 94, 133, 0.32)";
      ctx.lineWidth = 1.2 / s;
      ctx.setLineDash([4 / s, 5 / s]);
      ctx.stroke(new Path2D(FORM));
      ctx.restore();
    }
  }, [box, guide]);

  // the finished strokes: repainted only on undo, redo, clear or resize
  const paintOver = useCallback(() => {
    const c = over.current;
    if (!c || !box.w) return;
    const ctx = sized(c, box.w, box.h, Math.min(2, window.devicePixelRatio || 1));
    ctx.clearRect(0, 0, box.w, box.h);
    for (const st of strokes.current) drawStroke(ctx, st, box.w, box.h);
  }, [box]);

  useEffect(() => { paintUnder(); paintOver(); }, [paintUnder, paintOver, loaded]);

  // the stroke being drawn: only it, on its own layer, so each move stays cheap however much is on the board
  const paintLive = () => {
    const c = liveCv.current;
    const st = live.current;
    if (!c || !box.w) return;
    const { w, h, dpr } = dims();
    const ctx = sized(c, w, h, dpr);
    ctx.clearRect(0, 0, w, h);
    if (!st) return;
    if (st.tool === "eraser") {
      // the eraser works on the finished strokes directly, a segment at a time
      const o = sized(over.current!, w, h, dpr);
      drawStroke(o, { ...st, pts: st.pts.slice(Math.max(0, st.pts.length - 2)) }, w, h);
      return;
    }
    drawStroke(ctx, st, w, h);
  };

  const undo = useCallback(() => {
    const s = strokes.current.pop();
    if (s) redo.current.push(s);
    paintOver();
    setCounts({ s: strokes.current.length, r: redo.current.length });
  }, [paintOver]);
  const again = useCallback(() => {
    const s = redo.current.pop();
    if (s) strokes.current.push(s);
    paintOver();
    setCounts({ s: strokes.current.length, r: redo.current.length });
  }, [paintOver]);

  // keys: Ctrl/Cmd + Z undo, + Shift redo, Escape closes the colour picker, then the pad
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) again(); else undo();
      }
      if (e.key === "Escape") { if (picker) setPicker(false); else onClose(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [undo, again, onClose, picker]);

  const at = (e: RPointerEvent): [number, number] => {
    const r = liveCv.current!.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  };
  const down = (e: RPointerEvent) => {
    setPicker(false);
    if (tool === "pin") {
      const [x, y] = at(e);
      setPins((p) => [...p, { x, y, note: "" }]);
      setEditing(pins.length);
      return;
    }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* no capturable pointer: draw anyway */ }
    live.current = { tool, color, size, pts: [at(e)] };
    redo.current = [];
    paintLive();
  };
  const move = (e: RPointerEvent) => {
    if (!live.current) return;
    live.current.pts.push(at(e));
    paintLive();
  };
  const up = () => {
    const st = live.current;
    if (!st) return;
    strokes.current.push(st);
    live.current = null;
    // the finished stroke settles onto its layer (the eraser already has)
    if (st.tool !== "eraser") {
      const { w, h, dpr } = dims();
      drawStroke(sized(over.current!, w, h, dpr), st, w, h);
    }
    paintLive();
    bump();
  };
  const choose = (c: string, keep = true) => {
    setColor(c);
    if (tool === "eraser" || tool === "pin") setTool("pen");
    if (keep && !PALETTE.some((p) => p.c === c)) setRecent((r) => [c, ...r.filter((x) => x !== c)].slice(0, 5));
  };
  const clear = () => {
    strokes.current = [];
    redo.current = [];
    setPins([]);
    setEditing(null);
    paintOver();
    bump();
  };
  const save = () => {
    const { w, h } = dims();
    if (!w) return;
    const out = document.createElement("canvas");
    out.width = w * 2;
    out.height = h * 2;
    const ctx = out.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
    if (img.current) cover(ctx, img.current, w, h);
    ctx.drawImage(over.current!, 0, 0, w, h);
    // photos keep a small JPEG; sketches stay crisp as PNG
    onSave(img.current ? out.toDataURL("image/jpeg", 0.9) : out.toDataURL("image/png"), pins.filter((p) => p.note.trim()));
  };

  const has = counts.s > 0;
  const changed = has || pins.length !== startPins.length || pins.some((p, i) => p.note !== startPins[i]?.note);
  const preview = tool === "marker" ? size * 3 : tool === "eraser" ? size * 4 : size;
  const hint = tool === "pin" ? "Tap where the note goes" : base ? "Draw where you want it changed" : "Draw the shape. A rough line is plenty.";

  const notes = (
    <div className={desk ? "pad-notes w-[240px] shrink-0 overflow-y-auto noscroll" : "pad-notes max-h-[132px] shrink-0 overflow-y-auto noscroll"} aria-label="Notes">
      <p className="pad-eyebrow">Notes</p>
      {pins.length === 0 ? (
        <p className="pad-small mt-1.5">Choose Note, then tap the drawing to pin what should change there.</p>
      ) : (
        <ol className="mt-2 space-y-1.5">
          {pins.map((p, i) => (
            <li key={i} className={`pad-note ${editing === i ? "is-on" : ""}`}>
              <span className="pad-note__n">{i + 1}</span>
              <input autoFocus={editing === i} value={p.note} placeholder="What changes here?" onFocus={() => setEditing(i)}
                onChange={(e) => setPins((l) => l.map((x, k) => (k === i ? { ...x, note: e.target.value } : x)))} aria-label={`Note ${i + 1}`} />
              <button type="button" aria-label={`Remove note ${i + 1}`} onClick={() => { setPins((l) => l.filter((_, k) => k !== i)); setEditing(null); }}>
                <Ico d={SI.x} size={14} />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  const host = document.querySelector(".device") ?? document.body;
  return createPortal(
    <div className="pad-modal" role="dialog" aria-modal="true" aria-label={title}>
      {/* tapping outside closes only an untouched pad, so a stray tap never throws a drawing away */}
      <div className="pad-modal__scrim" onClick={() => { if (!changed) onClose(); }} />
      <div className={desk ? "pad h-[min(760px,100%)] w-[min(980px,100%)]" : "pad h-full w-full"}>
        <div className="pad__head">
          <button type="button" className="cmp-ghost" onClick={onClose}>Cancel</button>
          <p className="pad__title">{title}</p>
          <button type="button" className="pill pill-primary cmp-go-sm" onClick={save} disabled={!changed}>{base ? "Save changes" : "Add sketch"}</button>
        </div>

        {/* tools */}
        <div className="pad__tools" role="toolbar" aria-label="Drawing tools">
          <div className="cmp-seg">
            {([["pen", "Pen", SI.pen], ["marker", "Highlighter", SI.marker], ["eraser", "Eraser", SI.erase], ["pin", "Note", SI.pin]] as const).map(([t, name, d]) => (
              <button key={t} type="button" aria-pressed={tool === t} onClick={() => { setTool(t); setPicker(false); }} title={name} aria-label={name}>
                <Ico d={d} size={16} />
                {desk && <span>{name}</span>}
              </button>
            ))}
          </div>

          <label className="pad-size" title="Brush size">
            <span className="pad-size__dot" style={{ width: Math.min(28, preview), height: Math.min(28, preview), background: tool === "eraser" ? "transparent" : color, opacity: tool === "marker" ? 0.4 : 1 }} />
            <input type="range" min={1} max={14} value={size} onChange={(e) => setSize(Number(e.target.value))} className="pad-range" aria-label="Brush size" />
          </label>

          <div className="flex items-center gap-1.5" role="group" aria-label="Colour">
            {PALETTE.map((p) => (
              <button key={p.c} type="button" className="pad-swatch" style={{ background: p.c }} aria-label={p.name} aria-pressed={color === p.c} onClick={() => choose(p.c, false)} />
            ))}
            <button type="button" className="pad-swatch pad-swatch--custom" aria-label="Custom colour" aria-expanded={picker}
              aria-pressed={!PALETTE.some((p) => p.c === color)} style={{ "--c": color } as CSSProperties} onClick={() => setPicker((o) => !o)} />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {!base && (
              <button type="button" className="cmp-icon" aria-pressed={guide} onClick={() => setGuide((g) => !g)} title="Dress form guide" aria-label="Dress form guide">
                <Ico d={SI.form} size={17} />
              </button>
            )}
            <button type="button" className="cmp-icon" onClick={undo} disabled={!has} title="Undo (Ctrl/Cmd + Z)" aria-label="Undo"><Ico d={SI.undo} size={17} /></button>
            <button type="button" className="cmp-icon" onClick={again} disabled={!counts.r} title="Redo (Shift + Ctrl/Cmd + Z)" aria-label="Redo"><Ico d={SI.redo} size={17} /></button>
            <button type="button" className="cmp-icon" onClick={clear} disabled={!has && !pins.length} title="Clear" aria-label="Clear"><Ico d={SI.trash} size={17} /></button>
          </div>
          {picker && <ColourPicker value={color} recent={recent} onPick={(c) => choose(c)} />}
        </div>

        <div className={desk ? "pad__body flex-row" : "pad__body flex-col"}>
          <div ref={stage} className="relative grid min-h-0 min-w-0 flex-1 place-items-center">
            <div ref={board} className="pad__board" style={{ width: box.w, height: box.h }}>
              <canvas ref={under} className="absolute inset-0 h-full w-full" aria-hidden="true" />
              <canvas ref={over} className="absolute inset-0 h-full w-full" aria-hidden="true" />
              <canvas ref={liveCv} className="absolute inset-0 h-full w-full touch-none" style={{ cursor: tool === "pin" ? "copy" : tool === "eraser" ? "cell" : "crosshair" }}
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="img" aria-label={base ? "Drawing on the picture" : "Sketch"} />
              {pins.map((p, i) => (
                <button key={i} type="button" className={`pad-pin ${editing === i ? "is-on" : ""}`} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} onClick={() => setEditing(i)} aria-label={`Note ${i + 1}`}>
                  <span className="serif">{i + 1}</span>
                </button>
              ))}
              {!has && !pins.length && box.w > 0 && <p className="pad__hint">{hint}</p>}
            </div>
          </div>
          {notes}
        </div>
      </div>
    </div>,
    host,
  );
}
