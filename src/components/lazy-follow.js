// lazy-follow — "body-locked" anchoring. The entity stays at a fixed distance from the
// head, but only turns around you when you look far enough away (the dead zone).
//
// Concepts: tick(time, dt), angles (yaw), smoothing, why it must be a child of <a-scene>
// (it writes *world* positions).
//
// Use:  <a-entity hint-card lazy-follow="distance: 0.8; deadZone: 25; speed: 3"></a-entity>
const THREE = AFRAME.THREE;

AFRAME.registerComponent('lazy-follow', {
  schema: {
    distance: { default: 0.8 }, // metres in front of the head
    height: { default: -0.15 }, // metres relative to eye height
    deadZone: { default: 25 }, // degrees you may look away before the card follows
    speed: { default: 3 }, // higher = catches up faster
  },

  init() {
    this.head = new THREE.Vector3();
    this.dir = new THREE.Vector3();
    this.yaw = null; // direction of the card around the user, in radians
  },

  tick(time, dt) {
    const camera = this.el.sceneEl.camera;
    if (!camera) return;
    camera.getWorldPosition(this.head);
    camera.getWorldDirection(this.dir);
    if (Math.hypot(this.dir.x, this.dir.z) < 0.2) return; // looking straight up/down: yaw is undefined

    const headYaw = Math.atan2(this.dir.x, this.dir.z);
    if (this.yaw === null) this.yaw = headYaw;

    // Shortest signed angle from the card to where the head looks, wrapped to -PI..PI.
    let diff = headYaw - this.yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    const limit = THREE.MathUtils.degToRad(this.data.deadZone);
    const excess = Math.abs(diff) - limit;
    if (excess > 0) {
      const k = Math.min(1, (this.data.speed * dt) / 1000);
      this.yaw += Math.sign(diff) * excess * k;
    }

    const { distance, height } = this.data;
    this.el.object3D.position.set(
      this.head.x + Math.sin(this.yaw) * distance,
      this.head.y + height,
      this.head.z + Math.cos(this.yaw) * distance,
    );
    this.el.object3D.lookAt(this.head.x, this.head.y + height, this.head.z);
  },
});
