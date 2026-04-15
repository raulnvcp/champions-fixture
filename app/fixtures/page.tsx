import { createClient } from "@/lib/supabase/server";
import MatchCard, { type DbPrediction } from "@/components/match-card";

export const revalidate = 30;

export default async function FixturesPage() {
  const supabase = await createClient();

  const [{ data: matches, error }, { data: { user } }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .eq("stage", "league_stage")
      .order("utc_date", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-destructive">
        Failed to load fixtures: {error.message}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-muted-foreground">
        No fixtures yet. Run /api/sync to load data.
      </div>
    );
  }

  // Fetch user predictions if logged in
  let predictionsMap = new Map<number, DbPrediction>();
  if (user) {
    const matchIds = matches.map((m) => m.id);
    const { data: predictions } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score, points")
      .in("match_id", matchIds);

    if (predictions) {
      predictionsMap = new Map(predictions.map((p) => [p.match_id, p]));
    }
  }

  const liveMatches = matches.filter((m) => m.status === "live");
  const scheduledMatches = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime());
  const finishedMatches = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => new Date(b.utc_date).getTime() - new Date(a.utc_date).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">League Stage</h1>

      <div className="space-y-12">
        {liveMatches.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-4">
              Live Now
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {liveMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictionsMap.get(match.id) ?? null}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </section>
        )}

        {scheduledMatches.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Upcoming
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {scheduledMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictionsMap.get(match.id) ?? null}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </section>
        )}

        {finishedMatches.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Finished
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {finishedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictionsMap.get(match.id) ?? null}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
