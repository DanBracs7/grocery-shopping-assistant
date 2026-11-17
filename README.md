# A-Frame Example App for HCI Intro

This small A-Frame app has two scenes: one demonstrates the fundamentals of 3D positioning, and the other introduces basic interactions.
It uses JavaScript, [A-Frame](https://aframe.io) 1.8, and [Vite](https://vite.dev).

Vite provides a development server with HTTPS for WebXR.

## Run it

Clone the repository:

```bash
git clone https://github.com/HCI-TUB/hci-intro-a-frame.git
cd hci-intro-a-frame
```

Alternatively, clone it with your preferred Git GUI. From a terminal in the repository folder, run:

```bash
npm install
npm run dev
```

Open the printed `https://localhost:5173` URL and accept the certificate warning. The landing page links to both scenes.

**Desktop controls:** WASD to walk, drag the mouse to look, click to interact (Stage 2).

## URL parameters

| Parameter      | Effect                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| `?debug=1`/`0` | Debug helpers on/off (grid, axes, position labels in Stage 1; event log in Stage 2) |
| `?input=gaze`  | Stage 2: head-gaze ring with 1.2 s dwell selection instead of mouse / controllers   |

## Try it on a Meta Quest

1. **Same Wi-Fi:** `npm run dev`, open the printed `https://<laptop-ip>:5173` in Quest Browser, then _Advanced → Proceed_. (University Wi-Fi often blocks this.)
2. **USB:** enable developer mode on the Quest, install `adb`, plug in, run `npm run quest:usb`, then open `https://localhost:5173` on the Quest.
3. **Static deploy:** `npm run build` creates `dist/`, which works on any static host. `.github/workflows/pages.yml` publishes it to GitHub Pages: enable _Settings → Pages → Source: GitHub Actions_, push to `main`, open the URL it prints. HTTPS comes for free.

In the headset use the **VR** or **AR** (passthrough, Quest 3) button at the bottom right. Controllers: trigger = click, **left thumbstick = walk**. The AR button only appears on devices that support passthrough AR (Quest 3/3S; in the Immersive Web Emulator choose a Quest 3 device profile).

## A-Frame inspector

Press `Ctrl+Alt+I` to open the A-Frame Inspector, drag things around and read off coordinates. **Inspector changes are not saved** — copy the values into your HTML. Vite reloads on save.

## Working with this

[The exercise ideas](docs/EXERCISES.md) offer starting points for modifying this sample.

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
