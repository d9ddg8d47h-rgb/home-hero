import { Flame, Lock } from "lucide-react";
import { requireClient } from "@/lib/dal";
import { getClientProgress } from "@/lib/actions/completions";
import { getOpenedChestKeys } from "@/lib/actions/rewards";
import { computeBadges, computeRank } from "@/lib/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarPicker } from "@/components/client/avatar-picker";
import { ChestGrid } from "@/components/client/chest-grid";
import { cn } from "@/lib/utils";

export default async function RewardsPage() {
  const client = await requireClient();
  const [progress, openedChestKeys] = await Promise.all([
    getClientProgress(client.id),
    getOpenedChestKeys(client.id),
  ]);

  const rank = computeRank(progress.totalCompletions);
  const badges = computeBadges({
    bestStreak: progress.longestStreak,
    totalCompletions: progress.totalCompletions,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rewards</h1>
        <p className="text-sm text-muted-foreground">Everything you&apos;ve earned so far</p>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10">
        <CardContent className="flex flex-col gap-3 py-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              {rank.current.emoji}
            </span>
            <div>
              <p className="text-lg font-bold leading-tight">{rank.current.label}</p>
              <p className="text-xs text-muted-foreground">
                {progress.totalCompletions} set{progress.totalCompletions === 1 ? "" : "s"}{" "}
                completed all time
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-3 py-1.5 text-sm font-bold text-primary">
              🪙 {rank.coins}
            </div>
          </div>

          {rank.next ? (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{rank.current.label}</span>
                <span>
                  {rank.next.emoji} {rank.next.label}
                </span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${rank.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-sm font-medium text-secondary">
              🎉 You&apos;ve reached the top rank!
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <div className="flex items-center gap-1.5 text-2xl font-bold">
              <Flame className="h-6 w-6 text-accent" />
              {progress.streak}
            </div>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <div className="flex items-center gap-1.5 text-2xl font-bold">
              🏆 {progress.longestStreak}
            </div>
            <p className="text-xs text-muted-foreground">Best streak ever</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarPicker current={client.avatar_emoji} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treasure chests</CardTitle>
          <p className="text-xs text-muted-foreground">
            Earn coins to unlock a chest, then tap to reveal your prize
          </p>
        </CardHeader>
        <CardContent>
          <ChestGrid coins={rank.coins} openedKeys={Array.from(openedChestKeys)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-3 text-center",
                  b.achieved
                    ? "border-secondary/40 bg-secondary/10"
                    : "border-border bg-muted/50"
                )}
              >
                <span className={cn("text-3xl", !b.achieved && "opacity-30 grayscale")}>
                  {b.emoji}
                </span>
                <p
                  className={cn(
                    "text-xs font-semibold",
                    !b.achieved && "text-muted-foreground"
                  )}
                >
                  {b.label}
                </p>
                {!b.achieved && (
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    {b.criteria}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
