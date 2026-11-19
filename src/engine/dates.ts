/** Local-calendar day keys (YYYY-MM-DD). Learning days follow the learner's clock. */

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/**
 * Consecutive learning days ending today — or yesterday, so the count doesn't
 * read as zero just because today's session hasn't happened yet.
 */
export function currentRun(activity: Record<string, number>, today: Date): number {
  let cursor = activity[dayKey(today)] ? today : addDays(today, -1);
  let run = 0;
  while (activity[dayKey(cursor)]) {
    run++;
    cursor = addDays(cursor, -1);
  }
  return run;
}

/** Monday-first days of the week containing `today`. */
export function weekDays(today: Date): Date[] {
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const monday = addDays(today, -dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
