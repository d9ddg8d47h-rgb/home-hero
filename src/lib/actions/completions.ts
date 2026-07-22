"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { getWeeklyChallenge, type WeeklyChallenge } from "@/lib/gamification";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Start (Monday) of the current ISO week, as a YYYY-MM-DD string.
function startOfWeekISO() {
  const now = new Date();
  const day = now.getUTCDay() || 7; // Sunday -> 7
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - (day - 1));
  return monday.toISOString().slice(0, 10);
}

async function adjustSetsDone(prescriptionId: string, delta: number) {
  const client = await requireClient();
  const supabase = await createClient();
  const today = todayISO();

  const { data: existing } = await supabase
    .from("completions")
    .select("id, sets_done")
    .eq("prescription_id", prescriptionId)
    .eq("completed_on", today)
    .maybeSingle();

  const current = existing?.sets_done ?? 0;
  const next = Math.max(0, current + delta);

  if (next === 0) {
    if (existing) {
      await supabase.from("completions").delete().eq("id", existing.id);
    }
  } else if (existing) {
    await supabase.from("completions").update({ sets_done: next }).eq("id", existing.id);
  } else {
    await supabase.from("completions").insert({
      client_id: client.id,
      prescription_id: prescriptionId,
      completed_on: today,
      sets_done: next,
    });
  }

  // 'layout' so the dashboard, program, and rewards pages (all nested
  // under the /client layout) all pick up the fresh completion state.
  revalidatePath("/client", "layout");
}

export async function incrementSetDone(prescriptionId: string) {
  await adjustSetsDone(prescriptionId, 1);
}

export async function decrementSetDone(prescriptionId: string) {
  await adjustSetsDone(prescriptionId, -1);
}

export type ClientProgress = {
  // prescription_id -> sets logged today
  todaySetsDone: Record<string, number>;
  streak: number;
  longestStreak: number;
  // total sets completed all-time — the unit badges/rank are built on, so
  // kids get credit for every single set, not just whole exercises.
  totalCompletions: number;
};

export async function getClientProgress(clientId: string): Promise<ClientProgress> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("completions")
    .select("prescription_id, completed_on, sets_done")
    .eq("client_id", clientId)
    .order("completed_on", { ascending: false });

  const rows = data ?? [];
  const today = todayISO();

  const todaySetsDone: Record<string, number> = {};
  for (const r of rows) {
    if (r.completed_on === today) {
      todaySetsDone[r.prescription_id] = r.sets_done;
    }
  }

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

  // Longest-ever streak, for bragging rights on the Rewards page — walk
  // the distinct days ascending and track the longest consecutive run.
  const daysAsc = [...days].reverse();
  let longestStreak = 0;
  let run = 0;
  let prevDate: Date | null = null;
  for (const day of daysAsc) {
    const current = new Date(`${day}T00:00:00Z`);
    if (prevDate) {
      const diffDays = Math.round(
        (current.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prevDate = current;
  }
  longestStreak = Math.max(longestStreak, streak);

  const totalCompletions = rows.reduce((sum, r) => sum + r.sets_done, 0);

  return { todaySetsDone, streak, longestStreak, totalCompletions };
}

export type WeeklyChallengeProgress = {
  challenge: WeeklyChallenge;
  current: number;
  complete: boolean;
};

export async function getWeeklyChallengeProgress(
  clientId: string
): Promise<WeeklyChallengeProgress> {
  const challenge = getWeeklyChallenge();
  const supabase = await createClient();
  const weekStart = startOfWeekISO();

  const { data } = await supabase
    .from("completions")
    .select("completed_on, sets_done")
    .eq("client_id", clientId)
    .gte("completed_on", weekStart);

  const rows = data ?? [];
  const current =
    challenge.unit === "days"
      ? new Set(rows.map((r) => r.completed_on)).size
      : rows.reduce((sum, r) => sum + r.sets_done, 0);

  return { challenge, current: Math.min(current, challenge.target), complete: current >= challenge.target };
}
