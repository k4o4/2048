import { describe, expect, it } from 'vitest';
import { init, move } from '../../engine';

describe('move guards', () => {
  it('early return when status=Won and stop_on_win=true', () => {
    const s = init({ stop_on_win: true });
    s.status = 'Won';
    s.board = [[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    const next = move(s, 'Left');
    expect(next).toBe(s);
  });

  it('early return when status=Lost', () => {
    const s = init();
    s.status = 'Lost';
    s.board = [[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    const next = move(s, 'Left');
    expect(next).toBe(s);
  });

  it('already Won + stop_on_win true short-circuits even if move would change', () => {
    const s = init({ stop_on_win: true });
    s.status = 'Won';
    s.board = [[0,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    const next = move(s, 'Left');
    expect(next).toBe(s);
  });
});


