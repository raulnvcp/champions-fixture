import Image from "next/image";
import type { DbMatch } from "@/components/match-card";

interface TeamStanding {
  team: string;
  flagCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

function calculateStandings(matches: DbMatch[]): TeamStanding[] {
  const map = new Map<string, TeamStanding>();

  function ensure(team: string, flagCode: string): TeamStanding {
    if (!map.has(team)) {
      map.set(team, { team, flagCode, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    }
    return map.get(team)!;
  }

  for (const m of matches) {
    if (m.status !== "finished" || m.home_score === null || m.away_score === null) {
      ensure(m.home_team_name, m.home_flag_code);
      ensure(m.away_team_name, m.away_flag_code);
      continue;
    }
    const home = ensure(m.home_team_name, m.home_flag_code);
    const away = ensure(m.away_team_name, m.away_flag_code);
    const hs = m.home_score, as_ = m.away_score;
    home.played++; away.played++;
    home.gf += hs; home.ga += as_;
    away.gf += as_; away.ga += hs;
    if (hs > as_) { home.won++; home.points += 3; away.lost++; }
    else if (hs < as_) { away.won++; away.points += 3; home.lost++; }
    else { home.drawn++; away.drawn++; home.points++; away.points++; }
  }

  return Array.from(map.values())
    .map((s) => ({ ...s, gd: s.gf - s.ga }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });
}

export default function GroupStandings({ matches }: { matches: DbMatch[] }) {
  const standings = calculateStandings(matches);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Standings
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-muted-foreground text-xs">
            <th className="text-left px-3 py-2 w-6 font-medium">#</th>
            <th className="text-left px-2 py-2 font-medium">Team</th>
            <th className="px-2 py-2 font-medium text-center w-7">P</th>
            <th className="px-2 py-2 font-medium text-center w-7">W</th>
            <th className="px-2 py-2 font-medium text-center w-7">D</th>
            <th className="px-2 py-2 font-medium text-center w-7">L</th>
            <th className="px-2 py-2 font-medium text-center w-10 hidden sm:table-cell">GF</th>
            <th className="px-2 py-2 font-medium text-center w-10 hidden sm:table-cell">GA</th>
            <th className="px-2 py-2 font-medium text-center w-10">GD</th>
            <th className="px-3 py-2 font-medium text-center w-12">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const qualified = i < 2;
            return (
              <tr
                key={row.team}
                className={`border-b border-border/40 last:border-0 transition-colors ${
                  qualified ? "bg-emerald-950/25 hover:bg-emerald-950/40" : "hover:bg-muted/20"
                }`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {qualified && (
                      <span className="w-1 h-4 rounded-full bg-emerald-500/60 shrink-0" />
                    )}
                    <span className="text-muted-foreground text-xs">{i + 1}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    {row.flagCode ? (
                      <Image
                        src={`https://flagcdn.com/w40/${row.flagCode}.png`}
                        alt={row.team}
                        width={20}
                        height={14}
                        className="rounded-sm object-cover h-3.5 w-5 shrink-0"
                        unoptimized
                      />
                    ) : (
                      <div className="h-3.5 w-5 rounded-sm bg-muted shrink-0" />
                    )}
                    <span className="font-semibold text-xs truncate">{row.team}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">{row.played}</td>
                <td className="px-2 py-2.5 text-center text-xs font-medium">{row.won}</td>
                <td className="px-2 py-2.5 text-center text-xs">{row.drawn}</td>
                <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">{row.lost}</td>
                <td className="px-2 py-2.5 text-center text-xs text-muted-foreground hidden sm:table-cell">{row.gf}</td>
                <td className="px-2 py-2.5 text-center text-xs text-muted-foreground hidden sm:table-cell">{row.ga}</td>
                <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {row.points}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
