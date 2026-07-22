"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: boolean } | undefined;

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

  const { data: last } = await supabase
    .from("prescriptions")
    .select("order_index")
    .eq("client_id", clientId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrderIndex = (last?.order_index ?? -1) + 1;

  const { error } = await supabase.from("prescriptions").insert({
    client_id: clientId,
    exercise_id: parsed.data.exerciseId,
    sets: parsed.data.sets ?? null,
    reps: parsed.data.reps ?? null,
    note: parsed.data.note || null,
    order_index: nextOrderIndex,
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

export async function movePrescription(
  clientId: string,
  prescriptionId: string,
  direction: "up" | "down"
) {
  await requirePhysio();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("prescriptions")
    .select("id, order_index")
    .eq("client_id", clientId)
    .order("order_index", { ascending: true });

  if (!rows || rows.length < 2) return;

  const idx = rows.findIndex((r) => r.id === prescriptionId);
  if (idx === -1) return;

  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= rows.length) return;

  const current = rows[idx];
  const neighbor = rows[swapWith];

  await supabase
    .from("prescriptions")
    .update({ order_index: neighbor.order_index })
    .eq("id", current.id);
  await supabase
    .from("prescriptions")
    .update({ order_index: current.order_index })
    .eq("id", neighbor.id);

  revalidatePath(`/physio/clients/${clientId}`);
}

export async function duplicateProgramToClient(
  sourceClientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const targetClientId = String(formData.get("targetClientId") ?? "");
  if (!targetClientId) return { error: "Choose a client to copy this program to." };

  const physio = await requirePhysio();
  const supabase = await createClient();

  // Make sure both clients actually belong to this physio.
  const { data: clients } = await supabase
    .from("profiles")
    .select("id")
    .eq("physio_id", physio.id)
    .in("id", [sourceClientId, targetClientId]);
  if (!clients || clients.length !== 2) {
    return { error: "Could not verify both clients." };
  }

  const { data: source } = await supabase
    .from("prescriptions")
    .select("exercise_id, sets, reps, note, order_index")
    .eq("client_id", sourceClientId)
    .order("order_index", { ascending: true });

  if (!source || source.length === 0) {
    return { error: "That client has no program to copy." };
  }

  const { data: existing } = await supabase
    .from("prescriptions")
    .select("order_index")
    .eq("client_id", targetClientId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrderIndex = (existing?.order_index ?? -1) + 1;

  const rows = source.map((p) => ({
    client_id: targetClientId,
    exercise_id: p.exercise_id,
    sets: p.sets,
    reps: p.reps,
    note: p.note,
    order_index: nextOrderIndex++,
  }));

  const { error } = await supabase.from("prescriptions").insert(rows);
  if (error) return { error: error.message };

  revalidatePath(`/physio/clients/${targetClientId}`);
  return { success: true };
}
