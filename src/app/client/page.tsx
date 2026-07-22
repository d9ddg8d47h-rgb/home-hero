import Link from "next/link";
import { ChevronRight, Flame, Trophy } from "lucide-react";
import { requireClient } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { getClientProgress } from "@/lib/actions/completions";
import { computeBadges, computeRank } from "@/lib/gamification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    return { emoji: "🦸", text: "Ready for today's program?" };
  }
  if (doneToday < totalToday) {
    if (streak >= 3) {
      return { emoji: "🦸‍♂️", text: `${streak}-day streak — keep it going!` };
    }
    return { emoji: "🦸‍♂️", text: "You're on your way — keep going!" };
  }
  return { emoji: "🦸‍♀️✨", text: "You're a Home Hero today!" };
}

export default async function ClientDashboard() {
  const client = await requireClient();
  const supabase = await createClient();

  const [{ data: prescriptions }, progress] = await Promise.all([
    supabase.from("prescriptions").select("id, sets").eq("client_id", client.id),
    getClientProgress(client.id),
  ]);

  const totalToday = prescriptions?.length ?? 0;
  const doneToday = (prescriptions ?? []).filter((p) => {
    const total = p.sets ?? 1;
    return (progress.todaySetsDone[p.id] ?? 0) >= total;
  }).length;

  const allDone = totalToday > 0 && doneToday === totalToday;
  const mascot = mascotMessage({ doneToday, totalToday, streak: progress.streak });
  const rank = computeRank(progress.totalCompletions);
  const badgeCount = computeBadges({
    bestStreak: progress.longestStreak,
    totalCompletions: progress.totalCompletions,
  }).filter((b) => b.achieved).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hi {client.full_name || "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Your Home Hero dashboard</p>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10">
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              {mascot.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{mascot.text}</p>
              <p className="text-xs text-muted-foreground">
                {rank.current.emoji} {rank.current.label}
              </p>
            </div>
            {progress.streak > 0 && (
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-accent/20 px-3 py-1.5 text-sm font-semibold text-accent-foreground">
                <Flame className="h-4 w-4" />
                {progress.streak}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Today</span>
              <span>
                {doneToday} / {totalToday} done
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{
                  width: `${totalToday === 0 ? 0 : Math.round((doneToday / totalToday) * 100)}%`,
                }}
              />
            </div>
          </div>

          <Link href="/client/program">
            <Button size="lg" className="w-full">
              {totalToday === 0
                ? "View my program"
                : allDone
                  ? "See today's program 🎉"
                  : doneToday === 0
                    ? "Start today's program"
                    : "Keep going"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Link href="/client/rewards">
        <Card className="transition hover:border-primary">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium leading-tight">Rewards</p>
                <p className="text-xs text-muted-foreground">
                  {badgeCount} badge{badgeCount === 1 ? "" : "s"} earned
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
