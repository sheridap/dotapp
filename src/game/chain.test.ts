import { describe, expect, it } from 'vitest';
import { capturedCells, cellsToClear, startChain, stepChain, type Chain } from './chain';
import { grid } from './testing';

const board = grid(`
  r r b b b b
  r r b b b b
  r y y y b b
  b b b b b b
  b b b b b b
  b b b b b b
`);

function walk(start: number, path: number[]): Chain {
  let chain = startChain(start);
  for (const i of path) chain = stepChain(board, chain, i).chain;
  return chain;
}

describe('stepChain', () => {
  it('extends to an adjacent same-color cell', () => {
    const { chain, step } = stepChain(board, startChain(0), 1);
    expect(step).toBe('extended');
    expect(chain.cells).toEqual([0, 1]);
  });

  it('ignores re-entering the head cell', () => {
    const { step } = stepChain(board, startChain(0), 0);
    expect(step).toBe('rejected');
  });

  it('rejects a color mismatch', () => {
    const { chain, step } = stepChain(board, startChain(1), 2);
    expect(step).toBe('rejected');
    expect(chain.cells).toEqual([1]);
  });

  it('rejects non-adjacent and row-wrapped cells', () => {
    expect(stepChain(board, startChain(0), 7).step).toBe('rejected');
    expect(stepChain(board, walk(0, [1, 2, 3, 4, 5]), 6).step).toBe('rejected');
  });

  it('treats stepping back onto the previous cell as undo', () => {
    const { chain, step } = stepChain(board, walk(0, [1, 7]), 1);
    expect(step).toBe('backtracked');
    expect(chain.cells).toEqual([0, 1]);
  });

  it('does not treat a one-step backtrack as a closed loop (legacy bug)', () => {
    const { step } = stepChain(board, walk(0, [1, 7, 6]), 7);
    expect(step).toBe('backtracked');
  });

  it('closes a loop when revisiting an earlier cell', () => {
    const { chain, step } = stepChain(board, walk(0, [1, 7, 6]), 0);
    expect(step).toBe('closed');
    expect(chain.closed).toBe(true);
    expect(chain.cells).toEqual([0, 1, 7, 6, 0]);
  });

  it('refuses to extend a closed loop but allows backtracking out of it', () => {
    const closed = walk(0, [1, 7, 6, 0]);
    expect(stepChain(board, closed, 12).step).toBe('rejected');
    const { chain, step } = stepChain(board, closed, 6);
    expect(step).toBe('backtracked');
    expect(chain.closed).toBe(false);
    expect(chain.cells).toEqual([0, 1, 7, 6]);
  });
});

describe('cellsToClear', () => {
  it('clears nothing for a single dot', () => {
    expect(cellsToClear(board, startChain(0)).size).toBe(0);
  });

  it('clears the path for two or more dots', () => {
    expect([...cellsToClear(board, walk(13, [14, 15]))].sort((a, b) => a - b)).toEqual([
      13, 14, 15,
    ]);
  });

  it('clears every dot of the color for a closed loop', () => {
    const cleared = cellsToClear(board, walk(0, [1, 7, 6, 0]));
    expect([...cleared].sort((a, b) => a - b)).toEqual([0, 1, 6, 7, 12]);
  });
});

describe('enclosure capture', () => {
  const ring = grid(`
    r r r b b b
    r g r b b b
    r r r b b b
    b b b b b b
    b b b b b b
    b b b b b r
  `);
  const sorted = (s: Set<number>) => [...s].sort((a, b) => a - b);

  function loop(b: typeof ring, start: number, path: number[]): Chain {
    let chain = startChain(start);
    for (const i of path) chain = stepChain(b, chain, i).chain;
    expect(chain.closed).toBe(true);
    return chain;
  }

  it('a 3x3 ring captures its center', () => {
    const chain = loop(ring, 0, [1, 2, 8, 14, 13, 12, 6, 0]);
    expect(sorted(capturedCells(chain))).toEqual([7]);
    expect(sorted(cellsToClear(ring, chain))).toEqual([0, 1, 2, 6, 7, 8, 12, 13, 14, 35]);
  });

  it('a 2x2 loop captures nothing', () => {
    const chain = loop(board, 0, [1, 7, 6, 0]);
    expect(capturedCells(chain).size).toBe(0);
  });

  it('an open chain captures nothing', () => {
    expect(capturedCells(startChain(0)).size).toBe(0);
  });

  it('a ring with a tail still captures only the ring interior', () => {
    const tailed = grid(`
      r r r b b b
      r g r b b b
      r r r b b b
      r b b b b b
      b b b b b b
      b b b b b b
    `);
    const chain = loop(tailed, 18, [12, 6, 0, 1, 2, 8, 14, 13, 12]);
    expect(sorted(capturedCells(chain))).toEqual([7]);
  });

  it('a 4x4 ring captures a mixed 2x2 interior', () => {
    const big = grid(`
      y y y y b b
      y g p y b b
      y b r y b b
      y y y y b b
      b b b b b b
      b b b b b b
    `);
    const chain = loop(big, 0, [1, 2, 3, 9, 15, 21, 20, 19, 18, 12, 6, 0]);
    expect(sorted(capturedCells(chain))).toEqual([7, 8, 13, 14]);
    expect(cellsToClear(big, chain).size).toBe(16);
  });

  it('the board edge is not a wall: a corner loop leaves outside cells alone', () => {
    const chain = loop(board, 0, [1, 7, 6, 0]);
    expect(cellsToClear(board, chain).has(2)).toBe(false);
  });
});
