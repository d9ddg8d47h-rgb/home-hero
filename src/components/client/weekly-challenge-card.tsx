import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyChallengeProgress } from "@/lib/actions/completions";

export function WeeklyChallengeCard({ progress }: { progress: WeeklyChallengeProgress }) {
  const { challenge, current, complete } = progress;
  const pct = Math.round((current / challenge.target) * 100);

  return (
    <Card className={complete ? "border-secondary bg-secondary/5" : undefined}>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden="true">{challenge.emoji}</span>
            Weekly challenge
          </p>
          {complete && <span className="text-xs font-semibold text-secondary">Complete! 🎉</span>}
        </div>
        <p className="text-sm text-muted-foreground">{challenge.label}</p>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <p className="text-right text-xs text-muted-foreground">
          {current} / {challenge.target} {challenge.unit}
        </p>
      </CardContent>
    </Card>
  );
}
