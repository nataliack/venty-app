# Venty — expo prototype

Front-end experience of Venty, the AI sewing-pattern studio: sign up, onboarding, body setup and the 24-measure wizard, pattern creation from a photo / link / sketch / voice, templates (dresses, tops, pants, skirts) fitted to a body, and the full print flow.

Everything *looks* like it works; nothing needs a backend. Any login succeeds, uploads are shown back and "read" by a timed animation, and bodies/patterns are saved on the visitor's own phone.

## Expo tips

- **Reset for the next visitor:** press and hold the top-left corner of the screen for 2 seconds, or use You → Reset.
- **Expo mode (iPad at the stand):** You → Expo mode resets the app after 2 minutes idle.
- **Offline:** after the first visit the app is cached, so it keeps working if the Wi-Fi drops.
- **Install:** on a phone, Share → Add to Home Screen opens it full-screen like an app.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Zustand, Motion. Fonts: Familjen Grotesk + Instrument Serif (self-hosted).

## Run locally

```bash
npm install
npm run dev
```
