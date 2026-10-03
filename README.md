# Venty — expo prototype

Front-end experience of Venty, the AI sewing-pattern studio: sign up, onboarding, body setup and the 24-measure wizard, pattern creation from a photo / link / sketch / voice, templates (dresses, tops, pants, skirts) fitted to a body, and the full print flow.

Everything *looks* like it works; nothing needs a backend. Any login succeeds, uploads are shown back and "read" by a timed animation, and bodies/patterns are saved on the visitor's own phone.

## Expo tips

- **Reset for the next visitor:** press and hold the top-left corner of the screen for 2 seconds, or use You → Reset.
- **Expo mode (iPad at the stand):** You → Expo mode resets the app after 2 minutes idle.
- **Offline:** after the first visit the app is cached, so it keeps working if the Wi-Fi drops.
- **Install:** on a phone, Share → Add to Home Screen opens it full-screen like an app.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Zustand, Motion. Fonts: Familjen Grotesk (all text) + Bigilla Bold (numbers only), self-hosted. Full project context: `docs/VENTY_CONTEXT.md`.

## Run locally

```bash
npm install
npm run dev
```

## Getting the latest code onto GitHub

If this code came from `venty-app.zip` rather than from a clone:

```bash
git clone https://github.com/nataliack/venty-app.git && cd venty-app
git checkout -b overhaul
# copy everything from the unzipped venty-app folder over this one (overwrite), then:
npm install && npm run build
git add -A && git commit -m "UI/UX overhaul + project context docs"
git push -u origin overhaul   # Vercel builds a preview; merge to main when happy
```
