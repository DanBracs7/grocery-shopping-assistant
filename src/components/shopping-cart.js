// shopping-cart + cart-follow — a supermarket trolley that rolls along in front of the user.
//
// shopping-cart: builds the trolley from simple shapes (basket, frame, handle, wheels) and
//   offers slot(i): a point inside the basket (local coordinates) where a product can be put.
// cart-follow: every frame, places the trolley on the floor in front of the user's head.
//   It only turns with you when you look far enough to the side (dead zone), like lazy-follow,
//   so looking at a shelf does not swing the trolley around. It writes WORLD positions, so the
//   entity must be a direct child of <a-scene>.
//
// Use:  <a-entity id="cart" shopping-cart cart-follow="distance: 0.85; deadZone: 35"></a-entity>
// Local axes of the trolley: the handle is on +Z (towards the user), the front points to -Z.
const THREE = AFRAME.THREE;

AFRAME.registerComponent('shopping-cart', {
  init() {
    const metal = 'color: #9aa3b0; metalness: 0.4; roughness: 0.5';
    const box = (w, h, d, pos, material = metal) => this.add('a-box', { width: w, height: h, depth: d, position: pos, material });

    // Basket: translucent sides + solid thin edges, bottom at 0.55 m, top at 0.9 m.
    const glass = 'color: #c9d2de; opacity: 0.35; transparent: true; side: double';
    box(0.5, 0.01, 0.7, '0 0.55 0', glass); // bottom
    box(0.5, 0.35, 0.01, '0 0.725 -0.35', glass); // front
    box(0.5, 0.35, 0.01, '0 0.725 0.35', glass); // back (towards the user)
    box(0.01, 0.35, 0.7, '-0.25 0.725 0', glass); // left
    box(0.01, 0.35, 0.7, '0.25 0.725 0', glass); // right
    // Top rim
    box(0.52, 0.02, 0.02, '0 0.9 -0.35');
    box(0.52, 0.02, 0.02, '0 0.9 0.35');
    box(0.02, 0.02, 0.72, '-0.26 0.9 0');
    box(0.02, 0.02, 0.72, '0.26 0.9 0');

    // Legs and lower frame
    [[-0.22, -0.3], [0.22, -0.3], [-0.22, 0.3], [0.22, 0.3]].forEach(([x, z]) => {
      box(0.02, 0.5, 0.02, `${x} 0.3 ${z}`);
      this.add('a-cylinder', { radius: 0.04, height: 0.03, position: `${x} 0.04 ${z}`, rotation: '0 0 90', color: '#2b2f36' });
    });
    box(0.46, 0.02, 0.62, '0 0.12 0', 'color: #9aa3b0; opacity: 0.6; transparent: true');

    // Handle (towards the user) with a coloured grip
    box(0.02, 0.15, 0.02, '-0.24 0.97 0.4');
    box(0.02, 0.15, 0.02, '0.24 0.97 0.4');
    this.add('a-cylinder', { radius: 0.02, height: 0.52, position: '0 1.04 0.42', rotation: '0 0 90', color: '#2f8cff' });
  },

  add(tag, attrs) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    this.el.appendChild(el);
    return el;
  },

  // A free spot in the basket for the i-th product (local coordinates of the trolley).
  slot(i) {
    const col = i % 3;
    const row = Math.floor(i / 3) % 3;
    return new THREE.Vector3(-0.14 + col * 0.14, 0.56, -0.18 + row * 0.18);
  },
});

AFRAME.registerComponent('cart-follow', {
  schema: {
    distance: { default: 0.85 }, // metres in front of the head (on the floor)
    deadZone: { default: 35 }, // degrees you may look away before the trolley turns
    speed: { default: 4 }, // higher = catches up faster
  },

  init() {
    this.head = new THREE.Vector3();
    this.dir = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.yaw = null; // direction of the trolley around the user, in radians
  },

  tick(time, dt) {
    const camera = this.el.sceneEl.camera;
    if (!camera || !dt) return;
    camera.getWorldPosition(this.head);
    camera.getWorldDirection(this.dir);
    if (Math.hypot(this.dir.x, this.dir.z) < 0.2) return; // looking straight up/down

    const headYaw = Math.atan2(this.dir.x, this.dir.z);
    if (this.yaw === null) this.yaw = headYaw;
    let diff = headYaw - this.yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    const excess = Math.abs(diff) - THREE.MathUtils.degToRad(this.data.deadZone);
    const k = Math.min(1, (this.data.speed * dt) / 1000);
    if (excess > 0) this.yaw += Math.sign(diff) * excess * k;

    // Target spot on the floor in front of the user; glide there smoothly.
    const d = this.data.distance;
    this.target.set(this.head.x + Math.sin(this.yaw) * d, 0, this.head.z + Math.cos(this.yaw) * d);
    const first = this.placed !== true;
    this.el.object3D.position.lerp(this.target, first ? 1 : k * 2);
    this.placed = true;
    // Front (-Z) points away from the user, the handle (+Z) towards the user.
    this.el.object3D.rotation.set(0, this.yaw + Math.PI, 0);
  },
});
