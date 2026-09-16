import { describe, expect, it } from 'vitest';
import type { MoveRecord } from './game';
import { resultGrid, shareText } from './share';

const path = (color: MoveRecord['color'], cleared = 3): MoveRecord => ({
  color,
  cleared,
  loop: false,
});
const loop = (color: MoveRecord['color'], cleared = 9): MoveRecord => ({
  color,
  cleared,
  loop: true,
});

describe('resultGrid', () => {
  it('uses squares for paths and circles for loops, ten per row', () => {
    const history = [...Array.from({ length: 9 }, () => path('red')), loop('blue'), path('green')];
    expect(resultGrid(history)).toBe('🟥🟥🟥🟥🟥🟥🟥🟥🟥🔵\n🟩');
  });

  it('is empty for no moves', () => {
    expect(resultGrid([])).toBe('');
  });
});

describe('shareText', () => {
  it('lays out number, score, loops, grid, url', () => {
    const text = shareText({
      daily: 7,
      score: 42,
      history: [path('yellow'), loop('purple')],
      url: 'https://example.test/',
    });
    expect(text).toBe('DotApp Daily #7\n42 dots · 1 loop\n🟨🟣\nhttps://example.test/');
  });

  it('pluralizes loops and omits an empty grid', () => {
    expect(shareText({ daily: 1, score: 0, history: [], url: 'u' })).toBe(
      'DotApp Daily #1\n0 dots · 0 loops\nu',
    );
  });
});
