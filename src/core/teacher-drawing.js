import { drawOptions, getSettings, saveSettings, subscribe, myPictures, myPicture, removePicture, exportPicture, importPicture } from './draw-trace-store.js';

// The "Drawing" section of the Teacher dialog (Draw & Trace in Arts & Crafts).
// Steps, Path look, Speed and Timing follow the dialog's draft / Apply / Close pattern.
// Import, Export and Delete act at once: they work on files and the My pictures list, not on the draft.
const KEYS = ['steps', 'guide', 'speed', 'timing'];
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

export function installTeacherDrawing({ root, onChange }) {
  let draft = getSettings(), armed = null, busy = false, chosen = '';
  root.innerHTML = `<h3 id="drawingTitle">Drawing</h3>
    <p class="drawing-hint">For Draw &amp; Trace in Arts &amp; Crafts.</p>
    ${KEYS.map(key => `<div class="drawing-row"><span id="drawing-${key}">${drawOptions[key].label}</span><div class="drawing-choices" role="group" aria-labelledby="drawing-${key}">${drawOptions[key].choices.map(([, label], index) => `<button type="button" data-draw-option="${key}" data-index="${index}" aria-pressed="false">${escape(label)}</button>`).join('')}</div></div>`).join('')}
    <div class="drawing-row drawing-row--files"><span id="drawing-files">My pictures</span><div class="drawing-files" role="group" aria-labelledby="drawing-files">
      <button type="button" class="scope-reset" data-draw-file="import">Import picture or file</button>
      <input type="file" data-draw-input accept=".json,application/json,image/png,image/jpeg,image/webp,image/svg+xml" hidden />
      <select data-draw-picture aria-label="My picture"></select>
      <button type="button" class="scope-reset" data-draw-file="export">Export file</button>
      <button type="button" class="scope-reset" data-draw-file="delete">Delete</button>
    </div></div>
    <p class="drawing-status" data-draw-status role="status" aria-live="polite"></p>`;
  const input = root.querySelector('[data-draw-input]'), select = root.querySelector('[data-draw-picture]'), status = root.querySelector('[data-draw-status]');
  const fileButtons = Object.fromEntries([...root.querySelectorAll('[data-draw-file]')].map(button => [button.dataset.drawFile, button]));
  const say = text => { status.textContent = text; };
  const disarm = () => { if (!armed) return; clearTimeout(armed); armed = null; fileButtons.delete.textContent = 'Delete'; };
  const differs = () => { const saved = getSettings(); return KEYS.some(key => draft[key] !== saved[key]); };
  function paint() {
    for (const button of root.querySelectorAll('[data-draw-option]')) {
      const key = button.dataset.drawOption;
      button.setAttribute('aria-pressed', String(drawOptions[key].choices[+button.dataset.index][0] === draft[key]));
    }
    const pictures = myPictures();
    if (!pictures.some(picture => picture.id === chosen)) chosen = pictures[pictures.length - 1]?.id || '';
    select.innerHTML = pictures.length ? pictures.map(picture => `<option value="${picture.id}">${escape(picture.name)}</option>`).join('') : '<option value="">No pictures yet</option>';
    select.value = chosen; select.disabled = !pictures.length;
    fileButtons.export.disabled = fileButtons.delete.disabled = !pictures.length;
    fileButtons.import.disabled = busy;
  }
  function onClick(event) {
    const option = event.target.closest('[data-draw-option]'), file = event.target.closest('[data-draw-file]');
    if (option) { disarm(); draft[option.dataset.drawOption] = drawOptions[option.dataset.drawOption].choices[+option.dataset.index][0]; paint(); onChange?.(); return; }
    if (!file || file.disabled) return;
    const action = file.dataset.drawFile, picture = myPicture(chosen);
    if (action !== 'delete') disarm();
    if (action === 'import') { input.value = ''; input.click(); }
    else if (action === 'export' && picture) { exportPicture(picture); say(`"${picture.name}" exported.`); }
    else if (action === 'delete' && picture) {
      // Deleting cannot be undone, so it asks for a second tap.
      if (!armed) { file.textContent = 'Tap again'; armed = setTimeout(disarm, 3500); return; }
      disarm(); removePicture(picture.id); say(`"${picture.name}" deleted.`);
    }
  }
  async function onFile() {
    const file = input.files?.[0]; if (!file || busy) return;
    busy = true; paint(); say('Getting the picture ready…');
    try {
      const added = await importPicture(file);
      if (!added) throw Error('That file is not a drawing.');
      chosen = added.drawing.id;
      say(`"${added.drawing.name}" is in My pictures.${added.kept ? '' : ' This device is full, so it stays only until the game is closed.'}`);
    } catch (error) { say(error?.message || 'That file could not be opened.'); }
    busy = false; input.value = ''; paint();
  }
  const onSelect = () => { disarm(); chosen = select.value; };
  root.addEventListener('click', onClick); input.addEventListener('change', onFile); select.addEventListener('change', onSelect);
  const unsubscribe = subscribe(what => { if (what === 'pictures') paint(); });
  paint();
  return {
    differs,
    // Called when the dialog opens or closes: drop the draft and any old message.
    reset() { disarm(); draft = getSettings(); say(''); paint(); },
    apply() { if (differs()) saveSettings(Object.fromEntries(KEYS.map(key => [key, draft[key]]))); },
    destroy() { disarm(); unsubscribe(); root.removeEventListener('click', onClick); input.removeEventListener('change', onFile); select.removeEventListener('change', onSelect); }
  };
}
