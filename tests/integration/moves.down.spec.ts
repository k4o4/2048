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

describe('integration down moves', () => {
  it('vertical merges down with spawn', () => {
    const s = init({ spawn_script: createSpawnScript([{ row: 0, col: 1, value: 2 }]) });
    s.board = [[2,0,2,0],[0,0,2,0],[2,0,0,0],[2,0,2,0]];
    const next = move(s, 'Down');
    expect(next.board).toEqual([[0,2,0,0],[0,0,0,0],[2,0,2,0],[4,0,4,0]]);
  });
});


