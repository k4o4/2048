import { describe, it, expect } from 'vitest';
import { init as initializeGame, move as applyMove } from '../../engine';
import { makeUISpawnScript } from '../../src/spawn';

describe('random spawn never yields invalid entry in play', () => {
  it('does 200 moves without throwing', () => {
    (import.meta as any).env = { VITE_E2E: '0' };
    const spawn = makeUISpawnScript();
    let state = initializeGame({ N: 4, spawn_script: spawn, initial_spawns: 2 });
    // do many moves; if script returns invalid, engine will throw
    const dirs = ['Left','Right','Up','Down'] as const;
    for (let i=0;i<200;i++) {
      const dir = dirs[i % 4];
      try {
        const next = applyMove(state, dir);
        state = next;
      } catch (e) {
        throw new Error(`engine threw at i=${i}: ${String(e)}`);
      }
    }
    expect(state).toBeTruthy();
  });
});
