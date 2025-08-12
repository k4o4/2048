import { describe, it, expect, vi } from 'vitest';
import { makeUISpawnScript } from '../../src/spawn';

describe('prod spawn script returns valid entries', () => {
  it('returns null or a valid entry on any board', () => {
    (import.meta as any).env = { VITE_E2E: '0' };
    const script = makeUISpawnScript();
    const boards = [
      [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
      [[2,4,8,16],[32,64,128,256],[2,4,8,16],[0,64,128,256]],
      [[2,2,4,8],[16,32,64,128],[256,512,1024,0],[0,0,0,0]]
    ] as number[][][];
    for (const b of boards) {
      const e = script.nextSpawn(b);
      if (e !== null) {
        expect(e.value === 2 || e.value === 4).toBe(true);
        expect(b[e.row][e.col]).toBe(0);
      }
    }
  });
});
