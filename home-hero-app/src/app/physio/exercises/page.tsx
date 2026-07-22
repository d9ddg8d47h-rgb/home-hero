import Link from "next/link";
import { Plus } from "lucide-react";
import { getMyExercises } from "@/lib/actions/exercises";
import { Button } from "@/components/ui/button";
import { ExerciseLibraryBrowser } from "@/components/physio/exercise-library-browser";

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

      <ExerciseLibraryBrowser exercises={exercises} />
    </div>
  );
}
