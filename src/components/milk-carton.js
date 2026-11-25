// milk-carton — one product on the shelf: a carton with its (German) label, an invisible hit box,
// a blue highlight frame and a small tag that the assistant fills in (object-anchored label).
//
// Concepts: building a product from simple shapes in code, an object-anchored label that is a
// CHILD of the product (it moves with it), and switching `.interactive` on and off so that only
// recommended products can be selected.
//
// Use:  <a-entity milk-carton="label: H-Milch; en: Long-life milk; price: 1.09; protein: 3.4;
//                              color: #4da3ff" position="-0.65 0.91 0.02"></a-entity>
// The assistant calls  el.components['milk-carton'].recommend('1 - Best price')  /  .reset()
// Clicking a recommended carton emits `product-chosen` (it bubbles up to the scene).
//
// Note: the bundled font only has plain ASCII characters, so write "EUR" instead of the euro
// sign and avoid umlauts (Eiweiss instead of Eiweiß).
import { TEXT_BASE } from '../utils/url-params.js';
import { refreshRaycasters } from './hint-card.js';

AFRAME.registerComponent('milk-carton', {
  schema: {
    label: { default: 'Milch' }, // what is printed on the real package (German)
    en: { default: 'Milk' }, // translation the assistant shows
    price: { default: 1.0 }, // EUR
    protein: { default: 3.4 }, // g per 100 ml
    color: { type: 'color', default: '#4da3ff' }, // colour band of the package
  },

  init() {
    const d = this.data;

    // The package: white body, coloured band, small cap.
    this.add('a-box', { width: 0.09, height: 0.2, depth: 0.09, position: '0 0.1 0', color: '#f4f4f0' });
    this.add('a-box', { width: 0.092, height: 0.06, depth: 0.092, position: '0 0.13 0', color: d.color });
    this.add('a-cylinder', { radius: 0.015, height: 0.02, position: '0.02 0.21 0', color: d.color });
    // Printed label on the front of the package.
    this.add('a-entity', {
      position: '0 0.065 0.0465',
      text: { ...TEXT_BASE, value: d.label, color: '#222', align: 'center', anchor: 'center', width: 0.16, wrapCount: 10 },
    });

    // Invisible hit box: the thing the ray can hit (only `.interactive` while recommended).
    this.hit = this.add('a-box', {
      width: 0.12,
      height: 0.24,
      depth: 0.12,
      position: '0 0.11 0',
      material: 'opacity: 0; transparent: true; depthWrite: false',
    });

    // Highlight frame around the package (step 3 and step 6 of the storyboard).
    this.frame = this.add('a-box', {
      width: 0.13,
      height: 0.26,
      depth: 0.13,
      position: '0 0.12 0',
      material: 'shader: flat; color: #2f8cff; wireframe: true',
      visible: false,
    });

    // Object-anchored tag, hanging in front of the shelf board, below the package.
    this.tag = this.add('a-entity', { position: '0 -0.11 0.18', visible: false });
    this.tag.setAttribute('geometry', 'primitive: plane; width: 0.25; height: 0.19');
    this.tag.setAttribute('material', 'shader: flat; color: #14181f; opacity: 0.88; transparent: true');
    this.tagTitle = this.addText(this.tag, '#7fc4ff', 0.08);
    this.tagBody = this.addText(this.tag, '#ffffff', 0.04);

    this.recommended = false;
    this.onClick = () => this.recommended && this.el.emit('product-chosen', { carton: this.el });
    this.el.addEventListener('click', this.onClick);
  },

  add(tag, attrs, parent = this.el) {
    const child = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => child.setAttribute(k, v));
    parent.appendChild(child);
    return child;
  },

  addText(parent, color, y) {
    return this.add(
      'a-entity',
      {
        position: `0 ${y} 0.002`,
        text: { ...TEXT_BASE, value: '', color, align: 'center', anchor: 'center', baseline: 'top', width: 0.23, wrapCount: 16 },
      },
      parent,
    );
  },

  // Show the frame + tag. `title` is e.g. "1 - Best price" or "Your choice".
  recommend(title, selectable = true) {
    const d = this.data;
    this.recommended = selectable;
    this.frame.setAttribute('visible', true);
    this.tag.setAttribute('visible', true);
    this.tagTitle.setAttribute('text', 'value', title);
    this.tagBody.setAttribute('text', 'value', `${d.en}\n${d.price.toFixed(2)} EUR\n${d.protein} g protein`);
    this.hit.classList.toggle('interactive', selectable);
    refreshRaycasters(this.el.sceneEl);
  },

  reset() {
    this.recommended = false;
    this.frame.setAttribute('visible', false);
    this.tag.setAttribute('visible', false);
    this.hit.classList.remove('interactive');
    refreshRaycasters(this.el.sceneEl);
  },

  remove() {
    this.el.removeEventListener('click', this.onClick);
  },
});
