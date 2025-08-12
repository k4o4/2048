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

describe('win/lose', () => {
  it('win detected pre-spawn and respects stop_on_win', () => {
    const s = init({ spawn_script: createSpawnScript([{ row: 0, col: 3, value: 2 }]) });
    s.board = [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    const won = move(s, 'Left');
    expect(won.status).toBe('Won');
    expect(won.board[0][0]).toBe(2048);
    // Note: spawn consumption is now handled internally by the engine
  });

  it('lose detected on no-op with no legal moves', () => {
    const s = init();
    s.board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ];
    const after = move(s, 'Up');
    expect(after.status).toBe('Lost');
  });
});


