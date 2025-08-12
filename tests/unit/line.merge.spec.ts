import { describe, expect, it } from 'vitest';
import { compressLeft, mergeLeft } from '../../engine';

function apply(line: number[]) {
  const c1 = compressLeft(line);
  const m = mergeLeft(c1);
  const c2 = compressLeft(m.line);
  return { out: c2, score: m.scoreDelta };
}

describe('line merge', () => {
  it('single-merge-per-tile cases', () => {
    expect(apply([2, 2, 2, 0])).toEqual({ out: [4, 2, 0, 0], score: 4 });
    expect(apply([4, 4, 4, 0])).toEqual({ out: [8, 4, 0, 0], score: 8 });
  });

  it('two independent merges', () => {
    expect(apply([2, 2, 4, 4])).toEqual({ out: [4, 8, 0, 0], score: 12 });
  });

  it('separated equals after compression', () => {
    expect(apply([2, 0, 2, 2])).toEqual({ out: [4, 2, 0, 0], score: 4 });
  });

  it('no-op line yields zero score', () => {
    expect(apply([2, 4, 8, 16])).toEqual({ out: [2, 4, 8, 16], score: 0 });
  });
});


