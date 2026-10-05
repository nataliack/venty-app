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

**Home-screen app (PWA) vs Safari (checked on a real iPhone, iOS 26, via iPhone Mirroring):**
- **Status bar is transparent (`black-translucent`)**, as wanted. On iOS 26 this triggers a WebKit regression (bug 301108): a home-screen app's window is one status bar (47pt) short at the bottom, an unpaintable strip on every screen. **Workaround (5 Oct 2026):** iOS grows the window to the full screen once the document is taller than the screen (verified on an iPhone in kaplanoah/sports-apps#57/#60). So under `html.pwa` the root is a normal document with `min-height: calc(100% + env(safe-area-inset-top) + 1px)` instead of a pinned `position: fixed` one; `.device` stays fixed and fills the full window. `100lvh`, sizing to `screen.height` and negative offsets do NOT work (tested by others on devices). If the window is ever still short, `html.vp-short` (set in layout.tsx) puts the tab bar on the short floor and `useStatusTint` colours the strip. The alternative, an opaque status bar, also fixes the bottom but loses the see-through top. iOS reads the status bar style only when the app is **added** to the home screen, so it must be re-added after a change.
- `layout.tsx` runs a tiny `beforeInteractive` script that adds `html.pwa` when opened from the home screen. On phones, `html.pwa` drops the reserved bottom space, since iOS already stops the app above the home indicator (`--bottom: 8px`, `--dock: 0`). Safari keeps its spacing because its toolbar sits below.
- Never force the app's height to `screen.height`: in the home-screen app that pushes content past what iOS shows.

**Status bar tint (Safari):** the browser's `theme-color` follows the top of each screen (`useStatusTint` in `App.tsx`): light (`#f6f7fd`) on home, Crown's top (`#a7b1d3`) on Welcome, the tour, onboarding, start, body ready and pattern complete, and dark elsewhere. In the desktop phone frame the fake status bar turns navy on home. (The home-screen app uses a solid black status bar instead; see above.)

**Card colour: `card` = #1b1c26 (5 Oct 2026).** One named colour for every dark card, defined once in `globals.css` (`@theme`: `--color-card`, with `--color-card-hover` #23242f for hover only). Use `var(--color-card)` in CSS and `bg-card` in Tailwind; never type the hex. It is a **solid fill, never a gradient and never see-through**, so the dot grid never shows through. It covers `.card-soft`, `.glass`, `.glass-2`, `.opt` option cards, `.pair-dark` (home's "Use a pre-made"), the studio panel, dark pills and small round buttons, tiles, and the reset dialog. Sheets (pop-ups) keep their own gradient; icon circles keep `.iconbadge`.

**The named colours** (all in `@theme`): `bg` #0b0c15 (page), `card` #1b1c26 (cards), `card-hover` #23242f, `ink` #131523, `primary` #687ef5, `primary-2` #4f63e0, `peri` #8c9cf8, plus `lav`, `mist`, `slate`, `denim`, `snow`. Add new colours here as tokens rather than one-off hex values.

**Gradient: Crown only (4 Oct 2026).** The app's one big gradient is **Crown**, ported as-is from the landing page (`nataliack/Venty-landing-page`, `/gradients`, "Light, locked"): light from the top centre, a blue halo rising from below, four slowly drifting lights. Use the `<Crown />` component (animated, `.sky.sky-light`) for screens and panels, and `.violet-panel` (Crown's static layers) for small things like the avatar. It is on Welcome, the onboarding pictures, every `PaperScreen` panel (tour question, start, body ready, pattern complete), the "Design your own" card and the finished-pattern panel. **Never use the old violet radial gradient** (`#8c9cf8 → #4f63e0 → #1c2252`) anywhere.

**Colour roles (4 Oct 2026):** the app was monotonous because every screen was the same dark navy. Colour now has a job:
- **Dark navy screens are for working**: measuring, the studio, the garment check, printing, libraries. Dark keeps attention on the task and reads as precise.
- **Paper + violet screens are for moments**: the tour question, the start page, "Your body is ready", "Your pattern is complete" (all built with `PaperScreen`: a Crown picture panel over warm paper; side by side on desktop). On phones the picture takes about half the screen (54%; the tour pages 62%, "Your body is ready" 40% and "Your pattern is complete" 30% because they hold more, so nothing needs scrolling), so the paper below is balanced rather than empty. Light and violet read as calm, encouraging and celebratory, and they tie back to the onboarding.
- **Home** has a light top (`.light-hero`: pale periwinkle with a periwinkle graph-paper grid) with text in a soft, readable indigo (`#3d4bb3` / `#5c68b0`, not white, not a harsh navy), above the dark page.
- The finished-pattern page shows the garment on a violet panel.

**Choices and buttons:**
- **Nothing is ever pre-selected.** The user picks, then continues.
  - **The only exception: units default to cm**, and units can never be empty.
- **Decision button pattern** (`Arrows` / `NextButton`), used on every step screen (changed 4 Oct 2026 after user testing):
  - It is the **filled primary button** (`.pill-primary`), the same one as "Get started" on Welcome. The old outlined chevron with a glow is gone; testers read it as secondary and "AI".
  - Back is a round button on the left and the primary button fills the rest of the row. With no back button (`hidePrev`) it runs full width, centred.
  - Before a choice is made it is still visible but faded (`.is-off`). Tapping it then calls `showNeeded()`: every still-empty required input on the screen (anything marked `data-need="1"`) gives a small side-to-side nudge and a violet edge for a moment. Mark required inputs with `data-need`.
- **No time estimates anywhere** ("about 3 minutes", "6 hours"). Measuring and sewing take as long as each person takes, and testers found the numbers stressful.
- **Hover and press effects are plain** (changed 4 Oct 2026): hover brightens the edge or fill a little, a press dips the element. No swirls, glows, ripples or drifting lights; they read as "random rainbows" and stuck on touch screens.
- **Cards on the dark page are solid** (`.card-soft`), not see-through glass.
- **Option cards** (`Option`):
  - Unselected: quiet glass with a radio ring.
  - Hover: a slightly brighter edge only.
  - Selected: violet edge plus gradient.
  - The bright gradient means *selected or hovered*. A card never sits in that state by default.
- **Information is never styled like a button.** Tips and notes are plain text with an icon (`Note`, the tip lists).
- **Inputs look like real, empty inputs** (`Field`, `.field`), with a placeholder and no pre-filled value.
- **Scrolling and layout:**
  - Screens must not scroll or bounce when the content fits.
  - The footer has no backdrop.
  - The scroll area fades its bottom edge only when it really overflows (`.scroller.is-over`).

**Body figure centring:** to centre a `BodyFigure` in a box, give the svg `h-full w-full` (the viewBox centres the figure itself). Never use `h-full w-auto` inside a flex box: Safari sizes the box from the svg's width attribute and the figure drifts off-centre.

**Navigation (phones):** a light periwinkle tab bar (`.tabbar`, the same colour family as the home hero) with Home, Bodies, Patterns and You, plus one round **Create** button (`.createbtn`) sitting in a real **notch** cut into the bar: the bar's outline is an SVG (`NotchShape` in home.tsx) with a round cut-out around the button and rounded shoulders where the cut meets the top edge, so the bar cradles the button. The bar is 80px tall, with icons and labels in the upper part and room underneath, like iOS tab bars. Create is the single most important action, so it is the only thing raised. Desktop keeps the sidebar.

**Styling pitfall:** custom classes in `globals.css` written **outside** `@layer` beat Tailwind utilities.
- Never put `display`, `position` or size on those classes (`.field`, `.opt`, `.nextbtn`, …), or utilities like `flex` stop working.
- This bug has already happened once.

## 6. Flows (current, after the overhaul)

**Getting in:**
- **Splash:** the Welcome screen without its words or buttons: the same Crown sky, the logo in the same place, and a slim loader in the slot where the buttons will appear. It auto-advances and cross-fades into Welcome (the logo stays put; splash, Welcome and "Welcome, Ana" cross-fade instead of sliding).
- **Welcome:**
  - Logo, then the headline **"See a dress you love. Create it. Wear it."** and body text, centred between the logo and the buttons.
  - A slowly drifting gradient background (`.sky` with `.drift` lights).
  - "Get started" and "I already have an account".
- **Sign up (`signup`):** **Continue with email** first (white), then a hairline with "or", then Continue with Apple and Continue with Google below it.
  - The guest option is the top-right **"Skip for now"**. It was decided to keep guest here, not on Welcome, and as text with no arrow.
- **Log in (`login`):** the same buttons in the same order, plus "New to Venty? Create an account".
- **Email step (`email`, mode `signup` or `login`):**
  - Sign-up asks for name, email and password (at least 8 characters, with a show/hide toggle). Log-in asks for email and password, plus "Forgot password".
  - The button stays disabled until the form is valid.
- **Signed in:** on the same sky as Welcome, with the logo in place: a calm frosted check, "Welcome, {name}." and "Your account is ready. Let's show you around.", and the same slim loader. Then the tour question.

**Tour question (`tourAsk`):** before any tour, a page on the same sky background and layout as Welcome asks "Want a quick tour?" with **"Show me how it works"** and **"Skip the tour"**. Skipping sets `tourSkipped` (home then offers the tour) and goes to `start`.

**Onboarding (`onboarding`):**
- **Light and editorial:** paper background, a 56% picture panel, and a "Fig. 1 …" caption. It is meant to look nothing like the dark app.
- **Heading and body text are centre-aligned** on these light pages only (the rest of the app stays left-aligned).
- **Three chapters:** any look you love (photo, screenshot, link, sketch; not just Pinterest), drafted to your body, then tweak and print.
- **Manual only.** Nothing advances by itself (testers felt rushed). Progress bars at the top fill as the reader reaches each page; they are not buttons. Next (primary) at the bottom runs full width on page 1; from page 2 a round Back button slides in beside it. A white "Skip" at the top.
- The pictures contain nothing that looks like a button (the link is drawn as a URL snippet, the sketch as a paper drawing), because testers tried to tap them.
- Replayable from Profile → App tour, opened with `{ from: "app" }`, which returns to where the user was.

**Start (`start`):** "Welcome, {name}. Let's set up your body", with one line on why (every pattern is drafted to your measurements) and a body figure. One primary button, **"Set up my body"**, and a quiet **"Skip for now and go to home"**. "Explore templates" was removed: testers did not understand "Where do you want to start?", and a pattern cannot exist without a body.

**Preferences (`prefs`):**
- Shown **once, app-wide**, before the first body. Heading **"Before we begin"**, no body text.
- "Do you measure in centimetres or inches?": compact cards with full-width tick strips (`.ticks`). cm is the default.
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
   - **One unit only:** the value shows in the chosen unit (cm or in) and never a second conversion line under it. The number is 46px Bigilla, sitting high in the card. "Tap to type, or slide below" shows only while the value is empty.
   - The − / + buttons are plain (`.rb-plain`): no swirl or glow. Hover lifts the fill slightly; a press flashes solid white.
   - No "Nice, X is next" line and no pulsing Next button after a value is set. They read as too AI in review.
   - On AI-estimated values, the note "AI estimate from your photos…" sits **under** the measuring card.
   - Reset, the misleading neighbouring numbers, and the old "Save · next" bar are gone.
4. **Scan:**
   - **`scanPrep`:** "You'll take 3 photos of yourself: front, back and side." Three plain tips (fitted clothes, a plain wall, phone at hip height) and a privacy note. No "step back", no underwear mention.
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
   - Continue opens a sheet: "4 measurements saved", **"Great job getting this far"**, "Would you like to add 20 more measurements to make your body even more precise?" → **Yes, add 20 more** (to `wizard`) or **Later** (to `ready`).
6. **`ready`:**
   - "Saved to your bodies", **"Well done! Your body is ready"**, "Good job finishing {name}'s measurements…", and a summary line with a progress bar.
   - Buttons: **Choose what to make** (straight to the prompt screen with this body) and Go to home. Testers asked "a pattern of what?" when the button said "Start a pattern": the garment comes before the pattern.
7. **Rise** (the seated measurement) shows a **seated side-view figure on a chair** (`SeatedFigure`) with the tape from waist to seat.

**The other 20 measures:**
- **Groups (sewing terms):** **Circumferences** (measured around the body), **Vertical lengths** (top to bottom), **Horizontal widths** (side to side) and **Seated rise** (sitting on a hard chair). Testers did not understand "Wraps". Each group's description says which way the tape goes.
- **Progress:** "Base · Around · Down · Across · Seated" (short labels).
- The last step of a group says just **"Finish"**. Copy says "measurements", not "measures" or "numbers".
- **`wizard`:** prep tips (tape, a friend, fitted clothes), then the group list.
  - Base measures show as done.
  - The next group is outlined "Up next". The list is a guide, not a menu.
  - One button: "Continue with {group}". The order is strict.
- **`wstep`:** the same `MeasureStep` UI as the base measures.
- **`wdone`:** shows the same group list, where finished groups have a **"View my measures"** dropdown.
  - "Continue with {next}" and "Take a break, finish later".
  - Taking a break goes **home**, which then shows a **"Continue finishing your measures"** card (`resumeBody`).
- **`alldone`:** the count, then every group including base, each with a dropdown of values. Tapping a value edits it.
  - "Open any group to see your measurements. Tap a measurement to change it." Button: "Save body".

**Home (`home`):**
- **Top: a light rounded block** (`.home-hero.light-hero`): pale periwinkle with a soft periwinkle grid fading down, rounded bottom corners over the dark page (a dark wrapper sits behind the corners so nothing grey shows). Text in navy (`#26335f`, secondary `#3f4c80`).
  - The greeting row is deliberately quiet so the eye lands on the two cards: a small flat-filled avatar (light periwinkle #d9def4, navy letter, no gradient), a small muted "Good evening / Ana", and a solid white **Notifications bell** (replaced search; the sheet is titled "Notifications", not "Updates"; the bell glyph is optically centred) with a periwinkle dot for unread. The profile page avatar uses the same flat fill.
  - The top is balanced, not cramped: "What are we making today?" (34px, two lines) with room above it, one line under it ("Design your own, or use a pre-made pattern."), then the two cards (128px tall).
  - **One icon style:** every icon circle (bell rows in Notifications, Create menu, install steps) is `.iconbadge`: the app's own dark blue (#262b4b → #14172a, the page background lifted a touch) with a white line icon and a fine light edge.
  - **Notifications sheet:** a quiet feed, not a stack of buttons. Plain rows split by hairlines, no card backgrounds; rows that lead somewhere are still tappable.
  - **Create menu (+):** title "Create" and "What would you like to start?", one large Crown card "Design your own" (the main action), then two equal dark tiles: "Use a pre-made" (Ready-to-fit patterns) and "Make a body" (Add measurements). Only Crown and the dark card, no other colours.
  - **Add to home screen:** a page (`install`, `InstallGuide` in `src/components/Install.tsx`), not a pop-up: three short steps on one screen, each with a small drawing of what you'll see (Share, Add to Home Screen, Add). Android Chrome also gets a real install button (`beforeinstallprompt`). It's asked in "Before we begin" ("Add Venty to your home screen?" Yes, show me / Not now; Yes opens the guide, then the flow carries on to naming the body), and offered as a dismissible card on home (`installDismissed`) and in You → Settings. Only on a phone browser: never on desktop or inside the home-screen app.
  - **Two ways to start**, a matching pair: **Design your own** ("Photo, sketch or words"; picks the body, then the studio) and **Use a pre-made** ("Ready-to-fit patterns"; the library). Both are the same solid `card` (#1b1c26) with their icon in a circle wearing the primary button's gradient (`.icon-primary`).
- **Below, on the dark page:** notices (finish your measurements, take the tour), **Your bodies** (a horizontal row with a dashed "+" first), **Your patterns** (the three latest, with a status dot) and a Pre-made patterns row. All are solid `.card-soft` cards. Each section has a "View all".
- **Phone tab bar:** back to the light floating bar (`.tabbar`) with the Create button raised in a notch in the centre. The current tab sits in a soft periwinkle capsule. No glows (the dark capsule version was tried and dropped). The bar stays a **fully rounded floating pill** in a muted periwinkle (not bright white), set right down by the bottom edge: tab screens use `<Screen dock>`, which leaves only a few pixels below it (`--dock`), in the home-screen app and in Safari.
- **Library pages** (Body library, Pattern library) no longer show a big count next to the title. Counts live on the profile page.
  - The top is just the title with **Edit** on the same line. No "Library" label above it (it said nothing the title didn't).
  - Both have an **Edit** button (top right, beside the title). In edit mode you tick items and "Delete N" replaces the tab bar; deleting asks once ("This can't be undone").
  - **Body library** cards all use one neutral colour (denim #4d5e85), no alternating violet.
  - **Body library** has a working search field (filters by name) above the All / Me / Family / Clients chips.
  - **Pattern library** has no search. Each pattern is a large card: the garment on a small Crown swatch, a status line that says something useful ("Ready to print", "Printed on 9 A4 sheets", "Printed at a print shop", "Draft, not finished yet"), the name, "Drafted to {body}", and two small facts (fit and metres of fabric). Piece counts were dropped: they didn't help anyone decide anything.
- **Settings** always has "Add Venty to your home screen" (except inside the home-screen app), so people who said "Not now" in "Before we begin" can find it later.
- **A saved pattern opens as its own page (`pattern`)**, not the making flow: the garment on the body, its status ("Printed", "Ready to print", "Draft") and who it was drafted to, a **Shopping list** to show at the fabric shop (metres, stretch, feel, the fabric you chose, and why), and **How it was made** (fit and ease, seam allowance, pieces, paper, garment details). Actions: **Print again** (or Print it) and **Change the design**. Patterns save these details (`pattern.spec`) when made and printed.

**Elsewhere:**
- **home, bodies, patterns, you:** tab bar on phones, sidebar on desktop.
- **Pattern flow:** `patSelectBody` → `prompt` → `ref` → `ai` → `generating` → `garment` → `edits`.
  - `patSelectBody`: "Who is this pattern for?", a **vertical list** of bodies (no swiping), plus "New body".
  - `prompt` ("What are we making?") is **the studio**, built as one instrument (inspired by Higgsfield's composer): a short title and one line, then a single `.studio` panel that holds every tool. Inside it: the sketch pad (dot grid) with a reference strip pinned top-left (up to 4 photos as thumbnails plus an add tile; the selected photo sits under the sketch) and Undo / Clear top-right; the "Describe it" text; a "Drafted to {body}" row (tap to change the body); and a tool row (Photo, Draw, Erase). On desktop, Continue sits inside the panel; on phones it's the usual footer. A soft Crown wash fades in behind the title. Use one tool, or mix all three. The photo and sketch are merged into one picture for the next steps; the words are shown on the garment check. Continue unlocks once there is a photo or a stroke. The link option and "Choose a pre-made pattern" are gone from this flow (pre-made patterns start from home or the Create menu). Drawing happens on the page, not in a sheet, so nothing slides away while you draw.
  - After the studio, the garment check is **three steps with a progress header (Garment · Fit · Fabric)**, not hidden tabs: `ref`/`ai` Overview **"Let's check your garment"** (your picture, a summary, your words, and details you tap to change; each detail offers the full range a sewist expects, e.g. Length: extra mini, mini, above the knee, knee, midi, maxi; Skirt includes bodycon and pencil) → `ai` Fitting **"How should it fit?"**: the body inside a **dress silhouette** (sleeves, bodice, waist seam, flared skirt) that widens as the ease grows, from hugging the body to a big, loose dress. No number read-out under the figure. **Tight +1 · Easy +4 · Loose +8 · Oversized +16 cm**, or **your own** amount up to +30 cm (nothing pre-selected) → `ai` Fabric **"Choose your fabric"**: a suggestion based on the fit, described by behaviour not by name (e.g. "A stretchy fabric" for a tight fit, "No stretch" for loose), then "Does your fabric stretch?" (required; choosing against the suggestion shows a calm note, not a block) → "Create my pattern". "Stiff or soft" and the fabric-type chips were removed: testers did not understand them. The old "Got it. How do you want to continue?" screen is gone.
  - `generating`: everything centred; the current step shows one at a time; about 9 seconds (5 when updating), so each step can be read.
  - `garment`: "On your body / Pattern", with **Change the design** and **Looks right**. `edits` is "Change the design" with one action, **Update my pattern** (the old Regenerate / Done pair confused people).
  - `garment`: just the garment on the body, with Make edits / Looks right. No floating labels and no "Make edits before printing" line.
- **Pre-made patterns (`templates`):** one row of **text tabs with a sliding underline** (Dresses, Tops, Trousers, Skirts), then "N patterns" and a single **"Any level ▾"** button that opens a small sheet (Any / Easy / Intermediate / Hard). No stacked pills. Cards are solid, with the drawing above the name and a quiet line: three small level bars, level and pieces. The detail page shows pieces and a tag only.
  - Opened from the prompt screen (`{ picked: true }`), the body is already known, so the detail button says "Fit to {name}" and skips `tplBody`.
- **Print, in dependency order, with a progress header** (Printer · Seams · Layout · Fabric · Print; X returns to the garment):
  - `printMethod` "How are you printing it?" (A4 at home or A0 at a print shop) → `seam` → `arrange` → `needs` → `print` → `printed`.
  - `arrange`: the real paper. The arrangement (piece centres and rotation) is saved in `draft.layout`, and the **mini map draws exactly that layout**. A 4 × 4 grid where each cell is one A4 sheet; pieces are drawn to scale and draggable, and sheets that a piece touches are tinted. The count "N of 16 A4 sheets to print" updates as you drag (stored as `draft.sheets`). Rotate piece and Start over.
  - `needs`: **"Fabric to buy"** for this pattern only: how many metres (from the garment and the ease), stretch, feel, the fabric you chose, and width. The list of fabric suggestions moved to the making flow.
  - `print`: a summary (pattern, body, paper, seam allowance), "Print N sheets", and "Save as PDF instead". The old "Pages to print" picker was removed.
  - `printed`: "Good job! Your pattern is complete. Now you can start making your {dress}." Support resources and the mini map stay here.
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

## 8. Status (updated 4 Oct 2026, user-testing round)

**User-testing round (done, 4 Oct 2026):** after interviews with a hobbyist sewist, everything in §5–§6 marked as changed: the primary button everywhere with the `showNeeded` hint, no time estimates, the tour question and manual onboarding, the new start page, plainer preferences, the body naming page, method and scan copy, the "add 20 more" sheet, sewing-term group names with a seated Rise figure, the ready screen's "Choose what to make", the softer home colours, the vertical body list, the cleaned-up prompt screen, the pre-made pattern library with levels, and the reordered print flow with a real A4 layout.

**Same day, second pass:** tour question on the Welcome sky, full-width first Next in onboarding, a richer home hero (cutting mat, mannequin, three shortcuts), solid cards, a better tab bar, new group names, the redesigned pattern library, plain hover effects, the photo-and-sketch studio (no link option, no pre-made inside the flow), no counts on library titles, and a mini map that matches your layout.

**Third pass (4 Oct 2026):** home top on the Welcome sky with a softer grid, two start choices (Photo or sketch / Pre-made pattern), the Updates bell instead of search, and the garment check as Garment · Fit (dial) · Fabric steps.

**Fourth pass (4 Oct 2026):** home block separated again with a lighter sky, new start wording, words in the studio, a garment check with full options, a visual fit step with custom ease, fabric suggestions from the fit, a centred and slower loading screen, clearer change-the-design copy, a print fabric step focused on what to buy, and the finished-pattern page.

**Fifth pass (4 Oct 2026):** colour roles (dark for working, paper + violet for moments), the light home top, the dark capsule tab bar, the paper tour question, start, body-ready and pattern-complete screens, the studio order, the dress-shaped fit preview, and a simpler fabric step.

**Still open from testing:** global text size +1px (a proper type scale with a 15px minimum is the better fix), "Alter" instead of "Make edits", a "Continue your {garment}" card on home, and whether to rename "body".

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
