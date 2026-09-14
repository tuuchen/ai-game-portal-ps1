const game = window.PS1_GAME;
const gate = document.querySelector('.gate');
const button = document.querySelector('.gate button');
const loader = document.querySelector('.loader');
let runtimeReady = false;

function key(key, code) {
  const targets = [document.querySelector('canvas'), document, window].filter(Boolean);
  for (const type of ['keydown', 'keyup']) {
    for (const target of targets) target.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true, composed: true }));
  }
}

window.addEventListener('TrunkApplicationStarted', () => {
  runtimeReady = true;
  button.disabled = false;
  button.textContent = `Play ${game.shortTitle}`;
  loader.classList.add('ready');
});

button.addEventListener('click', async () => {
  if (!runtimeReady) return;
  document.querySelector('canvas')?.focus();
  gate.classList.add('hidden');
  await new Promise(resolve => setTimeout(resolve, 180));
  key('ArrowDown', 'ArrowDown');
  await new Promise(resolve => setTimeout(resolve, 120));
  key('Enter', 'Enter');
});

window.addEventListener('error', () => {
  document.querySelector('.status').textContent = 'Could not start — reload to retry';
});
