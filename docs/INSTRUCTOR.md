# Instructor notes

Timing: Stage 1 = 4 min walkthrough + 8 min hands-on. Stage 2 = 5 min + 10 min. About 27 min.

## Stage 1 walkthrough (~4 min)

- Units are metres, Y is up, user at the origin facing −Z. Show the grid and axes gizmo.
- Camera rig at y = 0, camera at y = 1.6 (desktop eye height; in VR the real head pose takes over).
- Three cards, three anchors: wall (world-locked, child of scene), plant (object-anchored, child of plant, _local_ position), message (head-locked, child of camera).
- Watch the position labels: the plant card's world position changes when the plant moves, its local `position` attribute does not.
- Open the Inspector (`Ctrl+Alt+I`), drag something, read the coordinates. **Inspector changes are not saved** — copy values into the HTML.
- Reflection: was this the right anchor for this content?

## Stage 2 walkthrough (~5 min)

- Where the raycaster lives: `cursor` + `raycaster="objects: .interactive"` on `<a-scene>`, and on each controller. Only `.interactive` entities are hit, so the ray needs a mesh (we use invisible hit boxes).
- Three events: `mouseenter`, `mouseleave`, `click`. Turn on `?debug=1` to watch them in the event log.
- Open `hover-highlight.js`: listeners added in `init`, removed in `remove`.
- Three patterns: plant (show/dismiss), kettle (assistant proposes, user confirms), recipe (step through). The mug is deliberately inert.
- `?input=gaze` changes the input device, not the interaction code. Mention Midas touch.

## Common problems

- **Certificate warning:** expected (self-signed). _Advanced → Proceed_.
- **Quest cannot reach the laptop:** eduroam and similar networks isolate clients. Use the USB route (`npm run quest:usb`) or a GitHub Pages deploy.
- **Inspector changes vanish on reload:** by design; copy values into the HTML.
- **Old page on Quest:** Quest Browser caches aggressively; reload with a changed query (`?v=2`).
- **Port 5173 in use:** Vite picks the next port; use the URL it prints (the USB script assumes 5173, stop the other process).
- **Text looks fuzzy/boxy:** MSDF text is blurry at small sizes in low-res or software-rendered screenshots; make cards larger rather than smaller.

## Deviations from the spec

- **Font glyphs:** the bundled Roboto MSDF font has no `×`, `·` or `✓`. The close button is a plain `X`, the kettle's ready text is "Water is ready!".
- **Text `negate: false`:** needed for the CDN-supplied font atlas with this A-Frame version; centralised in `TEXT_BASE` (`src/utils/url-params.js`).
- **Hit boxes:** a raycaster only hits entities that own a mesh, so interactive objects contain an invisible `a-box.interactive`. Events bubble from it to the object.
- **Raycaster refresh:** A-Frame 1.8's `autoRefresh` already observes class changes; `hint-card` still calls `refreshObjects()` for determinism.
- **Hands:** `laser-controls` in 1.8 has no hand-tracking support, and adding pinch-pointing needs more than ~40 lines, so hands are left out (controllers suffice).
- **Controller models** are fetched from `cdn.aframe.io` by A-Frame, but only when a real controller connects in a headset. Desktop pages make no external requests (tested). The Inspector also loads from the CDN when opened.
- **Kettle delay** is the `delay` property of `kettle-assistant` (no URL param); the test sets it directly.
- `hint-card.js` is ~95 lines, slightly over the ~80 target because it builds the whole card.
- `aframe-kitchen-assistant-prompt.md` (the original brief) stays in the repo root.

## Solutions branch

Branch `solutions` has one commit per card (`P1: …` … `I7: …`). The commits are **cumulative** (each on top of the previous), applied in card order. Compare with `git diff main solutions -- stage-1 stage-2`, or `git show <commit>` for a single card. Every 🟢/🟡 card only edits the stage HTML; P3's, I3's and I5's solutions needed no JS either (I3/I5 use a small inline listener script, see the commits).
