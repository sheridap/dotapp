import type { MoveRecord } from './game';
import type { Color } from './types';

const SQUARE: Record<Color, string> = {
  red: '🟥',
  yellow: '🟨',
  blue: '🟦',
  green: '🟩',
  purple: '🟪',
};

const CIRCLE: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  blue: '🔵',
  green: '🟢',
  purple: '🟣',
};

const PER_ROW = 10;

/** One glyph per move: a square for a path clear, a circle for a closed loop. Rows of ten. */
export function resultGrid(history: readonly MoveRecord[]): string {
  const glyphs = history.map((m) => (m.loop ? CIRCLE[m.color] : SQUARE[m.color]));
  const rows: string[] = [];
  for (let i = 0; i < glyphs.length; i += PER_ROW) {
    rows.push(glyphs.slice(i, i + PER_ROW).join(''));
  }
  return rows.join('\n');
}

export interface ShareInput {
  readonly daily: number;
  readonly score: number;
  readonly history: readonly MoveRecord[];
  readonly url: string;
}

export function shareText(input: ShareInput): string {
  const loops = input.history.filter((m) => m.loop).length;
  const loopLine = loops === 1 ? '1 loop' : `${String(loops)} loops`;
  const lines = [
    `DotApp Daily #${String(input.daily)}`,
    `${String(input.score)} dots · ${loopLine}`,
    resultGrid(input.history),
    input.url,
  ];
  return lines.filter((l) => l.length > 0).join('\n');
}
