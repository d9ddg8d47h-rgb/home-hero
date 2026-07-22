"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions/exercises";
import type { Database } from "@/lib/database.types";
import { EXERCISE_CATEGORIES, EXERCISE_DIFFICULTIES } from "@/lib/database.types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export function ExerciseForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Pick<
    Exercise,
    | "name"
    | "description"
    | "video_url"
    | "category"
    | "body_area"
    | "difficulty"
    | "equipment"
    | "progression_tip"
    | "regression_tip"
    | "parent_tip"
  >;
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="bodyArea">Body area</Label>
          <Input
            id="bodyArea"
            name="bodyArea"
            placeholder="e.g. Hips, Core, Ankles"
            defaultValue={defaultValues?.body_area ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={defaultValues?.difficulty ?? ""}
            className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Not set</option>
            {EXERCISE_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="equipment">Equipment needed (optional)</Label>
        <Input
          id="equipment"
          name="equipment"
          placeholder="e.g. Mat, small ball — leave blank for none"
          defaultValue={defaultValues?.equipment ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="progressionTip">Make it harder (optional)</Label>
        <Textarea
          id="progressionTip"
          name="progressionTip"
          placeholder="How to progress this exercise as they improve"
          defaultValue={defaultValues?.progression_tip ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="regressionTip">Make it easier (optional)</Label>
        <Textarea
          id="regressionTip"
          name="regressionTip"
          placeholder="A simpler variation if this is too hard"
          defaultValue={defaultValues?.regression_tip ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="parentTip">Tip for parents (optional)</Label>
        <Textarea
          id="parentTip"
          name="parentTip"
          placeholder="Shown to the family alongside the exercise"
          defaultValue={defaultValues?.parent_tip ?? ""}
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
