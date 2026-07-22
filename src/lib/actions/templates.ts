"use server";

import { revalidatePath } from "next/cache";
import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string; success?: boolean } | undefined;

export async function saveClientProgramAsTemplate(
  clientId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const physio = await requirePhysio();
  const name = String(formData.get("templateName") ?? "").trim();
  if (!name) return { error: "Give the template a name." };

  const supabase = await createClient();

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("exercise_id, sets, reps, note, order_index")
    .eq("client_id", clientId)
    .order("order_index", { ascending: true });

  if (!prescriptions || prescriptions.length === 0) {
    return { error: "This client doesn't have a program to save yet." };
  }

  const { data: template, error: templateError } = await supabase
    .from("program_templates")
    .insert({ physio_id: physio.id, name })
    .select("id")
    .single();

  if (templateError || !template) {
    return { error: templateError?.message ?? "Could not create template." };
  }

  const items = prescriptions.map((p) => ({
    template_id: template.id,
    exercise_id: p.exercise_id,
    sets: p.sets,
    reps: p.reps,
    note: p.note,
    order_index: p.order_index,
  }));

  const { error: itemsError } = await supabase.from("program_template_items").insert(items);
  if (itemsError) return { error: itemsError.message };

  revalidatePath("/physio/templates");
  return { success: true };
}

export async function applyTemplateToClient(
  templateId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const physio = await requirePhysio();
  const clientId = String(formData.get("clientId") ?? "");
  if (!clientId) return { error: "Choose a client." };

  const supabase = await createClient();

  const { data: client } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", clientId)
    .eq("physio_id", physio.id)
    .maybeSingle();
  if (!client) return { error: "Could not verify that client." };

  const { data: items } = await supabase
    .from("program_template_items")
    .select("exercise_id, sets, reps, note, order_index")
    .eq("template_id", templateId)
    .order("order_index", { ascending: true });

  if (!items || items.length === 0) {
    return { error: "That template has no exercises." };
  }

  const { data: existing } = await supabase
    .from("prescriptions")
    .select("order_index")
    .eq("client_id", clientId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrderIndex = (existing?.order_index ?? -1) + 1;

  const rows = items.map((i) => ({
    client_id: clientId,
    exercise_id: i.exercise_id,
    sets: i.sets,
    reps: i.reps,
    note: i.note,
    order_index: nextOrderIndex++,
  }));

  const { error } = await supabase.from("prescriptions").insert(rows);
  if (error) return { error: error.message };

  revalidatePath(`/physio/clients/${clientId}`);
  return { success: true };
}

export async function getMyTemplates() {
  await requirePhysio();
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("program_templates")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (!templates || templates.length === 0) return [];

  const { data: items } = await supabase
    .from("program_template_items")
    .select(
      "template_id, exercise_id, sets, reps, note, order_index, exercise:exercises(name, category)"
    )
    .in(
      "template_id",
      templates.map((t) => t.id)
    )
    .order("order_index", { ascending: true });

  return templates.map((t) => ({
    ...t,
    items: (items ?? []).filter((i) => i.template_id === t.id),
  }));
}

export async function deleteTemplate(templateId: string) {
  await requirePhysio();
  const supabase = await createClient();
  await supabase.from("program_templates").delete().eq("id", templateId);
  revalidatePath("/physio/templates");
}
