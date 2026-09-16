import { CELL_COUNT, SIZE, colOf, rowOf } from '../game/board';
import { capturedCells, chainColor } from '../game/chain';
import type { GameState } from '../game/game';
import type { CellIndex } from '../game/types';

export interface PointerHandlers {
  onDown(index: CellIndex): void;
  onEnter(index: CellIndex): void;
  onUp(): void;
  onCancel(): void;
}

export interface BoardView {
  render(state: GameState): void;
  destroy(): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** How close to a dot's center (as a fraction of cell size) the pointer must be to link it. */
const HIT_RADIUS = 0.42;

/**
 * Renders a GameState into `root` and translates pointer gestures into the four handler calls.
 * The 36 cell elements are built once; render() only updates classes and the connector path.
 */
export function createBoardView(root: HTMLElement, handlers: PointerHandlers): BoardView {
  root.classList.add('board');
  root.style.setProperty('--size', String(SIZE));

  const cells: HTMLElement[] = [];
  const dots: HTMLElement[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = String(i);
    const dot = document.createElement('div');
    dot.className = 'dot';
    cell.append(dot);
    root.append(cell);
    cells.push(cell);
    dots.push(dot);
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'connector');
  svg.setAttribute('viewBox', `0 0 ${String(SIZE)} ${String(SIZE)}`);
  const loopFill = document.createElementNS(SVG_NS, 'polygon');
  loopFill.setAttribute('class', 'loop-fill');
  const path = document.createElementNS(SVG_NS, 'polyline');
  svg.append(loopFill, path);
  root.append(svg);

  let dragging = false;
  let wasClosed = false;

  function cellIndexAt(x: number, y: number): CellIndex | null {
    const el = document.elementFromPoint(x, y);
    const cell = el?.closest<HTMLElement>('.cell');
    if (!cell || !root.contains(cell)) return null;
    const rect = cell.getBoundingClientRect();
    const dx = x - (rect.left + rect.width / 2);
    const dy = y - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) > rect.width * HIT_RADIUS) return null;
    const index = Number(cell.dataset.index);
    return Number.isInteger(index) ? index : null;
  }

  function onPointerDown(e: PointerEvent): void {
    if (!e.isPrimary) return;
    const index = cellIndexAt(e.clientX, e.clientY);
    if (index === null) return;
    e.preventDefault();
    dragging = true;
    handlers.onDown(index);
  }

  function onPointerMove(e: PointerEvent): void {
    if (!dragging || !e.isPrimary) return;
    const index = cellIndexAt(e.clientX, e.clientY);
    if (index !== null) handlers.onEnter(index);
  }

  function onPointerUp(e: PointerEvent): void {
    if (!dragging || !e.isPrimary) return;
    dragging = false;
    handlers.onUp();
  }

  function onPointerCancel(e: PointerEvent): void {
    if (!dragging || !e.isPrimary) return;
    dragging = false;
    handlers.onCancel();
  }

  /** Losing the window mid-drag (alt-tab, notification) never delivers pointerup. */
  function onBlur(): void {
    if (!dragging) return;
    dragging = false;
    handlers.onCancel();
  }

  root.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerCancel);
  window.addEventListener('blur', onBlur);

  function render(state: GameState): void {
    const chain = state.chain;
    const linked = new Set(chain?.cells ?? []);
    const closed = chain?.closed ?? false;
    const loopColor = chain && closed ? chainColor(state.board, chain) : null;
    const captured = chain ? capturedCells(chain) : new Set<CellIndex>();

    state.board.forEach((color, i) => {
      const dot = dots[i];
      const cell = cells[i];
      if (!dot || !cell) return;
      dot.className = `dot ${color}`;
      cell.classList.toggle('linked', linked.has(i));
      cell.classList.toggle('loop', loopColor !== null && color === loopColor);
      cell.classList.toggle('captured', captured.has(i));
    });

    if (chain && chain.cells.length > 1) {
      path.setAttribute('points', pointsOf(chain.cells));
      path.setAttribute('class', chainColor(state.board, chain));
    } else {
      path.removeAttribute('points');
      path.removeAttribute('class');
    }

    if (chain && closed && loopColor) {
      // The loop proper starts at the first occurrence of the closing cell.
      const closingCell = chain.cells[chain.cells.length - 1];
      const start = closingCell === undefined ? 0 : chain.cells.indexOf(closingCell);
      loopFill.setAttribute('points', pointsOf(chain.cells.slice(start)));
      loopFill.setAttribute('class', `loop-fill ${loopColor}`);
    } else {
      loopFill.removeAttribute('points');
      loopFill.setAttribute('class', 'loop-fill');
    }

    // Retrigger the close animation on each open-to-closed transition.
    if (closed && !wasClosed) {
      root.classList.remove('closing');
      root.getBoundingClientRect(); // force a reflow so the animation restarts
      root.classList.add('closing');
    } else if (!closed) {
      root.classList.remove('closing');
    }
    wasClosed = closed;

    root.classList.toggle('over', state.status === 'over');
  }

  function pointsOf(indices: readonly CellIndex[]): string {
    return indices.map((i) => `${String(colOf(i) + 0.5)},${String(rowOf(i) + 0.5)}`).join(' ');
  }

  function destroy(): void {
    root.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);
    window.removeEventListener('blur', onBlur);
    root.replaceChildren();
  }

  return { render, destroy };
}
