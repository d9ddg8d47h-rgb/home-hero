// Pure, framework-agnostic gamification logic — importable from both
// server and client components. Badges are computed off the *best-ever*
// streak (not the current one) so earning a badge is permanent and never
// disappears just because today's streak reset — that would undercut the
// whole point of a reward.

export type BadgeDef = {
  id: string;
  label: string;
  emoji: string;
  criteria: string;
  achieved: boolean;
};

export function computeBadges({
  bestStreak,
  totalCompletions,
}: {
  bestStreak: number;
  totalCompletions: number;
}): BadgeDef[] {
  return [
    {
      id: "first-step",
      label: "First Step",
      emoji: "⭐",
      criteria: "Complete your first exercise",
      achieved: totalCompletions >= 1,
    },
    {
      id: "ten-done",
      label: "10 Exercises Done",
      emoji: "🏅",
      criteria: "Complete 10 exercises",
      achieved: totalCompletions >= 10,
    },
    {
      id: "fifty-done",
      label: "50 Exercises Done",
      emoji: "🏆",
      criteria: "Complete 50 exercises",
      achieved: totalCompletions >= 50,
    },
    {
      id: "hundred-done",
      label: "100 Exercises Done",
      emoji: "💎",
      criteria: "Complete 100 exercises",
      achieved: totalCompletions >= 100,
    },
    {
      id: "streak-3",
      label: "3-Day Streak",
      emoji: "🔥",
      criteria: "Do at least one exercise 3 days in a row",
      achieved: bestStreak >= 3,
    },
    {
      id: "streak-7",
      label: "7-Day Streak",
      emoji: "🔥🔥",
      criteria: "Do at least one exercise 7 days in a row",
      achieved: bestStreak >= 7,
    },
    {
      id: "streak-14",
      label: "2-Week Streak",
      emoji: "🔥🔥🔥",
      criteria: "Do at least one exercise 14 days in a row",
      achieved: bestStreak >= 14,
    },
    {
      id: "streak-30",
      label: "1-Month Streak",
      emoji: "👑",
      criteria: "Do at least one exercise 30 days in a row",
      achieved: bestStreak >= 30,
    },
  ];
}

export type HeroRank = {
  id: string;
  label: string;
  emoji: string;
  threshold: number;
};

export const HERO_RANKS: HeroRank[] = [
  { id: "in-training", label: "Hero in Training", emoji: "🐣", threshold: 0 },
  { id: "rookie", label: "Rookie Hero", emoji: "🦸", threshold: 5 },
  { id: "super", label: "Super Hero", emoji: "🦸‍♂️", threshold: 15 },
  { id: "mega", label: "Mega Hero", emoji: "🌟", threshold: 30 },
  { id: "legendary", label: "Legendary Hero", emoji: "👑", threshold: 50 },
  { id: "ultra", label: "Ultra Hero", emoji: "💎", threshold: 100 },
];

export function computeRank(totalCompletions: number) {
  let current = HERO_RANKS[0];
  let next: HeroRank | null = null;

  for (let i = 0; i < HERO_RANKS.length; i++) {
    if (totalCompletions >= HERO_RANKS[i].threshold) {
      current = HERO_RANKS[i];
      next = HERO_RANKS[i + 1] ?? null;
    }
  }

  const progress = next
    ? Math.min(
        100,
        Math.round(
          ((totalCompletions - current.threshold) / (next.threshold - current.threshold)) * 100
        )
      )
    : 100;

  return { current, next, progress };
}
