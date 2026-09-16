import { areAdjacent, cellsOfColor, colorAt, enclosedCells } from './board';
import type { Board, CellIndex, Color } from './types';

/**
 * The path the player is dragging. `cells` is the ordered path; when `closed` is true the last
 * entry repeats an earlier cell and the path forms a loop.
 */
export interface Chain {
  readonly cells: readonly CellIndex[];
  readonly closed: boolean;
}

export type ChainStep = 'extended' | 'backtracked' | 'closed' | 'rejected';

export interface ChainResult {
  readonly chain: Chain;
  readonly step: ChainStep;
}

export function startChain(index: CellIndex): Chain {
  return { cells: [index], closed: false };
}

export function chainColor(board: Board, chain: Chain): Color {
  const first = chain.cells[0];
  if (first === undefined) throw new Error('chainColor: empty chain');
  return colorAt(board, first);
}

/**
 * Apply one pointer move onto `index`. Rules, in order:
 *  - same cell as the head: no-op
 *  - the cell before the head: backtrack (undo the last link; reopens a closed loop)
 *  - once closed, nothing else is accepted
 *  - must be orthogonally adjacent to the head and the same color
 *  - a cell already in the path closes a loop
 *  - otherwise extend
 */
export function stepChain(board: Board, chain: Chain, index: CellIndex): ChainResult {
  const cells = chain.cells;
  const head = cells[cells.length - 1];
  if (head === undefined) return { chain, step: 'rejected' };
  if (head === index) return { chain, step: 'rejected' };

  const previous = cells[cells.length - 2];
  if (previous === index) {
    return { chain: { cells: cells.slice(0, -1), closed: false }, step: 'backtracked' };
  }
  if (chain.closed) return { chain, step: 'rejected' };
  if (!areAdjacent(head, index)) return { chain, step: 'rejected' };
  if (colorAt(board, index) !== chainColor(board, chain)) return { chain, step: 'rejected' };

  if (cells.includes(index)) {
    return { chain: { cells: [...cells, index], closed: true }, step: 'closed' };
  }
  return { chain: { cells: [...cells, index], closed: false }, step: 'extended' };
}

/** Cells of any color trapped inside a closed loop. Empty for an open chain. */
export function capturedCells(chain: Chain): Set<CellIndex> {
  if (!chain.closed) return new Set();
  return enclosedCells(new Set(chain.cells));
}

/**
 * Which cells a release would clear. A closed loop takes every dot of the chain's color plus every
 * dot it encloses; a path of two or more takes itself; a single dot takes nothing.
 */
export function cellsToClear(board: Board, chain: Chain): Set<CellIndex> {
  if (chain.closed) {
    const out = cellsOfColor(board, chainColor(board, chain));
    for (const i of capturedCells(chain)) out.add(i);
    return out;
  }
  if (chain.cells.length >= 2) return new Set(chain.cells);
  return new Set();
}
