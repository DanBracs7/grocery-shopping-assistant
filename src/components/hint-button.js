// hint-button — a big, clickable button that lives inside a hint-card.
//
// Concepts: events (mouseenter / mouseleave / click), emitting your own named event,
// the `.interactive` class that raycasters filter on.
//
// Use:  <a-entity hint-button="label: Start; event: kettle-start" position="0.2 -0.1 0.01"></a-entity>
// Clicking emits the named event, which bubbles up through the hint to its object.
// Keep buttons at least ~0.06 m tall so they are easy to hit with a controller ray.
import { TEXT_BASE } from '../utils/url-params.js';
import { refreshRaycasters } from './hint-card.js';

const THREE = AFRAME.THREE;

AFRAME.registerComponent('hint-button', {
  schema: {
    label: { default: 'OK' },
    event: { default: 'hint-close' },
    width: { default: 0.2 },
    height: { default: 0.07 },
    color: { type: 'color', default: '#3b4658' },
    hoverColor: { type: 'color', default: '#6f87ad' },
  },

  init() {
    const { width, height } = this.data;
    this.enabled = true; // can be switched off with setEnabled(false), e.g. after "Start"
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: this.data.color }),
    );
    this.el.setObject3D('mesh', this.mesh);
    this.labelEl = document.createElement('a-entity');
    this.labelEl.setAttribute('position', '0 0 0.002');
    this.el.appendChild(this.labelEl);

    this.onEnter = (evt) =>
      this.mesh.material.color.set(evt.target === this.el ? this.data.hoverColor : this.data.color);
    this.onLeave = () => this.mesh.material.color.set(this.data.color);
    this.onClick = (evt) => {
      evt.stopPropagation(); // don't let the click also reach the object behind the hint
      this.el.emit(this.data.event);
    };
    this.el.addEventListener('mouseenter', this.onEnter);
    this.el.addEventListener('mouseleave', this.onLeave);
    this.el.addEventListener('click', this.onClick);
  },

  update() {
    this.mesh.material.color.set(this.data.color);
    this.labelEl.setAttribute('text', {
      value: this.data.label,
      ...TEXT_BASE,
      align: 'center',
      anchor: 'center',
      width: this.data.height * 5,
      wrapCount: 14,
      color: '#fff',
    });
  },

  setEnabled(on) {
    this.enabled = on;
    this.sync();
  },

  // Interactive only while the button is enabled AND its hint card is visible.
  sync() {
    const card = this.el.closest('[hint-card]');
    const shown = !card || card.components['hint-card']?.visibleNow !== false;
    this.el.setAttribute('visible', this.enabled);
    this.el.classList.toggle('interactive', this.enabled && shown);
    refreshRaycasters(this.el.sceneEl);
  },

  remove() {
    this.el.removeEventListener('mouseenter', this.onEnter);
    this.el.removeEventListener('mouseleave', this.onLeave);
    this.el.removeEventListener('click', this.onClick);
  },
});
