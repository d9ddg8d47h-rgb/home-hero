// Purely cosmetic — a little emoji per category so the exercise list feels
// less like a clinical form and more like a game board. No schema change:
// derived from the existing `category` string.

const CATEGORY_EMOJI: Record<string, string> = {
  "Gross Motor": "🐻",
  Strength: "💪",
  Balance: "🤸",
  Coordination: "🎯",
  Stretching: "🧘",
  "Functional Play": "🎈",
  Gait: "🚶",
  "Fine Motor": "✋",
  Core: "⭐",
  Sports: "⚽",
  Uncategorised: "🏅",
};

export function emojiForCategory(category: string | null | undefined): string {
  if (!category) return "🏅";
  return CATEGORY_EMOJI[category] ?? "🏅";
}
