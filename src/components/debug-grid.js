// debug-grid — floor grid (1 m lines), a fine 10 cm grid on the counter top, and an axes
// gizmo at the origin: X red, Y green, Z blue. Helps students read off coordinates.
//
// Concepts: using plain three.js helpers inside a component (setObject3D), url parameters.
// Use:  <a-entity debug-grid="counterTop: 0.9; counterCenter: 0 -1.2; counterSize: 2 0.6"></a-entity>
// Switch off with ?debug=0 (see utils/url-params.js).
import { isDebug, TEXT_BASE } from '../utils/url-params.js';

const THREE = AFRAME.THREE;

AFRAME.registerComponent('debug-grid', {
  schema: {
    floorSize: { default: 6 },
    counterTop: { default: 0.9 },
    counterCenter: { type: 'vec2', default: { x: 0, y: -1.2 } },
    counterSize: { type: 'vec2', default: { x: 2, y: 0.6 } },
  },

  init() {
    if (!isDebug()) return;
    const d = this.data;
    const root = new THREE.Group();

    const floor = new THREE.GridHelper(d.floorSize, d.floorSize, '#ffffff', '#ffffff');
    floor.position.y = 0.002;
    floor.material.opacity = 0.4;
    floor.material.transparent = true;

    // 10 cm grid on the counter: GridHelper is square, so squash it to the counter's size.
    const fine = new THREE.GridHelper(1, 10, '#ffffff', '#ffffff');
    fine.scale.set(d.counterSize.x, 1, d.counterSize.y);
    fine.position.set(d.counterCenter.x, d.counterTop + 0.002, d.counterCenter.y);
    fine.material.opacity = 0.15;
    fine.material.transparent = true;

    root.add(floor, fine, new THREE.AxesHelper(0.5));
    this.el.setObject3D('debug', root);

    [
      ['X', '0.55 0 0', '#ff5555'],
      ['Y', '0 0.55 0', '#55ee55'],
      ['Z', '0 0 0.55', '#5599ff'],
    ].forEach(([letter, pos, color]) => {
      const label = document.createElement('a-entity');
      label.setAttribute('text', {
        value: letter,
        ...TEXT_BASE,
        color,
        align: 'center',
        width: 0.6,
      });
      label.setAttribute('position', pos);
      label.setAttribute('face-camera', '');
      this.el.appendChild(label);
    });
  },
});
