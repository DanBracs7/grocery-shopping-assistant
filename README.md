# Kitchen Assistant — A-Frame tutorial

A small kitchen counter seen "through smart glasses". The assistant never appears as a character, only as **hint cards**. Two stages, one scene:

1. **Positioning** — _where does the assistant's information live?_ (world-locked, object-anchored, head-locked)
2. **Interaction** — _how do I summon, act on and dismiss it?_ (hover, click, confirm, step through)

Plain JavaScript, [A-Frame](https://aframe.io) 1.8 and [Vite](https://vite.dev). No framework.

## Run it

```bash
npm install
npm run dev
```

Open the printed `https://localhost:5173` (accept the certificate warning). Start at the landing page, or go directly to `/stage-1/` or `/stage-2/`.

**Desktop controls:** WASD to walk, drag the mouse to look, click to interact (Stage 2).

## URL parameters

| Parameter       | Effect                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| `?debug=1`/`0`  | Debug helpers on/off (grid, axes, position labels in Stage 1; event log in Stage 2)     |
| `?input=gaze`   | Stage 2: head-gaze ring with 1.2 s dwell selection instead of mouse / controllers       |

## Try it on a Meta Quest (3 ways)

1. **Same Wi-Fi:** `npm run dev`, open the printed `https://<laptop-ip>:5173` in Quest Browser, then _Advanced → Proceed_. (University Wi-Fi often blocks this.)
2. **USB:** enable developer mode on the Quest, install `adb`, plug in, run `npm run quest:usb`, then open `https://localhost:5173` on the Quest.
3. **Static deploy:** `npm run build` creates `dist/`, which works on any static host. `.github/workflows/pages.yml` publishes it to GitHub Pages: enable _Settings → Pages → Source: GitHub Actions_, push to `main`, open the URL it prints. HTTPS comes for free.

In the headset use the **VR** or **AR** (passthrough, Quest 3) button at the bottom right. Controllers: trigger = click.

## Inspector tip

Press `Ctrl+Alt+I` to open the A-Frame Inspector, drag things around and read off coordinates. **Inspector changes are not saved** — copy the values into `index.html`. Vite reloads on save.

## Your tasks

Make one small change per stage from the cards in [docs/EXERCISES.md](docs/EXERCISES.md). Commit after each card, e.g. `git commit -am "P3: anchor timer to kettle"`.

## Project structure

```
index.html            landing page
stage-1/index.html    positioning scene (all layout is HTML attributes)
stage-2/index.html    interaction scene
src/stage-*.js        entry points: import 'aframe', then components
src/components/       one small, commented component per file
src/utils/            URL params, helpers
public/fonts/         local text font (no CDN needed)
docs/                 EXERCISES.md (students), INSTRUCTOR.md
tests/                Playwright smoke tests (npm test)
```
