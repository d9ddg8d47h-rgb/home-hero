import { Flame, Sparkles } from "lucide-react";
import { computeBadges } from "@/lib/gamification";
import { Card, CardContent } from "@/components/ui/card";

export function ProgressSummary({
  doneToday,
  totalToday,
  streak,
  totalCompletions,
}: {
  doneToday: number;
  totalToday: number;
  streak: number;
  totalCompletions: number;
}) {
  const allDone = totalToday > 0 && doneToday === totalToday;
  const badges = computeBadges({ streak, totalCompletions }).filter((b) => b.achieved);

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10">
      <CardContent className="flex flex-col gap-3 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Today&apos;s progress
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {doneToday} / {totalToday} done
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1.5 text-sm font-semibold text-accent-foreground">
              <Flame className="h-4 w-4" />
              {streak} day{streak === 1 ? "" : "s"}
            </div>
          )}
        </div>

        {allDone && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
            <Sparkles className="h-4 w-4" />
            Awesome job — everything&apos;s done for today! 🎉
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
  );
}
