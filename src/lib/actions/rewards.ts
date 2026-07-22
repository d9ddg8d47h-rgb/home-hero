"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { getClientProgress } from "@/lib/actions/completions";
import { computeCoins, HERO_RANKS, AVATAR_EMOJI_OPTIONS } from "@/lib/gamification";

export async function getOpenedChestKeys(clientId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_rewards")
    .select("reward_key")
    .eq("client_id", clientId)
    .eq("reward_type", "chest");
  return new Set((data ?? []).map((r) => r.reward_key));
}

export async function openChest(rankId: string) {
  const client = await requireClient();

  const rank = HERO_RANKS.find((r) => r.id === rankId);
  if (!rank) return;

  const progress = await getClientProgress(client.id);
  const coins = computeCoins(progress.totalCompletions);
  if (coins < rank.threshold) return; // not actually unlocked — ignore

  const supabase = await createClient();
  // Idempotent: the unique(client_id, reward_type, reward_key) constraint
  // means a repeat open is a harmless no-op conflict, not an error.
  await supabase
    .from("client_rewards")
    .upsert(
      { client_id: client.id, reward_type: "chest", reward_key: rankId },
      { onConflict: "client_id,reward_type,reward_key", ignoreDuplicates: true }
    );

  revalidatePath("/client/rewards");
}

export async function updateAvatarEmoji(emoji: string) {
  const client = await requireClient();
  if (!(AVATAR_EMOJI_OPTIONS as readonly string[]).includes(emoji)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ avatar_emoji: emoji }).eq("id", client.id);

  revalidatePath("/client", "layout");
}
