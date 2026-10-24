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
- Venty motif: a tulip-and-leaf logo. The official vertical logo is in `src/components/art.tsx` (`VentyLogo`). **Final stacked lockup (20 Oct 2026, from Jose):** the mark above "Venty", viewBox 2132 × 1786, five paths copied exactly; only the colour changes per screen.
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

**Home-screen app (PWA) vs Safari (checked on a real iPhone, iOS 26, via iPhone Mirroring):**
- **Status bar is transparent (`black-translucent`)**, as wanted. On iOS 26 this triggers a WebKit regression (bug 301108): a home-screen app's window is one status bar (47pt) short at the bottom, an unpaintable strip on every screen. **Workaround (5 Oct 2026):** iOS grows the window to the full screen once the document is taller than the screen (verified on an iPhone in kaplanoah/sports-apps#57/#60). So under `html.pwa` the root is a normal document with `min-height: calc(100% + env(safe-area-inset-top) + 1px)` instead of a pinned `position: fixed` one; `.device` stays fixed and fills the full window. `100lvh`, sizing to `screen.height` and negative offsets do NOT work (tested by others on devices). **Confirmed on the real iPhone (5 Oct 2026): the see-through top shows and the app reaches the bottom edge.** `html.vp-short` (innerHeight shorter than the screen) is still set but only shown in the readout: on the iPhone it read "short" even though the app reached the edge, so the layout must never depend on it. The alternative, an opaque status bar, also fixes the bottom but loses the see-through top. iOS reads the status bar style only when the app is **added** to the home screen, so it must be re-added after a change.
- `layout.tsx` runs a tiny `beforeInteractive` script that adds `html.pwa` when opened from the home screen. On phones, `html.pwa` drops the reserved bottom space, since iOS already stops the app above the home indicator (`--bottom: 8px`, `--dock: 0`). Safari keeps its spacing because its toolbar sits below.
- Never force the app's height to `screen.height`: in the home-screen app that pushes content past what iOS shows.

**Status bar tint (Safari):** the status bar follows the top of each screen (`useStatusTint` in `App.tsx`): light (`#f6f7fd`) on home and You, snow (`#f0f4fe`) on the studio, Crown's top (`#a7b1d3`) on Welcome, the tour, onboarding, start, body ready and pattern complete, and dark elsewhere. In the desktop phone frame the fake status bar turns navy on light tops.
- **Safari 26 ignores `theme-color` (5 Oct 2026).** It paints the status bar from `position: fixed` elements at the top of the page, else from the html/body colour. So `.device` (fixed, full screen) has **no background of its own**: its dark fill is `.device::before` (Safari skips pseudo-elements), and in Safari `useStatusTint` writes each screen's top colour inline on html and body (Safari only reacts to inline writes). The home-screen app keeps the bottom-strip colour there instead. True see-through at rest is not possible in Safari 26 (it only composites real page pixels after the page has scrolled); matching the screen's top colour is the reliable way to make the bar read as see-through. **Not yet checked on a real iPhone.** Older iOS still reads `theme-color`, which is still set.
- Never put a background on `.device` itself.

**Experiment (branch `exp/mark-cover`, 22 Oct 2026, not on main):** the bird mark as a cover (`MarkCover` in art.tsx, `.mark-cover` in globals.css): a **band of its own at the very top** of the page with the bird very large and cropped inside it, in **one faint, smooth fill** (no edge, no shadow: the first try with a light outline read as a sticker and sat behind the titles). The title starts below the band; nothing sits on it. On the Body and Pattern libraries (dark, under the status bar) and the profile top (light: the band between the top row and the photo, the photo overlapping its bottom edge). Merge only once Jose approves.

**Card colour: `card` = #1b1c26 (5 Oct 2026).** One named colour for every dark card, defined once in `globals.css` (`@theme`: `--color-card`, with `--color-card-hover` #23242f for hover only). Use `var(--color-card)` in CSS and `bg-card` in Tailwind; never type the hex. It is a **solid fill, never a gradient and never see-through**, so the dot grid never shows through. It covers `.card-soft`, `.glass`, `.glass-2`, `.opt` option cards, `.pair-dark` (home's "Use a pre-made"), the studio panel, dark pills and small round buttons, tiles, and the reset dialog. Sheets (pop-ups) keep their own gradient; icon circles keep `.iconbadge`.

**The named colours** (all in `@theme`): `bg` #0b0c15 (page), `card` #1b1c26 (cards), `card-hover` #23242f, `ink` #131523, `primary` #687ef5, `primary-2` #4f63e0, `peri` #8c9cf8, plus `lav`, `mist`, `slate`, `denim`, `snow`. Add new colours here as tokens rather than one-off hex values.

**Gradient: Crown only (4 Oct 2026).** The app's one big gradient is **Crown**, ported as-is from the landing page (`nataliack/Venty-landing-page`, `/gradients`, "Light, locked"): light from the top centre, a blue halo rising from below, four slowly drifting lights. Use the `<Crown />` component (animated, `.sky.sky-light`) for screens and panels, and `.violet-panel` (Crown's static layers) for small things like the avatar. It is on Welcome, the onboarding pictures, every `PaperScreen` panel (tour question, start, body ready, pattern complete), the "Design your own" card and the finished-pattern panel. **Never use the old violet radial gradient** (`#8c9cf8 → #4f63e0 → #1c2252`) anywhere.

**Colour roles (4 Oct 2026):** the app was monotonous because every screen was the same dark navy. Colour now has a job:
- **Dark navy screens are for working**: measuring, the garment check, printing, libraries. Dark keeps attention on the task and reads as precise.
- **The studio ("What are we making?") is light (5 Oct 2026)**: it is the most important screen, so it takes the landing page's Made to measure look: snow page (`--color-snow`), ink type, a fading dot grid, a soft primary-blue halo, and one white glass field with a long soft shadow and a hairline. Styles are the `.cmp-*` / `.pad-*` block at the end of `globals.css`, all on the app's own colour tokens.
- **Paper + violet screens are for moments**: the tour question, the start page, "Your body is ready", "Your pattern is complete" (all built with `PaperScreen`: a Crown picture panel over warm paper; side by side on desktop). On phones the picture takes about half the screen (54%; the tour pages 62%, "Your body is ready" 40% and "Your pattern is complete" 30% because they hold more, so nothing needs scrolling), so the paper below is balanced rather than empty. Light and violet read as calm, encouraging and celebratory, and they tie back to the onboarding.
- **Home** has a light top (`.light-hero`: pale periwinkle with a periwinkle graph-paper grid) with text in a soft, readable indigo (`#3d4bb3` / `#5c68b0`, not white, not a harsh navy), above the dark page.
- The finished-pattern page shows the garment on a violet panel.

**Back, close and page actions (20 Oct 2026, one rule for every flow):**
- **Top left is the way out.** On a flow step with a progress bar (`FlowHeader`): **X**, which closes the whole flow. On a standalone page (detail, library, result, Change the design, sign up): the **back arrow**.
- **Bottom left is the round Back**, only inside a flow, for the previous step, beside the primary button (`Arrows`). A screen with a top-left back arrow never also has a bottom Back (`hidePrev`); the first step of a flow has none either.
- **Top right never closes anything.** It is only for a page action in words (`TopAction`): "Skip for now", "Save for later", Edit, or the "?" help.
- **The quiet second choice** under a primary button is words only (`TextButton`): "Later", "Skip the tour", "Take a break, finish later", "Save as PDF instead".

**Fields are solid (20 Oct 2026):** `.field` uses the card colour (`--color-card`) with a light edge, like every card. Nothing in the app is see-through.

**Choices and buttons:**
- **Nothing is ever pre-selected.** The user picks, then continues.
  - **The only exception: units default to cm**, and units can never be empty.
- **Decision button pattern** (`Arrows` / `NextButton`), used on every step screen (changed 4 Oct 2026 after user testing):
  - It is the **filled primary button** (`.pill-primary`), the same one as "Get started" on Welcome. The old outlined chevron with a glow is gone; testers read it as secondary and "AI".
  - Back is a round button on the left and the primary button fills the rest of the row. With no back button (`hidePrev`) it runs full width, centred.
  - **Secondary buttons (23 Oct 2026, chosen in the lab):** every round button with a shape (`.rb`: back, close, the steppers) and the dark pill (`.pill-dark`: Cancel, Change the design, Edit measures) are built like the primary but quieter, in `--color-card`: lit from the top (a faint white wash down the face, a bright line along the top edge, a darker line along the bottom), a fine light rim and a very soft light inside the edges. No dot grid and no drop shadow. A bare icon with no shape (the chevrons on home's start cards) stays as it is. The **white secondary** (`.pill-white`: Done, Got it, Continue with email, the onboarding's Skip; `.bell-btn`: the bell, Edit profile and the photo's camera on the light tops) is the same build in `--color-snow` (a pure white line along the top edge, a slightly deeper snow along the bottom, a soft white light inside) with a soft drop shadow on every surface. On the onboarding paper the back button is the dark secondary (`.sec-dark`).
  - Before a choice is made it is still visible but faded (`.is-off`). Tapping it then calls `showNeeded()`: every still-empty required input on the screen (anything marked `data-need="1"`) gives a small side-to-side nudge and a violet edge for a moment. Mark required inputs with `data-need`.
- **No time estimates anywhere** ("about 3 minutes", "6 hours"). Measuring and sewing take as long as each person takes, and testers found the numbers stressful.
- **Hover and press effects are plain** (changed 4 Oct 2026): hover brightens the edge or fill a little, a press dips the element. No swirls, glows, ripples or drifting lights; they read as "random rainbows" and stuck on touch screens.
- **Cards on the dark page are solid** (`.card-soft`), not see-through glass.
- **Option cards** (`Option`):
  - Unselected: the solid card with a radio ring.
  - Hover: a slightly brighter edge only.
  - Selected (23 Oct 2026, chosen by Jose in the lab, "Snow"): the card turns **flat snow white** (`--color-snow`) with ink words: no edge, no glow, no shadow, no 3D shading. The ring becomes a tick in home's start-card icon style (`.icon-primary`, the same class, with no border so its light edge sits on the outline). Only the colours change; every card keeps its own shape and layout. What sits inside turns to ink too (secondary text, outlines, the stepper, inset icon tiles), by rules in `globals.css`. A `Glass` card with `selected` (the body picker for a template, the Edit measures list) is chosen the same way. An inset tile (`.iconbadge`) on a chosen card is pressed into the snow, a little deeper than on the dark card, with its icon in a quiet steel grey-blue (#6e7894); a word in a tile (`.iconbadge-word`: the cm and in of the units) turns periwinkle. The units cards show cm and in in an inset tile, chosen or not. The old violet stroke and rising gradient are gone.
  - A card never sits selected by default.
- **Information is never styled like a button.** Tips and notes are plain text with an icon (`Note`, the tip lists).
- **Inputs look like real, empty inputs** (`Field`, `.field`), with a placeholder and no pre-filled value.
- **Scrolling and layout:**
  - Screens must not scroll or bounce when the content fits.
  - The footer has no backdrop.
  - The scroll area fades its bottom edge only when it really overflows (`.scroller.is-over`).

**Body figure centring:** to centre a `BodyFigure` in a box, give the svg `h-full w-full` (the viewBox centres the figure itself). Never use `h-full w-auto` inside a flex box: Safari sizes the box from the svg's width attribute and the figure drifts off-centre.

**Navigation (phones):** a light periwinkle tab bar (`.tabbar`, the same colour family as the home hero) with Home, Bodies, Patterns and You, plus one round **Create** button (`.createbtn`) sitting in a real **notch** cut into the bar: the bar's outline is an SVG (`NotchShape` in home.tsx) with a round cut-out around the button and rounded shoulders where the cut meets the top edge, so the bar cradles the button. The bar is 80px tall, with icons and labels in the upper part and room underneath, like iOS tab bars. **Two modes:** in Safari it is a floating rounded pill (Safari's own toolbar sits below it). In the home-screen app (`html.pwa`, phones) it docks like a native iOS tab bar: full width, flush to the bottom edge, square bottom corners (the screen's rounded corners round it), icons in the top 80px and the bar growing underneath by `--tab-under` (the home bar's safe area, at least 24px), so the iPhone's home bar has its own space inside the bar. **Hybrid spacing:** only the tab bar is flush; every other bottom button (step screens, onboarding, Welcome, moments, sheets) keeps the iPhone standard clearance in the home-screen app, `--bottom` = home-bar safe area (at least 34pt) + 8px. For local testing, `localStorage["venty-preview-pwa"]="1"` on localhost turns home-screen mode on. Create is the single most important action, so it is the only thing raised. Desktop keeps the sidebar.

**Styling pitfall:** custom classes in `globals.css` written **outside** `@layer` beat Tailwind utilities.
- Never put `display`, `position` or size on those classes (`.field`, `.opt`, `.nextbtn`, …), or utilities like `flex` stop working.
- This bug has already happened once.

## 6. Flows (current, after the overhaul)

**Getting in:**
- **Splash:** the Welcome screen without its words or buttons: the same Crown sky, the logo in the same place, and a slim loader in the slot where the buttons will appear. It auto-advances and cross-fades into Welcome (the logo stays put; splash, Welcome and "Welcome, Ana" cross-fade instead of sliding).
- **Welcome:**
  - Logo, then the headline **"If you can imagine it, you can wear it."** (20 Oct 2026: broader than dresses) and "Start from a photo, a sketch or a few words. Venty drafts the sewing pattern to your measurements, ready to print at home.", centred between the logo and the buttons.
  - A slowly drifting gradient background (`.sky` with `.drift` lights). On phones Crown’s drifting lights are wider, blurrier and fainter (20 Oct 2026: on a narrow screen their edges read as hard blobs).
  - **The sky is alive** (`<Crown live />`, also on the splash and "Welcome, Ana"): the whole gradient slowly rises and settles, the lights wander further and a little faster, and the light from the top breathes. Still with reduced motion. **Get started** rises in with a soft spring after the words. A light band sweeping across the button was tried and dropped (20 Oct 2026, Jose hated it): animate the background, never the button.
  - "Get started" and "I already have an account".
- **Sign up (`signup`):** **Continue with email** first (white), then a hairline with "or", then Continue with Apple and Continue with Google below it. On phones the ways in sit **at the bottom**, in thumb reach, above the legal line, and the heading and its line are **centred** in the room above them, like a title card. Above the heading, an **arc of looks**: photo cards along a gentle arch, lower and turned outwards towards the ends, drifting right to left forever, fading into the side margins (`ArcCarousel` in auth.tsx; still with reduced motion). The photos (`public/auth/look-*.webp`, 480 × 640) are four editorial looks the designer generated with Higgsfield (21 Oct 2026): green on a Paris street, mauve against a white limousine, rust on a pale cliff, burgundy on a city pavement. Between them, four close-ups of sewing details from the same shoot (`detail-*.webp`): a zip and snaps, corset lacing and ruching (cropped to the left half), buttoned trouser hems, and tied bow cuffs, so the arc alternates a garment, then the craft in it. Log in does the same.
  - The guest option is the top-right **"Skip for now"**. It was decided to keep guest here, not on Welcome, and as text with no arrow.
- **Log in (`login`):** the same buttons in the same order, plus "New to Venty? Create an account".
- **Email step (`email`, mode `signup` or `login`):**
  - Sign-up asks for name, email and password (at least 8 characters, with a show/hide toggle). Log-in asks for email and password, plus "Forgot password".
  - The button stays disabled until the form is valid.
- **Signed in:** on the same sky as Welcome, with the logo in place: a calm frosted check, "Welcome, {name}." and "Your account is ready. Let's show you around.", and the same slim loader. Then the tour question.

**Tour question (`tourAsk`, layout changed 20 Oct 2026):** its own layout, so it never looks like a tour page: **a full-bleed photograph** (21 Oct 2026, from Jose: a woman in a cream tweed suit in a meadow of cornflowers, `public/tour/meadow.webp` and a 640px version) fills the screen with no margins, with a soft shade under the status bar, and the question sits on a **paper card floating over it** at the bottom (a frosted white glass card, after the Made to measure prompt box, was tried on 22 Oct 2026 and dropped: Jose hated it; keep the paper card) (on a computer, at the far right, clear of her). "Want a quick tour?" / "See how Venty works, from taking your measurements to printing your first pattern." **"Show me how it works"** and **"Skip the tour"** (words only). Skipping sets `tourSkipped` (home then offers the tour) and goes to `start`.

**Onboarding (`onboarding`):**
- **Light and editorial:** paper background, a 56% picture panel, and a "Fig. 1 …" caption. It is meant to look nothing like the dark app.
- **Heading and body text are centre-aligned** on these light pages only (the rest of the app stays left-aligned).
- **Three chapters:** any look you love (photo, screenshot, link, sketch; not just Pinterest), drafted to your body, then tweak and print.
- **Manual only.** Nothing advances by itself (testers felt rushed). Progress bars at the top fill as the reader reaches each page; they are not buttons. Next (primary) at the bottom runs full width on page 1; from page 2 a round Back button slides in beside it. A white "Skip" at the top.
- The pictures contain nothing that looks like a button (the link is drawn as a URL snippet, the sketch as a paper drawing), because testers tried to tap them.
- Replayable from Profile → App tour, opened with `{ from: "app" }`, which returns to where the user was.

**Start (`start`, layout changed 20 Oct 2026):** its own layout, not the tour's picture-over-paper: paper all the way, the greeting **centred at the top** ("Welcome, {name}." / "Let’s set up your body") with its one line on why centred under it (296px wide on phones, so it breaks after "your" and before "saved", no widow), then **the mannequin on a night card** taking the room in between (24 Oct 2026, from Jose's mockup), then the buttons on their own with room above them (on a computer: words left, the card right in the mockup's proportions). The mannequin is Jose's cut-out (`public/start/mannequin.webp`, 2000px, and a 1100px version; a transparent background): sized to the card's height (127% of it, its top 2.4% above the card, centred), so the card and the mannequin grow together on a taller phone and shrink on a small one. It comes out of the card at the top (a little, never into the words) and at the sides (the arms run off the screen), and is cut cleanly along the card's bottom edge and rounded bottom corners (a `clip-path` polygon). The card's background is the landing page's loading-screen night (`.night`: flat night, three soft cornflower lights roaming its lower part, from the site's `sky-dark`). One primary button, **"Set up my body"**, and a quiet **"Skip for now and go to home"**. "Explore templates" was removed: testers did not understand "Where do you want to start?", and a pattern cannot exist without a body.

**Preferences (`prefs`):**
- Shown **once, app-wide**, before the first body. Heading **"Before we begin"**, no body text.
- "Do you measure in centimetres or inches?": compact cards with the name and the short form **boxed** in the body font ("cm", "in"), like the unit on a tape (the tick strips crowded the words and were dropped, 20 Oct 2026). cm is the default.
- "What's your sewing level?": **Beginner / Intermediate / Advanced**, plain radio cards with one line each. No numbers, no extra tags. Nothing pre-selected.
- Both can be edited in Profile.

**Body setup:**
- A progress header on every step: close (X), then "Body · Method · Measures · Review". The bar runs full width to the right edge (no spacer on the right).
1. **`name`:** "Who are you measuring?" / "Give this body a name, so you can find it later."
   - An empty name field (placeholder "Enter a name").
   - "Start the body with a" **Female form** or **Male form**, neither pre-selected, no sub-text and no note underneath.
2. **`method`:** "Choose how to measure" (no body text). **Scan with my camera** ("Take 3 photos. AI estimates your measurements, then you check each one.") or **Measure by hand** ("Use a soft measuring tape. We guide you through 4 measurements.").
3. **By hand:** `measure`, one measure at a time: height → bust → waist → hips.
   - Each starts **empty** ("—"), and Next stays disabled until a value is set.
   - The screen shows only the title, a **full-width, centred body figure** with the tape marker, and the value control. The how-to steps live **only in the "?" sheet** (on phone and desktop), so they are never shown twice.
   - **− and + buttons** step 0.5cm. Tap the number to type a value. Drag the ruler.
   - **One unit only:** the value shows in the chosen unit (cm or in) and never a second conversion line under it. The number is 44px Bigilla.
   - **The dial (20 Oct 2026):** the measuring card is `.dial`, a solid card (`--color-card`, never see-through), with the ruler **flush along its left, right and bottom edges** (ticks stand on the bottom edge) and quiet ticks. The value row has a fixed height, so the card never changes size between empty, set and typing. Empty, it reads "Slide or tap to type" where the number will be (no dash). `MiniDial` is the compact version (Change the design's length and neckline, two side by side).
   - The − / + buttons are plain (`.rb-plain`): no swirl or glow. Hover lifts the fill slightly; a press flashes solid white.
   - No "Nice, X is next" line and no pulsing Next button after a value is set. They read as too AI in review.
   - On AI-estimated values, the note "AI estimate from your photos…" sits **under** the measuring card.
   - Reset, the misleading neighbouring numbers, and the old "Save · next" bar are gone.
4. **Scan:**
   - **`scanPrep`:** "You'll take 3 photos of yourself: front, back and side." Three plain tips (fitted clothes, a plain wall, phone at hip height) and a privacy note. No "step back", no underwear mention. On phones it is centred: the heading at the top, the tips stacked in the middle (icon above the words), the privacy note just above the button. The tips are information, so they have no card, box or tile around them (23 Oct 2026: in a card they looked tappable): a line icon in periwinkle and the words, beside each other on a computer.
   - **`scanCam`:**
     - Front / Back / Side tabs that can be tapped.
     - Shutter, flash (torch where the device supports it) and library picker sit low.
     - Each photo is reviewed with **Retake / Use photo**, a check confirms it ("Front saved"), and the tab gets a check mark. Under review the photo shows as a **framed picture in the middle**, not the whole screen, so it reads as the photo you took. The library button is always the gallery icon (never your last photo).
     - Photos are saved as small JPEGs in `body.photos` and can be viewed later ("Your scan photos" sheet).
     - "Read my measures" simulates the AI read. It fills all 24 values and marks them `est` (estimated).
5. **`base`, the review:**
   - Four one-line rows (23 Oct 2026, chosen in the lab as "Check, then snow"): the name, the number in a centred column (right-aligned in a fixed width, so the units line up row to row), then the action. No line of text under the name and no outline.
   - Rows still marked AI-estimated are the dark card with a periwinkle **"Check"** pill (`.icon-primary`, the action); tapping one opens the measure step with "Looks right · Save".
   - Confirmed rows turn **snow white** (`.snow-card`, done, the same snow as a chosen card) with a quiet **"Edit"** in ink. Decision: AI estimates must each be checked once (a wrong bust or hip estimate ruins the pattern, and it is only four taps); values the user measured or already confirmed just offer Edit.
   - Continue stays disabled until all 4 are confirmed.
   - Continue opens a sheet with one title and one line (20 Oct 2026, it had four texts): **"Add 20 more measurements?"** / "Your base measurements are saved. The other 20 give the closest fit, and you can stop at any time." → **Yes, add 20 more** (to `wizard`) or **Later** (to `ready`), which is words only (`TextButton`).
6. **`ready`:**
   - "Saved to your bodies", **"Well done! Your body is ready"**, "Every pattern you make for {name} will be drafted to these measurements." (centred), and a summary line with a progress bar.
   - Buttons: **Choose what to make** (straight to the prompt screen with this body) and Go to home. Testers asked "a pattern of what?" when the button said "Start a pattern": the garment comes before the pattern.
7. **Rise** (the seated measurement) shows a **seated side-view figure on a chair** (`SeatedFigure`) with the tape from waist to seat.

**The other 20 measures:**
- **Groups (one vocabulary, changed 21 Oct 2026):** **Around the body** ("Circumferences: neck, ribs…"), **Lengths** ("Top to bottom…"), **Widths** ("Side to side…") and **Seated rise** (sitting on a hard chair). Each title starts with the same word as its progress label and the sewing term sits in the description (the walkthrough found two vocabularies: "Around · Down · Across" in the header, "Circumferences…" in the list). Buttons read "Continue: {group}". Before that, on 4 Oct: Testers did not understand "Wraps". Each group's description says which way the tape goes.
- **Progress:** "Base · Around · Lengths · Widths · Seated" (short labels).
- The last step of a group says just **"Finish"**. Copy says "measurements", not "measures" or "numbers".
- **`wizard`:** the heading and line centred, the prep tips (tape, a friend, fitted clothes) as **one rotating hint line** (icon + words, changes every few seconds, nothing to tap, so it never looks like the cards), then the group list. Done groups are **snow white** (`.snow-card`, 23 Oct 2026) with a quiet ink tick, not primary (there were too many primary ticks).
  - Base measures show as done.
  - The groups are numbered from 2 (23 Oct 2026): the base measurements are the first group, so Around the body is 2 and Seated rise is 5. The numbers are nudged up 1.5px so they look centred in their disc (figures have no descender). Inside "View my measurements" a hairline runs only between two rows, never under the last one.
  - The next group is the plain card with its number in the periwinkle disc of home's start-card icons (`.icon-primary`) and "Up next"; no outline (the periwinkle outline was dropped on 23 Oct 2026, like the one on home's "Continue finishing your measurements" card). The list is a guide, not a menu.
  - Spacing (23 Oct 2026): more room between the progress bar and the heading, between the words and the hint line, and above the list, on `wizard` and `wdone`; the list may scroll.
  - One button: "Continue with {group}". The order is strict.
- **`wstep`:** the same `MeasureStep` UI as the base measures.
- **`wdone`:** centred "{Group} done" and one line ("N of N saved. Next up: …"); no big tick. The same group list, where finished groups have a **"View my measures"** dropdown.
  - "Continue with {next}" and "Take a break, finish later".
  - Taking a break goes **home**, which then shows a **"Continue finishing your measures"** card (`resumeBody`).
- **`alldone`:** a centred moment: a **dial of 24 ticks** (like the marks on a tape) lighting up one after another, the count in the middle, "Fully measured" and "Open a group to see or change any measurement." Then every group including base, each with a dropdown of values. Tapping a value edits it. Button: "Save body".

**Home (`home`):**
- **Top: a light rounded block** (`.home-hero.light-hero`; since 23 Oct 2026 one even `--color-snow` with no gradient, built like the white secondary button: a fine rim, a white line on top, a deeper snow along the bottom, a soft inner light and a drop shadow onto the page; the phone tab bar is the same snow and build, its sizes and shape untouched): pale periwinkle with a soft periwinkle grid (`.light-mat`) rising from the bottom of the block and fading out towards the top, rounded bottom corners over the dark page (a dark wrapper sits behind the corners so nothing grey shows). Text in navy (`#26335f`, secondary `#3f4c80`).
  - The greeting row is deliberately quiet so the eye lands on the two cards: the avatar (`<Avatar ring />` in `ui.tsx`, tap for the profile), a small muted "Good evening / Ana", and the white **Notifications bell** (`.bell-btn`; the sheet is titled "Notifications", not "Updates"; the bell glyph is optically centred) with a periwinkle dot for unread. The avatar and the bell share one stroke: a fine periwinkle line inside a white edge (`.avatar-ring`, `.bell-btn`).
  - **Avatar (5 Oct 2026):** the person's picture, or their initial on light periwinkle #d9def4. Signing in with Apple or Google (the demo's Ana, `DEMO_EMAIL`) brings Ana's picture, `public/ana.jpg` (head, neck and shoulders, cropped from the brand portrait, 512px). `user.photo`: undefined = the account's own picture, null = removed, else a small JPEG data URL from Edit profile. Guests and email sign-ups show their initial until they add a photo.
  - The top is balanced, not cramped: "What are we making today?" (34px, two lines) with room above it, one line under it ("Design your own, or use a pre-made pattern."), then the two cards (128px tall).
  - **One icon style (22 Oct 2026, chosen in the lab):** every icon container is `.iconbadge`, an **inset tile**: a rounded square (13px radius at 44px, 11px at 36 to 40px) pressed into whatever it sits on, with a transparent dark floor (so it works on cards, the page and pop-ups), a soft shadow inside from the top edge, a faint highlight on the bottom lip, and a quiet grey-lavender icon (no ring, no gradient, never a circle). Used in the Notifications rows, the Create menu, home notices, profile tiles and rows, the install steps, the measuring method cards and the scan checklist numbers. The bright `.icon-primary` circles stay only on the two big start cards, because they are actions.
  - **Pop-ups (`Sheet`):** the solid card colour (no gradient), a fine light top edge, a slim handle. Notifications has no close button: drag it down or tap outside.
  - **Notifications sheet:** a quiet feed, not a stack of buttons. Plain rows split by hairlines, no card backgrounds; rows that lead somewhere are still tappable.
  - **Create menu (+):** title "Create" and "What would you like to start?", one large Crown card "Design your own" (the main action), then two equal dark tiles: "Use a pre-made" (Ready-to-fit patterns) and "Make a body" (Add measurements). Only Crown and the dark card, no other colours.
  - **Add to home screen:** a page (`install`, `InstallGuide` in `src/components/Install.tsx`), not a pop-up: three short steps on one screen, each with a small drawing of what you'll see (Share, Add to Home Screen, Add). Android Chrome also gets a real install button (`beforeinstallprompt`). It's asked in "Before we begin" ("Add Venty to your home screen?" Yes, show me / Not now; Yes opens the guide, then the flow carries on to naming the body), and offered as a dismissible card on home (`installDismissed`) and in You → Settings. Only on a phone browser: never on desktop or inside the home-screen app.
  - **Two ways to start**, a matching pair: **Design your own** ("Photo, sketch or words"; picks the body, then the studio) and **Use a pre-made** ("Ready-to-fit patterns"; the library). Both are the same solid `card` (#1b1c26) with their icon in a circle wearing the primary button's gradient (`.icon-primary`).
- **Below, on the dark page:** notices (finish your measurements, take the tour), **Your bodies** (a horizontal row with a dashed "+" first), **Your patterns** (the three latest, with a status dot) and a Pre-made patterns row. All are solid `.card-soft` cards. Each section has a "View all".
- **Phone tab bar (24 Oct 2026, chosen in the lab):** the snow floating bar (`.tabbar`) with the Create button raised in a notch in the centre. **One 5px channel** runs round the plus (the notch is the 31px button plus 5). The tabs sit at **fixed, even places**: Bodies and Patterns 68px either side of the plus, Home and You 74.5px beyond them, never closer to the ends than the centres of the bar's top corners (30px in). On a 345px bar (most phones) that is exactly those centres; on a wider bar (a Pro Max, or docked full width) the four stay a compact group round the plus (24 Oct 2026: on a Pro Max they had spread to the edges); each tab's tap area runs halfway to its neighbours and to the notch. **The current tab** is a **40px circle pressed into the snow** (`.tab-pressed`, like the inset icon tiles) round its icon; on Home and You it shares its centre with the bar's corner, so it runs parallel to it. It **glides** from tab to tab (one motion layout id across the pages; tab-to-tab switches cross-fade in place instead of sliding, see `TAB_PAGES` in App.tsx).
- **Create (the plus):** a **snow card grows out of the bar** (`TabBar` in home.tsx): it wraps the plus in a ring (the button plus 5) and the bar's notch widens to the button plus 10, so the same 5px channel runs between card and bar all the way round (both outlines come from one set of numbers; the card meets its ring with a curve of 14 where the bar's is 9). The card is 24px from the screen's edges (also when the bar is docked), as tall as its content: "Create" and "What would you like to start?" centred, then three rows (an inset icon, the name, one line, a chevron): **Create a pattern** (From a photo, sketch or words), **Start from a pattern** (Pick a design, fit it to you), **Add a body** (Take your measurements). The page behind blurs and darkens (a layer inside the page, under its footer: `data-screen` on `Screen`, footer at z-20); the bar stays sharp and is drawn over the card, so the card's shadow never falls on it. The plus turns 45° into × and fades into the dark secondary. A tab (which also goes to its page), the ×, a tap outside or Escape closes it. On a computer the sidebar's Create opens the same rows in a dialog (`CreateSheet`). The old "Design from scratch" Crown card is gone, and home's start cards now read "Create a pattern" and "Pick a design, fit it to you". Home's start cards (`.pair-dark`) carry the white secondary's drop shadow (as on the bell), not the long dark one.
- Earlier: the current tab sat in a soft periwinkle capsule. No glows (the dark capsule version was tried and dropped). The bar stays a **fully rounded floating pill** in a muted periwinkle (not bright white), set right down by the bottom edge: tab screens use `<Screen dock>`, which leaves only a few pixels below it (`--dock`), in the home-screen app and in Safari.
- **Library pages** (Body library, Pattern library) no longer show a big count next to the title. Counts live on the profile page.
  - The top is just the title with **Edit** on the same line. No "Library" label above it (it said nothing the title didn't).
  - Both have an **Edit** button (top right, beside the title). In edit mode you tick items and "Delete N" replaces the tab bar; deleting asks once ("This can't be undone").
  - **Body library** cards all use one neutral colour (denim #4d5e85), no alternating violet.
  - **Body library** has a working search field (filters by name) above the All / Me / Family / Clients chips.
  - **Pattern library** has no search. Each pattern is a large card: the garment on a small Crown swatch, a status line that says something useful ("Ready to print", "Printed on 9 A4 sheets", "Printed at a print shop", "Draft, not finished yet"), the name, "Drafted to {body}", and two small facts (fit and metres of fabric). Piece counts were dropped: they didn't help anyone decide anything.
- **Settings** always has "Add Venty to your home screen" (except inside the home-screen app), so people who said "Not now" in "Before we begin" can find it later.
- **You (profile, `src/screens/profile.tsx`, rebuilt 5 Oct 2026):** the same light block as home's top: "Profile" and an **Edit profile** button, a large avatar (104px, a camera badge), the name, the email, and one plain line of what Venty knows ("Intermediate sewist · Measures in cm"; information, not buttons). Guests get **Create an account** instead of Edit profile. Below, on the dark page:
  - **Your studio:** three tiles that say something useful and lead somewhere (no zero-padded counts like "03"): Bodies (their names), Patterns ("1 ready to print" / "2 in progress" / "All printed"), Printed (the latest one; opens the Pattern library on Printed).
  - Grouped rows, each with an `.iconbadge`: **Preferences** (Units, Sewing level in a sheet with the same Beginner / Intermediate / Advanced as "Before we begin"), **App** (Add to home screen, App tour, Expo mode), **Privacy and AI** (Your privacy, About the AI: the `info` screen), **Account** (Log out, Reset for the next visitor).
  - **Edit profile** (`profileEdit`): change or remove the photo (centre-cropped to a 320px JPEG, kept on the device), name and email, Save.
  - **Info pages** (`info`, `{ doc: "privacy" | "ai" }`): every line is true of this demo (everything stays on the device; AI steps are simulated; check estimates; sew a toile). The real product will need a real privacy policy and terms, written and signed off by the owner.
  - The temporary display readout (window size) was removed.
- **A saved pattern opens as its own page (`pattern`)**, not the making flow: the garment on the body, its status ("Printed", "Ready to print", "Draft") and who it was drafted to, a **Shopping list** to show at the fabric shop (metres, stretch, feel, the fabric you chose, and why), and **How it was made** (fit and ease, seam allowance, pieces, paper, garment details). Actions: **Print again** (or Print it) and **Change the design**. Patterns save these details (`pattern.spec`) when made and printed.

**Elsewhere:**
- **home, bodies, patterns, you:** tab bar on phones, sidebar on desktop.
- **Pattern flow:** `patSelectBody` → `prompt` → `ref` → `ai` → `generating` → `garment` → `edits`.
  - `patSelectBody`: "Who is this pattern for?", a **vertical list** of bodies (no swiping), plus "New body". The body preview has the same padding on every side, and the radio is centred on the card's height (`Option radioAt="center"`).
  - `prompt` ("What are we making?") is **the studio** (`src/screens/studio.tsx`, rebuilt 5 Oct 2026). It is the landing page's Made to measure composer (`nataliack/Venty-landing-page`, `/lab/section-made-to-measure`, `mtm/Composer.tsx` + `Pad.tsx`) brought into the app, on a light screen (see §5). Lab-only parts were left out: the typing entrance, the jacket rig, floating pieces and the redo button after drafting.
    - **Layout (20 Oct 2026):** the title and line at the top, then the field at its own height: four lines on a phone, growing to eight, then the words scroll inside (five lines and growing on a computer). It no longer fills the screen: it was too tall, and the whole screen jumped when the keyboard opened. No hint text inside the field.
    - **Keyboard (phones):** the screen sits in the visible part (`visualViewport`) and the title stays, since everything fits above the keyboard. **Not yet checked on a real iPhone.**
    - **To revisit (Jose, 20 Oct 2026):** rethink the studio as a **canvas** where drawing is the main action, keeping every feature (pictures, notes, ease, the body, words). Deferred on purpose; the next studio round starts here.
    - **One field:** reference chips on top (only once there is one; up to 6 photos and sketches; tap one for a viewer with Draw on it / Replace / Remove / Done, × removes it), then the words (a blinking primary caret when not focused), then a toolbar: **Photo** and **Sketch**, labelled chips (21 Oct 2026: the bare + and brush icons were not understood), then **Create my pattern** (its own full-width row on phones). The body chip and Ease were removed from the toolbar on 21 Oct: the body is already chosen on the screen before (the line under the title says "Drafted to {name}'s measurements"), and how it fits is asked once, on the garment check.
    - **What are you making? (21 Oct 2026):** a segmented row under the title, **Dress · Top · Skirt · Trousers**. Nothing is chosen until you tap one, but your words fill it in (`detectKind`: "mid-rise straight leg pants" chooses Trousers) until you tap one yourself. Create my pattern needs a kind plus a picture or words. A sketch alone cannot be read, so the kind is what makes trousers trousers.
    - **Create my pattern is the field's own button.** There is no footer button and only the top back button. It stays faded until there is a picture or some words; tapping it early nudges the field (`data-need`).

    - **The drawing pad** (`src/components/SketchPad.tsx`) is a dialog in the device frame: pen, highlighter, eraser, Note pins (numbered notes on the picture), size, five token colours plus a custom colour, dress-form guide, undo / redo (Ctrl/Cmd + Z), clear. Tapping outside closes it only while untouched. Saving flattens the drawing onto the photo (JPEG) or the sketch (PNG).
    - On a computer, images can be dropped anywhere on the screen or pasted into the field.
    - **Kept in the draft:** `draft.refs` (not persisted) and `draft.prompt`, so coming back from the garment check finds the studio as you left it. `draft.photo` is the first photo (or the first sketch) for the next steps. Pinned notes are listed on the garment check under your words. `newDraft` frees the local previews.
    - The link option and "Choose a pre-made pattern" are not in this flow (pre-made patterns start from home or the Create menu).
  - After the studio, the garment check is **three steps with a progress header (Garment · Fit · Stretch)**, not hidden tabs: `ref`/`ai` Overview **"Let's check your garment"** (your picture, a summary, your words, and details you tap to change; each detail offers the full range a sewist expects, e.g. Length: extra mini, mini, above the knee, knee, midi, maxi; Skirt includes bodycon and pencil) → `ai` Fitting **"How should it fit?"**: the body inside a **dress silhouette** (sleeves, bodice, waist seam, flared skirt) that widens as the ease grows, from hugging the body to a big, loose dress. No number read-out under the figure. **Tight +1 · Easy +4 · Loose +8 · Oversized +16 cm**, or **your own** amount up to +30 cm (nothing pre-selected) → `ai` Fabric **"Choose your fabric"**: a suggestion based on the fit, described by behaviour not by name (e.g. "A stretchy fabric" for a tight fit, "No stretch" for loose), then "Does your fabric stretch?" (required; choosing against the suggestion shows a calm note, not a block) → "Create my pattern". "Stiff or soft" and the fabric-type chips were removed: testers did not understand them. The old "Got it. How do you want to continue?" screen is gone.
  - **Garment check details (20 Oct 2026):** what you gave the studio is **one short row** under the garment summary ("What you asked for · 3 pictures, 2 notes", the first line of your words, **View**), however much you added; View opens a sheet with every picture, your words in full and your notes. **Fit:** the cards are `Option`s with a radio ring (they looked unselectable), the amount on its own line, a smaller preview, and "Your own" is a selectable card with a stepper inside. **Stretch:** "How stretchy is your fabric?" ("Choose your fabric" read like choosing leather or denim); the suggestion is plain text with an icon, never a primary-blue card (that colour means a button).
  - **Skipping the repeated fit question (21 Oct 2026):** when the ease was chosen in the studio, "Looks right" goes straight to the stretch step and the overview shows a **Fit** row ("Easy, +4 cm") that opens the fit step, so ease is never asked twice.
  - **The pretend AI reads the words** (`readDesign` in data.ts, 21 Oct 2026): sleeves, neckline, length, skirt and fastening named in the description change those details, and **"wrap" makes a wrap dress** (garment `wrap`: Waist Tie, Skirt Wrap, Fastening Wrap tie, no zip). Before, every description became the flutter dress with a back zip. Flutter sleeves are drawn wide, flared and wavy (they read as cap sleeves), and the flutter and wrap dresses are drawn midi length.
  - `generating` (20 Oct 2026): a **light page** (the studio's snow, dot grid and halo), so it reads as its own moment. The garment's pattern pieces **draw themselves** one after another on white pattern paper (`.pattern-mat.is-raised`, `Piece tone="light" draw`), a primary **pen point** at the end of each line, then "Drafting your pattern" and the four stages listed (done, now, next). No big percentage: Bigilla has no % sign. About 9 seconds (5 when updating).
  - `garment`: "On your body / Pattern", with two choices at the bottom, **Change the design** and **Looks right**. Leaving for now is a page action, **"Save for later"** top right: the pattern is already saved as Ready to print, so it goes home with a toast. (Three buttons at the bottom was one too many.) The template result does the same. Back returns to the stretch step. Both views share one fixed height; the light behind the figure is drawn inside its own box (a blur crossing the scroll area's edge made a hard line on the right). The **Pattern** view is the pieces on light pattern paper with a periwinkle graph grid, ink outlines and labels, dropping in one by one, with "6 pieces · Drafted to {name}".
  - `edits` is "Change the design" with one action, **Update my pattern**. On phones the title sits beside a small preview on a plain card (no primary-blue panel); **Shoulder to hem** (renamed from "Total length" on 21 Oct, so it says where it is measured from) and **Neckline depth** are two `MiniDial`s side by side; choosing the Fastening **Wrap tie** on the photo dress makes it the wrap dress (and another fastening turns it back); the garment details are a two-column grid you tap to change (the same sheet as the garment check; the sleeve chips are gone); then "Anything else?".
  - `garment`: just the garment on the body, with Make edits / Looks right. No floating labels and no "Make edits before printing" line.
- **Pre-made patterns (`templates`):** one row of **text tabs with a sliding underline** (Dresses, Tops, Trousers, Skirts), then "N patterns" and a single **"Any level ▾"** button that opens a small sheet (Any / Easy / Intermediate / Hard). No stacked pills. Cards are solid, with the drawing above the name and a quiet line: three small level bars, level and pieces. The detail page shows pieces and a tag only.
  - Opened from the prompt screen (`{ picked: true }`), the body is already known, so the detail button says "Fit to {name}" and skips `tplBody`.
- **Print, in dependency order, with a progress header** (**Method · Seams · Layout · Review**, 20 Oct 2026: "Printer" and "Print" read alike, "Paper" said nothing, and Method matches the body flow's step for the same kind of choice; the Fabric step had nothing to choose; X returns to the garment):
  - `printMethod` "How are you printing it?" (A4 at home or A0 at a print shop) → `seam` → `arrange` → `print` → `printed`.
  - `arrange`: the real paper. The arrangement (piece centres and rotation) is saved in `draft.layout`, and the **mini map draws exactly that layout**. A 4 × 4 grid where each cell is one A4 sheet; pieces are drawn to scale and draggable, and sheets that a piece touches are tinted. The count "N of 16 A4 sheets to print" updates as you drag (stored as `draft.sheets`). Since round 3 (21 Oct 2026) the screen is "Lay out your pattern": no sheet codes, "Uses N pages", Turn piece and Arrange for me (see §8).
  - `arrange`: the heading and line centred on phones, the count as one plain line ("Prints on 13 of 16 sheets", no big number). On phones the paper takes whatever room is left between the words and the tools (measured, `FitBox`), so the tools (now Turn piece and Arrange for me) are on screen on every phone (they were below the fold on an iPhone 17 Pro Max).
  - `seam` (21 Oct 2026): "Extra fabric outside the stitching line, so there is room to sew the pieces together" (it used to call the allowance the stitching line itself).
  - The **Fabric step is gone**: what to buy ("2.6 metres, 140 cm wide, a little stretch", `fabricLine`) is on the finished page and in the pattern's Shopping list. Since 21 Oct both also give the metres on **115 and 150 cm** wide fabric (`metresAt`) and **"You will also need"** (`notionsFor`): a zip of the right length, buttons, hook and eye or elastic, interfacing when there is a facing, waistband or collar, and thread.
  - `print` "Ready to print": rows a beginner can read: Garment, Drafted to, Fit ("Easy, 4 cm of room"), Seam allowance, **Paper size** ("A4, on your printer at home"), **Sheets to print** ("13, plus 1 map page"). Under the rows, a **10 cm test square** note (21 Oct 2026): "Print at 100% (actual size), not fit to page. Then measure the 10 cm test square on your first page before you cut." Back sits beside "Print N sheets", and "Save as PDF instead" is words only. While printing, an overlay covers the whole screen: the printer in the app's icon style (`.icon-primary`, breathing), "Printing your sheets", one small sheet per page filling in, and "7 of 13 sheets".
  - `printed`: the picture is **the pattern map itself** (tap to open it large), then "Your pattern is complete", "Now you can start making your {dress}.", Fabric to buy, and the guides. The map is not a guide, so it is never in the guide list.
  - **The pattern map is always visible** (`MapBoard` in print.tsx): on the finished page, on the pattern's own page (a card above the Shopping list, opening `minimap` with `{ id }`), and full screen. Patterns save their layout (`spec.layout`); older ones get a tidy one.
- Body, seam and printer choices are no longer pre-selected.
- **Measuring values (21 Oct 2026):** with no value yet, − and + open the keyboard instead of jumping to an average (they used to fill 168 cm). Tapping a number selects it, so typing replaces it (typing used to add to the end, e.g. "168.0162", and the old value was kept).
- **No demo data (21 Oct 2026):** a new visitor, and **Reset for the next visitor**, start with no bodies and no patterns (the seed bodies Mum and Tom and the sample patterns confused testers: "why is there a midi dress I never made?"). Old saved states still drop them when the visitor names their own first body.
- **Home-screen question:** answering it in "Before we begin" also hides the home card, so it is asked once.
- **Screen readers:** `Option` cards take their own words as their `aria-label`; `NextButton` has `aria-label` = its label.

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

## 8. Status (updated 21 Oct 2026, third testing round)

**User-testing round (done, 4 Oct 2026):** after interviews with a hobbyist sewist, everything in §5–§6 marked as changed: the primary button everywhere with the `showNeeded` hint, no time estimates, the tour question and manual onboarding, the new start page, plainer preferences, the body naming page, method and scan copy, the "add 20 more" sheet, sewing-term group names with a seated Rise figure, the ready screen's "Choose what to make", the softer home colours, the vertical body list, the cleaned-up prompt screen, the pre-made pattern library with levels, and the reordered print flow with a real A4 layout.

**Same day, second pass:** tour question on the Welcome sky, full-width first Next in onboarding, a richer home hero (cutting mat, mannequin, three shortcuts), solid cards, a better tab bar, new group names, the redesigned pattern library, plain hover effects, the photo-and-sketch studio (no link option, no pre-made inside the flow), no counts on library titles, and a mini map that matches your layout.

**Third pass (4 Oct 2026):** home top on the Welcome sky with a softer grid, two start choices (Photo or sketch / Pre-made pattern), the Updates bell instead of search, and the garment check as Garment · Fit (dial) · Fabric steps.

**Fourth pass (4 Oct 2026):** home block separated again with a lighter sky, new start wording, words in the studio, a garment check with full options, a visual fit step with custom ease, fabric suggestions from the fit, a centred and slower loading screen, clearer change-the-design copy, a print fabric step focused on what to buy, and the finished-pattern page.

**Fifth pass (4 Oct 2026):** colour roles (dark for working, paper + violet for moments), the light home top, the dark capsule tab bar, the paper tour question, start, body-ready and pattern-complete screens, the studio order, the dress-shaped fit preview, and a simpler fabric step.

**20 Oct 2026 round (Jose, the app screen by screen):** Welcome copy, sign-up buttons at the bottom, new tour-question and start layouts, the one-line "add 20 more" sheet, `TextButton` for every quiet second choice and `SheetHead` for sheet text, the dial (solid card, flush ruler, no size jumps), rotating tips and centred wizard headings, quieter ticks, the 24-tick dial on "Fully measured", the body list padding, the shorter studio field, the garment check's one-row brief, the fit and stretch steps, the drawing drafting screen, the pattern paper view, Save and finish later, Change the design on one screen, the four-step print flow and the pattern map everywhere. Piece labels are sentence case now (no tracked caps).

**User testing for DXB311 (Oct 2026):** five interviews: three QUT teachers, a home sewist (the designer's mum) and a second sewist (her sister-in-law). Changes they led to: plain sewing words across the app (the first prototype's copy was not understood), the "Want a quick tour?" question (a tester did not realise the first screens were onboarding), only the 4 base measurements before a choice to add 20 more or go home (the full 24 used to be forced), and a way to leave every flow at any point with progress saved.

**AI-assisted expert walkthrough (21 Oct 2026, fixed the same day):** Claude walked the app as a hobby sewist. Fixed: typing over a measurement, − / + jumping to an average, "wrap" ignored (a back zip on a wrap), flutter sleeves drawn as caps, the seam allowance definition, no test square, the fixed 140 cm fabric width and no notions list, lengths without a reference point, ease asked twice, the home-screen question repeated, demo bodies shown to new users, two vocabularies for the measurement groups, and unlabelled options for screen readers. (The fabric tip styled like a button and the missing Back on Ready to print were already fixed in the 20 Oct pass.)

**Second round, the designer testing on her own phone (21 Oct 2026):**
- **Garment kinds:** `Draft.kind` (dress, top, skirt, trousers) chosen in the studio. `readDesign(words, kind)` picks the pattern (trousers: straight or wide-leg; skirt: bias midi or A-line mini; top: tee, shirt or cami; dress: flutter, wrap or slip) and that kind's details (`KIND_DETAILS`: trousers have Rise, Leg, Length, Waist, Pockets and Fastening; skirts Length, Shape, Waist, Fastening; tops Sleeves, Neckline, Length, Shape, Fastening). The garment check title and summary (`describe`), the detail sheets (`detailOpts`), the fit preview (the garment itself unless it is a dress), the drafting pieces, the body view, the pattern name (`nameFor`: "Straight mid-rise trousers", "Midi A-line skirt") and Change the design (length dial `LENGTH_DIAL`: Shoulder to hem or Waist to hem, neckline only for dresses and tops) all follow it. Before, every design became a flutter dress.
- **Fit words:** "ease" is gone from the screens. The fits are **Tight +1 · Relaxed +4 · Loose +8 · Oversized +16 cm** ("Close" became "Tight" in round 3), and the fit step says "How much room there is between your body and the {garment}. More room means a looser fit."
- **Home:** "Design from scratch" (From a photo, sketch or words) and "Ready-made pattern" (Pick one, fit it to you). Renamed in round 3 (below).
- **Pattern library:** **Your patterns · Ready-made** at the top; Ready-made lists every pattern by kind (the same as the home page's library). With no patterns of your own it says so and offers the ready-made ones. **Body library:** search only (the Me / Family / Clients tabs guessed from names and hid bodies).
- **Add to home screen (iPhone):** four steps as Safari works today: the three dots next to the address, Share at the top of that menu, scroll down to Add to Home Screen, Add.
- **Before you scan:** a numbered checklist card (1 Wear fitted clothes, 2 Stand against a plain wall, 3 Place the phone at hip height), not centred lines of text. **Camera:** a switch for the front or back camera (top right); the front camera shows a mirror image and has no torch.
- **Seam allowance:** 1.0, 1.5, or **Your own** (0.5 to 6 cm). Replaced in round 3 (below).
- **Arrange your pieces:** a line under the board says what to do ("Tap a piece to choose it, then drag it or rotate it", then "{Piece} chosen"); Start over is **Reset layout** with **Undo** for six seconds.
- **Ready to print:** "Save and print later" (saves it as Ready to print and goes home) replaces "Save as PDF instead", which did nothing.
- **Planned next, before the exhibition:** dials that look more like real controls, patterns to make that you can customise in the app (sleeves, off-shoulder) with the drawing following, and one consistent hover and selected style across the app.

**Third round (21 Oct 2026, the designer and a teacher on the live app):**
- **The garment you ask for is the garment you see.** `src/components/garment.ts` draws every garment from its details (`buildSpec`) in the mannequin's own space: every neckline (Round, V-neck, Scoop, Square, Off-shoulder, Boat, High neck, Halter, Sweetheart, Cowl, Collar), every sleeve (Thin straps, Sleeveless, Cap, Short, Flutter, Puff, Elbow, Three-quarter, Long, Bell), every length in cm from the shoulder or waist (`LENGTH_CM`: dresses Extra mini 66 · Mini 72 · Above the knee 85 · Knee 95 · Midi 109 · Maxi 122), every top shape (Fitted, Relaxed, Boxy, Oversized, Peplum, Wrap), skirt shapes, waists, and trousers (rise, leg, shorts, pockets, fly). The fit adds room on each side. `BodyFigure` takes `spec` (`draftSpec(draft)`) on the garment check, the fit step, the result, Change the design, the pattern page and the patterns to make. Words like "tight", "slim" or "fitted" make a top Fitted (a dress Bodycon, trousers Slim); "singlet" or "tank" is sleeveless, "cami" or "strappy" thin straps. Their example, "a short-sleeve scoop-neck tight cropped top", now draws exactly that (it used to be an oversized tee). Halter and sweetheart are always sleeveless.
- **Design dials read as controls** (after "it just looks like decoration"): each dial works like the measuring control: − and + either side of the value, centimetre numbers on the ruler like a tape measure, and which way is which under it ("Shorter / Longer", "Higher / Deeper"). On Change the design they are full width, one under the other. **Patterns to make** no longer opens with the arc of looks; the arc only shows in an empty Pattern library.
- **Change the design is live:** the length dial moves the hem and names the length; the neckline-depth dial deepens the neckline drawn (each neckline starts at its usual depth, `NECK_CM`; choosing another neckline goes back to it). Names follow the details ("Cropped short-sleeve top", "Strappy top", "Long-sleeve tunic").
- **Saved patterns** are linked to the draft by id (`draft.patternId`), so changing the design renames the pattern instead of saving a copy; reopening one keeps its kind, length and neckline.
- **Words:** "Ready-made" is **"Patterns to make"** (sidebar, library tab, the templates page). Home: "Start from a pattern" / "Choose a style, then fit it to you", balanced with "Design from scratch". Fit "Close" is **"Tight"**.
- **Pattern library:** **Your patterns · Patterns to make**, and under Patterns to make a filter row **All · Dresses · Tops · Trousers · Skirts** (the same style as All · In progress · Printed). With no patterns yet it shows the sign-up arc of looks (`ArcCarousel`, the "Create your account" look), "No patterns yet" and "See the patterns to make".
- **Patterns to make detail:** the mannequin wears the pattern at the length you choose, and changes as you switch Mini / Midi / Maxi.
- **Seam allowance:** on Yes, one field: type any amount or use − / + (half centimetres, no presets, no 6 cm cap), with "Most home patterns use 1 to 1.5 cm." under it. The allowance band on the preview widens with the amount.
- **Lay out your pattern** (a teacher was lost on "Arrange your pieces"): "This is your printer paper: each square is one A4 page. Moving pieces closer together prints fewer pages. You can also skip this and tap Next." No A1–D4 codes. "Uses N pages". A first-time demo on the first piece (a sliding hand and "Drag me") until you touch a piece. Two plain lines say "Drag a piece to move it" and "Tap a piece to turn it"; the chosen piece carries its own white turn button. Buttons: **Turn piece** and **Arrange for me** (with Undo).

**Still open from testing:** global text size +1px (a proper type scale with a 15px minimum is the better fix), "Alter" instead of "Make edits", a "Continue your {garment}" card on home, and whether to rename "body".

**Second review round (done):** centred onboarding text, full-width progress bars, centred wizard numbers, how-to steps moved into the "?" sheet only, full-width centred body figures (measure and ready screens), Check/Edit on the base review, the new home and the new tab bar.

**Next likely round:** the pattern, templates and print screens. The studio (prompt screen) was rebuilt on 5 Oct 2026 (§6).

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

- **3D body (started 23 Oct 2026, lab branch `exp/mark-cover`, not on main):** MakeHuman bodies exported headless from Blender 5.2 with MPFB2 2.0.18 (`tools/body3d/export.py`): female and male young adults, MakeHuman's own measure shape keys (bust, underbust, waist, hips, neck, thigh and more, each up and down), helpers removed, 13,380 vertices, `public/body3d/<sex>.glb` (1.5 MB each, sparse morph targets). The script measures the body like a tape (horizontal slices, the torso's own loop, its convex hull) and writes `src/lib/body3d.json`: base measurements, landmark heights, tape outlines and how many cm each shape key adds. `src/lib/fitBody.ts` fits a body to a person's measurements (height as a uniform scale; circumferences by choosing the shape key weights). `src/components/Body3D.tsx` renders it with three.js (React Three Fiber): a physical material, three lights, studio reflections made in code (no image download), a contact shadow, drag to turn, turning by itself except with reduced motion, frames drawn only when something changes. The tape ring is traced on the fitted body. The lab (`/lab`, section 3D body) has live controls (leva) for the body and the look, saved in the browser, with Copy settings. **Poses and shots (23 Oct 2026):** the bodies carry MakeHuman's game-engine skeleton (53 bones) and a **mannequin head** (23 Oct 2026, replacing an egg head Jose rejected: "should look like a helmet and a human face", like an abstract fashion mannequin, no ears). The script keeps MakeHuman's own skull, jaw and neck, removes the ears and the face (a rounded cut from under the lips to the brow, with whatever sat inside), closes the opening with an even grid, fairs it into the smoothest surface that meets the head (a biharmonic fill), brings it back out to the old face's broad shape (cheekbones, chin, the line of the nose) and relaxes the seam. One surface with the neck, no eyes, mouth or ears. Refined 23 Oct 2026 (Jose's marked-up renders): the face meets the forehead in one curve, the lower face is smooth with no nose tip or lips left, the head stays oval, and the chin is drawn back towards the neck with the join under the jaw faired smooth. **Both bodies wear the female head** (Jose: it was the better one): the male gets the same vertices, scaled to his head (×1.05) and eased into his thicker neck above the neck measurement. Nothing at or below the neck measurement moves, so the measurements are unchanged, and the shape keys that carry the head (nape to waist, neck) still move it. **Hand sculpting (23 Oct 2026):** Jose sculpts the head himself in Blender: `tools/body3d/head.blend` (opened ready to sculpt by `tools/body3d/Sculpt the head.cmd`; guide in `tools/body3d/README.md`). The male has his own file, `tools/body3d/head-male.blend` (`Sculpt the male head.cmd`): it starts from the female head scaled to him, and only what is sculpted in it is added to his head. The neck measurement and the body below always stay the script's. **Chest (23 Oct 2026):** the female body's nipples are smoothed away (a biharmonic fill 2 cm round each, in the basis and every shape key alike, before the body is measured), so she reads as a mannequin at every bust size. **Default look (23 Oct 2026, Jose's):** `LOOKS.venty`: pale blue-grey #b0c3d4, glossy (roughness 0.15, clearcoat 0.43), not metallic, no key light (fill 0.6 cornflower, rim 2.4 peri, ambient 0.15), no floor shadow. **The tape** (the dashed ring for a circumference) is flat cornflower #687ef5, no light or reflection, 3.5 px, its dashes running round the body (0.12 m/s, about three times the turning speed; still with reduced motion); it goes round the torso only (arm points left out) and the bust tape sits at the fitted bust's fullest point. **Height reads (23 Oct 2026):** whole-body views frame the body as if it stood 2 m tall (the tallest the app takes), feet on the same line, so a taller body visibly reaches higher instead of every height filling the frame alike; bands of the body (the torso tapes) still follow its own height. **Where the 3D body would go** (lab copies, `/lab` 3D body section): the measuring step, the body after setup (Preview), Edit measures (whole body beside the list, the tape on the picked row), Body ready (paper and Crown), the body library cards; later, with the garment on the 3D body, the fit preview, the garment check, the result (On your body) and the templates. **Height and measuring screens, being refined (24 Oct 2026):** the body should stand somewhere, not float in the card. Twenty lab variations of the stage (24 Oct 2026: each a backdrop behind the body and a floor under it, `Body3D stage` and `chart`: pool of light, podium, pattern floor, studio horizon, slate sweep, Crown, height chart, niche, mirror light, mirror floor, tape ring, dot floor, spotlight, light disc, plinth, rings, window light, mist, line drawing; the camera looks down 9°) and of the dial (snow; the ruler in a pressed inset track, which Jose chose; both). **Jose's pick: the pattern floor** (24 Oct 2026), refined: ink backdrop with a barely-there cornflower light from above, quieter lines (real 10 cm squares, bolder every 50 cm, fixed whatever the body's height, so a taller body stands taller on it), a dark shadow under the feet. Second pass (24 Oct 2026): the 3D build kept (not the drawn one); the light from above a little brighter; the thin lines a little stronger. Third pass: the floor is plain ink nearest the camera, a little darker behind the feet, and melts into the backdrop a short way behind them, so it is only seen from about the knees down (Jose's line; no horizon); a dark pool under the feet (it was a pale one) with the contact shadow. Two builds to compare: the floor in the 3D scene (one plane, very cheap next to the body) and drawn flat behind it (CSS, nothing in the scene), all the same height so the screen still fits without scrolling. The height step turns slowly (drag to turn; a pause button bottom right of the card, the app's round button like help; paused it stays still until tapped again, dragging included). **The ruler** keeps following the finger anywhere until it lifts (window-level moves; before, it stopped when the finger left the ruler). **Live on main (24 Oct 2026):** the measuring steps (the stage, the inset ruler) and Body ready (night card, posed portrait, the saved line further from the heading than the heading from its text). Not yet: On your body (the 3D body has no garment yet, and the result screen exists to show it). **The other body screens, in the lab (24 Oct 2026):** On your body: the whole screen ink with the faint light, the body on the pattern floor running on behind the buttons (`Body3D room`: a share of the view kept free at the bottom, the body framed above it), turning by itself, a pause above Looks right. Your body (after setup): the same backdrop and floor. Body ready: the start screen's night card above the paper, the body from the waist up, three-quarter, posed (`portrait` shot and pose: torso turned a little away, head back towards the camera). Body library: no 3D (Jose is choosing a cinematic picture; the mannequin stands in), the gradient gone, five card styles to choose from: night card (the body rising out of it), portrait poster, pattern floor, snow, inset window. **More measurements move the body (24 Oct 2026):** every MakeHuman measure control the app has a measurement for is now wired: nape to waist, waist to hip, inside leg (upper and lower leg length together), shoulder to wrist (upper arm and forearm length, newly added to the model), across shoulder, across front, upper arm, wrist, on top of bust, underbust, waist, hips, neck, thigh and height. The added ones are measured by the export on points of the skin (`tape_points`) and fitted by change from the app's starting value (`fitBody`), and only move their own keys when the person has that measurement; the lengths' effect on height is corrected for. No MakeHuman control (left visual only): elbow, high hip, front neck to waist, armhole, shoulder to apex, shoulder length, across back, apex to apex, rise. **Lights** turn with the camera, so back and side shots are lit like the front (the rim light behind the body turned them purple). **Lab defaults:** female 168 / bust 95.5 / underbust 67 / waist 68 / hips 100 / neck 34.5 / thigh 54; male 177.5 / 127.5 / 77.5 / 85.5 / 94.5 / 37 / 56.5 (switching sex loads that body's defaults). Renders to check it: `BODY3D_PREVIEW=1 BODY3D_SEX=female` writes `tools/body3d/preview/` (not committed). `src/lib/bodyShots.ts` gives each of the 24 measurements a shot: one of four poses (relaxed, the arms hanging down with the elbows softly bent, the forearms about 16° forward towards the front of the thighs (fully straight looked robotic), aimed from the skeleton so it holds on both bodies; arms open for the arm measurements and the torso tapes; stance for the legs; seated on a stool for the rise) and a camera framing (a band of the body, front, side or back). The body eases into the pose and the camera glides to the framing (cuts with reduced motion); drag turns the body; the torso shots turn slowly. The lab's Measuring list (or `?m=<key>` in the address; `?shots` hides the panel) shows each shot. Next: the garment on the 3D body, a wider fitting range (MakeHuman weight macros), hands resting on the thighs when seated, palms forward in the open pose.
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
