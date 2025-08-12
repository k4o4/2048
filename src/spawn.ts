import type { SpawnEntry } from '../../engine';

export interface SpawnScript {
  nextSpawn(board: Readonly<number[][]>): SpawnEntry | null;
}

declare global {
  interface Window {
    __testSpawnQueue?: Array<{ row: number; col: number; value: 2 | 4 }>;
  }
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx] ?? null;
}

export function makeUISpawnScript(): SpawnScript {
  if ((import.meta as any).env.VITE_E2E === '1') {
    return {
      nextSpawn: () => {
        const q = (window as any).__testSpawnQueue as Array<{row:number; col:number; value:2|4}> | undefined;
        if (!q || q.length === 0) return null;
        const n = q.shift()!;
        if (!n || n.row == null || n.col == null || (n.value !== 2 && n.value !== 4)) return null;
        return { row: n.row, col: n.col, value: n.value };
      }
    };
  }

  return {
    nextSpawn: (board) => {
      const empties: Array<{row:number; col:number}> = [];
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
          if (board[r][c] === 0) empties.push({ row: r, col: c });
        }
      }
      if (empties.length === 0) return null;
      const pick = empties[Math.floor(Math.random() * empties.length)];
      const value: 2 | 4 = Math.random() < 0.9 ? 2 : 4;
      return { row: pick.row, col: pick.col, value };
    }
  };
}


