import { describe, expect, it } from 'vitest';
import { init, move, type SpawnScript } from '../../engine';

// Helper function to create a SpawnScript from an array
function createSpawnScript(entries: { row: number; col: number; value: 2 | 4 }[]): SpawnScript {
  let index = 0;
  return {
    nextSpawn: (board: readonly number[][]) => {
      if (index >= entries.length) return null;
      const entry = entries[index];
      index++;
      return entry;
    }
  };
}

describe('integration up moves', () => {
  it('vertical merges up with spawn', () => {
    const s = init({ spawn_script: createSpawnScript([{ row: 3, col: 3, value: 4 }]) });
    s.board = [[2,0,2,0],[0,0,2,0],[2,0,0,0],[2,0,2,0]];
    const next = move(s, 'Up');
    expect(next.board).toEqual([[4,0,4,0],[2,0,0,0],[0,0,0,0],[0,0,0,0]]);
  });
});


