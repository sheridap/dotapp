import { EMPTY_STATS, type Stats } from '../game/daily';

/** Persisted daily attempt: the accepted paths are enough to replay the game from its seed. */
export interface DailyRecord {
  readonly dateKey: string;
  readonly paths: readonly (readonly number[])[];
  readonly finished: boolean;
}

const DAILY_KEY = 'dotapp.daily.v1';
const STATS_KEY = 'dotapp.stats.v1';

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or blocked storage: the game still plays, it just will not resume.
  }
}

export function loadDaily(dateKey: string): DailyRecord | null {
  const rec = read(DAILY_KEY) as Partial<DailyRecord> | null;
  if (rec?.dateKey !== dateKey || !Array.isArray(rec.paths)) return null;
  return { dateKey, paths: rec.paths, finished: rec.finished === true };
}

export function saveDaily(rec: DailyRecord): void {
  write(DAILY_KEY, rec);
}

export function loadStats(): Stats {
  const s = read(STATS_KEY) as Partial<Stats> | null;
  if (!s) return EMPTY_STATS;
  return {
    played: s.played ?? 0,
    streak: s.streak ?? 0,
    best: s.best ?? 0,
    lastDaily: s.lastDaily ?? 0,
  };
}

export function saveStats(stats: Stats): void {
  write(STATS_KEY, stats);
}
