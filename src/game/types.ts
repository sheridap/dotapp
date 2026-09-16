/** Dot colors. The tuple order is the palette order used by the view. */
export const COLORS = ['red', 'yellow', 'blue', 'green', 'purple'] as const;
export type Color = (typeof COLORS)[number];

/** Random source returning a float in [0, 1). Injected so tests are deterministic. */
export type Rng = () => number;

/** Board index, row-major, 0 at top-left. */
export type CellIndex = number;

/** A board is a fixed-length array of colors. */
export type Board = readonly Color[];

/** Working board during a clear, before refill. */
export type SparseBoard = readonly (Color | null)[];
