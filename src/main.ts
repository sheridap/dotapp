import {
  mathRandomRng,
  newGame,
  pointerCancel,
  pointerDown,
  pointerEnter,
  pointerUp,
  type GameState,
} from './game';
import { createBoardView } from './ui/boardView';
import { createHud } from './ui/hud';

const app = document.getElementById('app');
if (!app) throw new Error('missing #app');

const rng = mathRandomRng;
let state: GameState = newGame(rng);

const hudEl = document.createElement('div');
const boardEl = document.createElement('div');
app.append(hudEl, boardEl);

const hud = createHud(hudEl, () => {
  set(newGame(rng));
});

const board = createBoardView(boardEl, {
  onDown: (i) => {
    set(pointerDown(state, i));
  },
  onEnter: (i) => {
    set(pointerEnter(state, i));
  },
  onUp: () => {
    set(pointerUp(state, rng));
  },
  onCancel: () => {
    set(pointerCancel(state));
  },
});

function set(next: GameState): void {
  if (next === state) return;
  state = next;
  hud.render(state);
  board.render(state);
}

hud.render(state);
board.render(state);
