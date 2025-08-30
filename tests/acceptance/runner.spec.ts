import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Direction, SpawnScript } from '../../engine';
import { init, move as engineMove, serialize, type GameState } from '../../engine';
import { createArraySpawnScript } from '../utils/testSpawn';

type Fixture = {
  id: string;
  configOverrides?: Record<string, unknown>;
  givenBoard: number[][];
  move: Direction;
  spawnScript: { row: number; col: number; value: 2 | 4 }[];
  expectBoard: number[][];
  scoreDelta: number;
  status: 'Playing' | 'Won' | 'Lost' | 'Won (continue)';
};

function boardToString(board: number[][]): string {
  return board.map((r) => r.join(' ')).join('\n');
}

function boardToGrid(board: number[][]): string {
  return board.map((r) => r.map((v) => String(v).padStart(4, ' ')).join(' ')).join('\n');
}


describe('Acceptance fixtures C01..C25', () => {
  const dir = join(process.cwd(), 'tests', 'acceptance', 'fixtures');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const fx: Fixture = JSON.parse(readFileSync(join(dir, file), 'utf8'));

    it(fx.id, () => {
      const N = fx.givenBoard.length;
      const spawnScript = createArraySpawnScript(fx.spawnScript);
const state = init({ N, initial_spawns: 0, ...fx.configOverrides, spawn_script: spawnScript });
      // Seed board directly for now
      state.board = fx.givenBoard.map((row) => [...row]);
      const beforeSerialized = serialize(state);
      let next: GameState;
      try {
        next = engineMove(state, fx.move);
      } catch (err) {
        if (fx.id === 'C10') {
          // C10 expects engine to reject invalid spawn
          expect(err).toBeInstanceOf(Error);
          return;
        }
        throw err;
      }

      const before = JSON.parse(beforeSerialized) as typeof state;
      const scoreDelta = next.score - before.score;

      // Derive pre-spawn board by executing move with empty spawn script
      const emptySpawnScript: SpawnScript = { nextSpawn: () => null };
      const stateNoSpawn = init({ N, ...fx.configOverrides, spawn_script: emptySpawnScript });
      stateNoSpawn.board = fx.givenBoard.map((row) => [...row]);
      const pre = engineMove(stateNoSpawn, fx.move);

      const changed = boardToString(pre.board) !== boardToString(before.board);
      // Note: spawn consumption is now handled internally by the engine

      const msg = `\nFixture ${fx.id} — ${fx.move}\n` +
        `Score: expected +${fx.scoreDelta}, actual ${before.score} -> ${next.score} (Δ${scoreDelta})\n` +
        `Changed: ${changed}\n` +
        `Before:\n${boardToGrid(before.board)}\n` +
        `After (pre-spawn):\n${boardToGrid(pre.board)}\n` +
        `After (final):\n${boardToGrid(next.board)}\n` +
        `Expected (final):\n${boardToGrid(fx.expectBoard)}\n`;

      expect(next.board, msg).toEqual(fx.expectBoard);
      expect(scoreDelta, msg).toBe(fx.scoreDelta);
      expect(next.status, msg).toBe(fx.status);
    });
  }
});


