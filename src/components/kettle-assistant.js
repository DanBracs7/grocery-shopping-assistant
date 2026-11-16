// kettle-assistant — pattern "assistant proposes, user confirms".
// A tiny state machine:  idle --kettle-start--> boiling --(delay)--> ready
//
// Concepts: component state, listening to your own custom events (`kettle-start`),
// timers that are cleaned up in remove(), changing another component's data at runtime.
//
// Use:  <a-entity id="kettle" class="interactive" toggle-hint="target: #kettle-hint"
//                 kettle-assistant="hint: #kettle-hint; delay: 8000"> …kettle shapes… </a-entity>
// The hint needs a button with id `kettle-start`, e.g. hint-button="label: Start; event: kettle-start".
const STEAM_PUFFS = 3;

AFRAME.registerComponent('kettle-assistant', {
  schema: {
    hint: { type: 'selector' },
    delay: { default: 8000 }, // milliseconds until the water is ready
  },

  init() {
    this.state = 'idle';
    this.puffs = [];
    for (let i = 0; i < STEAM_PUFFS; i++) {
      const puff = document.createElement('a-sphere');
      puff.setAttribute('radius', 0.03);
      puff.setAttribute('material', 'color: #fff; opacity: 0.5; transparent: true; shader: flat');
      puff.setAttribute('visible', false);
      this.el.appendChild(puff);
      this.puffs.push(puff);
    }
    this.startBtn = this.data.hint.querySelector('#kettle-start');
    this.onStart = () => this.setState('boiling');
    this.onClose = () => this.state === 'ready' && this.setState('idle'); // closing "ready" resets
    this.el.addEventListener('kettle-start', this.onStart);
    this.el.addEventListener('hint-close', this.onClose);
    this.setState('idle');
  },

  setState(state) {
    this.state = state;
    clearTimeout(this.timer);
    const card = this.data.hint.components['hint-card'];
    const texts = {
      idle: ['Kettle', 'Boil water for tea?'],
      boiling: ['Kettle', 'Boiling...'],
      ready: ['Kettle', 'Water is ready!'],
    };
    this.data.hint.setAttribute('hint-card', { title: texts[state][0], text: texts[state][1] });
    this.startBtn.components['hint-button'].setEnabled(state === 'idle');
    this.puffs.forEach((p) => p.setAttribute('visible', state === 'boiling'));
    if (state === 'boiling') this.timer = setTimeout(() => this.setState('ready'), this.data.delay);
    if (state === 'ready') card.show(); // the assistant reports back, even if the hint was closed
  },

  tick(time) {
    if (this.state !== 'boiling') return;
    this.puffs.forEach((puff, i) => {
      const t = (time / 1500 + i / STEAM_PUFFS) % 1; // 0..1, loops forever
      puff.object3D.position.set(0.02 * Math.sin(t * 6), 0.3 + t * 0.25, 0.1);
      puff.object3D.scale.setScalar(0.6 + t);
    });
  },

  remove() {
    clearTimeout(this.timer);
    this.el.removeEventListener('kettle-start', this.onStart);
    this.el.removeEventListener('hint-close', this.onClose);
  },
});
