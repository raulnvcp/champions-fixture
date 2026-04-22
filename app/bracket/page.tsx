import { createClient } from "@/lib/supabase/server";
import MatchCard, { type DbPrediction } from "@/components/match-card";
import BracketView from "@/components/bracket-view";

export const revalidate = 30;

// Stages shown in the visual bracket tree
const VISUAL_STAGES = new Set([
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
]);

// All knockout rounds shown in the results list below the bracket
const RESULT_ROUNDS = [
  { stage: "playoffs",      label: "Knockout Play-offs" },
  { stage: "round_of_16",  label: "Round of 16" },
  { stage: "quarter_final", label: "Quarter-finals" },
  { stage: "semi_final",   label: "Semi-finals" },
  { stage: "final",        label: "Final" },
] as const;

export default async function BracketPage() {
  const supabase = await createClient();

  const [{ data: matches, error }, { data: { user } }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .neq("stage", "league_stage")   // exclude all 144 league-phase matches
      .order("id", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-8 text-destructive">
        Failed to load bracket: {error.message}
      </div>
    );
  }

  const allMatches = matches ?? [];

  let predictionsMap = new Map<number, DbPrediction>();
  if (user && allMatches.length > 0) {
    const matchIds = allMatches.map((m) => m.id);
    const { data: predictions } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score, points")
      .in("match_id", matchIds);
    if (predictions) {
      predictionsMap = new Map(predictions.map((p) => [p.match_id, p]));
    }
  }

  const visualMatches = allMatches.filter((m) => VISUAL_STAGES.has(m.stage));

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent tracking-tight">
        Knockout Bracket
      </h1>

      {allMatches.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Knockout matches will appear here once the group stage is complete.
        </p>
      ) : (
        <div className="space-y-12">
          {/* Visual bracket tree */}
          {visualMatches.length > 0 && (
            <BracketView matches={visualMatches} />
          )}

          {/* Individual match results for every knockout round */}
          {RESULT_ROUNDS.map(({ stage, label }) => {
            const roundMatches = allMatches.filter((m) => m.stage === stage);
            if (roundMatches.length === 0) return null;

            const sorted = [...roundMatches].sort((a, b) => {
              const aFinished = a.status === "finished";
              const bFinished = b.status === "finished";
              if (aFinished !== bFinished) return aFinished ? 1 : -1;
              if (aFinished) return b.utc_date.localeCompare(a.utc_date);
              return a.utc_date.localeCompare(b.utc_date);
            });

            const cols =
              roundMatches.length >= 8
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : roundMatches.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-2"
                : roundMatches.length >= 2
                ? "sm:grid-cols-2"
                : "max-w-sm mx-auto";

            return (
              <section key={stage}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400/70">
                    {label}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
                  <span className="text-xs text-muted-foreground">
                    {roundMatches.length}{" "}
                    {roundMatches.length === 1 ? "match" : "matches"}
                  </span>
                </div>
                <div className={`grid gap-3 ${cols}`}>
                  {sorted.map((match) => (
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
        </div>
      )}
    </div>
  );
}
