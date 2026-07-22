import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, Flame } from "lucide-react";
import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { deleteClient } from "@/lib/actions/clients";
import { deletePrescription } from "@/lib/actions/prescriptions";
import { getClientProgressStats } from "@/lib/actions/progress";
import { computeBadges } from "@/lib/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrescribeForm } from "@/components/physio/prescribe-form";
import { ProgressHeatmap } from "@/components/physio/progress-heatmap";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePhysio();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: exercises }, { data: prescriptions }, progress] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("exercises").select("*").order("name"),
      supabase
        .from("prescriptions")
        .select("*, exercise:exercises(id, name, video_url)")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      getClientProgressStats(id),
    ]);

  if (!client || client.role !== "client") notFound();

  const badges = computeBadges({
    streak: progress.currentStreak,
    totalCompletions: progress.totalCompletions,
  }).filter((b) => b.achieved);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/physio" className="flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{client.full_name}</h1>
          <p className="text-sm text-muted-foreground">{client.email}</p>
        </div>
        <form action={deleteClient.bind(null, client.id)}>
          <Button variant="outline" size="sm" type="submit">
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {progress.totalPrescriptions === 0 ? (
            <p className="text-sm text-muted-foreground">
              Prescribe some exercises below and this will fill in as{" "}
              {client.full_name || "they"} start marking them done.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Last 7 days
                  </p>
                  <p className="text-xl font-bold tracking-tight">
                    {progress.last7Adherence ?? 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Last 30 days
                  </p>
                  <p className="text-xl font-bold tracking-tight">
                    {progress.last30Adherence ?? 0}%
                  </p>
                </div>
                {progress.currentStreak > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Streak
                    </p>
                    <p className="flex items-center gap-1 text-xl font-bold tracking-tight">
                      <Flame className="h-5 w-5 text-accent" />
                      {progress.currentStreak}
                    </p>
                  </div>
                )}
              </div>

              <ProgressHeatmap
                heatmap={progress.heatmap}
                totalPrescriptions={progress.totalPrescriptions}
              />

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  {badges.map((b) => (
                    <span
                      key={b.id}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold"
                      title={b.label}
                    >
                      <span>{b.emoji}</span>
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prescribed exercises</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!prescriptions || prescriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing prescribed yet — add one below.
            </p>
          ) : (
            prescriptions.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div>
                  <p className="font-medium">{p.exercise?.name ?? "Deleted exercise"}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.sets != null && <Badge variant="muted">{p.sets} sets</Badge>}
                    {p.reps != null && <Badge variant="muted">{p.reps} reps</Badge>}
                  </div>
                  {p.note && (
                    <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
                  )}
                </div>
                <form action={deletePrescription.bind(null, p.id, client.id)}>
                  <button
                    type="submit"
                    aria-label="Remove prescription"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prescribe a new exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <PrescribeForm clientId={client.id} exercises={exercises ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
