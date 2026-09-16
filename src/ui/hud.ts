import type { GameState } from '../game/game';

export interface Hud {
  render(state: GameState): void;
}

/** Score, moves remaining, and the new-game control. */
export function createHud(root: HTMLElement, onNewGame: () => void): Hud {
  root.classList.add('hud');

  const score = stat(root, 'Score');
  const moves = stat(root, 'Moves');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'new-game';
  button.textContent = 'New game';
  button.addEventListener('click', onNewGame);
  root.append(button);

  const banner = document.createElement('p');
  banner.className = 'banner';
  banner.hidden = true;
  root.append(banner);

  return {
    render(state) {
      score.textContent = String(state.score);
      moves.textContent = String(state.movesLeft);
      banner.hidden = state.status !== 'over';
      banner.textContent = `Game over. ${String(state.score)} dots.`;
    },
  };
}

function stat(root: HTMLElement, label: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'stat';
  const name = document.createElement('span');
  name.className = 'stat-label';
  name.textContent = label;
  const value = document.createElement('span');
  value.className = 'stat-value';
  value.textContent = '0';
  wrap.append(name, value);
  root.append(wrap);
  return value;
}
