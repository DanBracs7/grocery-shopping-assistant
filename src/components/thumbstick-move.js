// thumbstick-move — walk around with the left Quest thumbstick (the VR counterpart of WASD).
//
// Concepts: listening to a controller's `thumbstickmoved` event, `tick(time, dt)` with
// frame-rate independent movement, moving the rig (not the camera) so VR head tracking keeps working.
//
// Use (on the camera rig):  <a-entity id="rig" thumbstick-move="hand: #left-hand"> …
const THREE = AFRAME.THREE;

AFRAME.registerComponent('thumbstick-move', {
  schema: {
    hand: { type: 'selector' }, // the controller entity that emits thumbstickmoved
    speed: { default: 1.5 }, // metres per second
    deadZone: { default: 0.15 }, // ignore tiny stick drift
  },

  init() {
    this.stick = { x: 0, y: 0 };
    this.forward = new THREE.Vector3(); // reused every frame
    this.right = new THREE.Vector3();
    this.onMove = (evt) => (this.stick = { x: evt.detail.x, y: evt.detail.y });
    this.data.hand.addEventListener('thumbstickmoved', this.onMove);
  },

  tick(time, dt) {
    const { x, y } = this.stick;
    if (Math.hypot(x, y) < this.data.deadZone || !this.el.sceneEl.camera) return;
    // "Forward" is where the head looks, flattened onto the floor.
    this.el.sceneEl.camera.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();
    this.right.crossVectors(this.forward, THREE.Object3D.DEFAULT_UP);
    const step = (this.data.speed * dt) / 1000;
    // Pushing the stick forward gives y < 0.
    this.el.object3D.position.addScaledVector(this.forward, -y * step);
    this.el.object3D.position.addScaledVector(this.right, x * step);
  },

  remove() {
    this.data.hand.removeEventListener('thumbstickmoved', this.onMove);
  },
});
