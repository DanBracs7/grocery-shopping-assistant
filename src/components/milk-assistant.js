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
AFRAME.registerComponent('milk-assistant', {
  schema: {
    panel: { type: 'selector' },
    list: { type: 'selector' },
    delay: { default: 2500 }, // ms the "analysis" takes (storyboard step 2)
    compared: { default: 6 }, // how many milks the agent says it compared
    rounds: { type: 'array', default: [] }, // each round: two carton ids separated by a space
    tags: { type: 'array', default: [] }, // each round: two tag titles separated by "/"
    items: { type: 'array', default: ['Milk'] }, // shopping list, the first item is the milk
  },

  init() {
    this.buttons = ['#btn-1', '#btn-2', '#btn-3'].map((id) => this.data.panel.querySelector(id));
    this.cartons = () => [...this.el.sceneEl.querySelectorAll('[milk-carton]')];

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
    this.onProduct = (evt) => this.state === 'options' && this.choose(evt.detail.carton);
    this.el.sceneEl.addEventListener('product-chosen', this.onProduct);

    // Wait until the cards and buttons exist before the first state.
    this.el.sceneEl.hasLoaded
      ? this.restart()
      : this.el.sceneEl.addEventListener('loaded', () => this.restart());
  },

  // ---------- states ----------

  restart() {
    this.done = false;
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
    this.candidates.forEach((c, i) => c.components['milk-carton'].recommend(`${i + 1} - ${tags[i]}`));
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
    carton.components['milk-carton'].recommend('Your choice', false); // step 6: stays highlighted
    const name = carton.getAttribute('milk-carton').en;
    this.setState('chosen', `Added: ${name}`, 'Save it as your default milk?\nNext time I pick it directly.', [
      ['Save it', 'save-it'],
      ['Not now', 'not-now'],
    ]);
  },

  finish(saved) {
    this.done = true;
    this.renderList();
    const next = this.data.items[1] ? `Next item: ${this.data.items[1].trim()}` : 'List complete!';
    this.setState('done', 'Milk done', `${saved ? 'Saved as your default milk. ' : ''}${next}`, [
      ['Restart', 'restart'],
    ]);
  },

  // ---------- helpers ----------

  // Update the panel text and up to three buttons: [[label, event], ...]
  setState(state, title, text, buttons) {
    this.state = state;
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
