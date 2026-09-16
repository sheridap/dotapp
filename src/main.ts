import {
  dailyNumber,
  dailySeed,
  localDateKey,
  mathRandomRng,
  newGame,
  pointerCancel,
  pointerDown,
  pointerEnter,
  pointerUp,
  recordDaily,
  seededRng,
  type GameState,
  type Rng,
} from './game';
import { createBoardView } from './ui/boardView';
import { createDailyPanel, type Mode } from './ui/dailyPanel';
import { createHud } from './ui/hud';
import { loadDaily, loadStats, saveDaily, saveStats } from './ui/storage';

const SHARE_URL = 'https://sheridap.github.io/dotapp/';

const app = document.getElementById('app');
if (!app) throw new Error('missing #app');

const modeEl = document.createElement('div');
const hudEl = document.createElement('div');
const boardEl = document.createElement('div');
const resultEl = document.createElement('div');
app.append(modeEl, hudEl, boardEl, resultEl);

let mode: Mode = 'daily';
let rng: Rng = mathRandomRng;
let state: GameState;
let stats = loadStats();

// Daily bookkeeping. `paths` is the accepted-move log that makes the game replayable.
let dateKey = '';
let daily = 0;
let paths: number[][] = [];

const hud = createHud(hudEl, () => {
  startFree();
});
const panel = createDailyPanel(
  modeEl,
  resultEl,
  (m) => {
    if (m === mode) return;
    mode = m;
    if (m === 'daily') startDaily();
    else startFree();
  },
  SHARE_URL,
);
const board = createBoardView(boardEl, {
  onDown: (i) => {
    set(pointerDown(state, i));
  },
  onEnter: (i) => {
    set(pointerEnter(state, i));
  },
  onUp: () => {
    const path = state.chain?.cells;
    const next = pointerUp(state, rng);
    if (mode === 'daily' && path && next.movesLeft < state.movesLeft) {
      paths.push([...path]);
      if (next.status === 'over') {
        stats = recordDaily(stats, daily, next.score);
        saveStats(stats);
      }
      saveDaily({ dateKey, paths, finished: next.status === 'over' });
    }
    set(next);
  },
  onCancel: () => {
    set(pointerCancel(state));
  },
});

function replay(start: GameState, path: readonly number[], r: Rng): GameState {
  const [first, ...rest] = path;
  if (first === undefined) return start;
  let s = pointerDown(start, first);
  for (const i of rest) s = pointerEnter(s, i);
  return pointerUp(s, r);
}

function startDaily(): void {
  const now = new Date();
  dateKey = localDateKey(now);
  daily = dailyNumber(now);
  rng = seededRng(dailySeed(dateKey));
  let s = newGame(rng);
  const saved = loadDaily(dateKey);
  paths = saved ? saved.paths.map((p) => [...p]) : [];
  for (const p of paths) s = replay(s, p, rng);
  hud.setFreePlay(false);
  set(s, true);
}

function startFree(): void {
  rng = mathRandomRng;
  hud.setFreePlay(true);
  set(newGame(rng), true);
}

function set(next: GameState, force = false): void {
  if (!force && next === state) return;
  state = next;
  hud.render(state);
  board.render(state);
  panel.render({ mode, daily, game: state, stats });
}

startDaily();
