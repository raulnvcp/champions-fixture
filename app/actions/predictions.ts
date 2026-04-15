"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertPrediction(
  matchId: number,
  homeScore: number,
  awayScore: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (homeScore < 0 || awayScore < 0) return { error: "Invalid scores" };

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
    },
    { onConflict: "user_id,match_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/fixtures");
  return { success: true };
}
