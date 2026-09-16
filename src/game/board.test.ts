import { describe, expect, it } from 'vitest';
import { applyGravity, areAdjacent, cellsOfColor, createBoard, removeCells, SIZE } from './board';
import { seededRng } from './rng';
import { constantRng, grid } from './testing';
import { COLORS } from './types';

describe('areAdjacent', () => {
  it('accepts orthogonal neighbors', () => {
    expect(areAdjacent(0, 1)).toBe(true);
    expect(areAdjacent(0, 6)).toBe(true);
    expect(areAdjacent(35, 29)).toBe(true);
    expect(areAdjacent(14, 13)).toBe(true);
  });

  it('does not wrap across row edges (legacy bug)', () => {
    expect(areAdjacent(5, 6)).toBe(false);
    expect(areAdjacent(11, 12)).toBe(false);
    expect(areAdjacent(6, 5)).toBe(false);
  });

  it('rejects diagonals, self, and distant cells', () => {
    expect(areAdjacent(0, 7)).toBe(false);
    expect(areAdjacent(3, 3)).toBe(false);
    expect(areAdjacent(0, 12)).toBe(false);
  });
});

describe('createBoard', () => {
  it('fills every cell with a palette color, deterministically per seed', () => {
    const a = createBoard(seededRng(42));
    const b = createBoard(seededRng(42));
    expect(a).toHaveLength(SIZE * SIZE);
    expect(a).toEqual(b);
    for (const c of a) expect(COLORS).toContain(c);
  });
});

describe('applyGravity', () => {
  const board = grid(`
    r y b g p r
    y b g p r y
    b g p r y b
    g p r y b g
    p r y b g p
    r y b g p r
  `);

  it('drops the column above a single removed cell and refills the top', () => {
    const sparse = removeCells(board, new Set([14])); // row 2, col 2 (p)
    const next = applyGravity(sparse, constantRng(0)); // refill red
    expect(next[2]).toBe('red'); // new dot at top of col 2
    expect(next[8]).toBe('blue'); // was at index 2
    expect(next[14]).toBe('green'); // was at index 8
    expect(next[20]).toBe('red'); // untouched below the gap
    expect(next[26]).toBe('yellow');
    expect(next[32]).toBe('blue');
    // other columns untouched
    expect(next.filter((_, i) => i % SIZE !== 2)).toEqual(board.filter((_, i) => i % SIZE !== 2));
  });

  it('handles two removed cells stacked in one column (legacy crash)', () => {
    const sparse = removeCells(board, new Set([2, 8]));
    const next = applyGravity(sparse, constantRng(1)); // refill yellow
    expect(next[2]).toBe('yellow');
    expect(next[8]).toBe('yellow');
    expect(next[14]).toBe('purple');
    expect(next[20]).toBe('red');
    expect(next[32]).toBe('blue');
  });

  it('refills an entirely removed column', () => {
    const all = new Set([0, 6, 12, 18, 24, 30]);
    const next = applyGravity(removeCells(board, all), constantRng(4));
    for (const i of all) expect(next[i]).toBe('purple');
  });
});

describe('cellsOfColor', () => {
  it('finds every cell of a color', () => {
    const board = grid(`
      r r b b b b
      r r b b b b
      b b b b b b
      b b b b b b
      b b b b b b
      b b b b b r
    `);
    expect([...cellsOfColor(board, 'red')].sort((a, b) => a - b)).toEqual([0, 1, 6, 7, 35]);
  });
});
