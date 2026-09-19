import type { WgerTrophy } from "@/lib/wger";

export interface TrophyProgress extends WgerTrophy {
  unlocked: boolean;
  progress: number;
  target: number;
  current: number;
}

function targetFromDescription(trophy: WgerTrophy): number {
  const match = trophy.description.match(/(\d[\d\s.]*)/);
  return match ? Number.parseInt(match[1].replace(/[^\d]/g, ""), 10) || 1 : 1;
}

function uniqueDates(sessions: { date?: string }[]): string[] {
  return [...new Set(sessions.map(session => session.date).filter((date): date is string => Boolean(date)))].sort();
}

function longestStreak(dates: string[]): number {
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;
  for (const value of dates) {
    const date = new Date(`${value}T00:00:00Z`);
    const gap = previous ? Math.round((date.getTime() - previous.getTime()) / 86400000) : 0;
    current = gap === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = date;
  }
  return longest;
}

function weekendStreak(sessions: { date?: string }[]): number {
  const weekends = new Set<string>();
  for (const session of sessions) {
    if (!session.date) continue;
    const date = new Date(`${session.date}T00:00:00Z`);
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
      const saturday = new Date(date);
      saturday.setUTCDate(date.getUTCDate() - (date.getUTCDay() === 0 ? 1 : 0));
      weekends.add(saturday.toISOString().slice(0, 10));
    }
  }
  const sorted = [...weekends].sort();
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;
  for (const value of sorted) {
    const date = new Date(`${value}T00:00:00Z`);
    const gap = previous ? Math.round((date.getTime() - previous.getTime()) / 86400000) : 0;
    current = gap === 7 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = date;
  }
  return longest;
}

export function calculateTrophyProgress(
  trophies: WgerTrophy[],
  sessions: { date?: string; totalSets?: number; exerciseResults?: { weightUsed?: number; repsCompleted?: number; setsCompleted?: number; sets?: { completed?: boolean; skipped?: boolean; weightUsed?: number; repsCompleted?: number }[] }[] }[],
): TrophyProgress[] {
  const dates = uniqueDates(sessions);
  const totalVolume = sessions.reduce((total, session) => total + (session.exerciseResults ?? []).reduce(
    (sum, result) => {
      if (result.sets?.length) {
        return sum + result.sets.reduce(
          (setTotal, set) => set.completed && !set.skipped
            ? setTotal + (set.weightUsed ?? 0) * (set.repsCompleted ?? 0)
            : setTotal,
          0,
        );
      }
      return sum + (result.weightUsed ?? 0) * (result.repsCompleted ?? result.setsCompleted ?? 1);
    },
    0,
  ), 0);
  const streak = longestStreak(dates);
  const weekends = weekendStreak(sessions);

  return trophies
    .filter(trophy => !trophy.is_hidden)
    .sort((a, b) => a.order - b.order)
    .map(trophy => {
      const target = targetFromDescription(trophy);
      const current = trophy.trophy_type === "count"
        ? sessions.length
        : trophy.trophy_type === "volume"
          ? Math.round(totalVolume)
          : trophy.name.toLowerCase().includes("week-end") || trophy.name.toLowerCase().includes("weekend")
            ? weekends
            : streak;
      return { ...trophy, target, current, progress: Math.min(100, Math.round((current / target) * 100)), unlocked: current >= target };
    });
}
