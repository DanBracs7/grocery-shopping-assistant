// hover-highlight — hover feedback: a subtle emissive tint and a 5% scale-up.
//
// Concepts: listening to mouseenter / mouseleave in init and removing the listeners in
// remove(). These two events are emitted by the cursor/raycaster for mouse, controllers
// and gaze alike — so this works for every input device.
//
// Use:  <a-entity class="interactive" hover-highlight="color: #ffcc66; scale: 1.05"></a-entity>
// The entity needs an `.interactive` child (e.g. an invisible hit box) for the ray to hit.
const THREE = AFRAME.THREE;

AFRAME.registerComponent('hover-highlight', {
  schema: {
    color: { type: 'color', default: '#ffd27a' },
    scale: { default: 1.05 },
  },

  init() {
    this.base = new THREE.Vector3();
    this.saved = new Map(); // material -> original emissive colour
    this.onEnter = (evt) => {
      if (evt.target.closest('[hint-card]')) return; // hovering a hint button is not hovering us
      this.base.copy(this.el.object3D.scale);
      this.el.object3D.scale.multiplyScalar(this.data.scale);
      this.el.object3D.traverse((o) => {
        const m = o.material;
        if (m && m.emissive && !o.parent?.el?.hasAttribute?.('hint-card')) {
          this.saved.set(m, m.emissive.clone());
          m.emissive.set(this.data.color).multiplyScalar(0.35);
        }
      });
    };
    this.onLeave = (evt) => {
      if (evt.target.closest('[hint-card]') || !this.saved.size) return;
      this.el.object3D.scale.copy(this.base);
      this.saved.forEach((color, m) => m.emissive.copy(color));
      this.saved.clear();
    };
    this.el.addEventListener('mouseenter', this.onEnter);
    this.el.addEventListener('mouseleave', this.onLeave);
  },

  remove() {
    this.el.removeEventListener('mouseenter', this.onEnter);
    this.el.removeEventListener('mouseleave', this.onLeave);
  },
});
