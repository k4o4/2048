/**
 * Feature flags for the UI.
 * Defaults: animations OFF.
 */

/** Coerces environment-like values to boolean. Only "1"/"true"/true are treated as true. */
export function coerceFlag(input: unknown): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const v = input.trim().toLowerCase();
    return v === '1' || v === 'true';
  }
  if (typeof input === 'number') return input === 1;
  return false;
}

// Vite injects import.meta.env at build time.
const env: any = (import.meta as any)?.env ?? {};
// Animations default OFF unless explicitly enabled
export const FF_ANIMATIONS: boolean = coerceFlag(env.VITE_FF_ANIMATIONS);
