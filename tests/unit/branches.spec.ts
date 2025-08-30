import { describe, expect, it } from 'vitest';
import { move, legal_moves, undo, redo, serialize, type SpawnScript } from '../../engine';
import { makeTestState } from '../utils/testState';

// Helper function to create a SpawnScript from an array (kept for explicit invalid-case test)
function createSpawnScript(entries: { row: number; col: number; value: 2 | 4 }[]): SpawnScript {
  let index = 0;
  return {
    nextSpawn: () => {
      if (index >= entries.length) return null;
      const entry = entries[index];
      index++;
      return entry;
    }
  };
}

// Empty spawn script that never spawns
const emptySpawnScript: SpawnScript = { nextSpawn: () => null };

describe('branch coverage touches', () => {
  it('legal_moves empty set on blocked board', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [
      [2,4,2,4],
      [4,2,4,2],
      [2,4,2,4],
      [4,2,4,2]
    ]});
    expect(Array.from(legal_moves(s))).toEqual([]);
  });

  it('undo/redo no-ops when stacks empty', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ]});
    const u = undo(s);
    const r = redo(s);
    expect(u).toEqual(s);
    expect(r).toEqual(s);
  });

  it('status Won (continue) persists and spawns skipped if script exhausted', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]});
    s.stop_on_win = false;
    const after = move(s, 'Left');
    expect(after.status).toBe('Won (continue)');
  });

  it('spawn invalid entry throws (occupied cell after change)', () => {
    const s = makeTestState({ spawn: { mode: 'array', spawns: [{ row: 0, col: 0, value: 2 }] }, board: [[0,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] });
    expect(() => move(s, 'Left')).toThrowError();
  });

  it('changed board but spawn script exhausted → no spawn placed', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [[0,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] });
    const before = serialize(s);
    const next = move(s, 'Left');
    const prev = JSON.parse(before);
    expect(next.board).toEqual([[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
    expect((next.history ?? []).length).toBe((prev.history ?? []).length + 1);
  });

  it('undo then new move clears future (redo does nothing)', () => {
    const s = makeTestState({ spawn: { mode: 'array', spawns: [{ row: 0, col: 1, value: 2 }] }, board: [[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] });
    const a = move(s, 'Left');
    const u = undo(a);
    const b = move(u, 'Right');
    const r = redo(b);
    expect(r).toEqual(b);
  });

  it('lose after state-changing move', () => {
    const s = makeTestState({ spawn: { mode: 'array', spawns: [{ row: 0, col: 3, value: 4 }] }, board: [
      [0, 2, 4, 8],
      [16, 8, 4, 2],
      [8, 4, 2, 16],
      [4, 16, 8, 32]
    ]});
    const next = move(s, 'Left');
    expect(next.status).toBe('Lost');
  });
});


