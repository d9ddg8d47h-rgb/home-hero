"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string } | undefined;

const exerciseSchema = z.object({
  name: z.string().min(1, "Give the exercise a name."),
  description: z.string().optional().default(""),
  category: z.string().optional().default(""),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\//.test(v), {
      message: "Video link should be a full URL (starting with http:// or https://).",
    }),
  bodyArea: z.string().optional().default(""),
  difficulty: z.string().optional().default(""),
  equipment: z.string().optional().default(""),
  progressionTip: z.string().optional().default(""),
  regressionTip: z.string().optional().default(""),
  parentTip: z.string().optional().default(""),
});

export async function createExercise(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const physio = await requirePhysio();
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    videoUrl: formData.get("videoUrl"),
    bodyArea: formData.get("bodyArea"),
    difficulty: formData.get("difficulty"),
    equipment: formData.get("equipment"),
    progressionTip: formData.get("progressionTip"),
    regressionTip: formData.get("regressionTip"),
    parentTip: formData.get("parentTip"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("exercises").insert({
    physio_id: physio.id,
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category || null,
    video_url: parsed.data.videoUrl || null,
    body_area: parsed.data.bodyArea || null,
    difficulty: parsed.data.difficulty || null,
    equipment: parsed.data.equipment || null,
    progression_tip: parsed.data.progressionTip || null,
    regression_tip: parsed.data.regressionTip || null,
    parent_tip: parsed.data.parentTip || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/physio/exercises");
  redirect("/physio/exercises");
}

export async function updateExercise(
  exerciseId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePhysio();
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    videoUrl: formData.get("videoUrl"),
    bodyArea: formData.get("bodyArea"),
    difficulty: formData.get("difficulty"),
    equipment: formData.get("equipment"),
    progressionTip: formData.get("progressionTip"),
    regressionTip: formData.get("regressionTip"),
    parentTip: formData.get("parentTip"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("exercises")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category || null,
      video_url: parsed.data.videoUrl || null,
      body_area: parsed.data.bodyArea || null,
      difficulty: parsed.data.difficulty || null,
      equipment: parsed.data.equipment || null,
      progression_tip: parsed.data.progressionTip || null,
      regression_tip: parsed.data.regressionTip || null,
      parent_tip: parsed.data.parentTip || null,
    })
    .eq("id", exerciseId);

  if (error) return { error: error.message };

  revalidatePath("/physio/exercises");
  redirect("/physio/exercises");
}

export async function deleteExercise(exerciseId: string) {
  await requirePhysio();
  const supabase = await createClient();
  await supabase.from("exercises").delete().eq("id", exerciseId);
  revalidatePath("/physio/exercises");
}

export async function getMyExercises() {
  await requirePhysio();
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
