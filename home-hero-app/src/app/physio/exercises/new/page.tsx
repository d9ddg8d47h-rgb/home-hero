import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createExercise } from "@/lib/actions/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseForm } from "@/components/physio/exercise-form";

export default function NewExercisePage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/physio/exercises"
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseForm action={createExercise} submitLabel="Save exercise" />
        </CardContent>
      </Card>
    </div>
  );
}
