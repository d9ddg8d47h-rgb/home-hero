import { CheckCircle2 } from "lucide-react";
import { requireClient } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { getClientProgress } from "@/lib/actions/completions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseVideo } from "@/components/client/exercise-video";
import { SetTracker } from "@/components/client/set-tracker";
import { ProgressSummary } from "@/components/client/progress-summary";
import { SurpriseMeButton } from "@/components/client/surprise-me-button";
import { emojiForCategory } from "@/lib/exercise-emoji";
import { cn } from "@/lib/utils";

export default async function ClientProgramPage() {
  const client = await requireClient();
  const supabase = await createClient();

  const [{ data: prescriptions }, progress] = await Promise.all([
    supabase
      .from("prescriptions")
      .select("*, exercise:exercises(id, name, description, video_url, category)")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    getClientProgress(client.id),
  ]);

  const list = prescriptions ?? [];

  const withDoneState = list.map((p) => {
    const totalSets = p.sets ?? 1;
    const doneSets = Math.min(progress.todaySetsDone[p.id] ?? 0, totalSets);
    return { ...p, totalSets, doneSets, isDone: doneSets >= totalSets };
  });

  const doneToday = withDoneState.filter((p) => p.isDone).length;
  const pendingIds = withDoneState.filter((p) => !p.isDone).map((p) => p.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Today&apos;s program</h1>
        <p className="text-sm text-muted-foreground">
          Tap a set once you&apos;ve done it
        </p>
      </div>

      {list.length > 0 && (
        <ProgressSummary
          doneToday={doneToday}
          totalToday={list.length}
          streak={progress.streak}
          longestStreak={progress.longestStreak}
          totalCompletions={progress.totalCompletions}
        />
      )}

      {list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-medium">No exercises yet</p>
            <p className="text-sm text-muted-foreground">
              Your physio hasn&apos;t prescribed anything yet — check back soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <SurpriseMeButton pendingIds={pendingIds} />

          {withDoneState.map((p) => (
            <Card
              key={p.id}
              id={`exercise-${p.id}`}
              className={cn(
                "scroll-mt-20 transition-colors",
                p.isDone && "border-secondary bg-secondary/5"
              )}
            >
              <CardContent className="flex flex-col gap-3 py-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    <span aria-hidden="true">
                      {emojiForCategory(p.exercise?.category)}
                    </span>{" "}
                    {p.exercise?.name ?? "Exercise"}
                  </h2>
                  {p.isDone && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-semibold text-secondary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Done
                    </span>
                  )}
                </div>

                {p.exercise?.video_url && <ExerciseVideo url={p.exercise.video_url} />}

                {p.exercise?.description && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {p.exercise.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {p.reps != null && <Badge>{p.reps} reps each set</Badge>}
                </div>

                {p.note && (
                  <div className="rounded-xl bg-accent/15 p-3 text-sm text-accent-foreground">
                    💡 {p.note}
                  </div>
                )}

                <SetTracker
                  prescriptionId={p.id}
                  totalSets={p.totalSets}
                  doneSets={p.doneSets}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
