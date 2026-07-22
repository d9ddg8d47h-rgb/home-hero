// Pure, framework-agnostic badge logic — importable from both server and
// client components. Kept deliberately simple: thresholds on total
// completions logged and current daily streak.

export type BadgeDef = {
  id: string;
  label: string;
  emoji: string;
  achieved: boolean;
};

export function computeBadges({
  streak,
  totalCompletions,
}: {
  streak: number;
  totalCompletions: number;
}): BadgeDef[] {
  return [
    { id: "first-step", label: "First Step", emoji: "⭐", achieved: totalCompletions >= 1 },
    { id: "ten-done", label: "10 Exercises Done", emoji: "🏅", achieved: totalCompletions >= 10 },
    { id: "fifty-done", label: "50 Exercises Done", emoji: "🏆", achieved: totalCompletions >= 50 },
    { id: "streak-3", label: "3-Day Streak", emoji: "🔥", achieved: streak >= 3 },
    { id: "streak-7", label: "7-Day Streak", emoji: "🔥🔥", achieved: streak >= 7 },
    { id: "streak-14", label: "2-Week Streak", emoji: "🔥🔥🔥", achieved: streak >= 14 },
  ];
}
