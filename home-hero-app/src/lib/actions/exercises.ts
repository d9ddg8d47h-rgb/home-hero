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
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\//.test(v), {
      message: "Video link should be a full URL (starting with http:// or https://).",
    }),
});

export async function createExercise(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const physio = await requirePhysio();
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    videoUrl: formData.get("videoUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("exercises").insert({
    physio_id: physio.id,
    name: parsed.data.name,
    description: parsed.data.description,
    video_url: parsed.data.videoUrl || null,
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
    videoUrl: formData.get("videoUrl"),
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
      video_url: parsed.data.videoUrl || null,
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
