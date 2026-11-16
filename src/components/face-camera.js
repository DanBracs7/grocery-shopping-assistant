// face-camera — billboard: turns the entity so it always looks at the user's head.
//
// Concepts: `tick` (runs every frame), reusing THREE.Vector3 objects (no allocations in tick),
// local vs. world space (lookAt takes a *world* position, even for child entities).
//
// Use:  <a-entity hint-card face-camera></a-entity>
//       <a-entity hint-card face-camera="yOnly: true"></a-entity>   (only turn around the Y axis)
const THREE = AFRAME.THREE;

AFRAME.registerComponent('face-camera', {
  schema: { yOnly: { default: false } },

  init() {
    this.target = new THREE.Vector3(); // reused every frame
    this.own = new THREE.Vector3();
  },

  tick() {
    const camera = this.el.sceneEl.camera;
    if (!camera) return;
    camera.getWorldPosition(this.target);
    if (this.data.yOnly) {
      this.el.object3D.getWorldPosition(this.own);
      this.target.y = this.own.y; // look at a point at the same height: no tilting
    }
    this.el.object3D.lookAt(this.target);
  },
});
