import { createClient } from "@/lib/supabase/server";
import MatchCard, { type DbPrediction } from "@/components/match-card";

export const revalidate = 30;

const ROUNDS = [
  { stage: "round_of_32", label: "Round of 32" },
  { stage: "round_of_16", label: "Round of 16" },
  { stage: "quarter_final", label: "Quarter-finals" },
  { stage: "semi_final", label: "Semi-finals" },
  { stage: "third_place", label: "Third Place" },
  { stage: "final", label: "Final" },
] as const;

export default async function BracketPage() {
  const supabase = await createClient();

  const [{ data: matches, error }, { data: { user } }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .neq("stage", "group")
      .order("utc_date", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-destructive">
        Failed to load bracket: {error.message}
      </div>
    );
  }

  let predictionsMap = new Map<number, DbPrediction>();
  if (user && matches && matches.length > 0) {
    const matchIds = matches.map((m) => m.id);
    const { data: predictions } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score, points")
      .in("match_id", matchIds);
    if (predictions) {
      predictionsMap = new Map(predictions.map((p) => [p.match_id, p]));
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Knockout Bracket</h1>

      <div className="space-y-12">
        {ROUNDS.map(({ stage, label }) => {
          const roundMatches = (matches ?? []).filter((m) => m.stage === stage);
          if (roundMatches.length === 0) return null;

          const cols =
            roundMatches.length >= 8
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : roundMatches.length >= 4
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : roundMatches.length >= 2
              ? "sm:grid-cols-2"
              : "max-w-sm";

          return (
            <section key={stage}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {roundMatches.length} {roundMatches.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <div className={`grid gap-3 ${cols}`}>
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictionsMap.get(match.id) ?? null}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {(!matches || matches.length === 0) && (
          <p className="text-muted-foreground text-sm">
            Knockout matches will appear here once the group stage is complete.
          </p>
        )}
      </div>
    </div>
  );
}
