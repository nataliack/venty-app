"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { VentyLogo, BodyFigure } from "./art";
import { Icon, type IconName } from "./icons";
import { cx, Pill } from "./ui";
import { CreateSheet } from "@/screens/home";

// Which sidebar item a route belongs to
const SECTION: Record<string, string> = {
  home: "home",
  bodies: "bodies", preview: "bodies", edit: "bodies", ready: "bodies", prefs: "bodies", method: "bodies", scanPrep: "bodies", name: "bodies", base: "bodies", measure: "bodies",
  wizard: "bodies", wstep: "bodies", wdone: "bodies", alldone: "bodies",
  patterns: "patterns", garment: "patterns", edits: "patterns", seam: "patterns", arrange: "patterns", printMethod: "patterns", needs: "patterns", print: "patterns", pages: "patterns", minimap: "patterns", printed: "patterns",
  patSelectBody: "make", prompt: "make", ref: "make", ai: "make", generating: "make",
  templates: "templates", template: "templates", tplBody: "templates", tplFit: "templates", tplResult: "templates",
  you: "you",
};

export function Sidebar({ route }: { route: string }) {
  const { home, go, newDraft, user, body, patterns } = useApp();
  const b = body();
  const [create, setCreate] = useState(false);
  const active = SECTION[route] ?? "home";
  const nav = (id: string, fn?: () => void) => { home(); if (id !== "home") setTimeout(() => (fn ? fn() : go(id)), 0); };
  const items: [string, IconName, string, (() => void)?][] = [
    ["home", "home", "Home"],
    ["make", "sparkle", "Make a pattern", () => { newDraft(); go("patSelectBody"); }],
    ["templates", "dress", "Templates", () => go("templates")],
    ["bodies", "body", "Body library", () => go("bodies")],
    ["patterns", "scissors", "Pattern library", () => go("patterns")],
    ["you", "user", "You", () => go("you")],
  ];
  return (
    <aside className="relative z-20 hidden w-[260px] shrink-0 flex-col border-r border-white/8 bg-[#0d0e18] px-5 pb-6 pt-8 lg:flex">
      <button onClick={() => nav("home")} className="flex flex-col items-center self-start px-2" aria-label="Venty home">
        <VentyLogo width={92} />
      </button>
      <Pill className="mt-8 !h-12 !text-[16px]" onClick={() => setCreate(true)} icon={<Icon name="plus" size={18} />}>Create</Pill>
      <nav className="mt-6 flex flex-col gap-1">
        {items.map(([id, ic, label, fn]) => (
          <button key={id} onClick={() => nav(id, fn)} className={cx("flex h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] font-medium transition-colors", active === id ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white")}>
            <Icon name={ic} size={19} />{label}
            {id === "patterns" && <span className="ml-auto text-[13px] text-white/40">{patterns.length}</span>}
          </button>
        ))}
      </nav>
      <div className="mt-auto">
        <div className="glass flex items-center gap-3 rounded-[20px] p-3">
          <div className="grid h-14 w-10 place-items-center rounded-[12px] bg-primary/25"><BodyFigure sex={b.sex} width={18} glow={false} /></div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">{b.name}</div>
            <div className="text-[11px] text-white/50">{Math.max(4, b.done.length)}/24 measures</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 px-1">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[15px] font-semibold">{(user.guest ? "G" : user.name[0]).toUpperCase()}</span>
          <div className="flex-1 text-[14px]"><div className="font-medium">{user.guest ? "Guest" : user.name}</div><div className="text-[11px] text-white/45">{user.email || "Exploring"}</div></div>
          <button aria-label="Reset for next visitor" title="Reset for the next visitor" onClick={() => nav("you")} className="text-white/45 hover:text-white"><Icon name="refresh" size={18} /></button>
        </div>
      </div>
      <CreateSheet open={create} onClose={() => setCreate(false)} />
    </aside>
  );
}
