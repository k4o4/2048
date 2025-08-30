import { init, type GameState, type SpawnEntry, type SpawnScript } from '../../engine';

export type SpawnMode =
  | { mode: 'none' }
  | { mode: 'array'; spawns: Array<{ row: number; col: number; value: 2 | 4 }> }
  | { mode: 'firstEmpty' };

export interface MakeTestStateOptions {
  N?: number;
  board?: number[][];
  spawn: SpawnMode;
}

function buildSpawnScript(spawnMode: SpawnMode): SpawnScript {
  if (spawnMode.mode === 'none') {
    return { nextSpawn: () => null };
  }

  if (spawnMode.mode === 'array') {
    const entries: SpawnEntry[] = spawnMode.spawns.map((s) => ({ row: s.row, col: s.col, value: s.value }));
    let index = 0;
    return {
      nextSpawn: () => {
        if (index >= entries.length) return null;
        const entry = entries[index];
        index += 1;
        return entry;
      },
    };
  }

  // mode: 'firstEmpty'
  return {
    nextSpawn: (board: Readonly<number[][]>) => {
      for (let r = 0; r < board.length; r++) {
        const row = board[r];
        for (let c = 0; c < row.length; c++) {
          if (row[c] === 0) return { row: r, col: c, value: 2 };
        }
      }
      return null;
    },
  };
}

export function makeTestState(options: MakeTestStateOptions): GameState {
  const inferredN = options.board ? options.board.length : undefined;
  const N = options.N ?? inferredN ?? 4;
  const spawnScript = buildSpawnScript(options.spawn);

  const state = init({ N, initial_spawns: 0, spawn_script: spawnScript });
  if (options.board) {
    state.board = options.board.map((row) => [...row]);
  }
  return state;
}
