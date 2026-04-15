export function calcPoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predHome === actualHome && predAway === actualAway) return 3;
  const predOutcome = Math.sign(predHome - predAway);
  const actualOutcome = Math.sign(actualHome - actualAway);
  if (predOutcome === actualOutcome) return 1;
  return 0;
}
