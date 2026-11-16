// input-mode — picks the input device without touching any interaction code.
//   default       : mouse cursor on desktop + laser controllers in VR  (set up in the HTML)
//   ?input=gaze   : head-gaze ring with dwell selection; mouse and lasers are switched off
//
// Concepts: every device ends up as the same `mouseenter` / `mouseleave` / `click` events,
// so hover-highlight, toggle-hint, hint-button ... work unchanged. Put it on <a-scene>.
import { param } from '../utils/url-params.js';

AFRAME.registerComponent('input-mode', {
  init() {
    this.gaze = param('input') === 'gaze';
    const scene = this.el;
    const setup = () => {
      if (!this.gaze) return;
      scene.removeAttribute('cursor'); // no mouse
      scene.querySelectorAll('[laser-controls]').forEach((hand) => hand.remove()); // no lasers
      const gaze = document.createElement('a-entity');
      gaze.setAttribute('gaze-cursor', '');
      scene.querySelector('[camera]').appendChild(gaze); // child of the camera = head-locked
    };
    scene.hasLoaded ? setup() : scene.addEventListener('loaded', setup);
  },
});
