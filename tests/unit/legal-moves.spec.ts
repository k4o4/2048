import { describe, expect, it } from 'vitest';
import { legal_moves, can_move } from '../../engine';
import { makeTestState } from '../utils/testState';

describe('legal_moves / can_move', () => {
  it('true when any slide/merge exists', () => {
    const s = makeTestState({ board: [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ], spawn: { mode: 'none' } });
    expect(legal_moves(s).size).toBeGreaterThan(0);
    expect(can_move(s)).toBe(true);
  });

  it('false on fully blocked board', () => {
    const s = makeTestState({ board: [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ], spawn: { mode: 'none' } });
    expect(legal_moves(s).size).toBe(0);
    expect(can_move(s)).toBe(false);
  });

  it('mixed board: left and right legal; up/down not', () => {
    const s = makeTestState({ board: [
      [2, 2, 4, 8],
      [8, 4, 2, 16],
      [16, 32, 8, 4],
      [4, 8, 16, 2]
    ], spawn: { mode: 'none' } });
    const moves = legal_moves(s);
    expect(moves.has('Left')).toBe(true);
    expect(moves.has('Right')).toBe(true);
    expect(moves.has('Up')).toBe(false);
    expect(moves.has('Down')).toBe(false);
  });

  it('vertical only: up and down legal', () => {
    const s = makeTestState({ board: [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ], spawn: { mode: 'none' } });
    const moves = legal_moves(s);
    expect(moves.has('Up')).toBe(true);
    expect(moves.has('Down')).toBe(true);
  });
});


