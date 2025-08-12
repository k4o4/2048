import { describe, expect, it } from 'vitest';
import { init, move, undo, redo, type SpawnScript } from '../../engine';

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

describe('history undo/redo', () => {
  it('undo restores exact board & score; redo replays', () => {
    const s = init({ spawn_script: createSpawnScript([{ row: 0, col: 1, value: 2 }]) });
    s.board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    const after = move(s, 'Left');
    const undone = undo(after);
    expect(undone.board).toEqual(s.board);
    expect(undone.score).toBe(s.score);
    const redone = redo(undone);
    expect(redone.board).toEqual(after.board);
    expect(redone.score).toBe(after.score);
  });

  it('no-op move does not create history entries (but may set Lost)', () => {
    const s = init();
    s.board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [2, 4, 8, 16],
      [32, 64, 128, 256]
    ];
    const after = move(s, 'Left');
    expect(after.status).toBe('Lost');
    expect(after.history).toEqual(s.history);
    expect(after.future).toEqual(s.future);
  });
});


