// One colour button that opens a centred popout of swatches (owner, 13 November 2026), so a long
// palette does not take room from the board. Used by Colouring and by Draw & Trace's "Draw my own".
// The button shows the chosen colour and its name; a tap on a swatch picks it and closes the popout.
const RUBBER = '#ffffff';

export function colourPickerHtml(colours) {
  return `<button type="button" class="colour-pick" data-colour-open aria-haspopup="dialog"><span class="colour-pick__dot" data-colour-dot></span><span class="colour-pick__name" data-colour-name></span></button>
    <dialog class="colour-pop" aria-labelledby="colourPopTitle">
      <h2 id="colourPopTitle" class="colour-pop__title">Pick a colour</h2>
      <div class="colour-pop__grid" role="group" aria-label="Colours">${colours.map(([c, n]) => `<button type="button" class="colour-swatch${c === RUBBER ? ' colour-swatch--rubber' : ''}" data-colour-pick="${c}" style="--swatch:${c}" aria-label="${n}" aria-pressed="false"></button>`).join('')}</div>
    </dialog>`;
}

export class ColourPicker {
  // root holds the markup above; onPick(colour) runs after a swatch is tapped; blocked() stops it while paused.
  constructor(root, colours, onPick, blocked = () => false) {
    this.names = new Map(colours);
    this.open = root.querySelector('[data-colour-open]'); this.dot = root.querySelector('[data-colour-dot]');
    this.name = root.querySelector('[data-colour-name]'); this.dialog = root.querySelector('.colour-pop');
    this.swatches = [...this.dialog.querySelectorAll('[data-colour-pick]')];
    this.onOpen = () => { if (blocked()) return; this.dialog.showModal(); (this.swatches.find(s => s.getAttribute('aria-pressed') === 'true') || this.swatches[0])?.focus(); };
    this.onDialog = event => {
      if (event.target === this.dialog) { this.close(); return; }   // a tap on the dimmed backdrop
      const swatch = event.target.closest('[data-colour-pick]');
      if (!swatch || blocked()) return;
      event.stopPropagation(); this.close(); onPick(swatch.dataset.colourPick);
    };
    // Escape closes the popout only; it must not also act as the game's Back key.
    this.onKey = event => { if (event.key === 'Escape') event.stopPropagation(); };
    this.open.addEventListener('click', this.onOpen);
    this.dialog.addEventListener('click', this.onDialog); this.dialog.addEventListener('keydown', this.onKey);
  }
  show(colour) {
    for (const swatch of this.swatches) swatch.setAttribute('aria-pressed', String(swatch.dataset.colourPick === colour));
    const name = this.names.get(colour) || '';
    this.dot.style.setProperty('--swatch', colour); this.dot.classList.toggle('colour-pick__dot--rubber', colour === RUBBER);
    this.name.textContent = name; this.open.setAttribute('aria-label', `Colour: ${name}. Change colour`);
  }
  close() { if (this.dialog.open) { this.dialog.close(); this.open.focus({ preventScroll: true }); } }
  destroy() {
    if (this.dialog.open) this.dialog.close();
    this.open.removeEventListener('click', this.onOpen);
    this.dialog.removeEventListener('click', this.onDialog); this.dialog.removeEventListener('keydown', this.onKey);
  }
}
