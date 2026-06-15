const INITIAL_BALANCE = 50;

export function calculateCredits(distanceKm) {
  const km = Math.max(0, distanceKm);

  if (km <= 5) return 5;
  if (km <= 15) return 5 + (km - 5) * 1;
  if (km <= 30) return 15 + (km - 15) * 0.75;
  return 26 + (km - 30) * 0.5;
}

export function formatCredits(value) {
  return Number(value).toFixed(2);
}

export { INITIAL_BALANCE };
