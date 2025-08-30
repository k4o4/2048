import { describe, expect, it } from 'vitest';
import { move } from '../../engine';
import { makeTestState } from '../utils/testState';

describe('move guards', () => {
  it('early return when status=Won and stop_on_win=true', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] });
    s.stop_on_win = true;
    s.status = 'Won';
    const next = move(s, 'Left');
    expect(next).toBe(s);
  });

  it('early return when status=Lost', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] });
    s.status = 'Lost';
    const next = move(s, 'Left');
    expect(next).toBe(s);
  });

  it('already Won + stop_on_win true short-circuits even if move would change', () => {
    const s = makeTestState({ spawn: { mode: 'none' }, board: [[0,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] });
    s.stop_on_win = true;
    s.status = 'Won';
    const next = move(s, 'Left');
    expect(next).toBe(s);
  });
});


