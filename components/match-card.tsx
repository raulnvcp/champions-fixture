import Image from "next/image";
import PredictionForm from "@/components/prediction-form";

export interface DbMatch {
  id: number;
  utc_date: string;
  status: string;
  stage: string;
  group_name: string | null;
  home_team_name: string;
  home_team_tla: string | null;
  home_team_crest: string | null;
  home_flag_code: string;
  away_team_name: string;
  away_team_tla: string | null;
  away_team_crest: string | null;
  away_flag_code: string;
  home_score: number | null;
  away_score: number | null;
  winner: string | null;
  matchday: number | null;
}

export interface DbPrediction {
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
}

interface MatchCardProps {
  match: DbMatch;
  prediction?: DbPrediction | null;
  isLoggedIn?: boolean;
}

function teamImageUrl(crest: string | null, flagCode: string) {
  if (crest) return crest;
  return `https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

const STAGE_LABELS: Record<string, string> = {
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter_final: "Quarter-final",
  semi_final: "Semi-final",
  third_place: "3rd Place",
  final: "Final",
};

export default function MatchCard({ match, prediction, isLoggedIn }: MatchCardProps) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const homeWins = isFinished && match.winner === "HOME_TEAM";
  const awayWins = isFinished && match.winner === "AWAY_TEAM";

  const topBorderColor = isFinished ? "border-t-emerald-500/70" : "border-t-border";

  const stageLabel =
    match.stage === "group"
      ? match.group_name ? `Group ${match.group_name}` : `Matchday ${match.matchday}`
      : STAGE_LABELS[match.stage] ?? match.stage;

  return (
    <div
      className={`relative bg-card border border-border ${isLive ? "" : `border-t-2 ${topBorderColor}`} rounded-xl overflow-hidden flex flex-col gap-4 hover:border-border/60 hover:bg-card/80 transition-all duration-200`}
    >
      {/* Live animated bar */}
      {isLive && (
        <div className="flex flex-col items-center gap-0.5 pt-2 px-4">
          <span className="text-[10px] font-bold tracking-widest uppercase text-red-400">Live</span>
          <div className="live-bar w-full h-0.5 rounded-full" />
        </div>
      )}

      {/* Card body */}
      <div className={`px-4 pb-4 flex flex-col gap-4 ${isLive ? "" : "pt-4"}`}>

      {/* Header row */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          {stageLabel}
        </span>

        {isLive ? (
          <span className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </span>
        ) : isFinished ? (
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            FT
          </span>
        ) : (
          <span className="text-muted-foreground">{formatDate(match.utc_date)}</span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {match.home_team_crest || match.home_flag_code ? (
            <Image
              src={teamImageUrl(match.home_team_crest, match.home_flag_code)}
              alt={match.home_team_name}
              width={40}
              height={40}
              className={`object-contain h-10 w-10 transition-all ${homeWins ? "drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : awayWins ? "opacity-40" : ""}`}
              unoptimized
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground text-xs font-bold">
              TBD
            </div>
          )}
          <span
            className={`text-xs font-semibold text-center leading-tight w-full truncate ${homeWins ? "text-emerald-400" : awayWins ? "opacity-50" : ""}`}
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {match.home_team_tla ?? match.home_team_name}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center shrink-0 gap-0.5">
          {isFinished || isLive ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-3xl font-bold tabular-nums w-8 text-center leading-none ${homeWins ? "text-emerald-400" : ""}`}
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {match.home_score ?? 0}
              </span>
              <span className="text-muted-foreground text-lg font-light">:</span>
              <span
                className={`text-3xl font-bold tabular-nums w-8 text-center leading-none ${awayWins ? "text-emerald-400" : ""}`}
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {match.away_score ?? 0}
              </span>
            </div>
          ) : (
            <span
              className="text-base font-bold text-muted-foreground px-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              VS
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {match.away_team_crest || match.away_flag_code ? (
            <Image
              src={teamImageUrl(match.away_team_crest, match.away_flag_code)}
              alt={match.away_team_name}
              width={40}
              height={40}
              className={`object-contain h-10 w-10 transition-all ${awayWins ? "drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : homeWins ? "opacity-40" : ""}`}
              unoptimized
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground text-xs font-bold">
              TBD
            </div>
          )}
          <span
            className={`text-xs font-semibold text-center leading-tight w-full truncate ${awayWins ? "text-emerald-400" : homeWins ? "opacity-50" : ""}`}
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {match.away_team_tla ?? match.away_team_name}
          </span>
        </div>
      </div>

      {/* Prediction form */}
      {isLoggedIn && match.status === "scheduled" && (
        <PredictionForm matchId={match.id} existing={prediction ?? null} />
      )}

      {/* Result row */}
      {isLoggedIn && match.status === "finished" && prediction && (
        <div className="border-t border-border/50 pt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Pick: <span className="text-foreground font-semibold">{prediction.home_score}–{prediction.away_score}</span>
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              prediction.points === 3
                ? "bg-primary/15 text-primary"
                : prediction.points === 1
                ? "bg-blue-500/15 text-blue-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {prediction.points != null ? `+${prediction.points} pts` : "0 pts"}
          </span>
        </div>
      )}

      </div>{/* end card body */}
    </div>
  );
}
