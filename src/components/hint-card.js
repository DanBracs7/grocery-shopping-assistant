// hint-card — the assistant's only "face": a small floating panel.
//
// Concepts: component schema, init/update, building child entities from code,
// public methods (show / hide) and events (hint-show, hint-hide).
//
// Use:  <a-entity hint-card="title: Plant; text: Water me in 2 days; tag: object-anchored;
//                            accent: #5fd38d; width: 0.5; height: 0.2"></a-entity>
// Buttons are added by you as children: <a-entity hint-button="..."></a-entity>
// Control it from JS: el.components['hint-card'].show() / .hide()
import { TEXT_BASE } from '../utils/url-params.js';
import { roundedRect } from '../utils/rounded-rect.js';

const THREE = AFRAME.THREE;

// Hidden entities are still hit by raycasters, so a hidden card must also stop its buttons
// being `.interactive`. We do that here so nobody else has to think about it.
export function refreshRaycasters(scene) {
  scene.querySelectorAll('[raycaster]').forEach((el) => el.components.raycaster?.refreshObjects());
  scene.components.raycaster?.refreshObjects();
}

AFRAME.registerComponent('hint-card', {
  schema: {
    title: { default: 'Hint' },
    text: { default: '' },
    tag: { default: '' }, // small label, e.g. the anchoring mode
    accent: { type: 'color', default: '#4da3ff' }, // stripe on the left edge
    width: { default: 0.5 }, // metres
    height: { default: 0.18 },
  },

  init() {
    const { width: w, height: h } = this.data;

    // Dark translucent rounded panel (a plain three.js mesh attached to this entity).
    const panel = new THREE.Mesh(
      roundedRect(w, h, 0.02),
      new THREE.MeshBasicMaterial({ color: '#14181f', transparent: true, opacity: 0.85 }),
    );
    this.el.setObject3D('panel', panel);

    // Coloured accent stripe + three text labels, built as small child entities.
    this.stripe = this.addChild({
      geometry: `primitive: plane; width: 0.014; height: ${h - 0.03}`,
    });
    this.stripe.setAttribute('position', `${-w / 2 + 0.012} 0 0.001`);
    this.title = this.addText(
      { color: '#fff', width: w * 1.0, wrapCount: 22 },
      -w / 2 + 0.04,
      h / 2 - 0.03,
    );
    this.body = this.addText(
      { color: '#d6dbe4', width: w * 0.9, wrapCount: 30 },
      -w / 2 + 0.04,
      h / 2 - 0.08,
    );
    this.tagEl = this.addText(
      { color: '#fff', width: w * 0.6, wrapCount: 24, align: 'right' },
      w / 2 - 0.03,
      h / 2 - 0.03,
      'right',
    );

    this.visibleNow = this.el.getAttribute('visible') !== false;
    this.el.addEventListener('hint-close', () => this.hide()); // emitted by × buttons
    this.syncButtons();
  },

  update() {
    const d = this.data;
    this.stripe.setAttribute('material', { shader: 'flat', color: d.accent });
    this.title.setAttribute('text', 'value', d.title);
    this.body.setAttribute('text', 'value', d.text);
    this.tagEl.setAttribute('text', { value: d.tag.toUpperCase(), color: d.accent });
  },

  addChild(attrs) {
    const child = document.createElement('a-entity');
    Object.entries(attrs).forEach(([k, v]) => child.setAttribute(k, v));
    this.el.appendChild(child);
    return child;
  },

  addText(opts, x, y, anchor = 'left') {
    const text = { ...TEXT_BASE, baseline: 'top', anchor, align: 'left', ...opts };
    const child = this.addChild({ text });
    child.setAttribute('position', `${x} ${y} 0.002`);
    return child;
  },

  show() {
    this.visibleNow = true;
    this.el.setAttribute('visible', true);
    this.syncButtons();
    this.el.emit('hint-show');
  },

  hide() {
    this.visibleNow = false;
    this.el.setAttribute('visible', false);
    this.syncButtons();
    this.el.emit('hint-hide');
  },

  toggle() {
    this.visibleNow ? this.hide() : this.show();
  },

  // Buttons are only clickable while the card is visible.
  syncButtons() {
    this.el.querySelectorAll('[hint-button]').forEach((b) => b.components['hint-button']?.sync());
    refreshRaycasters(this.el.sceneEl);
  },
});
