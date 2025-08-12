import { describe, expect, it } from 'vitest';
import { compressLeft, mergeLeft } from '../../engine';

function scoreFor(line: number[]): number {
  const c1 = compressLeft(line);
  const m = mergeLeft(c1);
  return m.scoreDelta;
}

describe('scoring', () => {
  it('single merge', () => {
    expect(scoreFor([2, 2, 0, 0])).toBe(4);
  });
  it('two merges in one line', () => {
    expect(scoreFor([2, 2, 4, 4])).toBe(12);
  });
});


