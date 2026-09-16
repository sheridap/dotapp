import { describe, expect, it } from 'vitest';
import { createBoard } from './board';
import {
  dailyNumber,
  dailySeed,
  EMPTY_STATS,
  hashString,
  localDateKey,
  recordDaily,
} from './daily';
import { seededRng } from './rng';

describe('localDateKey', () => {
  it('formats the local calendar date with zero padding', () => {
    expect(localDateKey(new Date(2026, 8, 16, 23, 59))).toBe('2026-09-16');
    expect(localDateKey(new Date(2027, 0, 5, 0, 1))).toBe('2027-01-05');
  });
});

describe('dailyNumber', () => {
  it('starts at 1 on the epoch day and counts local days', () => {
    expect(dailyNumber(new Date(2026, 8, 15, 0, 0))).toBe(1);
    expect(dailyNumber(new Date(2026, 8, 15, 23, 59))).toBe(1);
    expect(dailyNumber(new Date(2026, 8, 16, 0, 0))).toBe(2);
    expect(dailyNumber(new Date(2026, 10, 2, 12, 0))).toBe(49); // across the DST change
  });
});

describe('dailySeed', () => {
  it('is stable for a date and differs between dates', () => {
    expect(dailySeed('2026-09-16')).toBe(dailySeed('2026-09-16'));
    expect(dailySeed('2026-09-16')).not.toBe(dailySeed('2026-09-17'));
    expect(hashString('a')).not.toBe(hashString('b'));
  });

  it('produces the same board for every player on the same day', () => {
    const a = createBoard(seededRng(dailySeed('2026-09-16')));
    const b = createBoard(seededRng(dailySeed('2026-09-16')));
    expect(a).toEqual(b);
  });
});

describe('recordDaily', () => {
  it('starts a streak on the first play', () => {
    expect(recordDaily(EMPTY_STATS, 5, 40)).toEqual({
      played: 1,
      streak: 1,
      best: 40,
      lastDaily: 5,
    });
  });

  it('extends the streak on consecutive days and resets after a gap', () => {
    const day5 = recordDaily(EMPTY_STATS, 5, 40);
    const day6 = recordDaily(day5, 6, 30);
    expect(day6.streak).toBe(2);
    expect(day6.best).toBe(40);
    const day9 = recordDaily(day6, 9, 55);
    expect(day9.streak).toBe(1);
    expect(day9.played).toBe(3);
    expect(day9.best).toBe(55);
  });

  it('ignores a repeat of the same day', () => {
    const day5 = recordDaily(EMPTY_STATS, 5, 40);
    expect(recordDaily(day5, 5, 99)).toBe(day5);
  });
});
