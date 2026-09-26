# Venty app

High-fidelity prototype of Venty: input your body (photo or measurements), describe the garment, see it rendered on a 3D model of your own body, adjust fit and fabric, and print a pattern drafted to your exact measurements.

Mobile-first PWA, reached by QR code at exhibition. Prototype only; it does not need a working pattern engine.

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- PWA manifest via `src/app/manifest.ts`
- Deployed on Vercel from `main`
- Planned: React Three Fiber for the 3D body, Zustand for state

## Run locally

```bash
npm install
npm run dev
```
