import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  init as initializeGame,
  move as applyMove,
  applyMoveNoSpawn,
  can_move,
  type Direction,
  type GameState,
} from '../../engine';
import { makeUISpawnScript } from '../spawn';
import './styles.css';

function useKey(handler: (d: Direction) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction | undefined> = {
        ArrowLeft: 'Left', a: 'Left', A: 'Left', h: 'Left', H: 'Left',
        ArrowRight: 'Right', d: 'Right', D: 'Right', l: 'Right', L: 'Right',
        ArrowUp: 'Up', w: 'Up', W: 'Up', k: 'Up', K: 'Up',
        ArrowDown: 'Down', s: 'Down', S: 'Down', j: 'Down', J: 'Down',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        handler(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler]);
}

function Cell({ value, r, c, moveCount }: { value: number; r: number; c: number; moveCount: number }) {
  const className = value ? `cell tile tile-${value}` : 'cell';
  const animationClass = value ? 'pop' : '';
  
  return (
    <div
      data-testid={`cell-r${r}-c${c}`}
      className={`${className} ${animationClass}`}
    >
      {value || ''}
    </div>
  );
}

export function App() {
  // one SpawnScript per session
  const spawn = useMemo(() => makeUISpawnScript(), []);

  // engine initialization (2 starting tiles)
  const initializeGameState = useCallback(() => {
    return initializeGame({
      N: 4,
      initial_spawns: 2,
      spawn_script: spawn
    });
  }, [spawn]);

  const [state, setState] = useState<GameState>(() => initializeGameState());
  const [moveCount, setMoveCount] = useState(0);
  const [best, setBest] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('2048-best');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Update best score when current score increases
  useEffect(() => {
    if (state.score > best && typeof window !== 'undefined' && window.localStorage) {
      setBest(state.score);
      localStorage.setItem('2048-best', state.score.toString());
    }
  }, [state.score, best]);

  const doNew = () => {
    setState(initializeGameState());
    setMoveCount(0);
  };

  // simple undo/redo using history/future if present
  const doUndo = () =>
    setState((s) =>
      ({ ...s, ...(s.history && s.history.length ? s.history[s.history.length - 1] : s) } as GameState),
    );
  const doRedo = () =>
    setState((s) =>
      ({ ...s, ...(s.future && s.future.length ? s.future[s.future.length - 1] : s) } as GameState),
    );

  const toggleContinue = () => setState((s) => ({ ...s, stop_on_win: !s.stop_on_win }));

  const handleMove = useCallback(
    (dir: Direction) => {
      setState((prev) => {
        if (prev.status === 'Won' && prev.stop_on_win) return prev;

        // simulate without spawn to check if the board would change
        const sim = applyMoveNoSpawn(prev.board, dir);
        if (!sim.changed) return prev;

        // Apply the move with spawn using the engine
        const next = applyMove(prev, dir);
        if (next !== prev) setMoveCount((m) => m + 1);
        return next;
      });
    },
    [],
  );

  useKey(handleMove);

  // Ensure game is initialized on mount (safe redundancy)
  useEffect(() => {
    setState(initializeGameState());
  }, [initializeGameState]);

  const board = state.board;
  const canMove = useMemo(() => can_move(state), [state]);

  // e2e-only hooks (compiled out in production by VITE_E2E)
  useEffect(() => {
    if ((import.meta as any).env.VITE_E2E !== '1') return;

    (window as any).__setBoard = (b: number[][]) => {
      console.log('E2E: __setBoard called with:', b);
      setState((s) => ({ 
        ...s, 
        board: b.map((row) => [...row]),
        score: 0
      }));
    };
    (window as any).__queueSpawn = (list: Array<{ row: number; col: number; value: 2 | 4 }>) => {
      (window as any).__testSpawnQueue = [...(window as any).__testSpawnQueue ?? [], ...list];
    };
    (window as any).__doTurn = (dir: Direction) => {
      handleMove(dir);
    };

    return () => {
      delete (window as any).__setBoard;
      delete (window as any).__queueSpawn;
      delete (window as any).__doTurn;
    };
  }, [handleMove]);

  return (
    <div className="app-wrapper">
      <div className="header">
        <h1 className="title">2048</h1>
        
        <div className="badges">
          <div className="badge">
            <span className="badge-label">Score</span>
            <span className="badge-value">{state.score}</span>
          </div>
          <div className="badge">
            <span className="badge-label">Best</span>
            <span className="badge-value">{best}</span>
          </div>
        </div>

        <div className="controls">
          <button data-testid="btn-new" className="btn" onClick={doNew}>
            New Game
          </button>
          <button data-testid="btn-undo" className="btn btn-secondary" onClick={doUndo}>
            Undo
          </button>
          <button data-testid="btn-redo" className="btn btn-secondary" onClick={doRedo}>
            Redo
          </button>
          <div className="toggle-container">
            <input
              data-testid="toggle-continue"
              type="checkbox"
              checked={!state.stop_on_win}
              onChange={toggleContinue}
            />
            <span>Continue after win</span>
          </div>
        </div>
      </div>

      {/* Hidden accessibility region for tests */}
      <div className="sr-only" aria-live="polite">
        Score: {state.score} | Moves: {moveCount} | Status: {state.status}
      </div>

      {/* Game info for tests */}
      <div
        data-testid="turn"
        data-turn={moveCount}
        className="game-info"
        style={{ display: 'none' }}
      >
        Score: {state.score} | Moves: {moveCount} | Status: {state.status}
      </div>

      <div className="board-container">
        <div className="board-grid">
          {board.map((row, r) => row.map((v, c) => (
            <Cell key={`${r}-${c}-${v}-${moveCount}`} value={v} r={r} c={c} moveCount={moveCount} />
          )))}
        </div>
      </div>

      <div className="helper-text">
        Use arrow keys or swipe to move tiles
      </div>

      {/* Hidden debug info for tests */}
      <div style={{ display: 'none' }}>Can move: {String(canMove)}</div>
    </div>
  );
}
