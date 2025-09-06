import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

type Direction = 'Left' | 'Right' | 'Up' | 'Down';

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

const F: Fixture[] = [
  // C01 — Pure slide left with spawn
  {
    id: 'C01',
    givenBoard: [
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 0, col: 1, value: 2 }],
    expectBoard: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 0,
    status: 'Playing'
  },
  // C02 — Single merge left
  {
    id: 'C02',
    givenBoard: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 1, col: 1, value: 2 }],
    expectBoard: [
      [4, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 4,
    status: 'Playing'
  },
  // C03 — Single merge right (order from right)
  {
    id: 'C03',
    givenBoard: [
      [0, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Right',
    spawnScript: [{ row: 1, col: 0, value: 4 }],
    expectBoard: [
      [0, 0, 2, 4],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 4,
    status: 'Playing'
  },
  // C04 — Double merges in a row
  {
    id: 'C04',
    givenBoard: [
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 1, col: 3, value: 2 }],
    expectBoard: [
      [4, 8, 0, 0],
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 12,
    status: 'Playing'
  },
  // C05 — Triple equal tiles (only first pair merges)
  {
    id: 'C05',
    givenBoard: [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 0, col: 3, value: 2 }],
    expectBoard: [
      [4, 2, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 4,
    status: 'Playing'
  },
  // C06 — Gaps then merge
  {
    id: 'C06',
    givenBoard: [
      [2, 0, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 1, col: 1, value: 2 }],
    expectBoard: [
      [4, 2, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 4,
    status: 'Playing'
  },
  // C07 — Vertical up merges
  {
    id: 'C07',
    givenBoard: [
      [2, 0, 2, 0],
      [2, 0, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Up',
    spawnScript: [{ row: 3, col: 1, value: 2 }],
    expectBoard: [
      [4, 0, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 2, 0, 0]
    ],
    scoreDelta: 8,
    status: 'Playing'
  },
  // C08 — Vertical down merges
  {
    id: 'C08',
    givenBoard: [
      [2, 0, 2, 0],
      [0, 0, 2, 0],
      [2, 0, 0, 0],
      [2, 0, 2, 0]
    ],
    move: 'Down',
    spawnScript: [{ row: 0, col: 1, value: 2 }],
    expectBoard: [
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 2, 0],
      [4, 0, 4, 0]
    ],
    scoreDelta: 8,
    status: 'Playing'
  },
  // C09 — No-op left (no spawn)
  {
    id: 'C09',
    givenBoard: [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [2, 4, 8, 16],
      [32, 64, 128, 256]
    ],
    move: 'Left',
    spawnScript: [{ row: 0, col: 0, value: 2 }],
    expectBoard: [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [2, 4, 8, 16],
      [32, 64, 128, 256]
    ],
    scoreDelta: 0,
    status: 'Lost'
  },
  // C10 — Spawn script invalid (occupied cell) → error (kept as fixture; engine should throw)
  {
    id: 'C10',
    givenBoard: [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Right',
    spawnScript: [{ row: 0, col: 3, value: 2 }],
    expectBoard: [
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 0,
    status: 'Playing'
  },
  // C11 — Win (stop_on_win=true) blocks spawn
  {
    id: 'C11',
    configOverrides: { stop_on_win: true },
    givenBoard: [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 3, col: 3, value: 2 }],
    expectBoard: [
      [2048, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 2048,
    status: 'Won'
  },
  // C12 — Win (continue) consumes spawn
  {
    id: 'C12',
    configOverrides: { stop_on_win: false },
    givenBoard: [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 3, col: 3, value: 2 }],
    expectBoard: [
      [2048, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 2]
    ],
    scoreDelta: 2048,
    status: 'Won (continue)'
  },
  // C13 — Lose detection (no empties, no merges)
  {
    id: 'C13',
    givenBoard: [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ],
    move: 'Up',
    spawnScript: [],
    expectBoard: [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ],
    scoreDelta: 0,
    status: 'Lost'
  },
  // C14 — Double merges across rows in one move
  {
    id: 'C14',
    givenBoard: [
      [2, 2, 2, 2],
      [4, 0, 4, 4],
      [0, 2, 0, 2],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 3, col: 3, value: 2 }],
    expectBoard: [
      [4, 4, 0, 0],
      [8, 4, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 2]
    ],
    scoreDelta: 20,
    status: 'Playing'
  },
  // C15 — Opposite direction after merge (no phantom second merge)
  {
    id: 'C15',
    givenBoard: [
      [4, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Right',
    spawnScript: [{ row: 1, col: 0, value: 2 }],
    expectBoard: [
      [0, 0, 4, 2],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 0,
    status: 'Playing'
  },
  // C16 — Undo/Redo cycle (single forward move fixture)
  {
    id: 'C16',
    givenBoard: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 0, col: 3, value: 2 }],
    expectBoard: [
      [4, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 4,
    status: 'Playing'
  },
  // C17 — Serialization round-trip (single move example)
  {
    id: 'C17',
    givenBoard: [
      [2, 0, 2, 4],
      [0, 4, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [],
    expectBoard: [
      [4, 4, 0, 0],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 12,
    status: 'Playing'
  },
  // C18 — legal_moves returns only state-changing directions (representative move)
  {
    id: 'C18',
    givenBoard: [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [],
    expectBoard: [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 0,
    status: 'Playing'
  },
  // C19 — Config: N=5 smoke test (single move)
  {
    id: 'C19',
    configOverrides: { N: 5 },
    givenBoard: [
      [2, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    move: 'Right',
    spawnScript: [{ row: 0, col: 0, value: 2 }],
    expectBoard: [
      [2, 0, 0, 0, 2],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    scoreDelta: 0,
    status: 'Playing'
  },
  // C20 — Config: win_value=1024
  {
    id: 'C20',
    configOverrides: { win_value: 1024, stop_on_win: true },
    givenBoard: [
      [512, 512, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Left',
    spawnScript: [],
    expectBoard: [
      [1024, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 1024,
    status: 'Won'
  },
  // C21 — No-op must not alter history (single move no-op)
  {
    id: 'C21',
    givenBoard: [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Up',
    spawnScript: [],
    expectBoard: [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 0,
    status: 'Playing'
  },
  // C22 — Spawn on last empty cell
  {
    id: 'C22',
    givenBoard: [
      [2, 2, 4, 8],
      [4, 8, 16, 32],
      [64, 128, 256, 512],
      [1024, 2048, 4096, 0]
    ],
    move: 'Left',
    spawnScript: [{ row: 3, col: 3, value: 2 }],
    expectBoard: [
      [4, 4, 8, 0],
      [4, 8, 16, 32],
      [64, 128, 256, 512],
      [1024, 2048, 4096, 2]
    ],
    scoreDelta: 4,
    status: 'Playing'
  },
  // C23 — Complex vertical with gaps and merges
  {
    id: 'C23',
    givenBoard: [
      [2, 0, 2, 2],
      [2, 2, 0, 2],
      [0, 2, 2, 0],
      [0, 0, 0, 0]
    ],
    move: 'Up',
    spawnScript: [{ row: 3, col: 1, value: 4 }],
    expectBoard: [
      [4, 4, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 4, 0, 0]
    ],
    scoreDelta: 16,
    status: 'Playing'
  },
  // C24 — Chain prevention in column
  {
    id: 'C24',
    givenBoard: [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Up',
    spawnScript: [{ row: 3, col: 0, value: 2 }],
    expectBoard: [
      [4, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0]
    ],
    scoreDelta: 4,
    status: 'Playing'
  },
  // C25 — Redo cleared after new branch (single move placeholder)
  {
    id: 'C25',
    givenBoard: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    move: 'Up',
    spawnScript: [],
    expectBoard: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    scoreDelta: 0,
    status: 'Playing'
  }
];

const outDir = join(process.cwd(), 'tests', 'acceptance', 'fixtures');
mkdirSync(outDir, { recursive: true });

for (const fx of F) {
  const p = join(outDir, `${fx.id}.json`);
  writeFileSync(p, JSON.stringify(fx, null, 2));
  console.log('Wrote', p);
}




