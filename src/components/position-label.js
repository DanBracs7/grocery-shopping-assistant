// position-label — live text under an entity showing its WORLD position, rounded to cm.
// Students see that a child's world position changes when its parent moves, even though its
// local `position` attribute does not.
//
// Concepts: getWorldPosition vs. the local `position` attribute, tick with a cheap change check.
// Use:  <a-entity id="mug" position-label="offsetY: -0.08">…</a-entity>   (hidden by ?debug=0)
import { isDebug, TEXT_BASE } from '../utils/url-params.js';

const THREE = AFRAME.THREE;

AFRAME.registerComponent('position-label', {
  schema: {
    offsetY: { default: -0.1 }, // local metres below the entity's origin
    offsetZ: { default: 0.1 }, // push it towards the viewer so it isn't hidden inside the object
    width: { default: 0.5 },
    color: { default: '#ffe9a8' },
  },

  init() {
    this.enabled = isDebug();
    if (!this.enabled) return;
    this.world = new THREE.Vector3(); // reused every frame
    this.last = '';
    this.label = document.createElement('a-entity');
    this.label.setAttribute('position', `0 ${this.data.offsetY} ${this.data.offsetZ}`);
    this.el.appendChild(this.label);
  },

  tick() {
    if (!this.enabled) return;
    this.el.object3D.getWorldPosition(this.world);
    const cm = (v) => (Math.round(v * 100) / 100).toFixed(2);
    const value = `x ${cm(this.world.x)}  y ${cm(this.world.y)}  z ${cm(this.world.z)}`;
    if (value === this.last) return; // only touch the text when it changed
    this.last = value;
    this.label.setAttribute('text', {
      value,
      ...TEXT_BASE,
      color: this.data.color,
      align: 'center',
      width: this.data.width,
      wrapCount: 30,
    });
  },
});
