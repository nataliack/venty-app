"use client";
// On a tablet or a computer the app is shown on a phone (1 Nov 2026, Jose): the landing page's iPhone (its Features
// card, .ftp in features.css: the titanium band with its antenna bands and buttons, the black border round the screen,
// the island with its camera, the home bar; no sheen on the glass, which lay over the top of every screen like a glow)
// with the app running inside it, in a frame exactly an iPhone's screen (393 x 852), so every screen is its phone layout
// and nothing of the computer's width reaches it. The phone is scaled to fit the window (never above its real size),
// centred on the dark page. On a phone none of this is used (lib/device.ts).
import { useEffect, useState } from "react";

const SCREEN_W = 393, SCREEN_H = 852;
// the frame round the screen, in the landing's own measures: 1em = the phone's width / 38.95, the black border 1.25em
const EM = SCREEN_W / (38.95 - 2.5), PAD = 1.25 * EM;
const PHONE_W = SCREEN_W + 2 * PAD, PHONE_H = SCREEN_H + 2 * PAD;
const AIR = 32; // at least this much room round the phone (and room for its buttons and shadow)

export function PhoneFrame() {
  const [scale, setScale] = useState(1);
  // the app at the address this page was opened at (app.venty.au/install opens its screen inside, as it would on a phone)
  const [src] = useState(() => (typeof window === "undefined" ? "/" : window.location.pathname + window.location.search + window.location.hash));
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - AIR * 2) / PHONE_H, (window.innerWidth - AIR * 2) / PHONE_W));
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="pf-page">
      <div className="pf" style={{ width: PHONE_W, height: PHONE_H, fontSize: EM, scale: String(scale) }}>
        <span className="pf__btns" aria-hidden><span className="pf__btn is-l1" /><span className="pf__btn is-l2" /><span className="pf__btn is-l3" /><span className="pf__btn is-r1" /></span>
        <div className="pf__glass">
          <div className="pf__screen">
            <iframe src={src} title="Venty" className="pf__app" style={{ width: SCREEN_W, height: SCREEN_H }}
              allow="camera; microphone; clipboard-read; clipboard-write; web-share; fullscreen; accelerometer; gyroscope" />
          </div>
          <span className="pf__island" aria-hidden />
          <span className="pf__camera" aria-hidden />
        </div>
      </div>
    </div>
  );
}
