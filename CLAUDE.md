@AGENTS.md

# Venty

Venty is a front-end-only expo demo of an AI sewing-pattern app. It runs on Next.js 16, React 19, Tailwind 4, zustand and motion.

**Read `docs/VENTY_CONTEXT.md` before any work.** It covers the product, the flows, the decisions and the current status.

Rules that must never be broken (the full list is in §5 of that file):
- One font family, Familjen Grotesk. Headings are Regular 400 with tight letter spacing. Bigilla Bold is for numbers only.
- No uppercase labels with wide letter spacing, no "Recommended" badges, no "01 / 03" step counters, and no "→" arrows. Santiago calls these "AI flop".
- Nothing is pre-selected and no value is pre-filled. Units are the one exception and default to cm.
- Every step screen uses `Arrows` / `NextButton`: the filled primary button, faded until the user makes a choice. Tapping it early nudges the empty inputs marked `data-need="1"`.
- No time estimates anywhere ("about 3 minutes", "6 hours").
- Every measure uses the shared `MeasureStep` (`src/screens/measure.tsx`), and every flow uses `FlowProgress`.
- Information is never styled like a button.
- The only big gradient is **Crown** (from the landing page): use `<Crown />`. Never the old violet radial gradient (#8c9cf8 → #4f63e0 → #1c2252).
- Colour has a job: dark screens are for working (measuring, flows); paper + violet screens (`PaperScreen`, the onboarding look) are for moments (tour question, start, body ready, pattern complete) and the light top of home. The studio ("What are we making?") is light, in the landing page's Made to measure look.
- Custom CSS outside `@layer` beats Tailwind, so never set `display`, `position` or size on those classes.
- Run `npm run build` before committing. Check changes with screenshots at phone size (393×852) and desktop size (1440×900).
- When a decision changes, update `docs/VENTY_CONTEXT.md` in the same commit.
