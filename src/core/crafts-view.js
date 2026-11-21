import { crafts as plantCrafts, craft as plantCraft } from '../topics/crafts.js';

// Crafts (Arts & Crafts): a grid of mammal crafts, then one craft one card at a time.
// Card 0 is "You need"; then one card per step. The dock holds Back and Next step.
// The toolbar Back returns from a craft to the grid (game-engine walks state.craftItem).
// Child-view contract: setPaused(paused) and destroy() with listener cleanup.
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

export class CraftsView {
  constructor(game) {
    this.game = game; this.root = game.els.content;
    this.onClick = event => {
      if (game.paused) return;
      const pick = event.target.closest('[data-craft-item]');
      if (pick) { game.state.craftItem = pick.dataset.craftItem; game.state.craftStep = 0; this.render(); game.els.title.focus({ preventScroll: true }); return; }
      const act = event.target.closest('[data-craft-act]')?.dataset.craftAct;
      if (!act) return;
      const craft = plantCraft(game.state.craftItem); if (!craft) return;
      const last = craft.steps.length;
      if (act === 'back') game.state.craftStep = Math.max(0, game.state.craftStep - 1);
      else if (act === 'next') game.state.craftStep = Math.min(last + 1, game.state.craftStep + 1);
      else if (act === 'again') game.state.craftStep = 0;
      else if (act === 'list') { const id = craft.id; game.state.craftItem = null; this.render(); this.root.querySelector(`[data-craft-item="${id}"]`)?.focus({ preventScroll: true }); return; }
      this.render();
      this.root.querySelector('[data-craft-card]')?.focus({ preventScroll: true });
    };
    this.root.addEventListener('click', this.onClick);
    this.render();
  }
  render() {
    const game = this.game, craft = plantCraft(game.state.craftItem);
    game.state.craftItem = craft?.id || null;
    game.refreshBackButton();
    game.els.helper.hidden = true; game.els.listen.hidden = true; game.els.title.hidden = false;
    if (!craft) {
      game.els.title.textContent = 'Crafts'; game.els.round.textContent = '';
      this.root.innerHTML = `<div class="trace-picture-grid craft-grid">${plantCrafts.map(item => `<button type="button" class="trace-picture" data-craft-item="${item.id}"><span class="trace-thumb"><img src="${escape(item.picture)}" alt="" decoding="async"/></span><strong>${escape(item.name)}</strong></button>`).join('')}</div>`;
      return;
    }
    const total = craft.steps.length, step = Math.max(0, Math.min(total + 1, game.state.craftStep || 0));
    game.state.craftStep = step;
    game.els.title.textContent = craft.name; game.els.round.textContent = 'Crafts';
    let label, body;
    if (step === 0) {
      label = 'You need';
      body = `<ul class="craft-need">${craft.need.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
    } else if (step <= total) {
      const s = craft.steps[step - 1];
      label = `Step ${step} of ${total}`;
      body = `<p class="craft-text">${escape(s.text)}</p>${s.grownUp ? '<p class="craft-grown-up">Grown-up helps</p>' : ''}`;
    } else {
      label = 'All done!';
      body = `<p class="craft-text">Well done! Show someone what you made.</p>`;
    }
    const dock = step > total
      ? `<button type="button" class="learn-action" data-craft-act="again">Start over</button><button type="button" class="primary-button" data-craft-act="list">Choose a craft</button>`
      : `<button type="button" class="learn-action" data-craft-act="back" ${step === 0 ? 'disabled' : ''}>Back</button><button type="button" class="primary-button trace-next" data-craft-act="next">${step === 0 ? 'Start' : step === total ? 'Finish' : 'Next step'}</button>`;
    this.root.innerHTML = `<div class="craft-play">
      <div class="craft-card" data-craft-card tabindex="-1">
        <img class="craft-picture" src="${escape(step >= 1 && step <= total ? craft.steps[step - 1].picture : craft.picture)}" alt=""/>
        <div class="craft-words"><h3 class="craft-label">${label}</h3>${body}</div>
      </div>
      <div class="craft-dots" aria-hidden="true">${Array.from({ length: total + 2 }, (_, i) => `<i class="${i === step ? 'on' : i < step ? 'done' : ''}"></i>`).join('')}</div>
      <div class="craft-dock">${dock}</div>
    </div>`;
  }
  setPaused() {}
  destroy() { this.root.removeEventListener('click', this.onClick); this.game.els.title.hidden = false; }
}
