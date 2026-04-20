"use client";

import Image from "next/image";
import type { DbMatch } from "./match-card";

interface BracketViewProps {
  matches: DbMatch[];
}

/** A two-legged knockout tie with aggregate display match */
interface TieEntry {
  display: DbMatch; // aggregate (or single match for the final)
  leg1: DbMatch;
  leg2: DbMatch | null;
}

function teamImageUrl(crest: string | null, flagCode: string) {
  if (crest) return crest;
  return `https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`;
}

function TeamRow({
  name,
  tla,
  crest,
  flagCode,
  score,
  isLoser,
  isWinner,
}: {
  name: string;
  tla: string | null;
  crest: string | null;
  flagCode: string;
  score: number | null;
  isLoser?: boolean;
  isWinner?: boolean;
}) {
  const imgSrc = crest || (flagCode ? teamImageUrl(null, flagCode) : null);
  const label = tla ?? name;
  const isTbd = !tla && (!name || name === "TBD");

  if (isTbd) return <TbdRow />;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 transition-all ${
        isLoser ? "opacity-30" : "opacity-100"
      }`}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={label}
          width={22}
          height={22}
          className={`object-contain w-[22px] h-[22px] shrink-0 ${isWinner ? "drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" : ""}`}
          unoptimized
        />
      ) : (
        <div className="w-[22px] h-[22px] rounded-full bg-white/20 shrink-0" />
      )}
      <span className={`text-xs font-semibold truncate flex-1 max-w-[60px] ${isWinner ? "text-emerald-400" : ""}`}>
        {label}
      </span>
      {score !== null && (
        <span className={`text-xs font-bold tabular-nums ${isWinner ? "text-emerald-400" : ""}`}>{score}</span>
      )}
    </div>
  );
}

function TbdRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 opacity-20">
      <div className="w-[22px] h-[22px] rounded-full bg-slate-500 shrink-0" />
      <span className="text-xs text-slate-400">TBD</span>
    </div>
  );
}

/** A single leg row inside the popover: "TLA  score – score  TLA" */
function LegRow({ leg, label }: { leg: DbMatch; label: string }) {
  const homeTla = leg.home_team_tla ?? leg.home_team_name;
  const awayTla = leg.away_team_tla ?? leg.away_team_name;
  const hasScore = leg.home_score !== null;

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-400/60 mb-1">{label}</p>
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
        <span className="truncate max-w-[52px] text-slate-200">{homeTla}</span>
        <span className="tabular-nums text-slate-300 shrink-0">
          {hasScore ? `${leg.home_score} – ${leg.away_score}` : "– – –"}
        </span>
        <span className="truncate max-w-[52px] text-right text-slate-200">{awayTla}</span>
      </div>
    </div>
  );
}

function BracketCard({ tie }: { tie: TieEntry | null }) {
  if (!tie) {
    return (
      <div className="w-[140px] rounded-lg border border-slate-700/40 bg-slate-900/40 overflow-hidden shrink-0">
        <TbdRow />
        <div className="h-px bg-slate-700/40" />
        <TbdRow />
      </div>
    );
  }

  const { display: match, leg1, leg2 } = tie;
  const isFinished = match.status === "finished";
  const homeWins = isFinished && match.winner === "HOME_TEAM";
  const awayWins = isFinished && match.winner === "AWAY_TEAM";

  // Show popover only for two-legged ties where at least one leg has played
  const showPopover = leg2 !== null && (leg1.home_score !== null || leg2.home_score !== null);

  return (
    <div className="relative group w-[140px] shrink-0">
      {/* Card */}
      <div className="w-full rounded-lg border border-cyan-500/20 bg-gradient-to-b from-slate-800/70 to-slate-900/90 overflow-hidden hover:border-cyan-400/45 hover:from-slate-700/70 transition-all duration-200 cursor-default shadow-lg shadow-black/30">
        <div className={homeWins ? "bg-emerald-500/10" : ""}>
          <TeamRow
            name={match.home_team_name}
            tla={match.home_team_tla}
            crest={match.home_team_crest}
            flagCode={match.home_flag_code}
            score={match.home_score}
            isLoser={isFinished && awayWins}
            isWinner={homeWins}
          />
        </div>
        <div className="h-px bg-cyan-500/15" />
        <div className={awayWins ? "bg-emerald-500/10" : ""}>
          <TeamRow
            name={match.away_team_name}
            tla={match.away_team_tla}
            crest={match.away_team_crest}
            flagCode={match.away_flag_code}
            score={match.away_score}
            isLoser={isFinished && homeWins}
            isWinner={awayWins}
          />
        </div>
      </div>

      {/* Hover popover — two-legged ties only */}
      {showPopover && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block">
          <div className="rounded-lg border border-cyan-500/25 bg-slate-900/95 backdrop-blur-sm shadow-xl shadow-black/50 p-3 flex flex-col gap-2.5 min-w-[170px]">
            <LegRow leg={leg1} label="1st leg" />
            <div className="h-px bg-slate-700/50" />
            <LegRow leg={leg2!} label="2nd leg" />
          </div>
          {/* Arrow */}
          <div className="mx-auto w-2.5 h-2.5 -mt-1 rotate-45 bg-slate-900/95 border-b border-r border-cyan-500/25" />
        </div>
      )}
    </div>
  );
}

/** Column of n match cards, each occupying an equal vertical slot */
function RoundColumn({ ties }: { ties: (TieEntry | null)[] }) {
  return (
    <div className="flex flex-col h-full shrink-0">
      {ties.map((tie, i) => (
        <div
          key={tie?.display.id ?? `tbd-${i}`}
          className="flex-1 flex items-center"
        >
          <BracketCard tie={tie} />
        </div>
      ))}
    </div>
  );
}

/**
 * Left-side bracket connector.
 * For each `pair` group (2 R16 slots → 1 next-round slot):
 *   - Horizontal arms at 25 % and 75 % connect from the match cards (left)
 *     to a vertical bar placed at 60 % of the connector width.
 *   - A short stem at 50 % runs from the vertical bar to the right edge,
 *     meeting the next-round match card.
 */
function LeftConnector({ pairs }: { pairs: number }) {
  return (
    <div className="flex flex-col h-full shrink-0" style={{ width: 36 }}>
      {Array.from({ length: pairs }).map((_, i) => (
        <div key={i} className="flex-1 relative">
          {/* vertical bar */}
          <div
            className="absolute w-px bg-cyan-400/30"
            style={{ left: "62%", top: "25%", bottom: "25%" }}
          />
          {/* top arm: match center → vertical bar */}
          <div
            className="absolute h-px bg-cyan-400/30"
            style={{ top: "25%", left: 0, right: "38%" }}
          />
          {/* bottom arm: match center → vertical bar */}
          <div
            className="absolute h-px bg-cyan-400/30"
            style={{ top: "75%", left: 0, right: "38%" }}
          />
          {/* mid stem: vertical bar → next-round match */}
          <div
            className="absolute h-px bg-cyan-400/30"
            style={{ top: "50%", left: "62%", right: 0 }}
          />
        </div>
      ))}
    </div>
  );
}

/** Mirror of LeftConnector for the right half of the bracket */
function RightConnector({ pairs }: { pairs: number }) {
  return (
    <div className="flex flex-col h-full shrink-0" style={{ width: 36 }}>
      {Array.from({ length: pairs }).map((_, i) => (
        <div key={i} className="flex-1 relative">
          {/* vertical bar */}
          <div
            className="absolute w-px bg-cyan-400/30"
            style={{ left: "38%", top: "25%", bottom: "25%" }}
          />
          {/* top arm: vertical bar → match center */}
          <div
            className="absolute h-px bg-cyan-400/30"
            style={{ top: "25%", left: "38%", right: 0 }}
          />
          {/* bottom arm */}
          <div
            className="absolute h-px bg-cyan-400/30"
            style={{ top: "75%", left: "38%", right: 0 }}
          />
          {/* mid stem: next-round match → vertical bar */}
          <div
            className="absolute h-px bg-cyan-400/30"
            style={{ top: "50%", left: 0, right: "62%" }}
          />
        </div>
      ))}
    </div>
  );
}

/** Simple horizontal stem between SF and Final */
function Stem() {
  return (
    <div className="h-full shrink-0 flex items-center" style={{ width: 20 }}>
      <div className="w-full h-px bg-cyan-400/30" />
    </div>
  );
}

function padTies(arr: TieEntry[], n: number): (TieEntry | null)[] {
  const out: (TieEntry | null)[] = arr.slice(0, n);
  while (out.length < n) out.push(null);
  return out;
}

export default function BracketView({ matches }: BracketViewProps) {
  const byStage = (stage: string) => matches.filter((m) => m.stage === stage);

  const r16 = byStage("round_of_16");
  const qf = byStage("quarter_final");
  const sf = byStage("semi_final");
  const finalMatch = byStage("final")[0] ?? null;

  // Need at least some knockout matches to render the visual bracket
  if (r16.length === 0 && qf.length === 0 && sf.length === 0 && !finalMatch) {
    return null;
  }

  // Each knockout round has 2 legs per tie (home + away).
  // IDs are assigned leg-1-first, so the first half by count = all leg 1 matches.
  // Build TieEntry[]: aggregate display + both individual leg matches.
  const buildAggregateTies = (arr: DbMatch[]): TieEntry[] => {
    const half = Math.floor(arr.length / 2);
    if (half === 0) return arr.map((m) => ({ display: m, leg1: m, leg2: null }));
    const leg1s = arr.slice(0, half);
    const leg2s = arr.slice(half);
    return leg1s.map((leg1, i) => {
      const leg2 = leg2s[i] ?? null;
      if (!leg2) return { display: leg1, leg1, leg2: null };
      const leg1HasScore = leg1.home_score !== null;
      const leg2HasScore = leg2.home_score !== null;
      const hasAnyScore = leg1HasScore || leg2HasScore;
      const homeAgg = hasAnyScore ? (leg1.home_score ?? 0) + (leg2.away_score ?? 0) : null;
      const awayAgg = hasAnyScore ? (leg1.away_score ?? 0) + (leg2.home_score ?? 0) : null;
      const bothFinished = leg1.status === "finished" && leg2.status === "finished";
      let winner: string | null = null;
      if (bothFinished && homeAgg !== null && awayAgg !== null) {
        if (homeAgg > awayAgg) winner = "HOME_TEAM";
        else if (awayAgg > homeAgg) winner = "AWAY_TEAM";
        else winner = leg2.winner; // AET/pens — leg 2 stores the decider
      }
      const display: DbMatch = {
        ...leg1,
        home_score: homeAgg,
        away_score: awayAgg,
        status: bothFinished ? "finished" : leg1.status,
        winner,
      };
      return { display, leg1, leg2 };
    });
  };

  const r16Ties = buildAggregateTies(r16); // 8 ties
  const qfTies  = buildAggregateTies(qf);  // 4 ties
  const sfTies  = buildAggregateTies(sf);  // 2 ties

  // Split each round's ties into left / right bracket halves
  const halfLen = (n: number) => Math.ceil(n / 2);
  const r16L = padTies(r16Ties.slice(0, halfLen(r16Ties.length)), 4);
  const r16R = padTies(r16Ties.slice(halfLen(r16Ties.length)), 4);
  const qfL  = padTies(qfTies.slice(0, halfLen(qfTies.length)), 2);
  const qfR  = padTies(qfTies.slice(halfLen(qfTies.length)), 2);
  const sfL  = padTies(sfTies.slice(0, 1), 1);
  const sfR  = padTies(sfTies.slice(1, 2), 1);

  // Final is a single match — wrap in TieEntry with no leg2
  const finalTie: TieEntry | null = finalMatch
    ? { display: finalMatch, leg1: finalMatch, leg2: null }
    : null;

  // Column widths (px) — must stay in sync with RoundColumn / connector widths
  const CW = 140; // card width
  const CON = 36; // connector width
  const ST = 20;  // stem width

  const labelCol = (label: string, w: number) => (
    <div
      className="text-center text-[10px] font-bold uppercase tracking-widest text-cyan-400/65"
      style={{ width: w }}
    >
      {label}
    </div>
  );

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-slate-950/60 border border-cyan-500/10 p-6 shadow-[inset_0_1px_0_rgba(6,182,212,0.08)]">
      {/* Round labels */}
      <div className="flex items-center mb-3">
        {labelCol("R16", CW)}
        <div style={{ width: CON }} />
        {labelCol("QF", CW)}
        <div style={{ width: CON }} />
        {labelCol("SF", CW)}
        <div style={{ width: ST }} />
        {labelCol("Final", CW)}
        <div style={{ width: ST }} />
        {labelCol("SF", CW)}
        <div style={{ width: CON }} />
        {labelCol("QF", CW)}
        <div style={{ width: CON }} />
        {labelCol("R16", CW)}
      </div>

      {/* Bracket */}
      <div
        className="flex items-stretch"
        style={{ height: 560 }}
      >
        {/* Left half */}
        <RoundColumn ties={r16L} />
        <LeftConnector pairs={2} />
        <RoundColumn ties={qfL} />
        <LeftConnector pairs={1} />
        <RoundColumn ties={sfL} />
        <Stem />

        {/* Final */}
        <div className="h-full flex items-center shrink-0">
          <BracketCard tie={finalTie} />
        </div>

        {/* Right half (mirrored) */}
        <Stem />
        <RoundColumn ties={sfR} />
        <RightConnector pairs={1} />
        <RoundColumn ties={qfR} />
        <RightConnector pairs={2} />
        <RoundColumn ties={r16R} />
      </div>
    </div>
  );
}
