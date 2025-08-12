import { describe, expect, it } from 'vitest';
import { compressLeft } from '../../engine';

describe('line compress', () => {
  it('pure compression no merges', () => {
    expect(compressLeft([2, 0, 2, 0])).toEqual([2, 2, 0, 0]);
    expect(compressLeft([0, 0, 0, 4])).toEqual([4, 0, 0, 0]);
  });
});


