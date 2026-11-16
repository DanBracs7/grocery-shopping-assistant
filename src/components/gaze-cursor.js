// gaze-cursor — a ring in the centre of the view that "fills up" while you look at something
// interactive for ~1.2 s, then clicks (dwell / fuse selection). A stand-in for glasses gaze input.
//
// Concepts: the built-in `cursor` component with fuse, the `fusing` event, driving a visual
// from a tick. Created for you by input-mode when the URL has ?input=gaze.
const THREE = AFRAME.THREE;

AFRAME.registerComponent('gaze-cursor', {
  schema: { fuseTimeout: { default: 1200 } }, // ms

  init() {
    const el = this.el;
    el.setAttribute('cursor', { fuse: true, fuseTimeout: this.data.fuseTimeout });
    el.setAttribute('raycaster', { objects: '.interactive', far: 10 });
    el.setAttribute('position', '0 0 -1');
    el.setAttribute('geometry', 'primitive: ring; radiusInner: 0.012; radiusOuter: 0.016');
    el.setAttribute(
      'material',
      'shader: flat; color: #fff; depthTest: false; opacity: 0.9; transparent: true',
    );
    el.object3D.renderOrder = 999;
    this.fill = document.createElement('a-circle');
    this.fill.setAttribute('radius', 0.012);
    this.fill.setAttribute(
      'material',
      'shader: flat; color: #7fd1ff; depthTest: false; opacity: 0.8; transparent: true',
    );
    this.fill.object3D.scale.setScalar(0.001);
    el.appendChild(this.fill);
    this.start = null; // time the dwell started
    this.onFusing = () => (this.start = performance.now());
    this.onStop = () => (this.start = null);
    el.addEventListener('fusing', this.onFusing);
    el.addEventListener('mouseleave', this.onStop);
    el.addEventListener('click', this.onStop);
  },

  tick() {
    const t = this.start === null ? 0 : (performance.now() - this.start) / this.data.fuseTimeout;
    this.fill.object3D.scale.setScalar(Math.max(0.001, Math.min(1, t)));
  },
});
