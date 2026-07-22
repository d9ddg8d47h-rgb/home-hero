"use server";

import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

export type HeatmapDay = { date: string; count: number };

export type ClientProgressStats = {
  totalPrescriptions: number;
  last7Adherence: number | null;
  last30Adherence: number | null;
  currentStreak: number;
  totalCompletions: number;
  // Oldest first, 28 days (4 full weeks) so a physio-facing calendar grid
  // can render 7-per-row. Denominator for "done that day" is today's
  // prescription count — we don't keep history of what was prescribed on
  // any given past day, so this is a reasonable approximation, same as
  // the client-facing progress card uses.
  heatmap: HeatmapDay[];
};

export async function getClientProgressStats(
  clientId: string
): Promise<ClientProgressStats> {
  await requirePhysio();
  const supabase = await createClient();

  const [{ count: totalPrescriptions }, { data: completions }] = await Promise.all([
    supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientId),
    supabase
      .from("completions")
      .select("completed_on")
      .eq("client_id", clientId)
      .gte("completed_on", isoDate(daysAgo(27)))
      .order("completed_on", { ascending: true }),
  ]);

  const prescriptionsCount = totalPrescriptions ?? 0;
  const rows = completions ?? [];

  const countsByDay = new Map<string, number>();
  for (const r of rows) {
    countsByDay.set(r.completed_on, (countsByDay.get(r.completed_on) ?? 0) + 1);
  }

  const heatmap: HeatmapDay[] = [];
  for (let i = 27; i >= 0; i--) {
    const date = isoDate(daysAgo(i));
    heatmap.push({ date, count: countsByDay.get(date) ?? 0 });
  }

  function adherence(days: number): number | null {
    if (prescriptionsCount === 0) return null;
    const start = isoDate(daysAgo(days - 1));
    let actual = 0;
    for (const [date, count] of countsByDay) {
      if (date >= start) actual += count;
    }
    return Math.min(100, Math.round((actual / (prescriptionsCount * days)) * 100));
  }

  const activeDaysDesc = Array.from(countsByDay.keys()).sort().reverse();
  let currentStreak = 0;
  if (activeDaysDesc.length > 0) {
    const today = isoDate(daysAgo(0));
    const cursor = activeDaysDesc[0] === today ? daysAgo(0) : daysAgo(1);
    for (const day of activeDaysDesc) {
      const expected = isoDate(cursor);
      if (day === expected) {
        currentStreak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else if (day < expected) {
        break;
      }
    }
  }

  return {
    totalPrescriptions: prescriptionsCount,
    last7Adherence: adherence(7),
    last30Adherence: adherence(30),
    currentStreak,
    totalCompletions: rows.length,
    heatmap,
  };
}

// Lightweight per-client "this week" adherence, for the client list on the
// physio dashboard — one query pair instead of N, so it scales with a
// normal-sized caseload without an N+1 query per client card.
export async function getClientsAdherenceSummary(
  clientIds: string[]
): Promise<Record<string, number | null>> {
  await requirePhysio();
  const result: Record<string, number | null> = {};
  if (clientIds.length === 0) return result;

  const supabase = await createClient();
  const since = isoDate(daysAgo(6));

  const [{ data: prescriptions }, { data: completions }] = await Promise.all([
    supabase.from("prescriptions").select("client_id").in("client_id", clientIds),
    supabase
      .from("completions")
      .select("client_id, completed_on")
      .in("client_id", clientIds)
      .gte("completed_on", since),
  ]);

  const prescriptionCounts = new Map<string, number>();
  for (const p of prescriptions ?? []) {
    prescriptionCounts.set(p.client_id, (prescriptionCounts.get(p.client_id) ?? 0) + 1);
  }
  const completionCounts = new Map<string, number>();
  for (const c of completions ?? []) {
    completionCounts.set(c.client_id, (completionCounts.get(c.client_id) ?? 0) + 1);
  }

  for (const id of clientIds) {
    const prescribed = prescriptionCounts.get(id) ?? 0;
    if (prescribed === 0) {
      result[id] = null;
      continue;
    }
    const actual = completionCounts.get(id) ?? 0;
    result[id] = Math.min(100, Math.round((actual / (prescribed * 7)) * 100));
  }

  return result;
}
