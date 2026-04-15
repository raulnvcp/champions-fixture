// Maps football-data.org TLA codes → ISO 3166-1 alpha-2 codes for flagcdn.com
export const tlaToFlag: Record<string, string> = {
  // UCL clubs
  RMA: "es",  // Real Madrid
  BAY: "de",  // Bayern Munich
  MCI: "gb-eng", // Manchester City
  PSG: "fr",  // PSG
  BAR: "es",  // Barcelona
  ARS: "gb-eng", // Arsenal
  LIV: "gb-eng", // Liverpool
  INT: "it",  // Inter Milan
  BVB: "de",  // Borussia Dortmund
  ATM: "es",  // Atlético Madrid
  JUV: "it",  // Juventus
  ACM: "it",  // AC Milan
  CHE: "gb-eng", // Chelsea
  PSV: "nl",  // PSV
  BEN: "pt",  // Benfica
  B04: "de",  // Bayer Leverkusen
  ATA: "it",  // Atalanta
  POR: "pt",  // Porto
  FEY: "nl",  // Feyenoord
  CLB: "be",  // Club Brugge
  MON: "mc",  // Monaco
  AVL: "gb-eng", // Aston Villa
  SPO: "pt",  // Sporting CP
  CEL: "gb-sct", // Celtic
  // National teams (kept for API sync compatibility)
  ALG: "dz",
  ARG: "ar",
  AUS: "au",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CIV: "ci",
  COD: "cd",
  COL: "co",
  CPV: "cv",
  CRO: "hr",
  CUR: "cw",
  CZE: "cz",
  ECU: "ec",
  EGY: "eg",
  ENG: "gb-eng",
  ESP: "es",
  FRA: "fr",
  GER: "de",
  GHA: "gh",
  HAI: "ht",
  IRN: "ir",
  IRQ: "iq",
  JOR: "jo",
  JPN: "jp",
  KOR: "kr",
  KSA: "sa",
  MAR: "ma",
  MEX: "mx",
  NED: "nl",
  NOR: "no",
  NZL: "nz",
  PAN: "pa",
  PAR: "py",
  QAT: "qa",
  RSA: "za",
  SCO: "gb-sct",
  SEN: "sn",
  SUI: "ch",
  SWE: "se",
  TUN: "tn",
  TUR: "tr",
  URU: "uy",
  USA: "us",
  UZB: "uz",
};

export function flagCode(tla: string | null | undefined): string {
  if (!tla) return "";
  return tlaToFlag[tla] ?? tla.toLowerCase().slice(0, 2);
}
