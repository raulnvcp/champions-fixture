import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { flagCode } from "@/lib/tla-to-flag";

const FOOTBALL_API_URL =
  "https://api.football-data.org/v4/competitions/CL/matches?season=2025";

type ApiMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: { id: number | null; name: string | null; tla: string | null; crest: string | null };
  awayTeam: { id: number | null; name: string | null; tla: string | null; crest: string | null };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
  };
};

function mapStatus(apiStatus: string): string {
  switch (apiStatus) {
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "FINISHED":
    case "AWARDED":
      return "finished";
    default:
      return "scheduled";
  }
}

function mapStage(apiStage: string): string {
  switch (apiStage) {
    case "GROUP_STAGE":
      return "group";
    case "LAST_32":
      return "round_of_32";
    case "LAST_16":
      return "round_of_16";
    case "QUARTER_FINALS":
      return "quarter_final";
    case "SEMI_FINALS":
      return "semi_final";
    case "THIRD_PLACE":
      return "third_place";
    case "FINAL":
      return "final";
    default:
      return apiStage.toLowerCase();
  }
}

export async function GET(request: Request) {
  // Protect the endpoint — require secret header (used by Vercel Cron)
  // Skip auth check in development for easy manual triggering
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log("[sync] fetching from football-data.org...");
    const res = await fetch(FOOTBALL_API_URL, {
      headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_TOKEN! },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`football-data.org responded with ${res.status}`);
    }

    const data = await res.json();
    const matches: ApiMatch[] = data.matches;
    console.log(`[sync] fetched ${matches.length} matches`);

    const rows = matches.map((m) => ({
      id: m.id,
      utc_date: m.utcDate,
      status: mapStatus(m.status),
      matchday: m.matchday,
      stage: mapStage(m.stage),
      group_name: m.group ? m.group.replace("GROUP_", "") : null,
      home_team_id: m.homeTeam.id ?? null,
      home_team_name: m.homeTeam.name ?? "TBD",
      home_team_tla: m.homeTeam.tla ?? null,
      home_team_crest: m.homeTeam.crest ?? null,
      home_flag_code: flagCode(m.homeTeam.tla),
      away_team_id: m.awayTeam.id ?? null,
      away_team_name: m.awayTeam.name ?? "TBD",
      away_team_tla: m.awayTeam.tla ?? null,
      away_team_crest: m.awayTeam.crest ?? null,
      away_flag_code: flagCode(m.awayTeam.tla),
      home_score: m.score.fullTime.home,
      away_score: m.score.fullTime.away,
      winner: m.score.winner,
      last_updated: m.lastUpdated,
    }));

    console.log("[sync] upserting to Supabase...");
    const supabase = createServiceClient();
    const { error, data: upserted } = await supabase
      .from("matches")
      .upsert(rows, { onConflict: "id" })
      .select("id");

    if (error) {
      console.error("[sync] Supabase error:", JSON.stringify(error));
      throw error;
    }

    console.log(`[sync] done, upserted ${upserted?.length} rows`);
    return NextResponse.json({ synced: upserted?.length ?? rows.length, total: rows.length });
  } catch (err) {
    console.error("[sync] caught error:", JSON.stringify(err));
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
        ? String((err as Record<string, unknown>).message)
        : JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
