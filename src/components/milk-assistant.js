// milk-assistant — the core interaction of our app (storyboard steps 2-6) as a small state machine.
//
//   analysing --(delay)--> options --"Brand 1/2" or click on a highlighted carton--> chosen
//                            |                                                         |
//                            +--"Neither"--> next 2 options (or "nothing else fits")   +--"Save it" / "Not now"--> done
//
// Everything is mocked: the "comparison" is a fixed list of rounds written in the HTML, and the
// voice commands ("Brand 1", "Neither", "Save it") are buttons that work with mouse, controller
// trigger, pinch or gaze dwell (?input=gaze).
//
// Use:  <a-entity milk-assistant="panel: #milk-panel; list: #shopping-list; delay: 2500;
//                                 rounds: milk-1 milk-2, milk-5 milk-3;
//                                 tags: Best price/More protein, Cheaper/Organic;
//                                 items: Milk, Eggs, Apples, Bread"></a-entity>
// The panel is a hint-card with three hint-buttons (#btn-1, #btn-2, #btn-3); this component
// changes their labels and events for every state.
import { TEXT_BASE } from '../utils/url-params.js';

const THREE = AFRAME.THREE;

AFRAME.registerComponent('milk-assistant', {
  schema: {
    panel: { type: 'selector' },
    list: { type: 'selector' },
    delay: { default: 2500 }, // ms the "analysis" takes (storyboard step 2)
    compared: { default: 6 }, // how many milks the agent says it compared
    rounds: { type: 'array', default: [] }, // each round: two carton ids separated by a space
    tags: { type: 'array', default: [] }, // each round: two tag titles separated by "/"
    items: { type: 'array', default: ['Milk'] }, // shopping list, the first item is the milk
    cart: { type: 'selector' }, // the shopping trolley (shopping-cart); the chosen milk goes in there
  },

  init() {
    this.buttons = ['#btn-1', '#btn-2', '#btn-3'].map((id) => this.data.panel.querySelector(id));
    this.cartons = () => [...this.el.sceneEl.querySelectorAll('[milk-carton]')];
    // Two option cards INSIDE the panel (storyboard step 3): a small milk picture, the tag,
    // the English name, the price and the protein. The real cartons on the shelf are NOT
    // highlighted at this point; only the chosen one is highlighted afterwards (step 6).
    this.cards = [-0.155, 0.155].map((x) => this.buildCard(x));
    // After the choice: one bigger card with the chosen milk, in the middle of the panel.
    this.chosenCard = this.buildCard(0);
    this.chosenCard.setAttribute('scale', '1.15 1.15 1.15');

    // Where every carton stands on the shelf, so restart() can put a picked-up carton back.
    this.home = new Map();
    this.move = null; // the carton flying into the trolley: { carton, from, t }
    this.inCart = null; // the carton that is in the trolley
    this.tmp = new THREE.Vector3();

    // Button events (bubble up from the buttons) and clicks on highlighted cartons.
    this.handlers = {
      'pick-0': () => this.choose(this.candidates[0]),
      'pick-1': () => this.choose(this.candidates[1]),
      neither: () => this.showOptions(this.round + 1),
      'first-again': () => this.showOptions(0),
      'save-it': () => this.finish(true),
      'not-now': () => this.finish(false),
      restart: () => this.restart(),
    };
    Object.entries(this.handlers).forEach(([evt, fn]) => this.el.addEventListener(evt, fn));
    // Clicking a carton: in the options state it chooses it; after the choice, clicking the
    // highlighted carton picks it up and puts it in the trolley (storyboard step 6).
    this.onProduct = (evt) => {
      const carton = evt.detail.carton;
      if (this.state === 'options') this.choose(carton);
      else if (carton === this.chosen && !this.inCart) this.pickUp(carton);
    };
    this.el.sceneEl.addEventListener('product-chosen', this.onProduct);

    // Wait until the cards and buttons exist before the first state.
    this.el.sceneEl.hasLoaded
      ? this.restart()
      : this.el.sceneEl.addEventListener('loaded', () => this.restart());
  },

  // ---------- states ----------

  restart() {
    this.done = false;
    this.putBack();
    this.renderList();
    this.cartons().forEach((c) => c.components['milk-carton'].reset());
    this.setState('analysing', 'Milk', 'Comparing the milks on this shelf...', []);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.showOptions(0), this.data.delay);
  },

  showOptions(round) {
    this.cartons().forEach((c) => c.components['milk-carton'].reset());
    if (round >= this.data.rounds.length) {
      this.setState('none', 'Milk', 'No other milk on this shelf fits your preferences.', [
        ['Again', 'first-again'],
        ['Restart', 'restart'],
      ]);
      return;
    }
    this.round = round;
    const left = this.data.compared - round * 2; // milks not rejected yet, these 2 included
    const ids = this.data.rounds[round].trim().split(/\s+/);
    const tags = (this.data.tags[round] || 'Option 1/Option 2').split('/');
    this.candidates = ids.map((id) => this.el.sceneEl.querySelector(`#${id}`));
    this.candidates.forEach((c, i) => this.fillCard(this.cards[i], c, `${i + 1} - ${tags[i]}`));
    this.setState(
      'options',
      round === 0 ? 'Milk: 2 best matches' : `Milk: ${left} options left`,
      `Compared ${this.data.compared} milks: price + protein.\nSay "Brand 1", "Brand 2" or "Neither".`,
      [
        ['Brand 1', 'pick-0'],
        ['Brand 2', 'pick-1'],
        ['Neither', 'neither'],
      ],
    );
  },

  choose(carton) {
    this.chosen = carton;
    this.cartons().forEach((c) => c !== carton && c.components['milk-carton'].reset());
    carton.components['milk-carton'].recommend('Your choice', true); // step 6: highlighted, can be picked up
    this.fillCard(this.chosenCard, carton, 'Your choice');
    const name = carton.getAttribute('milk-carton').en;
    this.setState('chosen', `Added: ${name}`, 'Save it as your default milk?\nNext time I pick it directly.', [
      ['Save it', 'save-it'],
      ['Not now', 'not-now'],
    ]);
  },

  finish(saved) {
    this.done = true;
    this.renderList();
    this.saved = saved;
    this.showDone();
  },

  showDone() {
    const next = this.data.items[1] ? `Next item: ${this.data.items[1].trim()}` : 'List complete!';
    const saved = this.saved ? 'Saved as your default milk. ' : '';
    const text = this.inCart ? `${saved}Milk is in your cart.\n${next}` : `${saved}\nPick up the highlighted milk\nand put it in your cart.`;
    this.setState('done', 'Milk done', text, [['Restart', 'restart']]);
  },

  // ---------- picking up ----------

  // Take the carton off the shelf: it flies into the trolley (animated in tick).
  pickUp(carton) {
    if (!this.data.cart) return;
    if (!this.home.has(carton)) {
      this.home.set(carton, { pos: carton.object3D.position.clone(), quat: carton.object3D.quaternion.clone() });
    }
    carton.components['milk-carton'].reset(); // no frame, no tag, not clickable any more
    this.move = { carton, from: carton.object3D.getWorldPosition(new THREE.Vector3()), t: 0 };
    this.inCart = carton;
    if (this.state === 'done') this.showDone();
  },

  // Put a carton from the trolley back on the shelf (restart).
  putBack() {
    this.move = null;
    this.inCart = null;
    this.home.forEach((h, carton) => {
      carton.object3D.position.copy(h.pos);
      carton.object3D.quaternion.copy(h.quat);
    });
  },

  // Every frame: keep the picked carton in the trolley (the trolley moves with the user).
  tick(time, dt) {
    if (!this.inCart || !this.data.cart) return;
    const carton = this.inCart;
    const cart = this.data.cart.object3D;
    const spot = this.tmp.copy(this.data.cart.components['shopping-cart'].slot(0));
    cart.localToWorld(spot); // where the carton should be, in world space
    if (this.move) {
      this.move.t = Math.min(1, this.move.t + dt / 600); // 0.6 s flight
      const e = 1 - Math.pow(1 - this.move.t, 3); // ease-out
      spot.lerpVectors(this.move.from, spot, e);
      if (this.move.t >= 1) this.move = null;
    }
    const parent = carton.object3D.parent;
    parent.worldToLocal(spot); // the carton stays a child of the shelf, so convert back
    carton.object3D.position.copy(spot);
    // Same direction as the trolley (the shelf itself is not rotated).
    carton.object3D.quaternion.copy(cart.quaternion);
  },

  // ---------- helpers ----------

  // One option card: dark plate, small milk carton picture on the left, four text lines on the right.
  buildCard(x) {
    const add = (parent, tag, attrs) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      parent.appendChild(el);
      return el;
    };
    const card = add(this.data.panel, 'a-entity', { position: `${x} -0.03 0.003`, visible: false });
    add(card, 'a-plane', { width: 0.29, height: 0.23, material: 'shader: flat; color: #232a35' });
    // Milk picture: white carton, coloured band, small cap (same look as on the shelf).
    const pic = add(card, 'a-entity', { position: '-0.09 -0.01 0.01' });
    add(pic, 'a-plane', { width: 0.055, height: 0.12, material: 'shader: flat; color: #f4f4f0' });
    card.band = add(pic, 'a-plane', { width: 0.055, height: 0.035, position: '0 0.015 0.001', material: 'shader: flat; color: #4da3ff' });
    card.cap = add(pic, 'a-plane', { width: 0.014, height: 0.012, position: '0.012 0.066 0', material: 'shader: flat; color: #4da3ff' });
    const text = (y, color) =>
      add(card, 'a-entity', {
        position: `-0.045 ${y} 0.01`,
        text: { ...TEXT_BASE, value: '', color, anchor: 'left', align: 'left', baseline: 'top', width: 0.24, wrapCount: 22 },
      });
    card.tagText = text(0.095, '#7fc4ff');
    card.nameText = text(0.045, '#ffffff');
    card.infoText = text(-0.005, '#d6dbe4');
    return card;
  },

  // Put one carton's data on a card.
  fillCard(card, carton, title) {
    const d = carton.getAttribute('milk-carton');
    card.band.setAttribute('material', 'color', d.color);
    card.cap.setAttribute('material', 'color', d.color);
    card.tagText.setAttribute('text', 'value', title);
    card.nameText.setAttribute('text', 'value', d.en);
    card.infoText.setAttribute('text', 'value', `${Number(d.price).toFixed(2)} EUR\n${d.protein} g protein`);
  },

  // Update the panel text and up to three buttons: [[label, event], ...]
  setState(state, title, text, buttons) {
    this.state = state;
    this.cards.forEach((card) => card.setAttribute('visible', state === 'options'));
    this.chosenCard.setAttribute('visible', state === 'chosen');
    this.data.panel.setAttribute('hint-card', { title, text });
    this.buttons.forEach((btn, i) => {
      const cfg = buttons[i];
      if (cfg) btn.setAttribute('hint-button', { label: cfg[0], event: cfg[1] });
      btn.components['hint-button'].setEnabled(!!cfg);
    });
    this.el.emit('assistant-state', { state }); // handy for debugging and tests
  },

  renderList() {
    if (!this.data.list) return;
    const lines = this.data.items.map((item, i) => {
      const name = item.trim();
      if (i === 0) return this.done ? `[x] ${name}` : `>  ${name}`;
      if (i === 1 && this.done) return `>  ${name}`;
      return `[ ] ${name}`;
    });
    this.data.list.setAttribute('hint-card', 'text', lines.join('\n'));
  },

  remove() {
    clearTimeout(this.timer);
    Object.entries(this.handlers).forEach(([evt, fn]) => this.el.removeEventListener(evt, fn));
    this.el.sceneEl.removeEventListener('product-chosen', this.onProduct);
  },
});
