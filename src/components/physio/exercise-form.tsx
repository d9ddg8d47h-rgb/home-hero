"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions/exercises";
import type { Database } from "@/lib/database.types";
import { EXERCISE_CATEGORIES } from "@/lib/database.types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export function ExerciseForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Pick<Exercise, "name" | "description" | "video_url" | "category">;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Exercise name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Bear crawl"
          defaultValue={defaultValues?.name}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues?.category ?? ""}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">No category</option>
          {EXERCISE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="description">Instructions</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Short, simple instructions a parent can follow"
          defaultValue={defaultValues?.description}
        />
      </div>
      <div>
        <Label htmlFor="videoUrl">Video link (optional)</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          placeholder="YouTube link, including Shorts"
          defaultValue={defaultValues?.video_url ?? ""}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
