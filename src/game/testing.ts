import { CELL_COUNT } from './board';
import type { Board, Color, Rng } from './types';

const LETTERS: Record<string, Color> = {
  r: 'red',
  y: 'yellow',
  b: 'blue',
  g: 'green',
  p: 'purple',
};

/** Build a board from a 6x6 letter grid: r y b g p. Whitespace is ignored. */
export function grid(text: string): Board {
  const cells = text
    .split('')
    .filter((ch) => /\S/.test(ch))
    .map((ch) => {
      const color = LETTERS[ch];
      if (!color) throw new Error(`grid: unknown letter '${ch}'`);
      return color;
    });
  if (cells.length !== CELL_COUNT) {
    throw new Error(`grid: expected ${String(CELL_COUNT)} cells, got ${String(cells.length)}`);
  }
  return cells;
}

/** Rng that always yields the same color index (0 = red, 1 = yellow, ...). */
export function constantRng(colorIndex: number, paletteSize = 5): Rng {
  return () => (colorIndex + 0.5) / paletteSize;
}
