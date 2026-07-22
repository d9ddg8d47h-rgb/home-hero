"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string } | undefined;

const prescriptionSchema = z.object({
  exerciseId: z.string().uuid("Choose an exercise."),
  sets: z.coerce.number().int().min(0).max(50).optional(),
  reps: z.coerce.number().int().min(0).max(200).optional(),
  note: z.string().optional().default(""),
});

export async function prescribeExercise(
  clientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePhysio();
  const parsed = prescriptionSchema.safeParse({
    exerciseId: formData.get("exerciseId"),
    sets: formData.get("sets") || undefined,
    reps: formData.get("reps") || undefined,
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("prescriptions").insert({
    client_id: clientId,
    exercise_id: parsed.data.exerciseId,
    sets: parsed.data.sets ?? null,
    reps: parsed.data.reps ?? null,
    note: parsed.data.note || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/physio/clients/${clientId}`);
}

export async function updatePrescription(
  prescriptionId: string,
  clientId: string,
  formData: FormData
) {
  await requirePhysio();
  const sets = formData.get("sets");
  const reps = formData.get("reps");
  const note = formData.get("note");

  const supabase = await createClient();
  await supabase
    .from("prescriptions")
    .update({
      sets: sets ? Number(sets) : null,
      reps: reps ? Number(reps) : null,
      note: (note as string) || null,
    })
    .eq("id", prescriptionId);

  revalidatePath(`/physio/clients/${clientId}`);
}

export async function deletePrescription(prescriptionId: string, clientId: string) {
  await requirePhysio();
  const supabase = await createClient();
  await supabase.from("prescriptions").delete().eq("id", prescriptionId);
  revalidatePath(`/physio/clients/${clientId}`);
}
