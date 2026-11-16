// event-log — debug overlay: shows the last few events (mouseenter, click, hint-close ...)
// so students can SEE that events fire. Also prints them to the browser console.
//
// Concepts: events bubble up the DOM, so one listener on the <a-scene> hears everything.
// Use:  <a-entity event-log="lines: 6" position="1.4 1.2 -1.59"></a-entity>   (only with ?debug=1)
import { isDebug, TEXT_BASE } from '../utils/url-params.js';

AFRAME.registerComponent('event-log', {
  schema: {
    lines: { default: 6 },
    events: {
      default: ['mouseenter', 'mouseleave', 'click', 'hint-close', 'kettle-start', 'recipe-next'],
      type: 'array',
    },
  },

  init() {
    if (!isDebug()) return;
    this.entries = [];
    this.el.setAttribute('visible', true);
    const bg = document.createElement('a-plane');
    bg.setAttribute('width', 0.9);
    bg.setAttribute('height', 0.4);
    bg.setAttribute('material', 'shader: flat; color: #14181f; opacity: 0.85; transparent: true');
    bg.setAttribute('position', '0.4 -0.17 -0.001');
    this.el.appendChild(bg);
    this.text = document.createElement('a-entity');
    this.el.appendChild(this.text);
    this.onEvent = (evt) => {
      const target = evt.target.closest('[id]');
      this.entries.push(`${evt.type} -> ${target ? target.id : evt.target.tagName.toLowerCase()}`);
      this.entries = this.entries.slice(-this.data.lines);
      console.log('[event]', this.entries[this.entries.length - 1]);
      this.text.setAttribute('text', {
        value: 'EVENT LOG\n' + this.entries.join('\n'),
        ...TEXT_BASE,
        color: '#8fe3a5',
        anchor: 'left',
        baseline: 'top',
        width: 0.8,
        wrapCount: 40,
      });
    };
    this.data.events.forEach((name) => this.el.sceneEl.addEventListener(name, this.onEvent));
  },

  remove() {
    this.data.events.forEach((name) => this.el.sceneEl.removeEventListener(name, this.onEvent));
  },
});
