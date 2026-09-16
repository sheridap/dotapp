import { applyGravity, createBoard, isValidIndex, removeCells } from './board';
import { cellsToClear, chainColor, startChain, stepChain, type Chain } from './chain';
import { COLORS, type Board, type CellIndex, type Rng } from './types';

export const DEFAULT_MOVES = 30;

export type GameStatus = 'playing' | 'over';

/** Immutable snapshot of a game. Every transition returns a new state. */
export interface GameState {
  readonly board: Board;
  readonly chain: Chain | null;
  readonly score: number;
  readonly movesLeft: number;
  readonly status: GameStatus;
}

export function newGame(rng: Rng, moves: number = DEFAULT_MOVES): GameState {
  return { board: createBoard(rng), chain: null, score: 0, movesLeft: moves, status: 'playing' };
}

export function pointerDown(state: GameState, index: CellIndex): GameState {
  if (state.status !== 'playing' || !isValidIndex(index)) return state;
  return { ...state, chain: startChain(index) };
}

export function pointerEnter(state: GameState, index: CellIndex): GameState {
  if (state.status !== 'playing' || state.chain === null || !isValidIndex(index)) return state;
  const { chain } = stepChain(state.board, state.chain, index);
  return chain === state.chain ? state : { ...state, chain };
}

/**
 * Release the pointer: clear what the chain earned, apply gravity, spend a move.
 * After a closed loop the refill for that turn never uses the cleared color.
 */
export function pointerUp(state: GameState, rng: Rng): GameState {
  if (state.chain === null) return state;
  const cleared = cellsToClear(state.board, state.chain);
  if (cleared.size === 0) return { ...state, chain: null };

  const loopColor = state.chain.closed ? chainColor(state.board, state.chain) : null;
  const palette = loopColor === null ? COLORS : COLORS.filter((c) => c !== loopColor);
  const board = applyGravity(removeCells(state.board, cleared), rng, palette);
  const movesLeft = state.movesLeft - 1;
  return {
    board,
    chain: null,
    score: state.score + cleared.size,
    movesLeft,
    status: movesLeft <= 0 ? 'over' : 'playing',
  };
}

/** Cancel an in-progress drag without spending a move. */
export function pointerCancel(state: GameState): GameState {
  return state.chain === null ? state : { ...state, chain: null };
}
