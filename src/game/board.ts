import {
  COLORS,
  type Board,
  type CellIndex,
  type Color,
  type Rng,
  type SparseBoard,
} from './types';

export const SIZE = 6;
export const CELL_COUNT = SIZE * SIZE;

export function rowOf(i: CellIndex): number {
  return Math.floor(i / SIZE);
}

export function colOf(i: CellIndex): number {
  return i % SIZE;
}

export function indexOf(row: number, col: number): CellIndex {
  return row * SIZE + col;
}

export function isValidIndex(i: number): i is CellIndex {
  return Number.isInteger(i) && i >= 0 && i < CELL_COUNT;
}

/** Orthogonal neighbors only, with row bounds respected (5 and 6 are not neighbors). */
export function areAdjacent(a: CellIndex, b: CellIndex): boolean {
  if (a === b) return false;
  const dr = Math.abs(rowOf(a) - rowOf(b));
  const dc = Math.abs(colOf(a) - colOf(b));
  return dr + dc === 1;
}

export function randomColor(rng: Rng, colors: readonly Color[] = COLORS): Color {
  const idx = Math.floor(rng() * colors.length);
  const color = colors[idx] ?? colors[0];
  if (color === undefined) throw new Error('randomColor: empty palette');
  return color;
}

export function createBoard(rng: Rng, colors: readonly Color[] = COLORS): Board {
  return Array.from({ length: CELL_COUNT }, () => randomColor(rng, colors));
}

export function colorAt(board: Board, i: CellIndex): Color {
  const c = board[i];
  if (c === undefined) throw new RangeError(`colorAt: index ${String(i)} out of range`);
  return c;
}

/** Null out the given cells. */
export function removeCells(board: Board, cells: ReadonlySet<CellIndex>): SparseBoard {
  return board.map((c, i) => (cells.has(i) ? null : c));
}

/** Every cell holding `color`. */
export function cellsOfColor(board: Board, color: Color): Set<CellIndex> {
  const out = new Set<CellIndex>();
  board.forEach((c, i) => {
    if (c === color) out.add(i);
  });
  return out;
}

/**
 * Collapse each column downward so gaps rise to the top, then refill the gaps with new colors.
 * Relative order of surviving dots within a column is preserved.
 */
export function applyGravity(
  sparse: SparseBoard,
  rng: Rng,
  colors: readonly Color[] = COLORS,
): Board {
  const out: Color[] = new Array<Color>(CELL_COUNT);
  for (let col = 0; col < SIZE; col++) {
    const survivors: Color[] = [];
    for (let row = 0; row < SIZE; row++) {
      const c = sparse[indexOf(row, col)];
      if (c !== null && c !== undefined) survivors.push(c);
    }
    const gap = SIZE - survivors.length;
    for (let row = 0; row < SIZE; row++) {
      // Rows above the gap index negative into survivors and fall through to a fresh color.
      out[indexOf(row, col)] = survivors[row - gap] ?? randomColor(rng, colors);
    }
  }
  return out;
}
