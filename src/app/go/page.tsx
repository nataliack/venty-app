import type { Metadata } from "next";
import { Crown } from "@/components/ui";
import { VentyLogo } from "@/components/art";

// app.venty.au/go (5 Nov 2026, Jose): where Venty's QR code leads (a static code with this address in it, so it never
// expires while the domain and this page are kept). Two ways in: try the app (app.venty.au/install: on a phone, Add
// Venty to your home screen, then the very start; on a computer, the app in its phone) or visit the website (venty.au).
// On the Crown sky, the logo where the splash has it, the choices at the foot. A page of its own (not the app), so it
// loads at once; its visits are counted with the rest (Visits, in the layout).
export const metadata: Metadata = { title: "Venty", description: "Sewing patterns drafted to your measurements. Try the app or visit the website." };

export default function Go() {
  return (
    <main className="fixed inset-0 overflow-y-auto overflow-x-hidden text-center text-white noscroll">
      <Crown live />
      {/* on a wide screen the sky is brightest where the words are: a soft shade under them keeps them clear */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(180deg, transparent 28%, rgb(19 22 52 / .42) 62%, rgb(19 22 52 / .55))" }} aria-hidden />
      <div className="relative mx-auto flex min-h-full w-full max-w-[440px] flex-col items-center px-6"
        style={{ paddingTop: "calc(max(env(safe-area-inset-top), 10px) + 6px)", paddingBottom: "max(env(safe-area-inset-bottom), 18px)" }}>
        <div className="mt-[13dvh]"><VentyLogo width={190} /></div>
        <div className="my-auto flex flex-col items-center pt-8">
          <h1 className="h1 !text-[36px]">Welcome to Venty</h1>
          <p className="lead mt-2 !text-white/80">Sewing patterns drafted to your<br />measurements, ready to print at home.</p>
        </div>
        <div className="flex w-full flex-col gap-3 pb-2">
          <a href="/install" className="pill pill-primary w-full text-[17px]">Try the app</a>
          <a href="https://venty.au" className="pill pill-glass w-full text-[17px]">Visit the website</a>
        </div>
      </div>
    </main>
  );
}
