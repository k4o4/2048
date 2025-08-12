export type Direction = 'Left' | 'Right' | 'Up' | 'Down';

export interface SpawnEntry { row: number; col: number; value: 2 | 4 }

export interface SpawnScript {
  nextSpawn(board: Readonly<number[][]>): SpawnEntry | null;
}

export interface Config {
  N?: number;
  win_value?: number;
  stop_on_win?: boolean;
  initial_spawns?: 1 | 2;
  spawn_script?: SpawnScript;
}

export interface GameState {
  board: number[][];
  score: number;
  status: 'Playing' | 'Won' | 'Lost' | 'Won (continue)';
  N: number;
  win_value: number;
  stop_on_win: boolean;
  spawn_script: SpawnScript;
  history?: GameState[];
  future?: GameState[];
}

function createEmptyBoard(N: number): number[][] {
  return Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
}

export function init(config: Config = {}): GameState {
  const N = config.N ?? 4;
  const board = createEmptyBoard(N);
  
  // Ensure we have a spawn script
  if (!config.spawn_script) {
    throw new Error('Spawn script is required');
  }
  
  const state: GameState = {
    board,
    score: 0,
    status: 'Playing',
    N,
    win_value: config.win_value ?? 2048,
    stop_on_win: config.stop_on_win ?? true,
    spawn_script: config.spawn_script,
    history: [],
    future: []
  };

  // Spawn initial tiles
  const initialSpawns = config.initial_spawns ?? 2;
  for (let i = 0; i < initialSpawns; i++) {
    const spawnEntry = state.spawn_script.nextSpawn(state.board);
    if (spawnEntry) {
      // Validate the spawn entry
      if (
        spawnEntry.row < 0 || spawnEntry.row >= N ||
        spawnEntry.col < 0 || spawnEntry.col >= N ||
        state.board[spawnEntry.row][spawnEntry.col] !== 0 ||
        (spawnEntry.value !== 2 && spawnEntry.value !== 4)
      ) {
        throw new Error(`Invalid initial spawn entry: ${JSON.stringify(spawnEntry)}; row=${spawnEntry.row}, col=${spawnEntry.col}, value=${spawnEntry.value}, board_size=${N}x${N}, empty=${state.board[spawnEntry.row]?.[spawnEntry.col] === 0}`);
      }
      state.board[spawnEntry.row][spawnEntry.col] = spawnEntry.value;
    }
  }

  return state;
}

export function compressLeft(line: number[]): number[] {
  const nonZero = line.filter((v) => v !== 0);
  const zeros = line.length - nonZero.length;
  return nonZero.concat(Array.from({ length: zeros }, () => 0));
}

export function mergeLeft(line: number[], winValueForHit?: number): { line: number[]; scoreDelta: number; hitWin: boolean } {
  const N = line.length;
  const res = [...line];
  let score = 0;
  let hitWin = false;
  for (let i = 0; i < N - 1; i++) {
    if (res[i] !== 0 && res[i] === res[i + 1]) {
      res[i] = res[i] + res[i + 1];
      score += res[i];
      if (winValueForHit !== undefined && res[i] >= winValueForHit) {
        hitWin = true;
      }
      res[i + 1] = 0;
      i++; // skip next to enforce single-merge per tile
    }
  }
  return { line: res, scoreDelta: score, hitWin };
}

function getRow(board: number[][], r: number): number[] {
  return [...board[r]];
}

function setRow(board: number[][], r: number, line: number[]): void {
  for (let c = 0; c < line.length; c++) board[r][c] = line[c];
}

function getCol(board: number[][], c: number): number[] {
  const N = board.length;
  const out: number[] = new Array(N);
  for (let r = 0; r < N; r++) out[r] = board[r][c];
  return out;
}

function setCol(board: number[][], c: number, line: number[]): void {
  for (let r = 0; r < line.length; r++) board[r][c] = line[r];
}

function boardsEqual(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function cloneBoard(b: number[][]): number[][] {
  return b.map((r) => [...r]);
}

function hasEmpty(board: number[][]): boolean {
  for (const row of board) for (const v of row) if (v === 0) return true;
  return false;
}

function anyMergePossible(board: number[][]): boolean {
  const N = board.length;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      if (r + 1 < N && board[r + 1][c] === v) return true;
      if (c + 1 < N && board[r][c + 1] === v) return true;
    }
  }
  return false;
}

export function applyMoveNoSpawn(board: number[][], direction: Direction): { board: number[][]; changed: boolean } {
  const N = board.length;
  const outBoard = cloneBoard(board);
  if (direction === 'Left' || direction === 'Right') {
    for (let r = 0; r < N; r++) {
      let line = getRow(board, r);
      if (direction === 'Right') line = [...line].reverse();
      const c1 = compressLeft(line);
      const m = mergeLeft(c1);
      const c2 = compressLeft(m.line);
      const outLine = direction === 'Right' ? [...c2].reverse() : c2;
      setRow(outBoard, r, outLine);
    }
  } else {
    for (let c = 0; c < N; c++) {
      let line = getCol(board, c);
      if (direction === 'Down') line = [...line].reverse();
      const c1 = compressLeft(line);
      const m = mergeLeft(c1);
      const c2 = compressLeft(m.line);
      const outLine = direction === 'Down' ? [...c2].reverse() : c2;
      setCol(outBoard, c, outLine);
    }
  }
  return { board: outBoard, changed: !boardsEqual(board, outBoard) };
}

export function move(state: GameState, direction: Direction): GameState {
  if (state.status === 'Won' && state.stop_on_win) return state;
  if (state.status === 'Lost') return state;

  const N = state.N;
  const outBoard = cloneBoard(state.board);
  let scoreDelta = 0;
  let hitWin = false;

  if (direction === 'Left' || direction === 'Right') {
    for (let r = 0; r < N; r++) {
      let line = getRow(state.board, r);
      if (direction === 'Right') line = [...line].reverse();
      const compressed = compressLeft(line);
      const merged = mergeLeft(compressed, state.win_value);
      const finalLine = compressLeft(merged.line);
      const outLine = direction === 'Right' ? [...finalLine].reverse() : finalLine;
      setRow(outBoard, r, outLine);
      scoreDelta += merged.scoreDelta;
      if (merged.hitWin) hitWin = true;
    }
  } else {
    for (let c = 0; c < N; c++) {
      let line = getCol(state.board, c);
      if (direction === 'Down') line = [...line].reverse();
      const compressed = compressLeft(line);
      const merged = mergeLeft(compressed, state.win_value);
      const finalLine = compressLeft(merged.line);
      const outLine = direction === 'Down' ? [...finalLine].reverse() : finalLine;
      setCol(outBoard, c, outLine);
      scoreDelta += merged.scoreDelta;
      if (merged.hitWin) hitWin = true;
    }
  }

  const changed = !boardsEqual(state.board, outBoard);
  const next: GameState = {
    ...state,
    board: outBoard,
    score: state.score + (changed ? scoreDelta : 0)
  };

  // If no-op, check lose condition and return early
  if (!changed) {
    const noMoves = !hasEmpty(state.board) && !anyMergePossible(state.board);
    if (noMoves) {
      return { ...state, status: 'Lost' };
    }
    return state;
  }

  // Win detection before spawn
  const hitWinNow = changed && hitWin;
  if (hitWinNow) {
    if (next.stop_on_win) {
      next.status = 'Won';
      return next; // stop before spawn
    } else {
      next.status = 'Won (continue)';
    }
  }

  if (changed) {
    // push pre-move state to history and clear future
    if (next.history) {
      const prevCopy: GameState = {
        ...state,
        board: cloneBoard(state.board),
        history: [...(state.history ?? [])],
        future: [...(state.future ?? [])]
      };
      next.history = [...(state.history ?? []), prevCopy];
      next.future = [];
    }
    
    // Spawn exactly one tile using script if provided
    if (next.spawn_script) {
      const spawnEntry = next.spawn_script.nextSpawn(next.board);
      if (spawnEntry) {
        // Enhanced validation with detailed error messages
        if (
          spawnEntry.row < 0 || spawnEntry.row >= N ||
          spawnEntry.col < 0 || spawnEntry.col >= N ||
          next.board[spawnEntry.row][spawnEntry.col] !== 0 ||
          (spawnEntry.value !== 2 && spawnEntry.value !== 4)
        ) {
          throw new Error(`Invalid spawn entry from script: ${JSON.stringify(spawnEntry)}; row=${spawnEntry.row}, col=${spawnEntry.col}, value=${spawnEntry.value}, board_size=${N}x${N}, empty=${next.board[spawnEntry.row]?.[spawnEntry.col] === 0}`);
        }
        next.board = cloneBoard(next.board);
        next.board[spawnEntry.row][spawnEntry.col] = spawnEntry.value;
      }
    } else {
      // No RNG fallback in this scaffold; tests should supply script
    }
  }
  // Special case: some specs want spawns for non-left/right columns strictly; our engine already spawns above.

  // Lose detection only after a state-changing move
  if (changed) {
    if (!hasEmpty(next.board) && !anyMergePossible(next.board)) {
      next.status = next.status.startsWith('Won') ? next.status : 'Lost';
    } else {
      if (next.status !== 'Won (continue)') next.status = 'Playing';
    }
  }

  return next;
}

export function legal_moves(state: GameState): Set<Direction> {
  const dirs: Direction[] = ['Left', 'Right', 'Up', 'Down'];
  return new Set(
    dirs.filter((d) => applyMoveNoSpawn(state.board, d).changed)
  );
}

export function can_move(state: GameState): boolean {
  return legal_moves(state).size > 0;
}

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(json: string): GameState {
  const obj = JSON.parse(json);
  return obj as GameState;
}

export function undo(state: GameState): GameState {
  if (!state.history || state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  const curCopy: GameState = { ...state, board: cloneBoard(state.board) };
  const newHist = state.history.slice(0, -1);
  const newFuture = [...(state.future ?? []), curCopy];
  return { ...prev, history: newHist, future: newFuture };
}

export function redo(state: GameState): GameState {
  if (!state.future || state.future.length === 0) return state;
  const next = state.future[state.future.length - 1];
  const curCopy: GameState = { ...state, board: cloneBoard(state.board) };
  const newFuture = state.future.slice(0, -1);
  const newHist = [...(state.history ?? []), curCopy];
  return { ...next, history: newHist, future: newFuture };
}



