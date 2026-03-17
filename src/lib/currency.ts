/**
 * Currency conversion utility – USD to ZAR.
 * Uses a fixed indicative rate; swap for a live feed when the backend is wired up.
 */
const USD_TO_ZAR = 18.5;

/** Convert a USD amount to ZAR */
export function toZAR(usd: number): number {
  return usd * USD_TO_ZAR;
}

/** Format a USD amount as a ZAR string  e.g. "R 1 234.56" */
export function formatZAR(usd: number, decimals = 2): string {
  const zar = usd * USD_TO_ZAR;
  return `R${zar.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/** Shorthand – no decimals, e.g. "R 12 345" */
export function formatZARShort(usd: number): string {
  return formatZAR(usd, 0);
}

export { USD_TO_ZAR };
