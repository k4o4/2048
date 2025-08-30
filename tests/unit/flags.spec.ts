import { describe, it, expect } from 'vitest';
import { coerceFlag } from '../../src/flags';

describe('flags coerceFlag', () => {
  it('treats only "1"/"true"/true as true', () => {
    expect(coerceFlag(true)).toBe(true);
    expect(coerceFlag('true')).toBe(true);
    expect(coerceFlag('TRUE')).toBe(true);
    expect(coerceFlag('1')).toBe(true);

    expect(coerceFlag(false)).toBe(false);
    expect(coerceFlag('0')).toBe(false);
    expect(coerceFlag('false')).toBe(false);
    expect(coerceFlag('')).toBe(false);
    expect(coerceFlag(undefined)).toBe(false);
    expect(coerceFlag(null as any)).toBe(false);
    expect(coerceFlag(0)).toBe(false);
    expect(coerceFlag(2)).toBe(false);
  });
});
