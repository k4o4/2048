import type { SpawnEntry, SpawnScript } from '../../engine';

export function createArraySpawnScript(spawns: Array<{ row: number; col: number; value: 2 | 4 }> = []): SpawnScript {
  let index = 0;
  const safeSpawns = Array.isArray(spawns) ? spawns.slice() : [];
  return {
    nextSpawn(board: Readonly<number[][]>): SpawnEntry | null {
      if (index < safeSpawns.length) {
        const s = safeSpawns[index++];
        return { row: s.row, col: s.col, value: s.value };
      }
      // If fixture provided no spawns at all, do not spawn.
      if (safeSpawns.length === 0) return null;
      // deterministic fallback (only when fixture list was non-empty but exhausted): first empty cell row-major, value 2
      for (let r = 0; r < board.length; r++) {
        const row = board[r];
        for (let c = 0; c < row.length; c++) {
          if (row[c] === 0) return { row: r, col: c, value: 2 };
        }
      }
      return null; // no empty cell
    },
  };
}
