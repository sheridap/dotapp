import type { Stats } from '../game/daily';
import type { GameState } from '../game/game';
import { resultGrid, shareText } from '../game/share';

export type Mode = 'daily' | 'free';

export interface DailyPanelState {
  readonly mode: Mode;
  readonly daily: number;
  readonly game: GameState;
  readonly stats: Stats;
}

export interface DailyPanel {
  render(s: DailyPanelState): void;
}

/** Mode switch above the board, result card and share control below it once the daily is over. */
export function createDailyPanel(
  top: HTMLElement,
  bottom: HTMLElement,
  onMode: (mode: Mode) => void,
  shareUrl: string,
): DailyPanel {
  top.classList.add('mode-bar');
  bottom.classList.add('result');
  bottom.hidden = true;

  const dailyBtn = modeButton('Daily', () => {
    onMode('daily');
  });
  const freeBtn = modeButton('Free play', () => {
    onMode('free');
  });
  top.append(dailyBtn, freeBtn);

  const summary = document.createElement('p');
  summary.className = 'result-summary';
  const grid = document.createElement('pre');
  grid.className = 'result-grid';
  const statsLine = document.createElement('p');
  statsLine.className = 'result-stats';
  const share = document.createElement('button');
  share.type = 'button';
  share.className = 'share';
  share.textContent = 'Share';
  bottom.append(summary, grid, statsLine, share);

  let current: DailyPanelState | null = null;

  share.addEventListener('click', () => {
    if (!current) return;
    const text = shareText({
      daily: current.daily,
      score: current.game.score,
      history: current.game.history,
      url: shareUrl,
    });
    void deliver(text).then((how) => {
      share.textContent = how === 'copied' ? 'Copied' : 'Share';
      if (how === 'copied') setTimeout(() => (share.textContent = 'Share'), 1500);
    });
  });

  return {
    render(s) {
      current = s;
      dailyBtn.textContent = `Daily #${String(s.daily)}`;
      dailyBtn.classList.toggle('active', s.mode === 'daily');
      freeBtn.classList.toggle('active', s.mode === 'free');

      const show = s.mode === 'daily' && s.game.status === 'over';
      bottom.hidden = !show;
      if (!show) return;

      const loops = s.game.history.filter((m) => m.loop).length;
      summary.textContent = `Daily #${String(s.daily)} done: ${String(s.game.score)} dots, ${String(loops)} ${loops === 1 ? 'loop' : 'loops'}.`;
      grid.textContent = resultGrid(s.game.history);
      statsLine.textContent = `Streak ${String(s.stats.streak)} · Best ${String(s.stats.best)} · Played ${String(s.stats.played)}`;
    },
  };
}

function modeButton(label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'mode';
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

/** Web Share where it exists, otherwise the clipboard. */
async function deliver(text: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ text });
      return 'shared';
    }
  } catch {
    // user dismissed the sheet; fall through to the clipboard
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
