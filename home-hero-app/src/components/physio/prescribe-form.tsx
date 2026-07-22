"use client";

import { useActionState } from "react";
import { prescribeExercise } from "@/lib/actions/prescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/database.types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export function PrescribeForm({
  clientId,
  exercises,
}: {
  clientId: string;
  exercises: Exercise[];
}) {
  const action = prescribeExercise.bind(null, clientId);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You don&apos;t have any exercises in your library yet. Create one first,
        then come back to prescribe it.
      </p>
    );
  }

  const grouped = new Map<string, Exercise[]>();
  for (const ex of exercises) {
    const key = ex.category ?? "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(ex);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="exerciseId">Exercise</Label>
        <select
          id="exerciseId"
          name="exerciseId"
          required
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Choose an exercise…</option>
          {Array.from(grouped.entries()).map(([category, list]) => (
            <optgroup key={category} label={category}>
              {list.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sets">Sets</Label>
          <Input id="sets" name="sets" type="number" min={0} max={50} placeholder="3" />
        </div>
        <div>
          <Label htmlFor="reps">Reps</Label>
          <Input id="reps" name="reps" type="number" min={0} max={200} placeholder="10" />
        </div>
      </div>
      <div>
        <Label htmlFor="note">Note for the family (optional)</Label>
        <Textarea
          id="note"
          name="note"
          placeholder="e.g. slow tempo, stop if pain"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Prescribing…" : "Prescribe exercise"}
      </Button>
    </form>
  );
}
