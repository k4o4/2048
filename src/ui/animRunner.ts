import { FF_ANIMATIONS } from '../flags';

export type AnimAction = unknown;
export type ClassFor = (action: AnimAction) => string;

/**
 * begin: starts an animation sequence if FF_ANIMATIONS is true.
 * - OFF (default): calls onDone synchronously exactly once.
 * - ON: schedules a minimal async step then calls onDone once.
 */
export function begin(actions: AnimAction[], classFor: ClassFor, onDone: () => void): void {
  let done = false;
  const once = () => {
    if (done) return;
    done = true;
    onDone();
  };

  if (!FF_ANIMATIONS) {
    // No timers, no classes, strict sync
    once();
    return;
  }

  // Minimal async handoff to allow visual effects (kept tiny)
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  setTimeout(() => {
    // A second tick for any CSS transitions if desired
    requestAnimationFrame(() => {
      once();
    });
  }, 0);
}
