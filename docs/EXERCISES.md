# Change cards

🟢 HTML only, ~2–4 min · 🟡 HTML, needs thinking, ~5 min · 🔴 stretch, may touch JS.
Commit after each card: `git commit -am "P3: anchor timer to kettle"`. Remember: Inspector changes are not saved, copy values into the HTML.

## Stage 1 — Positioning (`stage-1/index.html`)

### 🟢 P1 Move the mug
Move the mug to the other end of the counter. _Which axis did you change? Why didn't y change?_
**Where to look:** `#mug`, its `position`.

### 🟢 P2 Resize the timer card
Make the timer card 1.5× bigger using `scale`. Then undo it and try changing its `width` (and `height`) instead. _What's the difference?_
**Where to look:** `#timer-card`.

### 🟡 P3 Re-anchor the timer to the kettle
Move the timer entity _inside_ the kettle entity and fix its position, which is now **local**. _Why did it jump when you moved it?_
**Where to look:** `#timer-card` and `#kettle`.

### 🟡 P4 Find a comfortable head-locked distance
Try z = −0.3, −0.8 and −2.0, and move the card below the eye line. Write down what felt wrong at each.
**Where to look:** `#message-card`, its `position`.

### 🟡 P5 Add a new object
Add a toaster built from boxes that sits _exactly_ on the counter. Hint: y = counter top + half the object's height.
**Where to look:** next to `#mug`; counter top is at y = 0.9.

### 🔴 P6 Make the timer face the user
Add the `face-camera` component to the timer. Then make it rotate only around Y (`yOnly`). _Why might full billboarding feel odd?_
**Where to look:** `#timer-card`, `src/components/face-camera.js`.

### 🔴 P7 Body-locked
Replace the head-locked message with `lazy-follow` (move it out of the camera, make it a direct child of the scene) and tune `distance`, `deadZone`, `speed`. _How does it compare to head-locked while walking around (WASD)?_
**Where to look:** `#message-card`, `src/components/lazy-follow.js`.

## Stage 2 — Interaction (`stage-2/index.html`)

### 🟢 I1 Change the hover feedback
Use a different colour or a stronger scale.
**Where to look:** the `hover-highlight` attribute on `#plant`.

### 🟢 I2 Rewrite the plant's hint
Write a title and text that your own project's assistant might say.
**Where to look:** `#plant-hint`, its `hint-card` attribute.

### 🟡 I3 Show the plant hint on hover
Make it appear on hover instead of click. Then try `?input=gaze`. _What goes wrong? (Midas touch)_
**Where to look:** `src/components/toggle-hint.js` — which event does it listen to? (Or write the listener yourself.)

### 🟡 I4 Make the mug interactive
Give it its own show/dismiss hint by copying the plant's pattern (hit box, `hover-highlight`, `toggle-hint`, hint with × button).
**Where to look:** `#mug` and `#plant`.

### 🟡 I5 Auto-dismiss
Make the plant hint disappear on its own after 5 s. _When would that be good or bad UX?_
**Where to look:** `toggle-hint`, and the `hint-show` event that `hint-card` emits.

### 🔴 I6 "Remind me later"
Add a second button to the plant hint that hides it and brings it back after 10 s.
**Where to look:** `#plant-hint` (new `hint-button` with its own `event`), `src/components/hint-button.js`.

### 🔴 I7 Only one hint at a time
Opening a hint closes any other open hint.
**Where to look:** `hint-show` / `hint-hide` events in `src/components/hint-card.js`.
