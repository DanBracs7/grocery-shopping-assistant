// toggle-hint — click on this object to show its hint card; click again (or ×) to hide it.
// This is the simplest interaction pattern in the repo — copy it for your own objects.
//
// Concepts: the `click` event, selector properties, calling another component's method.
//
// Use:  <a-entity class="interactive" toggle-hint="target: #plant-hint">…</a-entity>
// The hint's own × button emits `hint-close`; the hint-card hides itself when it hears it.
AFRAME.registerComponent('toggle-hint', {
  schema: { target: { type: 'selector' } },

  init() {
    this.card = () => this.data.target.components['hint-card'];
    this.onClick = (evt) => {
      if (evt.target.closest('[hint-card]')) return; // a click on a hint button is not for us
      this.card().toggle();
    };
    this.el.addEventListener('click', this.onClick);
  },

  remove() {
    this.el.removeEventListener('click', this.onClick);
  },
});
