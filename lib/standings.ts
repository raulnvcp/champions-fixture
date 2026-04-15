import type { Match } from "@/data/fixtures";

export interface TeamStanding {
  team: string;
  code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // goals for
  ga: number; // goals against
  gd: number; // goal difference
  points: number;
}

export function calculateStandings(matches: Match[]): TeamStanding[] {
  const map = new Map<string, TeamStanding>();

  function ensure(team: string, code: string) {
    if (!map.has(team)) {
      map.set(team, { team, code, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    }
    return map.get(team)!;
  }

  for (const match of matches) {
    if (match.status !== "finished" || match.homeScore === null || match.awayScore === null) {
      // Still register teams so they appear in the table with 0s
      ensure(match.homeTeam, match.homeCode);
      ensure(match.awayTeam, match.awayCode);
      continue;
    }

    const home = ensure(match.homeTeam, match.homeCode);
    const away = ensure(match.awayTeam, match.awayCode);
    const hs = match.homeScore;
    const as_ = match.awayScore;

    home.played++;
    away.played++;
    home.gf += hs;
    home.ga += as_;
    away.gf += as_;
    away.ga += hs;

    if (hs > as_) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (hs < as_) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  }

  const standings = Array.from(map.values()).map((s) => ({
    ...s,
    gd: s.gf - s.ga,
  }));

  // Sort: points → gd → gf → name
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });

  return standings;
}
