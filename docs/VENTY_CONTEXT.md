# Venty: project context and handoff

This file holds the full context of the Venty app, so any new Claude Code session can pick up where the work stopped.
It was written on 3 Oct 2026, after a long design-and-build session in Claude (Cowork).
Read it before changing anything. When a decision changes, update this file in the same commit.

---

## 1. What Venty is

Venty is an AI sewing-pattern app.

1. The user saves a picture of a garment they love: a photo, screenshot, magazine page, link or their own sketch.
2. Venty drafts a sewing pattern from that picture, sized to the user's own body measurements.
3. The user previews the pattern on their body, adjusts the fit, and prints it at home on A4 sheets (or on A0 at a print shop).

**Why it exists now:** Venty is being presented at an **interaction design expo**.
- This build is a **front-end-only demo that feels like it works**.
- There is no backend. Pattern generation and AI are simulated.
- The demo covers sign-up and log-in, onboarding, body setup, measuring, photo scan, making a pattern, templates, and printing.

**People:**
- **Santiago** is the main contact.
- **Jose** and **Natalia** review the app screen by screen together with Santiago. Expect feedback in that form ("screen X: change A, B, C").

**Brand assets:**
- Venty motif: a tulip-and-leaf logo. The official vertical logo is in `src/components/art.tsx` (`VentyLogo`).
- Brand guidelines: `venty-brand-guidelines.html`, kept outside the repo.

---

## 2. Repo, hosting, deploy

- **GitHub:** `github.com/nataliack/venty-app` (account `nataliack`).
- **Hosting:** Vercel, Next.js preset (`vercel.json` pins it). Every push to a branch gets a preview URL.
- **Remote branches:** `main`, `build`, `desktop-test`, `overhaul`.
- **The overhaul is on GitHub** (branch `overhaul`, pull request #3 into `main`). Claude Code pushes with the GitHub CLI (`gh`), signed in as `nataliack`.
- **Workflow from now on:** edits go to `main`, which is the live site. Vercel deploys `main` to production automatically.
- **Node 20.9 or newer is required** (Next.js 16). Node 22 is installed through nvm; Node 16 cannot build the app.
- **Installable app (PWA):** manifest in `src/app/manifest.ts`, service worker at `public/sw.js`, icons in `public/`.
- **Parked:** `venty-3d.zip` holds a 3D-body experiment (see §9). It was never pushed. Keep it apart from main.

## 3. Tech stack

- **Next.js 16.3** with the App Router and Turbopack. This version has breaking changes, so read `AGENTS.md` and `node_modules/next/dist/docs/` before using any Next.js API.
- **React 19, TypeScript, Tailwind CSS v4.** Tokens are set in `@theme` in `src/app/globals.css`.
- **zustand with `persist`** for all state, saved to localStorage under the key `venty-expo-v1`, currently version **2**.
  - Raising the version wipes saved state through `migrate` and sends returning users back to the splash screen. That is intended.
- **motion** (`motion/react`) for screen transitions, sheets and micro-interactions.
- **Fonts:** loaded with `next/font/local` from `src/fonts/`.
  - **Familjen Grotesk** (weights 400–700) for all text.
  - **Bigilla Bold** for numbers only.
- **Commands:**
  - `npm run dev`
  - `npm run build`: always run it before committing, and it must pass.
  - `npm start -- -p 3123`: production preview.

## 4. Architecture

The whole app is **one page**, `src/app/page.tsx`, which renders `src/components/App.tsx`. There is no URL routing.

- **Navigation is a stack held in the store:** `stack: Route[]`, where `Route = { id, p? }`.
  - `go(id, p)` opens a screen, `replace(id, p)` swaps the current one, `back()` returns, and `home()` jumps to home.
  - `startBody()` begins a new body: it opens the preferences screen first if those were never set.
  - `exitFlow()` leaves a setup flow and returns to `start` or `home`, removing any body that was never named.
- **`SCREENS` in `App.tsx`** maps each screen id to its component.
  - Screens listed in `FULL` show without the desktop sidebar.
  - The browser and Android back button map to `back()`.
  - Pressing and holding the top-left corner for 2 seconds resets the app (expo kiosk). "Expo mode" also auto-resets after 2 minutes idle.
- **Files:**
  - `src/components/ui.tsx`: design-system pieces.
    - `Screen` is the shell for every screen: an optional pinned header, a scroll area, and a pinned footer.
    - `Arrows` and `NextButton` make the decision button. `Option` is a choice card with a radio ring. `Field` is a text input.
    - `FlowProgress` is the progress bar. `Sheet` is the bottom sheet, and it and `useToast` render into `.device` through a portal.
    - Also `Pill`, `RB` (round button), `Glow`, `Glass`, `FX` (hover effects), `HS`/`H1`/`Lead` (headings and body text), and `Num`.
  - `src/components/art.tsx`: drawn artwork.
    - `BodyFigure` is the 3D-lit mannequin, female or male, with tape-line markers.
    - Also `Flat` (garment flats), `Piece` (pattern pieces), `Ruler` (drag ruler) and `VentyLogo`.
  - `src/components/icons.tsx`: line icons.
  - `src/components/Sidebar.tsx`: desktop navigation (screens 1024px and wider).
  - `src/lib/store.ts`: state and navigation.
  - `src/lib/data.ts`: measures (`BASE` holds 4, `WIZARD` holds 20, grouped by `GROUPS`), templates, fabrics and seed patterns.
  - `src/screens/*.tsx`: one file per area: `auth`, `setup`, `measure`, `wizard`, `home`, `pattern`, `templates`, `print`.
- **Layout:**
  - On phones the app is full screen.
  - Between 640 and 1023px it shows inside a phone frame (for desktop demos).
  - From 1024px up it is a desktop layout with the sidebar.

## 5. Design system rules (agreed with Santiago; follow these strictly)

**Colours:**
- primary **#687EF5**
- indigo #4F63E0
- peri #8C9CF8
- lav #A0ABCA
- mist #C1C8D9
- slate #3C4B63
- denim #4D5E85
- snow #F0F4FE
- screen background **#0B0C15**
- ink #131523

**Type:**
- One family: **Familjen Grotesk**.
- Small numbers inside circles (for example the wizard's group numbers) use `tabular-nums leading-none` so every digit, including "1", sits dead centre.
- Headings use **Regular 400** with tight letter spacing (`.h1` / `.h-serif`: 34px, 52px on desktop, -0.035em). They are never medium or bold.
  - Santiago said "500 … regular, not medium, not bold … we're trying to use regular". 400 was chosen; if he means 500, change the one CSS rule.
- **Bigilla Bold only for numbers** (the `.serif` class).
  - Bigilla has no % ° + – · ×, so Familjen fills in those characters.
  - Unit labels such as "cm" stay in Familjen (the `.unit` class) and carry `translate="no"`. Browser translation once turned "cm" into "centímetros".
- Body text is 1px larger than before: `.lead` is 16px, and most descriptions are 14–16px.

**Banned. Santiago calls these "AI flop" and does not want them:**
- uppercase labels or small headings with wide letter spacing;
- "Recommended" badges;
- step counters like "01 / 03" or "Set up · 01 / 02";
- the "AI pattern studio" tagline in the interface;
- decorative chips that look clickable but aren't;
- arrow characters like "→" in buttons.

**Choices and buttons:**
- **Nothing is ever pre-selected.** The user picks, then continues.
  - **The only exception: units default to cm**, and units can never be empty.
- **Decision button pattern** (`Arrows` / `NextButton`), used on every step screen:
  - Back is a round button on the left.
  - On the right is a quiet chevron that is disabled until a choice is made.
  - Once the user chooses, it grows into "Next ›" (or a specific label, for example "Next: Bust"), with the same dark fill, a **violet outline and the selected gradient**.
- **Option cards** (`Option`):
  - Unselected: quiet glass with a radio ring.
  - Hover: a light gradient preview.
  - Selected: violet edge plus gradient.
  - The bright gradient means *selected or hovered*. A card never sits in that state by default.
- **Information is never styled like a button.** Tips and notes are plain text with an icon (`Note`, the tip lists).
- **Inputs look like real, empty inputs** (`Field`, `.field`), with a placeholder and no pre-filled value.
- **Scrolling and layout:**
  - Screens must not scroll or bounce when the content fits.
  - The footer has no backdrop.
  - The scroll area fades its bottom edge only when it really overflows (`.scroller.is-over`).

**Body figure centring:** to centre a `BodyFigure` in a box, give the svg `h-full w-full` (the viewBox centres the figure itself). Never use `h-full w-auto` inside a flex box: Safari sizes the box from the svg's width attribute and the figure drifts off-centre.

**Navigation (phones):** a light periwinkle tab bar (`.tabbar`, the same colour family as the home hero) with Home, Bodies, Patterns and You, plus one raised round **Create** button sitting in a notch in the middle (`.createbtn`). Create is the single most important action, so it is the only thing raised. Desktop keeps the sidebar.

**Styling pitfall:** custom classes in `globals.css` written **outside** `@layer` beat Tailwind utilities.
- Never put `display`, `position` or size on those classes (`.field`, `.opt`, `.nextbtn`, …), or utilities like `flex` stop working.
- This bug has already happened once.

## 6. Flows (current, after the overhaul)

**Getting in:**
- **Splash:** the logo only. It auto-advances.
- **Welcome:**
  - Logo and headline, with text centred.
  - A slowly drifting gradient background (`.sky` with `.drift` lights).
  - "Get started" and "I already have an account".
- **Sign up (`signup`):** exactly three buttons: Apple, Google, Continue with email.
  - The guest option is the top-right **"Skip for now"**. It was decided to keep guest here, not on Welcome, and as text with no arrow.
- **Log in (`login`):** the same three buttons, plus "New to Venty? Create an account".
- **Email step (`email`, mode `signup` or `login`):**
  - Sign-up asks for name, email and password (at least 8 characters, with a show/hide toggle). Log-in asks for email and password, plus "Forgot password".
  - The button stays disabled until the form is valid.
- **Signed in:** a "Welcome, {name}" moment.

**Onboarding (`onboarding`):**
- **Light and editorial:** paper background, a 56% picture panel, and a "Fig. 1 …" caption. It is meant to look nothing like the dark app.
- **Heading and body text are centre-aligned** on these light pages only (the rest of the app stays left-aligned).
- **Three chapters:** any look you love (photo, screenshot, link, sketch; not just Pinterest), drafted to your body, then tweak and print.
- **Stories-style progress bars** that auto-advance every 7 seconds and stop on the last chapter.
- **A prominent white "Skip" button.** Skipping sets `tourSkipped`, which shows a dismissable "New here? Take the tour" card on home.
- Replayable from Profile → App tour, opened with `{ from: "app" }`, which returns to where the user was.

**Start (`start`) — "Where do you want to start?":**
- Two `Option` cards: **Set up my body** (larger, first) and **Explore templates**. Neither is pre-selected.
- The recommendation followed: no permanently gradient-filled card. Hierarchy comes from size and order, and the gradient appears only on hover or selection.

**Preferences (`prefs`):**
- Shown **once, app-wide**, before the first body. It is not part of each body.
- Units: cm or in, as compact cards with full-width tick strips (`.ticks`) on the bottom edge.
- Sewing experience: 3 cards with no default.
  - Unselected: content vertically centred.
  - Selected: the card expands, title, description and number align to the top, chips and a check appear at the bottom, with space between.
- Both can be edited in Profile.

**Body setup:**
- A progress header on every step: close (X), then "Body · Method · Measures · Review". The bar runs full width to the right edge (no spacer on the right).
1. **`name`:** "Who is this body for?"
   - An empty name field (placeholder "e.g. Me, Mum or Ana").
   - A pattern block choice: Women's block or Men's block, neither pre-selected.
   - An info note: "The block is only the starting shape…"
   - The old "general body", "Who are we fitting?", suggestion chips and initials box are gone.
2. **`method`:** **Scan with my camera** (AI estimates, then the user checks each value) or **Measure by hand**.
3. **By hand:** `measure`, one measure at a time: height → bust → waist → hips.
   - Each starts **empty** ("—"), and Next stays disabled until a value is set.
   - The screen shows only the title, a **full-width, centred body figure** with the tape marker, and the value control. The how-to steps live **only in the "?" sheet** (on phone and desktop), so they are never shown twice.
   - **− and + buttons** step 0.5cm. Tap the number to type a value. Drag the ruler.
   - Once a value is set, the Next button pulses and a line appears: "Nice. Bust is next."
   - Reset, the misleading neighbouring numbers, and the old "Save · next" bar are gone.
4. **Scan:**
   - **`scanPrep`:** plain tips (not cards) and a privacy note.
   - **`scanCam`:**
     - Front / Back / Side tabs that can be tapped.
     - Shutter, flash (torch where the device supports it) and library picker sit low.
     - Each photo is reviewed with **Retake / Use photo**, a check confirms it ("Front saved"), and the tab gets a check mark.
     - Photos are saved as small JPEGs in `body.photos` and can be viewed later ("Your scan photos" sheet).
     - "Read my measures" simulates the AI read. It fills all 24 values and marks them `est` (estimated).
5. **`base`, the review:**
   - Four field-like rows. Rows still marked AI-estimated show a white **"Check"**, and tapping one opens the measure step with "Looks right · Save".
   - Confirmed rows show a small tick before the label and a quiet **"Edit"**. Decision: AI estimates must each be checked once (a wrong bust or hip estimate ruins the pattern, and it is only four taps); values the user measured or already confirmed just offer Edit.
   - Continue stays disabled until all 4 are confirmed.
   - Continue opens a sheet: "Add the other 20 now?" → **Yes, continue** (to `wizard`) or **Later** (to `ready`).
6. **`ready`:**
   - "Saved to your bodies", "Your body is ready", and a summary line with a progress bar (not a card).
   - Buttons: Start a pattern and Go to home.

**The other 20 measures:**
- **Groups:** **Wraps, Lengths, Widths, Seated**. These replace "Around / Down / Across / Sitting", which Santiago disliked.
- **Progress:** "Base · Wraps · Lengths · Widths · Seated".
- **`wizard`:** prep tips (tape, a friend, fitted clothes), then the group list.
  - Base measures show as done.
  - The next group is outlined "Up next". The list is a guide, not a menu.
  - One button: "Continue with {group}". The order is strict.
- **`wstep`:** the same `MeasureStep` UI as the base measures.
- **`wdone`:** shows the same group list, where finished groups have a **"View my measures"** dropdown.
  - "Continue with {next}" and "Take a break, finish later".
  - Taking a break goes **home**, which then shows a **"Continue finishing your measures"** card (`resumeBody`).
- **`alldone`:** the count, then every group including base, each with a dropdown of values. Tapping a value edits it.
  - Button: "Save body". There is no "Edit dimension" button.

**Home (`home`), redesigned so it looks nothing like the setup flows:**
- **Top: a periwinkle hero** (`.home-hero`) that bleeds under the status bar and ends in rounded bottom corners. Dark ink text on it.
  - Avatar, greeting and name, and a search button.
  - "What are we making?" and "Start from any look you love. We draft it to {body}."
  - A frosted card (`.hero-card`) with four dark square shortcuts: **Photo, Link, Sketch, Template**. Photo, Link and Sketch start a pattern (pick the body, then the prompt screen opens the matching input through `draft.start`). Template opens templates.
- **Below, on the dark page:** notices (finish your measures, take the tour), **Your bodies** (a horizontal row with a dashed "+" first, then each body), **Your patterns** (the three latest, with a status dot), and a Templates row. Each section has a "View all".
- Desktop uses the same structure: the hero becomes a rounded card with the shortcuts on the right, and bodies and patterns sit side by side.

**Elsewhere:**
- **home, bodies, patterns, you:** tab bar on phones, sidebar on desktop.
- **Pattern flow:** `patSelectBody` → `prompt` → `ref` → `ai` → `generating` → `garment` → `edits`.
- **Templates:** `templates` → `template` → `tplBody` → `tplFit` → `tplResult`.
- **Print:** `seam` → `arrange` → `printMethod` → `needs` → `print` → `pages` → `minimap` → `printed`.
- Body, seam and printer choices are no longer pre-selected.

## 7. State model (`src/lib/store.ts`)

- `units` ("cm" by default), `experience` (number or null), `prefsDone`, `onboarded`, `tourSkipped`, `resumeBody`, `kiosk`.
- `user`: `{ name, email, guest }`.
- `bodies: Body[]`, where a `Body` has:
  - `id`, `name`, and `sex` ("female" or "male");
  - `measures`: all 24 keys, filled with defaults internally;
  - `done`: the keys the user has confirmed. This decides what counts as entered.
  - `est`: keys the AI estimated that are not yet checked;
  - `photos`: `[front, back, side]`;
  - `photoScan`.
- `activeBody`, `patterns`, `draft` (the pattern being made).

## 8. Status (updated 3 Oct 2026, second round)

**Second review round (done):** centred onboarding text, full-width progress bars, centred wizard numbers, how-to steps moved into the "?" sheet only, full-width centred body figures (measure and ready screens), Check/Edit on the base review, the new home and the new tab bar.

**Next likely round:** the pattern, templates and print screens. Known issues there: the prompt screen pre-fills the link and description fields, and shows a "New pattern · 02" step counter (both against §5).

### Status at handoff (3 Oct 2026)

**Done in the last session:** everything in §5–§6. The build passes, and the body flow and photo-scan flow were checked with Playwright on phone and desktop sizes with no console errors.

**Not yet verified:**
- **iPhone home-screen gap fix.** `html`, `body` and `.device` are now `position: fixed; inset: 0`, with `viewportFit: cover` and safe-area variables (`--top`, `--bottom`). Test it by adding the app to the iPhone home screen.
- The light onboarding against the iOS status bar (white text). The picture panel sits under the status bar, so it should be readable.
- The real camera on a phone. Desktop or no camera falls back to simulated photos.

**Open questions and likely next steps:**
1. Push the overhaul to GitHub (§2) and review the Vercel preview with Jose and Natalia, screen by screen.
2. Confirm the heading weight: 400 (current) or 500.
3. The pattern, templates and print screens got the global type and pre-selection fixes only. They have not had the same detailed review yet, which is the likely next review round.
4. Experience preference: the setting is saved, but no copy changes based on it yet.

## 9. Other work from the same project (outside this repo)

- **3D body plan (parked):**
  - Faceless chrome mannequins, female and male, reshaped live from all 24 measurements, rotating 360°, with garments on the body.
  - Open-source tools: MakeHuman / MPFB2 for bodies, FreeSewing for pattern drafting. Santiago doesn't use Blender.
  - The experiment is in `venty-3d.zip`, intended for a separate `3d-body` branch. Do not merge it into main.
- **Campaign website:** a single HTML page, published as the "Venty Campaign Site" artifact, with its images in `venty-site-images.zip`. It was matched to a Webflow reference.
- **Figma:** a "Venty" file in Drafts holds the brand guide (first page) and the 3D design.
  - Bigilla should replace the number font in Figma once it's installed there.
- **Earlier Claude previews:**
  - "Venty Preview" artifact: a single-file build of the app.
  - "Venty Brand Guidelines" artifact.

## 10. Working agreements

- Work screen by screen. Gather all the comments for a screen, apply them, then show before and after.
- Check with real screenshots (Playwright with Chromium, at 393×852 for phone and 1440×900 for desktop) before saying something is done.
- Keep every screen consistent: one measuring UI, one progress style, one card style, the same check-icon size.
- Make the demo behave like a real app. No fake pre-filled values, and the user can't skip required input.
- Keep commits small and descriptive, and update this file when decisions change.
