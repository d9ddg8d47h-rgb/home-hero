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

// Coins are a derived, display-only currency — never a spendable ledger —
// so there's no transactional integrity to worry about. 10 coins per
// completed set keeps the numbers feeling generous without a new column.
export function computeCoins(totalCompletions: number): number {
  return totalCompletions * 10;
}

export type HeroRank = {
  id: string;
  label: string;
  emoji: string;
  threshold: number; // coins required to reach this rank
  accessory: { emoji: string; label: string };
};

export const HERO_RANKS: HeroRank[] = [
  {
    id: "in-training",
    label: "Hero in Training",
    emoji: "🐣",
    threshold: 0,
    accessory: { emoji: "👟", label: "Training Shoes" },
  },
  {
    id: "rookie",
    label: "Rookie Hero",
    emoji: "🦸",
    threshold: 50,
    accessory: { emoji: "🧣", label: "Hero Cape" },
  },
  {
    id: "super",
    label: "Super Hero",
    emoji: "🦸‍♂️",
    threshold: 150,
    accessory: { emoji: "🎭", label: "Hero Mask" },
  },
  {
    id: "mega",
    label: "Mega Hero",
    emoji: "🌟",
    threshold: 300,
    accessory: { emoji: "⚡", label: "Power Belt" },
  },
  {
    id: "legendary",
    label: "Legendary Hero",
    emoji: "👑",
    threshold: 500,
    accessory: { emoji: "👑", label: "Golden Crown" },
  },
  {
    id: "ultra",
    label: "Ultra Hero",
    emoji: "💎",
    threshold: 1000,
    accessory: { emoji: "✨", label: "Golden Aura" },
  },
];

export function computeRank(totalCompletions: number) {
  const coins = computeCoins(totalCompletions);
  let current = HERO_RANKS[0];
  let next: HeroRank | null = null;

  for (let i = 0; i < HERO_RANKS.length; i++) {
    if (coins >= HERO_RANKS[i].threshold) {
      current = HERO_RANKS[i];
      next = HERO_RANKS[i + 1] ?? null;
    }
  }

  const progress = next
    ? Math.min(
        100,
        Math.round(((coins - current.threshold) / (next.threshold - current.threshold)) * 100)
      )
    : 100;

  return { current, next, progress, coins };
}

// Every avatar accessory a client has unlocked so far (one per rank
// reached), most-recently-earned first — used for the avatar picker and
// the "unlockable extras" display on Rewards.
export function unlockedAccessories(totalCompletions: number) {
  const coins = computeCoins(totalCompletions);
  return HERO_RANKS.filter((r) => coins >= r.threshold)
    .slice()
    .reverse()
    .map((r) => ({ ...r.accessory, rankId: r.id, rankLabel: r.label }));
}

// A small, freely-selectable set of base avatar emoji — no unlock gate,
// since the accessories above are the actual reward layer.
export const AVATAR_EMOJI_OPTIONS = [
  "🦸",
  "🦸‍♀️",
  "🦸‍♂️",
  "🐻",
  "🦁",
  "🐯",
  "🦊",
  "🐼",
  "🐨",
  "🦄",
  "🐸",
  "🐵",
  "🦖",
  "🐳",
  "🐢",
] as const;

// Weekly challenges rotate deterministically by ISO week number so every
// client sees the same challenge in a given week with no extra schema.
export type WeeklyChallenge = {
  id: string;
  label: string;
  emoji: string;
  target: number;
  unit: string;
};

const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  { id: "sets-15", label: "Complete 15 sets this week", emoji: "🎯", target: 15, unit: "sets" },
  { id: "days-4", label: "Exercise on 4 different days this week", emoji: "📅", target: 4, unit: "days" },
  { id: "sets-25", label: "Complete 25 sets this week", emoji: "🚀", target: 25, unit: "sets" },
  { id: "days-5", label: "Exercise on 5 different days this week", emoji: "🌈", target: 5, unit: "days" },
  { id: "sets-10", label: "Complete 10 sets this week", emoji: "⭐", target: 10, unit: "sets" },
];

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getWeeklyChallenge(forDate: Date = new Date()): WeeklyChallenge {
  const week = isoWeekNumber(forDate);
  return WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
}
