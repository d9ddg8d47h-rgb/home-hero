import { Flame } from "lucide-react";
import { computeBadges } from "@/lib/gamification";
import { Card, CardContent } from "@/components/ui/card";
import { CelebrationEffects } from "@/components/client/celebration-effects";

function mascotMessage({
  doneToday,
  totalToday,
  streak,
}: {
  doneToday: number;
  totalToday: number;
  streak: number;
}) {
  if (totalToday === 0) {
    return { emoji: "🦸", text: "Your hero adventure starts here!" };
  }
  if (doneToday === 0) {
    return { emoji: "🦸", text: "Ready when you are!" };
  }
  if (doneToday < totalToday) {
    if (streak >= 3) {
      return { emoji: "🦸‍♂️", text: `${streak}-day streak — keep it going!` };
    }
    return { emoji: "🦸‍♂️", text: "Great start — keep going!" };
  }
  return { emoji: "🦸‍♀️✨", text: "You're a Home Hero today!" };
}

export function ProgressSummary({
  doneToday,
  totalToday,
  streak,
  longestStreak,
  totalCompletions,
}: {
  doneToday: number;
  totalToday: number;
  streak: number;
  longestStreak: number;
  totalCompletions: number;
}) {
  const allDone = totalToday > 0 && doneToday === totalToday;
  const badges = computeBadges({ bestStreak: longestStreak, totalCompletions }).filter(
    (b) => b.achieved
  );
  const mascot = mascotMessage({ doneToday, totalToday, streak });

  return (
    <>
      <CelebrationEffects trigger={allDone} />
      <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10">
        <CardContent className="flex flex-col gap-3 py-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              {mascot.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{mascot.text}</p>
              <p className="text-xs text-muted-foreground">
                {doneToday} / {totalToday} done today
              </p>
            </div>
            {streak > 0 && (
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-accent/20 px-3 py-1.5 text-sm font-semibold text-accent-foreground">
                <Flame className="h-4 w-4" />
                {streak}
              </div>
            )}
          </div>

          {allDone && (
            <p className="text-center text-sm font-medium text-secondary">
              🎉 Everything&apos;s done for today — amazing work!
            </p>
          )}

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {badges.map((b) => (
                <span
                  key={b.id}
                  className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-semibold shadow-sm"
                  title={b.label}
                >
                  <span>{b.emoji}</span>
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
