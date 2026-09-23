export function secondsRemaining(
  startedAt: Date,
  timeLimitMinutes: number | null | undefined,
  now = new Date()
): number | null {
  if (timeLimitMinutes == null) return null;
  const end = startedAt.getTime() + timeLimitMinutes * 60 * 1000;
  return Math.max(0, Math.floor((end - now.getTime()) / 1000));
}

export function isTimeExpired(
  startedAt: Date,
  timeLimitMinutes: number | null | undefined,
  now = new Date()
): boolean {
  const left = secondsRemaining(startedAt, timeLimitMinutes, now);
  return left != null && left <= 0;
}
