// recipe-steps — pattern "step through content": Next ... Next ... Done.
//
// Concepts: array properties in the schema (comma separated), updating a card's text and a
// button's label from code, events bubbling from a button up to its object.
//
// Use:  <a-entity class="interactive" toggle-hint="target: #recipe-hint"
//                 recipe-steps="hint: #recipe-hint; steps: Boil water, Add tea bag, Wait 3 minutes">
// The hint needs a button with event `recipe-next` (id `recipe-next`).
AFRAME.registerComponent('recipe-steps', {
  schema: {
    hint: { type: 'selector' },
    steps: { type: 'array', default: ['Step one', 'Step two'] }, // no commas inside a step!
  },

  init() {
    this.index = 0;
    this.nextBtn = this.data.hint.querySelector('#recipe-next');
    this.onNext = () => {
      if (this.index < this.data.steps.length - 1) {
        this.index++;
        this.render();
      } else {
        this.data.hint.components['hint-card'].hide(); // "Done"
        this.index = 0;
        this.render();
      }
    };
    this.el.addEventListener('recipe-next', this.onNext);
    this.render();
  },

  render() {
    const { steps } = this.data;
    this.data.hint.setAttribute('hint-card', {
      title: `Step ${this.index + 1} / ${steps.length}`,
      text: steps[this.index],
    });
    const last = this.index === steps.length - 1;
    this.nextBtn.setAttribute('hint-button', 'label', last ? 'Done' : 'Next');
  },

  remove() {
    this.el.removeEventListener('recipe-next', this.onNext);
  },
});
