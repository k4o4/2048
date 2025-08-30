import { describe, expect, it } from 'vitest';
import { move } from '../../engine';
import { makeTestState } from '../utils/testState';

describe('win/lose', () => {
  it('win detected pre-spawn and respects stop_on_win', () => {
    const s = makeTestState({ spawn: { mode: 'array', spawns: [{ row: 0, col: 3, value: 2 }] }, board: [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]});
    const won = move(s, 'Left');
    expect(won.status).toBe('Won');
    expect(won.board[0][0]).toBe(2048);
  });

  it('lose detected on no-op with no legal moves', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ]});
    const after = move(s, 'Up');
    expect(after.status).toBe('Lost');
  });
});


