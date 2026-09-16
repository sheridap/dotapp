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
  return { board, chain: null, score: 0, movesLeft: 30, status: 'playing', ...overrides };
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

  it('pointerEnter without a chain is a no-op', () => {
    const s = fixture();
    expect(pointerEnter(s, 3)).toBe(s);
  });
});
