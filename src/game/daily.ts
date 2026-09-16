/** Calendar plumbing for the daily puzzle. Pure; dates come in, numbers come out. */

/** Daily #1. Local calendar date. */
export const DAILY_EPOCH = { year: 2026, month: 9, day: 15 } as const;

/** Local calendar date as YYYY-MM-DD. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${String(y)}-${m}-${d}`;
}

/** Whole days since the epoch, so that the epoch date is daily #1. DST-safe via UTC arithmetic. */
export function dailyNumber(date: Date): number {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const epoch = Date.UTC(DAILY_EPOCH.year, DAILY_EPOCH.month - 1, DAILY_EPOCH.day);
  return Math.round((today - epoch) / 86_400_000) + 1;
}

/** FNV-1a over UTF-16 code units, salted so the seed is not the bare date. */
export function hashString(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function dailySeed(dateKey: string): number {
  return hashString(`dotapp:daily:${dateKey}`);
}

export interface Stats {
  readonly played: number;
  readonly streak: number;
  readonly best: number;
  /** Daily number of the last completed puzzle, or 0. */
  readonly lastDaily: number;
}

export const EMPTY_STATS: Stats = { played: 0, streak: 0, best: 0, lastDaily: 0 };

/** Fold a finished daily into the stats. Replaying the same day is a no-op. */
export function recordDaily(stats: Stats, daily: number, score: number): Stats {
  if (daily === stats.lastDaily) return stats;
  const streak = daily === stats.lastDaily + 1 ? stats.streak + 1 : 1;
  return {
    played: stats.played + 1,
    streak,
    best: Math.max(stats.best, score),
    lastDaily: daily,
  };
}
