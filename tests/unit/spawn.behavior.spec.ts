import { describe, expect, it, vi } from 'vitest';
import { init, move, type GameState, type SpawnScript } from '../../engine';

function makeState(board: number[][], script: SpawnScript): GameState {
  const s = init({ N: board.length, initial_spawns: 0, spawn_script: script });
  s.board = board.map(r => [...r]);
  return s;
}

describe('spawn invocation behavior', () => {
  it('spawns exactly once when changed === true', () => {
    // After moving Right, [0,2] will be empty; spawn there
    const spy = { nextSpawn: vi.fn<[], any>().mockReturnValue({ row: 0, col: 2, value: 2 }) } as unknown as SpawnScript;
    const state = makeState([
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ], spy);

    const next = move(state, 'Right');
    expect(next.board[0][2]).toBe(2);
    expect((spy.nextSpawn as any).mock.calls.length).toBe(1);
  });

  it('does not spawn when changed === false', () => {
    const spy = { nextSpawn: vi.fn<[], any>().mockReturnValue({ row: 0, col: 0, value: 2 }) } as unknown as SpawnScript;
    const state = makeState([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ], spy);

    const next = move(state, 'Left'); // compress/merge is no-op -> unchanged
    expect(next.board[0][0]).toBe(2); // unchanged
    expect((spy.nextSpawn as any).mock.calls.length).toBe(0);
  });
});
