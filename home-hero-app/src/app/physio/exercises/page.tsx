import Link from "next/link";
import { Plus, Pencil, Trash2, Video } from "lucide-react";
import { getMyExercises, deleteExercise } from "@/lib/actions/exercises";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ExercisesPage() {
  const exercises = await getMyExercises();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exercise library</h1>
        <p className="text-sm text-muted-foreground">
          {exercises.length} saved {exercises.length === 1 ? "exercise" : "exercises"}
        </p>
      </div>

      <Link href="/physio/exercises/new">
        <Button size="lg" className="w-full">
          <Plus className="h-5 w-5" />
          New exercise
        </Button>
      </Link>

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-medium">No exercises yet</p>
            <p className="text-sm text-muted-foreground">
              Build your library so you can prescribe exercises to clients.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {exercises.map((ex) => (
            <Card key={ex.id}>
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium">
                    {ex.name}
                    {ex.video_url && <Video className="h-3.5 w-3.5 text-secondary" />}
                  </p>
                  {ex.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {ex.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Link href={`/physio/exercises/${ex.id}/edit`}>
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <form action={deleteExercise.bind(null, ex.id)}>
                    <Button variant="ghost" size="icon" type="submit" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
