"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function toggleCompletion(prescriptionId: string) {
  const client = await requireClient();
  const supabase = await createClient();
  const today = todayISO();

  const { data: existing } = await supabase
    .from("completions")
    .select("id")
    .eq("prescription_id", prescriptionId)
    .eq("completed_on", today)
    .maybeSingle();

  if (existing) {
    await supabase.from("completions").delete().eq("id", existing.id);
  } else {
    await supabase.from("completions").insert({
      client_id: client.id,
      prescription_id: prescriptionId,
      completed_on: today,
    });
  }

  revalidatePath("/client");
}

export type ClientProgress = {
  todayDone: Set<string>;
  streak: number;
  totalCompletions: number;
};

export async function getClientProgress(clientId: string): Promise<ClientProgress> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("completions")
    .select("prescription_id, completed_on")
    .eq("client_id", clientId)
    .order("completed_on", { ascending: false });

  const rows = data ?? [];
  const today = todayISO();

  const todayDone = new Set(
    rows.filter((r) => r.completed_on === today).map((r) => r.prescription_id)
  );

  const days = Array.from(new Set(rows.map((r) => r.completed_on))).sort().reverse();

  let streak = 0;
  if (days.length > 0) {
    const cursor = new Date(`${today}T00:00:00Z`);
    // If today has nothing logged yet, still count backwards from
    // yesterday so the streak doesn't drop to 0 before they've had a
    // chance to do today's exercises.
    if (days[0] !== today) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    for (const day of days) {
      const expected = cursor.toISOString().slice(0, 10);
      if (day === expected) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else if (day < expected) {
        break;
      }
    }
  }

  return { todayDone, streak, totalCompletions: rows.length };
}
