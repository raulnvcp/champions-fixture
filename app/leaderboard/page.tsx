import { createClient } from "@/lib/supabase/server";
import { calcPoints } from "@/lib/points";
import UserAvatar from "@/components/ui/user-avatar";

export const revalidate = 60;

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const [
    { data: { user } },
    { data: finishedMatches },
    { data: predictions },
    { data: profiles },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("matches").select("id, home_score, away_score").eq("status", "finished"),
    supabase.from("predictions").select("user_id, match_id, home_score, away_score"),
    supabase.from("profiles").select("id, full_name, avatar_url"),
  ]);

  const finishedIds = new Set((finishedMatches ?? []).map((m) => m.id));
  const scoreMap = new Map((finishedMatches ?? []).map((m) => [m.id, m]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  type Entry = {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    totalPoints: number;
    exactScores: number;
    correctOutcomes: number;
    totalPredictions: number;
  };

  const entryMap = new Map<string, Entry>();

  // Seed every registered user with 0 pts
  for (const profile of profiles ?? []) {
    entryMap.set(profile.id, {
      userId: profile.id,
      fullName: profile.full_name ?? "Unknown",
      avatarUrl: profile.avatar_url ?? null,
      totalPoints: 0,
      exactScores: 0,
      correctOutcomes: 0,
      totalPredictions: 0,
    });
  }

  for (const pred of predictions ?? []) {
    if (!finishedIds.has(pred.match_id)) continue;
    const match = scoreMap.get(pred.match_id);
    if (!match || match.home_score === null || match.away_score === null) continue;

    const pts = calcPoints(pred.home_score, pred.away_score, match.home_score, match.away_score);

    const entry = entryMap.get(pred.user_id);
    if (!entry) continue;

    entry.totalPoints += pts;
    entry.totalPredictions++;
    if (pts === 3) entry.exactScores++;
    if (pts === 1) entry.correctOutcomes++;
  }

  const leaderboard = Array.from(entryMap.values()).sort(
    (a, b) => b.totalPoints - a.totalPoints || b.exactScores - a.exactScores
  );

  const podiumStyles = [
    { ring: "ring-1 ring-primary/40", bg: "bg-primary/8", label: "text-primary" },
    { ring: "ring-1 ring-slate-400/30", bg: "bg-slate-400/5", label: "text-slate-400" },
    { ring: "ring-1 ring-amber-700/30", bg: "bg-amber-900/10", label: "text-amber-600" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Exact score{" "}
          <span className="text-primary font-semibold">+3 pts</span>
          {" · "}
          Correct outcome{" "}
          <span className="text-blue-400 font-semibold">+1 pt</span>
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium">No players yet</p>
          <p className="text-sm mt-1">Sign in to join the leaderboard.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, i) => {
            const isMe = user?.id === entry.userId;
            const podium = i < 3 ? podiumStyles[i] : null;

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${
                  isMe
                    ? "border-primary/30 bg-primary/5"
                    : podium
                    ? `${podium.ring} ${podium.bg}`
                    : "border-border bg-card hover:bg-card/80"
                }`}
              >
                {/* Rank */}
                <div
                  className="w-7 text-center shrink-0 font-bold"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {i === 0 ? (
                    <span className="text-lg">🥇</span>
                  ) : i === 1 ? (
                    <span className="text-lg">🥈</span>
                  ) : i === 2 ? (
                    <span className="text-lg">🥉</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <UserAvatar src={entry.avatarUrl} name={entry.fullName} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {entry.fullName}
                    {isMe && (
                      <span className="ml-2 text-xs font-normal text-primary">you</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="text-primary font-medium">{entry.exactScores} exact</span>
                    {" · "}
                    <span className="text-blue-400">{entry.correctOutcomes} outcome</span>
                    {" · "}
                    {entry.totalPredictions} played
                  </p>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <span
                    className={`text-2xl font-bold ${podium ? podium.label : "text-foreground"}`}
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {entry.totalPoints}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
