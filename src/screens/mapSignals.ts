/** One-shot hand-off from the results screen to the map, so the newly unlocked node can animate. */
let pending: string | null = null;

export function setPendingUnlock(lessonId: string) {
  pending = lessonId;
}

export function takePendingUnlock(): string | null {
  const p = pending;
  pending = null;
  return p;
}
