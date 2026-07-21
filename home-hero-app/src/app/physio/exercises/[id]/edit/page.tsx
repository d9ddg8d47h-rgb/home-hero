import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { updateExercise } from "@/lib/actions/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseForm } from "@/components/physio/exercise-form";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePhysio();
  const { id } = await params;
  const supabase = await createClient();
  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (!exercise) notFound();

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
          <CardTitle>Edit exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseForm
            action={updateExercise.bind(null, exercise.id)}
            defaultValues={exercise}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
