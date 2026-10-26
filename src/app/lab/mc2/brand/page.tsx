"use client";
// Lab (MC 2): Venty's brand system as 1920 × 1080 slides, for the design exhibition. The page shows every slide scaled
// to the window; ?s=<slide id> shows one alone at its full size, to export (a screenshot of the window at 1920 × 1080).
import { useEffect, useState, type ComponentType } from "react";
import { W, H } from "./kit";
import { Cover, Contents, Idea, LogoHero, MarkBuild, WordBuild, LogoColours, AppIcons, Space, Misuse } from "./logo";
import { ColourHero, Palette, ColourJobs, Gradients, TypeHero, TypeGlyphs, Numbers, TypeScale, Interface, Components, Patterns, Imagery, Icons, Closing } from "./system";

const SLIDES: { id: string; S: ComponentType }[] = [
  { id: "cover", S: Cover }, { id: "contents", S: Contents }, { id: "idea", S: Idea },
  { id: "logo", S: LogoHero }, { id: "mark-build", S: MarkBuild }, { id: "word-build", S: WordBuild }, { id: "logo-colours", S: LogoColours }, { id: "app-icon", S: AppIcons }, { id: "space", S: Space }, { id: "misuse", S: Misuse },
  { id: "colour", S: ColourHero }, { id: "palette", S: Palette }, { id: "colour-jobs", S: ColourJobs }, { id: "gradients", S: Gradients },
  { id: "type", S: TypeHero }, { id: "glyphs", S: TypeGlyphs }, { id: "numbers", S: Numbers }, { id: "type-scale", S: TypeScale },
  { id: "interface", S: Interface }, { id: "components", S: Components }, { id: "patterns", S: Patterns }, { id: "imagery", S: Imagery }, { id: "icons", S: Icons },
  { id: "closing", S: Closing },
];

export default function Brand() {
  const [one, setOne] = useState<string | null>(null);
  const [z, setZ] = useState(0);
  useEffect(() => {
    const read = () => setOne(new URLSearchParams(location.search).get("s"));
    const fit = () => setZ(Math.min(1, (window.innerWidth - (window.innerWidth < 700 ? 32 : 96)) / W));
    read(); fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // one slide alone, at full size: the window at 1920 × 1080 is the export
  if (one) {
    const s = SLIDES.find((x) => x.id === one);
    return <main className="fixed inset-0 overflow-auto bg-black">{s ? <s.S /> : <p className="p-10 text-white">No slide called {one}.</p>}</main>;
  }
  return (
    // the app pins html and body, so the deck scrolls in its own layer
    <main className="fixed inset-0 overflow-y-auto bg-[#07080e] pb-24 text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#07080e]/85 px-4 py-4 backdrop-blur md:px-12">
        <p className="text-[15px] text-white/80">Venty brand system <span className="text-white/45">· {SLIDES.length} slides, 1920 × 1080</span></p>
        <p className="hidden text-[14px] text-white/45 md:block">Open a slide alone to export it</p>
      </header>
      {z > 0 && (
        <div className="mx-auto mt-6 flex flex-col items-center gap-10">
          {SLIDES.map(({ id, S }) => (
            <figure key={id} className="flex flex-col items-start gap-3">
              <div className="overflow-hidden rounded-[14px] shadow-[0_30px_80px_-40px_rgb(0_0_0/.9)]" style={{ width: W * z, height: H * z }}>
                <div style={{ zoom: z }}><S /></div>
              </div>
              <a href={`?s=${id}`} className="text-[14px] text-white/55 underline-offset-4 hover:text-white hover:underline">Open “{id}” alone</a>
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
