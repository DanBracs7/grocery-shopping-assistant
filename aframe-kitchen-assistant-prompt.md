# Build prompt: "Kitchen Assistant" — A-Frame teaching example (2 stages)

You are building a small teaching repository for an introductory HCI / user-centred design course. Read this whole document before starting. Part A is the concept (what the app is and why it is designed this way). Part B is the technical specification. Part C defines what "done" means. When something here conflicts with current A-Frame or Vite behaviour, check the current docs, pick the simplest working solution, and note the deviation in `docs/INSTRUCTOR.md`.

---

## Part A — Concept

### A.1 Course context

- Students are early-stage HCI students working in groups. Their course project imagines a world 5–10 years from now in which AI-enabled smart glasses are common, and they prototype **specific interactions with an agentic assistant** in everyday situations.
- This repo is used in one in-person tutorial, right after a short intro to XR, WebXR and git. Students clone it, run it, and make **one small change per stage** from a menu of "change cards".
- Students have git and Node installed. Most have little 3D experience and moderate JavaScript experience. Most will work on a **laptop browser**, and a few will test on **Meta Quest 3/3S** headsets.
- **Plain JavaScript (ES modules), no TypeScript, no UI framework.** Optimise for readability by beginners over cleverness or abstraction.

### A.2 The idea

The scene is a small kitchen counter seen "through the glasses": a kettle, a mug, a recipe card and a potted plant. The assistant never appears as a character. It only shows up as **hint cards**: small floating panels with a title, a short text and sometimes buttons. That matches how students should think about glasses UI: glanceable, situated and interruptible.

The repo has **two stages**. They share the same kitchen so students don't have to re-learn the scene.

| Stage               | Question it answers                                           | Concepts                                                                                                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Positioning** | _Where should the assistant's information live?_              | metres and y-up coordinates, `position` / `rotation` / `scale`, parent–child hierarchy (local vs. world coordinates), camera rig and eye height, anchoring: world-locked vs. object-anchored vs. head-locked (and body-locked as a stretch), readability and comfort (distance, size, angle) |
| **2 — Interaction** | _How does the user summon, act on and dismiss the assistant?_ | raycasting and cursors, `mouseenter` / `mouseleave` / `click` events, hover feedback, show / dismiss, confirm an assistant action, step through content, one interaction model across mouse, controllers and gaze                                                                            |

Key teaching message across both stages: **you write the interaction once against A-Frame's `click` / `mouseenter` events, and it works with mouse, controllers and gaze.** Placement and interaction are _design decisions_, not just code.

### A.3 Shared scene layout (both stages)

Use real-world units (1 unit = 1 m). The user starts at the origin, facing −Z.

- **Camera rig** `#rig` at `0 0 0`, containing the camera at `0 1.6 0` (desktop eye height; in VR the real head pose takes over, which is worth a comment in the HTML).
- **Floor** 6 × 6 m. **Back wall** behind the counter. Floor and wall get `hide-on-enter-ar`, so in passthrough AR on Quest 3 only the counter and objects remain. That's the "glasses" feel.
- **Counter**: 2.0 m wide, 0.6 m deep, 0.9 m tall (top surface at y = 0.9). Centre at about `0 0.45 -1.2`.
- **Objects on the counter**, all built from A-Frame primitives (no external models). Each sits exactly on the counter top. Approximate x positions, left to right:
  - kettle (cylinder body + cone lid + small handle), x ≈ −0.6
  - mug (cylinder + torus handle), x ≈ −0.2
  - recipe card (thin box, leaning back slightly on a small stand), x ≈ 0.25
  - plant (cylinder pot + a few spheres/cones as leaves), x ≈ 0.7
- Friendly, calm low-poly look: soft ambient + one directional light, muted colours, no shadows needed. Hint cards should be clearly "UI": dark translucent rounded panel, white text, coloured accent stripe on the left edge.

### A.4 Stage 1 — Positioning ("Where does the assistant live?")

**What students see (no interactions in this stage):** the kitchen plus **three hint cards**, each anchored differently. Each card carries a small tag label naming its anchoring mode, and each anchor type has its own accent colour.

| Card             | Anchor                                                         | Content                               | Implementation                                                            |
| ---------------- | -------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| Kitchen timer    | **World-locked** (pinned on the back wall, like a sticky note) | "Timer · Tea ready in 2 min"          | Direct child of the scene, fixed world position                           |
| Plant care       | **Object-anchored** (floats above the plant)                   | "Plant · Water me in 2 days"          | Child of the plant entity, local position e.g. `0 0.35 0`, faces the user |
| Incoming message | **Head-locked** (stays in view)                                | "Message · Alex: running 10 min late" | Child of the camera, e.g. `0 -0.15 -0.8`                                  |

Each card's content deliberately "belongs" to a different anchor. The reflection prompt is: _was this the right anchor for this content, and what would you choose for your own project?_

**Debug helpers (on by default in Stage 1, toggled with `?debug=0|1`):**

- a floor grid with 1 m lines (and faint 10 cm lines near the counter)
- an axes gizmo at the origin (X red, Y green, Z blue) with "X/Y/Z" letters
- a small, readable position label under each object and hint showing its **world** position (rounded to cm). It updates live, so students see that a hint's world position changes when its parent moves even though its local `position` attribute doesn't.

**Walkthrough points for the instructor (≈ 4 min):** open the A-Frame Inspector (`Ctrl+Alt+I`), drag something around, and read off coordinates. Then stress that **Inspector changes are not saved**: copy the values into `index.html`. Vite reloads on save.

**Stage 1 change cards** (🟢 = HTML only, ~2–4 min; 🟡 = HTML, needs thinking, ~5 min; 🔴 = stretch, may touch JS):

- 🟢 **P1 Move the mug** to the other end of the counter. _Which axis did you change? Why didn't y change?_
- 🟢 **P2 Resize the timer card** to 1.5× using `scale`, then try changing its `width` instead. _What's the difference?_
- 🟡 **P3 Re-anchor the timer to the kettle.** Move the timer entity inside the kettle entity and fix its position, which is now _local_. _Why did it jump when you moved it?_
- 🟡 **P4 Find a comfortable head-locked distance.** Try z = −0.3, −0.8 and −2.0, and move the card below the eye line. Write down what felt wrong at each.
- 🟡 **P5 Add a new object** (e.g. a toaster built from boxes) that sits _exactly_ on the counter. Hint: y = counter top + half the object's height.
- 🔴 **P6 Make the timer face the user** by adding the `face-camera` component. Then make it rotate only around Y. _Why might full billboarding feel odd?_
- 🔴 **P7 Body-locked:** replace the head-locked message with `lazy-follow` and tune its parameters. _How does it compare to head-locked while walking around (WASD on desktop)?_

### A.5 Stage 2 — Interaction ("Summon, act, dismiss")

**What students see:** the same kitchen. The debug helpers are off by default, and no hint cards are visible at the start. Three objects are interactive, and each one shows a different interaction pattern:

| Object          | Pattern                                                                         | Behaviour                                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plant**       | _Show / dismiss_ (the canonical example, simplest code, students copy this one) | Hover → highlight. Click → hint "Plant · Water me in 2 days" appears above it with a **×** close button. Click × (or the plant again) → hint hides.                                                                                                                                                 |
| **Kettle**      | _Assistant proposes, user confirms_ (agentic action with consent)               | Click → hint "Boil water for tea?" with **[Start]** and **×**. Start → kettle shows a simple steam animation, the hint text changes to "Boiling…", and after a short configurable delay (default 8 s) it changes to "Water is ready ✓". × at any point closes the hint without cancelling the boil. |
| **Recipe card** | _Step through content_                                                          | Click → hint "Step 1 / 4 · …" (a simple tea recipe) with **[Next]** and **×**. Next advances. After the last step the button reads **[Done]** and closes the hint.                                                                                                                                  |

The **mug is deliberately not interactive**. Making it interactive is a change card.

**Interaction rules (apply them consistently, they're the lesson):**

- Everything interactive gives **hover feedback**: objects get a subtle emissive tint and scale to 1.05; buttons lighten.
- Hints are **object-anchored** and face the user (reusing Stage 1 concepts).
- Buttons are big enough to hit with a controller ray from about 1 m (at least ~6 cm tall).
- **Hidden hints and their buttons must not be hittable** by raycasters. Invisible entities still get intersected by default; see B.4.

**Optional debug overlay (`?debug=1`):** a small world-locked "event log" panel on the wall that shows the last ~6 events (e.g. `mouseenter → plant`, `click → kettle-start`), plus the same entries in `console.log`. It shows students that events are actually firing.

**Input modes:**

- **Desktop (default):** mouse cursor (`rayOrigin: mouse`), WASD + drag-to-look.
- **Quest controllers:** `laser-controls` on both hands. Trigger = click.
- **Quest hands:** see B.4. Nice to have, not required.
- **Glasses simulation (`?input=gaze`):** a head-gaze ring cursor in the centre of view with fuse (dwell) selection, ~1.2 s, plus a visible progress/fill animation. This is the closest stand-in for gaze-based glasses input, and it sets up the "Midas touch" discussion. Works on desktop and Quest.

**Walkthrough points for the instructor (≈ 5 min):** where the raycaster lives (`objects: .interactive`), the three event names, how a component listens to events in `init` and cleans up in `remove`, and how `?input=gaze` changes the input device without changing the interaction code.

**Stage 2 change cards:**

- 🟢 **I1 Change the hover feedback**, e.g. a different colour or a stronger scale.
- 🟢 **I2 Rewrite the plant's hint** (title + text) to something your own project's assistant might say.
- 🟡 **I3 Show the plant hint on hover instead of click.** Then try `?input=gaze`. _What goes wrong? (Midas touch)_
- 🟡 **I4 Make the mug interactive** with its own show/dismiss hint by copying the plant's pattern.
- 🟡 **I5 Auto-dismiss:** make the plant hint disappear on its own after 5 s. _When would that be good or bad UX?_
- 🔴 **I6 "Remind me later":** add a second button to the plant hint that hides it and brings it back after 10 s.
- 🔴 **I7 Only one hint at a time:** opening a hint closes any other open hint.

**Suggested tutorial timing:** Stage 1 = 4 min walkthrough + 8 min hands-on. Stage 2 = 5 min walkthrough + 10 min hands-on. About 27 min in total. Students commit after each card with a message like `P3: anchor timer to kettle`.

---

## Part B — Technical specification

### B.1 Stack

- **A-Frame 1.8.x** from npm (check the latest stable on npm and use it). **Vite** (latest stable) as dev server and bundler. Set the `engines.node` field to whatever that Vite version requires.
- Plain JS ES modules. No TypeScript, no framework, no CSS framework.
- A-Frame supports being imported from module scripts. Still **verify there are no "unknown component" warnings** and that components register before the scene initialises. Load order: `import 'aframe'` first, then component modules, from one entry module per page.
- **HTTPS for Quest:** use `@vitejs/plugin-basic-ssl` and `server.host: true`, so `npm run dev` prints a LAN URL (`https://<laptop-ip>:5173`) the Quest can open after accepting the certificate warning.
- **Multi-page Vite build:** `index.html` (landing page), `stage-1/index.html` and `stage-2/index.html`, all listed in `build.rollupOptions.input`. Use `base: './'` so `dist/` works on any static host, including GitHub Pages under a sub-path.
- **No runtime CDN dependencies.** In particular, A-Frame's `text` component loads its default MSDF font from a CDN. Bundle a font locally (from the A-Frame package or the official fonts repo, licence permitting) and reference it explicitly. The only accepted external request is the A-Frame Inspector when a user opens it.

### B.2 Repository structure (adjust if there's a good reason)

```
kitchen-assistant/
├── index.html                 # Landing page: two big buttons "Stage 1", "Stage 2" (must be usable in Quest Browser)
├── stage-1/index.html         # Positioning scene — all layout lives here as HTML attributes
├── stage-2/index.html         # Interaction scene
├── src/
│   ├── stage-1.js             # import 'aframe'; import components used by stage 1
│   ├── stage-2.js
│   ├── components/            # one component per file, each ≤ ~80 lines, heavily commented
│   │   ├── hint-card.js       # builds panel + title + text + accent stripe + optional tag from schema
│   │   ├── hint-button.js     # a clickable button inside a hint; emits a named event
│   │   ├── face-camera.js     # billboard toward camera; option yOnly
│   │   ├── lazy-follow.js     # body-locked: smoothly follows head position/yaw with a dead zone (Stage 1 stretch)
│   │   ├── hover-highlight.js # mouseenter/mouseleave feedback
│   │   ├── toggle-hint.js     # click on object → show/hide target hint
│   │   ├── kettle-assistant.js# Start → boiling → ready state machine + steam
│   │   ├── recipe-steps.js    # Next/Done stepping
│   │   ├── debug-grid.js      # grid + axes gizmo
│   │   ├── position-label.js  # live world-position text under an entity
│   │   ├── event-log.js       # Stage 2 debug overlay
│   │   └── input-mode.js      # reads ?input=gaze and configures cursor/raycasters
│   └── utils/url-params.js    # tiny helper for ?debug / ?input
├── public/fonts/…             # local MSDF font
├── docs/
│   ├── EXERCISES.md           # all change cards, student-facing
│   └── INSTRUCTOR.md          # walkthrough script, pitfalls, timing, deviations from this spec
├── README.md
├── vite.config.js
└── package.json
```

### B.3 Code style for a teaching repo

- **Content and layout live in HTML attributes, behaviour lives in small components.** Students must be able to do every 🟢 card and most 🟡 cards by editing only `stage-*/index.html`.
- Hint cards are declared in HTML. A reader of `stage-2/index.html` should understand the whole scene without opening JS files. For example (illustrative, refine as needed):
  ```html
  <a-entity
    id="plant"
    class="interactive"
    hover-highlight
    toggle-hint="target: #plant-hint"
    position="0.7 0.9 -1.2"
  >
    <!-- pot + leaves primitives -->
    <a-entity
      id="plant-hint"
      hint-card="title: Plant; text: Water me in 2 days"
      face-camera
      position="0 0.35 0"
      visible="false"
    >
      <a-entity hint-button="label: ×; event: hint-close" position="…"></a-entity>
    </a-entity>
  </a-entity>
  ```
- Every component file starts with a short comment block: _what it does_, _which A-Frame concept it demonstrates_ (schema, `init`, `tick`, events, `remove`) and _how to use it in HTML_.
- Comment the HTML generously but briefly, especially camera rig height, units, local vs. world positions, and why the raycaster filters on `.interactive`.
- Avoid `tick` allocations (reuse `THREE.Vector3`s). Keep it simple but don't teach bad habits.
- Consistent naming: kebab-case component names, events named like `hint-close`, `kettle-start`.
- Add a `.prettierrc` and format everything. No linter setup needed.

### B.4 Input details and known pitfalls

- Raycasters (mouse cursor, both `laser-controls`, gaze cursor) all use `objects: .interactive`.
- **Hidden entities are still intersected.** When a hint hides, remove `.interactive` from its buttons (and add it back on show). Make sure all raycasters refresh their object lists: check whether `autoRefresh` catches class changes in A-Frame 1.8, and call `refreshObjects()` otherwise. Centralise this in `hint-card` (e.g. `show()` / `hide()` methods or `hint-show` / `hint-hide` events) so students never deal with it.
- Clicking a button inside a hint must not also trigger the parent object's `click` (the hint is a child of the object; watch for event bubbling).
- **Hands:** check whether A-Frame 1.8's `laser-controls` / `hand-tracking-controls` give ray-pointing + pinch-to-click out of the box. If yes, enable it. If it needs more than ~40 lines of custom code, leave hands out and document that in `INSTRUCTOR.md` (controllers are enough for the tutorial).
- `?input=gaze`: built-in `cursor` with `fuse: true` on the camera, a ring geometry cursor, and a fuse animation. In gaze mode, disable the mouse cursor and the laser rays.
- Desktop: WASD movement + look-controls. Mouse-drag to look must not make clicking unreliable; test it.
- `vr-mode-ui` / XR buttons: show both "VR" and "AR" where supported (Quest 3 passthrough).

### B.5 Getting it onto a Quest (document all three in README, in this order)

1. **Same Wi-Fi:** `npm run dev` → open the printed `https://<ip>:5173` in Quest Browser → _Advanced → Proceed_. Note in INSTRUCTOR.md that university Wi-Fi (e.g. eduroam) often blocks device-to-device traffic, so this may fail in the classroom.
2. **USB:** an `npm run quest:usb` script that runs `adb reverse tcp:5173 tcp:5173`, then open `https://localhost:5173` on the Quest. Document that the Quest needs developer mode and `adb` installed.
3. **Static deploy:** `npm run build` produces `dist/`, which can be hosted on any static host. Add an optional GitHub Actions workflow `.github/workflows/pages.yml` for GitHub Pages and explain in the README how to enable it. HTTPS comes for free there.

### B.6 Documentation to produce

- **README.md** (student-facing, short): what this is, `npm install`, `npm run dev`, where to find the stages, desktop controls, URL parameters (`?debug`, `?input=gaze`), the three ways to test on Quest, the Inspector tip ("changes are not saved"), project structure in 10 lines, and a link to `docs/EXERCISES.md`.
- **docs/EXERCISES.md:** every change card from Part A with ID, difficulty, estimated time, the task, a **"Where to look"** pointer (file + element id), and the reflection question. No solutions in this file.
- **docs/INSTRUCTOR.md:** a short walkthrough script per stage (≈ 5 bullet points each), a common-problems list (certificate warning, Wi-Fi isolation, Inspector not saving, cached page on Quest, port already in use), any deviations from this spec, and the solutions-branch info.
- Student-facing docs in **English**.

### B.7 Solutions branch

After `main` is finished and committed, create a branch `solutions` with **one commit per change card** (`P1: …`, `I3: …`), each applied on top of `main` independently where possible, or cumulatively if simpler (say which in INSTRUCTOR.md). This proves each card is doable in its time estimate. Keep `main` clean.

---

## Part C — Definition of done / verification

Do not report completion until all of these pass:

1. `npm install && npm run dev` works on a clean clone. `npm run build && npm run preview` works too, including both stage pages under `base: './'`.
2. **Automated smoke test** (`npm test`, using Playwright with headless Chromium and software WebGL) for the landing page and both stages:
   - no console errors, and no A-Frame warnings about unknown/unregistered components
   - no network requests to external hosts
   - Stage 1: all three hint cards exist and the head-locked card is a descendant of the camera
   - Stage 2: programmatically emit `click` on the plant → plant hint visible; emit `click` on its × → hidden; hidden buttons don't have `.interactive`; kettle Start → state reaches "ready" (use a short delay via a URL param or component property in the test); recipe Next steps through to Done
   - save a screenshot per page to `test-results/` and **look at them yourself** to check the layout reads well (objects on the counter, nothing floating oddly, text legible, nothing clipped).
3. Every 🟢 and 🟡 card is doable by editing only HTML (check against the solutions branch).
4. Code is formatted, every component has its header comment, and no file in `src/components/` exceeds ~80 lines without a good reason.
5. A git history on `main` with small, meaningful commits.

Finally, summarise what you built, any deviations from this spec, anything you couldn't verify (e.g. real-headset behaviour, hand tracking), and what I should test manually on a Quest.

## Out of scope

No TypeScript, no physics, no grabbing, no locomotion beyond WASD, no external 3D models, no audio, no backend, no real AI/LLM calls (the "assistant" is scripted on purpose).
