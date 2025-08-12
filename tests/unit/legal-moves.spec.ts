import { describe, expect, it } from 'vitest';
import { init, legal_moves, can_move } from '../../engine';

describe('legal_moves / can_move', () => {
  it('true when any slide/merge exists', () => {
    const s = init();
    s.board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    expect(legal_moves(s).size).toBeGreaterThan(0);
    expect(can_move(s)).toBe(true);
  });

  it('false on fully blocked board', () => {
    const s = init();
    s.board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ];
    expect(legal_moves(s).size).toBe(0);
    expect(can_move(s)).toBe(false);
  });

  it('mixed board: left and right legal; up/down not', () => {
    const s = init();
    s.board = [
      [2, 2, 4, 8],
      [8, 4, 2, 16],
      [16, 32, 8, 4],
      [4, 8, 16, 2]
    ];
    const moves = legal_moves(s);
    expect(moves.has('Left')).toBe(true);
    expect(moves.has('Right')).toBe(true);
    expect(moves.has('Up')).toBe(false);
    expect(moves.has('Down')).toBe(false);
  });

  it('vertical only: up and down legal', () => {
    const s = init();
    s.board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    const moves = legal_moves(s);
    expect(moves.has('Up')).toBe(true);
    expect(moves.has('Down')).toBe(true);
  });
});


