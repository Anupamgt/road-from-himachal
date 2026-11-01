import './styles/tokens.css';
import './styles/base.css';
import './styles/read.css';
import './styles/game.css';
import './styles/screens.css';
import { loadReadMode, saveReadMode } from './engine/prefs';
import { startGame } from './game';
import { renderReadMode } from './ui/readMode';

const game = document.getElementById('game') as HTMLElement;
const read = document.getElementById('read') as HTMLElement;
const toggle = document.getElementById('mode-switch') as HTMLButtonElement;

renderReadMode(read);

let gameStarted = false;

function apply(readMode: boolean): void {
  read.hidden = !readMode;
  game.hidden = readMode;
  toggle.setAttribute('aria-pressed', String(readMode));
  document.documentElement.dataset.mode = readMode ? 'read' : 'game';
  if (!readMode && !gameStarted) {
    gameStarted = true;
    startGame(game);
  }
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

apply(loadReadMode());

toggle.addEventListener('click', () => {
  const next = toggle.getAttribute('aria-pressed') !== 'true';
  saveReadMode(next);
  apply(next);
});
