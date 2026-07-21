import { requireClient } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseVideo } from "@/components/client/exercise-video";

export default async function ClientHome() {
  const client = await requireClient();
  const supabase = await createClient();

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("*, exercise:exercises(id, name, description, video_url)")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hi {client.full_name || "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Your home program</p>
      </div>

      {!prescriptions || prescriptions.length === 0 ? (
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
          {prescriptions.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 py-5">
                <h2 className="text-lg font-semibold">
                  {p.exercise?.name ?? "Exercise"}
                </h2>

                {p.exercise?.video_url && (
                  <ExerciseVideo url={p.exercise.video_url} />
                )}

                {p.exercise?.description && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {p.exercise.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {p.sets != null && <Badge>{p.sets} sets</Badge>}
                  {p.reps != null && <Badge>{p.reps} reps</Badge>}
                </div>

                {p.note && (
                  <div className="rounded-xl bg-accent/15 p-3 text-sm text-accent-foreground">
                    💡 {p.note}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
