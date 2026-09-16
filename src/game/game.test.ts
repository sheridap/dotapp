import { describe, expect, it } from 'vitest';
import {
  newGame,
  pointerCancel,
  pointerDown,
  pointerEnter,
  pointerUp,
  type GameState,
} from './game';
import { seededRng } from './rng';
import { constantRng, grid } from './testing';

const board = grid(`
  r r b b b b
  r r b b b b
  r y y y b b
  b b b b b b
  b b b b b b
  b b b b b b
`);

function fixture(overrides: Partial<GameState> = {}): GameState {
  return {
    board,
    chain: null,
    score: 0,
    movesLeft: 30,
    status: 'playing',
    history: [],
    ...overrides,
  };
}

describe('game state machine', () => {
  it('starts with a full board and no chain', () => {
    const s = newGame(seededRng(1));
    expect(s.board).toHaveLength(36);
    expect(s.chain).toBeNull();
    expect(s.movesLeft).toBe(30);
    expect(s.status).toBe('playing');
  });

  it('a single tap clears nothing and spends no move', () => {
    const s = pointerUp(pointerDown(fixture(), 0), constantRng(0));
    expect(s.chain).toBeNull();
    expect(s.score).toBe(0);
    expect(s.movesLeft).toBe(30);
    expect(s.board).toBe(board);
  });

  it('a path of three clears three, scores three, spends one move', () => {
    let s = pointerDown(fixture(), 13);
    s = pointerEnter(s, 14);
    s = pointerEnter(s, 15);
    s = pointerUp(s, constantRng(4));
    expect(s.score).toBe(3);
    expect(s.movesLeft).toBe(29);
    expect(s.chain).toBeNull();
    expect(s.board[13]).toBe('red'); // dropped from row 1
    expect(s.board[14]).toBe('blue');
    expect(s.board[1]).toBe('purple'); // refilled
  });

  it('a closed loop clears the whole color', () => {
    let s = pointerDown(fixture(), 0);
    for (const i of [1, 7, 6, 0]) s = pointerEnter(s, i);
    s = pointerUp(s, constantRng(4));
    expect(s.score).toBe(5);
    expect(s.board.filter((c) => c === 'red')).toHaveLength(0);
  });

  it('a closed loop excludes its color from the refill, whatever the rng says', () => {
    for (let colorIndex = 0; colorIndex < 5; colorIndex++) {
      let s = pointerDown(fixture(), 0);
      for (const i of [1, 7, 6, 0]) s = pointerEnter(s, i);
      s = pointerUp(s, constantRng(colorIndex));
      expect(s.board.filter((c) => c === 'red')).toHaveLength(0);
      expect(s.board).toHaveLength(36);
    }
  });

  it('an open path still refills from the full palette', () => {
    let s = pointerDown(fixture(), 13);
    s = pointerEnter(s, 14);
    s = pointerUp(s, constantRng(1)); // yellow, the color just cleared
    expect(s.board[1]).toBe('yellow');
  });

  it('captured dots score and clear along with the loop color', () => {
    const ring = grid(`
      r r r b b b
      r g r b b b
      r r r b b b
      b b b b b b
      b b b b b b
      b b b b b b
    `);
    let s = pointerDown(fixture({ board: ring }), 0);
    for (const i of [1, 2, 8, 14, 13, 12, 6, 0]) s = pointerEnter(s, i);
    s = pointerUp(s, constantRng(1)); // blue once red is excluded
    expect(s.score).toBe(9);
    expect(s.board.filter((c) => c === 'green')).toHaveLength(0);
    expect(s.board.filter((c) => c === 'red')).toHaveLength(0);
  });

  it('ignores moves that are not valid extensions', () => {
    const s = pointerEnter(pointerDown(fixture(), 0), 2);
    expect(s.chain?.cells).toEqual([0]);
  });

  it('ends the game when the last move is spent', () => {
    let s = pointerDown(fixture({ movesLeft: 1 }), 0);
    s = pointerEnter(s, 1);
    s = pointerUp(s, constantRng(0));
    expect(s.status).toBe('over');
    expect(pointerDown(s, 0).chain).toBeNull();
  });

  it('cancel drops the chain without spending a move', () => {
    const s = pointerCancel(pointerEnter(pointerDown(fixture(), 0), 1));
    expect(s.chain).toBeNull();
    expect(s.movesLeft).toBe(30);
  });

  it('records each spent move in history', () => {
    let s = pointerDown(fixture(), 13);
    s = pointerEnter(s, 14);
    s = pointerUp(s, constantRng(0));
    s = pointerDown(s, 0);
    for (const i of [1, 7, 6, 0]) s = pointerEnter(s, i);
    s = pointerUp(s, constantRng(1));
    // The red refill after move one puts three more reds on the board before the loop.
    expect(s.history).toEqual([
      { color: 'yellow', cleared: 2, loop: false },
      { color: 'red', cleared: 7, loop: true },
    ]);
  });

  it('a no-op release leaves history untouched', () => {
    const s = pointerUp(pointerDown(fixture(), 0), constantRng(0));
    expect(s.history).toEqual([]);
  });

  it('pointerEnter without a chain is a no-op', () => {
    const s = fixture();
    expect(pointerEnter(s, 3)).toBe(s);
  });
});
